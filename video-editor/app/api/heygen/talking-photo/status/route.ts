import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.HEY_GEN_API;
  const { searchParams } = new URL(request.url);
  const photoId = searchParams.get('photo_id');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'HEY_GEN_API key is not configured' }, 
      { status: 500 }
    );
  }

  if (!photoId) {
    return NextResponse.json({ error: 'photo_id is required' }, { status: 400 });
  }

  try {
    // Heygen V2 Photo Avatar Status
    // Works for IDs from avatar_group/create or photo/generate
    const response = await fetch(`https://api.heygen.com/v2/photo_avatar/${photoId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-api-key': apiKey,
      },
    });

    const responseText = await response.text();
    console.log('[Heygen Talking Photo Status] Response:', response.status, responseText);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Heygen API error (${response.status}): ${responseText.substring(0, 200)}` }, 
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);
    // V2 detail returns { data: { status: "...", ... } }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error checking Heygen talking photo status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
