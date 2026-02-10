import Anthropic from "@anthropic-ai/sdk";
import { uploadToSupabase } from "../../../storage";

export const FFMPEG_SERVER_URL = process.env.FFMPEG_SERVER_URL || "http://localhost:3333";

export interface GenerateVisualPromptArgs {
  scriptSegment: string;
  context?: string;
  customSystemPrompt?: string;
  anthropicApiKey?: string;
}

export interface GenerateWavespeedImageArgs {
  prompt: string;
  apiKey?: string;
  options?: {
    output_format?: string;
    enable_sync_mode?: boolean;
  };
}

export interface GenerateKenBurnsVideoArgs {
  imageUrl: string;
  audioUrl: string;
  zoomType?: 'in' | 'out';
}

import { DEFAULT_VISUAL_PROMPT_ENGINEER_PROMPT } from "./prompts";

/**
 * Uses Claude to generate a highly detailed, tech-optimized visual prompt.
 */
export async function generate_visual_prompt(args: GenerateVisualPromptArgs) {
  console.log(`[ImageTools] Generating visual prompt for script: "${args.scriptSegment.substring(0, 50)}..."`);
  
  const defaultSystemPrompt = DEFAULT_VISUAL_PROMPT_ENGINEER_PROMPT;

  const apiKey = args.anthropicApiKey || process.env.ANTHROPIC_API;
  if (!apiKey) throw new Error("Anthropic API key not configured");

  const anthropicClient = new Anthropic({ apiKey });

  const response = await anthropicClient.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: args.customSystemPrompt || defaultSystemPrompt,
    messages: [{ role: "user", content: `SCRIPT: "${args.scriptSegment}"\nCONTEXT: "${args.context || 'Premium tech video style'}"` }]
  });

  const promptText = (response.content[0] as any).text.trim().replace(/^"|"$/g, '');
  console.log(`[ImageTools] Generated Prompt: ${promptText}`);

  return {
    status: "success",
    prompt: promptText
  };
}

/**
 * Generates an image using Wavespeed Nano-Banana and polls for result.
 */
export async function generate_wavespeed_image(args: GenerateWavespeedImageArgs) {
  const apiKey = args.apiKey || process.env.WAVESPEED_API_KEY;
  if (!apiKey) throw new Error("WAVESPEED_API_KEY is not configured");

  console.log(`[ImageTools] Initiating Wavespeed image generation (Key: ${args.apiKey ? 'Project' : 'System'}): "${args.prompt.substring(0, 50)}..."`);

  const payload = {
    prompt: args.prompt,
    enable_base64_output: false,
    enable_sync_mode: args.options?.enable_sync_mode ?? false,
    output_format: args.options?.output_format ?? "png"
  };

  const response = await fetch("https://api.wavespeed.ai/api/v3/google/nano-banana/text-to-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  console.log(`\n--- [ImageTools] Wavespeed Image Gen RAW ---`);
  console.log(rawText);
  console.log(`--- [ImageTools] RAW END ---\n`);

  let data;
  try {
    const fBrace = rawText.indexOf('{');
    const lBrace = rawText.lastIndexOf('}');
    if (fBrace !== -1 && lBrace !== -1 && lBrace > fBrace) {
      data = JSON.parse(rawText.substring(fBrace, lBrace + 1));
    } else {
      data = JSON.parse(rawText);
    }
  } catch (e: any) {
    throw new Error(`Wavespeed Image Gen Parse Failure: ${e.message}. Raw: ${rawText.substring(0, 100)}`);
  }

  if (!response.ok) throw new Error(data?.message || data?.error?.message || "Wavespeed image generation failed");

  const genData = data.data || {};
  const immediateUrl = genData.outputs?.[0];
  const requestId = genData.id || data.id || data.request_id;

  if (immediateUrl) {
    console.log(`[ImageTools] Image complete immediately! URL: ${immediateUrl}`);
    return { status: "success", imageUrl: immediateUrl, requestId };
  }

  if (!requestId) {
    throw new Error("Wavespeed API did not return a request ID or Image URL");
  }

  console.log(`[ImageTools] Polling for ID: ${requestId}...`);

  // Polling logic
  const maxAttempts = 40; 
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    // Using the path-based polling endpoint confirmed for Wavespeed V3
    const statusUrl = `https://api.wavespeed.ai/api/v3/predictions/${requestId}/result`;
    
    try {
      const statusRes = await fetch(statusUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
      });
      
      const rawStatusText = await statusRes.text();
      
      if (!rawStatusText || rawStatusText.trim() === "null") {
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
      } catch (e) {
        await new Promise(r => setTimeout(r, 5000));
        continue; 
      }

      const statusData = result.data || {};
      const status = statusData.status || result.status;
      const outputs = statusData.outputs;
      const finalUrl = Array.isArray(outputs) ? outputs[0] : (typeof outputs === 'string' ? outputs : null);

      console.log(`[ImageTools] Image ${requestId} status: ${status || 'unknown'} (Attempt ${attempts}/${maxAttempts})`);

      if (status === "completed" || status === "success" || finalUrl) {
        if (finalUrl) {
          return {
            status: "success",
            requestId: requestId,
            imageUrl: finalUrl
          };
        }
      }

      if (status === "failed" || status === "error") {
        throw new Error(`Wavespeed image generation failed: ${statusData.error || result.message || "Unknown error"}`);
      }
    } catch (pollErr: any) {
      console.error(`[ImageTools] Polling error:`, pollErr.message);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  throw new Error("Wavespeed image generation timed out");
}

/**
 * Generates a Ken Burns effect video using FFmpeg server.
 */
export async function generate_ken_burns_video(args: GenerateKenBurnsVideoArgs) {
  console.log(`[ImageTools] Initiating Ken Burns: ${args.imageUrl.substring(0, 50)}...`);

  // 1. Download image and audio to blobs
  const [imgBlob, audioBlob] = await Promise.all([
    fetch(args.imageUrl).then(res => res.blob()),
    fetch(args.audioUrl).then(res => res.blob())
  ]);

  // 2. Upload to FFmpeg server
  const formData = new FormData();
  formData.append("image", imgBlob, "input.png");
  formData.append("audio", audioBlob, "input.mp3");
  formData.append("zoomType", args.zoomType || "in");

  const response = await fetch(`${FFMPEG_SERVER_URL}/api/ken-burns`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Ken Burns synthesis failed");

  console.log(`[ImageTools] Ken Burns complete! Public URL: ${data.publicUrl}`);

  return {
    status: "success",
    videoUrl: data.publicUrl
  };
}
