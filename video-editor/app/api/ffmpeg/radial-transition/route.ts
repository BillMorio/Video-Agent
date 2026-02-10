import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const nodeUrl = "http://localhost:3333/api/radial-transition";
  try {
    const formData = await req.formData();
    const response = await fetch(nodeUrl, { method: "POST", body: formData });
    const data = await response.json();
    return response.ok ? NextResponse.json(data) : NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json({ error: 'FFmpeg Node unreachable', details: err.message }, { status: 500 });
  }
}
