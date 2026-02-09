import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const nodeUrl = "http://localhost:3333/api/zoom-transition";
  
  try {
    const formData = await req.formData();
    
    const response = await fetch(nodeUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Proxy Error]', err);
    return NextResponse.json({
      error: 'FFmpeg Node unreachable',
      details: err.message
    }, { status: 500 });
  }
}
