import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const apiKey = process.env.WAVESPEED_API_KEY;
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('id');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'WAVESPEED_API_KEY is not configured' }, 
      { status: 500 }
    );
  }

  if (!taskId) {
    return NextResponse.json(
      { error: 'id (Task ID) is required' }, 
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://api.wavespeed.ai/api/v3/predictions/${taskId}/result`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const rawText = await response.text();
    console.log(`\n--- [Wavespeed Status API] RAW RESPONSE for ${taskId} START ---`);
    console.log(rawText);
    console.log(`--- [Wavespeed Status API] RAW RESPONSE END ---\n`);

    if (!rawText || rawText.trim() === "null") {
       return NextResponse.json({ status: 'created', message: 'Task initializing (received null)' });
    }

    let result;
    try {
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        result = JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
      } else {
        result = JSON.parse(rawText);
      }
      console.log(`[Wavespeed Status API] PARSED RESULT:`, JSON.stringify(result, null, 2));
    } catch (parseErr: any) {
      console.error(`[Wavespeed Status API] PARSE ERROR: ${parseErr.message}`);
      return NextResponse.json(
        { error: `JSON extraction failed: ${parseErr.message}`, raw: rawText }, 
        { status: 500 }
      );
    }

    const statusData = result.data || {};
    const status = statusData.status || result.status;
    const outputs = statusData.outputs || result.outputs; 

    if (!response.ok) {
      return NextResponse.json(
        { error: result.message || statusData.error || 'Wavespeed API error', raw: rawText.substring(0, 200) }, 
        { status: response.status }
      );
    }

    return NextResponse.json({
      status: status,
      video_url: Array.isArray(outputs) ? outputs[0] : outputs,
      data: statusData
    });
  } catch (error: any) {
    console.error('Error fetching Wavespeed video status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
