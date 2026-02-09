"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  User, 
  Image as ImageIcon, 
  Type, 
  Mic, 
  Palette, 
  Settings2, 
  Play, 
  Loader2, 
  Info, 
  Video,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function HeygenCreateVideoPage() {
  const [activeCharacterType, setActiveCharacterType] = useState<"avatar" | "talking_photo">("avatar");
  const [activeVoiceType, setActiveVoiceType] = useState<"text" | "audio">("text");
  
  const [formData, setFormData] = useState({
    avatar_id: "",
    talking_photo_id: "",
    input_text: "Hello from the Heygen Playground!",
    audio_url: "",
    background_color: "#FFFFFF",
    title: "Playground Video",
    scale: 1,
    caption: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [trackId, setTrackId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setVideoData(null);

    const payload = {
      caption: formData.caption,
      video_inputs: [
        {
          character: activeCharacterType === "avatar" 
            ? { 
                type: "avatar", 
                avatar_id: formData.avatar_id, 
                avatar_style: "normal",
                scale: formData.scale
              }
            : { 
                type: "talking_photo", 
                talking_photo_id: formData.talking_photo_id,
                scale: formData.scale
              },
          voice: activeVoiceType === "text"
            ? { type: "text", input_text: formData.input_text, voice_id: "2d5b0e6cfdba4191af46571597517b60" } // Default voice
            : { type: "audio", audio_url: formData.audio_url },
          background: {
            type: "color",
            value: formData.background_color
          }
        }
      ],
      dimension: { width: 1280, height: 720 }
    };

    try {
      const response = await fetch("/api/heygen/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setVideoData(data.data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckStatus = async (idToTrack?: string) => {
    const id = idToTrack || trackId;
    if (!id) return;

    setIsTracking(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      const response = await fetch(`/api/heygen/video/status?video_id=${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve status");
      }

      setTrackResult(data.data);
    } catch (err: any) {
      setTrackError(err.message || "An unexpected error occurred during tracking");
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 selection:bg-indigo-100 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Link 
              href="/playground/heygen" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Avatar Manifest
            </Link>
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none text-neutral-900">
                Video <span className="text-indigo-600">Synthesizer</span>
              </h1>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">
                Autonomous Neural Video Generation Pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-white border border-neutral-100 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">API Protocol v2</span>
             </div>
             <Button
                onClick={handleGenerate}
                disabled={isGenerating || (activeCharacterType === "avatar" ? !formData.avatar_id : !formData.talking_photo_id)}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl shadow-xl shadow-neutral-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-3" />
                    Initiate Generation
                  </>
                )}
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Configuration Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Character Slot */}
            <Card className="border-2 border-neutral-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Character Entity</span>
                  <Badge variant="outline" className="text-[8px] border-indigo-100 text-indigo-600 font-black uppercase">Required</Badge>
                </div>
                <div className="flex bg-neutral-50 p-1 rounded-xl border border-neutral-100">
                  <button 
                    onClick={() => setActiveCharacterType("avatar")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${activeCharacterType === "avatar" ? "bg-white text-indigo-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"}`}
                  >
                    <User className="w-3 h-3" />
                    Avatar
                  </button>
                  <button 
                    onClick={() => setActiveCharacterType("talking_photo")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${activeCharacterType === "talking_photo" ? "bg-white text-indigo-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"}`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    Photo
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {activeCharacterType === "avatar" ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Avatar ID</label>
                    <Input 
                      placeholder="Enter Avatar ID..." 
                      className="rounded-xl border-neutral-100 focus:border-indigo-500 transition-all font-mono text-xs capitalize"
                      value={formData.avatar_id}
                      onChange={(e) => setFormData({ ...formData, avatar_id: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Talking Photo ID</label>
                    <Input 
                      placeholder="Enter Photo ID..." 
                      className="rounded-xl border-neutral-100 focus:border-indigo-500 transition-all font-mono text-xs capitalize"
                      value={formData.talking_photo_id}
                      onChange={(e) => setFormData({ ...formData, talking_photo_id: e.target.value })}
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-neutral-50 space-y-2">
                   <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Scale Factor</label>
                      <span className="text-[10px] font-mono font-bold text-indigo-600">{formData.scale.toFixed(1)}x</span>
                   </div>
                   <input 
                      type="range" 
                      min="0.5" 
                      max="3.0" 
                      step="0.1"
                      className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      value={formData.scale}
                      onChange={(e) => setFormData({ ...formData, scale: parseFloat(e.target.value) })}
                   />
                </div>
              </CardContent>
            </Card>

            {/* Voice Slot */}
            <Card className="border-2 border-neutral-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Sonic Input</span>
                  <Badge variant="outline" className="text-[8px] border-indigo-100 text-indigo-600 font-black uppercase">Required</Badge>
                </div>
                <div className="flex bg-neutral-50 p-1 rounded-xl border border-neutral-100">
                  <button 
                    onClick={() => setActiveVoiceType("text")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${activeVoiceType === "text" ? "bg-white text-indigo-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"}`}
                  >
                    <Type className="w-3 h-3" />
                    Text
                  </button>
                  <button 
                    onClick={() => setActiveVoiceType("audio")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${activeVoiceType === "audio" ? "bg-white text-indigo-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"}`}
                  >
                    <Mic className="w-3 h-3" />
                    Audio
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {activeVoiceType === "text" ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Script Content</label>
                    <Textarea 
                      placeholder="What should the character say?" 
                      className="rounded-xl border-neutral-100 focus:border-indigo-500 min-h-[120px] transition-all text-sm leading-relaxed"
                      value={formData.input_text}
                      onChange={(e) => setFormData({ ...formData, input_text: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Audio URL</label>
                    <Input 
                      placeholder="https://example.com/audio.mp3" 
                      className="rounded-xl border-neutral-100 focus:border-indigo-500 transition-all font-mono text-xs"
                      value={formData.audio_url}
                      onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Background & Aesthetics */}
            <Card className="border-2 border-neutral-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Environment</span>
                  <Badge variant="outline" className="text-[8px] border-neutral-100 text-neutral-400 font-black uppercase underline decoration-indigo-300">Optional</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                   <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Background Color</label>
                      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">{formData.background_color}</span>
                   </div>
                   <div className="flex gap-3 items-center">
                     <input 
                       type="color" 
                       className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                       value={formData.background_color}
                       onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                     />
                     <div className="flex-1 flex gap-2">
                        {['#FFFFFF', '#000000', '#6366F1', '#10B981'].map(color => (
                          <button 
                            key={color}
                            onClick={() => setFormData({ ...formData, background_color: color })}
                            className="w-6 h-6 rounded-full border border-neutral-100 transition-transform active:scale-90"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata Slot */}
            <Card className="bg-neutral-900 border-none shadow-none rounded-[2rem] overflow-hidden p-6 relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all duration-700" />
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-3 h-3 text-indigo-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40 italic underline decoration-indigo-500/50">Processing Core</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/60 ml-1">Video Title</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:bg-white/10 outline-none transition-all font-bold tracking-tight"
                      placeholder="Untitled Render..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-white/60">Auto Captions</label>
                          <p className="text-[7px] text-white/30 uppercase font-bold tracking-tight">Generate burnt-in subtitles</p>
                       </div>
                       <button 
                         onClick={() => setFormData({ ...formData, caption: !formData.caption })}
                         className={`w-10 h-5 rounded-full transition-all flex items-center px-1 ${formData.caption ? "bg-indigo-500" : "bg-white/10"}`}
                       >
                         <div className={`w-3 h-3 rounded-full bg-white transition-transform ${formData.caption ? "translate-x-5" : "translate-x-0"}`} />
                       </button>
                    </div>
                  </div>
               </div>
            </Card>
          </div>

          {/* Main Stage - Preview & Status */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-4 border-white bg-white shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="px-8 py-6 border-b border-neutral-50 flex flex-row items-center justify-between bg-neutral-50/30">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Play className="w-4 h-4 text-indigo-600" />
                  </div>
                  Output Monitor
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-500 animate-pulse' : videoData ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                    {isGenerating ? 'Active Synthetic Stream' : videoData ? 'Stream Ready' : 'Standby Mode'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-neutral-900 aspect-video relative flex items-center justify-center overflow-hidden">
                 {isGenerating ? (
                   <div className="text-center space-y-6 relative z-10">
                      <div className="relative">
                         <div className="w-24 h-24 rounded-full border-2 border-white/5 flex items-center justify-center mx-auto">
                            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                         </div>
                         <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[12px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Neural Synthesis in Progress</p>
                        <p className="text-[9px] text-white/40 font-mono italic">Allocating GPU clusters • Constructing temporal frames</p>
                      </div>
                   </div>
                 ) : videoData ? (
                   <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-white space-y-6">
                      <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                         <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-xl font-black uppercase italic tracking-tighter">Video Job Queued</h3>
                         <p className="text-white/60 text-sm max-w-sm font-medium">Your request (ID: <span className="text-white font-mono">{videoData.video_id}</span>) has been successfully dispatched to the Heygen synthesis engine.</p>
                      </div>
                      <Button className="bg-white text-neutral-900 hover:bg-neutral-100 font-black uppercase tracking-widest text-[10px] rounded-xl px-10 py-5">
                         View Task Progress
                      </Button>
                   </div>
                 ) : (
                   <div className="text-center space-y-8 relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent blur-3xl rounded-full" />
                      <div className="relative z-10">
                        <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/10 mx-auto group-hover:scale-110 transition-transform duration-500">
                           <Video className="w-10 h-10" />
                        </div>
                        <div className="mt-8 space-y-2">
                           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Signal Acquisition Pending</p>
                           <p className="text-[8px] text-white/10 font-bold uppercase tracking-widest italic">Input configuration required to initialize stream</p>
                        </div>
                      </div>
                   </div>
                 )}
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl animate-in zoom-in-95 duration-300 flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Synthesis Logic Violation</span>
                    <p className="text-sm font-bold text-rose-500 leading-tight">{error}</p>
                 </div>
              </div>
            )}

            {/* Technical Brief */}
            <div className="p-8 rounded-[2rem] bg-white border-2 border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                     <Info className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase tracking-tight">Neural Protocol V2.1</h4>
                    <p className="text-[10px] text-neutral-400 font-medium">Leveraging Avatar IV generation models with high-concurrency dispatch.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Network Latency</p>
                    <p className="text-[11px] font-mono font-bold text-neutral-900">42ms</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Job Status</p>
                    <p className="text-[11px] font-mono font-bold text-emerald-500 uppercase">Operational</p>
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* Tracking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-neutral-100">
          <div className="lg:col-span-4 space-y-4">
             <div className="space-y-1">
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-neutral-900">Track Pipeline</h2>
                <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Monitor existing generation jobs via ID</p>
             </div>
             <Card className="border-2 border-neutral-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
                <CardContent className="p-6 space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Job ID / Video ID</label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="e.g. 442cc159e7a3..." 
                          className="rounded-xl border-neutral-100 focus:border-indigo-500 transition-all font-mono text-xs"
                          value={trackId}
                          onChange={(e) => setTrackId(e.target.value)}
                        />
                        <Button 
                          onClick={() => handleCheckStatus()}
                          disabled={isTracking || !trackId}
                          className="bg-neutral-900 shadow-none rounded-xl"
                        >
                           {isTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
                        </Button>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>

          <div className="lg:col-span-8">
             {trackResult ? (
               <Card className="border-4 border-white bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col">
                  <div className="px-8 py-4 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Live Telemetry Feed</span>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        trackResult.status === 'completed' ? 'bg-emerald-500' : 
                        trackResult.status === 'failed' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
                      }`} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                        {trackResult.status}
                      </span>
                    </div>
                  </div>
                  
                  <CardContent className="p-0 bg-neutral-900 aspect-video relative flex items-center justify-center overflow-hidden">
                     {trackResult.video_url ? (
                        <video 
                          src={trackResult.video_url} 
                          controls 
                          className="w-full h-full object-contain"
                          autoPlay
                        />
                     ) : trackResult.status === 'failed' ? (
                        <div className="text-center space-y-4">
                           <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
                              <AlertCircle className="w-8 h-8" />
                           </div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Pipeline Terminated</p>
                        </div>
                     ) : (
                        <div className="text-center space-y-6 relative">
                           <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
                           <div className="relative z-10">
                              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
                              <div className="mt-6 space-y-2">
                                 <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Synchronizing Frames</p>
                                 <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest italic">Awaiting final stream serialization</p>
                              </div>
                           </div>
                        </div>
                     )}
                  </CardContent>

                  <div className="p-6 bg-neutral-50/50 border-t border-neutral-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Job ID</p>
                        <p className="text-[11px] font-mono text-neutral-600 truncate">{trackResult.video_id}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Duration</p>
                        <p className="text-[11px] font-mono font-bold text-neutral-900">{trackResult.duration || 0}s</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Format</p>
                        <p className="text-[11px] font-mono font-bold text-neutral-900 uppercase">{trackResult.type || 'N/A'}</p>
                     </div>
                     <div className="flex items-center justify-end">
                        {trackResult.status === 'completed' && (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                             <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                     </div>
                  </div>
               </Card>
             ) : trackError ? (
                <div className="p-8 rounded-[2rem] bg-rose-50 border-2 border-rose-100 flex items-center gap-4">
                   <AlertCircle className="w-6 h-6 text-rose-500" />
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Telemetry Error</p>
                      <p className="text-sm font-bold text-rose-500">{trackError}</p>
                   </div>
                </div>
             ) : (
               <div className="h-[200px] border-2 border-dashed border-neutral-100 rounded-[2rem] flex items-center justify-center text-center p-8">
                  <div className="space-y-2">
                    <Settings2 className="w-8 h-8 text-neutral-100 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-200">Awaiting Job Identifier</p>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
