import { Scene, AgentResult, BaseAgent, ProjectContext } from "./types";
import { anthropic } from "../anthropic";
import { IMAGE_AGENT_TOOLS } from "./tools/image-agent-definitions";
import { memoryService } from "../services/api/memory-service";
import { sceneService } from "../services/api/scene-service";
import { jobService } from "../services/api/job-service";
// Import real production tools
import * as imageTools from "./tools/production/image-tools";
import * as arollTools from "./tools/production/aroll-tools";

export class ImageAgent implements BaseAgent {
  name = "Image Agent";
  role = "Orchestrates background graphics, Wavespeed image generations, and Ken Burns cinematic video synthesis.";

  private TOOL_LOG_MAPPING: Record<string, string> = {
    'generate_visual_prompt': 'Synthesizing high-fidelity visual context for prompt engineering',
    'generate_wavespeed_image': 'Generating technical imagery via Wavespeed Nano-Banana',
    'cut_audio_segment': 'Extracting narration segment for scene',
    'generate_ken_burns_video': 'Applying cinematic Ken Burns temporal synthesis',
  };

  private getAnthropicTools() {
    return (IMAGE_AGENT_TOOLS as any[]).map(t => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters as any
    }));
  }

  async process(scene: Scene, context: ProjectContext): Promise<AgentResult> {
    const projectId = scene.project_id;
    console.log(`[${this.name}] Starting Production Chain for scene ${scene.index} using Claude Sonnet 3.5`);

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
      - Start: ${scene.start_time}s
      - Visual Style: Techy, Premium, High-fidelity, Cinematic
      - Master Audio: ${context.master_audio_url || "NONE"}
      
      PRODUCTION WORKFLOW (Reason-Act):
      1. OPTIMIZATION: Use 'generate_visual_prompt' to create a clear, detailed SDXL-style prompt congruent with the narrative.
      2. GENERATION: Use 'generate_wavespeed_image' with that prompt to create the static visual asset.
      3. AUDIO PREP: Use 'cut_audio_segment' to extract the narration for this specific section (${scene.start_time} to ${scene.end_time}).
      4. TEMPORAL SYNTHESIS: Use 'generate_ken_burns_video' to combine the image and audio into a zooming cinematic video.
      5. COMPLETION: Respond with final confirmation when the video is ready.
      
      CRITICAL: You must execute these logically. Do not attempt temporal synthesis before you have both the image and the audio segment.`;

      // 2. Initialize Conversation History
      const messages: any[] = [
        { 
          role: "user", 
          content: "Please execute the image-to-video production sequence for this scene." 
        }
      ];

      let isRunning = true;
      let turnCount = 0;
      const MAX_TURNS = 10;
      let finalAgentResponse = "Image production complete.";

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
              if (toolName === 'generate_visual_prompt') {
                toolResult = await imageTools.generate_visual_prompt({
                  ...args,
                  customSystemPrompt: context.memory.metadata?.config?.image_gen_prompt_engineer_prompt,
                  anthropicApiKey: context.memory.metadata?.config?.api_keys?.ANTHROPIC_API
                });
              } else if (toolName === 'generate_wavespeed_image') {
                toolResult = await imageTools.generate_wavespeed_image({
                  ...args,
                  apiKey: context.memory.metadata?.config?.api_keys?.WAVESPEED_API_KEY
                });
                if (toolResult.status === 'success') {
                  // Save assets as they come in
                  await sceneService.update(scene.id, { 
                    asset_url: toolResult.imageUrl,
                    thumbnail_url: toolResult.imageUrl 
                  });
                }
              } else if (toolName === 'cut_audio_segment') {
                toolResult = await arollTools.cut_audio_segment({
                  audioUrl: args.audioUrl || context.master_audio_url || "",
                  start: args.start || scene.start_time.toString(),
                  duration: args.duration || scene.duration
                });
              } else if (toolName === 'generate_ken_burns_video') {
                toolResult = await imageTools.generate_ken_burns_video(args);
                if (toolResult.status === 'success') {
                  await sceneService.update(scene.id, { 
                    final_video_url: toolResult.videoUrl 
                  });
                }
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
        last_log: `${this.name}: Scene ${scene.index} production complete.`
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
