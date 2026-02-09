import { supabase } from '@/lib/supabase';
import { AgentMemory } from '@/lib/agents/types';

export const memoryService = {
  /**
   * Fetch memory for a specific project
   */
  async getByProjectId(projectId: string) {
    const { data, error } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('project_id', projectId)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Initialize memory for a new project
   */
  async initialize(projectId: string, initialData: Partial<AgentMemory>) {
    console.log(`[MemoryService] Initializing memory for project ${projectId}`);
    const { data, error } = await supabase
      .from('agent_memory')
      .upsert({
        project_id: projectId,
        ...initialData
      })
      .select()
      .single();
    
    if (error) {
        console.error(`[MemoryService] INITIALIZE ERROR for project ${projectId}`);
        console.error("Error Message:", error.message);
        console.error("Error Code:", error.code);
        console.error("Error Details:", error.details);
        console.error("Error Hint:", error.hint);
        throw error;
    }
    return data;
  },

  /**
   * Update project memory (status, counts, logs)
   */
  async update(projectId: string, updates: Partial<AgentMemory>) {
    console.log(`[MemoryService] Updating memory for project ${projectId}:`, updates);
    const { data, error } = await supabase
      .from('agent_memory')
      .update(updates)
      .eq('project_id', projectId)
      .select()
      .single();
    
    if (error) {
        console.error(`[MemoryService] UPDATE ERROR for project ${projectId}:`, error);
        throw error;
    }
    return data;
  },

  /**
   * Reset memory for a simulation
   */
  async reset(projectId: string) {
    const { data, error } = await supabase
      .from('agent_memory')
      .update({
        workflow_status: 'idle',
        completed_count: 0,
        failed_count: 0,
        active_agents: [],
        last_log: 'Simulation reset.'
      })
      .eq('project_id', projectId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
