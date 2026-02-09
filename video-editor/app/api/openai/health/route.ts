import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPEN_AI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({
      status: 'error',
      message: 'OpenAI API key missing from environment',
      details: { key_configured: false }
    }, { status: 500 });
  }

  try {
    const startTime = Date.now();
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      }
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: `OpenAI API error: ${response.status}`,
        latency: `${duration}ms`,
        details: data
      }, { status: response.status });
    }

    return NextResponse.json({
      status: 'success',
      message: 'OpenAI connected successfully',
      latency: `${duration}ms`,
      details: {
        model_count: data.data?.length || 0,
        available_models: data.data?.slice(0, 5).map((m: any) => m.id) || [],
        raw_response: data
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to reach OpenAI',
      error: err.message
    }, { status: 500 });
  }
}
