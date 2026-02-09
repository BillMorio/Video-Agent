-- 1. Clean up existing table and types
DROP TABLE IF EXISTS agent_memory;
DROP TYPE IF EXISTS workflow_status CASCADE;

-- 2. Create Workflow Status Enum
CREATE TYPE workflow_status AS ENUM ('idle', 'processing', 'paused', 'completed');

-- 3. Create Agent Memory Table (Source of Truth for Orchestration)
CREATE TABLE agent_memory (
    project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    workflow_status workflow_status NOT NULL DEFAULT 'idle',
    project_system_prompt TEXT NOT NULL DEFAULT 'You are a premium AI video editor specialized in technical content.',
    active_agents TEXT[] DEFAULT '{}',
    total_scenes INT NOT NULL DEFAULT 0,
    completed_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    current_scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_log TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Re-enable Real-time
ALTER PUBLICATION supabase_realtime ADD TABLE agent_memory;

-- 5. Add trigger for updated_at (assumes update_updated_at_column exists from schema.sql)
CREATE TRIGGER update_agent_memory_updated_at 
BEFORE UPDATE ON agent_memory 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
