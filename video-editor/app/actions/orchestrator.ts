"use server";

import { Orchestrator } from "@/lib/agents/orchestrator";
import { AgentResult } from "@/lib/agents/types";

const orchestrator = new Orchestrator();

/**
 * Server side action to process the next scene.
 * This has access to private environment variables like OPENAI_API_KEY.
 */
export async function processNextScene(projectId: string): Promise<AgentResult> {
  try {
    return await orchestrator.findAndProcessNextScene(projectId);
  } catch (error: any) {
    console.error("[Server Action] Orchestration Error:", error);
    return {
      success: false,
      message: "Server-side orchestration failed",
      error: error.message || String(error)
    };
  }
}

/**
 * Reset memory and scenes (also server side for consistency)
 */
import { memoryService } from "@/lib/services/api/memory-service";
import { sceneService } from "@/lib/services/api/scene-service";

export async function resetProjectProduction(projectId: string) {
    await memoryService.reset(projectId);
    const scenes = await sceneService.getByProjectId(projectId);
    for (const s of scenes) {
        await sceneService.update(s.id, { status: 'todo' });
    }
}
