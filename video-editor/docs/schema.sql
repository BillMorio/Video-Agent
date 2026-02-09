-- Database Schema for Autonomous Video Pipeline
-- Designed for Supabase (PostgreSQL)

-- 1. ENUMS for Status Tracking
CREATE TYPE project_status AS ENUM ('draft', 'processing', 'completed', 'failed');
CREATE TYPE asset_status AS ENUM ('todo', 'processing', 'awaiting_input', 'completed', 'failed');
CREATE TYPE visual_type AS ENUM ('a-roll', 'b-roll', 'graphics', 'image');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE video_orientation AS ENUM ('landscape', 'vertical', 'square');

-- 2. PROJECTS TABLE
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    status project_status NOT NULL DEFAULT 'draft',
    orientation video_orientation NOT NULL DEFAULT 'landscape',
    total_duration FLOAT NOT NULL DEFAULT 0,
    master_audio_url TEXT,
    transcript_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SCENES TABLE
CREATE TABLE scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    index INT NOT NULL,
    start_time FLOAT NOT NULL,
    end_time FLOAT NOT NULL,
    duration FLOAT NOT NULL, -- Stored for convenience
    script TEXT,
    visual_type visual_type NOT NULL,
    scene_type TEXT, -- e.g., Intro, Explanation, Transition
    director_notes TEXT, -- Creative direction for the AI agents
    fitting_strategy TEXT DEFAULT 'trim', -- trim, stretch, generate
    transition JSONB DEFAULT '{"type": "none", "duration": 0}'::jsonb,
    
    -- FLATTENED ASSET DATA
    asset_url TEXT, -- Raw link from provider (e.g. Pexels)
    final_video_url TEXT, -- Processed/Trimmed link
    thumbnail_url TEXT, -- For UI preview
    payload JSONB DEFAULT '{}'::jsonb, -- Specialized params (Prompts, search queries, etc.)
    agent_state JSONB DEFAULT '{}'::jsonb, -- Persistent state for AI agent flows (e.g., { "step": "asset_acquired" })

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure scenes are ordered unique per project
    CONSTRAINT unique_scene_index UNIQUE (project_id, index)
);

-- 5. JOBS TABLE (Async Orchestration)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- heygen, pexels, elevenlabs
    external_id TEXT NOT NULL, -- The ID from the provider's API
    status job_status NOT NULL DEFAULT 'pending',
    result JSONB DEFAULT '{}'::jsonb, -- Last known API response
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. AGENT MEMORY TABLE (Simulation State)
CREATE TABLE agent_memory (
    project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    workflow_status TEXT NOT NULL DEFAULT 'idle', -- idle, processing, paused, completed
    project_system_prompt TEXT DEFAULT '',
    active_agents TEXT[] DEFAULT '{}',
    total_scenes INT DEFAULT 0,
    completed_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    current_scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL,
    last_log TEXT DEFAULT '',
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. INDEXES for Performance
CREATE INDEX idx_scenes_project_id ON scenes(project_id);
CREATE INDEX idx_jobs_scene_id ON jobs(scene_id);
CREATE INDEX idx_scenes_status ON scenes(status);

-- 7. TRIGGER for Updated At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_scenes_updated_at BEFORE UPDATE ON scenes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_agent_memory_updated_at BEFORE UPDATE ON agent_memory FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
