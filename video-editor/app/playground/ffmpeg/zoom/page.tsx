"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Upload, Video, Loader2, Download, 
  X, Crosshair, ZoomIn, Search, Sparkles, Monitor,
  Play, History, Settings2, Target, Gauge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FFMPEG_SERVER = "http://localhost:3333";

export default function ZoomPage() {
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  
  // Zoom State
  const [zoomType, setZoomType] = useState<"in" | "out">("in");
  const [startZoom, setStartZoom] = useState<number>(1);
  const [endZoom, setEndZoom] = useState<number>(1.5);
  const [centerX, setCenterX] = useState<number>(0.5);
  const [centerY, setCenterY] = useState<number>(0.5);

  const videoRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Set default start/end based on type
  useEffect(() => {
    if (zoomType === "in") {
      setStartZoom(1);
      setEndZoom(1.5);
    } else {
      setStartZoom(1.5);
      setEndZoom(1);
    }
  }, [zoomType]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setVideoUrl(URL.createObjectURL(file));
      setOutputUrl(null);
      setError(null);
      setErrorDetails(null);
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setCenterX(parseFloat(x.toFixed(3)));
    setCenterY(parseFloat(y.toFixed(3)));
  };

  const handleApplyZoom = async () => {
    if (!video) {
        setError("Please select a video");
        return;
    }

    setIsProcessing(true);
    setError(null);
    setErrorDetails(null);
    setProgress("Uploading source signal...");

    try {
      const formData = new FormData();
      formData.append("file", video);
      formData.append("type", zoomType);
      formData.append("startZoom", startZoom.toString());
      formData.append("endZoom", endZoom.toString());
      formData.append("centerX", centerX.toString());
      formData.append("centerY", centerY.toString());

      setProgress("Executing dynamic zoom optics...");

      const response = await fetch(`${FFMPEG_SERVER}/api/zoom`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorDetails(data.details || null);
        throw new Error(data.error || "Failed to apply zoom effect");
      }

      setProgress("Optics processed!");
      setOutputUrl(`${FFMPEG_SERVER}${data.outputFile}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearVideo = () => {
    setVideo(null);
    setVideoUrl(null);
    setOutputUrl(null);
    setError(null);
    setErrorDetails(null);
    if (videoRef.current) videoRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 selection:bg-violet-100 font-sans">
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
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-violet-600">Zoom Engine</h1>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Dynamic Optics Processing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-neutral-100 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Core Active</span>
             </div>
             <Button
                onClick={handleApplyZoom}
                disabled={!video || isProcessing}
                className="bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl shadow-xl shadow-violet-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-4 h-4 mr-3" />
                    Render Optics
                  </>
                )}
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Parameters (Inputs on Left) */}
          <div className="lg:col-span-4 space-y-6">
             {/* Source Signal */}
             <Card className={`border-2 transition-all duration-300 shadow-none rounded-[1.5rem] overflow-hidden ${
                video ? "border-violet-200 bg-white shadow-lg shadow-violet-500/5" : "border-neutral-200 border-dashed bg-neutral-50/50"
             }`}>
                <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                   <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 italic">Source Signal</span>
                   {video && (
                     <button onClick={clearVideo} className="p-1 hover:bg-neutral-100 rounded-md transition-colors text-neutral-300">
                       <X className="w-3 h-3" />
                     </button>
                   )}
                </CardHeader>
                <CardContent className="p-4 pt-4">
                   {video ? (
                     <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <div className="w-12 h-8 bg-black rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                           <video src={videoUrl || ""} className="w-full h-full object-cover" muted />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-neutral-800 truncate uppercase tracking-tight">{video.name}</p>
                          <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Signal Preview</p>
                        </div>
                     </div>
                   ) : (
                     <div onClick={() => videoRef.current?.click()} className="cursor-pointer group flex flex-col items-center justify-center py-10 space-y-3 text-center">
                        <div className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-300 group-hover:text-violet-600 group-hover:border-violet-200 transition-all">
                           <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Identify Source</p>
                     </div>
                   )}
                   <input ref={videoRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                </CardContent>
             </Card>

             {/* Optic Config */}
             <Card className="border-neutral-200 shadow-sm rounded-[1.5rem] bg-white overflow-hidden">
                <CardHeader className="p-6 border-b border-neutral-50">
                   <div className="flex p-1 bg-neutral-100/50 rounded-xl">
                      <button onClick={() => setZoomType("in")} className={`flex-1 py-2 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${zoomType === "in" ? "bg-white text-violet-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>Zoom In</button>
                      <button onClick={() => setZoomType("out")} className={`flex-1 py-2 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${zoomType === "out" ? "bg-white text-violet-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>Zoom Out</button>
                   </div>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                   {/* Scalar Controls */}
                   <div className="space-y-6">
                      <div className="space-y-6">
                         <div className="flex justify-between items-end">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Intro Scalar</label>
                            <span className="text-xl font-black italic text-violet-600/80 font-mono">{startZoom}x</span>
                         </div>
                         <input
                           type="range"
                           min="1"
                           max="3"
                           step="0.1"
                           value={startZoom}
                           onChange={(e) => setStartZoom(parseFloat(e.target.value))}
                           className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
                         />
                      </div>

                      <div className="space-y-6">
                         <div className="flex justify-between items-end">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Exit Scalar</label>
                            <span className="text-xl font-black italic text-violet-600 font-mono">{endZoom}x</span>
                         </div>
                         <input
                           type="range"
                           min="1"
                           max="3"
                           step="0.1"
                           value={endZoom}
                           onChange={(e) => setEndZoom(parseFloat(e.target.value))}
                           className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
                         />
                      </div>
                   </div>

                   {/* Focal Registry */}
                   <div className="grid grid-cols-2 gap-4 pt-8 border-t border-neutral-50">
                      <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                         <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Anchor X</p>
                         <p className="text-sm font-black text-neutral-700 font-mono">{centerX}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                         <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Anchor Y</p>
                         <p className="text-sm font-black text-neutral-700 font-mono">{centerY}</p>
                      </div>
                   </div>
                </CardContent>
             </Card>

             {/* Telemetry */}
             <Card className="border-neutral-200 shadow-sm rounded-2xl bg-neutral-900 p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-4">
                   <div className="flex items-center gap-2">
                      <Gauge className="w-3 h-3 text-violet-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Optic-Core Active</span>
                   </div>
                   <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest leading-relaxed italic">
                      Hardware-accel lanczos <br /> resampler initialized.
                   </p>
                </div>
             </Card>
          </div>

          {/* Main Stage - Monitoring & Target Selector (Monitor on Right) */}
          <div className="lg:col-span-8 space-y-6">
             <Card className="border-neutral-200 bg-white shadow-2xl rounded-[2rem] overflow-hidden border-4">
                <CardHeader className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                       <Monitor className="w-4 h-4 text-violet-500" />
                       {outputUrl ? "Processed Signal" : "Target Acquisition"}
                    </CardTitle>
                  </div>
                  <Badge className={`${outputUrl ? 'bg-violet-500' : 'bg-neutral-200 text-neutral-500'} text-white border-none font-bold uppercase tracking-[0.2em] text-[9px] px-3 py-1`}>
                    {outputUrl ? 'Final Render' : 'Focal Preview'}
                  </Badge>
                </CardHeader>
                <CardContent className="p-0 bg-neutral-900 aspect-video relative group overflow-hidden">
                  {outputUrl ? (
                    <video 
                      src={outputUrl} 
                      controls 
                      className="w-full h-full object-contain"
                      autoPlay
                    />
                  ) : videoUrl ? (
                    <div 
                      ref={previewContainerRef}
                      onClick={handlePreviewClick}
                      className="w-full h-full relative cursor-crosshair group/preview"
                    >
                      <video src={videoUrl} className="w-full h-full object-contain pointer-events-none opacity-60" />
                      
                      {/* Focal Point Indicator */}
                      <div 
                        className="absolute w-12 h-12 border-2 border-violet-400 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] bg-violet-500/10"
                        style={{ left: `${centerX * 100}%`, top: `${centerY * 100}%` }}
                      >
                         <div className="w-1 h-1 bg-violet-400 rounded-full" />
                         <div className="absolute inset-x-0 h-[1px] bg-violet-400/30 scale-x-[10]" />
                         <div className="absolute inset-y-0 w-[1px] bg-violet-400/30 scale-y-[10]" />
                         <Badge className="absolute -top-8 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[8px] font-black tracking-widest whitespace-nowrap px-2 py-0 border-none">
                            X:{centerX} Y:{centerY}
                         </Badge>
                      </div>

                      {/* Guide Text */}
                      <div className="absolute top-6 left-6 text-[10px] font-black text-white/40 uppercase tracking-widest bg-black/40 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/5">
                         Click to lock focal target
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-6">
                       <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 animate-pulse">
                          <Target className="w-10 h-10" />
                       </div>
                       <div className="space-y-2">
                         <p className="text-sm font-black text-white/30 uppercase tracking-[0.3em]">Optical Registry Standby</p>
                         <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Initialize source signal to define focal center</p>
                       </div>
                    </div>
                  )}
                  
                  {outputUrl && (
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={outputUrl} download>
                        <Button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 font-bold uppercase tracking-widest text-[10px] rounded-xl px-6 py-4">
                          <Download className="w-4 h-4 mr-2" />
                          Export Master
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
                    {progress || "System running at nominal capacity..."}
                  </p>
                </div>
             </div>

             {error && (
               <Card className="border-rose-200 bg-rose-50/50 shadow-none rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  <CardHeader className="px-6 py-4 border-b border-rose-100 flex flex-row items-center gap-3">
                    <X className="w-5 h-5 text-rose-500" />
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-rose-600">Optic Failure Trace</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-sm font-bold text-rose-500 leading-relaxed">{error}</p>
                    {errorDetails && (
                      <div className="p-4 bg-rose-900/90 rounded-xl border border-rose-800 font-mono text-[10px] text-rose-100 whitespace-pre-wrap overflow-x-auto shadow-inner max-h-48 overflow-y-auto">
                        <p className="font-black text-rose-400 mb-2 uppercase tracking-widest text-[9px]">// Core Error Dump:</p>
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
