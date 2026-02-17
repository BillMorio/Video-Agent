import { Scene, AgentResult, BaseAgent, ProjectContext } from "./types";
import { anthropic } from "../anthropic";
import { MOTION_GRAPHIC_AGENT_TOOLS } from "./tools/motion-graphic-agent-definitions";
import { memoryService } from "../services/api/memory-service";
import { sceneService } from "../services/api/scene-service";
import { jobService } from "../services/api/job-service";
// Import real production tools
import * as googleTools from "./tools/production/google-tools";
import * as arollTools from "./tools/production/aroll-tools";

export class MotionGraphicAgent implements BaseAgent {
  name = "Motion Graphics Agent";
  role = "Orchestrates high-fidelity motion graphics and cinematic temporal synthesis using Google Veo 3.1.";

  private TOOL_LOG_MAPPING: Record<string, string> = {
    'generate_google_video': 'Synthesizing professional motion graphics via Google Veo 3.1',
    'cut_audio_segment': 'Extracting scene audio for temporal alignment',
    'composite_ffmpeg_layer': 'Executing final video compositing and layer baking',
  };

  private getAnthropicTools() {
    return (MOTION_GRAPHIC_AGENT_TOOLS as any[]).map(t => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters as any
    }));
  }

  async process(scene: Scene, context: ProjectContext): Promise<AgentResult> {
    const projectId = scene.project_id;
    console.log(`[${this.name}] Starting Production Chain for scene ${scene.index} using Google AI`);

    try {
      // 1. Initial State Sync
      await sceneService.update(scene.id, { status: 'processing' });
      await memoryService.update(projectId, { 
        active_agents: [this.name],
        current_scene_id: scene.id,
        last_log: `${this.name}: Starting production for Scene ${scene.index}.`
      });

      const systemPrompt = `You are the ${this.name}. ${this.role}
          
      SCENE CONTEXT:
      - Script: "${scene.script}"
      - Duration: ${scene.duration}s
      - Start Time: ${scene.start_time}s
      
      PRODUCTION WORKFLOW (Reason-Act):
      1. VIDEO GENERATION: Use 'generate_google_video' to create the core motion graphic using Google Veo 3.1.
      2. AUDIO ALIGNMENT: Use 'cut_audio_segment' to prepare the narration for this scene.
      3. COMPOSITING: (Optional) Use 'composite_ffmpeg_layer' if additional overlays are needed.
      4. Respond with final confirmation text when the production asset is finalized.`;

      // 2. Initialize Conversation History
      const messages: any[] = [
        { 
          role: "user", 
          content: "Please execute the motion graphic production sequence for this scene." 
        }
      ];

      let isRunning = true;
      let turnCount = 0;
      const MAX_TURNS = 10;
      let finalAgentResponse = "Motion production complete.";

      while (isRunning && turnCount < MAX_TURNS) {
        turnCount++;
        
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: systemPrompt,
          messages: messages,
          tools: this.getAnthropicTools(),
        });

        // Push assistant response
        messages.push({
          role: "assistant",
          content: response.content
        });

        const toolCalls = response.content.filter(c => c.type === 'tool_use');

        if (toolCalls && toolCalls.length > 0) {
          console.log(`[${this.name}] Round ${turnCount}: Executing ${toolCalls.length} tool(s)...`);
          const toolResults: any[] = [];

          for (const toolCall of toolCalls) {
            const toolName = toolCall.name;
            const args = toolCall.input as any;
            const toolId = toolCall.id;
            
            const job = await jobService.create({
              scene_id: scene.id,
              provider: `${this.name} (${toolName})`,
              external_id: toolId,
              status: 'processing',
              result: { tool: toolName, args }
            });

            const logAction = this.TOOL_LOG_MAPPING[toolName] || `Executing ${toolName}`;
            await memoryService.update(projectId, { last_log: `${this.name}: ${logAction}...` });

            let toolResult: any;
            try {
              if (toolName === 'generate_google_video') {
                toolResult = await googleTools.generate_google_video(args);
                if (toolResult.status === 'success') {
                  await sceneService.update(scene.id, { 
                    asset_url: toolResult.videoUrl,
                    final_video_url: toolResult.videoUrl 
                  });
                }
              } else if (toolName === 'cut_audio_segment') {
                toolResult = await arollTools.cut_audio_segment({
                  audioUrl: args.audioUrl || context.master_audio_url || "",
                  start: args.start || scene.start_time.toString(),
                  duration: args.duration || scene.duration
                });
              } else if (toolName === 'composite_ffmpeg_layer') {
                // For now, this tool is still a partial simulation or simple wrapper
                toolResult = { status: 'success', message: 'Compositing simulated as complete with base layer.' };
              } else {
                toolResult = { status: "failed", error: `Tool ${toolName} not found.` };
              }
            } catch (err: any) {
              console.error(`[${this.name}] Tool Error (${toolName}):`, err);
              toolResult = { status: "failed", error: err.message };
            }

            await jobService.update(job.id, { 
              status: toolResult.status === 'failed' ? 'failed' : 'completed',
              result: { ...job.result, ...toolResult, completed_at: new Date().toISOString() }
            });

            toolResults.push({
              type: "tool_result",
              tool_use_id: toolId,
              content: JSON.stringify(toolResult),
            });
          }

          messages.push({
            role: "user",
            content: toolResults
          });
        } else {
          const textBlock = response.content.find(c => c.type === 'text');
          finalAgentResponse = (textBlock as any)?.text || finalAgentResponse;
          isRunning = false;
        }
      }

      // 3. Finalize
      await sceneService.update(scene.id, { status: 'completed' });
      const currentMemory = await memoryService.getByProjectId(projectId);
      await memoryService.update(projectId, { 
        completed_count: (currentMemory.completed_count || 0) + 1,
        active_agents: [],
        current_scene_id: undefined,
        last_log: `${this.name}: Scene ${scene.index} motion production complete.`
      });

      return { 
        success: true, 
        message: finalAgentResponse, 
        log: `Completed in ${turnCount} turns.`
      };
    } catch (error) {
      console.error(`[${this.name}] FAILURE:`, error);
      await sceneService.update(scene.id, { status: 'failed' });
      const currentMemory = await memoryService.getByProjectId(projectId);
      await memoryService.update(projectId, { 
        failed_count: (currentMemory.failed_count || 0) + 1,
        active_agents: [],
        current_scene_id: undefined,
        workflow_status: 'paused',
        last_log: `ERROR in ${this.name} during Scene ${scene.index}.`
      });
      return { success: false, message: `Failed in ${this.name}`, log: String(error) };
    }
  }
}
