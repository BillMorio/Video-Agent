import { NextResponse } from "next/server";
import { DEFAULT_TRANSCRIPT_TO_SCENES_PROMPT, DEFAULT_VISUAL_PROMPT_ENGINEER_PROMPT } from "@/lib/agents/tools/production/prompts";

export async function GET() {
  // We return the actual default prompts
  // For API keys, we only return a "configured" status or the placeholder 
  // because we don't necessarily want to leak the backend .env to the browser 
  // unless we explicitly want them to be editable as defaults.
  // However, the user asked for the default values.
  
  return NextResponse.json({
    prompts: {
      transcript_to_scenes: DEFAULT_TRANSCRIPT_TO_SCENES_PROMPT,
      visual_prompt_engineer: DEFAULT_VISUAL_PROMPT_ENGINEER_PROMPT,
    },
    apiKeys: {
        WAVESPEED_API_KEY: !!process.env.WAVESPEED_API_KEY,
        HEY_GEN_API: !!process.env.HEY_GEN_API,
        ANTHROPIC_API: !!process.env.ANTHROPIC_API,
        PEXELS_API_KEY: !!process.env.PEXELS_API_KEY,
        ELEVENLABS_API_KEY: !!process.env.ELEVENLABS_API_KEY,
        OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
        FFMPEG_SERVER_URL: process.env.FFMPEG_SERVER_URL || "http://localhost:3333"
    }
  });
}
