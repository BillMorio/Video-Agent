import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get("photo_id");

    if (!photoId) {
      return NextResponse.json(
        { error: "photo_id parameter is required" },
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

    // Poll Heygen API for status
    const response = await fetch(`https://api.heygen.com/v2/photo_avatar/generation/${photoId}`, {
      method: "GET",
      headers: {
        "accept": "application/json",
        "x-api-key": apiKey
      }
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Heygen Photo Avatar] Status check failed:", response.status, errorText);
      return NextResponse.json(
        { error: `Heygen API error (${response.status}): ${errorText.substring(0, 100)}` },
        { status: response.status }
      );
    }

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("[Heygen Photo Avatar] Non-JSON response:", text);
      return NextResponse.json(
        { error: "Heygen API returned non-JSON response" },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("[Heygen Photo Avatar] Status error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
