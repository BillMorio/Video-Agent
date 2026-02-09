"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Upload, Video, Loader2, Download, 
  X, ZoomIn, Play, History, Settings2, Sparkles, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FFMPEG_SERVER = "http://localhost:3333";

export default function ZoomTransitionPage() {
  const [clipA, setClipA] = useState<File | null>(null);
  const [clipB, setClipB] = useState<File | null>(null);
  const [clipAUrl, setClipAUrl] = useState<string | null>(null);
  const [clipBUrl, setClipBUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [transitionDuration, setTransitionDuration] = useState<number>(1.5);

  const fileRefA = useRef<HTMLInputElement>(null);
  const fileRefB = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, side: "A" | "B") => {
    const file = e.target.files?.[0];
    if (file) {
      if (side === "A") {
        setClipA(file);
        setClipAUrl(URL.createObjectURL(file));
      } else {
        setClipB(file);
        setClipBUrl(URL.createObjectURL(file));
      }
      setOutputUrl(null);
      setError(null);
      setErrorDetails(null);
    }
  };

  const handleApplyTransition = async () => {
    if (!clipA || !clipB) {
      setError("Please select both clips");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setErrorDetails(null);
    setProgress("Uploading sequential signals...");

    try {
      const formData = new FormData();
      formData.append("files", clipA);
      formData.append("files", clipB);
      formData.append("transitionDuration", transitionDuration.toString());

      setProgress("Executing Zoom In optics...");

      const response = await fetch("/api/ffmpeg/zoom-transition", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorDetails(data.details || null);
        throw new Error(data.error || "Failed to apply transition");
      }

      setProgress("Transition finalized!");
      setOutputUrl(`${FFMPEG_SERVER}${data.outputFile}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearClip = (side: "A" | "B") => {
    if (side === "A") {
      setClipA(null);
      setClipAUrl(null);
      if (fileRefA.current) fileRefA.current.value = "";
    } else {
      setClipB(null);
      setClipBUrl(null);
      if (fileRefB.current) fileRefB.current.value = "";
    }
    setOutputUrl(null);
    setError(null);
    setErrorDetails(null);
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
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-indigo-600">Zoom Transition</h1>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Perspective Shift Processing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-neutral-100 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Core Active</span>
             </div>
             <Button
                onClick={handleApplyTransition}
                disabled={!clipA || !clipB || isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-4 h-4 mr-3" />
                    Render Transition
                  </>
                )}
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Parameters */}
          <div className="lg:col-span-4 space-y-6">
             {/* Clip A */}
             <Card className={`border-2 transition-all duration-300 shadow-none rounded-[1.5rem] overflow-hidden ${
                clipA ? "border-indigo-200 bg-white shadow-lg shadow-indigo-500/5" : "border-neutral-200 border-dashed bg-neutral-50/50"
             }`}>
                <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                   <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 italic">Source A (Intro)</span>
                   {clipA && (
                     <button onClick={() => clearClip("A")} className="p-1 hover:bg-neutral-100 rounded-md transition-colors text-neutral-300">
                       <X className="w-3 h-3" />
                     </button>
                   )}
                </CardHeader>
                <CardContent className="p-4 pt-4">
                   {clipA ? (
                     <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <div className="w-12 h-8 bg-black rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                           <video src={clipAUrl || ""} className="w-full h-full object-cover" muted />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-neutral-800 truncate uppercase tracking-tight">{clipA.name}</p>
                          <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Signal A</p>
                        </div>
                     </div>
                   ) : (
                     <div onClick={() => fileRefA.current?.click()} className="cursor-pointer group flex flex-col items-center justify-center py-8 space-y-3 text-center">
                        <div className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-300 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                           <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Select Clip A</p>
                     </div>
                   )}
                   <input ref={fileRefA} type="file" accept="video/*" onChange={(e) => handleFileSelect(e, "A")} className="hidden" />
                </CardContent>
             </Card>

             {/* Clip B */}
             <Card className={`border-2 transition-all duration-300 shadow-none rounded-[1.5rem] overflow-hidden ${
                clipB ? "border-indigo-200 bg-white shadow-lg shadow-indigo-500/5" : "border-neutral-200 border-dashed bg-neutral-50/50"
             }`}>
                <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                   <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 italic">Source B (Outro)</span>
                   {clipB && (
                     <button onClick={() => clearClip("B")} className="p-1 hover:bg-neutral-100 rounded-md transition-colors text-neutral-300">
                       <X className="w-3 h-3" />
                     </button>
                   )}
                </CardHeader>
                <CardContent className="p-4 pt-4">
                   {clipB ? (
                     <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <div className="w-12 h-8 bg-black rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                           <video src={clipBUrl || ""} className="w-full h-full object-cover" muted />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-neutral-800 truncate uppercase tracking-tight">{clipB.name}</p>
                          <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Signal B</p>
                        </div>
                     </div>
                   ) : (
                     <div onClick={() => fileRefB.current?.click()} className="cursor-pointer group flex flex-col items-center justify-center py-8 space-y-3 text-center">
                        <div className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-300 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                           <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Select Clip B</p>
                     </div>
                   )}
                   <input ref={fileRefB} type="file" accept="video/*" onChange={(e) => handleFileSelect(e, "B")} className="hidden" />
                </CardContent>
             </Card>

             {/* Transition Config */}
             <Card className="border-neutral-200 shadow-sm rounded-[1.5rem] bg-white overflow-hidden">
                <CardHeader className="p-6 border-b border-neutral-50">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-neutral-400 italic">Optic Config</h3>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                   <div className="space-y-6">
                      <div className="flex justify-between items-end">
                         <label className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Duration</label>
                         <span className="text-xl font-black italic text-indigo-600 font-mono">{transitionDuration}s</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={transitionDuration}
                        onChange={(e) => setTransitionDuration(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-[8px] font-bold text-neutral-400 uppercase tracking-widest">
                         <span>Snappy</span>
                         <span>Cinematic</span>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-neutral-50">
                      <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center gap-3">
                         <Sparkles className="w-4 h-4 text-indigo-500" />
                         <p className="text-[9px] font-bold text-indigo-700 uppercase tracking-tight">
                            Applying perspective-warp resampler
                         </p>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* Main Stage */}
          <div className="lg:col-span-8 space-y-6">
             <Card className="border-neutral-200 bg-white shadow-2xl rounded-[2rem] overflow-hidden border-4">
                <CardHeader className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-row items-center justify-between">
                   <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                       <Monitor className="w-4 h-4 text-indigo-500" />
                       Output Monitor
                   </CardTitle>
                   <Badge className={`${outputUrl ? 'bg-indigo-500' : 'bg-neutral-200 text-neutral-400'} text-white border-none font-bold uppercase tracking-[0.2em] text-[9px] px-3 py-1`}>
                    {outputUrl ? 'Render Ready' : 'Standby'}
                   </Badge>
                </CardHeader>
                <CardContent className="p-0 bg-neutral-900 aspect-video relative group overflow-hidden flex items-center justify-center">
                  {outputUrl ? (
                    <video 
                      src={outputUrl} 
                      controls 
                      className="w-full h-full object-contain"
                      autoPlay
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-12 space-y-6">
                       <div className={`w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 ${isProcessing ? 'animate-spin' : ''}`}>
                          {isProcessing ? <Loader2 className="w-10 h-10" /> : <Video className="w-10 h-10" />}
                       </div>
                       <div className="space-y-2">
                         <p className="text-sm font-black text-white/30 uppercase tracking-[0.3em] font-sans">
                            {isProcessing ? "Synthesizing Optical Shift..." : "Optical Engine Ready"}
                         </p>
                         <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">
                            Upload sequential signals to begin processing
                         </p>
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
                    {progress || "System running at nominal capacity..."}
                  </p>
                </div>
             </div>

             {error && (
               <Card className="border-rose-200 bg-rose-50 shadow-none rounded-2xl overflow-hidden">
                  <CardHeader className="px-6 py-4 border-b border-rose-100 flex flex-row items-center gap-3 text-rose-600">
                    <X className="w-5 h-5" />
                    <CardTitle className="text-xs font-black uppercase tracking-widest">Optic Error</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm font-bold text-rose-500">{error}</p>
                    {errorDetails && (
                      <div className="mt-4 p-4 bg-rose-900/90 rounded-xl border border-rose-800 font-mono text-[10px] text-rose-100 whitespace-pre-wrap">
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
