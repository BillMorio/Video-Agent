"use client";

import Link from "next/link";
import { 
  ArrowLeft, Film, Blend, Scissors, Maximize2, ZoomIn,
  ChevronRight, Sparkles, Activity, Terminal, Music, Mic2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tools = [
  {
    title: "Video Joiner",
    description: "Combine multiple video streams with xfade transitions.",
    href: "/playground/ffmpeg/concat",
    icon: Blend,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-100",
    status: "Operational"
  },
  {
    title: "Light Leak FX",
    description: "Synthetic organic transitions with animated color bursts.",
    href: "/playground/ffmpeg/light-leak",
    icon: Sparkles,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
    status: "New"
  },
  {
    title: "Trim & Fit",
    description: "Extract segments or warp time to fit target durations.",
    href: "/playground/ffmpeg/trim-fit",
    icon: Scissors,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
    status: "Operational"
  },
  {
    title: "Zoom Engine",
    description: "Precision Ken Burns effects with coordinate mapping.",
    href: "/playground/ffmpeg/zoom",
    icon: Maximize2,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-100",
    status: "Operational"
  },
  {
    title: "Zoom In Transition",
    description: "Multi-clip zoom-in flow with cinematic cross-fading.",
    href: "/playground/ffmpeg/zoom-transition",
    icon: ZoomIn,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-100",
    status: "New"
  },
  {
    title: "AI Agent Lab",
    description: "Converse with the Sonic Architect to orchestrate complex FFmpeg surgeries.",
    href: "/playground/agents",
    icon: Sparkles,
    color: "text-indigo-600", // Assuming text-indigo-600 for consistency with other tools' color property
    bgColor: "bg-indigo-50", // Assuming bg-indigo-50 for consistency
    borderColor: "border-indigo-100", // Assuming border-indigo-100 for consistency
    status: "New / Agentic" // Using 'status' for consistency, combining 'NEW' and 'AGENTIC'
  },
  {
    title: "Audio Trimmer",
    description: "Extract high-quality segments from any audio stream.",
    href: "/playground/ffmpeg/audio-trim",
    icon: Music,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    status: "New"
  },
  {
    title: "Whisper Transcriber",
    description: "Neural speech-to-text with word-level temporal precision.",
    href: "/playground/openai/whisper",
    icon: Mic2,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-100",
    status: "Intelligence"
  }
];

export default function FFmpegHubPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-indigo-100 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Navigation */}
        <Link 
          href="/playground" 
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors group font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Playground
        </Link>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 text-white">
             <Activity className="w-3 h-3 text-emerald-400" />
             <span className="text-[9px] font-black uppercase tracking-widest">FFmpeg Cluster v2.0</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-none">
            Processing <br /> <span className="text-indigo-600 opacity-80">Orchestra</span>
          </h1>
          <p className="text-neutral-500 font-medium max-w-lg leading-relaxed">
            Specialized tools for low-level video manipulation. Each module is optimized for the autonomous execution layer.
          </p>
        </header>

        {/* Tools Grid */}
        <div className="grid gap-4 pt-4">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group">
              <Card className={`border-2 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-indigo-500/5 ${tool.borderColor} ${tool.bgColor}`}>
                <CardContent className="p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-neutral-100 ${tool.color}`}>
                      <tool.icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl font-bold">{tool.title}</CardTitle>
                        <Badge variant="outline" className="text-[9px] font-black uppercase bg-white border-none text-neutral-400">{tool.status}</Badge>
                      </div>
                      <CardDescription className="text-neutral-500 font-medium">{tool.description}</CardDescription>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Server Context */}
        <section className="p-8 rounded-[2rem] bg-neutral-900 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Terminal className="w-32 h-32" />
           </div>
           <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Node Connected</span>
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tight">Modular Backend Protocol</h2>
              <p className="text-neutral-400 text-sm font-medium leading-relaxed max-w-md">
                Systems are currently pointing to the unified FFmpeg proxy. All operations are logged for diagnostic tracing.
              </p>
           </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-neutral-100">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.4em]">
            Precision Composition &bull; production_v4
          </p>
        </footer>
      </div>
    </div>
  );
}
