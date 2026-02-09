/**
 * PRODUCTION B-ROLL TOOLS
 * Handles real Pexels search and FFmpeg-based speed warping (Time Fit).
 */

import { search_pexels_library as pexelsSearch } from "./pexels-tools";

export const FFMPEG_SERVER_URL = process.env.FFMPEG_SERVER_URL || "http://localhost:3333";

export interface SearchBrollArgs {
  query: string;
  per_page?: number;
  orientation?: "landscape" | "portrait" | "square";
  size?: "large" | "medium" | "small";
  targetDuration?: number;
}

export interface FitBrollArgs {
  videoUrl: string;
  targetDuration: number;
}

/**
 * Searches Pexels for stock footage.
 */
export async function search_pexels_library(args: SearchBrollArgs) {
  // Enforce landscape and 720p (small) for the agent unless specified
  return pexelsSearch({
    ...args,
    orientation: args.orientation || "landscape",
    size: args.size || "small"
  });
}

/**
 * Adjusts the speed of stock footage to fit a target duration using the FFmpeg Playground server.
 */
export async function fit_stock_footage_to_duration(args: FitBrollArgs) {
  console.log(`[B-RollTool] Warping footage ${args.videoUrl} to fit ${args.targetDuration}s...`);

  try {
    // 1. Fetch the video file
    const videoResponse = await fetch(args.videoUrl);
    if (!videoResponse.ok) throw new Error(`Failed to fetch video from ${args.videoUrl}`);
    const videoBlob = await videoResponse.blob();

    // 2. Prepare FormData for the FFmpeg Playground (/api/speed)
    const formData = new FormData();
    formData.append("file", videoBlob, "stock_footage.mp4");
    formData.append("targetDuration", args.targetDuration.toString());

    // 3. Post to Playground API
    const response = await fetch(`${FFMPEG_SERVER_URL}/api/speed`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        status: "failed",
        error: data.error || "Failed to warp video via playground",
        details: data.details
      };
    }

    console.log(`[B-RollTool] Warp successful: ${data.outputFile} (Applied Speed: ${data.speedApplied}x)`);
    if (data.publicUrl) console.log(`[B-RollTool] Supabase Link: ${data.publicUrl}`);

    return {
      status: "completed",
      outputUrl: data.publicUrl || `${FFMPEG_SERVER_URL}${data.outputFile}`,
      speedApplied: data.speedApplied,
      originalDuration: data.originalDuration,
      message: `Stock footage warped to ${args.targetDuration}s (Speed: ${data.speedApplied}x).${data.publicUrl ? ' Persisted to cloud storage.' : ''}`
    };
  } catch (error: any) {
    console.error("[B-RollTool] Error during production warp:", error);
    return {
      status: "failed",
      error: error.message || "Unknown error during production warp"
    };
  }
}

/**
 * Surgically trims a stock footage clip using the FFmpeg Playground server.
 */
export async function trim_stock_footage(args: { videoUrl: string, start: string, duration: number }) {
  console.log(`[B-RollTool] Trimming footage ${args.videoUrl} (Start: ${args.start}, Duration: ${args.duration}s)...`);

  try {
    // 1. Fetch the video file
    const videoResponse = await fetch(args.videoUrl);
    if (!videoResponse.ok) throw new Error(`Failed to fetch video from ${args.videoUrl}`);
    const videoBlob = await videoResponse.blob();

    // 2. Prepare FormData
    const formData = new FormData();
    formData.append("file", videoBlob, "stock_footage.mp4");
    formData.append("start", args.start);
    formData.append("duration", args.duration.toString());

    // 3. Post to Playground API (/api/trim)
    const response = await fetch(`${FFMPEG_SERVER_URL}/api/trim`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        status: "failed",
        error: data.error || "Failed to trim video via playground",
        details: data.details
      };
    }

    console.log(`[B-RollTool] Trim successful: ${data.outputFile}`);
    
    return {
      status: "success",
      outputUrl: data.publicUrl || `${FFMPEG_SERVER_URL}${data.outputFile}`,
      message: `Stock footage trimmed to exactly ${args.duration}s starting from ${args.start}.`
    };
  } catch (error: any) {
    console.error("[B-RollTool] Error during production trim:", error);
    return {
      status: "failed",
      error: error.message || "Unknown error during production trim"
    };
  }
}
