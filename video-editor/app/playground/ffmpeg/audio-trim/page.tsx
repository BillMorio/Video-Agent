"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Upload, Scissors, Loader2, Download, 
  X, Music, Activity, Play, History, Settings2, 
  Clock, Speaker, Mic2, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FFMPEG_SERVER = "http://localhost:3333";

export default function AudioTrimPage() {
  const [audio, setAudio] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  
  // Audio State
  const [startTime, setStartTime] = useState<string>("0.000");
  const [duration, setDuration] = useState<string>("10.000");
  const [metadata, setMetadata] = useState<any>(null);

  const audioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudio(file);
      setAudioUrl(URL.createObjectURL(file));
      setOutputUrl(null);
      setError(null);
      setErrorDetails(null);
      
      // Probe metadata
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${FFMPEG_SERVER}/api/probe`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.streams) {
            const audioStream = data.streams.find((s: any) => s.codec_type === 'audio');
            setMetadata({
                duration: parseFloat(data.format.duration),
                codec: audioStream?.codec_name,
                bitrate: data.format.bit_rate
            });
        }
      } catch (err) {
        console.error("Probe error:", err);
      }
    }
  };

  const clearAudio = () => {
    setAudio(null);
    setAudioUrl(null);
    setOutputUrl(null);
    setMetadata(null);
    if (audioRef.current) audioRef.current.value = "";
  };

  const handleApplyTrim = async () => {
    if (!audio) {
        setError("Please select an audio file");
        return;
    }

    setIsProcessing(true);
    setError(null);
    setErrorDetails(null);

    // Basic temporal validation
    if (metadata && metadata.duration) {
      const startInSec = parseFloat(startTime);
      if (isNaN(startInSec) || startInSec >= metadata.duration) {
        setError(`Start time (${startTime}s) exceeds or is equal to audio duration (${metadata.duration.toFixed(3)}s)`);
        setIsProcessing(false);
        return;
      }
    }

    setProgress("Initializing sonic surgical layer...");

    try {
      const formData = new FormData();
      formData.append("file", audio);
      formData.append("start", startTime);
      formData.append("duration", duration);

      setProgress("Executing temporal audio slice...");

      const response = await fetch(`${FFMPEG_SERVER}/api/audio-trim`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorDetails(data.details || null);
        throw new Error(data.error || "Failed to trim audio");
      }

      setProgress("Sequence extraction complete!");
      setOutputUrl(`${FFMPEG_SERVER}${data.outputFile}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 selection:bg-blue-100 font-sans">
      {/* Header Pipeline */}
      <nav className="border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/playground/ffmpeg">
              <Button variant="ghost" className="rounded-xl hover:bg-neutral-50 group px-3">
                <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
              </Button>
            </Link>
            <div className="h-8 w-[1px] bg-neutral-100" />
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500 text-white border-none text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm">Audio Core v1</Badge>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">Temporal Manipulator</span>
               </div>
               <h1 className="text-xl font-black uppercase tracking-tight text-neutral-900">Audio <span className="text-blue-500 italic">Trimmer</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Pipeline Status</span>
               <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-tight flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready for Input
               </span>
            </div>
            <Button 
              onClick={handleApplyTrim}
              disabled={!audio || isProcessing}
              className="bg-neutral-900 hover:bg-black text-white px-8 py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-neutral-200 disabled:opacity-50 disabled:shadow-none min-w-[200px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4 mr-3" />
                  Extract Segment
                </>
              )}
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar - Controls (Left Side) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Input Signal Slot */}
            <Card className={`border-2 transition-all duration-300 shadow-none rounded-[2rem] overflow-hidden ${
                audio ? "border-blue-200 bg-white" : "border-neutral-200 border-dashed bg-neutral-50/50"
             }`}>
                <CardHeader className="p-6 pb-0 flex flex-row items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 italic">Signal Input</span>
                      <CardTitle className="text-xs font-black uppercase tracking-tight">Sonic Source</CardTitle>
                   </div>
                   {audio && (
                     <button onClick={clearAudio} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-300">
                       <X className="w-4 h-4" />
                     </button>
                   )}
                </CardHeader>
                <CardContent className="p-6">
                   {audio ? (
                     <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                           <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                              <Music className="w-6 h-6" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-black text-neutral-800 truncate uppercase tracking-tight">{audio.name}</p>
                             <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                                {metadata ? `${formatTime(metadata.duration)} • ${metadata.codec?.toUpperCase()} • ${(audio.size / 1024 / 1024).toFixed(2)}MB` : "Analyzing signal..."}
                             </p>
                           </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-inner">
                           <audio src={audioUrl || ""} className="w-full h-8" controls />
                        </div>
                     </div>
                   ) : (
                     <div onClick={() => audioRef.current?.click()} className="cursor-pointer group flex flex-col items-center justify-center py-20 space-y-6 text-center border-2 border-dashed border-neutral-200 rounded-[2rem] hover:border-blue-400 transition-all bg-white hover:bg-blue-50/30">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-300 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-500 shadow-sm">
                           <Upload className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400">Capture Audio Stream</p>
                           <p className="text-[10px] font-bold text-neutral-300 uppercase italic">Supported: MP3, WAV, AAC, M4A</p>
                        </div>
                     </div>
                   )}
                   <input ref={audioRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
                </CardContent>
             </Card>

             {/* Precision Parameters */}
             <Card className="border-neutral-200 shadow-sm rounded-[2rem] bg-white overflow-hidden border-2">
                <CardHeader className="p-6 border-b border-neutral-50">
                   <div className="flex items-center gap-2">
                       <Settings2 className="w-4 h-4 text-blue-500" />
                       <CardTitle className="text-xs font-black uppercase tracking-widest italic">Surgical Controls</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Temporal Offset (Start)</label>
                                <div className="flex gap-2">
                                  {metadata && (
                                    <Badge variant="secondary" className="text-[8px] bg-neutral-100 text-neutral-500 border-none font-bold">MAX: {metadata.duration.toFixed(3)}s</Badge>
                                  )}
                                  <Badge variant="outline" className="text-[9px] font-mono border-blue-100 text-blue-600">SECONDS</Badge>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300 group-focus-within:text-blue-500 transition-colors">
                                   <Clock className="w-full h-full" />
                                </div>
                                <input
                                    type="text"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-neutral-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono tracking-tighter shadow-sm"
                                    placeholder="0.000"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Segment Duration</label>
                                <Badge variant="outline" className="text-[9px] font-mono border-blue-100 text-blue-600">SECONDS</Badge>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300 group-focus-within:text-blue-500 transition-colors">
                                   <Activity className="w-full h-full" />
                                </div>
                                <input
                                    type="text"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-neutral-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono tracking-tighter shadow-sm"
                                    placeholder="1.000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-blue-900 text-white flex flex-col gap-3 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:bg-white/10 transition-all duration-700" />
                        <div className="flex justify-between items-center opacity-40">
                            <span className="text-[9px] font-black uppercase tracking-widest">Active Extract Pipeline</span>
                            <div className="flex gap-1">
                               <div className="w-1 h-3 bg-white/20 rounded-full animate-bounce [animation-delay:0.1s]" />
                               <div className="w-1 h-3 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                               <div className="w-1 h-2 bg-white/20 rounded-full animate-bounce [animation-delay:0.3s]" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between font-mono text-xs relative z-10">
                            <span className="text-blue-400 font-bold">IN: <span className="text-white font-black">{parseFloat(startTime).toFixed(3)}s</span></span>
                            <div className="h-[1px] w-8 bg-blue-700 mx-2" />
                            <span className="text-blue-400 font-bold">DELTA: <span className="text-white font-black">{parseFloat(duration).toFixed(3)}s</span></span>
                        </div>
                    </div>
                </CardContent>
             </Card>

             <Card className="border-neutral-200 shadow-sm rounded-2xl bg-blue-600 p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
                <div className="relative z-10 space-y-4">
                   <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)] animate-pulse" />
                       <Badge className="bg-white/20 border-none text-white text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full">HQ Precision</Badge>
                   </div>
                   <div className="space-y-1">
                       <p className="text-sm font-black uppercase italic tracking-tight text-white">Lossless Extraction</p>
                       <p className="text-[10px] font-bold text-blue-100/60 uppercase tracking-widest leading-relaxed">
                          Utilizing surgically precise <br /> streamcopy for zero quality loss.
                       </p>
                   </div>
                </div>
             </Card>
          </div>

          {/* Main Stage - Audio Mirror (Right Side) */}
          <div className="lg:col-span-8 space-y-8">
             <Card className="border-neutral-200 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden border-4">
                <CardHeader className="px-10 py-8 border-b border-neutral-100 bg-neutral-50/30 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3 italic">
                       <div className="p-2 bg-blue-50 rounded-xl">
                          <Speaker className="w-5 h-5 text-blue-500" />
                       </div>
                       Output Signal Monitor
                    </CardTitle>
                  </div>
                  {outputUrl && (
                    <Badge className="bg-emerald-500 text-white border-none font-bold uppercase tracking-[0.2em] text-[9px] px-4 py-1.5 rounded-full shadow-lg shadow-emerald-100">
                      Signal Active
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-0 bg-neutral-900 h-[400px] relative group overflow-hidden">
                  {/* Waveform Visualization Placeholder */}
                  <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                     <div className="flex items-end gap-1.5 h-32">
                        {isMounted && [...Array(40)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1.5 bg-blue-500 rounded-full transition-all duration-500 ${outputUrl ? 'animate-[pulse_1.5s_infinite]' : ''}`}
                            style={{ 
                                height: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.05}s`
                            }} 
                          />
                        ))}
                     </div>
                  </div>

                  {outputUrl ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-20 space-y-10 z-10 bg-gradient-to-br from-neutral-900 to-black">
                       <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-[0_0_50px_rgba(59,130,246,0.5)] animate-in fade-in zoom-in-50 duration-500">
                          <Play className="w-12 h-12 ml-1" />
                       </div>
                       
                       <div className="w-full max-w-xl space-y-8 animate-in slide-in-from-bottom-5 duration-700">
                          <audio 
                            src={outputUrl} 
                            controls 
                            className="w-full h-12 custom-audio-player"
                            autoPlay
                          />
                          
                          <div className="flex justify-center gap-6">
                            <a href={outputUrl} download>
                                <Button className="bg-white text-black hover:bg-neutral-100 font-black uppercase tracking-widest text-[11px] rounded-2xl px-10 py-7 transition-all flex items-center border border-neutral-100 shadow-xl">
                                <Download className="w-4 h-4 mr-3" />
                                Export Original
                                </Button>
                            </a>
                            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800 font-black uppercase tracking-widest text-[11px] rounded-2xl px-10 py-7">
                                <Save className="w-4 h-4 mr-3" />
                                Save to Library
                            </Button>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-20 space-y-8 z-10 transition-all duration-1000">
                       <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 ease-out animate-pulse">
                          <Mic2 className="w-10 h-10" />
                       </div>
                       <div className="space-y-3">
                         <p className="text-sm font-black text-white/40 uppercase tracking-[0.4em] italic">Stream Standby</p>
                         <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                            Configure surgical parameters and <br /> execute extraction pipeline.
                         </p>
                       </div>
                       
                       {audio && (
                         <div className="pt-4 animate-in fade-in duration-1000">
                            <Button 
                                onClick={handleApplyTrim}
                                variant="ghost" 
                                className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 font-black uppercase tracking-widest text-[10px]"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Preview Input Signal
                            </Button>
                         </div>
                       )}
                    </div>
                  )}
                  
                  {/* Digital Telemetry Overlay */}
                  <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                     <Badge className="bg-black/50 backdrop-blur-md border border-white/10 text-[8px] font-mono text-white/40 px-2 py-0.5">LATENCY: 12ms</Badge>
                     <Badge className="bg-black/50 backdrop-blur-md border border-white/10 text-[8px] font-mono text-white/40 px-2 py-0.5">SAMPLE: 44.1kHz</Badge>
                  </div>
                </CardContent>
             </Card>

             <div className="p-6 rounded-[2rem] bg-neutral-100/50 border-2 border-neutral-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-neutral-100">
                     <History className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic mb-0.5">Command History / Diagnostic Stream</p>
                    <p className="text-[11px] font-bold uppercase tracking-tight text-neutral-600">
                      {progress || "Awaiting operation initialization..."}
                    </p>
                  </div>
                </div>
             </div>

             {error && (
               <Card className="border-rose-200 bg-rose-50/50 shadow-none rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 border-2">
                  <CardHeader className="px-8 py-5 border-b border-rose-100 bg-rose-100/30 flex flex-row items-center gap-4">
                    <div className="p-2 bg-rose-100 rounded-xl">
                       <X className="w-5 h-5 text-rose-500" />
                    </div>
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-rose-600 italic">Sonic Pipeline Breach</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <p className="text-sm font-bold text-rose-500 leading-relaxed italic">"{error}"</p>
                    {errorDetails && (
                      <div className="group relative">
                        <div className="p-6 bg-rose-950 rounded-2xl border-2 border-rose-900/50 font-mono text-[10px] text-rose-200/80 whitespace-pre-wrap overflow-x-auto shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                           <div className="sticky top-0 bg-rose-950 pb-3 flex items-center justify-between border-b border-rose-900/50 mb-4">
                              <p className="font-black text-rose-400 uppercase tracking-[0.2em] text-[9px]">// Diagnostic Trace Logic 4.0 //</p>
                              <Badge className="bg-rose-500/20 text-rose-400 border-none text-[8px]">STDERR</Badge>
                           </div>
                           {errorDetails}
                        </div>
                      </div>
                    )}
                  </CardContent>
               </Card>
             )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-audio-player::-webkit-media-controls-enclosure {
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(244, 63, 94, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
