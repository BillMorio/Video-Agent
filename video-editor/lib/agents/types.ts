export type SceneStatus = 'todo' | 'processing' | 'completed' | 'failed' | 'awaiting_input';
export type VisualType = 'a-roll' | 'b-roll' | 'graphics' | 'image';

export interface Transition {
  type: "fade" | "crossfade" | "wipe" | "dissolve" | "light-leak" | "none";
  duration: number;
}

export interface Scene {
  id: string;
  project_id: string;
  index: number;
  start_time: number;
  end_time: number;
  duration: number; // Added for convenience and calculation
  script: string;
  visual_type: VisualType;
  scene_type?: string;
  status: SceneStatus;
  final_video_url?: string;
  asset_url?: string;
  thumbnail_url?: string;
  payload?: any;
  agent_state?: any;
  director_notes?: string;
  fitting_strategy?: string;
  transition?: Transition;
  scale?: number;
}

export interface Project {
  id: string;
  title: string;
  status: string;
  orientation: string;
  total_duration: number;
  master_audio_url?: string;
  transcript_url?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export type WorkflowStatus = 'idle' | 'processing' | 'paused' | 'completed';

export interface AgentMemory {
  project_id: string;
  project_name: string; // Added to remove hardcoding
  workflow_status: WorkflowStatus;
  project_system_prompt: string;
  active_agents: string[];
  total_scenes: number;
  completed_count: number;
  failed_count: number;
  current_scene_id?: string;
  last_log?: string;
  metadata?: any; // For dynamic settings like aspectRatio, tone, etc.
  updated_at: string;
}

export interface AgentResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  log?: string; 
}

/**
 * Unified Context: The agent now only needs the memory from the DB
 * to understand its purpose and progress.
 */
export interface ProjectContext {
  memory: AgentMemory;
  master_audio_url?: string;
}

export interface BaseAgent {
  name: string;
  role: string;
  process(scene: Scene, context: ProjectContext): Promise<AgentResult>;
}
