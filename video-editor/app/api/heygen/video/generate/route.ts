import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.HEY_GEN_API;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'HEY_GEN_API key is not configured' }, 
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || data.message || 'Heygen API error' }, 
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error generating Heygen video:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
