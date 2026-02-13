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
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const REMOTION_SERVER = "http://localhost:3000";

export default function WarpPlayground() {
  const [video1, setVideo1] = useState("https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/Avatar%20IV%20Video.mp4");
  const [video2, setVideo2] = useState("https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/Avatar%20IV%20Video.mp4");
  const [v1Duration, setV1Duration] = useState(150);
  const [v2Duration, setV2Duration] = useState(150);
  const [transitionDurationInFrames, setTransitionDurationInFrames] = useState(30);

  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isscanning, setIsScanning] = useState<Record<number, boolean>>({});

  const getVideoDuration = async (url: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.crossOrigin = "anonymous";
      video.src = url;
      video.onloadedmetadata = () => resolve(Math.round(video.duration * 30));
      video.onerror = () => reject("Failed to load metadata");
      setTimeout(() => reject("Timeout"), 5000);
    });
  };

  const handleDetect = async (target: 1 | 2) => {
    setIsScanning(prev => ({ ...prev, [target]: true }));
    try {
      const frames = await getVideoDuration(target === 1 ? video1 : video2);
      if (target === 1) setV1Duration(frames);
      else setV2Duration(frames);
    } catch (err) {
      setError(`Detection failed for Video ${target}`);
    } finally {
      setIsScanning(prev => ({ ...prev, [target]: false }));
    }
  };

  const handleRender = async () => {
    setIsProcessing(true);
    setError(null);
    setOutputUrl(null);
    setProgress(0);

    try {
      const res = await fetch(`${REMOTION_SERVER}/lambda/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compositionId: "WarpAssembly",
          inputProps: {
            video1,
            video2,
            v1Duration,
            v2Duration,
            transitionDurationInFrames,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Render failed");

      pollStatus(data.renderId, data.bucketName);
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const pollStatus = (id: string, bucket: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${REMOTION_SERVER}/lambda/status/${id}?bucketName=${bucket}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "completed") {
          setOutputUrl(data.videoUrl);
          setIsProcessing(false);
          setProgress(100);
          clearInterval(interval);
        } else if (data.status === "failed") {
          setError(data.error || "failed");
          setIsProcessing(false);
          clearInterval(interval);
        } else if (data.status === "in-progress") {
          setProgress(Math.round(data.progress * 100));
        }
      } catch (err) {
        console.error("Poll error", err);
      }
    }, 2000);
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
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-indigo-600">Warp Transition</h1>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest font-mono">2-Clip Spatial Distortion</p>
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
                {progress === 100 ? "Assembling..." : `Processing ${progress}%`}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-3" />
                Render Warp Video
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((num) => (
                <Card key={num} className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardHeader className="p-4 border-b border-neutral-50 bg-neutral-50/30">
                    <CardTitle className="text-[11px] font-black uppercase tracking-widest italic text-indigo-900">Video {num}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Source URL</Label>
                       <Input 
                         value={num === 1 ? video1 : video2} 
                         onChange={(e) => num === 1 ? setVideo1(e.target.value) : setVideo2(e.target.value)}
                         className="text-[11px] font-bold py-5 bg-white border-2"
                       />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Duration (Frames)</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number"
                          value={num === 1 ? v1Duration : v2Duration} 
                          onChange={(e) => num === 1 ? setV1Duration(parseInt(e.target.value) || 0) : setV2Duration(parseInt(e.target.value) || 0)}
                          className="text-[11px] font-bold py-5 bg-white border-2 flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleDetect(num as 1 | 2)}
                          disabled={isscanning[num]}
                          className="h-auto px-3 border-2"
                        >
                          {isscanning[num] ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
             <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-[11px] font-black uppercase tracking-widest">Controls</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                   <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Trans Duration</Label>
                    <Input 
                      type="number" 
                      value={transitionDurationInFrames} 
                      onChange={(e) => setTransitionDurationInFrames(parseInt(e.target.value) || 0)}
                      className="text-[11px] font-bold py-5 bg-neutral-50 border-2"
                    />
                  </div>
                </CardContent>
             </Card>
             {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase">
                  {error}
                </div>
             )}
          </div>

          <div className="lg:col-span-8">
            <Card className="border-neutral-200 shadow-xl rounded-3xl overflow-hidden bg-neutral-900 aspect-video flex flex-col items-center justify-center relative">
              {outputUrl ? (
                <video src={outputUrl} controls autoPlay className="w-full h-full object-contain" />
              ) : isProcessing ? (
                <div className="flex flex-col items-center gap-4 text-white">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                  <p className="text-xl font-black uppercase italic italic tracking-tighter">Warping Realities...</p>
                </div>
              ) : (
                <div className="text-neutral-700 font-black uppercase tracking-widest opacity-20 italic">Awaiting Warp Command</div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
