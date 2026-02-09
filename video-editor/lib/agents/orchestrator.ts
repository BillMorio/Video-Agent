import { Scene, AgentResult, BaseAgent, ProjectContext } from "./types";
import { ARollAgent } from "./a-roll-agent";
import { BRollAgent } from "./b-roll-agent";
import { ImageAgent } from "./image-agent";
import { MotionGraphicAgent } from "./motion-graphic-agent";
import { memoryService } from "../services/api/memory-service";
import { sceneService } from "../services/api/scene-service";
import { projectService } from "../services/api/project-service";

export class Orchestrator {
  public memoryService = memoryService;
  public sceneService = sceneService;
  public projectService = projectService;

  private agents: Record<string, BaseAgent> = {
    'a-roll': new ARollAgent(),
    'b-roll': new BRollAgent(),
    'image': new ImageAgent(),
    'graphics': new MotionGraphicAgent()
  };

  async findAndProcessNextScene(projectId: string): Promise<AgentResult> {
    console.log("[Orchestrator] Searching for next pending task...");

    // 1. Get current project memory and project details
    const [memory, project] = await Promise.all([
      memoryService.getByProjectId(projectId),
      projectService.getById(projectId)
    ]);
    
    if (memory.workflow_status === 'paused' || memory.workflow_status === 'completed') {
      return { success: false, message: `Orchestrator inactive: ${memory.workflow_status}` };
    }

    // 2. Fetch all scenes and find the first 'todo' one
    const scenes = await sceneService.getByProjectId(projectId);
    const nextScene = scenes.find(s => s.status === 'todo');

    if (!nextScene) {
      // If no scenes left to process, mark as completed
      await memoryService.update(projectId, { 
        workflow_status: 'completed',
        last_log: "Orchestrator: All scenes processed. Project locked."
      });
      return { success: true, message: "Project completed." };
    }

    console.log(`[Orchestrator] Routing Scene ${nextScene.index} (Type: ${nextScene.visual_type})`);

    // 3. Assign Agent
    const agent = this.agents[nextScene.visual_type];
    if (!agent) {
       return { success: false, message: `No agent available for: ${nextScene.visual_type}` };
    }

    // 4. Hand-off to Agent (The agent now handles all DB updates internally)
    const context: ProjectContext = { 
      memory,
      master_audio_url: project.master_audio_url 
    };
    const result = await agent.process(nextScene, context);

    return result;
  }
}
