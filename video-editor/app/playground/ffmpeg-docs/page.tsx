"use client";

import Link from "next/link";
import { 
  ArrowLeft, Cpu, Settings2, 
  Box, Zap, Sparkles, 
  ArrowRight, ShieldCheck, Database, 
  Layers, Workflow, Terminal,
  Clock, PlayCircle, Loader2,
  CheckCircle2, HardDrive, Trash2,
  Film, FileVideo, Waves, Scissors,
  FastForward, Share2, AlertCircle,
  Code2 as CodeIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function FFmpegArchitecturePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-orange-500/30">
      {/* Sidebar-style Nav (Floating) */}
      <div className="fixed top-8 left-8 z-50">
        <Link 
          href="/playground" 
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background/80 backdrop-blur-md hover:bg-muted transition-all shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Back to Hub</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-24">
        {/* Hero Section */}
        <header className="space-y-6 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Settings2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Infrastructure Core</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
            FFmpeg Production Engine
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A comprehensive guide to the underlying video processing architecture that powers our autonomous B-Roll fitting and Master Stitching pipeline.
          </p>
        </header>

        {/* 1. High-Level Architecture Diagram */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">System Architecture</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">The bridge between the Web UI, LLM Agents, and raw video processing.</p>
          </div>

          <div className="relative p-12 rounded-[2rem] border border-border bg-muted/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center relative z-10">
              {/* Agent UI / Next.js */}
              <div className="space-y-6 flex flex-col items-center">
                <Card className="w-full bg-background border-border shadow-2xl text-center p-6 space-y-3 border-b-4 border-b-blue-500">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto">
                    <Layers className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="font-bold text-sm">Video Editor App</div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">Orchestrator & Agent UI</p>
                </Card>
                <div className="flex flex-col items-center opacity-30">
                  <ArrowRight className="w-6 h-6 rotate-90" />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">REST Request</span>
                </div>
                <Card className="w-full bg-background border-border shadow-lg text-center p-6 space-y-3 border-b-4 border-b-indigo-500">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto">
                    <Database className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div className="font-bold text-sm">Supabase Storage</div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">Cloud Asset Hosting</p>
                </Card>
              </div>

              {/* Central Flow Arrows */}
              <div className="hidden md:flex flex-col items-center justify-center gap-16">
                <div className="flex items-center gap-2 group cursor-pointer hover:scale-110 transition-transform">
                  <div className="h-0.5 w-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full" />
                  <ArrowRight className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex items-center gap-2 group cursor-pointer hover:scale-110 transition-transform">
                  <ArrowLeft className="w-4 h-4 text-orange-500" />
                  <div className="h-0.5 w-16 bg-gradient-to-l from-indigo-500 to-orange-500 rounded-full" />
                </div>
              </div>

              {/* FFmpeg Backend */}
              <div className="space-y-6 flex flex-col items-center">
                <Card className="w-full bg-background border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.15)] text-center p-8 space-y-4 border-b-4 border-b-orange-500 group hover:border-orange-500 transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <Settings2 className="w-8 h-8 text-orange-500 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">FFmpeg Engine</div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">Standalone Microservice</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="text-[8px] border-orange-500/20 text-orange-400 bg-orange-500/5 uppercase font-bold tracking-tight">LOCAL_UPLOADS</Badge>
                    <Badge variant="outline" className="text-[8px] border-orange-500/20 text-orange-400 bg-orange-500/5 uppercase font-bold tracking-tight">FFMPEG_FLUENT</Badge>
                  </div>
                </Card>
                <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 text-center w-full">
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <HardDrive className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Scratch Disk</span>
                  </div>
                  <p className="text-[8px] text-muted-foreground">Local storage for high-speed encoding</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Core API Modules */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Autonomous Tool Modules</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">The specific APIs the AI B-Roll Agent utilizes to conform footage to script requirements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Trim API */}
            <Card className="border-border bg-muted/5 group hover:border-orange-500/30 transition-all">
              <CardHeader className="space-y-1 pb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Scissors className="w-6 h-6 text-orange-500" />
                </div>
                <CardTitle className="text-xl">Trimming API</CardTitle>
                <CardDescription>Surgical extraction of scene-relevant clips.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Badge variant="secondary" className="font-mono text-[10px] uppercase">POST /api/trim</Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Used when stock footage is too long. The agent extracts a specific window (e.g., from 5s to 8s) to avoid processing massive files.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-black/40 font-mono text-[10px] text-orange-300">
                  <div className="opacity-50 text-white mb-2">// Sample Request</div>
                  {`{\n  "videoUrl": "https://...",\n  "startTime": 0,\n  "duration": 3.0\n}`}
                </div>
              </CardContent>
            </Card>

            {/* Scale/Speed API */}
            <Card className="border-border bg-muted/5 group hover:border-orange-500/30 transition-all">
              <CardHeader className="space-y-1 pb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FastForward className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="text-xl">Fitting API</CardTitle>
                <CardDescription>Conforming footage to storyboard duration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Badge variant="secondary" className="font-mono text-[10px] uppercase">POST /api/speed</Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Uses the <code>setpts</code> filter to adjust playback speed without pitch-shifting audio. Ensures 100% timing accuracy for script alignment.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-black/40 font-mono text-[10px] text-blue-300">
                  <div className="opacity-50 text-white mb-2">// Sample Request</div>
                  {`{\n  "videoUrl": "https://...",\n  "targetDuration": 12.0\n}`}
                </div>
              </CardContent>
            </Card>

            {/* Stitching API */}
            <Card className="md:col-span-2 border-orange-500/20 bg-orange-500/[0.02] group hover:border-orange-500/40 transition-all">
              <CardHeader className="flex flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Film className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Production Assembly (Stitching)</CardTitle>
                  <CardDescription>N-Way normalization and master video rendering.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-orange-500 border-orange-500/30 uppercase tracking-widest text-[9px] font-bold">The Pipeline</Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The most complex stage. It pulls all scene assets (A-Roll, B-Roll, Graphics), normalizes them to a unified format (1080p, 30fps), and applies cinematic transitions.
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {[
                      { icon: Scissors, label: "Normalization", desc: "Forcing all mixed resolutions to 1920x1080." },
                      { icon: Waves, label: "Audio Crossfade", desc: "Synchronized sequential volume fades." },
                      { icon: Sparkles, label: "Production Handles", desc: "Automatic +0.8s padding to preserve content." }
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <feature.icon className="w-3.5 h-3.5 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground/80">{feature.label}</p>
                          <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative">
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-500/10 blur-[80px] pointer-events-none" />
                  <div className="rounded-xl border border-orange-500/30 bg-black p-6 space-y-4 relative z-10 shadow-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal className="w-4 h-4 text-orange-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Filter Graph Construction</span>
                    </div>
                    <div className="font-mono text-[9px] leading-relaxed text-orange-200/80 space-y-1">
                      <p><span className="text-orange-500">[0:v]</span>scale=1920:1080,fade=t=out:st=2.6:d=0.4<span className="text-orange-500">[v0];</span></p>
                      <p><span className="text-orange-500">[1:v]</span>scale=1920:1080,fade=t=in:st=0:d=0.4<span className="text-orange-500">[v1];</span></p>
                      <p><span className="text-orange-500">[v0][v1]</span>concat=n=2:v=1<span className="text-orange-500">[outv]</span></p>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xl">{i}</div>
                        ))}
                      </div>
                      <span className="text-[9px] font-bold uppercase text-muted-foreground">Master Track Generated</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. The Data Lifecycle (Supabase & Cleanup) */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">The Asset Lifecycle</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Click on any phase to see the technical deep-dive and implementation details.</p>
          </div>

          <div className="relative">
            {/* Desktop Animated Connecting Lines */}
            <div className="hidden lg:block absolute top-[100px] left-[15%] right-[15%] h-[2px] z-0">
              <svg className="w-full h-full" viewBox="0 0 800 2" fill="none">
                <path d="M0 1H800" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" className="text-orange-500/30">
                  <animate attributeName="stroke-dashoffset" from="16" to="0" dur="1s" repeatCount="indefinite" />
                </path>
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {[
                {
                  id: "download",
                  step: "01",
                  label: "Download",
                  icon: ArrowDownIcon,
                  desc: "Supabase CDN -> Local FS",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                  tech: {
                    implementation: "Axios responseType: 'stream'",
                    command: "curl -o uploads/temp_file.mp4 [SUPABASE_URL]",
                    details: "Assets are buffered into the local `uploads/` directory. We use stream-based downloads to handle large files without memory exhaustion.",
                    errors: "CORS issues, Network Interruption, Incomplete Writes"
                  }
                },
                {
                  id: "process",
                  step: "02",
                  label: "Process",
                  icon: Workflow,
                  desc: "FFmpeg Filter Execution",
                  color: "text-orange-500",
                  bg: "bg-orange-500/10",
                  tech: {
                    implementation: "fluent-ffmpeg .complexFilter()",
                    command: "ffmpeg -i in.mp4 -vf 'scale=1920:1080' out.mp4",
                    details: "The core engine normalizes frames, applies handles, and chains transitions. Progress is tracked via the `.on('progress')` event emitter.",
                    errors: "Codec Mismatch, Filter Parser Error, Resource Exhaustion"
                  }
                },
                {
                  id: "upload",
                  step: "03",
                  label: "Upload",
                  icon: Share2,
                  desc: "Local FS -> Supabase CDN",
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                  tech: {
                    implementation: "supabase.storage.upload(path, stream)",
                    command: "Using fs.createReadStream for memory safety",
                    details: "The processed MP4 is streamed directly back to the cloud. We immediately resolve the public URL for inclusion in the storyboard state.",
                    errors: "Storage Quota, Permission Denied, Chunk Timeout"
                  }
                },
                {
                  id: "cleanup",
                  step: "04",
                  label: "Cleanup",
                  icon: Trash2,
                  desc: "Unlink Temporary Files",
                  color: "text-red-500",
                  bg: "bg-red-500/10",
                  tech: {
                    implementation: "fs.unlinkSync([path])",
                    command: "rm -f uploads/*",
                    details: "Atomic cleanup phase. Both the input and output temporary files are purged from the scratch disk to maintain server health.",
                    errors: "Locked Handles, Permission Denied, Ghost Files"
                  }
                }
              ].map((phase, i) => (
                <LifecycleCard key={phase.id} phase={phase} />
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 shadow-xl space-y-6">
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-indigo-500" />
              <div>
                <h4 className="font-bold text-lg">Server Resilience</h4>
                <p className="text-xs text-muted-foreground">Optimizations for long-running production tasks.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Stream-Based Uploads</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We use <code>fs.createReadStream</code> to pipe video data directly to Supabase. This prevents "Out of Memory" crashes by avoiding loading 100MB+ files into RAM.
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Timeout Management</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The Node.js server timeout is increased to <strong>10 minutes</strong> for assembly tasks, ensuring large video renders don't get terminated mid-process.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Closing: Technical Summary */}
        <section className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-12 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/10 blur-[100px] pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <CheckCircle2 className="w-16 h-16 text-orange-500 mx-auto" />
            <h2 className="text-4xl font-extrabold tracking-tight">Production Ready.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our FFmpeg architecture is designed for scale, precision, and autonomous execution. It handles the heavy lifting of media processing so the agent can focus on creative direction.
            </p>
          </div>

          <div className="pt-8 relative z-10">
             <Link 
              href="/playground/ffmpeg"
              className="px-8 py-3 rounded-xl bg-orange-500 text-white font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 mx-auto w-fit shadow-xl shadow-orange-500/20"
            >
              <Terminal className="w-4 h-4 fill-current" />
              Test Assembly API
            </Link>
          </div>
        </section>

        {/* Footer Navigation */}
        <footer className="pt-12 flex justify-between items-center text-sm text-muted-foreground border-t border-border">
          <Link href="/playground/agent-docs" className="hover:text-primary transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Agent Architecture
          </Link>
          <p>© 2026 Production Audio-Visual Systems</p>
        </footer>
      </div>
    </div>
  );
}

function LifecycleCard({ phase }: { phase: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="relative z-10 bg-background/50 backdrop-blur-md border-2 hover:border-orange-500/50 hover:scale-105 transition-all cursor-pointer group">
          <CardContent className="p-8 text-center space-y-4">
            <div className={`w-12 h-12 rounded-2xl ${phase.bg} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg shadow-black/5`}>
              <phase.icon className={`w-6 h-6 ${phase.color}`} />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] technical-label uppercase tracking-widest text-muted-foreground">{phase.step} Phase</div>
              <div className="font-bold text-base">{phase.label}</div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{phase.desc}</p>
            
            <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-orange-500/30 text-orange-500 font-bold">
                View Details
              </Badge>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl border-orange-500/20 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl ${phase.bg} flex items-center justify-center`}>
              <phase.icon className={`w-5 h-5 ${phase.color}`} />
            </div>
            <div className="text-left">
              <DialogTitle className="text-2xl font-bold">{phase.label} Phase</DialogTitle>
              <DialogDescription className="technical-label uppercase tracking-widest text-orange-400 text-[10px]">
                Technical Deep-Dive
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Workflow className="w-3 h-3 text-blue-500" />
                Implementation
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {phase.tech.details}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/[0.02] space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-red-500">
                <AlertCircle className="w-3 h-3" />
                Common Failures
              </h4>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {phase.tech.errors}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black border border-white/10 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 flex items-center gap-2">
                <Terminal className="w-3 h-3" />
                Shell/Logic Equivalent
              </h4>
              <code className="block p-2 rounded bg-white/5 text-[10px] font-mono text-orange-300 leading-normal break-all">
                {phase.tech.command}
              </code>
            </div>
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                <CodeIcon className="w-3 h-3" />
                API Logic
              </h4>
              <p className="text-[10px] font-mono text-indigo-300">
                {phase.tech.implementation}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ArrowDownIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}
