"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Upload, Video, Loader2, Download, 
  X, Film, Sparkles, Blend, ChevronRight, CheckCircle2,
  Monitor, Play, Settings2, History, Zap, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REMOTION_SERVER = "http://localhost:3000";

export default function RemotionExperimentPage() {
  const [video1File, setVideo1File] = useState<File | null>(null);
  const [video2File, setVideo2File] = useState<File | null>(null);
  const [lightLeakFile, setLightLeakFile] = useState<File | null>(null);
  
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
    if (!video1File || !video2File || !lightLeakFile) {
      setError("Please select all three video files (Video 1, Video 2, and Light Leak)");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setOutputUrl(null);
    setJobId(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("compositionId", "LightLeakTransition");
      formData.append("inputProps", JSON.stringify({
        v1DurationInFrames: v1Frames,
        v2DurationInFrames: v2Frames,
        transitionDurationInFrames: transFrames,
        aspectRatio,
      }));

      formData.append("video1Url", video1File);
      formData.append("video2Url", video2File);
      formData.append("lightLeakUrl", lightLeakFile);

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
              href="/playground" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Playground
            </Link>
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Remotion Engine Experiment</h1>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Testing React-based Server Rendering & Optics</p>
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
                Start Remotion Render
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
                  <CardTitle className="text-sm font-black uppercase tracking-widest italic">Input Configuration</CardTitle>
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
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Video 1 (Manual Upload)</Label>
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
                        placeholder="Duration"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Video 2 (Manual Upload)</Label>
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
                        placeholder="Duration"
                      />
                    </div>
                  </div>
                </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Light Leak Asset (Manual Upload)</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="file"
                        accept="video/*"
                        onChange={(e) => setLightLeakFile(e.target.files?.[0] || null)}
                        className="text-[11px] font-bold py-5 bg-neutral-50/50 border-2 cursor-pointer"
                      />
                      {lightLeakFile && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                    </div>
                  </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Transition (Frames)</Label>
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

            <Card className="border-neutral-200 shadow-sm rounded-2xl bg-neutral-900 text-white p-6 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Engine-Link Virtualized</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase italic tracking-tight text-white">Remotion Lambda/Docker Emulation</p>
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">
                    React-to-MP4 Pipeline. <br />
                    Prop-driven Dynamic Composition.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Stage */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-neutral-200 bg-white shadow-2xl rounded-[2rem] overflow-hidden border-4">
              <CardHeader className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-row items-center justify-between transition-all">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-indigo-500" />
                      Remotion Output Monitor
                  </CardTitle>
                </div>
                {jobId && (
                  <Badge className="bg-indigo-500 text-white border-none font-bold uppercase tracking-[0.2em] text-[9px] px-3 py-1">
                    Job: {jobId.slice(0, 8)}...
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-0 bg-neutral-900 aspect-video relative group">
                {outputUrl ? (
                  <video 
                    src={outputUrl} 
                    controls 
                    className="w-full h-full object-contain"
                    autoPlay
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-6">
                      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 animate-pulse">
                        <Play className="w-10 h-10 ml-1" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-black text-white/30 uppercase tracking-[0.3em]">Awaiting Render Command</p>
                        <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Execute from sidebar to start engine</p>
                      </div>
                  </div>
                )}
                
                {outputUrl && (
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={outputUrl} download>
                      <Button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 font-bold uppercase tracking-widest text-[10px] rounded-xl px-6 py-4">
                        <Download className="w-4 h-4 mr-2" />
                        Download Export
                      </Button>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {error && (
              <Card className="border-rose-200 bg-rose-50/50 shadow-none rounded-2xl overflow-hidden">
                <CardHeader className="px-6 py-4 border-b border-rose-100 flex flex-row items-center gap-3">
                  <X className="w-5 h-5 text-rose-500" />
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-rose-600">Engine Fault Detected</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm font-bold text-rose-500 leading-relaxed">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
