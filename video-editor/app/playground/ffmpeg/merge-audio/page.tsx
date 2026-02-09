"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Upload, Video, Music, Loader2, Download, 
  X, Play, Activity, Settings2, Sparkles, Film, FileAudio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FFMPEG_SERVER = "http://localhost:3333";

export default function MergeAudioPage() {
  const [video, setVideo] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  const videoRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setVideoUrl(URL.createObjectURL(file));
      setOutputUrl(null);
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudio(file);
      setAudioUrl(URL.createObjectURL(file));
      setOutputUrl(null);
    }
  };

  const handleMux = async () => {
    if (!video || !audio) return;

    setIsProcessing(true);
    setError(null);
    setProgress("Initializing muxing sequence...");

    try {
      const formData = new FormData();
      formData.append("video", video);
      formData.append("audio", audio);

      setProgress("Uploading composite signals...");

      const response = await fetch(`${FFMPEG_SERVER}/api/merge`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Muxing failed");

      setProgress("Signal reconstruction complete!");
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
              <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-indigo-600">Audio Muxer</h1>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Composite Media Reconstruction</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-neutral-100 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Core Active</span>
             </div>
             <Button
                onClick={handleMux}
                disabled={!video || !audio || isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    Muxing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-3" />
                    Apply Mux
                  </>
                )}
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Source Slots */}
          <div className="lg:col-span-4 space-y-6">
             {/* Video Slot */}
             <Card className={`border-2 transition-all duration-300 shadow-none rounded-[1.5rem] overflow-hidden ${
                video ? "border-indigo-200 bg-white shadow-lg shadow-indigo-500/5" : "border-neutral-200 border-dashed bg-neutral-50/50"
             }`}>
                <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                   <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 italic">Visual Carrier</span>
                   {video && (
                     <button onClick={() => { setVideo(null); setVideoUrl(null); }} className="p-1 hover:bg-neutral-100 rounded-md transition-colors text-neutral-300">
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
                          <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.2em]">H.264 Stream</p>
                        </div>
                     </div>
                   ) : (
                     <div onClick={() => videoRef.current?.click()} className="cursor-pointer group flex flex-col items-center justify-center py-10 space-y-3 text-center">
                        <div className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-300 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                           <Film className="w-4 h-4" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Select Video</p>
                     </div>
                   )}
                   <input ref={videoRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
                </CardContent>
             </Card>

             {/* Audio Slot */}
             <Card className={`border-2 transition-all duration-300 shadow-none rounded-[1.5rem] overflow-hidden ${
                audio ? "border-indigo-200 bg-white shadow-lg shadow-indigo-500/5" : "border-neutral-200 border-dashed bg-neutral-50/50"
             }`}>
                <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                   <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 italic">Sonic Package</span>
                   {audio && (
                     <button onClick={() => { setAudio(null); setAudioUrl(null); }} className="p-1 hover:bg-neutral-100 rounded-md transition-colors text-neutral-300">
                       <X className="w-3 h-3" />
                     </button>
                   )}
                </CardHeader>
                <CardContent className="p-4 pt-4">
                   {audio ? (
                     <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <div className="w-12 h-8 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100 shrink-0 text-indigo-400">
                           <Music className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-neutral-800 truncate uppercase tracking-tight">{audio.name}</p>
                          <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Audio Buffer</p>
                        </div>
                     </div>
                   ) : (
                     <div onClick={() => audioRef.current?.click()} className="cursor-pointer group flex flex-col items-center justify-center py-10 space-y-3 text-center">
                        <div className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-300 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                           <FileAudio className="w-4 h-4" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Select Audio</p>
                     </div>
                   )}
                   <input ref={audioRef} type="file" accept="audio/*" onChange={handleAudioSelect} className="hidden" />
                </CardContent>
             </Card>

             {/* Tech Stats */}
             <Card className="border-neutral-200 shadow-sm rounded-2xl bg-neutral-900 p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-4">
                   <div className="flex items-center gap-2">
                      <Settings2 className="w-3 h-3 text-indigo-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Mux Core v1.0</span>
                   </div>
                   <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest leading-relaxed italic">
                      Prioritizing sonic duration. <br /> Visual stream will conform <br /> to audio package bounds.
                   </p>
                </div>
             </Card>
          </div>

          {/* Main Stage - Preview */}
          <div className="lg:col-span-8 space-y-6">
             <Card className="border-neutral-200 bg-white shadow-2xl rounded-[2rem] overflow-hidden border-4">
                <CardHeader className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-row items-center justify-between">
                   <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Play className="w-4 h-4 text-indigo-500" />
                      {outputUrl ? "Production Master" : "Output Monitor"}
                   </CardTitle>
                   <Badge className={`${outputUrl ? 'bg-indigo-500' : 'bg-neutral-200 text-neutral-500'} text-white border-none font-bold uppercase tracking-[0.2em] text-[9px] px-3 py-1`}>
                    {outputUrl ? 'Final Render' : 'Monitoring Slot 01'}
                   </Badge>
                </CardHeader>
                <CardContent className="p-0 bg-neutral-900 aspect-video relative flex items-center justify-center">
                  {outputUrl ? (
                    <video 
                      src={outputUrl} 
                      controls 
                      className="w-full h-full object-contain"
                      autoPlay
                    />
                  ) : (
                    <div className="text-center space-y-6">
                       <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/10 animate-pulse mx-auto">
                          <Activity className="w-10 h-10" />
                       </div>
                       <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Awaiting signal composite</p>
                    </div>
                  )}
                </CardContent>
             </Card>

             <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Activity className="w-4 h-4 text-neutral-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    {progress || "Muxer operational - awaiting user input..."}
                  </p>
                </div>
                {outputUrl && (
                  <a href={outputUrl} download>
                    <Button variant="ghost" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                      <Download className="w-3 h-3 mr-2" />
                      Download Final Master
                    </Button>
                  </a>
                )}
             </div>

             {error && (
               <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-2xl animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-3 text-rose-600 mb-2">
                    <X className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Composite Logic Failure</span>
                  </div>
                  <p className="text-sm font-bold text-rose-500">{error}</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
