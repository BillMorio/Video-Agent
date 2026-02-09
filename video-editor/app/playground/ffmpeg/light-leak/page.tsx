"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Upload, Video, Loader2, Download, 
  X, Film, Sparkles, Blend, ChevronRight, CheckCircle2,
  Monitor, Play, Settings2, History, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FFMPEG_SERVER = "http://localhost:3333";

const COLORS = [
  { name: "Orange", value: "orange" },
  { name: "Yellow", value: "yellow" },
  { name: "White", value: "white" },
  { name: "Red", value: "red" },
  { name: "Gold", value: "gold" },
];

export default function LightLeakPage() {
  const [video1, setVideo1] = useState<File | null>(null);
  const [video2, setVideo2] = useState<File | null>(null);
  const [videoOverlay, setVideoOverlay] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [leakDuration, setLeakDuration] = useState<number>(0.8);

  const video1Ref = useRef<HTMLInputElement>(null);
  const video2Ref = useRef<HTMLInputElement>(null);
  const videoOverlayRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setVideo: (file: File | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setOutputUrl(null);
      setError(null);
      setErrorDetails(null);
    }
  };

  const handleExecuteTransition = async () => {
    if (!video1 || !video2 || !videoOverlay) {
      setError("Please select all 3 required videos (Clip A, Clip B, and Overlay Asset)");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setErrorDetails(null);
    setProgress("Uploading all signals...");

    try {
      const formData = new FormData();
      formData.append("files", video1);
      formData.append("files", video2);
      formData.append("files", videoOverlay);
      formData.append("transitionDuration", leakDuration.toString());

      setProgress("Orchestrating professional optic overlay...");

      const response = await fetch(`${FFMPEG_SERVER}/api/light-leak`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorDetails(data.details || null);
        throw new Error(data.error || "Failed to generate transition");
      }

      setProgress("Reconstruction Complete!");
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
    variant = "default"
  }: {
    video: File | null;
    setVideo: (file: File | null) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    label: string;
    variant?: "default" | "accent";
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
        video 
          ? (variant === "accent" ? "border-amber-400 bg-amber-50/20" : "border-neutral-200 bg-neutral-50/10") 
          : "border-neutral-200 border-dashed bg-neutral-50/50"
      }`}>
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
          <CardDescription className={`text-[10px] font-black uppercase tracking-widest ${
            variant === "accent" ? "text-amber-600" : "text-neutral-400"
          }`}>{label}</CardDescription>
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
                <p className={`text-[9px] font-black uppercase tracking-widest leading-none ${
                  variant === "accent" ? "text-amber-600" : "text-neutral-400"
                }`}>Signal Active</p>
              </div>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer group flex items-center gap-3 py-2"
            >
              <div className={`w-10 h-10 bg-white border border-neutral-200 rounded-lg flex items-center justify-center text-neutral-300 transition-all ${
                variant === "accent" ? "group-hover:text-amber-600 group-hover:border-amber-400" : "group-hover:text-neutral-600"
              }`}>
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-neutral-400 group-hover:text-neutral-600 uppercase tracking-widest">Load Clip</p>
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
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 selection:bg-amber-100 font-sans">
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
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Light Leak Transition</h1>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Cross-dissolve + Professional Screen Overlays</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-neutral-100 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Optics Ready</span>
             </div>
             <Button
                onClick={handleExecuteTransition}
                disabled={!video1 || !video2 || !videoOverlay || isProcessing}
                className="bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl shadow-xl shadow-amber-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    Overlaying...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-3" />
                    Execute Transition
                  </>
                )}
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Controls */}
          <div className="lg:col-span-4 space-y-6">
             {/* Input Signals */}
             <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Video className="w-4 h-4 text-neutral-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Source Clips</span>
                </div>
                <div className="flex flex-col gap-3">
                  <VideoSlot video={video1} setVideo={setVideo1} inputRef={video1Ref} label="Clip A (Start)" />
                  <VideoSlot video={video2} setVideo={setVideo2} inputRef={video2Ref} label="Clip B (End)" />
                </div>
             </div>

             {/* Overlay Asset */}
             <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 italic">Optic Overlay Asset</span>
                </div>
                <VideoSlot 
                  video={videoOverlay} 
                  setVideo={setVideoOverlay} 
                  inputRef={videoOverlayRef} 
                  label="Digital Lens Asset (Leak/Flare)" 
                  variant="accent"
                />
             </div>
             {/* Style Parameters */}
             <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="p-6 border-b border-neutral-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                       <Settings2 className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-black uppercase tracking-widest italic">Transition Optics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Duration</label>
                      <span className="text-lg font-black italic text-amber-600">{leakDuration}s</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="2"
                      step="0.1"
                      value={leakDuration}
                      onChange={(e) => setLeakDuration(parseFloat(e.target.value))}
                      className="w-full h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest text-center leading-normal">
                      Target duration for the overlay blend. <br />
                      Asset will be speed-mapped to fit.
                    </p>
                  </div>
                </CardContent>
             </Card>

             {/* System Telemetry */}
             <Card className="border-neutral-200 shadow-sm rounded-2xl bg-neutral-900 text-white p-6 relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                <div className="space-y-4 relative z-10">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Optic-Core Active</span>
                   </div>
                   <div className="space-y-1">
                      <p className="text-xs font-black uppercase italic tracking-tight">Lens Overlay v17.0 (Expert Final)</p>
                      <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">
                         PTS-Shift Manual Synchronization active. <br />
                         Lighten Blend with Precision Offset (V17).
                      </p>
                   </div>
                </div>
             </Card>
          </div>

          {/* Main Stage - Monitor */}
          <div className="lg:col-span-8 space-y-6">
             <Card className="border-neutral-200 bg-white shadow-2xl rounded-[2rem] overflow-hidden border-4">
                <CardHeader className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-row items-center justify-between transition-all">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                       <Monitor className="w-4 h-4 text-amber-500" />
                       Output Monitor
                    </CardTitle>
                  </div>
                  {outputUrl && (
                    <Badge className="bg-amber-500 text-white border-none font-bold uppercase tracking-[0.2em] text-[9px] px-3 py-1">
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
                         <p className="text-sm font-black text-white/30 uppercase tracking-[0.3em]">Awaiting Optic Signal</p>
                         <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Connect Clips & Execute for synthetic preview</p>
                       </div>
                    </div>
                  )}
                  
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

             {/* Status Bar */}
             <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-neutral-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Optic Log:</span>
                  </div>
                  <p className="text-[10px] font-bold text-neutral-400 truncate max-w-md">
                    {progress || (outputUrl ? "Transformation successful" : "Optic core standby...")}
                  </p>
                </div>
             </div>

             {error && (
               <Card className="border-rose-200 bg-rose-50/50 shadow-none rounded-2xl overflow-hidden">
                  <CardHeader className="px-6 py-4 border-b border-rose-100 flex flex-row items-center gap-3">
                    <X className="w-5 h-5 text-rose-500" />
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-rose-600">Optic Fault Detected</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-sm font-bold text-rose-500 leading-relaxed">{error}</p>
                    {errorDetails && (
                      <div className="p-4 bg-rose-900/90 rounded-xl border border-rose-800 font-mono text-[10px] text-rose-100 whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                        <p className="font-black text-rose-400 mb-2 uppercase tracking-widest text-[9px]">// FFmpeg Trace:</p>
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
