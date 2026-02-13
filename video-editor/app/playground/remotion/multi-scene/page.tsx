"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Settings2, 
  Zap, 
  Loader2, 
  Video as VideoIcon,
  Play,
  Link2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const REMOTION_SERVER = "http://localhost:3000";

type Scene = {
  url: string;
  durationInFrames: number;
  transitionType: "none" | "slide" | "zoom" | "light-leak";
};

export default function MultiScenePlayground() {
  const [scenes, setScenes] = useState<Scene[]>([
    { 
      url: "https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/Avatar%20IV%20Video.mp4", 
      durationInFrames: 150, 
      transitionType: "zoom" 
    },
    { 
      url: "https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/Avatar%20IV%20Video.mp4", 
      durationInFrames: 150, 
      transitionType: "slide" 
    },
    { 
      url: "https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/Avatar%20IV%20Video.mp4", 
      durationInFrames: 150, 
      transitionType: "none" 
    },
  ]);

  const [lightLeakUrl, setLightLeakUrl] = useState("https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/merged-1770838789313.mp4");
  const [transFrames, setTransFrames] = useState(30);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");

  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState<Record<number, boolean>>({});

  const getVideoDurationInFrames = async (url: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      // Allow cross-origin for metadata if possible, though often restricted
      video.crossOrigin = "anonymous"; 
      video.src = url;
      video.onloadedmetadata = () => {
        resolve(Math.round(video.duration * 30)); // Base 30fps
      };
      video.onerror = () => reject("Failed to load video metadata");
      
      // Timeout after 5s
      setTimeout(() => reject("Timeout fetching metadata"), 5000);
    });
  };

  const handleDetectDuration = async (index: number) => {
    const url = scenes[index].url;
    if (!url) return;

    setIsScanning(prev => ({ ...prev, [index]: true }));
    try {
      const frames = await getVideoDurationInFrames(url);
      updateScene(index, { durationInFrames: frames });
    } catch (err) {
      console.error("Duration detection failed:", err);
      setError("Could not detect video duration. URL might be restricted or invalid.");
    } finally {
      setIsScanning(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleDetectAll = async () => {
    scenes.forEach((_, i) => handleDetectDuration(i));
  };

  const handleRender = async () => {
    setIsProcessing(true);
    setError(null);
    setOutputUrl(null);
    setProgress(0);
    setEstimatedCost(null);

    try {
      const inputProps = {
        scenes,
        lightLeakUrl,
        transitionDurationInFrames: transFrames,
        aspectRatio,
      };

      const response = await fetch(`${REMOTION_SERVER}/lambda/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compositionId: "MultiSceneAssembly",
          inputProps,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Failed to start Lambda render");
      
      setEstimatedCost(data.estimatedCost);
      pollLambdaStatus(data.renderId, data.bucketName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsProcessing(false);
    }
  };

  const pollLambdaStatus = async (id: string, bucket: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${REMOTION_SERVER}/lambda/status/${id}?bucketName=${bucket}`);
        if (!res.ok) {
          console.warn("Lambda Poll: Server returned error, retrying...", res.status);
          return;
        }
        const data = await res.json();

        if (data.status === "completed") {
          setOutputUrl(data.videoUrl);
          setIsProcessing(false);
          setProgress(100);
          clearInterval(interval);
        } else if (data.status === "failed") {
          setError(data.error || "Lambda Render failed");
          setIsProcessing(false);
          clearInterval(interval);
        } else if (data.status === "in-progress") {
          setProgress(Math.round(data.progress * 100));
        }
      } catch (err) {
        // Only log if it's not a temporary fetch failure
        console.error("Lambda Polling error (might be server restart):", err);
      }
    }, 2000);
  };

  const updateScene = (index: number, updates: Partial<Scene>) => {
    const newScenes = [...scenes];
    newScenes[index] = { ...newScenes[index], ...updates };
    setScenes(newScenes);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 selection:bg-amber-100 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-4">
            <Link 
              href="/playground/remotion" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Experiments
            </Link>
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-indigo-600">Multi-Scene Orchestrator</h1>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest font-mono">Parallel Transition Assembly</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button
              onClick={handleRender}
              disabled={isProcessing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                  {progress === 100 ? "Assembling Final Video..." : `Processing ${progress}%`}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-3" />
                  Execute Multi-Scene Render
                </>
              )}
            </Button>
            {estimatedCost !== null && (
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[9px] uppercase tracking-widest p-2 rounded-lg">
                Estimated Cost: ${estimatedCost.toFixed(6)}
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={handleDetectAll}
              className="mt-2 text-[9px] font-black uppercase tracking-widest px-4 h-8 rounded-lg border-neutral-200 hover:border-indigo-200 hover:text-indigo-600 transition-all"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Auto-detect All Durations
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scenes.map((scene, idx) => (
                <Card key={idx} className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardHeader className="p-4 border-b border-neutral-50 bg-neutral-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <span className="text-[10px] font-black">{idx + 1}</span>
                      </div>
                      <CardTitle className="text-[11px] font-black uppercase tracking-widest italic text-indigo-900">Scene Object</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Video Source URL</Label>
                      <Input 
                        value={scene.url} 
                        onChange={(e) => updateScene(idx, { url: e.target.value })}
                        className="text-[11px] font-bold py-5 bg-white border-2"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Duration (Frames)</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number"
                          value={scene.durationInFrames} 
                          onChange={(e) => updateScene(idx, { durationInFrames: parseInt(e.target.value) || 0 })}
                          className="text-[11px] font-bold py-5 bg-white border-2 flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDetectDuration(idx)}
                          disabled={isScanning[idx]}
                          className="h-auto px-3 border-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Auto-detect duration"
                        >
                          {isScanning[idx] ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                      
                      {idx < scenes.length - 1 && (
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Exit Transition</Label>
                          <select 
                            value={scene.transitionType} 
                            onChange={(e) => updateScene(idx, { transitionType: e.target.value as any })}
                            className="flex h-10 w-full items-center justify-between rounded-md border-2 border-input bg-background px-3 py-2 text-[11px] font-bold ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                          >
                            <option value="none">None</option>
                            <option value="zoom">Zoom</option>
                            <option value="slide">Slide</option>
                            <option value="light-leak">Light Leak</option>
                            <option value="fade-scale">Fade Scale</option>
                          </select>
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="p-6 border-b border-neutral-50 bg-neutral-50/30 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Settings2 className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest italic text-indigo-900">Global Config</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Orientation</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={aspectRatio === "16:9" ? "default" : "outline"}
                        onClick={() => setAspectRatio("16:9")}
                        className="flex-1 text-[10px] font-black uppercase tracking-widest py-4 h-auto"
                      >
                        16:9
                      </Button>
                      <Button
                        variant={aspectRatio === "9:16" ? "default" : "outline"}
                        onClick={() => setAspectRatio("9:16")}
                        className="flex-1 text-[10px] font-black uppercase tracking-widest py-4 h-auto"
                      >
                        9:16
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Trans Duration (Frames)</Label>
                    <Input 
                      type="number" 
                      value={transFrames || 0} 
                      onChange={(e) => setTransFrames(parseInt(e.target.value) || 0)}
                      className="text-[11px] font-bold py-5 bg-neutral-50/50 border-2"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-neutral-100">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-amber-500" />
                      Global Light leak URL
                    </Label>
                    <Input 
                      value={lightLeakUrl} 
                      onChange={(e) => setLightLeakUrl(e.target.value)}
                      className="text-[11px] font-bold py-5 bg-neutral-50/30 border-2"
                      placeholder="Enter overlay URL..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl animate-in shake duration-500">
                <p className="text-[11px] font-black text-red-600 uppercase tracking-tight">{error}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            <Card className="border-neutral-200 shadow-xl rounded-3xl overflow-hidden bg-neutral-900 aspect-video flex flex-col items-center justify-center relative">
              {outputUrl ? (
                <video 
                  key={outputUrl}
                  src={outputUrl} 
                  controls 
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : isProcessing ? (
                <div className="flex flex-col items-center gap-4 text-white">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                        {progress}%
                    </div>
                  </div>
                  <p className="text-xl font-black uppercase italic tracking-tighter">Executing AWS Lambda Loop</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-neutral-500 group cursor-pointer" onClick={handleRender}>
                  <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center border-4 border-neutral-800/50 transition-all group-hover:scale-110 group-hover:bg-neutral-700">
                    <Play className="w-8 h-8 opacity-20 fill-current ml-1" />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-black uppercase tracking-widest opacity-20 italic">Awaiting Orchestration</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
