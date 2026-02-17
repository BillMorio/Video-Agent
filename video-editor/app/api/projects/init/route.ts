import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title = "Untitled Production", metadata = {}, masterAudioUrl } = body;

    // 1. Create the Project with 'draft' status
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        title,
        status: "draft",
        master_audio_url: masterAudioUrl || metadata.master_audio_url,
        metadata: {
          ...metadata,
          initialized_at: new Date().toISOString(),
          creation_flow: true
        }
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // 2. Initialize Agent Memory (Optional but helpful for tracking)
    const { error: memoryError } = await supabase
      .from("agent_memory")
      .insert({
        project_id: project.id,
        project_name: title,
        workflow_status: "idle",
        last_log: "Project initialized in Creative Spark."
      });

    if (memoryError) {
      console.warn("[Project Init] Failed to initialize agent memory:", memoryError);
      // Non-blocking for now
    }

    return NextResponse.json({ 
      success: true, 
      projectId: project.id 
    });

  } catch (error: any) {
    console.error("[Project Init Error]", error);
    return NextResponse.json({ error: error.message || "Failed to initialize project" }, { status: 500 });
  }
}
