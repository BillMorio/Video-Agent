import { uploadToSupabase } from "../../../storage";

export const FFMPEG_SERVER_URL = process.env.FFMPEG_SERVER_URL || "http://localhost:3333";

export interface CutAudioSegmentArgs {
  audioUrl: string;
  start: string;
  duration: number;
}

export interface GenerateHeygenVideoArgs {
  audioUrl: string;
  avatarId: string;
  caption?: boolean;
  scale?: number;
}

export interface PollHeygenStatusArgs {
  videoId: string;
}

/**
 * Trims audio and uploads the segment to Supabase for a public URL.
 */
export async function cut_audio_segment(args: CutAudioSegmentArgs) {
  console.log(`[ARollTools] Cutting audio: ${args.audioUrl} at ${args.start} for ${args.duration}s`);

  // 1. Trim the audio using FFmpeg server
  const audioBlob = await fetch(args.audioUrl).then(res => res.blob());
  const formData = new FormData();
  formData.append("file", audioBlob, "input.mp3");
  formData.append("start", args.start);
  formData.append("duration", args.duration.toString());

  const response = await fetch(`${FFMPEG_SERVER_URL}/api/audio-trim`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Audio trimming failed");

  // we get a local path or publicUrl from the ffmpeg server
  const trimmedAudioUrl = `${FFMPEG_SERVER_URL}${data.outputFile}`;
  
  // 2. Download the trimmed audio to upload to Supabase
  const trimmedBlob = await fetch(trimmedAudioUrl).then(res => res.blob());
  const file = new File([trimmedBlob], `aroll-segment-${Date.now()}.mp3`, { type: "audio/mpeg" });
  
  // 3. Upload to Supabase for a definitive public URL
  const publicSupabaseUrl = await uploadToSupabase(file);
  console.log(`[ARollTools] Audio available at: ${publicSupabaseUrl}`);

  return {
    status: "success",
    audioUrl: publicSupabaseUrl
  };
}

/**
 * Initiates video generation on Heygen and polls until completion.
 */
export async function generate_heygen_avatar_video(args: GenerateHeygenVideoArgs) {
  const apiKey = process.env.HEY_GEN_API;
  if (!apiKey) throw new Error("HEY_GEN_API key is not configured");

  console.log(`[ARollTools] Initiating Heygen generation with avatar: ${args.avatarId}, scale: ${args.scale ?? 1.0}`);
  
  const payload = {
    caption: args.caption ?? false,
    video_inputs: [
      {
        character: {
          type: "avatar",
          avatar_id: args.avatarId,
          avatar_style: "normal",
          scale: args.scale ?? 1.0
        },
        voice: {
          type: "audio",
          audio_url: args.audioUrl
        }
      }
    ],
    dimension: { width: 1280, height: 720 }
  };

  const response = await fetch("https://api.heygen.com/v2/video/generate", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-Api-Key": apiKey
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.message || "Heygen video generation failed");

  const videoId = data.data.video_id;
  console.log(`[ARollTools] Generation initiated. Video ID: ${videoId}. Now polling...`);

  // Polling logic
  const maxAttempts = 60; // 10 minutes with 10s intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    const statusResponse = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': apiKey,
      },
    });
    
    const statusData = await statusResponse.json();

    if (!statusResponse.ok) throw new Error(statusData.error || statusData.message || "Failed to check Heygen status");

    const status = statusData.data.status;
    console.log(`[ARollTools] Video ${videoId} status: ${status} (Attempt ${attempts}/${maxAttempts})`);

    if (status === "completed") {
      return {
        status: "success",
        videoId: videoId,
        videoUrl: statusData.data.video_url,
        duration: statusData.data.duration
      };
    }

    if (status === "failed") {
      throw new Error(`Heygen video generation failed: ${statusData.data.error || "Unknown error"}`);
    }

    // Wait 10 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  throw new Error("Heygen video generation timed out");
}

/**
 * @deprecated Polls the Heygen status until completed or failed. (Consolidated into generate_heygen_avatar_video)
 */
export async function poll_heygen_video_status(args: PollHeygenStatusArgs) {
  // Keeping it for backward compatibility if needed, but the agent should use the combined tool
  const apiKey = process.env.HEY_GEN_API;
  if (!apiKey) throw new Error("HEY_GEN_API key is not configured");

  console.log(`[ARollTools] Polling status for video: ${args.videoId}`);
  
  const maxAttempts = 60; // 10 minutes with 10s intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${args.videoId}`, {
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': apiKey,
      },
    });
    
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || data.message || "Failed to check Heygen status");

    const status = data.data.status;
    console.log(`[ARollTools] Video ${args.videoId} status: ${status} (Attempt ${attempts}/${maxAttempts})`);

    if (status === "completed") {
      return {
        status: "success",
        videoUrl: data.data.video_url,
        duration: data.data.duration
      };
    }

    if (status === "failed") {
      throw new Error(`Heygen video generation failed: ${data.data.error || "Unknown error"}`);
    }

    // Wait 10 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  throw new Error("Heygen video generation timed out");
}

