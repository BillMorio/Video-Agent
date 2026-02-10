"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  ImageIcon, 
  Play, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  Clock,
  Download,
  Share2,
  RefreshCw,
  Terminal,
  Layers,
  Search,
  Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function WavespeedImageGenPage() {
  const [prompt, setPrompt] = useState("A professional studio portrait of a futuristic AI assistant, cinematic lighting, 8k resolution, minimalist background, sharp focus.");
  const [options, setOptions] = useState({
    enable_base64_output: false,
    enable_sync_mode: false,
    output_format: "png"
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState<any>(null);

  const [trackId, setTrackId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationResult(null);
    setRawJson(null);

    try {
      const response = await fetch("/api/wavespeed/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, ...options }),
      });

      const data = await response.json();
      setRawJson(data);

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGenerationResult(data);
      // Extraction logic from documentation
      const rid = (data.data && data.data.id) || data.id;
      if (rid) setTrackId(rid);
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

    try {
      const response = await fetch(`/api/wavespeed/video/status?id=${id}`);
      const data = await response.json();
      
      // Update the debug view with the latest poll data
      setRawJson(data);

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

  // Auto-sync if tracking is active and status is not final
  useEffect(() => {
    let interval: any;
    if (trackId && (!trackResult || (trackResult.status !== 'completed' && trackResult.status !== 'success' && trackResult.status !== 'failed'))) {
      interval = setInterval(() => {
        handleCheckStatus(trackId);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [trackId, trackResult]);

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
                Lumina <span className="text-indigo-600">Vision</span>
              </h1>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">
                Nano-Banana Neural Image Synthesis Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-white border border-neutral-100 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Node: Nano-Banana V3</span>
             </div>
             <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
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
                    Generate Image
                  </>
                )}
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Configuration Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Prompt Input */}
            <Card className="border-2 border-neutral-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Semantic Intent</span>
                  <Badge variant="outline" className="text-[8px] border-indigo-100 text-indigo-600 font-black uppercase">Required</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Prompt Buffer</label>
                  <Textarea 
                    placeholder="Describe the image you want to generate..." 
                    className="rounded-xl border-neutral-100 focus:border-indigo-500 transition-all font-sans text-sm min-h-[120px] resize-none p-4"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Technical Parameters */}
            <Card className="border-2 border-neutral-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">System Overrides</span>
                  <Terminal className="w-3 h-3 text-neutral-300" />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Format</label>
                      <select 
                        className="w-full rounded-xl border-2 border-neutral-50 bg-neutral-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-indigo-100 transition-colors"
                        value={options.output_format}
                        onChange={(e) => setOptions({...options, output_format: e.target.value})}
                      >
                        <option value="png">PNG (Lossless)</option>
                        <option value="jpg">JPG (Web)</option>
                        <option value="webp">WebP (Opt)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Mode</label>
                      <select 
                        className="w-full rounded-xl border-2 border-neutral-50 bg-neutral-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-indigo-100 transition-colors"
                        value={options.enable_sync_mode ? "sync" : "async"}
                        onChange={(e) => setOptions({...options, enable_sync_mode: e.target.value === "sync"})}
                      >
                        <option value="async">Asynchronous</option>
                        <option value="sync">Synchronous</option>
                      </select>
                    </div>
                 </div>

                 <div className="p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3 h-3 text-indigo-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Nano-Banana Engine</span>
                    </div>
                    <p className="text-[9px] text-indigo-400 font-bold leading-relaxed">
                      Optimized for rapid visual conceptualization. Nano-Banana targets sub-5s processing times for a-roll consistency.
                    </p>
                 </div>
              </CardContent>
            </Card>

            {/* Tracking Input */}
            <Card className="border-2 border-neutral-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Manual Sync</span>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="relative group">
                  <Input 
                    placeholder="Task ID..." 
                    className="rounded-xl border-neutral-100 focus:border-indigo-500 transition-all font-mono text-xs pr-10"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-hover:text-indigo-400 transition-colors" />
                </div>
                <Button 
                  onClick={() => handleCheckStatus()}
                  disabled={isTracking || !trackId}
                  variant="outline"
                  className="w-full rounded-xl border-neutral-100 text-[10px] font-black uppercase tracking-widest py-5"
                >
                  {isTracking ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <RefreshCw className="w-3 h-3 mr-2" />}
                  Force Status Sync
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Visualization Canvas */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Output Display */}
            <Card className="border-4 border-white bg-white shadow-2xl rounded-[3rem] overflow-hidden min-h-[500px] flex flex-col">
              <CardContent className="p-0 flex-1 relative flex items-center justify-center bg-neutral-900 group">
                  {isGenerating || (isTracking && !trackResult) ? (
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 rounded-full border-2 border-indigo-500/20 flex items-center justify-center mx-auto relative">
                          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                          <div className="absolute inset-0 bg-indigo-500/10 blur-xl animate-pulse rounded-full" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Neural Map Expansion</p>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Nanometer Precision</p>
                        </div>
                    </div>
                  ) : trackResult?.video_url || trackResult?.data?.outputs?.[0] || generationResult?.data?.outputs?.[0] ? (
                    <div className="w-full h-full relative p-12">
                       <img 
                          src={trackResult?.video_url || trackResult?.data?.outputs?.[0] || generationResult?.data?.outputs?.[0]} 
                          alt="Synthesis Output" 
                          className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-[1.02]"
                       />
                       
                       {/* Floating Actions */}
                       <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          <Button size="icon" className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 shadow-none">
                             <Download className="w-4 h-4" />
                          </Button>
                          <Button size="icon" className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 shadow-none">
                             <Share2 className="w-4 h-4" />
                          </Button>
                       </div>

                       {/* Status Banner */}
                       <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                          <Badge className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest text-[8px] px-6 py-2 rounded-full flex items-center gap-2">
                             <CheckCircle2 className="w-3 h-3" />
                             Synthesis Finalized
                          </Badge>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6 opacity-40 group-hover:opacity-60 transition-opacity">
                        <ImageIcon className="w-20 h-20 text-white mx-auto stroke-[1]" />
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Awaiting Vision Signal</p>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Error Message */}
            {(error || trackError) && (
              <div className="p-8 bg-rose-50 border-2 border-rose-100 rounded-[2rem] flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                 <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 leading-none">Telemetry Error</span>
                    <p className="text-sm font-bold text-rose-500 leading-tight">{error || trackError}</p>
                 </div>
              </div>
            )}

            {/* Metadata & Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { label: "Provider", value: "Wavespeed", icon: Globe, detail: "Nano-Banana Node" },
                 { label: "Inference", value: isTracking ? "Live" : "Standby", icon: Zap, detail: trackId || "None" },
                 { label: "Status", value: trackResult?.status || "Idle", icon: Clock, detail: "V3 Protocol" }
               ].map((item, i) => (
                 <Card key={i} className="border-2 border-neutral-100 shadow-none rounded-3xl p-6 bg-white hover:border-indigo-100 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 rounded-xl bg-neutral-50 group-hover:bg-indigo-50 transition-colors">
                        <item.icon className="w-4 h-4 text-neutral-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      {item.value === "Live" && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{item.label}</p>
                      <h4 className="text-xl font-black italic uppercase tracking-tighter text-neutral-900 leading-none">{item.value}</h4>
                      <p className="text-[8px] font-mono text-neutral-300 uppercase">{item.detail}</p>
                    </div>
                 </Card>
               ))}
            </div>

            {/* JSON Inspector / Telemetry Stream */}
            <Card className="border-2 border-neutral-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-neutral-900">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                   </div>
                   <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 leading-none">Protocol Live Stream</span>
                      <p className="text-[8px] font-bold text-neutral-300 uppercase tracking-tighter">Raw Webhook & Polling Telemetry</p>
                   </div>
                </div>
                {rawJson && (
                   <Button 
                     variant="ghost" 
                     className="h-8 text-[8px] font-black uppercase tracking-widest text-neutral-400 hover:text-indigo-600"
                     onClick={() => {
                        const blob = new Blob([JSON.stringify(rawJson, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `wavespeed_${trackId || 'debug'}.json`;
                        a.click();
                     }}
                   >
                     Export Trace
                   </Button>
                )}
              </CardHeader>
              <CardContent className="p-6 pt-4">
                 <div className="rounded-2xl bg-neutral-900 p-6 font-mono text-[10px] text-indigo-300/80 overflow-auto max-h-[400px] border-4 border-neutral-800 shadow-inner custom-scrollbar">
                    {rawJson ? (
                       <pre className="whitespace-pre-wrap leading-relaxed">
                          {JSON.stringify(rawJson, null, 2)}
                       </pre>
                    ) : (
                       <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-20 italic">
                          <Workflow className="w-8 h-8 animate-pulse" />
                          <p className="tracking-widest uppercase text-[8px] font-black">Awaiting Stream Initialization...</p>
                       </div>
                    )}
                 </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
