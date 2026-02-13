import { NextRequest, NextResponse } from "next/server";
import { sceneService } from "@/lib/services/api/scene-service";
import { memoryService } from "@/lib/services/api/memory-service";
import { settingsService } from "@/lib/services/api/settings-service";

const FFMPEG_SERVER = "http://127.0.0.1:3333";
const REMOTE_RENDER_SERVER = "http://localhost:3000";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const body = await req.json();
  const { 
    useFadeTransition = true, 
    useLightLeak = false,
    useCloudRender = false,
    lightLeakUrl = null,
  } = body;

  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  try {
    console.log(`[StitchOrchestrator] Orchestrating stitch for project: ${projectId}`);
    console.log(`[StitchOrchestrator] Use fade transition: ${useFadeTransition}`);

    // 1. Fetch all scenes for the project
    const scenes = await sceneService.getByProjectId(projectId);

    if (!scenes || scenes.length === 0) {
      return NextResponse.json({ error: "No scenes found for this project" }, { status: 404 });
    }

    // 1.5. Fetch project settings/memory and global settings
    const [memory, globalLeakUrl] = await Promise.all([
      memoryService.getByProjectId(projectId).catch(() => null),
      settingsService.getLightLeakOverlayUrl()
    ]);
    
    // Priority: Body Parameter > Project Memory > Global Settings
    const finalLightLeakUrl = lightLeakUrl || memory?.metadata?.lightLeakOverlayUrl || globalLeakUrl;

    console.log(`[StitchOrchestrator] Light leak resolution:`);
    console.log(`  - Project Memory Override: ${memory?.metadata?.lightLeakOverlayUrl || 'None'}`);
    console.log(`  - Global Setting: ${globalLeakUrl || 'None'}`);
    console.log(`  - Final Resolved URL: ${finalLightLeakUrl || 'None'}`);
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

    console.log(`[StitchOrchestrator] Use fade transition: ${useFadeTransition}`);
    console.log(`[StitchOrchestrator] Use light leak transition: ${useLightLeak}`);
    
    // 4. Handle Cloud Render if requested
    if (useCloudRender) {
      console.log(`[StitchOrchestrator] Triggering Remotion Lambda build with ${sceneUrls.length} assets...`);
      
      // Calculate frames based on 30fps
      const inputProps = {
        scenes: validScenes.map(s => ({
          url: s.final_video_url || s.asset_url,
          durationInFrames: Math.round((s.duration || (s.end_time - s.start_time)) * 30)
        })),
        lightLeakUrl: finalLightLeakUrl,
        transitionDurationInFrames: 30,
        aspectRatio: memory?.metadata?.aspectRatio || "16:9"
      };

      const response = await fetch(`${REMOTE_RENDER_SERVER}/lambda/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          compositionId: "CloudSceneAssembly",
          inputProps 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Remotion Lambda rendering failed to start");
      }

      const result = await response.json();
      return NextResponse.json({
        success: true,
        message: "Remotion Lambda render started!",
        isCloudRender: true,
        renderId: result.renderId,
        bucketName: result.bucketName,
        details: result
      });
    }

    // 5. Trigger FFmpeg backend stitching (Legacy/Local)
    console.log(`[StitchOrchestrator] Triggering FFmpeg build with ${sceneUrls.length} assets...`);
    const response = await fetch(`${FFMPEG_SERVER}/api/project/stitch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        sceneUrls,
        scenes: validScenes, // Pass scene metadata for transition selection
        transition: "batch-light-leak",
        duration: 1.5,
        useFadeTransition, // Pass the fade transition toggle
        useLightLeak, // Pass the light leak transition toggle
        globalSettings: {
          lightLeakOverlayUrl: finalLightLeakUrl
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
