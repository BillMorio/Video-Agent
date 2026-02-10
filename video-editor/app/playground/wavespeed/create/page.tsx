"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  Image as ImageIcon, 
  Mic, 
  Play, 
  Loader2, 
  Video,
  CheckCircle2,
  AlertCircle,
  Settings2,
  Zap,
  Globe,
  Clock,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { uploadToSupabase } from "@/lib/storage";

export default function WavespeedCreateVideoPage() {
  const [formData, setFormData] = useState({
    audio: "",
    image: "https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/Gemini_Generated_Image_afr4xlafr4xlafr4.png",
    resolution: "480p",
    seed: -1
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [trackId, setTrackId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationResult(null);

    try {
      const response = await fetch("/api/wavespeed/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGenerationResult(data);
      // Automatically set the track ID if we got one
      const rid = data.request_id || data.id || (data.data && data.data.id);
      if (rid) setTrackId(rid);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const publicUrl = await uploadToSupabase(file);
      setFormData(prev => ({ ...prev, audio: publicUrl }));
    } catch (err: any) {
      setError(`Audio upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCheckStatus = async (idToTrack?: string) => {
    const id = idToTrack || trackId;
    if (!id) return;

    setIsTracking(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      const response = await fetch(`/api/wavespeed/video/status?id=${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve status");
      }

      setTrackResult(data);
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
              href="/playground/wavespeed" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Wavespeed Protocol
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
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">API Protocol V3</span>
             </div>
             <Button
                onClick={handleGenerate}
                disabled={isGenerating || !formData.audio || !formData.image}
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
            
            {/* Visual Input */}
            <Card className="border-2 border-neutral-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Portrait Entity</span>
                  <Badge variant="outline" className="text-[8px] border-indigo-100 text-indigo-600 font-black uppercase">Required</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Image URL</label>
                    <div className="relative group">
                      <Input 
                        placeholder="https://example.com/portrait.jpg" 
                        className="rounded-xl border-neutral-100 focus:border-indigo-500 transition-all font-mono text-xs pr-10"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      />
                      <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-neutral-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest text-neutral-300">
                      <span className="bg-white px-2 italic">OR</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input 
                      type="file" 
                      id="image-upload"
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploading(true);
                        setError(null);
                        try {
                          const publicUrl = await uploadToSupabase(file);
                          setFormData(prev => ({ ...prev, image: publicUrl }));
                        } catch (err: any) {
                          setError(`Image upload failed: ${err.message}`);
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                      disabled={isUploading}
                    />
                    <label 
                      htmlFor="image-upload"
                      className={`w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isUploading ? 'bg-neutral-50 border-neutral-200 cursor-not-allowed' : 'border-neutral-100 hover:border-indigo-200 hover:bg-indigo-50/30'}`}
                    >
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-indigo-500 transition-colors">
                            <Upload className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Upload Portrait</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {formData.image && (
                   <div className="mt-4 aspect-square rounded-2xl overflow-hidden border-2 border-neutral-50 bg-neutral-50">
                     <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "")} />
                   </div>
                )}
              </CardContent>
            </Card>

            {/* Sonic Input */}
            <Card className="border-2 border-neutral-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Vocal Buffer</span>
                  <Badge variant="outline" className="text-[8px] border-indigo-100 text-indigo-600 font-black uppercase">Required</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Audio URL</label>
                    <div className="relative group">
                      <Input 
                        placeholder="https://example.com/audio.mp3" 
                        className="rounded-xl border-neutral-100 focus:border-indigo-500 transition-all font-mono text-xs pr-10"
                        value={formData.audio}
                        onChange={(e) => setFormData({ ...formData, audio: e.target.value })}
                      />
                      <Mic className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-neutral-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest text-neutral-300">
                      <span className="bg-white px-2 italic">OR</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input 
                      type="file" 
                      id="audio-upload"
                      className="hidden" 
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      disabled={isUploading}
                    />
                    <label 
                      htmlFor="audio-upload"
                      className={`w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isUploading ? 'bg-neutral-50 border-neutral-200 cursor-not-allowed' : 'border-neutral-100 hover:border-indigo-200 hover:bg-indigo-50/30'}`}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60 animate-pulse">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-indigo-500 transition-colors">
                            <Upload className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Upload Local File</span>
                        </>
                      )}
                    </label>
                  </div>

                  {formData.audio && !isUploading && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                       <div className="flex-1 min-w-0">
                          <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 leading-none mb-1">Sonic Buffer Loaded</p>
                          <p className="text-[10px] text-emerald-700 font-mono truncate">{formData.audio}</p>
                       </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Parameters */}
            <Card className="bg-neutral-900 border-none shadow-none rounded-[2rem] overflow-hidden p-6 relative group">
               <div className="relative z-10 space-y-4 text-white">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-3 h-3 text-indigo-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40 italic">Inference Settings</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                      <button 
                        onClick={() => setFormData({ ...formData, resolution: "480p" })}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${formData.resolution === "480p" ? "bg-white text-neutral-900 shadow-sm" : "text-white/40 hover:text-white/60"}`}
                      >
                        480p
                      </button>
                      <button 
                        onClick={() => setFormData({ ...formData, resolution: "720p" })}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${formData.resolution === "720p" ? "bg-white text-neutral-900 shadow-sm" : "text-white/40 hover:text-white/60"}`}
                      >
                        720p
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/60">Random Seed</label>
                        <span className="text-[9px] font-mono text-indigo-400">{formData.seed === -1 ? 'AUTO' : formData.seed}</span>
                      </div>
                      <Input 
                        type="number"
                        className="bg-white/5 border-white/10 rounded-xl text-white font-mono text-xs h-9"
                        value={formData.seed}
                        onChange={(e) => setFormData({ ...formData, seed: parseInt(e.target.value) })}
                      />
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
                  <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-500 animate-pulse' : generationResult ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                    {isGenerating ? 'Synthesizing...' : generationResult ? 'Job Dispatched' : 'Standby'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-neutral-900 aspect-video relative flex items-center justify-center overflow-hidden">
                 {isGenerating ? (
                    <div className="text-center space-y-6">
                       <div className="w-20 h-20 rounded-full border-2 border-indigo-500/20 flex items-center justify-center mx-auto relative">
                          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                          <div className="absolute inset-0 bg-indigo-500/10 blur-xl animate-pulse rounded-full" />
                       </div>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Propagating Neural Weights</p>
                    </div>
                 ) : generationResult ? (
                    <div className="text-center space-y-6 p-12 text-white">
                       <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                       <div className="space-y-2">
                          <h3 className="text-xl font-black uppercase italic tracking-tighter">Job ID Allocated</h3>
                          <p className="text-white/40 text-[10px] font-mono">{generationResult.request_id || generationResult.id || generationResult.data?.id}</p>
                       </div>
                       <Button 
                         onClick={() => handleCheckStatus()}
                         className="bg-white text-neutral-900 hover:bg-neutral-100 font-black uppercase tracking-widest text-[10px] rounded-xl px-12 py-5"
                       >
                         Start Live Tracking
                       </Button>
                    </div>
                 ) : (
                    <div className="text-center space-y-6 opacity-20">
                       <Video className="w-16 h-16 text-white mx-auto" />
                       <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Awaiting Generation Signal</p>
                    </div>
                 )}
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl flex items-start gap-4">
                 <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Dispatch Error</span>
                    <p className="text-sm font-bold text-rose-500 leading-tight">{error}</p>
                 </div>
              </div>
            )}

            {/* Technical Context */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {[
                 { label: "Provider", value: "Wavespeed AI", icon: Globe },
                 { label: "Avg Speed", value: "~15-30s", icon: Zap },
                 { label: "API Version", value: "V3.0 (Alpha)", icon: Clock }
               ].map((item, i) => (
                 <div key={i} className="p-6 rounded-3xl bg-white border-2 border-neutral-100 flex flex-col gap-3 group hover:border-indigo-100 transition-colors">
                    <item.icon className="w-5 h-5 text-neutral-300 group-hover:text-indigo-500 transition-colors" />
                    <div>
                       <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                       <p className="text-xs font-black uppercase tracking-tight">{item.value}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

        </div>

        {/* Tracking Section */}
        <div className="pt-8 border-t border-neutral-100">
           <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                 <h2 className="text-xl font-black uppercase italic tracking-tighter text-neutral-900">Telemetry Feed</h2>
                 <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Asynchronous Pipeline Monitoring</p>
              </div>
              <div className="hidden md:flex gap-2">
                 <Input 
                   placeholder="Enter Request ID..." 
                   className="w-[300px] rounded-xl border-neutral-100 focus:border-indigo-500 font-mono text-xs"
                   value={trackId}
                   onChange={(e) => setTrackId(e.target.value)}
                 />
                 <Button 
                   onClick={() => handleCheckStatus()}
                   disabled={isTracking || !trackId}
                   className="bg-neutral-900 rounded-xl"
                 >
                    {isTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sync Telemetry"}
                 </Button>
              </div>
           </div>

           {trackResult ? (
              <Card className="border-4 border-white bg-white shadow-2xl rounded-[3rem] overflow-hidden">
                 <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="bg-neutral-900 aspect-video flex items-center justify-center overflow-hidden">
                       {trackResult.status === 'completed' || trackResult.status === 'success' || trackResult.video_url || (trackResult.output && trackResult.output.url) ? (
                          <video 
                            src={trackResult.video_url || (trackResult.output && trackResult.output.url) || (trackResult.data && trackResult.data.video_url)} 
                            controls 
                            className="w-full h-full object-contain"
                            autoPlay
                          />
                       ) : trackResult.status === 'failed' || trackResult.status === 'error' ? (
                          <div className="text-center space-y-4">
                             <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                             <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Inference Terminated</p>
                          </div>
                       ) : (
                          <div className="text-center space-y-6">
                             <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                             <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">Processing Frame Sequence</p>
                          </div>
                       )}
                    </div>
                    <div className="p-12 space-y-8 flex flex-col justify-center border-l border-neutral-50 bg-neutral-50/20">
                       <div className="space-y-2">
                          <div className="flex items-center gap-3">
                             <Badge className={`${
                               trackResult.status === 'completed' || trackResult.status === 'success' ? 'bg-emerald-500' : 
                               trackResult.status === 'failed' || trackResult.status === 'error' ? 'bg-rose-500' : 'bg-indigo-500 animate-pulse'
                             } text-white border-none text-[9px] font-black uppercase px-3 py-1`}>
                               {trackResult.status || 'Active'}
                             </Badge>
                             <span className="text-[10px] font-mono text-neutral-400">ID: {trackId}</span>
                          </div>
                          <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                             Synthesis <span className="text-indigo-600">{trackResult.status === 'completed' || trackResult.status === 'success' ? 'Finalized' : 'In Progress'}</span>
                          </h3>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-4">
                             {[
                               { label: "Request ID", value: trackId },
                               { label: "Status", value: trackResult.status },
                               { label: "Resolution", value: formData.resolution },
                               { label: "Inference ID", value: trackResult.id || 'Pending' }
                             ].map((det, i) => (
                               <div key={i} className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{det.label}</span>
                                  <span className="text-[10px] font-mono font-bold text-neutral-900">{det.value}</span>
                               </div>
                             ))}
                          </div>

                          <Button 
                            variant="outline" 
                            className="w-full rounded-2xl border-2 border-neutral-200 py-6 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50"
                            onClick={() => handleCheckStatus()}
                          >
                             Refresh Feed
                          </Button>
                       </div>
                    </div>
                 </div>
              </Card>
           ) : trackError ? (
              <div className="p-12 rounded-[3rem] bg-rose-50 border-2 border-rose-100 text-center space-y-4">
                 <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 underline decoration-rose-200">Telemetry Synchronization Failure</p>
                    <p className="text-sm font-bold text-rose-500 italic max-w-lg mx-auto">{trackError}</p>
                 </div>
                 <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl px-8" onClick={() => handleCheckStatus()}>Retry Sync</Button>
              </div>
           ) : (
              <div className="h-[300px] border-4 border-dashed border-neutral-100 rounded-[3rem] flex items-center justify-center text-center p-12 bg-neutral-50/10">
                 <div className="space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-200 mx-auto mb-6">
                       <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold uppercase italic tracking-tight text-neutral-300">Awaiting Signal Sequence</h3>
                    <p className="text-[10px] text-neutral-200 font-bold uppercase tracking-widest">Provide a Job ID to bridge the telemetry stream</p>
                 </div>
              </div>
           )}
        </div>

        {/* Footer */}
        <footer className="text-center pt-12 opacity-30">
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.5em]">
            Neural Synthesis Platform &bull; Wavespeed Core V3.0
          </p>
        </footer>
      </div>
    </div>
  );
}
