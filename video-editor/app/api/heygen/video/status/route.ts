import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const apiKey = process.env.HEY_GEN_API;
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('video_id');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'HEY_GEN_API key is not configured' }, 
      { status: 500 }
    );
  }

  if (!videoId) {
    return NextResponse.json(
      { error: 'video_id is required' }, 
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-api-key': apiKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Heygen API error' }, 
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching Heygen video status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
