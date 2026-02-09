import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const FFMPEG_SERVER = "http://localhost:3333";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const { messages, tools_enabled = true } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const tools: OpenAI.Chat.ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "probe_audio",
          description: "Get metadata for an audio file (duration, codec, bitrate).",
          parameters: {
            type: "object",
            properties: {
              filename: { type: "string", description: "The server-side filename (e.g., 170000000-sample.mp3)" },
            },
            required: ["filename"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "trim_audio",
          description: "Extract a segment from an audio file.",
          parameters: {
            type: "object",
            properties: {
              filename: { type: "string", description: "The server-side filename." },
              start: { type: "string", description: "Start time in seconds (e.g., '1.500')" },
              duration: { type: "string", description: "Duration in seconds (e.g., '5.000')" },
            },
            required: ["filename", "start", "duration"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "concat_audio",
          description: "Combine multiple audio files into one.",
          parameters: {
            type: "object",
            properties: {
              filenames: { 
                type: "array", 
                items: { type: "string" },
                description: "Array of server-side filenames to join." 
              },
            },
            required: ["filenames"],
          },
        },
      }
    ];

    const systemPrompt = `You are the "Sonic Architect", a premium AI agent specialized in audio manipulation.
          You help users operate the FFmpeg Playground through natural language.
          
          CAPABILITIES:
          - Extract segments (trim).
          - Combine files (concat).
          - Analyze files (probe).
          
          CONTEXT:
          - When a user uploads a file, the frontend provides the 'filename' in the background context.
          - You must use these filenames to execute operations.
          - Always explain what you are doing in a premium, technical, yet helpful tone.
          - If an operation produces an output, inform the user about the result.
          
          GUIDELINES:
          - Prefer high precision (milliseconds).
          - Provide descriptive feedback about tool status.
          - If a tool call is successful, confirm the result and mention that the player/asset is ready.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages.map(m => ({
          role: m.role,
          content: m.content || "",
          ...(m.tool_calls && { tool_calls: m.tool_calls })
        })),
      ],
      tools: tools_enabled ? tools : undefined,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;

    // Handle tool calls
    if (message.tool_calls) {
      const toolResults = [];
      
      for (const toolCall of message.tool_calls as any[]) {
        const name = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        console.log(`[Agent] Calling tool: ${name}`, args);
        
        let result;
        try {
          if (name === "probe_audio") {
             const res = await fetch(`${FFMPEG_SERVER}/api/agent/probe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: args.filename })
             });
             result = await res.json();
          } else if (name === "trim_audio") {
             const res = await fetch(`${FFMPEG_SERVER}/api/agent/trim`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    filename: args.filename, 
                    start: args.start, 
                    duration: args.duration 
                })
             });
             result = await res.json();
          } else if (name === "concat_audio") {
             const res = await fetch(`${FFMPEG_SERVER}/api/agent/concat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filenames: args.filenames })
             });
             result = await res.json();
          }
        } catch (err) {
          console.error(`[Agent] Tool execution failed (${name}):`, err);
          result = { error: String(err) };
        }
        
        console.log(`[Agent] Tool result (${name}):`, result);
        
        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name,
          content: JSON.stringify(result),
        });
      }

      // Final completion with tool results
      const finalResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
           { 
             role: "system", 
             content: systemPrompt + "\n\nCRITICAL: If the tool result indicates 'success: true', you MUST confirm that the operation was successful. DO NOT apologize or mention glitches if the data shows success." 
           },
           ...messages.map(m => ({
             role: m.role,
             content: m.content || "",
             ...(m.tool_calls && { tool_calls: m.tool_calls })
           })),
           message,
           ...toolResults as any[]
        ]
      });

      return NextResponse.json({ 
        message: finalResponse.choices[0].message,
        operation_details: toolResults 
      });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("[Agent Error]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
