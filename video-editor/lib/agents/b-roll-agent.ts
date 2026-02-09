import { Scene, AgentResult, BaseAgent, ProjectContext } from "./types";
import { anthropic } from "../anthropic";
import { BROLL_AGENT_TOOLS } from "./tools/b-roll-agent-definitions";
import { memoryService } from "../services/api/memory-service";
import { sceneService } from "../services/api/scene-service";
import { jobService } from "../services/api/job-service";
// Import real production tools
import * as brollTools from "./tools/production/broll-tools";
import * as audioTools from "./tools/production/audio-tools";

export class BRollAgent implements BaseAgent {
  name = "B-Roll Agent";
  role = "Specializes in acquiring stock footage and overlaying it on top of the A-Roll timeline.";

  private TOOL_LOG_MAPPING: Record<string, string> = {
    'search_pexels_library': 'Searching for relevant stock footage on Pexels',
    'fit_stock_footage_to_duration': 'Conforming stock footage to scene duration',
    'trim_stock_footage': 'Surgically trimming stock footage segment',
    'trim_master_audio': 'Extracting narration segment for scene',
    'merge_audio_video': 'Muxing visuals with narration'
  };

  // Helper to map OpenAI tool definitions to Anthropic tool definitions
  private getAnthropicTools() {
    return BROLL_AGENT_TOOLS.map(t => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters as any
    }));
  }

  async process(scene: Scene, context: ProjectContext): Promise<AgentResult> {
    const projectId = scene.project_id;
    console.log(`[${this.name}] Starting Production Chain for scene ${scene.index} using Claude Sonnet 4`);

    try {
      // 1. Register Start
      await sceneService.update(scene.id, { status: 'processing' });
      await memoryService.update(projectId, { 
        active_agents: [this.name],
        current_scene_id: scene.id,
        last_log: `${this.name}: Starting production for Scene ${scene.index}.`
      });

      const systemPrompt = `You are the ${this.name}. ${this.role}
          
      SCENE CONTEXT:
      - Index: ${scene.index}
      - Start Time: ${scene.start_time}s
      - End Time: ${scene.end_time}s
      - Target Duration: ${scene.duration}s
      - Script: "${scene.script}"
      - Director Notes: "${scene.director_notes || "None"}"
      - Persistent State: ${JSON.stringify(scene.agent_state || {})}

      PRODUCTION WORKFLOW (Acquisition -> Trimming -> Conforming -> Audio Merge):
      1. Discovery: Use 'search_pexels_library' to find the best visual match.
      2. Narrative Base: Use 'trim_master_audio' to extract the EXACT narration segment for this scene from the master audio: ${context.master_audio_url || "NONE"}. 
         - Use Exact Start Time: ${scene.start_time}, Duration: ${scene.duration}.
         - This establishes the definitive duration for the scene.
      3. Visual Prep: If the clip is too long, use 'trim_stock_footage'. 
      4. Visual Fit: Use 'fit_stock_footage_to_duration' to ensure the video perfectly matches the narration duration of exactly ${scene.duration}s.
      5. Final Muxing: Finally, use 'merge_audio_video' to combine the fitted video with the trimmed audio segment.
         - CRITICAL: No padding or handles are allowed. Narrative precision must be 1:1.
      6. VERIFICATION: Sequence is SEARCH -> AUDIO_TRIM -> [TRIM] -> FIT -> MERGE.`;

      // 2. Initialize Conversation History (Anthropic format)
      const messages: any[] = [
        { 
          role: "user", 
          content: "Please execute the B-Roll production sequence." 
        }
      ];

      // Re-hydrate conversation if it's already in progress
      if (scene.agent_state?.step === 'asset_acquired') {
        messages.push({
          role: "assistant",
          content: `Internal State Recovery: Asset acquired (${scene.agent_state.videoUrl}). Proceeding to mandatory conforming.`
        });
      }

      let isRunning = true;
      let turnCount = 0;
      const MAX_TURNS = 10; // Claude is more efficient, but let's be safe
      let finalAgentResponse = "B-Roll production complete.";

      // 3. THE MULTI-TURN AGENTIC LOOP
      while (isRunning && turnCount < MAX_TURNS) {
        turnCount++;
        
        // Dynamic turn context based on state
        const stateSummary = scene.agent_state?.step || 'idle';
        
        console.log(`[${this.name}] Round ${turnCount}: Requesting decision from Claude... State: ${stateSummary}`);

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: systemPrompt + `\n\nCurrent Internal State: ${stateSummary}. Turn ${turnCount}/${MAX_TURNS}. ` + 
                  (stateSummary === 'asset_acquired' ? "HINT: If the clip is much longer than the target, call 'trim_stock_footage'. Otherwise, call 'fit_stock_footage_to_duration'." : "") +
                  (stateSummary === 'asset_trimmed' ? "MANDATORY: You have trimmed the asset. Now call 'fit_stock_footage_to_duration' to finalize the fit." : ""),
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
            if (toolName === 'search_pexels_library') {
              toolResult = await brollTools.search_pexels_library({
                ...args,
                targetDuration: scene.duration
              });

              if (toolResult.status === 'success') {
                const newState = { 
                  step: 'asset_acquired', 
                  videoUrl: toolResult.videoUrl, 
                  originalDuration: toolResult.duration 
                };
                const updatedScene = await sceneService.update(scene.id, {
                  asset_url: toolResult.videoUrl,
                  thumbnail_url: toolResult.thumbnail,
                  agent_state: newState,
                  payload: { ...scene.payload, ...toolResult }
                });
                Object.assign(scene, updatedScene);
              }
            } else if (toolName === 'trim_stock_footage') {
              const targetDuration = Number(args.duration || scene.duration);
              toolResult = await brollTools.trim_stock_footage({
                ...args,
                duration: targetDuration
              });

              if (toolResult.status === 'success') {
                const newState = { 
                  ...scene.agent_state,
                  step: 'asset_trimmed', 
                  videoUrl: toolResult.outputUrl,
                  paddedDuration: targetDuration,
                  isExactCut: true
                };
                const updatedScene = await sceneService.update(scene.id, {
                  asset_url: toolResult.outputUrl, 
                  agent_state: newState,
                  payload: { ...scene.payload, ...toolResult }
                });
                Object.assign(scene, updatedScene);
              }
            } else if (toolName === 'fit_stock_footage_to_duration') {
              const targetDuration = Number(args.targetDuration || scene.duration);
              toolResult = await brollTools.fit_stock_footage_to_duration({
                videoUrl: args.videoUrl || scene.asset_url,
                targetDuration: targetDuration
              });

              if (toolResult.status === 'completed') {
                const newState = { 
                  ...scene.agent_state,
                  step: 'conforming_complete', 
                  finalUrl: toolResult.outputUrl 
                };
                const updatedScene = await sceneService.update(scene.id, {
                  final_video_url: toolResult.outputUrl,
                  agent_state: newState,
                  payload: { ...scene.payload, ...toolResult }
                });
                Object.assign(scene, updatedScene);
              }
            } else if (toolName === 'trim_master_audio') {
              const parseNumber = (val: any, fallback: number) => {
                if (typeof val === 'number') return val;
                if (!val) return fallback;
                const clean = String(val).replace(/[^0-9.]/g, '');
                const parsed = parseFloat(clean);
                return isNaN(parsed) ? fallback : parsed;
              };

              const startTime = parseNumber(args.start ?? scene.start_time, 0);
              const duration = parseNumber(args.duration ?? scene.duration, 0);

              console.log(`[BRollAgent] Trim Audio for Scene ${scene.index}: Start=${startTime}, Dur=${duration}`);

              toolResult = await audioTools.trim_master_audio({
                audioUrl: args.audioUrl || context.master_audio_url || "",
                start: startTime.toString(),
                duration: duration
              });

              if (toolResult.success) {
                const newState = { 
                  ...scene.agent_state,
                  step: 'audio_trimmed', 
                  trimmedAudioUrl: toolResult.audioUrl
                };
                const updatedScene = await sceneService.update(scene.id, {
                  agent_state: newState,
                  payload: { ...scene.payload, ...toolResult }
                });
                Object.assign(scene, updatedScene);
                toolResult.status = "success";
              }
            } else if (toolName === 'merge_audio_video') {
              toolResult = await audioTools.merge_audio_video({
                videoUrl: args.videoUrl || scene.final_video_url || scene.asset_url,
                audioUrl: args.audioUrl || scene.agent_state?.trimmedAudioUrl
              });

              if (toolResult.success) {
                const newState = { 
                  ...scene.agent_state,
                  step: 'production_complete', 
                  finalMergedUrl: toolResult.videoUrl 
                };
                const updatedScene = await sceneService.update(scene.id, {
                  final_video_url: toolResult.videoUrl,
                  agent_state: newState,
                  payload: { ...scene.payload, ...toolResult }
                });
                Object.assign(scene, updatedScene);
                toolResult.status = "success";
              }
            } else {
              toolResult = { status: "failed", error: `Tool ${toolName} not found.` };
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

        } else {
          console.log(`[${this.name}] Final response received from Claude.`);
          const textBlock = response.content.find(c => c.type === 'text');
          finalAgentResponse = textBlock?.text || finalAgentResponse;
          isRunning = false;
        }
      }

      // Handle Edge Case: Max Turns Reached
      if (turnCount >= MAX_TURNS && isRunning) {
        console.warn(`[${this.name}] Max turns (${MAX_TURNS}) reached for scene ${scene.index}.`);
        await memoryService.update(projectId, { 
          last_log: `${this.name}: Max reasoning turns reached. Scene may be incomplete.` 
        });
      }

      // 4. Finalize Scene
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
        last_log: `${this.name}: Scene ${scene.index} successfully productionized.`
      });

      return { 
        success: true, 
        message: finalAgentResponse, 
        log: `Completed in ${turnCount} turns using Claude Sonnet 4.`
      };
    } catch (error) {
      console.error(`[${this.name}] CRITICAL FAILURE:`, error);
      await sceneService.update(scene.id, { status: 'failed' });
      const currentMemory = await memoryService.getByProjectId(projectId);
      await memoryService.update(projectId, { 
        failed_count: (currentMemory.failed_count || 0) + 1,
        active_agents: [],
        current_scene_id: undefined,
        workflow_status: 'paused',
        last_log: `CRITICAL ERROR in ${this.name} during Scene ${scene.index}.`
      });

      return { success: false, message: `Failed in ${this.name}`, log: String(error), error: String(error) };
    }
  }
}
