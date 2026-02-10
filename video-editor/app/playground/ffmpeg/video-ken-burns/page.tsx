"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Upload, Video, Loader2, Download, 
  X, ZoomIn, Play, History, Settings2, Sparkles, Monitor,
  MoveRight, Maximize2, Minimize2, Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FFMPEG_SERVER = "http://localhost:3333";

export default function VideoKenBurnsPage() {
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [zoomType, setZoomType] = useState<"in" | "out" | "pan">("in");
  const [aspectRatio, setAspectRatio] = useState<"landscape" | "portrait">("landscape");

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setVideoUrl(URL.createObjectURL(file));
      setOutputUrl(null);
      setError(null);
    }
  };

  const handleApplyKenBurns = async () => {
    if (!video) {
      setError("Please select a video file");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(`Applying ${zoomType === "in" ? "Zoom In" : zoomType === "out" ? "Zoom Out" : "Cinematic Pan"}...`);

    try {
      const formData = new FormData();
      formData.append("files", video);
      formData.append("zoomType", zoomType);
      formData.append("aspectRatio", aspectRatio);

      const response = await fetch("/api/ffmpeg/video-ken-burns", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply Ken Burns effect");
      }

      setProgress("Optics finalized!");
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
    if (fileRef.current) fileRef.current.value = "";
    setOutputUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="h-20 border-b border-neutral-100 flex items-center justify-between px-12 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/playground/ffmpeg">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-neutral-400" />
            </Button>
          </Link>
          <div className="flex flex-col pt-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-black tracking-tight uppercase italic text-neutral-900">Video Ken Burns</h1>
              <Badge variant="outline" className="bg-indigo-50/50 text-indigo-600 border-indigo-100 font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">Optics v2</Badge>
            </div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Dynamic Motion & Perspective Lab</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-neutral-50 rounded-full border border-neutral-100">
              <Monitor className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Node: Local FFmpeg-7.0</span>
           </div>
           <Settings2 className="w-5 h-5 text-neutral-300 cursor-not-allowed" />
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-8">
             <Card className="border-0 bg-white ring-1 ring-neutral-100 shadow-2xl shadow-neutral-200/50 rounded-3xl overflow-hidden">
                <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 p-8">
                   <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">Motion Config</CardTitle>
                      <History className="w-4 h-4 text-neutral-300" />
                   </div>
                   <CardDescription className="text-[11px] font-bold text-neutral-400 leading-relaxed uppercase tracking-tight">
                     Apply cinematic motion to existing video footage.
                   </CardDescription>
                </CardHeader>
                
                <CardContent className="p-8 space-y-10">
                   {/* Aspect Ratio Selection */}
                   <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-50 pb-2 flex justify-between items-center w-full">
                        <span>Aspect Ratio</span>
                        <Maximize2 className="w-3 h-3 text-indigo-400" />
                      </label>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button 
                          variant={aspectRatio === "landscape" ? "default" : "outline"}
                          className={`flex items-center gap-3 h-14 rounded-2xl border-2 transition-all duration-300 ${
                            aspectRatio === "landscape" 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                            : "bg-white text-neutral-500 border-neutral-100 hover:border-neutral-200"
                          }`}
                          onClick={() => setAspectRatio("landscape")}
                        >
                          <Monitor className={`w-4 h-4 ${aspectRatio === "landscape" ? "text-white" : "text-neutral-300"}`} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Landscape</span>
                        </Button>
                        <Button 
                          variant={aspectRatio === "portrait" ? "default" : "outline"}
                          className={`flex items-center gap-3 h-14 rounded-2xl border-2 transition-all duration-300 ${
                            aspectRatio === "portrait" 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                            : "bg-white text-neutral-500 border-neutral-100 hover:border-neutral-200"
                          }`}
                          onClick={() => setAspectRatio("portrait")}
                        >
                          <Smartphone className={`w-4 h-4 ${aspectRatio === "portrait" ? "text-white" : "text-neutral-300"}`} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Portrait</span>
                        </Button>
                      </div>
                   </div>

                   {/* Mode Selection */}
                   <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-50 pb-2 flex justify-between items-center w-full">
                        <span>Motion Preset</span>
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                      </label>
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <Button 
                          variant={zoomType === "in" ? "default" : "outline"}
                          className={`flex flex-col gap-2 h-24 rounded-2xl border-2 transition-all duration-300 ${
                            zoomType === "in" 
                            ? "bg-indigo-600 text-white border-indigo-600 scale-[1.02] shadow-xl shadow-indigo-200" 
                            : "bg-white text-neutral-500 border-neutral-100 hover:border-neutral-200"
                          }`}
                          onClick={() => setZoomType("in")}
                        >
                          <Maximize2 className={`w-5 h-5 ${zoomType === "in" ? "text-white" : "text-neutral-300"}`} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Zoom In</span>
                        </Button>
                        <Button 
                          variant={zoomType === "out" ? "default" : "outline"}
                          className={`flex flex-col gap-2 h-24 rounded-2xl border-2 transition-all duration-300 ${
                            zoomType === "out" 
                            ? "bg-indigo-600 text-white border-indigo-600 scale-[1.02] shadow-xl shadow-indigo-200" 
                            : "bg-white text-neutral-500 border-neutral-100 hover:border-neutral-200"
                          }`}
                          onClick={() => setZoomType("out")}
                        >
                          <Minimize2 className={`w-5 h-5 ${zoomType === "out" ? "text-white" : "text-neutral-300"}`} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Zoom Out</span>
                        </Button>
                        <Button 
                          variant={zoomType === "pan" ? "default" : "outline"}
                          className={`flex flex-col gap-2 h-24 rounded-2xl border-2 transition-all duration-300 ${
                            zoomType === "pan" 
                            ? "bg-indigo-600 text-white border-indigo-600 scale-[1.02] shadow-xl shadow-indigo-200" 
                            : "bg-white text-neutral-500 border-neutral-100 hover:border-neutral-200"
                          }`}
                          onClick={() => setZoomType("pan")}
                        >
                          <MoveRight className={`w-5 h-5 ${zoomType === "pan" ? "text-white" : "text-neutral-300"}`} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Slow Pan</span>
                        </Button>
                      </div>
                   </div>

                   {/* File Input */}
                   <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Source Footage</label>
                      <div 
                        onClick={() => fileRef.current?.click()}
                        className={`group relative overflow-hidden h-40 rounded-3xl border-2 border-dashed transition-all duration-500 cursor-pointer flex flex-col items-center justify-center gap-4 ${
                          video 
                          ? "border-green-400 bg-green-50/30" 
                          : "border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 hover:border-indigo-200"
                        }`}
                      >
                         {!video ? (
                            <>
                               <div className="p-4 bg-white rounded-2xl shadow-sm border border-neutral-100 group-hover:scale-110 transition-transform duration-500">
                                  <Upload className="w-5 h-5 text-indigo-500" />
                               </div>
                               <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-indigo-500 transition-colors">Select MP4 Source</span>
                            </>
                         ) : (
                            <div className="text-center p-6 w-full h-full flex flex-col items-center justify-center">
                               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-green-100 mb-2">
                                  <Video className="w-5 h-5 text-green-500" />
                               </div>
                               <p className="text-[10px] font-black text-green-700 truncate max-w-[200px] uppercase tracking-tight">{video.name}</p>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); clearVideo(); }}
                                 className="mt-4 p-2 hover:bg-green-100 rounded-full transition-colors group/x"
                               >
                                  <X className="w-3 h-3 text-green-600 group-hover/x:rotate-90 transition-transform" />
                               </button>
                            </div>
                         )}
                         <input type="file" ref={fileRef} className="hidden" accept="video/mp4" onChange={handleFileSelect} />
                      </div>
                   </div>

                   {/* Apply Button */}
                   <Button 
                    disabled={!video || isProcessing}
                    onClick={handleApplyKenBurns}
                    className={`w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 ${
                      isProcessing 
                      ? "bg-neutral-100 text-neutral-400 border border-neutral-200" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 hover:scale-[1.02]"
                    }`}
                   >
                     {isProcessing ? (
                       <div className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Rendering Optics...</span>
                       </div>
                     ) : (
                       <div className="flex items-center gap-3">
                          <Play className="w-4 h-4 fill-current" />
                          <span>Generate Motion</span>
                       </div>
                     )}
                   </Button>
                </CardContent>
             </Card>

             {/* Status Card */}
             {isProcessing && (
                <Card className="border-0 bg-indigo-600 text-white rounded-3xl p-8 shadow-2xl shadow-indigo-300 flex items-center gap-6 animate-in slide-in-from-bottom-5">
                   <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/10 animate-pulse" />
                      <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 text-indigo-100">Engine Output</span>
                      <p className="font-black italic text-lg tracking-tight leading-none">{progress}</p>
                   </div>
                </Card>
             )}

             {error && (
                <Card className="border-0 bg-red-50 text-red-600 rounded-3xl p-8 border border-red-100 animate-in shake-1">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-red-100">
                         <X className="w-4 h-4" />
                      </div>
                      <div>
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400">Optics Error</span>
                         <p className="text-[11px] font-bold leading-relaxed">{error}</p>
                      </div>
                   </div>
                </Card>
             )}
          </div>

          {/* Main Stage */}
          <div className="lg:col-span-8 flex flex-col gap-8">
             <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-green-400 ring-4 ring-green-50'}`} />
                      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-900 italic">Optics Preview Stage</h2>
                   </div>
                   <div className="flex gap-2">
                       <Badge variant="outline" className="rounded-full border-neutral-100 text-neutral-400 font-bold uppercase text-[9px] tracking-widest px-3">
                         {aspectRatio === "landscape" ? "1080p" : "1080x1920"}
                       </Badge>
                       <Badge variant="outline" className="rounded-full border-neutral-100 text-neutral-400 font-bold uppercase text-[9px] tracking-widest px-3">30FPS</Badge>
                   </div>
                </div>

                <div className={`relative group transition-all duration-500 rounded-[3rem] bg-neutral-50 ring-1 ring-neutral-100 overflow-hidden shadow-2xl shadow-neutral-200/50 border-[12px] border-white ${
                  aspectRatio === "landscape" ? "aspect-video" : "aspect-[9/16] max-w-[450px] mx-auto"
                }`}>
                   {!outputUrl && !videoUrl ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                         <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center border border-neutral-50">
                            <Video className="w-8 h-8 text-neutral-200" />
                         </div>
                         <div className="text-center max-w-[280px]">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300 mb-2">Stage Empty</p>
                            <p className="text-[11px] font-bold text-neutral-400/80 leading-relaxed uppercase italic">Select footpage to engage kinetic motion processing engine.</p>
                         </div>
                      </div>
                   ) : (
                      <video 
                        key={outputUrl || videoUrl} // Force re-render on source change
                        src={outputUrl || videoUrl || ""} 
                        controls 
                        autoPlay 
                        loop
                        className="w-full h-full object-contain transition-all duration-700 bg-black"
                      />
                   )}
                </div>
             </div>

             {outputUrl && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100/50">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-green-100">
                            <Sparkles className="w-4 h-4 text-green-500" />
                         </div>
                         <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-400">Processor Success</span>
                            <p className="text-[11px] font-bold text-green-700 uppercase italic">Motion signals successfully mapped to source footage.</p>
                         </div>
                      </div>

                      <Link href={outputUrl} download={`ken-burns-${aspectRatio}-${Date.now()}.mp4`}>
                        <Button className="h-14 px-8 rounded-2xl bg-neutral-900 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 shadow-xl shadow-neutral-200 hover:scale-[1.05] transition-all">
                          <Download className="w-4 h-4" />
                          <span>Manifest Output</span>
                        </Button>
                      </Link>
                   </div>
                </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}
