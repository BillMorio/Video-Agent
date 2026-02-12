"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Settings2, 
  Zap, 
  Loader2, 
  Plus,
  Trash2,
  Video,
  MonitorPlay,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const REMOTION_SERVER = "http://localhost:3000";

type VideoClip = {
  file: File | null;
  duration: number;
};

export default function MultiVideoPage() {
  const [clips, setClips] = useState<VideoClip[]>([
    { file: null, duration: 180 },
    { file: null, duration: 180 },
  ]);
  const [lightLeakFile, setLightLeakFile] = useState<File | null>(null);
  const [transFrames, setTransFrames] = useState(30);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");

  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [useLambda, setUseLambda] = useState(false);
  const [lambdaBucket, setLambdaBucket] = useState<string | null>(null);

  const addClip = () => {
    setClips([...clips, { file: null, duration: 180 }]);
  };

  const removeClip = (index: number) => {
    if (clips.length <= 2) return;
    const newClips = [...clips];
    newClips.splice(index, 1);
    setClips(newClips);
  };

  const updateClipFile = (index: number, file: File | null) => {
    const newClips = [...clips];
    newClips[index].file = file;
    setClips(newClips);
  };

  const updateClipDuration = (index: number, dur: number) => {
    const newClips = [...clips];
    newClips[index].duration = dur;
    setClips(newClips);
  };

  const handleRender = async () => {
    const validClips = clips.filter(c => c.file !== null);
    if (validClips.length < 2 || !lightLeakFile) {
      setError("Please select at least 2 videos and a light leak asset");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setOutputUrl(null);
    setJobId(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("compositionId", "MultiLightLeakTransition");
      
      const inputProps = {
        videos: clips.map((_, i) => ({
            url: `video_${i}`, // Placeholder fieldname that multer will resolve
            durationInFrames: clips[i].duration
        })),
        lightLeakUrl: "lightLeakUrl",
        transitionDurationInFrames: transFrames,
        aspectRatio,
      };

      formData.append("inputProps", JSON.stringify(inputProps));

      clips.forEach((clip, i) => {
        if (clip.file) {
            formData.append(`video_${i}`, clip.file);
        }
      });
      formData.append("lightLeakUrl", lightLeakFile);

      const endpoint = useLambda ? "/lambda/render" : "/renders";
      const response = await fetch(`${REMOTION_SERVER}${endpoint}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to start render");
      
      if (useLambda) {
        setJobId(data.renderId);
        setLambdaBucket(data.bucketName);
        pollLambdaStatus(data.renderId, data.bucketName);
      } else {
        setJobId(data.jobId);
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
    }, 2000); // Polling Lambda less frequently
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
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Multi-Video Production</h1>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Chain unlimited clips with professional transitions</p>
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
                Processing {progress}%
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-3" />
                Render Multi-Clip Video
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="p-6 border-b border-neutral-50 bg-neutral-50/30 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Video className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest italic">Clip Pipeline</CardTitle>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold border-neutral-200 text-neutral-400">
                  {clips.length} Clips
                </Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {clips.map((clip, index) => (
                  <div key={index} className="space-y-3 p-4 bg-neutral-50/50 border-2 border-neutral-100 rounded-xl relative group">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 underline decoration-indigo-200 decoration-2 underline-offset-4">
                        Clip 0{index + 1}
                      </Label>
                      {clips.length > 2 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeClip(index)}
                          className="w-6 h-6 text-neutral-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input 
                        type="file"
                        accept="video/*"
                        onChange={(e) => updateClipFile(index, e.target.files?.[0] || null)}
                        className="text-[11px] font-bold py-5 bg-white border-2 cursor-pointer flex-1"
                      />
                      <div className="relative">
                        <Input 
                          type="number"
                          value={clip.duration}
                          onChange={(e) => updateClipDuration(index, parseInt(e.target.value))}
                          className="w-20 text-center text-[10px] font-bold py-5 bg-white border-2 pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-neutral-400">f</span>
                      </div>
                    </div>
                  </div>
                ))}

                <Button 
                  variant="outline" 
                  onClick={addClip}
                  className="w-full border-dashed border-2 py-8 rounded-xl text-neutral-400 hover:text-indigo-600 hover:border-indigo-100 transition-all uppercase text-[10px] font-black tracking-widest gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Clip
                </Button>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="p-6 border-b border-neutral-50 bg-neutral-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Settings2 className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-black uppercase tracking-widest italic">Global Settings</CardTitle>
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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Rendering Engine</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={!useLambda ? "default" : "outline"}
                        onClick={() => setUseLambda(false)}
                        className="flex-1 text-[10px] font-black uppercase tracking-widest py-4 h-auto gap-2"
                      >
                        Local Server
                      </Button>
                      <Button
                        variant={useLambda ? "default" : "outline"}
                        onClick={() => setUseLambda(true)}
                        className={`flex-1 text-[10px] font-black uppercase tracking-widest py-4 h-auto gap-2 ${useLambda ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                      >
                        <Zap className="w-3 h-3" />
                        AWS Lambda
                      </Button>
                    </div>
                    {useLambda && (
                      <p className="text-[9px] font-bold text-orange-600 uppercase tracking-tight bg-orange-50 p-2 rounded-lg border border-orange-100">
                        Note: AWS Lambda requires all assets to be hosted on public URLs (e.g. Supabase). Local file uploads may not work.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Aspect Ratio</Label>
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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Light Leak Asset</Label>
                    <Input 
                      type="file"
                      accept="video/*"
                      onChange={(e) => setLightLeakFile(e.target.files?.[0] || null)}
                      className="text-[11px] font-bold py-5 bg-neutral-50/50 border-2 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Transition Duration</Label>
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

          <div className="lg:col-span-7">
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
                  <p className="text-xl font-black uppercase italic tracking-tighter">Manufacturing Video</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-neutral-500 group cursor-pointer" onClick={handleRender}>
                  <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center border-4 border-neutral-800/50 transition-all group-hover:scale-110 group-hover:bg-neutral-700">
                    <Play className="w-8 h-8 opacity-20 fill-current" />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-black uppercase tracking-widest opacity-20 italic">Ready for Build</p>
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
