import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { memoryService } from "@/lib/services/api/memory-service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    let apiKey = process.env.OPENAI_API_KEY;

    // Fetch custom prompts if projectId is provided
    if (projectId) {
        try {
            const memory = await memoryService.getByProjectId(projectId);
            if (memory?.metadata?.config?.api_keys?.OPENAI_API_KEY) {
                apiKey = memory.metadata.config.api_keys.OPENAI_API_KEY;
                console.log(`[Whisper API] Using custom OpenAI API key for project ${projectId}`);
            }
        } catch (e) {
            console.warn(`[Whisper API] Failed to fetch project memory for ${projectId}:`, e);
        }
    }

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    console.log(`[Whisper API] Processing file: ${file.name} (${file.size} bytes)`);

    // 1. Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("projects")
      .upload(`audio/${fileName}`, file);

    if (uploadError) {
      console.error("[Whisper Storage Error]", uploadError);
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from("projects")
      .getPublicUrl(`audio/${fileName}`);

    // 2. Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    return NextResponse.json({
      ...transcription,
      audioUrl: publicUrl
    });
  } catch (error: any) {
    console.error("[Whisper API Error]", error);
    return NextResponse.json({ 
      error: error.message || "Failed to transcribe audio",
      details: error.response?.data || null
    }, { status: 500 });
  }
}
