"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Upload, FileAudio, Loader2, 
  X, Activity, Play, History, Settings2, 
  Clock, Speaker, Mic2, FileText, Zap,
  Languages, Info, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WhisperPlaygroundPage() {
  const [audio, setAudio] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  
  const audioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudio(file);
      setAudioUrl(URL.createObjectURL(file));
      setTranscription(null);
      setError(null);
    }
  };

  const clearAudio = () => {
    setAudio(null);
    setAudioUrl(null);
    setTranscription(null);
    if (audioRef.current) audioRef.current.value = "";
  };

  const handleTranscribe = async () => {
    if (!audio) {
      setError("Please select an audio file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress("Initializing neural acoustic layer...");

    try {
      const formData = new FormData();
      formData.append("file", audio);

      setProgress("Streaming signal to OpenAI cluster...");

      const response = await fetch("/api/ai/whisper", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to transcribe audio");
      }

      setProgress("Mapping lexical temporal offsets...");
      setTranscription(data);
      setProgress("Intelligence extraction complete.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToScenes = () => {
    if (!transcription) return;
    // Persist transcription to localStorage for the next page
    localStorage.setItem("latest_whisper_transcription", JSON.stringify(transcription));
    // Also persist the audio URL explicitly if it exists
    if (transcription.audioUrl) {
      localStorage.setItem("latest_whisper_audio_url", transcription.audioUrl);
    }
    router.push("/playground/openai/whisper/scenes");
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
                  <Badge className="bg-indigo-500 text-white border-none text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm">OpenAI Whisper v3</Badge>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">Acoustic Logic</span>
               </div>
               <h1 className="text-xl font-black uppercase tracking-tight text-neutral-900">Whisper <span className="text-indigo-500 italic">Transcriber</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Model Status</span>
               <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-tight flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online / Latency: Optimal
               </span>
            </div>
            <Button 
              onClick={handleTranscribe}
              disabled={!audio || isProcessing}
              className="bg-neutral-900 hover:bg-black text-white px-8 py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-neutral-200 disabled:opacity-50 disabled:shadow-none min-w-[200px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Mic2 className="w-4 h-4 mr-3" />
                  Initialize Transcription
                </>
              )}
            </Button>
            
            {transcription && (
               <Button 
                 onClick={handleGoToScenes}
                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-indigo-200 min-w-[200px]"
               >
                 <Sparkles className="w-4 h-4 mr-3" />
                 Design Storyboard
               </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar - Controls (Left Side) */}
          <div className="lg:col-span-4 space-y-8">
            <Card className={`border-2 transition-all duration-300 shadow-none rounded-[2rem] overflow-hidden ${
                audio ? "border-indigo-200 bg-white" : "border-neutral-200 border-dashed bg-neutral-50/50"
             }`}>
                <CardHeader className="p-6 pb-0 flex flex-row items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 italic">Acoustic Signal</span>
                      <CardTitle className="text-xs font-black uppercase tracking-tight">Sonic Input</CardTitle>
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
                        <div className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                           <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                              <FileAudio className="w-6 h-6" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-black text-neutral-800 truncate uppercase tracking-tight">{audio.name}</p>
                             <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                                {(audio.size / 1024 / 1024).toFixed(2)}MB • {audio.type.split('/')[1]?.toUpperCase() || 'AUDIO'}
                             </p>
                           </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-inner">
                           <audio src={audioUrl || ""} className="w-full h-8" controls />
                        </div>
                     </div>
                   ) : (
                     <div onClick={() => audioRef.current?.click()} className="cursor-pointer group flex flex-col items-center justify-center py-20 space-y-6 text-center border-2 border-dashed border-neutral-200 rounded-[2rem] hover:border-indigo-400 transition-all bg-white hover:bg-indigo-50/30">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-300 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-500 shadow-sm">
                           <Upload className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400">Capture Audio Stream</p>
                           <p className="text-[10px] font-bold text-neutral-300 uppercase italic">Supported: MP3, WAV, M4A, WEBM</p>
                        </div>
                     </div>
                   )}
                   <input ref={audioRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
                </CardContent>
             </Card>

             <Card className="border-neutral-200 shadow-sm rounded-[2rem] bg-white overflow-hidden border-2">
                <CardHeader className="p-6 border-b border-neutral-50">
                   <div className="flex items-center gap-2">
                       <Settings2 className="w-4 h-4 text-indigo-500" />
                       <CardTitle className="text-xs font-black uppercase tracking-widest italic">Model Configuration</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Extraction Precision</label>
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-indigo-500 text-white rounded-lg px-3 py-1 font-bold text-[9px] uppercase tracking-tighter shadow-sm border-none">Word-Level Timestamps</Badge>
                                <Badge variant="outline" className="border-indigo-100 text-indigo-400 rounded-lg px-3 py-1 font-bold text-[9px] uppercase tracking-tighter">Segment Mapping</Badge>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Engine Selection</label>
                            <div className="bg-neutral-50 p-4 rounded-xl border-2 border-neutral-100 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">whisper-1</span>
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black">ACTIVE</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-indigo-950 text-white flex flex-col gap-3 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
                        <div className="flex justify-between items-center opacity-40">
                            <span className="text-[9px] font-black uppercase tracking-widest">Metadata Protocol</span>
                            <Info className="w-3 h-3" />
                        </div>
                        <p className="text-[10px] font-medium leading-relaxed text-indigo-200/60 uppercase tracking-tight">
                            Requests are processed with <span className="text-white font-black">verbose_json</span> response format to capture detailed word temporal data.
                        </p>
                    </div>
                </CardContent>
             </Card>

             <Card className="border-neutral-200 shadow-sm rounded-2xl bg-indigo-600 p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
                <div className="relative z-10 space-y-4">
                   <div className="flex items-center gap-2">
                       <Zap className="w-4 h-4 text-white fill-white shadow-xl" />
                       <Badge className="bg-white/20 border-none text-white text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full">Neural Direct</Badge>
                   </div>
                   <div className="space-y-1">
                       <p className="text-sm font-black uppercase italic tracking-tight text-white">Advanced Diarization</p>
                       <p className="text-[10px] font-bold text-indigo-100/60 uppercase tracking-widest leading-relaxed">
                          Experimental speaker identification <br /> through GPT-4o Transcribe logic.
                       </p>
                   </div>
                </div>
             </Card>
          </div>

          {/* Main Stage - Results (Right Side) */}
          <div className="lg:col-span-8 space-y-8">
             <Card className="border-neutral-200 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden border-4">
                <CardHeader className="px-10 py-8 border-b border-neutral-100 bg-neutral-50/30 flex flex-row items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-2 bg-indigo-50 rounded-xl">
                         <FileText className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div className="flex flex-col">
                         <CardTitle className="text-xs font-black uppercase tracking-widest italic">Linguistic Output Monitor</CardTitle>
                         {transcription && (
                            <span className="text-[10px] font-bold text-neutral-400">Total Duration: {transcription.duration.toFixed(2)}s</span>
                         )}
                      </div>
                   </div>
                   {transcription && (
                    <Badge className="bg-emerald-500 text-white border-none font-bold uppercase tracking-[0.2em] text-[8px] px-4 py-1.5 rounded-full shadow-lg shadow-emerald-100">
                      Analysis Complete
                    </Badge>
                   )}
                </CardHeader>
                <CardContent className="p-0 h-[600px] relative overflow-hidden">
                   {transcription ? (
                     <div className="flex flex-col h-full">
                        {/* Raw Text Box */}
                        <div className="p-10 border-b border-neutral-100 bg-white">
                           <div className="flex items-center gap-2 mb-4">
                              <Languages className="w-4 h-4 text-indigo-400" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Raw Transcript Spectrum</span>
                           </div>
                           <p className="text-lg font-bold text-neutral-800 leading-relaxed tracking-tight underline decoration-indigo-100 decoration-4 underline-offset-8 italic">
                              "{transcription.text}"
                           </p>
                        </div>

                        {/* Word Level Grid */}
                        <div className="flex-1 p-10 bg-neutral-50/50 overflow-y-auto">
                           <div className="flex items-center gap-2 mb-6">
                              <Clock className="w-4 h-4 text-indigo-400" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Word-Level Temporal Offsets</span>
                           </div>
                           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                              {transcription.words?.map((word: any, i: number) => (
                                <div key={i} className="bg-white border-2 border-neutral-100 p-3 rounded-2xl hover:border-indigo-400 hover:scale-[1.02] transition-all cursor-default group shadow-sm">
                                   <p className="text-xs font-black text-neutral-900 mb-2 truncate uppercase tracking-tighter">{word.word}</p>
                                   <div className="flex items-center justify-between font-mono text-[9px]">
                                      <span className="text-neutral-400 group-hover:text-indigo-500 transition-colors">{word.start.toFixed(2)}s</span>
                                      <div className="w-1.5 h-[1px] bg-neutral-200" />
                                      <span className="text-neutral-400 group-hover:text-indigo-500 transition-colors">{word.end.toFixed(2)}s</span>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-20 space-y-8 z-10 transition-all duration-1000">
                        <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-200 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 ease-out animate-pulse">
                           <Mic2 className="w-10 h-10" />
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm font-black text-neutral-300 uppercase tracking-[0.4em] italic leading-tight">Awaiting Neural Link</p>
                          <p className="text-[10px] font-bold text-neutral-200 uppercase tracking-widest leading-relaxed">
                             Initiate lexical extraction to <br /> visualize temporal word mapping.
                          </p>
                        </div>
                     </div>
                   )}
                </CardContent>
             </Card>

             <div className="p-6 rounded-[2rem] bg-neutral-100/50 border-2 border-neutral-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-neutral-100">
                     <History className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic mb-0.5">Neural Trace / Diagnostic Stream</p>
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
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-rose-600 italic">Extraction Failure Breach</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <p className="text-sm font-bold text-rose-500 leading-relaxed italic">"{error}"</p>
                  </CardContent>
               </Card>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
