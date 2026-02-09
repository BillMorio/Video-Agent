import { NextResponse } from 'next/server';

export async function GET() {
  const nodeUrl = "http://localhost:3333/health";
  
  try {
    const startTime = Date.now();
    const response = await fetch(nodeUrl);
    const duration = Date.now() - startTime;
    const data = await response.text();

    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: `FFmpeg Node error: ${response.status}`,
        latency: `${duration}ms`,
        details: { raw: data }
      }, { status: response.status });
    }

    return NextResponse.json({
      status: 'success',
      message: 'FFmpeg Node healthy',
      latency: `${duration}ms`,
      details: {
        node_response: data,
        endpoint: nodeUrl
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: 'FFmpeg Node unreachable',
      error: err.message,
      tip: 'Ensure the FFmpeg backend is running on port 3333'
    }, { status: 500 });
  }
}
