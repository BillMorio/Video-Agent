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
  apiKey?: string;
}

export interface GenerateWavespeedVideoArgs {
  audioUrl: string;
  imageUrl: string;
  resolution?: string;
  seed?: number;
  apiKey?: string;
}

export interface PollHeygenStatusArgs {
  videoId: string;
  apiKey?: string;
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
 * Initiates video generation on Wavespeed AI (InfiniteTalk).
 */
export async function generate_wavespeed_avatar_video(args: GenerateWavespeedVideoArgs) {
  const apiKey = args.apiKey || process.env.WAVESPEED_API_KEY;
  if (!apiKey) throw new Error("WAVESPEED_API_KEY is not configured");

  console.log(`[ARollTools] Initiating Wavespeed generation with audio: ${args.audioUrl.substring(0, 50)}...`);

  const payload = {
    audio: args.audioUrl,
    image: args.imageUrl,
    resolution: args.resolution || "720p",
    seed: args.seed || -1
  };

  const fetchResponse = await fetch("https://api.wavespeed.ai/api/v3/wavespeed-ai/infinitetalk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload),
  });

  const rawGenText = await fetchResponse.text();
  console.log(`\n--- [ARollTools] Wavespeed Generate RAW ---`);
  console.log(rawGenText);
  console.log(`--- [ARollTools] RAW END ---\n`);

  let data;
  try {
    const fBrace = rawGenText.indexOf('{');
    const lBrace = rawGenText.lastIndexOf('}');
    if (fBrace !== -1 && lBrace !== -1 && lBrace > fBrace) {
      data = JSON.parse(rawGenText.substring(fBrace, lBrace + 1));
    } else {
      data = JSON.parse(rawGenText);
    }
    console.log(`[ARollTools] Parsed Gen Result:`, JSON.stringify(data, null, 2));
  } catch (e: any) {
    throw new Error(`Wavespeed Gen Parse Failure: ${e.message}. Raw: ${rawGenText.substring(0, 100)}`);
  }

  if (!fetchResponse.ok) throw new Error(data?.message || data?.error?.message || "Wavespeed video generation failed");

  // Extraction logic from documentation
  const genData = data.data || {};
  const videoUrl = genData.outputs?.[0] || data.video_url;
  const requestId = genData.id || data.request_id || data.id;

  if (videoUrl) {
    console.log(`[ARollTools] Generation complete immediately! URL: ${videoUrl}`);
    return {
      status: "success",
      videoUrl: videoUrl,
      requestId: requestId
    };
  }

  if (!requestId) {
    throw new Error("Wavespeed API did not return a request ID or Video URL");
  }

  console.log(`[ARollTools] Polling for ID: ${requestId}...`);

  // Polling logic
  const maxAttempts = 50; 
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    const statusUrl = `https://api.wavespeed.ai/api/v3/predictions/${requestId}/result`;
    
    try {
      const statusRes = await fetch(statusUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
      });
      
      const rawStatusText = await statusRes.text();
      console.log(`\n--- [ARollTools] Poll Attempt ${attempts} RAW ---`);
      console.log(rawStatusText);
      console.log(`--- [ARollTools] END ---\n`);

      if (!rawStatusText || rawStatusText.trim() === "null") {
        console.log(`[ARollTools] Received null status, retrying in 5s...`);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      let result;
      try {
        const firstB = rawStatusText.indexOf('{');
        const lastB = rawStatusText.lastIndexOf('}');
        if (firstB !== -1 && lastB !== -1 && lastB > firstB) {
          result = JSON.parse(rawStatusText.substring(firstB, lastB + 1));
        } else {
          result = JSON.parse(rawStatusText);
        }
        console.log(`[ARollTools] Parsed Poll Result:`, JSON.stringify(result, null, 2));
      } catch (e) {
        console.error(`[ARollTools] Poll Parse Error. Raw: ${rawStatusText.substring(0, 50)}...`);
        await new Promise(r => setTimeout(r, 5000));
        continue; 
      }

      const statusData = result.data || {};
      const status = statusData.status || result.status;
      const outputs = statusData.outputs;
      const finalUrl = Array.isArray(outputs) ? outputs[0] : (typeof outputs === 'string' ? outputs : null);

      console.log(`[ARollTools] Video ${requestId} status: ${status || 'unknown'} (Attempt ${attempts}/${maxAttempts})`);

      if (status === "completed" || status === "success" || finalUrl) {
        if (finalUrl) {
          return {
            status: "success",
            requestId: requestId,
            videoUrl: finalUrl
          };
        }
      }

      if (status === "failed" || status === "error") {
        throw new Error(`Wavespeed video generation failed: ${statusData.error || result.message || "Unknown error"}`);
      }
    } catch (pollErr: any) {
      console.error(`[ARollTools] Polling error on attempt ${attempts}:`, pollErr.message);
    }

    // Wait 10 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  throw new Error("Wavespeed video generation timed out");
}

/**
 * Initiates video generation on Heygen and polls until completion.
 * @deprecated Use generate_wavespeed_avatar_video for faster results
 */
export async function generate_heygen_avatar_video(args: GenerateHeygenVideoArgs) {
  const apiKey = args.apiKey || process.env.HEY_GEN_API;
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
  const apiKey = args.apiKey || process.env.HEY_GEN_API;
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


