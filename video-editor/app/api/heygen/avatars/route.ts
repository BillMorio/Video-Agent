import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.HEY_GEN_API;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'HEY_GEN_API key is not configured' }, 
      { status: 500 }
    );
  }

  try {
    const response = await fetch('https://api.heygen.com/v2/avatars', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Heygen API error' }));
      return NextResponse.json(
        { error: errorData.message || 'Heygen API error' }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching Heygen avatars:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
