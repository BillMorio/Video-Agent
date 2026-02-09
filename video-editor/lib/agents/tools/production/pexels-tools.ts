/**
 * PRODUCTION PEXELS TOOLS
 * Uses the real Pexels API to search for high-quality stock footage.
 */

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export interface SearchPexelsArgs {
  query: string;
  per_page?: number;
  orientation?: "landscape" | "portrait" | "square";
  size?: "large" | "medium" | "small";
  targetDuration?: number; // Used for selecting the best match locally
}

/**
 * Searches the Pexels library for videos matching a query.
 */
export async function search_pexels_library(args: SearchPexelsArgs) {
  console.log(`[PexelsTool] Searching for "${args.query}" (Orientation: ${args.orientation || 'any'}, Size: ${args.size || 'any'})...`);

  if (!PEXELS_API_KEY) {
    return {
      status: "failed",
      error: "PEXELS_API_KEY is missing from environment variables."
    };
  }

  try {
    const params = new URLSearchParams({
      query: args.query,
      per_page: (args.per_page || 10).toString(),
    });

    if (args.orientation) params.append("orientation", args.orientation);
    if (args.size) params.append("size", args.size);

    const response = await fetch(
      `https://api.pexels.com/v1/videos/search?${params.toString()}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        status: "failed",
        error: data.error || "Failed to search Pexels API"
      };
    }

    if (!data.videos || data.videos.length === 0) {
      return {
        status: "failed",
        error: `No results found for query: ${args.query}`
      };
    }

    // LOCAL SELECTION LOGIC:
    // Pexels API doesn't support duration filtering directly.
    // We pick the video closest to the targetDuration if provided, otherwise the first one.
    let bestVideo = data.videos[0];
    if (args.targetDuration) {
      console.log(`[PexelsTool] Finding clip closest to target duration: ${args.targetDuration}s`);
      bestVideo = data.videos.reduce((prev: any, curr: any) => {
        return Math.abs(curr.duration - args.targetDuration!) < Math.abs(prev.duration - args.targetDuration!) 
          ? curr 
          : prev;
      });
    }
    
    // Find the original or a high-res link
    // For "small" (720p), we try to find a file matching that quality
    const videoFile = bestVideo.video_files.find((f: any) => f.quality === 'hd') || bestVideo.video_files[0];

    console.log(`[PexelsTool] Selected video: ${bestVideo.url} (Duration: ${bestVideo.duration}s)`);

    return {
      status: "success",
      videoUrl: videoFile.link,
      thumbnail: bestVideo.image,
      duration: bestVideo.duration,
      pexels_url: bestVideo.url,
      message: `Found premium footage for "${args.query}".`
    };
  } catch (error: any) {
    console.error("[PexelsTool] Error searching Pexels:", error);
    return {
      status: "failed",
      error: error.message || "Unknown error during Pexels search"
    };
  }
}
