"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Settings2, 
  Zap, 
  Loader2, 
  CheckCircle2,
  MonitorPlay,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const REMOTION_SERVER = "http://localhost:3000";

export default function SlideTransitionPage() {
  const [video1File, setVideo1File] = useState<File | null>(null);
  const [video2File, setVideo2File] = useState<File | null>(null);
  
  const [v1Frames, setV1Frames] = useState(180);
  const [v2Frames, setV2Frames] = useState(180);
  const [transFrames, setTransFrames] = useState(30);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");

  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleRender = async () => {
    if (!video1File || !video2File) {
      setError("Please select both Video 1 and Video 2");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setOutputUrl(null);
    setJobId(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("compositionId", "SlideTransition");
      formData.append("inputProps", JSON.stringify({
        v1DurationInFrames: v1Frames,
        v2DurationInFrames: v2Frames,
        transitionDurationInFrames: transFrames,
        aspectRatio,
      }));

      formData.append("video1Url", video1File);
      formData.append("video2Url", video2File);

      const response = await fetch(`${REMOTION_SERVER}/renders`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to start render");
      
      setJobId(data.jobId);
      pollStatus(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsProcessing(false);
    }
  };

  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${REMOTION_SERVER}/renders/${id}`);
        const data = await res.json();

        if (data.status === "completed") {
          setOutputUrl(data.videoUrl);
          setIsProcessing(false);
          setProgress(100);
          clearInterval(interval);
        } else if (data.status === "failed") {
          setError(data.error?.message || "Render failed");
          setIsProcessing(false);
          clearInterval(interval);
        } else if (data.status === "in-progress") {
          setProgress(Math.round(data.progress * 100));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 selection:bg-amber-100 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-4">
            <Link 
              href="/playground/remotion" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Remotion Experiments
            </Link>
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Slide Transition</h1>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Wipe effect between sequential clips</p>
            </div>
          </div>

          <Button
            onClick={handleRender}
            disabled={isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                Rendering {progress}%
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-3" />
                Render Slide Wipe
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="p-6 border-b border-neutral-50 bg-neutral-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Settings2 className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest italic">Slide Config</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Aspect Ratio</Label>
                    <Badge variant="outline" className="text-[9px] font-bold border-neutral-200 text-neutral-400">
                      {aspectRatio === "16:9" ? "1920x1080" : "1080x1920"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={aspectRatio === "16:9" ? "default" : "outline"}
                      onClick={() => setAspectRatio("16:9")}
                      className="flex-1 text-[10px] font-black uppercase tracking-widest py-4 h-auto"
                    >
                      16:9 Landscape
                    </Button>
                    <Button
                      variant={aspectRatio === "9:16" ? "default" : "outline"}
                      onClick={() => setAspectRatio("9:16")}
                      className="flex-1 text-[10px] font-black uppercase tracking-widest py-4 h-auto"
                    >
                      9:16 Portrait
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 border-t border-neutral-100 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Video 1</Label>
                      <span className="text-[9px] font-bold text-neutral-400">{v1Frames} frames</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideo1File(e.target.files?.[0] || null)}
                        className="text-[11px] font-bold py-5 bg-neutral-50/50 border-2 cursor-pointer flex-1"
                      />
                      <Input 
                        type="number"
                        value={v1Frames}
                        onChange={(e) => setV1Frames(parseInt(e.target.value))}
                        className="w-16 text-center text-[10px] font-bold py-5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Video 2</Label>
                      <span className="text-[9px] font-bold text-neutral-400">{v2Frames} frames</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideo2File(e.target.files?.[0] || null)}
                        className="text-[11px] font-bold py-5 bg-neutral-50/50 border-2 cursor-pointer flex-1"
                      />
                      <Input 
                        type="number"
                        value={v2Frames}
                        onChange={(e) => setV2Frames(parseInt(e.target.value))}
                        className="w-16 text-center text-[10px] font-bold py-5"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-neutral-100">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Transition Duration (Frames)</Label>
                    <Input 
                      type="number" 
                      value={transFrames} 
                      onChange={(e) => setTransFrames(parseInt(e.target.value))}
                      className="text-[11px] font-bold py-5 bg-neutral-50/50 border-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl">
                <p className="text-[11px] font-black text-red-600 uppercase tracking-tight">{error}</p>
              </div>
            )}
          </div>

          {/* Preview */}
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
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                  <div className="flex flex-col items-center">
                    <p className="text-xl font-black uppercase italic tracking-tighter">Rendering Output</p>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">{progress}% Complete</p>
                  </div>
                  <div className="w-64 h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-neutral-500">
                  <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center border-4 border-neutral-800/50">
                    <MonitorPlay className="w-8 h-8 opacity-20" />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-black uppercase tracking-widest opacity-20 italic">Awaiting Render Command</p>
                    <p className="text-[10px] font-bold opacity-10 uppercase mt-1">Configure inputs to begin</p>
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
