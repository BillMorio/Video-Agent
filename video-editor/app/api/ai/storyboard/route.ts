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
    const { script, allowedVisualTypes = ["a-roll", "b-roll", "graphics", "image"] } = await req.json();

    if (!script) {
      return NextResponse.json({ error: "Script is required" }, { status: 400 });
    }

    const visualTypesList = allowedVisualTypes.join(", ");

    const systemPrompt = `You are an expert video director and storyboard artist.
    Your task is to take a video script and segment it into a professional video storyboard.
    
    CRITICAL CONSTRAINT: You MUST estimate the 'startTime' and 'endTime' for each scene based on the length of the script segment.
    Assume a professional speaking rate of 130 words per minute (approximately 2.1 words per second).
    
    SEQUENTIAL CONTINUITY:
    - Scene 1 MUST start at 0.0.
    - Every subsequent Scene n MUST have its 'startTime' exactly matching Scene n-1's 'endTime'.
    - Your scenes must cover the entire script.
    
    VISUAL TYPES ALLOWED: [${visualTypesList}].
    
    SCENE DURATION LIMITS:
    - a-roll: Max 4s.
    - b-roll: 3s - 8s.
    - image: 3s - 10s.
    - graphics: 3s - 15s.
    
    DIRECTOR NOTES:
    Must be specific, actionable, and describe the tone and visual intent.
    
    TRANSITION RULES:
    - Use 'light-leak' ONLY when moving from 'a-roll' to 'b-roll', 'image', or 'graphics'.
    - Use 'fade' or 'none' for others.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { 
          role: "user", 
          content: `Segment this script into a storyboard:
          
          Script: ${script}` 
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
                        enum: allowedVisualTypes
                    },
                    aRoll: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        avatarId: { type: "string" },
                        provider: { type: "string" },
                        scale: { type: "number" },
                        kenBurns: {
                          type: "object",
                          properties: {
                            enabled: { type: "boolean" },
                            zoomType: { type: "string", enum: ["in", "out"] }
                          }
                        }
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
                        type: { type: "string" },
                        duration: { type: "number" }
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
    if (!toolUse) throw new Error("AI failed to generate storyboard");

    return NextResponse.json(toolUse.input);

  } catch (error: any) {
    console.error("[Storyboard Generation Error]", error);
    return NextResponse.json({ error: error.message || "Failed to generate storyboard" }, { status: 500 });
  }
}
