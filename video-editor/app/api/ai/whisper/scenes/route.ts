import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API;

  if (!apiKey) {
    return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const { transcription, allowedVisualTypes } = await req.json();

    if (!transcription || !transcription.text) {
      return NextResponse.json({ error: "Invalid transcription data" }, { status: 400 });
    }

    const visualTypesList = allowedVisualTypes && allowedVisualTypes.length > 0 
      ? allowedVisualTypes.join(", ") 
      : "a-roll, b-roll, graphics, image";

    const systemPrompt = `You are an expert video director and storyboard artist.
Your task is to take a transcript with word-level timestamps and segment it into logical video scenes.

CRITICAL REQUIREMENT: SEQUENTIAL CONTINUITY
Your scenes MUST be perfectly sequential and cover the entire duration of the transcript without gaps or overlaps.
- Scene 1 MUST start at the offset of the first word (usually 0.0).
- Every subsequent Scene n MUST have its 'startTime' exactly matching Scene n-1's 'endTime'.
- Failure to maintain sequential timestamps (e.g., resetting to 0.0 for every scene) is UNACCEPTABLE.

RESTRICTION:
You ONLY use the following visual types: [${visualTypesList}].
If only "a-roll" is selected, the entire video should be one or more segments of "a-roll".

TECHNICAL REQUIREMENTS:
- startTime and endTime must exactly match the word-level timestamps provided.
  - a-roll: Used for host explanation. Provide 'avatarId' (e.g., "avatar_host_01") and a 'scale' (numeric, between 1.0 and 2.0).
    * Choose a scale of 1.0 for standard medium shots.
    * Choose a scale up to 2.0 (e.g., 1.5, 1.8) for close-ups or more intense/intimate moments.
  - b-roll: Used for b-roll footage. You MUST provide a highly descriptive 'searchQuery' (e.g., "closeup of developer typing on mechanical keyboard with blue neon lighting").
  - graphics: Used for text overlays. Provide a 'prompt' describing the animation.
  - image: Used for statics. Provide a 'searchQuery'.
  
TRANSITION RULES:
1. Every scene has a 'transition' object describing how it moves to the NEXT scene.
2. Default transition should be 'fade' or 'none'.
3. SPECIAL RULE: You MUST use 'light-leak' as the transition type ONLY when a scene of type 'a-roll' is followed by a scene of type 'b-roll', 'image', or 'graphics'. 
4. Do NOT use 'light-leak' for any other transitions.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { 
          role: "user", 
          content: `Segment this transcript into a professional video storyboard.
          
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
                    visualType: { type: "string", enum: ["a-roll", "b-roll", "graphics", "image"] },
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
