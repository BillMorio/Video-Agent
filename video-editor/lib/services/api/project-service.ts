import { supabase } from '@/lib/supabase';
import { Project } from '@/lib/agents/types'; // Using the simplified DB-aligned types

export const projectService = {
  /**
   * Fetch all projects
   */
  async getAll() {
    console.log("[ProjectService] Fetching all projects...");
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
        console.error("[ProjectService] GET ALL ERROR:", error);
        throw error;
    }
    console.log(`[ProjectService] Fetched ${data.length} projects.`);
    return data;
  },

  /**
   * Fetch a single project by ID
   */
  async getById(id: string) {
    console.log(`[ProjectService] Fetching project with ID: ${id}`);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
        console.error(`[ProjectService] GET BY ID ERROR for ID ${id}:`, error);
        throw error;
    }
    console.log(`[ProjectService] Fetched project with ID: ${id}`);
    return data;
  },

  /**
   * Create a new project
   */
  async create(project: Partial<Project>) {
    console.log("[ProjectService] Creating project:", project);
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) {
        console.error("[ProjectService] INSERT ERROR:", error);
        throw error;
    }
    return data;
  },

  /**
   * Update an existing project
   */
  async update(id: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a project
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};
