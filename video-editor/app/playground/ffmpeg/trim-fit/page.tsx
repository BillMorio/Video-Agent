"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Upload, Video, Loader2, Download, 
  X, Scissors, Gauge, Clock, Sparkles, CheckCircle2,
  ChevronRight, Timer, Monitor, History, Settings2,
  Play, Film
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FFMPEG_SERVER = "http://localhost:3333";

// Helper to format seconds to HH:MM:SS
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Helper to parse HH:MM:SS to seconds
function parseTime(timeStr: string): number {
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parseFloat(timeStr) || 0;
}

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

export default function TrimFitPage() {
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"trim" | "fit">("trim");

  // Trim controls
  const [startTime, setStartTime] = useState<string>("00:00:00");
  const [duration, setDuration] = useState<string>("00:00:10");

  // Fit controls
  const [targetDuration, setTargetDuration] = useState<number>(10);

  const videoRef = useRef<HTMLInputElement>(null);

  // Get video metadata when file is selected
  useEffect(() => {
    if (video) {
      const url = URL.createObjectURL(video);
      setVideoUrl(url);

      const videoEl = document.createElement("video");
      videoEl.onloadedmetadata = () => {
        setMetadata({
          duration: videoEl.duration,
          width: videoEl.videoWidth,
          height: videoEl.videoHeight,
        });
        setTargetDuration(Math.round(videoEl.duration));
      };
      videoEl.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [video]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setOutputUrl(null);
      setError(null);
      setErrorDetails(null);
    }
  };

  const clearVideo = () => {
    setVideo(null);
    setVideoUrl(null);
    setMetadata(null);
    setOutputUrl(null);
    setError(null);
    setErrorDetails(null);
    if (videoRef.current) {
      videoRef.current.value = "";
    }
  };

  const handleTrim = async () => {
    if (!video) {
      setError("Please select a video");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setErrorDetails(null);
    setProgress("Uploading video...");

    try {
      const formData = new FormData();
      formData.append("file", video);
      formData.append("start", startTime);
      formData.append("duration", duration);

      setProgress("Trimming with FFmpeg...");

      const response = await fetch(`${FFMPEG_SERVER}/api/trim`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorDetails(data.details || null);
        throw new Error(data.error || "Failed to trim video");
      }

      setProgress("Complete!");
      setOutputUrl(`${FFMPEG_SERVER}${data.outputFile}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFit = async () => {
    if (!video) {
      setError("Please select a video");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setErrorDetails(null);
    setProgress("Uploading video...");

    try {
      const formData = new FormData();
      formData.append("file", video);
      formData.append("targetDuration", targetDuration.toString());

      setProgress("Adjusting speed with FFmpeg...");

      const response = await fetch(`${FFMPEG_SERVER}/api/speed`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorDetails(data.details || null);
        throw new Error(data.error || "Failed to adjust video speed");
      }

      setProgress(`Complete! Speed: ${data.speedApplied}x`);
      setOutputUrl(`${FFMPEG_SERVER}${data.outputFile}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 selection:bg-indigo-100 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-4">
            <Link 
              href="/playground/ffmpeg" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              FFmpeg Playground
            </Link>
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-emerald-600">Trim & Fit</h1>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Temporal Processing Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-neutral-100 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Live Backend Node</span>
             </div>
             <Button
                onClick={activeTab === 'trim' ? handleTrim : handleFit}
                disabled={!video || isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Timer className="w-4 h-4 mr-3" />
                    Apply {activeTab === 'trim' ? 'Trim' : 'Warp'}
                  </>
                )}
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Controls (Inputs on Left) */}
          <div className="lg:col-span-4 space-y-6">
             {/* Source Signal */}
             <Card className={`border-2 transition-all duration-300 shadow-none rounded-2xl overflow-hidden ${
                video ? "border-indigo-200 bg-white" : "border-neutral-200 border-dashed bg-neutral-50/50"
             }`}>
                <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                   <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 italic">Source Monitor</span>
                   {video && (
                     <button onClick={clearVideo} className="p-1 hover:bg-neutral-100 rounded-md transition-colors text-neutral-300">
                       <X className="w-3 h-3" />
                     </button>
                   )}
                </CardHeader>
                <CardContent className="p-4 pt-4">
                   {video ? (
                     <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <div className="w-16 h-10 bg-black rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                           <video src={videoUrl || ""} className="w-full h-full object-cover" muted />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-neutral-800 truncate uppercase tracking-tight">{video.name}</p>
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
                             {formatTime(metadata?.duration || 0)} &bull; {metadata?.width}x{metadata?.height}
                          </p>
                        </div>
                     </div>
                   ) : (
                     <div onClick={() => videoRef.current?.click()} className="cursor-pointer group flex flex-col items-center justify-center py-12 space-y-4 text-center">
                        <div className="w-12 h-12 rounded-2xl border border-neutral-200 flex items-center justify-center text-neutral-300 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                           <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Initialize Stream</p>
                     </div>
                   )}
                   <input ref={videoRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                </CardContent>
             </Card>

             {/* Dynamic Configuration */}
             <Card className="border-neutral-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="p-0">
                   <div className="flex p-2 bg-neutral-100/50">
                      <button
                        onClick={() => setActiveTab("trim")}
                        className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeTab === "trim" ? "bg-white text-emerald-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                        }`}
                      >
                        Trim Cut
                      </button>
                      <button
                        onClick={() => setActiveTab("fit")}
                        className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeTab === "fit" ? "bg-white text-emerald-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                        }`}
                      >
                        Time Fit
                      </button>
                   </div>
                </CardHeader>
                <CardContent className="p-6">
                   {activeTab === "trim" ? (
                     <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                           <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 italic">Mark In</label>
                              <div className="relative">
                                 <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                 <input
                                   type="text"
                                   value={startTime}
                                   onChange={(e) => setStartTime(e.target.value)}
                                   className="w-full bg-neutral-50 border border-neutral-100 rounded-xl pl-12 pr-4 py-4 text-xs font-black text-neutral-900 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                                 />
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 italic">Delta Duration</label>
                              <div className="relative">
                                 <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                 <input
                                   type="text"
                                   value={duration}
                                   onChange={(e) => setDuration(e.target.value)}
                                   className="w-full bg-neutral-50 border border-neutral-100 rounded-xl pl-12 pr-4 py-4 text-xs font-black text-neutral-900 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                                 />
                              </div>
                           </div>
                        </div>
                        
                        {metadata && (
                          <div className="p-4 rounded-xl bg-neutral-900 text-white flex flex-col gap-2">
                             <div className="flex justify-between items-center opacity-40">
                                <span className="text-[9px] font-black uppercase tracking-widest">Mark Sequence</span>
                             </div>
                             <div className="flex items-center justify-between font-mono text-xs">
                                <span className="text-emerald-400 font-black">{startTime}</span>
                                <ChevronRight className="w-3 h-3 text-neutral-700" />
                                <span className="text-indigo-400 font-black">{formatTime(parseTime(startTime) + parseTime(duration))}</span>
                             </div>
                          </div>
                        )}
                     </div>
                   ) : (
                     <div className="space-y-8">
                        <div className="space-y-4">
                           <div className="flex justify-between items-end">
                              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 italic">Target Interval</label>
                              <span className="text-xl font-black italic text-emerald-600 font-mono">{targetDuration}s</span>
                           </div>
                           <input
                             type="range"
                             min={metadata ? Math.ceil(metadata.duration / 4) : 1}
                             max={metadata ? Math.ceil(metadata.duration * 4) : 60}
                             value={targetDuration}
                             onChange={(e) => setTargetDuration(parseInt(e.target.value))}
                             className="w-full h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                           />
                        </div>

                        {metadata && (
                          <div className="grid grid-cols-2 gap-3">
                             <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-center space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Time-Warp Scalar</p>
                                <p className={`text-sm font-black italic ${(metadata.duration / targetDuration) > 1 ? 'text-orange-500' : 'text-indigo-500'}`}>
                                  {(metadata.duration / targetDuration).toFixed(2)}x
                                </p>
                             </div>
                             <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-center space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Signal Shift</p>
                                <p className="text-sm font-black italic text-neutral-700">
                                  {Math.abs(metadata.duration - targetDuration).toFixed(1)}s
                                </p>
                             </div>
                          </div>
                        )}
                     </div>
                   )}
                </CardContent>
             </Card>

             <Card className="border-neutral-200 shadow-sm rounded-2xl bg-neutral-900 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-4">
                   <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />
                       <Badge className="bg-white/5 border-none text-white/40 text-[8px] font-black uppercase tracking-widest px-2 py-0">Node Core v4</Badge>
                   </div>
                   <div className="space-y-1">
                       <p className="text-xs font-black uppercase italic tracking-tighter text-white">Temporal Consistency Layer</p>
                       <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest leading-relaxed italic">
                          Precision bit-rate matching <br /> enabled for all time-warp ops.
                       </p>
                   </div>
                </div>
             </Card>
          </div>

          {/* Main Stage - Output Monitor (Monitor on Right) */}
          <div className="lg:col-span-8 space-y-6">
             <Card className="border-neutral-200 bg-white shadow-2xl rounded-[2rem] overflow-hidden border-4">
                <CardHeader className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                       <Monitor className="w-4 h-4 text-emerald-500" />
                       Primary Output Signal
                    </CardTitle>
                  </div>
                  {outputUrl && (
                    <Badge className="bg-emerald-500 text-white border-none font-bold uppercase tracking-[0.2em] text-[9px] px-3 py-1">
                      Signal Ready
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
                         <p className="text-sm font-black text-white/30 uppercase tracking-[0.3em]">Temporal Pipeline Standby</p>
                         <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Load video signal and configure parameters</p>
                       </div>
                    </div>
                  )}
                  
                  {outputUrl && (
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={outputUrl} download>
                        <Button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 font-bold uppercase tracking-widest text-[10px] rounded-xl px-6 py-4">
                          <Download className="w-4 h-4 mr-2" />
                          Download Result
                        </Button>
                      </a>
                    </div>
                  )}
                </CardContent>
             </Card>

             <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <History className="w-4 h-4 text-neutral-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 truncate max-w-md">
                    {progress || "Awaiting operation..."}
                  </p>
                </div>
             </div>

             {error && (
               <Card className="border-rose-200 bg-rose-50/50 shadow-none rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  <CardHeader className="px-6 py-4 border-b border-rose-100 flex flex-row items-center gap-3">
                    <X className="w-5 h-5 text-rose-500" />
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-rose-600">Pipeline Fault</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-sm font-bold text-rose-500 leading-relaxed">{error}</p>
                    {errorDetails && (
                      <div className="p-4 bg-rose-900/90 rounded-xl border border-rose-800 font-mono text-[10px] text-rose-100 whitespace-pre-wrap overflow-x-auto shadow-inner max-h-48 overflow-y-auto">
                        <p className="font-black text-rose-400 mb-2 uppercase tracking-widest text-[9px]">// Diagnostic Trace:</p>
                        {errorDetails}
                      </div>
                    )}
                  </CardContent>
               </Card>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
