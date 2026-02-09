"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Video, Search, Loader2, AlertCircle, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Status = "idle" | "loading" | "success" | "error";

interface PexelsVideo {
  id: number;
  url: string;
  image: string;
  duration: number;
  user: {
    name: string;
    url: string;
  };
  video_files: Array<{
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }>;
}

interface PexelsResponse {
  success?: boolean;
  videos?: PexelsVideo[];
  total_results?: number;
  page?: number;
  per_page?: number;
  url?: string;
  error?: string;
  details?: string;
  statusCode?: number;
}

const ORIENTATIONS = [
  { value: "", label: "Any" },
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait" },
  { value: "square", label: "Square" },
];

const SIZES = [
  { value: "", label: "Any" },
  { value: "large", label: "Large (4K)" },
  { value: "medium", label: "Medium (Full HD)" },
  { value: "small", label: "Small (HD)" },
];

const SAMPLE_QUERIES = [
  "Ocean waves",
  "City timelapse",
  "Nature forest",
  "Business meeting",
  "Cooking food",
  "Abstract technology",
];

export default function PexelsPlaygroundPage() {
  const [query, setQuery] = useState("");
  const [orientation, setOrientation] = useState("");
  const [size, setSize] = useState("");
  const [perPage, setPerPage] = useState("6");
  const [status, setStatus] = useState<Status>("idle");
  const [response, setResponse] = useState<PexelsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  const searchVideos = async () => {
    if (!query.trim()) return;
    
    setStatus("loading");
    setResponse(null);
    setError(null);
    setRawResponse(null);

    try {
      const params = new URLSearchParams({
        query: query.trim(),
        per_page: perPage,
      });
      
      if (orientation) params.set("orientation", orientation);
      if (size) params.set("size", size);

      const res = await fetch(`/api/pexels?${params.toString()}`);
      const data: PexelsResponse = await res.json();
      
      // Store raw response for debugging
      setRawResponse(JSON.stringify(data, null, 2));

      if (!res.ok || data.error) {
        setStatus("error");
        setError(data.error || `HTTP ${res.status}: ${res.statusText}`);
        if (data.details) {
          setError(`${data.error}\n\nDetails: ${data.details}`);
        }
        return;
      }

      setStatus("success");
      setResponse(data);
    } catch (err) {
      setStatus("error");
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Network error: ${errorMessage}`);
      setRawResponse(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchVideos();
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/playground" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Video className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Pexels Video Search</h1>
            <p className="text-xs text-muted-foreground technical-label uppercase tracking-widest">
              Test Pexels API integration
            </p>
          </div>
        </div>

        {/* Search Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm technical-label uppercase tracking-widest">Search Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Query Input */}
            <div className="flex gap-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter search query (e.g., Ocean waves, City timelapse)"
                className="flex-1"
              />
              <Button onClick={searchVideos} disabled={status === "loading" || !query.trim()}>
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Sample Queries */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Try a sample query:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuery(q)}
                    className="px-2 py-1 text-xs rounded bg-muted/10 border border-border hover:bg-muted/20 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
                >
                  {ORIENTATIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
                >
                  {SIZES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Results per page</label>
                <Input
                  type="number"
                  value={perPage}
                  onChange={(e) => setPerPage(e.target.value)}
                  min={1}
                  max={80}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-sm technical-label uppercase tracking-widest flex items-center gap-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-red-400 font-mono">{error}</pre>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {response?.success && response.videos && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm technical-label uppercase tracking-widest">
                  Results
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {response.total_results?.toLocaleString()} total
                  </Badge>
                  <Badge variant="outline">
                    Page {response.page}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {response.videos.map((video) => (
                  <div
                    key={video.id}
                    className="group relative aspect-video rounded-lg overflow-hidden border border-border bg-muted/10"
                  >
                    <img
                      src={video.image}
                      alt={`Video ${video.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-white" />
                      </a>
                      <a
                        href={video.video_files[0]?.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        <Play className="w-4 h-4 text-white" />
                      </a>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center justify-between text-xs text-white">
                        <span>{video.duration}s</span>
                        <span className="truncate ml-2">{video.user.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Raw Response (Debug) */}
        {rawResponse && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm technical-label uppercase tracking-widest">
                Raw API Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-3 bg-muted/10 rounded-lg border border-border text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                {rawResponse}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Idle State */}
        {status === "idle" && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Enter a search query to find videos on Pexels</p>
          </div>
        )}
      </div>
    </div>
  );
}
