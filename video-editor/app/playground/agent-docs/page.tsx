"use client";

import Link from "next/link";
import { 
  ArrowLeft, Cpu, Bot, Code2, 
  Repeat, Box, Zap, Sparkles, 
  ArrowRight, ShieldCheck, Database, 
  MessageSquare, Layers, Settings2,
  AlertCircle, Workflow, Terminal, FileJson, ArrowDown, ArrowDown as ArrowDownIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AgentArchitecturePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Cpu className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Technical Specification</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
            AI Agent Architecture
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A comprehensive guide to building autonomous systems that bridge the gap between high-level human intent and low-level code execution.
          </p>
        </header>

        {/* 1. Global Orchestration Flow */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Layers className="w-6 h-6 text-indigo-500" />
              1. Global Orchestration Flow
            </h2>
            <p className="text-muted-foreground">The high-level path of data from user request to final execution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* User */}
            <Card className="bg-background border-border shadow-sm text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 text-orange-500" />
              </div>
              <div className="font-bold text-sm">User</div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">NATURAL LANGUAGE INPUT</p>
            </Card>

            <div className="hidden md:flex justify-center text-muted-foreground">
              <ArrowRight className="w-6 h-6 animate-pulse" />
            </div>

            {/* Orchestrator */}
            <Card className="bg-indigo-500/5 border-indigo-500/20 shadow-lg text-center p-6 space-y-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mx-auto relative z-10">
                <Bot className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="font-bold text-sm relative z-10">Orchestrator</div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight relative z-10">LLM (REASONING ENGINE)</p>
            </Card>

            <div className="hidden md:flex justify-center text-muted-foreground">
              <ArrowRight className="w-6 h-6 animate-pulse" />
            </div>

            {/* Tools */}
            <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-sm text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                <Settings2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="font-bold text-sm">Tool Executor</div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">CODE / API EXECUTION</p>
            </Card>
          </div>
        </section>

        {/* 2. The Tool-Calling Lifecycle */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Repeat className="w-6 h-6 text-indigo-500" />
              2. The Tool-Calling Lifecycle
            </h2>
            <p className="text-muted-foreground">How the LLM communicates with your backend via JSON.</p>
          </div>

          <Card className="overflow-hidden border-border bg-muted/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
              {/* Request */}
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">AGENT OUTPUT</Badge>
                  <code className="text-[10px] text-muted-foreground">role: assistant</code>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                    <Terminal className="w-3 h-3" /> Tool Call (JSON)
                  </h4>
                  <pre className="p-4 rounded-lg bg-black text-xs font-mono text-blue-400 overflow-x-auto ring-1 ring-white/10 shadow-inner">
{`{
  "name": "search_videos",
  "arguments": {
    "query": "ocean waves",
    "orientation": "landscape"
  }
}`}
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The LLM doesn't "run" the function. It returns a specific JSON object expressing its <strong>intent</strong> to run a function.
                </p>
              </div>

              {/* Execution */}
              <div className="p-8 space-y-4 bg-muted/20">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">SYSTEM RESPONSE</Badge>
                  <code className="text-[10px] text-muted-foreground">role: tool</code>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                    <Workflow className="w-3 h-3" /> Tool Result (JSON)
                  </h4>
                  <pre className="p-4 rounded-lg bg-black text-xs font-mono text-emerald-400 overflow-x-auto ring-1 ring-white/10 shadow-inner">
{`{
  "status": "success",
  "data": {
    "url": "https://pexels.com/v/123",
    "duration": 12.5
  }
}`}
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your code executes the API call (Pexels, FFmpeg) and feeds the raw results back to the LLM's conversation history.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* 3.5. Full Agent Context Anatomy */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Box className="w-6 h-6 text-indigo-500" />
              Anatomy of the "Full Context"
            </h2>
            <p className="text-muted-foreground">What the LLM sees at the exact moment of decision-making.</p>
          </div>

          <Card className="bg-black/50 border-indigo-500/30 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Left: The Data Sources */}
              <div className="p-6 border-b lg:border-b-0 lg:border-r border-border space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Context Sources</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                    <Database className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase">SQL Snapshot</p>
                      <p className="text-[10px] text-muted-foreground italic">Project metadata + Scene queue</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                    <FileJson className="w-4 h-4 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase">Schema Rules</p>
                      <p className="text-[10px] text-muted-foreground italic">Allowed types & JSON payloads</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                    <Terminal className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase">Recent History</p>
                      <p className="text-[10px] text-muted-foreground italic">Last 3 tool results (success/fail)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle: The JSON Payload */}
              <div className="lg:col-span-2 p-0 bg-black/40">
                <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/20">
                  <span className="text-[10px] font-mono text-muted-foreground">runtime_context_v1.json</span>
                  <Badge variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">READY FOR LLM</Badge>
                </div>
                <div className="p-6 font-mono text-[11px] leading-relaxed text-blue-300 overflow-x-auto max-h-[400px]">
                  <span className="text-muted-foreground">{"{"}</span><br />
                  &nbsp;&nbsp;<span className="text-indigo-400">"project"</span>: <span className="text-muted-foreground">{"{"}</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"title": <span className="text-white">"AI Revolution"</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"tone": <span className="text-white">"Dramatic/Cinematic"</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"transcript_url": <span className="text-emerald-500">"https://..."</span><br />
                  &nbsp;&nbsp;<span className="text-muted-foreground">{"},"}</span><br />
                  &nbsp;&nbsp;<span className="text-indigo-400">"current_scene"</span>: <span className="text-muted-foreground">{"{"}</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"id": <span className="text-white">"scn_99"</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"index": <span className="text-white">5</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"script": <span className="text-white">"A shot of a glowing futuristic city..."</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"visual_type": <span className="text-amber-400">"graphics"</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"visual_history": <span className="text-muted-foreground">[]</span><br />
                  &nbsp;&nbsp;<span className="text-muted-foreground">{"},"}</span><br />
                  &nbsp;&nbsp;<span className="text-indigo-400">"global_progress"</span>: <span className="text-muted-foreground">{"{"}</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"total_scenes": <span className="text-white">12</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;"completed_indices": <span className="text-white">[0, 1, 2, 3, 4]</span><br />
                  &nbsp;&nbsp;<span className="text-muted-foreground">{"}"}</span><br />
                  <span className="text-muted-foreground">{"}"}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-indigo-500/10 border-t border-indigo-500/30">
              <p className="text-xs text-indigo-300 italic">
                <strong>Insight:</strong> By passing both the "Small Picture" (current_scene) and the "Big Picture" (global_progress), the agent can make artistic decisions that ensure the sequence of visuals feels cohesive rather than random.
              </p>
            </div>
          </Card>
        </section>

        {/* 3.6. The n8n Mental Model (Semi-Agentic) */}

        {/* 3.7. The n8n Mental Model (Semi-Agentic) */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Workflow className="w-6 h-6 text-indigo-500" />
              The "n8n" Mental Model
            </h2>
            <p className="text-muted-foreground">Flow-based orchestration where AI is just a powerful node.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Visualizing the system as a <strong>Semi-Agentic Workflow</strong> helps clarify the handoff between traditional code and LLM reasoning.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-500">1</div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Trigger Node</h4>
                    <p className="text-xs italic">System pulls Scene #{99} from DB</p>
                  </div>
                </div>
                <div className="flex items-center justify-center h-4 opacity-30"><ArrowDown className="w-4 h-4" /></div>
                <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-indigo-500 bg-background shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white"><Sparkles className="w-5 h-5 fill-current" /></div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Agentic Action Node</h4>
                    <p className="text-xs font-medium">LLM Decides: Pexels or HeyGen?</p>
                  </div>
                </div>
                <div className="flex items-center justify-center h-4 opacity-30"><ArrowDown className="w-4 h-4" /></div>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/20">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground">3</div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Output Node</h4>
                    <p className="text-xs">Update DB status & Final Assets</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-indigo-500/[0.05] to-transparent border-indigo-500/20 p-8 space-y-8 flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-400">Multi-Agent Hierarchy</h3>
              <div className="w-full space-y-8 relative">
                {/* Boss */}
                <div className="flex flex-col items-center group">
                  <div className="px-6 py-4 rounded-2xl border-2 border-indigo-500 bg-background shadow-[0_0_30px_rgba(99,102,241,0.3)] z-10 transition-transform group-hover:scale-110">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-indigo-500" />
                      <div className="text-left">
                        <p className="text-xs font-bold uppercase tracking-tighter">The Director</p>
                        <p className="text-[9px] text-muted-foreground">ORCHESTRATOR / DECISION MAKER</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-indigo-500/40" />
                </div>
                {/* Workers */}
                <div className="grid grid-cols-2 gap-6 w-full">
                  <div className="p-4 rounded-xl border border-border bg-background/50 text-center space-y-2 hover:border-emerald-500/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto"><Terminal className="w-5 h-5 text-emerald-500" /></div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Executor: Media</p>
                    <p className="text-[8px] text-muted-foreground italic">Pexels / Cloudinary</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-background/50 text-center space-y-2 hover:border-amber-500/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mx-auto"><Settings2 className="w-5 h-5 text-amber-500" /></div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400">Executor: Render</p>
                    <p className="text-[8px] text-muted-foreground italic">FFmpeg / HeyGen</p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-center text-muted-foreground max-w-xs leading-relaxed">
                The **Director** holds the strategy. The **Executors** are "dumb" tools that perform singular technical tasks without needing to know the "why".
              </p>
            </Card>
          </div>
        </section>

        {/* 4. Video Editor Orchestration: A Deep Dive */}
        <section className="space-y-8 pb-20">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              4. Video Editor Orchestration
            </h2>
            <p className="text-muted-foreground">Mapping a complex user request to a sequence of autonomous actions.</p>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)]">
              <p className="text-xl font-medium italic text-indigo-400">
                "Find me a dramatic 5s landscape shot of a mountain and add a subtle zoom."
              </p>
            </div>

            <div className="relative space-y-12 pt-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-border before:to-transparent">
              
              {/* Step 1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-indigo-500 bg-background text-indigo-500 shadow-xl z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[45%] p-4 rounded-xl border border-border bg-background shadow-md hover:border-indigo-500/50 transition-colors">
                  <h4 className="font-bold text-sm mb-1">Search Phase</h4>
                  <p className="text-xs text-muted-foreground mb-3">Agent searches Pexels for "dramatic mountain".</p>
                  <code className="block p-2 rounded bg-muted/50 text-[10px] font-mono text-indigo-400">pexels.search(&#123; q: "dramatic mountain", orientation: "landscape" &#125;)</code>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-indigo-500 bg-background text-indigo-500 shadow-xl z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:scale-110 transition-transform">
                  2
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[45%] p-4 rounded-xl border border-border bg-background shadow-md hover:border-indigo-500/50 transition-colors">
                  <h4 className="font-bold text-sm mb-1">Duration Clipping</h4>
                  <p className="text-xs text-muted-foreground mb-3">Agent trims the result to exactly 5 seconds.</p>
                  <code className="block p-2 rounded bg-muted/50 text-[10px] font-mono text-indigo-400">ffmpeg.trim(&#123; input: "vid_id", end: 5 &#125;)</code>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-indigo-500 bg-background text-indigo-500 shadow-xl z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:scale-110 transition-transform">
                  3
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[45%] p-4 rounded-xl border border-border bg-background shadow-md hover:border-indigo-500/50 transition-colors">
                  <h4 className="font-bold text-sm mb-1">Visual Polish</h4>
                  <p className="text-xs text-muted-foreground mb-3">Agent applies a 1x to 1.15x zoom over 5 seconds.</p>
                  <code className="block p-2 rounded bg-muted/50 text-[10px] font-mono text-indigo-400">ffmpeg.zoom(&#123; start: 1, end: 1.15 &#125;)</code>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-indigo-500 bg-background text-indigo-500 shadow-xl z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:scale-110 transition-transform">
                  4
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[45%] p-4 rounded-xl border border-border bg-background shadow-md hover:border-indigo-500/50 transition-colors">
                  <h4 className="font-bold text-sm mb-1">Final Insertion</h4>
                  <p className="text-xs text-muted-foreground mb-3">The processed asset is added to the scene's B-ROLL slot.</p>
                  <Badge variant="secondary" className="text-[9px] uppercase tracking-wider">Scene Index Updated</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4.5. The Logic Loop (How it "Knows" What's Next) */}

        {/* 4.5. The Logic Loop (How it "Knows" What's Next) */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3 justify-center">
              <Repeat className="w-6 h-6 text-indigo-500" />
              The Logic (ReAct) Loop
            </h2>
            <p className="text-muted-foreground">Tracing the agent's internal thought process through a complex task.</p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
            {/* Thought */}
            <div className="md:col-span-2 p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-3 relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-5"><MessageSquare className="w-12 h-12" /></div>
               <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Thought / Reasoning</h4>
               <p className="text-xs italic leading-relaxed">"Video search for 'Cyberpunk' returned an 8.5s clip, but my scene is only 3s. I must trim it."</p>
            </div>
            <div className="flex justify-center md:col-span-1 opacity-20"><ArrowRight className="rotate-90 md:rotate-0" /></div>
            {/* Action */}
            <div className="md:col-span-2 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-5"><Terminal className="w-12 h-12" /></div>
               <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Action / Execution</h4>
               <p className="text-xs font-mono text-amber-300">ffmpeg_trim({"{"} end: 3 {"}"})</p>
               <p className="text-[10px] text-muted-foreground italic">Calling FFmpeg Microservice...</p>
            </div>
            <div className="flex justify-center md:col-span-1 opacity-20"><ArrowRight className="rotate-90 md:rotate-0" /></div>
            {/* Observation */}
            <div className="md:col-span-1 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-center flex flex-col items-center justify-center gap-2">
               <Zap className="w-6 h-6 text-emerald-500" />
               <p className="text-[9px] font-bold uppercase">Success</p>
            </div>
          </div>

          <div className="bg-muted/30 border border-border p-6 rounded-2xl text-center">
            <p className="text-sm text-muted-foreground italic">
              By checking the <strong>Tool Response</strong> (Observation), the agent determines if its previous command worked. If not, it iterates. If yes, it moves to completion.
            </p>
          </div>
        </section>

        {/* 3.6. Scene Selection & Selection Logic */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Workflow className="w-6 h-6 text-indigo-500" />
              How the Agent "Knows"
            </h2>
            <p className="text-muted-foreground">The 3-step injection process that gives the agent its eyes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">1</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Select</span>
              </div>
              <div className="p-4 bg-muted/30 border border-border rounded-xl">
                <p className="text-[10px] text-muted-foreground italic mb-2">System Query:</p>
                <code className="text-[10px] font-mono whitespace-pre text-blue-400">
                  SELECT *<br />
                  FROM scenes<br />
                  WHERE status = 'todo'<br />
                  ORDER BY id<br />
                  LIMIT 1
                </code>
              </div>
            </div>

            <div className="flex items-center justify-center text-muted-foreground opacity-20">
              <ArrowRight className="w-8 h-8 rotate-90 md:rotate-0" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-400">2</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Hydrate</span>
              </div>
              <div className="p-4 bg-muted/30 border border-border rounded-xl">
                <p className="text-[10px] text-muted-foreground italic mb-2">Building Payload:</p>
                <p className="text-[10px] leading-relaxed">
                  The system fetches <code className="text-blue-400">project_meta</code> and <code className="text-blue-400">visual_history</code> for that specific scene ID.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center text-muted-foreground opacity-20">
              <ArrowRight className="w-8 h-8 rotate-90 md:rotate-0" />
            </div>
          </div>

          <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-indigo-500" />
              <div>
                <h4 className="font-bold text-lg">The "Context Injection" Prompt</h4>
                <p className="text-xs text-muted-foreground italic">"You are an expert video director. Your <strong>current scene</strong> is outlined below. Do not work on any other scenes."</p>
              </div>
            </div>
            
            <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            
            <p className="text-sm text-center text-muted-foreground max-w-2xl px-8">
              The agent doesn't "choose" its work. The <strong>Backend Orchestrator</strong> chooses it, packages it into a tidy JSON object, and shouts it into the Agent's ear as a "System Message". This pattern ensures the agent stays focused on <strong>one task at a time</strong>.
            </p>
          </div>
        </section>

        {/* Footer/CTA logic */}
        <footer className="pt-20 border-t border-border flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <h3 className="font-bold">Next Phase: Implementation</h3>
            <p className="text-sm text-muted-foreground">Ready to turn these diagrams into code?</p>
          </div>
          <div className="flex gap-4">
             <Link 
              href="/playground/openai"
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              Build Test Agent
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
