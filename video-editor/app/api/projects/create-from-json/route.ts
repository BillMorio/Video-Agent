import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { projectTitle, storyboardData, masterAudioUrl, transcriptUrl } = await req.json();

    if (!projectTitle || !storyboardData || !storyboardData.scenes) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    // 1. Create the Project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        title: projectTitle,
        total_duration: storyboardData.project.totalDuration || 0,
        master_audio_url: masterAudioUrl,
        transcript_url: transcriptUrl,
        status: "draft"
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // 2. Create the Scenes
    const scenesToInsert = storyboardData.scenes.map((scene: any, index: number) => {
      // Extract the relevant visual payload based on the type
      let payload: any = {};
      if (scene.visualType === 'a-roll') Object.assign(payload, scene.aRoll || {});
      else if (scene.visualType === 'b-roll') Object.assign(payload, scene.bRoll || {});
      else if (scene.visualType === 'graphics') Object.assign(payload, scene.graphics || {});
      else if (scene.visualType === 'image') Object.assign(payload, scene.image || {});

      return {
        project_id: project.id,
        index: scene.index || index + 1,
        start_time: scene.startTime ?? scene.start_time ?? 0,
        end_time: scene.endTime ?? scene.end_time ?? 0,
        duration: (scene.endTime ?? scene.end_time ?? 0) - (scene.startTime ?? scene.start_time ?? 0),
        script: scene.script,
        visual_type: scene.visualType,
        scene_type: scene.sceneType,
        director_notes: scene.directorNote || scene.director_notes,
        asset_url: scene.assetUrl || scene.asset_url,
        final_video_url: scene.finalVideoUrl || scene.final_video_url,
        thumbnail_url: scene.thumbnailUrl || scene.thumbnail_url,
        status: "todo",
        fitting_strategy: scene.fittingStrategy || scene.fitting_strategy || "trim",
        transition: scene.transition || { type: "none", duration: 0 },
        scale: scene.visualType === 'a-roll' ? (scene.aRoll?.scale || 1.0) : null,
        payload: payload
      };
    });

    const { data: createdScenes, error: scenesError } = await supabase
      .from("scenes")
      .insert(scenesToInsert)
      .select();

    if (scenesError) throw scenesError;

    // 4. Initialize Agent Memory
    const { error: memoryError } = await supabase
      .from("agent_memory")
      .insert({
        project_id: project.id,
        project_name: projectTitle,
        workflow_status: "idle",
        total_scenes: storyboardData.scenes.length,
        completed_count: 0,
        failed_count: 0,
        last_log: "Project storyboard initialized."
      });

    if (memoryError) throw memoryError;

    return NextResponse.json({ 
      success: true, 
      projectId: project.id 
    });

  } catch (error: any) {
    console.error("[Project Creation Error]", error);
    return NextResponse.json({ error: error.message || "Failed to create project" }, { status: 500 });
  }
}
