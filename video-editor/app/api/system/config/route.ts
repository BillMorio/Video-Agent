import { NextResponse } from "next/server";
import { DEFAULT_TRANSCRIPT_TO_SCENES_PROMPT, DEFAULT_VISUAL_PROMPT_ENGINEER_PROMPT } from "@/lib/agents/tools/production/prompts";
import { settingsService } from "@/lib/services/api/settings-service";

export async function GET() {
  // Fetch global settings status
  const globalSettings = await settingsService.getAllSettings();
  
  return NextResponse.json({
    prompts: {
      transcript_to_scenes: globalSettings.prompt_script_to_scene || DEFAULT_TRANSCRIPT_TO_SCENES_PROMPT,
      visual_prompt_engineer: globalSettings.prompt_image_agent || DEFAULT_VISUAL_PROMPT_ENGINEER_PROMPT,
    },
    apiKeys: {
        WAVESPEED_API_KEY: !!process.env.WAVESPEED_API_KEY || !!globalSettings.wavespeed_api_key,
        HEY_GEN_API: !!process.env.HEY_GEN_API || !!globalSettings.heygen_api_key,
        ANTHROPIC_API: !!process.env.ANTHROPIC_API || !!globalSettings.anthropic_api_key,
        PEXELS_API_KEY: !!process.env.PEXELS_API_KEY || !!globalSettings.pexels_api_key,
        ELEVENLABS_API_KEY: !!process.env.ELEVENLABS_API_KEY,
        OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
        FFMPEG_SERVER_URL: process.env.FFMPEG_SERVER_URL || "http://localhost:3333"
    }
  });
}
