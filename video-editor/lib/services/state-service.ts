import { AgentMemory, WorkflowStatus, AgentResult } from "../agents/types";

/**
 * Service to manage the persistent "Memory" of agents via Supabase.
 * Each function is small and precise to handle specific state transitions.
 */
export class StateService {
  /**
   * Fetches the current memory state for a project.
   */
  async getProjectMemory(projectId: string): Promise<AgentMemory> {
    console.log(`[StateService] Fetching memory for project: ${projectId}`);
    
    // Mock Supabase call:
    // const { data } = await supabase.from('agent_memory').select('*').eq('project_id', projectId).single();
    
    return {
      project_id: projectId,
      project_name: "The Future of AI (DB-Driven)", // Mocked from DB
      workflow_status: 'processing',
      project_system_prompt: "You are a premium AI video editor specialized in technical content.",
      active_agents: [],
      total_scenes: 10,
      completed_count: 2,
      failed_count: 0,
      metadata: {
        tone: "Premium & Technical",
        aspectRatio: "16:9",
        resolution: "1080p"
      },
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Reports an agent starting work by adding it to active_agents.
   */
  async registerAgentStart(projectId: string, agentName: string): Promise<void> {
    console.log(`[StateService] Agent "${agentName}" started on project ${projectId}`);
    // UPDATE agent_memory SET active_agents = array_append(active_agents, agentName) WHERE project_id = projectId
  }

  /**
   * Reports an agent finishing work.
   */
  async registerAgentDone(projectId: string, agentName: string, result: AgentResult): Promise<void> {
    console.log(`[StateService] Agent "${agentName}" finished. Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    
    // Logic:
    // 1. Remove from active_agents
    // 2. Increment completed_count or failed_count
    // 3. Update last_log with result.log
  }

  /**
   * Updates the overall workflow status.
   */
  async updateWorkflowStatus(projectId: string, status: WorkflowStatus): Promise<void> {
    console.log(`[StateService] Workflow status updated to: ${status}`);
  }
}

export const stateService = new StateService();
