"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Film, 
  Upload, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Maximize,
  Minimize,
  Music,
  Download,
  Terminal,
  Cpu,
  Zap,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function KenBurnsPlaygroundPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [zoomType, setZoomType] = useState<"in" | "out">("in");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!imageFile || !audioFile) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("audio", audioFile);
    formData.append("zoomType", zoomType);

    try {
      const response = await fetch("http://localhost:3333/api/ken-burns", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Processing failed");
      }

      setResult(data);
    } catch (err: any) {
      console.error("[Ken Burns] Error:", err);
      setError(err.message || "An unexpected error occurred during processing");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 selection:bg-indigo-100 font-sans">
      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Link 
              href="/playground/ffmpeg" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              FFmpeg Orchestra
            </Link>
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none text-neutral-900">
                 Ken <span className="text-rose-600">Burns</span>
              </h1>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">
                Neural Image-to-Video Temporal Synthesis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-white border border-neutral-100 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Core: zoompan_protocol_v1</span>
             </div>
             <Button
                onClick={handleProcess}
                disabled={isProcessing || !imageFile || !audioFile}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl shadow-xl shadow-neutral-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    Baking Frames...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-3 text-rose-400" />
                    Process Video
                  </>
                )}
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Configuration Inputs */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Visual Input */}
            <Card className="border-2 border-neutral-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Visual Entity</span>
                  <Badge variant="outline" className="text-[8px] border-rose-100 text-rose-600 font-black uppercase">Source</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div 
                  className={`relative group border-2 border-dashed rounded-2xl transition-all h-32 flex flex-col items-center justify-center p-4 text-center cursor-pointer ${
                    imageFile ? 'border-emerald-200 bg-emerald-50/30' : 'border-neutral-100 hover:border-rose-200 hover:bg-rose-50/30'
                  }`}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <input 
                    type="file" 
                    id="image-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  {imageFile ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
                      <p className="text-[10px] font-black uppercase text-emerald-600 truncate max-w-full px-2">{imageFile.name}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-neutral-300 group-hover:text-rose-400 transition-colors mb-2" />
                      <p className="text-[10px] font-black uppercase text-neutral-400">Upload Source Image</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sonic Buffer */}
            <Card className="border-2 border-neutral-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Sonic Buffer</span>
                  <Badge variant="outline" className="text-[8px] border-blue-100 text-blue-600 font-black uppercase">Duration</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div 
                  className={`relative group border-2 border-dashed rounded-2xl transition-all h-32 flex flex-col items-center justify-center p-4 text-center cursor-pointer ${
                    audioFile ? 'border-blue-200 bg-blue-50/30' : 'border-neutral-100 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
                  onClick={() => document.getElementById('audio-upload')?.click()}
                >
                  <input 
                    type="file" 
                    id="audio-upload" 
                    className="hidden" 
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  />
                  {audioFile ? (
                    <>
                      <Music className="w-6 h-6 text-blue-500 mb-2" />
                      <p className="text-[10px] font-black uppercase text-blue-600 truncate max-w-full px-2">{audioFile.name}</p>
                    </>
                  ) : (
                    <>
                      <Music className="w-6 h-6 text-neutral-300 group-hover:text-blue-400 transition-colors mb-2" />
                      <p className="text-[10px] font-black uppercase text-neutral-400">Upload Audio Track</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Kinematics */}
            <Card className="border-2 border-neutral-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Kinematic Parameters</span>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                   <Button 
                    variant={zoomType === 'in' ? 'default' : 'outline'}
                    onClick={() => setZoomType('in')}
                    className={`rounded-xl h-12 text-[10px] font-black uppercase tracking-widest ${zoomType === 'in' ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200' : 'border-neutral-100'}`}
                   >
                     <Maximize className="w-3 h-3 mr-2" />
                     Zoom In
                   </Button>
                   <Button 
                    variant={zoomType === 'out' ? 'default' : 'outline'}
                    onClick={() => setZoomType('out')}
                    className={`rounded-xl h-12 text-[10px] font-black uppercase tracking-widest ${zoomType === 'out' ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200' : 'border-neutral-100'}`}
                   >
                     <Minimize className="w-3 h-3 mr-2" />
                     Zoom Out
                   </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visualization Canvas */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Output Display */}
            <Card className="border-4 border-white bg-white shadow-2xl rounded-[3rem] overflow-hidden min-h-[500px] flex flex-col">
              <CardContent className="p-0 flex-1 relative flex items-center justify-center bg-neutral-900">
                  {isProcessing ? (
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 rounded-full border-2 border-rose-500/20 flex items-center justify-center mx-auto relative">
                          <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
                          <div className="absolute inset-0 bg-rose-500/10 blur-xl animate-pulse rounded-full" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Temporal Scaling Active</p>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Bilinear Interpolation</p>
                        </div>
                    </div>
                  ) : result?.publicUrl ? (
                    <div className="w-full h-full relative aspect-video">
                       <video 
                          src={result.publicUrl} 
                          controls 
                          autoPlay
                          className="w-full h-full object-contain shadow-2xl"
                       />
                       
                       {/* Success Overlay */}
                       <div className="absolute top-6 right-6">
                          <Badge className="bg-emerald-500 text-white font-black uppercase tracking-widest text-[8px] px-4 py-2 rounded-xl flex items-center gap-2 border-none shadow-xl">
                             <CheckCircle2 className="w-3 h-3" />
                             Synthesis Finalized
                          </Badge>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6 opacity-30">
                        <Film className="w-20 h-20 text-white mx-auto stroke-[1]" />
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Ready for Temporal Synthesis</p>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <div className="p-8 bg-rose-50 border-2 border-rose-100 rounded-[2rem] flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                 <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 leading-none">Internal Protocol Failure</span>
                    <p className="text-sm font-bold text-rose-500 leading-tight">{error}</p>
                 </div>
              </div>
            )}

            {/* Technical Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { label: "Algorithm", value: "zoompan", icon: Layers, detail: "Ken Burns Easing" },
                 { label: "Hardware", value: "x264_ULTRA", icon: Cpu, detail: "Fastest Preset" },
                 { label: "Format", value: "1920x1080", icon: Maximize, detail: "16:9 Aspect Ratio" }
               ].map((item, i) => (
                 <Card key={i} className="border-2 border-neutral-100 shadow-none rounded-3xl p-6 bg-white hover:border-rose-100 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 rounded-xl bg-neutral-50 group-hover:bg-rose-50 transition-colors">
                        <item.icon className="w-4 h-4 text-neutral-400 group-hover:text-rose-500 transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{item.label}</p>
                      <h4 className="text-xl font-black italic uppercase tracking-tighter text-neutral-900 leading-none">{item.value}</h4>
                      <p className="text-[8px] font-mono text-neutral-300 uppercase">{item.detail}</p>
                    </div>
                 </Card>
               ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
