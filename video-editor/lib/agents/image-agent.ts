import { Scene, AgentResult, BaseAgent, ProjectContext } from "./types";
import { openai } from "../openai";
import { SIMULATED_TOOLS } from "./tools/simulation/definitions";
import { memoryService } from "../services/api/memory-service";
import { sceneService } from "../services/api/scene-service";
import { jobService } from "../services/api/job-service";
// Import tools directly for readability
import * as imageTools from "./tools/simulation/image-tools";

export class ImageAgent implements BaseAgent {
  name = "Image Agent";
  role = "Orchestrates background graphics, SDXL image generations, and technical UI plates.";

  private TOOL_LOG_MAPPING: Record<string, string> = {
    'generate_sdxl_visual': 'Generating high-fidelity AI imagery via SDXL',
    'apply_text_branding': 'Applying technical branding and overlays',
  };

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

      // 2. Initialize Conversation History
      const messages: any[] = [
        { 
          role: "system", 
          content: `You are the ${this.name}. ${this.role}
          
          SCENE CONTEXT:
          - Script: "${scene.script}"
          - Duration: ${scene.duration}s
          - Visual Style: Techy, Premium, High-fidelity
          
          PRODUCTION WORKFLOW (Reason-Act):
          1. Execute ONE tool at a time.
          2. STEP 1: Use 'generate_sdxl_visual' to create the core background/graphic.
          3. FEEDBACK: Observe the generated visual result.
          4. STEP 2: Use 'apply_text_branding' to add technical labels.
          5. Respond with final confirmation text when done.` 
        },
        { 
          role: "user", 
          content: "Please execute the visual production sequence." 
        }
      ];

      let isRunning = true;
      let turnCount = 0;
      const MAX_TURNS = 5;

      while (isRunning && turnCount < MAX_TURNS) {
        turnCount++;
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: messages,
          tools: SIMULATED_TOOLS,
          tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;
        messages.push(responseMessage);

        const toolCalls = responseMessage.tool_calls;

        if (toolCalls && toolCalls.length > 0) {
          for (const toolCall of toolCalls) {
            if (toolCall.type !== 'function') continue;

            const { name: toolName } = toolCall.function;
            const args = JSON.parse(toolCall.function.arguments);
            
            const job = await jobService.create({
              scene_id: scene.id,
              provider: `${this.name} (${toolName})`,
              external_id: toolCall.id,
              status: 'processing',
              result: { tool: toolName, args }
            });

            const logAction = this.TOOL_LOG_MAPPING[toolName] || `Executing ${toolName}`;
            await memoryService.update(projectId, { last_log: `${this.name}: ${logAction}...` });

            let toolResult: any;
            if (toolName === 'generate_sdxl_visual') {
              toolResult = await imageTools.generate_sdxl_visual(args);
            } else if (toolName === 'apply_text_branding') {
              toolResult = await imageTools.apply_text_branding(args);
            } else {
              toolResult = { status: "failed", error: `Tool ${toolName} not found.` };
            }

            await jobService.update(job.id, { 
              status: toolResult.status === 'failed' ? 'failed' : 'completed',
              result: { ...job.result, ...toolResult, completed_at: new Date().toISOString() }
            });

            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: toolName,
              content: JSON.stringify(toolResult),
            });
          }
        } else {
          isRunning = false;
        }
      }

      // 3. Finalize
      await sceneService.update(scene.id, { status: 'completed' });
      await memoryService.update(projectId, { 
        completed_count: (context.memory.completed_count || 0) + 1,
        active_agents: [],
        current_scene_id: undefined,
        last_log: `${this.name}: Scene ${scene.index} visuals finalized.`
      });

      return { 
        success: true, 
        message: `${this.name} work complete for scene ${scene.index}.`, 
        log: `Completed in ${turnCount} turns.`
      };
    } catch (error) {
      console.error(`[${this.name}] FAILURE:`, error);
      await sceneService.update(scene.id, { status: 'failed' });
      await memoryService.update(projectId, { 
        failed_count: (context.memory.failed_count || 0) + 1,
        active_agents: [],
        workflow_status: 'paused',
        last_log: `ERROR in ${this.name} during Scene ${scene.index}.`
      });
      return { success: false, message: `Failed in ${this.name}`, log: String(error) };
    }
  }
}
