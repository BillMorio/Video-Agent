import { supabase } from '@/lib/supabase';
import { Scene } from '@/lib/agents/types';

export const sceneService = {
  /**
   * Fetch all scenes for a project
   */
  async getByProjectId(projectId: string) {
    const { data, error } = await supabase
      .from('scenes')
      .select('*')
      .eq('project_id', projectId)
      .order('index', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  /**
   * Create a new scene
   */
  async create(scene: Partial<Scene>) {
    console.log("[SceneService] Creating scene:", scene.index);
    const { data: newScene, error: sceneError } = await supabase
      .from('scenes')
      .insert({
        ...scene,
        fitting_strategy: scene.fitting_strategy || 'trim',
        transition: scene.transition || { type: "none", duration: 0 }
      })
      .select()
      .single();
    
    if (sceneError) {
        console.error("[SceneService] SCENE INSERT ERROR:", sceneError);
        throw sceneError;
    }

    return newScene;
  },

  /**
   * Update a scene
   */
  async update(id: string, updates: Partial<Scene>) {
    console.log(`[SceneService] Updating scene ${id}:`, updates);
    const { data, error } = await supabase
      .from('scenes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
        console.error(`[SceneService] UPDATE ERROR for ID ${id}:`, error);
        throw error;
    }
    return data;
  },

  /**
   * Update a scene's visual payload
   */
  async updateVisualData(id: string, payload: any) {
    return this.update(id, { payload });
  },

  /**
   * Delete a scene
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('scenes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};
