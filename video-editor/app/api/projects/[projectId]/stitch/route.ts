import { NextRequest, NextResponse } from "next/server";
import { sceneService } from "@/lib/services/api/scene-service";
import { memoryService } from "@/lib/services/api/memory-service";

const FFMPEG_SERVER = "http://127.0.0.1:3333";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  try {
    console.log(`[StitchOrchestrator] Orchestrating stitch for project: ${projectId}`);

    // 1. Fetch all scenes for the project
    const scenes = await sceneService.getByProjectId(projectId);

    if (!scenes || scenes.length === 0) {
      return NextResponse.json({ error: "No scenes found for this project" }, { status: 404 });
    }

    // 1.5. Fetch project settings/memory
    const memory = await memoryService.getByProjectId(projectId).catch(() => null);
    const globalLightLeakUrl = memory?.metadata?.lightLeakOverlayUrl;

    console.log(`[StitchOrchestrator] Found ${scenes.length} total scenes.`);
    
    // 2. Filter scenes that have some form of video asset (prefer final_video_url, fallback to asset_url)
    const validScenes = scenes.filter(s => s.final_video_url || s.asset_url);

    scenes.forEach((s, i) => {
      console.log(`[StitchOrchestrator] Scene ${i} (ID: ${s.id.slice(0, 8)}): final_url=${!!s.final_video_url}, asset_url=${!!s.asset_url}`);
    });

    if (validScenes.length < scenes.length) {
      console.warn(`[StitchOrchestrator] Only ${validScenes.length}/${scenes.length} scenes have assets. Proceeding with available assets.`);
    }

    if (validScenes.length < 2) {
      return NextResponse.json({ 
        error: "At least 2 scenes with assets are required for stitching",
        found: validScenes.length,
        total: scenes.length
      }, { status: 400 });
    }

    // 3. Extract asset URLs in correct order (prefer final_video_url)
    const sceneUrls = validScenes.map(s => s.final_video_url || s.asset_url);

    // 4. Trigger FFmpeg backend stitching
    console.log(`[StitchOrchestrator] Triggering FFmpeg build with ${sceneUrls.length} assets...`);
    const response = await fetch(`${FFMPEG_SERVER}/api/project/stitch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        sceneUrls,
        scenes: validScenes, // Pass scene metadata for transition selection
        transition: "crossfade",
        duration: 1.5,
        globalSettings: {
          lightLeakOverlayUrl: globalLightLeakUrl
        }
      }),
      signal: AbortSignal.timeout(600000) // 10 minutes timeout
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "FFmpeg stitching failed");
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Project master production assembled!",
      publicUrl: result.publicUrl,
      details: result
    });

  } catch (error: any) {
    console.error("[StitchOrchestrator Error]", error);
    return NextResponse.json({ 
      error: error.message || "Internal server error during stitching",
      details: error.stderr || null
    }, { status: 500 });
  }
}
