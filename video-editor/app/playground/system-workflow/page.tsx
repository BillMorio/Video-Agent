"use client";

import Link from "next/link";
import { 
  ArrowLeft, Cpu, Bot, Code2, 
  Repeat, Box, Zap, Sparkles, 
  ArrowRight, ShieldCheck, Database, 
  MessageSquare, Layers, Settings2,
  AlertCircle, Workflow, Terminal,
  Mic2, FileText, Share2, UserCheck,
  CheckCircle2, Clock, ListOrdered,
  Layout, Database as SupabaseIcon,
  Search, PlayCircle, Loader2,
  XCircle as XCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SystemWorkflowPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
      {/* Floating Back Button */}
      <div className="fixed top-8 left-8 z-50">
        <Link 
          href="/playground" 
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background/80 backdrop-blur-md hover:bg-muted transition-all shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Playground Hub</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-32">
        {/* Hero Section */}
        <header className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Layers className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">End-to-End Pipeline</span>
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent">
            Autonomous Video Pipeline
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            From raw script to fully orchestrated video scenes. A deep dive into the hybrid pre-processing and agentic execution architecture.
          </p>
        </header>

        {/* Phase 1: The Pre-Processing Chain */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Phase 1: The Pre-Processing Chain</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Turning raw text into structured data before the agent even wakes up.</p>
          </div>

          <div className="relative">
            {/* Visual Flow Line (Horizontal for Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Audio Gen",
                  icon: Mic2,
                  desc: "Script -> Eleven Labs",
                  sub: "High-quality voiceover generation.",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                  border: "border-blue-500/20"
                },
                {
                  title: "Transcription",
                  icon: Clock,
                  desc: "Whisper / AssemblyAI",
                  sub: "Word-level timestamps for timing.",
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                  border: "border-purple-500/20"
                },
                {
                  title: "Scene Reasoning",
                  icon: Brain,
                  desc: "LLM Parsing",
                  sub: "Determine Scene categories & visuals.",
                  color: "text-indigo-500",
                  bg: "bg-indigo-500/10",
                  border: "border-indigo-500/20"
                },
                {
                  title: "State Persistence",
                  icon: SupabaseIcon,
                  desc: "Supabase DB",
                  sub: "Logging initial Scene JSON structure.",
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                  border: "border-emerald-500/20"
                }
              ].map((step, i) => (
                <Card key={i} className={`relative z-10 bg-background border-2 ${step.border} group hover:scale-105 transition-transform`}>
                  <CardContent className="pt-8 pb-6 text-center space-y-3">
                    <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center mx-auto mb-2`}>
                      <step.icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <div className="font-bold text-sm">{step.title}</div>
                    <div className="text-xs font-mono opacity-80">{step.desc}</div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-normal">{step.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Phase 2: The Agentic Workflow Loop */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Phase 2: The Agentic Execution Loop</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">The autonomous brain pulls scenes from the database and executes specific tool calls based on visual type.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Repeat className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Sequential Scene Processing</h3>
                  <p className="text-xs text-muted-foreground">Agent pulls ONE scene at a time from Supabase. Process → Sync → Repeat.</p>
                </div>
              </div>

              {/* Loop Steps */}
              <div className="space-y-4 pl-4 border-l-2 border-border ml-5">
                {[
                  {
                    type: "A-Roll Scene",
                    icon: UserCheck,
                    action: "HeyGen API Tool",
                    details: "Audio URL + Avatar ID -> Video generation.",
                    status: "Auto-Log to DB"
                  },
                  {
                    type: "B-Roll Scene",
                    icon: Search,
                    action: "Pexels API Tool",
                    details: "Keywords -> Search -> Select top footage.",
                    status: "Auto-Log to DB"
                  },
                  {
                    type: "Image / Motion",
                    icon: AlertCircle,
                    action: "Manual Placeholder",
                    details: "Skip auto-generation for now.",
                    status: "Status: Awaiting Human Input"
                  }
                ].map((loop, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute -left-[27px] top-2 w-3 h-3 rounded-full bg-border group-hover:bg-indigo-500 transition-colors" />
                    <div className="p-4 rounded-lg bg-muted/30 border border-border group-hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-muted-foreground">
                          <loop.icon className="w-3 h-3" /> {loop.type}
                        </span>
                        <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-500 bg-amber-500/5 uppercase font-bold">AWAITING_INPUT</Badge>
                      </div>
                      <div className="text-sm font-semibold mb-1">{loop.action}</div>
                      <p className="text-xs text-muted-foreground">{loop.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Database as Memory? */}
            <Card className="border-indigo-500/30 bg-indigo-500/[0.02] shadow-2xl shadow-indigo-500/10">
              <CardHeader className="space-y-1">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-6 h-6 text-indigo-500" />
                </div>
                <CardTitle className="text-xl">Database as External Memory</CardTitle>
                <CardDescription>Why we log to Supabase instead of relying on the LLM's context window.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-relaxed">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      1. Avoiding Context Overflow
                    </h4>
                    <p className="text-muted-foreground text-xs font-medium">
                      If you have 50 scenes, feeding all of them + all tool results back to the LLM will eventually exceed its token limit ("Context Window").
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-background border border-border">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-blue-500" />
                      2. State Resilience (Check-pointing)
                    </h4>
                    <p className="text-muted-foreground text-xs font-medium">
                      If the browser refreshes or the agent crashes, the database knows exactly where it left off. The agent just asks: "Give me the next scene where status is 'TODO'."
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-background border border-border">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-emerald-500" />
                      3. Long-Term Retrieval
                    </h4>
                    <p className="text-muted-foreground text-xs font-medium">
                      The agent doesn't need to "remember" Scene 1 while processing Scene 42. It only needs the current scene's context + its system instructions.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-bold text-indigo-400">
                    Agent Perspective: "I am a stateless executor. The database is my persistent brain."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Phase 2.5: Asynchronous Orchestration (The "Launch & Poll" Pattern) */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Phase 2.5: Asynchronous Orchestration</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">How to handle long-running APIs (HeyGen, Eleven Labs) without blocking the entire pipeline.</p>
          </div>

          <Card className="border-border bg-muted/5 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Step 1: Trigger */}
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-sm">1</div>
                  <h4 className="font-bold uppercase tracking-widest text-xs">Launch</h4>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                    <Zap className="w-3 h-3" /> POST /v1/video/generate
                  </div>
                  <p className="text-xs text-muted-foreground">The agent starts the job. The API returns a <code>job_id</code> immediately (202 Accepted).</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px] bg-blue-500/5 text-blue-400">STATUS: PROCESSING</Badge>
                </div>
              </div>

              {/* Step 2: Parallel Work */}
              <div className="p-8 space-y-4 bg-indigo-500/[0.02]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-sm">2</div>
                  <h4 className="font-bold uppercase tracking-widest text-xs">Autonomous Drift</h4>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Instead of waiting (which would waste money/time), the agent <strong>moves to the next scene</strong>.
                  </p>
                  <div className="p-3 rounded-lg border border-dashed border-indigo-500/30 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-tighter">Job #123 Running in Cloud...</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Agent is now searching Pexels for Scene 2.</p>
                </div>
              </div>

              {/* Step 3: Polling/Sync */}
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm">3</div>
                  <h4 className="font-bold uppercase tracking-widest text-xs">Sync & Close</h4>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <Search className="w-3 h-3" /> GET /v1/video/status
                  </div>
                  <p className="text-xs text-muted-foreground">When the agent finishes other tasks, it "checks back". If Done, it downloads the URL.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-400">STATUS: COMPLETED</Badge>
                </div>
              </div>
            </div>

            {/* Technical State Machine */}
            <div className="bg-background border-t border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-indigo-500" />
                  Database State Machine
                </h4>
                <Badge variant="secondary" className="text-[10px]">SUPABASE SYNC</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { state: "PENDING", desc: "Scene identified but no work started." },
                  { state: "PROCESSING", desc: "HeyGen/11Labs job launched. job_id stored." },
                  { state: "RETRY", desc: "Job failed. Scheduled to try again." },
                  { state: "COMPLETED", desc: "Asset URL secured and ready for render." }
                ].map((s, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-xs font-bold font-mono text-indigo-400">{s.state}</div>
                    <p className="text-[10px] text-muted-foreground leading-snug">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* New Strategic Comparison Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-500" />
              Strategic Decision: Who drives the polling?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/[0.02] space-y-3">
                <div className="flex items-center gap-2 text-red-500 font-bold text-sm uppercase">
                  <XCircle2 className="w-4 h-4" /> Option A: LLM-Driven
                </div>
                <p className="text-xs text-muted-foreground">The LLM stays "awake" and repeatedly calls a status tool every 10 seconds.</p>
                <ul className="text-[10px] space-y-1 text-muted-foreground">
                  <li>❌ <strong>High Cost</strong>: Paying for LLM reasoning on every "Not yet" check.</li>
                  <li>❌ <strong>History Bloat</strong>: Fills context window with repetitive status logs.</li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] space-y-3">
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm uppercase">
                  <CheckCircle2 className="w-4 h-4" /> Option B: System-Driven (Recommended)
                </div>
                <p className="text-xs text-muted-foreground">The LLM "Yields" control to a background worker in your application code.</p>
                <ul className="text-[10px] space-y-1 text-muted-foreground">
                  <li>✅ <strong>Cost Effective</strong>: Zero LLM cost during the waiting period.</li>
                  <li>✅ <strong>Process Cleanup</strong>: LLM only wakes up when the asset is actually ready.</li>
                </ul>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground italic">
              "We treat the LLM like a high-priced consultant. You don't ask a consultant to sit and watch paint dry; you call them back when the paint is dry."
            </p>
          </div>
        </section>

        {/* Phase 3: The Integration Architecture */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Phase 3: Integration Architecture</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">The technical stack required to handle each autonomous step.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm technical-label uppercase tracking-widest text-blue-500">Video Synthesis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">HEYGEN API</span>
                  <Badge variant="secondary">A-ROLL</Badge>
                </div>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• High-fidelity avatars</li>
                  <li>• Lip-sync to Eleven Labs audio</li>
                  <li>• Polling status for completion</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm technical-label uppercase tracking-widest text-orange-500">Asset Discovery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">PEXELS API</span>
                  <Badge variant="secondary">B-ROLL</Badge>
                </div>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• Intelligent keyword search</li>
                  <li>• Aspect ratio filtering</li>
                  <li>• direct MP4 CDN links</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm technical-label uppercase tracking-widest text-emerald-500">Final Processing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">FFMPEG SERVER</span>
                  <Badge variant="secondary">COMPOSITING</Badge>
                </div>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• Precise trimming to timestamps</li>
                  <li>• Zoom/Ken Burns overlays</li>
                  <li>• Speed adjustment for fitting</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Closing: The Completion Cycle */}
        <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-12 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-4xl font-extrabold tracking-tight">Agent Status: Done.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Once every scene has a "Generated" status in the database, the agent triggers a final notification. The video is now ready for **Human Review** or **Final Render**.
            </p>
          </div>

          <div className="pt-8 relative z-10">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 px-6 py-2 text-sm uppercase tracking-widest font-bold">
              Autonomous Loop Completed Successfully
            </Badge>
          </div>
        </section>

        {/* Footer Navigation */}
        <footer className="pt-12 flex justify-between items-center text-sm text-muted-foreground">
          <Link href="/playground/agent-docs" className="hover:text-primary transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Basic Agent Docs
          </Link>
          <p>© 2026 Autonomous Video Systems</p>
        </footer>
      </div>
    </div>
  );
}

function Brain(props: any) {
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
      <path d="M9.5 2a.5.5 0 0 1 .5.5v2.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5V2.5a.5.5 0 0 1 .5-.5h2Z" />
      <path d="M14 2a.5.5 0 0 1 .5.5v2.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5V2.5a.5.5 0 0 1 .5-.5h2Z" />
      <path d="M7 7a2 2 0 1 1-2.2-3.1" />
      <path d="M9 14v4" />
      <path d="M11 14v4" />
      <path d="M13 14v4" />
      <path d="M15 14v4" />
      <path d="M11 11a4.5 4.5 0 1 0 2 0" />
      <path d="M9 11v-1a4 4 0 0 1 6 0v1" />
      <path d="M22 7a2 2 0 1 0-2.2-3.1" />
      <path d="M5 11v1" />
      <path d="M19 11v1" />
      <path d="M5 17a2 2 0 1 0 2.2 3.1" />
      <path d="M19 17a2 2 0 1 1-2.2 3.1" />
    </svg>
  );
}
