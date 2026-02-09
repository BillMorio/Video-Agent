import { ChatCompletionTool } from "openai/resources/chat/completions";

/**
 * A-ROLL AGENT TOOL DEFINITIONS (Simulated/Production agnostic)
 */
export const A_ROLL_AGENT_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "cut_audio_segment",
      description: "Trims a specific segment of audio from the master audio and uploads it to Supabase for a public URL.",
      parameters: {
        type: "object",
        properties: {
          audioUrl: { type: "string", description: "The source master audio URL" },
          start: { type: "string", description: "The start timestamp in seconds (e.g., '10.5')" },
          duration: { type: "number", description: "The duration of the segment in seconds" }
        },
        required: ["audioUrl", "start", "duration"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_heygen_avatar_video",
      description: "Initiates video generation on Heygen and waits until the process is complete (polls every 10s). Returns the final video URL.",
      parameters: {
        type: "object",
        properties: {
          audioUrl: { type: "string", description: "Publicly accessible URL of the vocal segment (Supabase URL)" },
          avatarId: { type: "string", description: "The ID of the avatar to use" },
          caption: { type: "boolean", description: "Whether to enable auto-captions" },
          scale: { type: "number", description: "Video scale/framing (1.0 to 2.0)" }
        },
        required: ["audioUrl", "avatarId"]
      }
    }
  }
];
