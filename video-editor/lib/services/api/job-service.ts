import { supabase } from '@/lib/supabase';

export interface Job {
  id: string;
  scene_id: string;
  provider: string;
  external_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  created_at?: string;
  updated_at?: string;
}

export const jobService = {
  /**
   * Create a new job for a scene
   */
  async create(job: Partial<Job>) {
    console.log(`[JobService] Creating job for scene ${job.scene_id}:`, job.provider);
    const { data, error } = await supabase
      .from('jobs')
      .insert(job)
      .select()
      .single();
    
    if (error) {
        console.error("[JobService] INSERT ERROR:", error);
        throw error;
    }
    return data;
  },

  /**
   * Update a job's status and result
   */
  async update(id: string, updates: Partial<Job>) {
    console.log(`[JobService] Updating job ${id}:`, updates.status);
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
        console.error(`[JobService] UPDATE ERROR for ID ${id}:`, error);
        throw error;
    }
    return data;
  },

  /**
   * Fetch all jobs for a scene
   */
  async getBySceneId(sceneId: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('scene_id', sceneId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};
