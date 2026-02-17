import { ChatCompletionTool } from "openai/resources/chat/completions";

/**
 * IMAGE AGENT TOOL DEFINITIONS (Production)
 */
export const IMAGE_AGENT_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "generate_visual_prompt",
      description: "Generates a highly detailed, tech-optimized image generation prompt from a script segment and project context.",
      parameters: {
        type: "object",
        properties: {
          scriptSegment: { type: "string", description: "The specific portion of the script for this scene" },
          context: { type: "string", description: "Additional scene context or visual style requirements" }
        },
        required: ["scriptSegment"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_google_image",
      description: "Generates high-fidelity imagery using Google Imagen (via Gemini 2.0). Optimized for cinematic tech aesthetics.",
      parameters: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "The detailed prompt for image generation" },
          style: { type: "string", description: "Optional style descriptor (e.g. 'cinematic', '3d render')" }
        },
        required: ["prompt"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "cut_audio_segment",
      description: "Trims a specific segment of audio from the master audio and uploads it to Supabase.",
      parameters: {
        type: "object",
        properties: {
          audioUrl: { type: "string", description: "The source master audio URL" },
          start: { type: "string", description: "Start time in seconds (e.g., '10.5')" },
          duration: { type: "number", description: "Duration in seconds" }
        },
        required: ["audioUrl", "start", "duration"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_ken_burns_video",
      description: "Combines a static image and an audio segment into a cinematic zooming video (Ken Burns effect).",
      parameters: {
        type: "object",
        properties: {
          imageUrl: { type: "string", description: "Publicly accessible URL of the static image" },
          audioUrl: { type: "string", description: "Publicly accessible URL of the audio segment" },
          zoomType: { type: "string", enum: ["in", "out", "pan"], default: "in", description: "Type of zoom effect: 'in' for emphasis, 'out' for reveal, 'pan' for subtle movement" }
        },
        required: ["imageUrl", "audioUrl"]
      }
    }
  }
];
