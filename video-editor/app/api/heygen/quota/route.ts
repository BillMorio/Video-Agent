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
    const response = await fetch('https://api.heygen.com/v2/user/remaining_quota', {
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
    console.error('Error fetching Heygen quota:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
