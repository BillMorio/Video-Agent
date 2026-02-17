import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { settingsService } from "@/lib/services/api/settings-service";

export async function POST(req: NextRequest) {
  const anthropicApiKey = await settingsService.getSetting('anthropic_api_key') || process.env.ANTHROPIC_API;

  if (!anthropicApiKey) {
    return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
  }

  const anthropic = new Anthropic({ apiKey: anthropicApiKey });

  try {
    const { prompt, tone = "professional", targetDuration = 60 } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const systemPrompt = `You are an expert video scriptwriter and content strategist. 
    Your goal is to write a compelling, cinematic narration script based on a user's prompt.
    
    GUIDELINES:
    - Tone: ${tone}.
    - Target Duration: Approximately ${targetDuration} seconds.
    - Style: Professional, engaging, and high-fidelity.
    - Format: Return ONLY the script text. Do not include any meta-commentary, scene descriptions, or titles. Just the narration.
    - Length: Use a standard speaking rate of ~130 words per minute to estimate length. For ${targetDuration}s, aim for approximately ${Math.round((targetDuration / 60) * 130)} words.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { 
          role: "user", 
          content: `Write a video script for: ${prompt}`
        }
      ],
    });

    const scriptText = response.content[0].type === 'text' ? response.content[0].text : "";

    return NextResponse.json({ 
      success: true, 
      script: scriptText 
    });

  } catch (error: any) {
    console.error("[Script Generation Error]", error);
    return NextResponse.json({ error: error.message || "Failed to generate script" }, { status: 500 });
  }
}
