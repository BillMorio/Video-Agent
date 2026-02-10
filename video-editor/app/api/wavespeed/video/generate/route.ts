import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.WAVESPEED_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'WAVESPEED_API_KEY is not configured' }, 
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    
    // Default values if not provided
    const payload = {
      audio: body.audio,
      image: body.image,
      resolution: body.resolution || "480p",
      seed: body.seed || -1
    };

    const response = await fetch('https://api.wavespeed.ai/api/v3/wavespeed-ai/infinitetalk', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    console.log(`\n--- [Wavespeed Generate API] RAW RESPONSE START ---`);
    console.log(rawText);
    console.log(`--- [Wavespeed Generate API] RAW RESPONSE END ---\n`);

    if (!rawText || rawText.trim() === "null") {
       throw new Error("Wavespeed API returned empty or null response");
    }

    let data;
    try {
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        data = JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
      } else {
        data = JSON.parse(rawText);
      }
      console.log(`[Wavespeed Generate API] PARSED DATA:`, JSON.stringify(data, null, 2));
    } catch (parseErr: any) {
      console.error(`[Wavespeed Generate API] PARSE ERROR: ${parseErr.message}`);
      return NextResponse.json({ error: "Malformed JSON from API", raw: rawText }, { status: 500 });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error?.message || 'Wavespeed API error', raw: rawText }, 
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error generating Wavespeed video:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
