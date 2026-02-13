"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Settings2, 
  Zap, 
  Loader2, 
  Video,
  Play,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const REMOTION_SERVER = "http://localhost:3000";

type VideoClip = {
  type: "file" | "url";
  file: File | null;
  url: string;
  duration: number;
};

export default function ZoomTransitionPage() {
  const [v1, setV1] = useState<VideoClip>({ 
    type: "url", 
    file: null, 
    url: "https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/Avatar%20IV%20Video.mp4", 
    duration: 180 
  });
  const [v2, setV2] = useState<VideoClip>({ 
    type: "url", 
    file: null, 
    url: "https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/Avatar%20IV%20Video.mp4", 
    duration: 180 
  });
  
  const [transFrames, setTransFrames] = useState(30);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("9:16");

  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [useLambda, setUseLambda] = useState(true); // Default to TRUE
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  const handleRender = async () => {
    const isV1Valid = (v1.type === 'file' && v1.file !== null) || (v1.type === 'url' && v1.url.trim() !== "");
    const isV2Valid = (v2.type === 'file' && v2.file !== null) || (v2.type === 'url' && v2.url.trim() !== "");

    if (!isV1Valid || !isV2Valid) {
      setError("Please provide both videos");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setOutputUrl(null);
    setProgress(0);
    setEstimatedCost(null);

    try {
      const formData = new FormData();
      formData.append("compositionId", "ZoomTransition");
      
      const inputProps = {
        video1Url: v1.type === 'url' ? v1.url : "video1Url",
        video2Url: v2.type === 'url' ? v2.url : "video2Url",
        v1DurationInFrames: v1.duration,
        v2DurationInFrames: v2.duration,
        transitionDurationInFrames: transFrames,
        aspectRatio,
      };

      formData.append("inputProps", JSON.stringify(inputProps));

      if (v1.type === 'file' && v1.file) formData.append("video1Url", v1.file);
      if (v2.type === 'file' && v2.file) formData.append("video2Url", v2.file);

      const endpoint = useLambda ? "/lambda/render" : "/renders";
      const response = await fetch(`${REMOTION_SERVER}${endpoint}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Failed to start render");
      
      if (useLambda) {
        setEstimatedCost(data.estimatedCost);
        pollLambdaStatus(data.renderId, data.bucketName);
      } else {
        pollStatus(data.jobId);
      }
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

  const pollLambdaStatus = async (id: string, bucket: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${REMOTION_SERVER}/lambda/status/${id}?bucketName=${bucket}`);
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
        console.error("Lambda Polling error:", err);
      }
    }, 2000);
  };

  const VideoCard = ({ 
    label, 
    data, 
    setData 
  }: { 
    label: string, 
    data: VideoClip, 
    setData: (d: VideoClip) => void 
  }) => (
    <div className="space-y-3 p-4 bg-neutral-50/50 border-2 border-neutral-100 rounded-xl relative group">
      <div className="flex justify-between items-center">
        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 underline decoration-indigo-200 decoration-2 underline-offset-4">
          {label}
        </Label>
      </div>
      
      <div className="flex justify-between items-center bg-white/50 p-1 rounded-lg border border-neutral-100">
        <div className="flex gap-1">
          <Button
            variant={data.type === "file" ? "default" : "ghost"}
            size="sm"
            onClick={() => setData({ ...data, type: "file" })}
            className="h-7 text-[9px] font-black uppercase px-3"
          >
            Upload
          </Button>
          <Button
            variant={data.type === "url" ? "default" : "ghost"}
            size="sm"
            onClick={() => setData({ ...data, type: "url" })}
            className="h-7 text-[9px] font-black uppercase px-3 gap-1.5"
          >
            <Link2 className="w-3 h-3" />
            URL
          </Button>
        </div>
        <div className="relative">
          <Input 
            type="number"
            value={data.duration || 0}
            onChange={(e) => setData({ ...data, duration: parseInt(e.target.value) || 0 })}
            className="w-16 text-center text-[10px] font-bold py-3 bg-white border-none h-7 pr-4"
          />
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] font-bold text-neutral-400">f</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        {data.type === "file" ? (
          <Input 
            type="file"
            accept="video/*"
            onChange={(e) => setData({ ...data, file: e.target.files?.[0] || null })}
            className="text-[11px] font-bold py-5 bg-white border-2 cursor-pointer flex-1"
          />
        ) : (
          <Input 
            type="text"
            placeholder="https://example.com/video.mp4"
            value={data.url || ""}
            onChange={(e) => setData({ ...data, url: e.target.value })}
            className="text-[11px] font-bold py-5 bg-white border-2 flex-1"
          />
        )}
      </div>
    </div>
  );

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
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-indigo-600">Zoom Transition</h1>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest font-mono">Scaling overlap assembly</p>
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
                  Processing {progress}%
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-3" />
                  Render Zoom Transition
                </>
              )}
            </Button>
            {estimatedCost !== null && (
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[9px] uppercase tracking-widest p-2 rounded-lg">
                Estimated Cost: ${estimatedCost.toFixed(6)}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="p-6 border-b border-neutral-50 bg-neutral-50/30 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Video className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest italic text-indigo-900">Production Assets</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <VideoCard label="Clip 01" data={v1} setData={setV1} />
                <VideoCard label="Clip 02" data={v2} setData={setV2} />
              </CardContent>
            </Card>

            <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="p-6 border-b border-neutral-50 bg-neutral-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600">
                      <Settings2 className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-black uppercase tracking-widest italic text-neutral-800">Global Settings</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full animate-pulse ${useLambda ? 'bg-orange-500' : 'bg-green-500'}`} />
                     <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        {useLambda ? 'Cloud Mode' : 'Local Mode'}
                     </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Engine</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={!useLambda ? "default" : "outline"}
                        onClick={() => setUseLambda(false)}
                        className="flex-1 text-[10px] font-black uppercase tracking-widest py-4 h-auto"
                      >
                        Local
                      </Button>
                      <Button
                        variant={useLambda ? "default" : "outline"}
                        onClick={() => setUseLambda(true)}
                        className={`flex-1 text-[10px] font-black uppercase tracking-widest py-4 h-auto ${useLambda ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                      >
                        Lambda
                      </Button>
                    </div>
                  </div>

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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Transition (Frames)</Label>
                    <Input 
                      type="number" 
                      value={transFrames || 0} 
                      onChange={(e) => setTransFrames(parseInt(e.target.value) || 0)}
                      className="text-[11px] font-bold py-5 bg-neutral-50/50 border-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl animate-in shake duration-500">
                <p className="text-[11px] font-black text-red-600 uppercase tracking-tight">{error}</p>
                <p className="text-[9px] mt-2 text-red-400 font-bold uppercase">Tip: Try Local Mode if Lambda isn't updated</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            <Card className="border-neutral-200 shadow-xl rounded-3xl overflow-hidden bg-neutral-900 aspect-video lg:aspect-[4/3] flex flex-col items-center justify-center relative">
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
                  <p className="text-xl font-black uppercase italic tracking-tighter">Assembly in Progress</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-neutral-500 group cursor-pointer" onClick={handleRender}>
                  <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center border-4 border-neutral-800/50 transition-all group-hover:scale-110 group-hover:bg-neutral-700">
                    <Play className="w-8 h-8 opacity-20 fill-current ml-1" />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-black uppercase tracking-widest opacity-20 italic">Awaiting Production</p>
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
