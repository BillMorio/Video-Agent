import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      age,
      gender,
      ethnicity,
      orientation,
      pose,
      style,
      appearance,
      callback_url,
      callback_id
    } = body;

    // Validate required fields
    if (!name || !age || !gender || !ethnicity || !orientation || !pose || !style || !appearance) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate appearance length
    if (appearance.length > 1000) {
      return NextResponse.json(
        { error: "Appearance description must be 1000 characters or less" },
        { status: 400 }
      );
    }

    const apiKey = process.env.HEY_GEN_API;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Heygen API key not configured" },
        { status: 500 }
      );
    }

    // Call Heygen API
    const response = await fetch("https://api.heygen.com/v2/photo_avatar/photo/generate", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        name,
        age,
        gender,
        ethnicity,
        orientation,
        pose,
        style,
        appearance,
        ...(callback_url && { callback_url }),
        ...(callback_id && { callback_id })
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Heygen Photo Avatar] Generation failed:", data);
      return NextResponse.json(
        { error: data.error || "Photo avatar generation failed" },
        { status: response.status }
      );
    }

    console.log("[Heygen Photo Avatar] Generation initiated:", data);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("[Heygen Photo Avatar] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
