"use client";

import Link from "next/link";
import { 
  ArrowLeft, 
  Zap, 
  Sparkles, 
  Video,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Workflow,
  ImageIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WavespeedPlaygroundLandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-indigo-100 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
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
            <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-tight text-indigo-700">Wavespeed Protocol Active</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-tight">
              Wavespeed <br /> <span className="text-indigo-600 opacity-80">InfiniteTalk</span>
            </h1>
            <p className="text-neutral-500 font-medium max-w-lg leading-relaxed text-lg">
              Unlock ultra-high-speed neural lip-sync synthesis and rapid visual conceptualization. Transform scripts into dynamic media entities instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/playground/wavespeed/create"
              className="px-8 py-4 rounded-2xl bg-neutral-900 text-white font-bold uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-neutral-800 transition-all active:scale-95 shadow-xl shadow-neutral-200"
            >
              <Video className="w-4 h-4 text-indigo-400" />
              Video Synthesizer
            </Link>
            <Link 
              href="/playground/wavespeed/image"
              className="px-8 py-4 rounded-2xl bg-white border-2 border-neutral-100 text-neutral-900 font-bold uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-neutral-50 transition-all active:scale-95"
            >
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              Image Synthesis
            </Link>
            <Link 
              href="https://wavespeed.ai" 
              target="_blank"
              className="px-8 py-4 rounded-2xl bg-white border-2 border-neutral-100 text-neutral-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-neutral-50 transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Core Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { title: "Temporal Coherence", desc: "Perfectly synced lip movements with high-fidelity frame interpolation.", icon: Cpu },
             { title: "Rapid Inference", desc: "Optimized GPU clusters delivering 480p/720p renders in under 30 seconds.", icon: Zap },
             { title: "Autonomous Loop", desc: "Ready for agentic orchestration via RESTful state-machine polling.", icon: Workflow }
           ].map((cap, i) => (
             <Card key={i} className="border-2 border-neutral-100 rounded-3xl overflow-hidden group hover:border-indigo-100 transition-all">
                <CardContent className="p-8 space-y-4">
                   <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                      <cap.icon className="w-6 h-6" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="font-black uppercase tracking-tight italic">{cap.title}</h3>
                      <p className="text-sm text-neutral-500 font-medium leading-relaxed">{cap.desc}</p>
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>

        {/* System Context */}
        <section className="p-12 rounded-[3.5rem] bg-indigo-600 text-white relative overflow-hidden group">
           <div className="absolute -top-24 -right-24 p-8 opacity-10 transition-transform group-hover:rotate-12 duration-1000">
              <ShieldCheck className="w-96 h-96" />
           </div>
           <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 leading-none">Global Infrastructure Access</span>
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Neural Video <br /> Processing Core</h2>
                <p className="text-indigo-100 text-lg font-medium leading-relaxed max-w-xl">
                  This interface provides low-level access to the InfiniteTalk V3 API backbone. Use it to validate production assets before committing to complex agent orchestration.
                </p>
              </div>
              <div className="flex gap-4">
                 <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                   Status: Operational
                 </Badge>
                 <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                   Region: US-EAST-1
                 </Badge>
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-12 border-t border-neutral-100">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.4em]">
            Autonomous Generation Engine &bull; Wavespeed V3.0
          </p>
        </footer>
      </div>
    </div>
  );
}
