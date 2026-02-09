"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Book, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface APISection {
  id: string;
  name: string;
  baseUrl: string;
  envKey: string;
  docsUrl: string;
  endpoints: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    description: string;
    params?: { name: string; type: string; required: boolean; description: string }[];
    response?: string;
  }[];
}

const API_DOCS: APISection[] = [
  {
    id: "openai",
    name: "OpenAI API",
    baseUrl: "https://api.openai.com/v1",
    envKey: "OPEN_AI_API_KEY",
    docsUrl: "https://platform.openai.com/docs/api-reference",
    endpoints: [
      {
        method: "POST",
        path: "/chat/completions",
        description: "Create a chat completion with GPT models",
        params: [
          { name: "model", type: "string", required: true, description: "Model ID (gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo)" },
          { name: "messages", type: "array", required: true, description: "Array of message objects with role and content" },
          { name: "max_tokens", type: "integer", required: false, description: "Maximum tokens to generate (default: 1000)" },
          { name: "temperature", type: "number", required: false, description: "Sampling temperature 0-2 (default: 1)" },
        ],
        response: `{
  "id": "chatcmpl-xxx",
  "choices": [{
    "message": { "role": "assistant", "content": "..." }
  }],
  "usage": { "prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30 }
}`,
      },
    ],
  },
  {
    id: "pexels",
    name: "Pexels API",
    baseUrl: "https://api.pexels.com",
    envKey: "PEXELS_API_KEY",
    docsUrl: "https://www.pexels.com/api/documentation/",
    endpoints: [
      {
        method: "GET",
        path: "/videos/search",
        description: "Search for videos by keyword",
        params: [
          { name: "query", type: "string", required: true, description: "Search query (e.g., Ocean, Tigers, People)" },
          { name: "orientation", type: "string", required: false, description: "landscape, portrait, or square" },
          { name: "size", type: "string", required: false, description: "large (4K), medium (Full HD), or small (HD)" },
          { name: "locale", type: "string", required: false, description: "Locale code (e.g., en-US, de-DE, ja-JP)" },
          { name: "page", type: "integer", required: false, description: "Page number (default: 1)" },
          { name: "per_page", type: "integer", required: false, description: "Results per page (default: 15, max: 80)" },
        ],
        response: `{
  "videos": [{ "id": 123, "url": "...", "image": "...", "duration": 10, "video_files": [...] }],
  "total_results": 1000,
  "page": 1,
  "per_page": 15
}`,
      },
      {
        method: "GET",
        path: "/v1/videos/:id",
        description: "Get a specific video by ID",
        params: [
          { name: "id", type: "integer", required: true, description: "The video ID" },
        ],
      },
    ],
  },
  {
    id: "ffmpeg",
    name: "FFmpeg Server",
    baseUrl: "http://localhost:3333",
    envKey: "N/A (local)",
    docsUrl: "",
    endpoints: [
      {
        method: "GET",
        path: "/health",
        description: "Check if FFmpeg server is running",
      },
      {
        method: "POST",
        path: "/api/trim",
        description: "Trim a video to specified start/end times",
        params: [
          { name: "input", type: "string", required: true, description: "Input video URL or path" },
          { name: "start", type: "number", required: true, description: "Start time in seconds" },
          { name: "end", type: "number", required: true, description: "End time in seconds" },
        ],
      },
      {
        method: "POST",
        path: "/api/speed",
        description: "Adjust video speed (fit to duration)",
        params: [
          { name: "input", type: "string", required: true, description: "Input video URL or path" },
          { name: "targetDuration", type: "number", required: true, description: "Target duration in seconds" },
        ],
      },
      {
        method: "POST",
        path: "/api/zoom",
        description: "Apply zoom effect to video",
        params: [
          { name: "input", type: "string", required: true, description: "Input video URL or path" },
          { name: "startZoom", type: "number", required: true, description: "Starting zoom level (1 = 100%)" },
          { name: "endZoom", type: "number", required: true, description: "Ending zoom level" },
          { name: "anchorX", type: "number", required: false, description: "X anchor point (0-1, default: 0.5)" },
          { name: "anchorY", type: "number", required: false, description: "Y anchor point (0-1, default: 0.5)" },
        ],
      },
    ],
  },
];

export default function DocsPage() {
  const [expanded, setExpanded] = useState<string[]>(["openai"]);

  const toggleSection = (id: string) => {
    setExpanded(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-500/10 text-green-500 border-green-500/30";
      case "POST": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "PUT": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "DELETE": return "bg-red-500/10 text-red-500 border-red-500/30";
      default: return "bg-muted/10";
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/playground" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Book className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">API Documentation</h1>
            <p className="text-xs text-muted-foreground technical-label uppercase tracking-widest">
              Quick reference for integrated APIs
            </p>
          </div>
        </div>

        {/* API Sections */}
        {API_DOCS.map((api) => (
          <Card key={api.id}>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/5 transition-colors"
              onClick={() => toggleSection(api.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expanded.includes(api.id) ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-base">{api.name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{api.baseUrl}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {api.envKey}
                  </Badge>
                  {api.docsUrl && (
                    <a
                      href={api.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded hover:bg-muted/10 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  )}
                </div>
              </div>
            </CardHeader>

            {expanded.includes(api.id) && (
              <CardContent className="space-y-4 pt-0">
                {api.endpoints.map((endpoint, i) => (
                  <div key={i} className="p-4 rounded-lg border border-border bg-muted/5">
                    {/* Endpoint Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`${getMethodColor(endpoint.method)} font-mono text-xs`}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono">{endpoint.path}</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>

                    {/* Parameters */}
                    {endpoint.params && endpoint.params.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-2 technical-label uppercase tracking-widest">Parameters</p>
                        <div className="space-y-1">
                          {endpoint.params.map((param) => (
                            <div key={param.name} className="flex items-start gap-2 text-sm">
                              <code className="px-1.5 py-0.5 rounded bg-muted/20 text-xs font-mono">
                                {param.name}
                              </code>
                              <span className="text-xs text-muted-foreground">
                                ({param.type})
                              </span>
                              {param.required && (
                                <Badge variant="outline" className="text-[10px] py-0 h-4">required</Badge>
                              )}
                              <span className="text-xs text-muted-foreground flex-1">
                                — {param.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Response */}
                    {endpoint.response && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 technical-label uppercase tracking-widest">Response</p>
                        <pre className="p-2 rounded bg-muted/10 border border-border text-xs font-mono overflow-x-auto">
                          {endpoint.response}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
