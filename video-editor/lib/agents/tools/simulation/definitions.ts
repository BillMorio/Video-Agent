import { ChatCompletionTool } from "openai/resources/chat/completions";

/**
 * Simulates a delay for agent processing.
 */
export const waitForProcessing = async (seconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

/**
 * Common Tool Definitions (Metadata for OpenAI)
 */
export const SIMULATED_TOOLS: ChatCompletionTool[] = [
  // --- ARoll specialist tools ---
  {
    type: "function",
    function: {
      name: "trim_audio_segment",
      description: "Trims a specific segment of audio from the master audio for avatar generation.",
      parameters: {
        type: "object",
        properties: { seconds: { type: "number", default: 3 } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_avatar_lipsync",
      description: "Generates high-fidelity lip-sync video for the AI avatar.",
      parameters: {
        type: "object",
        properties: { seconds: { type: "number", default: 8 } },
      },
    },
  },
  // --- BRoll specialist tools ---
  {
    type: "function",
    function: {
      name: "search_pexels_library",
      description: "Searches for high-quality stock footage based on a query.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          seconds: { type: "number", default: 2 }
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "trim_stock_footage",
      description: "Trims stock footage to match the scene duration and applies cropping.",
      parameters: {
        type: "object",
        properties: { seconds: { type: "number", default: 4 } },
      },
    },
  },
  // --- Image/Graphics specialist tools ---
  {
    type: "function",
    function: {
      name: "generate_sdxl_visual",
      description: "Generates a static background image or graphics plate using SDXL.",
      parameters: {
        type: "object",
        properties: {
          prompt: { type: "string" },
          seconds: { type: "number", default: 5 }
        },
        required: ["prompt"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "apply_text_branding",
      description: "Adds titles, logos, and technical branding to a scene.",
      parameters: {
        type: "object",
        properties: { seconds: { type: "number", default: 2 } },
      },
    },
  },
  // --- Motion specialist tools ---
  {
    type: "function",
    function: {
      name: "render_motion_sequence",
      description: "Renders complex dynamic motion graphics and overlays.",
      parameters: {
        type: "object",
        properties: { seconds: { type: "number", default: 7 } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "composite_ffmpeg_layer",
      description: "Uses FFmpeg to composite multiple video layers into a final output.",
      parameters: {
        type: "object",
        properties: { seconds: { type: "number", default: 5 } },
      },
    },
  },
];
