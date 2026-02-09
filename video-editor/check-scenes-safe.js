
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple parse of .env.local
const envFile = fs.readFileSync('c:/Users/USER/Desktop/desktop/test/novel/novel/video-editor/.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) env[parts[0].trim()] = parts[1].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkScenes() {
  const projectId = "7b964054-32f0-40ca-8a8c-0bc4186eb7bb"; 
  const { data: scenes, error } = await supabase
    .from('scenes')
    .select('index, start_time, duration, script')
    .eq('project_id', projectId)
    .order('index', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  console.log(`DATA_SNAPSHOT_START`);
  scenes.forEach(s => {
    console.log(`INDEX:${s.index}|START:${s.start_time}|DUR:${s.duration}`);
  });
  console.log(`DATA_SNAPSHOT_END`);
}

checkScenes();
