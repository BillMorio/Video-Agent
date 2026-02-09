import { Scene, AgentResult, BaseAgent, ProjectContext } from "./types";
import { anthropic } from "../anthropic";
import { A_ROLL_AGENT_TOOLS } from "./tools/a-roll-agent-definitions";
import { memoryService } from "../services/api/memory-service";
import { sceneService } from "../services/api/scene-service";
import { jobService } from "../services/api/job-service";
// Import real production tools
import * as arollTools from "./tools/production/aroll-tools";

export class ARollAgent implements BaseAgent {
  name = "A-Roll Agent";
  role = "Responsible for the primary 'talking-head' video segment. Requires trimming audio first, then generating a lip-synced avatar.";

  private TOOL_LOG_MAPPING: Record<string, string> = {
    'cut_audio_segment': 'Extracting narration segment and uploading to clinical storage',
    'generate_heygen_avatar_video': 'Generating and Polling Heygen AI synthesis'
  };

  private getAnthropicTools() {
    return A_ROLL_AGENT_TOOLS.map(t => ({
      name: (t as any).function.name,
      description: (t as any).function.description,
      input_schema: (t as any).function.parameters as any
    }));
  }

  async process(scene: Scene, context: ProjectContext): Promise<AgentResult> {
    const projectId = scene.project_id;
    console.log(`[${this.name}] Starting Production Chain for scene ${scene.index}`);

    try {
      // 1. Initial State Sync
      await sceneService.update(scene.id, { status: 'processing' });
      await memoryService.update(projectId, { 
        active_agents: [this.name],
        current_scene_id: scene.id,
        last_log: `${this.name}: Starting production for Scene ${scene.index}.`
      });

      const systemPrompt = `You are the ${this.name}. ${this.role}
          
          AVATAR_ID: "75fb83b62014421a88be427fbe3bf2f3"

          SCENE CONTEXT:
          - Start Time: ${scene.start_time}s
          - End Time: ${scene.end_time}s
          - Duration: ${scene.duration}s
          - Scale (Framing): ${scene.scale || 1.0}
          - Script: "${scene.script}"
          - Master Audio: ${context.master_audio_url || "NOT_PROVIDED"}

          PRODUCTION WORKFLOW (Reason-Act-Feedback):
          1. You operate in a loop. Execute tools sequentially to achieve the goal.
          2. STEP 1: Use 'cut_audio_segment' to extract the audio for this scene from the master audio.
             - Use Start Time: ${scene.start_time}, Duration: ${scene.duration}.
          3. STEP 2: Use 'generate_heygen_avatar_video' using the Supabase URL returned from Step 1.
             - Use the AVATAR_ID provided above.
             - Use Scale: ${scene.scale || 1.0}.
             - THIS TOOL WILL WAIT FOR THE VIDEO TO BE READY. Do not call any other tools for this video.
          4. FINISH: Once Step 2 returns 'success', respond with a final confirmation.
          
          CRITICAL: Do not respond with a final summary until you have the final video URL from Step 2.`;

      // 2. Initialize Conversation History
      const messages: any[] = [
        { 
          role: "user", 
          content: "Please begin the A-Roll production sequence for this scene." 
        }
      ];

      let isRunning = true;
      let turnCount = 0;
      const MAX_TURNS = 10;
      let finalAgentResponse = "A-Roll production complete.";

      // 3. THE MULTI-TURN AGENTIC LOOP
      while (isRunning && turnCount < MAX_TURNS) {
        turnCount++;
        
        console.log(`[${this.name}] Round ${turnCount}: Requesting decision from Claude...`);

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: systemPrompt,
          messages: messages,
          tools: this.getAnthropicTools(),
        });

        // Add assistant's response to history
        messages.push({
          role: "assistant",
          content: response.content
        });

        const toolCalls = response.content.filter(c => c.type === 'tool_use');

        if (toolCalls && toolCalls.length > 0) {
          console.log(`[${this.name}] Round ${turnCount}: Processing ${toolCalls.length} tool calls...`);
          
          const toolResults: any[] = [];

          for (const toolCall of toolCalls) {
            const toolName = toolCall.name;
            const args = toolCall.input as any;
            const toolId = toolCall.id;
            
            // Create Job for tracking
            const job = await jobService.create({
              scene_id: scene.id,
              provider: `${this.name} (${toolName})`,
              external_id: toolId,
              status: 'processing',
              result: { tool: toolName, args }
            });

            const logAction = this.TOOL_LOG_MAPPING[toolName] || `Executing ${toolName}`;
            await memoryService.update(projectId, { last_log: `${this.name}: ${logAction}...` });

            // EXPLICIT TOOL EXECUTION
            let toolResult: any;
            try {
              if (toolName === 'cut_audio_segment') {
                toolResult = await arollTools.cut_audio_segment({
                  ...args,
                  audioUrl: args.audioUrl || context.master_audio_url || ""
                });
              } else if (toolName === 'generate_heygen_avatar_video') {
                toolResult = await arollTools.generate_heygen_avatar_video(args);
                
                if (toolResult.status === 'success') {
                  const updatedScene = await sceneService.update(scene.id, {
                    asset_url: toolResult.videoUrl,
                    final_video_url: toolResult.videoUrl,
                    payload: { ...scene.payload, ...toolResult }
                  });
                  Object.assign(scene, updatedScene);
                }
              } else if (toolName === 'poll_heygen_video_status') {
                toolResult = await arollTools.poll_heygen_video_status(args);
                
                if (toolResult.status === 'success') {
                  const updatedScene = await sceneService.update(scene.id, {
                    asset_url: toolResult.videoUrl,
                    final_video_url: toolResult.videoUrl,
                    payload: { ...scene.payload, ...toolResult }
                  });
                  Object.assign(scene, updatedScene);
                }
              } else {
                toolResult = { status: "failed", error: `Tool ${toolName} not found.` };
              }
            } catch (err: any) {
              toolResult = { status: "failed", error: err.message };
            }

            // Update Job with result
            await jobService.update(job.id, { 
              status: toolResult.status === 'failed' ? 'failed' : 'completed',
              result: { ...job.result, ...toolResult, completed_at: new Date().toISOString() }
            });

            toolResults.push({
              type: "tool_result",
              tool_use_id: toolId,
              content: JSON.stringify(toolResult),
            });

            if (toolResult.status === "failed") {
              console.error(`[${this.name}] Tool ${toolName} failed logistically.`);
            }
          }

          // Add tool results to messages
          messages.push({
            role: "user",
            content: toolResults
          });
        } 
        else {
          console.log(`[${this.name}] Intermediate or Final response received from Claude.`);
          const textBlock = response.content.find(c => c.type === 'text');
          finalAgentResponse = textBlock?.text || finalAgentResponse;

          // PERSISTENCE CHECK: If we started generation but haven't finished, enforce another turn
          const hasInitiated = messages.some(m => m.role === 'assistant' && Array.isArray(m.content) && m.content.some((c: any) => c.tool_use?.name === 'generate_heygen_avatar_video' || (c.type === 'tool_use' && c.name === 'generate_heygen_avatar_video')));
          const hasFinished = !!scene.final_video_url;

          if (hasInitiated && !hasFinished) {
            console.log(`[${this.name}] PERSISTENCE: Claude tried to finish without success result. Enforcing turn.`);
            messages.push({
              role: "user",
              content: "You have initiated generation but haven't retrieved the final video. Ensure you have called 'generate_heygen_avatar_video' and it returned success."
            });
          } else {
            isRunning = false; 
          }
        }
      }

      // 4. Finalize Scene Level Progress
      await sceneService.update(scene.id, { 
        status: 'completed',
        asset_url: scene.asset_url,
        thumbnail_url: scene.thumbnail_url,
        final_video_url: scene.final_video_url,
        payload: scene.payload
      });
      const currentMemory = await memoryService.getByProjectId(projectId);
      await memoryService.update(projectId, { 
        completed_count: (currentMemory.completed_count || 0) + 1,
        active_agents: [],
        current_scene_id: undefined,
        last_log: `${this.name}: Scene ${scene.index} production finalized.`
      });

      return { 
        success: true, 
        message: finalAgentResponse, 
        log: `Completed in ${turnCount} turns using Claude Sonnet 4.`
      };

    } catch (error) {
      console.error(`[${this.name}] PRODUCTION FAILURE:`, error);
      await sceneService.update(scene.id, { status: 'failed' });
      await memoryService.update(projectId, { 
        failed_count: (context.memory.failed_count || 0) + 1,
        active_agents: [],
        workflow_status: 'paused',
        last_log: `CRITICAL ERROR in ${this.name} during Scene ${scene.index}.`
      });

      return { success: false, message: `Failed in ${this.name}`, log: String(error), error: String(error) };
    }
  }
}
