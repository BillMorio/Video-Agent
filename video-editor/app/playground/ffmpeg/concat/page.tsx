"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Upload, Video, Loader2, Download, 
  X, Film, Sparkles, Blend, ChevronRight, CheckCircle2,
  Monitor, Play, Settings2, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FFMPEG_SERVER = "http://localhost:3333";

type TransitionType = "none" | "fade" | "crossfade" | "wipeleft" | "wiperight" | "slideup" | "slidedown";

const TRANSITIONS: { value: TransitionType; label: string; description: string }[] = [
  { value: "none", label: "None", description: "No transition" },
  { value: "fade", label: "Fade", description: "Fade to black" },
  { value: "crossfade", label: "Crossfade", description: "Blend together" },
  { value: "wipeleft", label: "Wipe Left", description: "Wipe to left" },
  { value: "wiperight", label: "Wipe Right", description: "Wipe to right" },
  { value: "slideup", label: "Slide Up", description: "Slide upward" },
  { value: "slidedown", label: "Slide Down", description: "Slide downward" },
];

export default function VideoJoinPage() {
  const [video1, setVideo1] = useState<File | null>(null);
  const [video2, setVideo2] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [transition, setTransition] = useState<TransitionType>("none");
  const [transitionDuration, setTransitionDuration] = useState<number>(1);

  const video1Ref = useRef<HTMLInputElement>(null);
  const video2Ref = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setVideo: (file: File | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setOutputUrl(null);
      setError(null);
      setErrorDetails(null);
    }
  };

  const handleJoinVideos = async () => {
    if (!video1 || !video2) {
      setError("Please select both videos");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setErrorDetails(null);
    setProgress("Uploading videos...");

    try {
      const formData = new FormData();
      formData.append("files", video1);
      formData.append("files", video2);
      formData.append("transition", transition);
      formData.append("transitionDuration", transitionDuration.toString());

      setProgress("Processing with FFmpeg...");

      const response = await fetch(`${FFMPEG_SERVER}/api/concat`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorDetails(data.details || null);
        throw new Error(data.error || "Failed to join videos");
      }

      setProgress("Complete!");
      setOutputUrl(`${FFMPEG_SERVER}${data.outputFile}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearVideo = (setVideo: (file: File | null) => void, ref: React.RefObject<HTMLInputElement | null>) => {
    setVideo(null);
    if (ref.current) {
      ref.current.value = "";
    }
  };

  const VideoSlot = ({
    video,
    setVideo,
    inputRef,
    label,
  }: {
    video: File | null;
    setVideo: (file: File | null) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    label: string;
  }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
      if (video) {
        const url = URL.createObjectURL(video);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setPreviewUrl(null);
      }
    }, [video]);

    return (
      <Card className={`flex-1 border-2 transition-all duration-300 shadow-none ${
        video ? "border-emerald-200 bg-emerald-50/10" : "border-neutral-200 border-dashed bg-neutral-50/50"
      }`}>
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
          <CardDescription className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{label}</CardDescription>
          {video && (
            <button
              onClick={() => clearVideo(setVideo, inputRef)}
              className="p-1 hover:bg-neutral-100 rounded-md transition-colors text-neutral-400"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {video ? (
            <div className="flex items-center gap-3">
              <div className="w-16 h-10 bg-black rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                 {previewUrl && <video src={previewUrl} className="w-full h-full object-cover" muted />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-neutral-800 truncate uppercase tracking-tight">{video.name}</p>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Signal Active</p>
              </div>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer group flex items-center gap-3 py-2"
            >
              <div className="w-10 h-10 bg-white border border-neutral-200 rounded-lg flex items-center justify-center text-neutral-300 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-neutral-400 group-hover:text-neutral-600 uppercase tracking-widest">Load Signal</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={(e) => handleFileSelect(e, setVideo)}
            className="hidden"
          />
        </CardContent>
      </Card>
    );
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
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Video Joiner</h1>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Autonomous Pipeline Component</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-neutral-100 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">System Ready</span>
             </div>
             <Button
                onClick={handleJoinVideos}
                disabled={!video1 || !video2 || isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-3" />
                    Execute Join
                  </>
                )}
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Controls (Inputs on Left) */}
          <div className="lg:col-span-4 space-y-6">
             {/* Input Signals */}
             <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Settings2 className="w-4 h-4 text-neutral-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Input Registry</span>
                </div>
                <div className="flex flex-col gap-3">
                  <VideoSlot video={video1} setVideo={setVideo1} inputRef={video1Ref} label="Stream Alpha" />
                  <VideoSlot video={video2} setVideo={setVideo2} inputRef={video2Ref} label="Stream Beta" />
                </div>
             </div>

             {/* Transition Settings */}
             <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="p-6 border-b border-neutral-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                       <Blend className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-black uppercase tracking-widest italic">Transition FX</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Effect Matrix</label>
                    <div className="grid grid-cols-2 gap-2">
                       {TRANSITIONS.map((t) => (
                         <button
                           key={t.value}
                           onClick={() => setTransition(t.value)}
                           className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                             transition === t.value 
                               ? "bg-neutral-900 text-white border-neutral-900 shadow-lg" 
                               : "bg-neutral-50 text-neutral-500 border-neutral-100 hover:bg-neutral-100 hover:text-neutral-900"
                           }`}
                         >
                           {t.label}
                         </button>
                       ))}
                    </div>
                  </div>

                  {transition !== "none" && (
                    <div className="space-y-4 pt-4 border-t border-neutral-50">
                      <div className="flex justify-between items-end">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Time Scalar</label>
                        <span className="text-lg font-black italic text-indigo-600">{transitionDuration}s</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.5"
                        value={transitionDuration}
                        onChange={(e) => setTransitionDuration(parseFloat(e.target.value))}
                        className="w-full h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest text-center leading-normal">
                         {TRANSITIONS.find(t => t.value === transition)?.description}
                      </p>
                    </div>
                  )}
                </CardContent>
             </Card>

             {/* System Telemetry */}
             <Card className="border-neutral-200 shadow-sm rounded-2xl bg-neutral-900 text-white p-6 relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
                <div className="space-y-4 relative z-10">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Tele-Active</span>
                   </div>
                   <div className="space-y-1">
                      <p className="text-xs font-black uppercase italic tracking-tight">Backend Protocol v2.4</p>
                      <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">
                         Multi-stream xfade orchestrator <br /> active on 127.0.0.1:3333
                      </p>
                   </div>
                </div>
             </Card>
          </div>

          {/* Main Stage - Output Signal (Monitor on Right) */}
          <div className="lg:col-span-8 space-y-6">
             <Card className="border-neutral-200 bg-white shadow-2xl rounded-[2rem] overflow-hidden border-4">
                <CardHeader className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-row items-center justify-between transition-all">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                       <Monitor className="w-4 h-4 text-indigo-500" />
                       Output Monitor
                    </CardTitle>
                  </div>
                  {outputUrl && (
                    <Badge className="bg-emerald-500 text-white border-none font-bold uppercase tracking-[0.2em] text-[9px] px-3 py-1">
                      Signal Active
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
                         <p className="text-sm font-black text-white/30 uppercase tracking-[0.3em]">Awaiting Processing Signal</p>
                         <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Configure Inputs & Execute to preview result</p>
                       </div>
                    </div>
                  )}
                  
                  {/* Overlay Controls */}
                  {outputUrl && (
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={outputUrl} download>
                        <Button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 font-bold uppercase tracking-widest text-[10px] rounded-xl px-6 py-4">
                          <Download className="w-4 h-4 mr-2" />
                          Download MP4
                        </Button>
                      </a>
                    </div>
                  )}
                </CardContent>
             </Card>

             {/* Status / Log Bar */}
             <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-neutral-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Pipeline Log:</span>
                  </div>
                  <p className="text-[10px] font-bold text-neutral-400 truncate max-w-md">
                    {progress || (outputUrl ? "Last operation successful" : "System standby...")}
                  </p>
                </div>
             </div>

             {error && (
               <Card className="border-rose-200 bg-rose-50/50 shadow-none rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  <CardHeader className="px-6 py-4 border-b border-rose-100 flex flex-row items-center gap-3">
                    <X className="w-5 h-5 text-rose-500" />
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-rose-600">Processing Fault Detected</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-sm font-bold text-rose-500 leading-relaxed">{error}</p>
                    {errorDetails && (
                      <div className="p-4 bg-rose-900/90 rounded-xl border border-rose-800 font-mono text-[10px] text-rose-100 whitespace-pre-wrap overflow-x-auto leading-relaxed shadow-inner max-h-48 overflow-y-auto">
                        <p className="font-black text-rose-400 mb-2 uppercase tracking-widest text-[9px]">// FFmpeg Stderr Trace:</p>
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
