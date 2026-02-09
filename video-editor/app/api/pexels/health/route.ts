import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.PEXELS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({
      status: 'error',
      message: 'Pexels API key missing from environment',
      details: { key_configured: false }
    }, { status: 500 });
  }

  try {
    const startTime = Date.now();
    // Use a very simple search query to minimize quota usage
    const response = await fetch("https://api.pexels.com/videos/search?query=nature&per_page=1", {
      headers: {
        "Authorization": apiKey,
      }
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: `Pexels API error: ${response.status}`,
        latency: `${duration}ms`,
        details: data
      }, { status: response.status });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Pexels connected successfully',
      latency: `${duration}ms`,
      details: {
        total_results: data.total_results,
        sample_video_url: data.videos?.[0]?.url,
        raw_response: data
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to reach Pexels',
      error: err.message
    }, { status: 500 });
  }
}
