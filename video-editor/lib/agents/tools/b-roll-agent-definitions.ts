import { ChatCompletionTool } from "openai/resources/chat/completions";

/**
 * B-Roll Specialist Tool Definitions (Metadata for OpenAI)
 */
export const BROLL_AGENT_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_pexels_library",
      description: "Searches for high-quality stock footage based on a query.",
      parameters: {
        type: "object",
        properties: {
          query: { 
            type: "string", 
            description: "The search term (e.g., 'cyberpunk city aerial view')" 
          },
          per_page: { 
            type: "number", 
            default: 5,
            description: "Number of clips to return a maximum of 10 is ideal" 
          },
          orientation: {
            type: "string",
            enum: ["landscape", "portrait", "square"],
            description: "The video orientation (should always use landscape for B-Roll)"
          },
          size: {
            type: "string",
            enum: ["large", "medium", "small"],
            description: "The video size/quality (should always use small/720p for fast processing)"
          }
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fit_stock_footage_to_duration",
      description: "Warps/Adjusts the speed of a stock footage clip to fit an exact target duration.",
      parameters: {
        type: "object",
        properties: {
          videoUrl: { 
            type: "string", 
            description: "The URL of the video to process (obtained from search or trim)" 
          },
          targetDuration: { 
            type: "number", 
            description: "The exact duration (in seconds) the clip must be adjusted to fit." 
          },
        },
        required: ["videoUrl", "targetDuration"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "trim_stock_footage",
      description: "Surgically cuts a segment of stock footage. Use this if the clip is significantly longer than the scene duration.",
      parameters: {
        type: "object",
        properties: {
          videoUrl: { 
            type: "string", 
            description: "The URL of the video to trim." 
          },
          start: { 
            type: "string", 
            description: "The start timestamp in HH:MM:SS format (e.g., '00:00:02')" 
          },
          duration: { 
            type: "number", 
            description: "The length of the segment to extract in seconds." 
          },
        },
        required: ["videoUrl", "start", "duration"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "trim_master_audio",
      description: "Extracts a specific audio segment from the project's master audio file based on scene timestamps.",
      parameters: {
        type: "object",
        properties: {
          audioUrl: { 
            type: "string", 
            description: "The URL of the master audio file." 
          },
          start: { 
            type: "string", 
            description: "The start timestamp in HH:MM:SS format." 
          },
          duration: { 
            type: "number", 
            description: "The length of the segment to extract in seconds." 
          },
        },
        required: ["audioUrl", "start", "duration"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "merge_audio_video",
      description: "Combines a processed video clip with a specific audio segment. Prioritizes audio duration.",
      parameters: {
        type: "object",
        properties: {
          videoUrl: { 
            type: "string", 
            description: "The URL of the processed video clip (fitted to duration)." 
          },
          audioUrl: { 
            type: "string", 
            description: "The URL of the trimmed audio segment." 
          },
        },
        required: ["videoUrl", "audioUrl"],
      },
    },
  },
];
