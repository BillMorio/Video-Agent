import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.PEXELS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "Pexels API key not configured. Add PEXELS_API_KEY to your .env file." },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const orientation = searchParams.get("orientation");
    const size = searchParams.get("size");
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "15";

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Build Pexels API URL
    const pexelsUrl = new URL("https://api.pexels.com/videos/search");
    pexelsUrl.searchParams.set("query", query);
    pexelsUrl.searchParams.set("page", page);
    pexelsUrl.searchParams.set("per_page", per_page);
    
    if (orientation) pexelsUrl.searchParams.set("orientation", orientation);
    if (size) pexelsUrl.searchParams.set("size", size);

    console.log("[Pexels API] Requesting:", pexelsUrl.toString());

    const response = await fetch(pexelsUrl.toString(), {
      headers: {
        "Authorization": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Pexels API] Error:", response.status, errorText);
      return NextResponse.json(
        { 
          error: `Pexels API error: ${response.status} ${response.statusText}`,
          details: errorText,
          statusCode: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[Pexels API] Success: Found", data.total_results, "results");
    
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("[Pexels API] Exception:", error);
    return NextResponse.json(
      { 
        error: "Failed to call Pexels API", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
