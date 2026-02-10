import { NextRequest, NextResponse } from "next/server";
import { memoryService } from "@/lib/services/api/memory-service";
import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_TRANSCRIPT_TO_SCENES_PROMPT } from "@/lib/agents/tools/production/prompts";

export async function POST(req: NextRequest) {
  const anthropicApiKey = process.env.ANTHROPIC_API;

  if (!anthropicApiKey) {
    return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
  }

  const anthropic = new Anthropic({ apiKey: anthropicApiKey });

  try {
    const { transcription, allowedVisualTypes, projectId } = await req.json();

    if (!transcription || !transcription.text) {
      return NextResponse.json({ error: "Invalid transcription data" }, { status: 400 });
    }

    // Fetch custom prompts if projectId is provided
    let defaultSystemPrompt = DEFAULT_TRANSCRIPT_TO_SCENES_PROMPT;
    if (projectId) {
        try {
            const memory = await memoryService.getByProjectId(projectId);
            if (memory?.metadata?.config?.transcript_to_scenes_prompt) {
                defaultSystemPrompt = memory.metadata.config.transcript_to_scenes_prompt;
                console.log(`[Scenes API] Using custom system prompt for project ${projectId}`);
            }
        } catch (e) {
            console.warn(`[Scenes API] Failed to fetch project memory for ${projectId}:`, e);
        }
    }

    const visualTypesList = allowedVisualTypes && allowedVisualTypes.length > 0 
      ? allowedVisualTypes.join(", ") 
      : "a-roll, b-roll, graphics, image";

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: defaultSystemPrompt,
      messages: [
        { 
          role: "user", 
          content: `Segment this transcript into a professional video storyboard.
          
          CRITICAL CONSTRAINT: You MUST ONLY use the following visual types for this storyboard: [${visualTypesList}]. DO NOT use any other types.
          
          Input: ${JSON.stringify(transcription.text)}
          Timestamps: ${JSON.stringify(transcription.words)}` 
        }
      ],
      tools: [
        {
          name: "generate_storyboard",
          description: "Generate a structured storyboard project with sequential scenes.",
          input_schema: {
            type: "object",
            properties: {
              project: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  totalDuration: { type: "number" }
                },
                required: ["title", "totalDuration"]
              },
              scenes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    index: { type: "integer" },
                    startTime: { type: "number" },
                    endTime: { type: "number" },
                    duration: { type: "number" },
                    script: { type: "string" },
                    directorNote: { type: "string" },
                    visualType: { 
                        type: "string", 
                        enum: allowedVisualTypes && allowedVisualTypes.length > 0 ? allowedVisualTypes : ["a-roll", "b-roll", "graphics", "image"],
                        description: `The visual format. For this project, only these are allowed: ${visualTypesList}`
                    },
                    aRoll: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        avatarId: { type: "string" },
                        provider: { type: "string" },
                        scale: { type: "number", description: "Video scale/framing (1.0 to 2.0)" }
                      }
                    },
                    bRoll: {
                      type: "object",
                      properties: {
                        searchQuery: { type: "string" }
                      }
                    },
                    graphics: {
                      type: "object",
                      properties: {
                        prompt: { type: "string" }
                      }
                    },
                    image: {
                      type: "object",
                      properties: {
                        searchQuery: { type: "string" }
                      }
                    },
                    transition: {
                      type: "object",
                      properties: {
                        type: { 
                          type: "string", 
                          enum: ["fade", "crossfade", "wipe", "dissolve", "light-leak", "none"],
                          description: "The transition to use when moving to the NEXT scene. Use 'light-leak' ONLY when moving from a-roll to b-roll, image, or graphics."
                        },
                        duration: { type: "number", default: 0.8 }
                      }
                    }
                  },
                  required: ["index", "startTime", "endTime", "duration", "script", "visualType"]
                }
              }
            },
            required: ["project", "scenes"]
          }
        }
      ],
      tool_choice: { type: "tool", name: "generate_storyboard" }
    });

    const toolUse = response.content.find(c => c.type === "tool_use");
    if (!toolUse || toolUse.name !== "generate_storyboard") {
      throw new Error("Claude failed to generate a valid storyboard tool call");
    }

    const storyboard = (toolUse.input as any);
    
    // Apply Mid-Silence Snapping to resolve bleeding voice overs
    const snappedStoryboard = snapStoryboardToSilence(storyboard, transcription.words);

    return NextResponse.json(snappedStoryboard);

  } catch (error: any) {
    console.error("[Scene Generation Error]", error);
    return NextResponse.json({ error: error.message || "Failed to generate scenes" }, { status: 500 });
  }
}

/**
 * Snaps scene boundaries to the midpoint of the silence gap between words
 * to prevent cut-off words and bleeding audio.
 */
function snapStoryboardToSilence(storyboard: any, whisperWords: any[]) {
  if (!storyboard.scenes || storyboard.scenes.length <= 1 || !whisperWords || whisperWords.length === 0) {
    return storyboard;
  }

  const scenes = storyboard.scenes;

  for (let i = 0; i < scenes.length - 1; i++) {
    const currentScene = scenes[i];
    const nextScene = scenes[i + 1];

    // 1. Find the word that corresponds to the end of the current scene
    // We use a small epsilon to catch words that end exactly at the boundary
    const boundaryWordIndex = whisperWords.findIndex(w => w.end >= currentScene.endTime - 0.01);
    
    if (boundaryWordIndex !== -1 && boundaryWordIndex < whisperWords.length - 1) {
      const currentWordEnd = whisperWords[boundaryWordIndex].end;
      const nextWordStart = whisperWords[boundaryWordIndex + 1].start;
      
      // 2. Calculate the silence gap
      const gap = nextWordStart - currentWordEnd;
      
      // 3. Snap to midpoint if there is a gap, otherwise at least stay at the word end
      const snapPoint = gap > 0 
        ? currentWordEnd + (gap / 2) 
        : currentWordEnd;

      console.log(`[Snapping] Scene ${currentScene.index} | Original: ${currentScene.endTime.toFixed(3)} | Snapped: ${snapPoint.toFixed(3)} (Gap: ${gap.toFixed(3)}s)`);

      // 4. Update scene boundaries
      currentScene.endTime = snapPoint;
      nextScene.startTime = snapPoint;
      
      // 5. Recalculate durations to maintain precision
      currentScene.duration = currentScene.endTime - currentScene.startTime;
      nextScene.duration = nextScene.endTime - nextScene.startTime;
    }
  }

  return storyboard;
}
