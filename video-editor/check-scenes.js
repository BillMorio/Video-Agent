
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'c:/Users/USER/Desktop/desktop/test/novel/novel/video-editor/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkScenes() {
  const projectId = "7b964054-32f0-40ca-8a8c-0bc4186eb7bb"; // From user log
  console.log(`Checking scenes for project: ${projectId}`);

  const { data: scenes, error } = await supabase
    .from('scenes')
    .select('index, start_time, duration, script')
    .eq('project_id', projectId)
    .order('index', { ascending: true });

  if (error) {
    console.error("Error fetching scenes:", error);
    return;
  }

  console.log(`Found ${scenes.length} scenes:`);
  scenes.forEach(s => {
    console.log(`Scene ${s.index}: Start=${s.start_time}, Dur=${s.duration}, Script="${s.script.slice(0, 30)}..."`);
  });
}

checkScenes();
