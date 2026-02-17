"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  UploadCloud, 
  FileAudio, 
  Video, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Terminal,
  Files,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { uploadToCloudinary } from "@/lib/storage";
import { cn } from "@/lib/utils";

export default function CloudinaryPlaygroundPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string, type: string = "system") => {
    setLogs((prev) => [...prev.slice(-5), { msg, type }]);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setResultUrl(null);
    addLog(`System: Initiating Cloudinary uplink protocol...`, "system");
    
    try {
      addLog("Storage: Syncing asset to Cloudinary production cloud...", "ai");
      const url = await uploadToCloudinary(file);
      setResultUrl(url);
      addLog("Signal: Asset synchronized successfully.", "system");
      addLog(`URL: ${url.substring(0, 40)}...`, "ai");
    } catch (err: any) {
      addLog(`Error: ${err.message}`, "system");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-blue-100 font-sans">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(59,130,246,0.03)_0%,_transparent_60%),radial-gradient(circle_at_70%_80%,_rgba(59,130,246,0.02)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 relative z-10">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/playground" 
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors group font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Playground
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-tight text-blue-700">Cloudinary Sync Active</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-tight">
              Storage <br /> <span className="text-blue-600 opacity-80">Cloudinary_Hub</span>
            </h1>
            <p className="text-neutral-500 font-medium max-w-lg leading-relaxed text-lg">
              Validate your media asset synchronization to the Cloudinary backbone. High-performance global distribution for production agents.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Upload Area */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="border-2 border-neutral-100 rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-neutral-200/50">
              <CardContent className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-glow shadow-blue-500/40 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 italic">Media_Uploader_Ready</span>
                   </div>
                   <Zap className="w-4 h-4 text-blue-500/30" />
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "h-64 flex flex-col items-center justify-center border-2 border-dashed border-neutral-100 rounded-3xl transition-all cursor-pointer group/upload",
                    file ? "bg-blue-50/30 border-blue-200" : "hover:border-blue-200 hover:bg-neutral-50"
                  )}
                >
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {file ? (
                    <div className="space-y-4 text-center">
                      <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto text-blue-600 group-hover/upload:scale-110 transition-transform">
                        {file.type.startsWith('video') ? <Video className="w-10 h-10" /> : <Files className="w-10 h-10" />}
                      </div>
                      <div>
                        <p className="text-lg font-black tracking-tight">{file.name}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB &bull; {file.type}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center">
                      <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-300 group-hover/upload:text-blue-500 group-hover/upload:bg-blue-50 transition-all">
                        <UploadCloud className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase tracking-widest text-neutral-400">Drag or click to synchronize</p>
                        <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest leading-none">Global Production Assets</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  disabled={!file || isUploading}
                  onClick={handleUpload}
                  className="w-full h-16 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all active:scale-[0.98] disabled:opacity-30"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synchronizing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span>Uplink Asset</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Neural Trace Logs */}
            <div className={cn(
              "space-y-4 transition-all duration-1000",
              logs.length > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <div className="bg-white border-2 border-neutral-100 rounded-3xl p-8 text-left shadow-sm relative overflow-hidden backdrop-blur-sm">
                 <div className="flex items-center gap-2.5 mb-6 opacity-30">
                    <Terminal className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Neural_Trace_Log</span>
                 </div>
                 <div className="space-y-3">
                    {logs.map((log, i) => (
                      <div key={i} className="flex items-center gap-4 text-[11px] animate-in slide-in-from-bottom-1 duration-500">
                         <div className={cn(
                           "w-1 h-4 rounded-full",
                           log.type === 'ai' ? "bg-blue-500/40" : "bg-neutral-200"
                         )} />
                         <span className={cn(
                           "uppercase tracking-tight font-bold",
                           i === logs.length - 1 ? "text-neutral-900" : "text-neutral-300",
                           log.type === 'ai' && "text-blue-600/80"
                         )}>
                           {log.msg}
                         </span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-5 space-y-8">
            <section className="p-10 rounded-[3rem] bg-blue-600 text-white relative overflow-hidden group min-h-[400px] flex flex-col justify-between shadow-2xl shadow-blue-200">
               <div className="absolute -top-20 -right-20 p-8 opacity-10 transition-transform group-hover:rotate-12 duration-1000">
                  <ShieldCheck className="w-80 h-80" />
               </div>
               
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 leading-none">Asset Output Buffer</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-tight">Sync <br /> Confirmation</h2>
                    <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-xs">
                      Once successfully synchronized, Cloudinary returns a global public URL optimized for our AI production backbone.
                    </p>
                  </div>
               </div>

               <div className="relative z-10 space-y-4">
                  {resultUrl ? (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4 animate-in zoom-in-95">
                       <div className="flex items-center justify-between">
                          <Badge className="bg-white/20 text-white border-none py-1 px-2 text-[8px] font-black uppercase tracking-widest">Global URL</Badge>
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                       </div>
                       <p className="text-[10px] font-mono break-all opacity-80 leading-tight">
                         {resultUrl}
                       </p>
                       <Button 
                         asChild
                         variant="ghost" 
                         className="w-full text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white border-white/10"
                       >
                         <Link href={resultUrl} target="_blank">
                           Inspect Media <ExternalLink className="w-3 h-3 ml-2" />
                         </Link>
                       </Button>
                    </div>
                  ) : (
                    <div className="h-32 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center opacity-40">
                       <span className="text-xs font-black uppercase tracking-widest">Awaiting Uplink...</span>
                    </div>
                  )}
               </div>
            </section>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-2">
                  <Globe className="w-5 h-5 text-blue-500/40" />
                  <h4 className="text-[10px] font-black uppercase tracking-wider italic">Edge Delivery</h4>
                  <p className="text-[9px] text-neutral-400 font-medium leading-tight">Global CDN ensures low latency for remote agent downloads.</p>
               </div>
               <div className="p-6 rounded-3xl bg-white border border-neutral-100 shadow-sm space-y-2">
                  <ShieldCheck className="w-5 h-5 text-blue-500/40" />
                  <h4 className="text-[10px] font-black uppercase tracking-wider italic">Secure Storage</h4>
                  <p className="text-[9px] text-neutral-400 font-medium leading-tight">Encrypted multi-region redundancy for production assets.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pt-12 border-t border-neutral-100">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.4em]">
            Autonomous Asset Lifecycle &bull; Cloudinary Hub V1.0
          </p>
        </footer>
      </div>
    </div>
  );
}
