import { ChatCompletionTool } from "openai/resources/chat/completions";

/**
 * MOTION GRAPHIC AGENT TOOL DEFINITIONS (Production)
 */
export const MOTION_GRAPHIC_AGENT_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "generate_google_video",
      description: "Generates a cinematic motion graphic or video clip using Google Veo 3.1. High-end temporal synthesis for backgrounds or complex visuals.",
      parameters: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "The detailed prompt for video generation" },
          aspectRatio: { type: "string", enum: ["16:9", "9:16", "1:1"], default: "16:9" }
        },
        required: ["prompt"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "cut_audio_segment",
      description: "Trims a specific segment of audio from the master audio for scene alignment.",
      parameters: {
        type: "object",
        properties: {
          audioUrl: { type: "string", description: "The source master audio URL" },
          start: { type: "string", description: "Start time in seconds" },
          duration: { type: "number", description: "Duration in seconds" }
        },
        required: ["audioUrl", "start", "duration"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "composite_ffmpeg_layer",
      description: "Uses FFmpeg to composite generated motion graphics with other scene elements.",
      parameters: {
        type: "object",
        properties: {
          videoUrl: { type: "string", description: "Primary video URL" },
          overlayUrl: { type: "string", description: "Overlay asset URL" }
        },
        required: ["videoUrl"]
      }
    }
  }
];
