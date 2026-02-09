"use client";

import Link from "next/link";
import { 
  ArrowLeft, Database, Layers, Workflow, 
  Table as TableIcon, Key, Link as LinkIcon, 
  Code2, Info, ArrowDown, Share2, 
  Shield, Zap, Box, ListTree,
  ExternalLink, FileJson, LucideIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ColumnProps {
  name: string;
  type: string;
  desc: string;
  isPk?: boolean;
  isFk?: boolean;
  isNullable?: boolean;
}

function ColumnRow({ name, type, desc, isPk, isFk, isNullable }: ColumnProps) {
  return (
    <div className="group flex items-center justify-between py-3 border-b border-border/50 hover:bg-muted/30 transition-colors px-2 rounded-sm">
      <div className="flex items-center gap-3 min-w-[200px]">
        <code className={`text-sm font-bold ${isPk ? 'text-amber-500' : isFk ? 'text-blue-500' : 'text-foreground'}`}>
          {name}
        </code>
        <div className="flex gap-1">
          {isPk && <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] px-1 h-4">PK</Badge>}
          {isFk && <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[8px] px-1 h-4">FK</Badge>}
          {isNullable && <Badge variant="outline" className="text-[8px] px-1 h-4 opacity-50">NULL</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <code className="text-[10px] uppercase font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {type}
        </code>
        <p className="text-xs text-muted-foreground w-64 text-right">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function DatabaseSchemaPage() {
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

      <div className="max-w-6xl mx-auto px-6 py-20 space-y-32">
        {/* Hero Section */}
        <header className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Database className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Data Architecture</span>
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent italic">
            Schema Blueprint
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A comprehensive mapping of the relational hierarchy driving the autonomous orchestration engine.
          </p>
        </header>

        {/* Relationship Diagram Section */}
        <section className="space-y-12">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <Workflow className="w-6 h-6 text-blue-500" />
                ERD: Core Model
              </h2>
              <p className="text-sm text-muted-foreground">Entity Relationships & Foreign Key Constraints</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> PK</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> FK</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-border" /> 1:N</span>
            </div>
          </div>

          <div className="relative aspect-[21/10] bg-muted/20 border border-border rounded-2xl overflow-hidden flex items-center justify-center p-8 group">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
            
            {/* SVG Relationship Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-700">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-border" />
                </marker>
              </defs>
              {/* Projects to Scenes */}
              <path d="M 280 250 L 380 250" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-blue-500/50" markerEnd="url(#arrow)" />
              {/* Scenes to Jobs */}
              <path d="M 640 250 L 760 300" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-emerald-500/50" markerEnd="url(#arrow)" />
            </svg>

            {/* Entity Nodes */}
            <div className="relative z-10 w-full flex justify-between items-center px-4">
              {/* Projects Node */}
              <div className="w-64 p-4 bg-background/80 backdrop-blur-xl border-2 border-border rounded-xl shadow-2xl hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Box className="w-4 h-4 text-blue-500" /></div>
                  <div className="font-bold text-sm tracking-tight">projects</div>
                </div>
                <div className="space-y-1.5 font-mono text-[9px] opacity-70">
                  <div className="flex items-center gap-2 text-amber-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> id (PK)
                  </div>
                  <div className="flex items-center gap-2 text-foreground/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" /> title
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" /> status (enum)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" /> total_duration
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" /> master_audio_url
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" /> transcript_url
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50" /> metadata (jsonb)
                  </div>
                </div>
              </div>

              {/* Scenes Node */}
              <div className="w-64 p-4 bg-background/80 backdrop-blur-xl border-2 border-indigo-500/30 rounded-xl shadow-2xl hover:border-indigo-500 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Layers className="w-4 h-4 text-indigo-500" /></div>
                  <div className="font-bold text-sm tracking-tight">scenes</div>
                </div>
                <div className="space-y-1.5 font-mono text-[9px] opacity-70">
                  <div className="flex items-center gap-2 text-amber-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> id (PK)
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> project_id (FK)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" /> index (int)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" /> start_time
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" /> end_time
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" /> script (text)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" /> visual_type
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" /> status
                  </div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" /> director_notes (text)
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50" /> payload (jsonb)
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" /> final_video_url
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {/* Jobs Node */}
                <div className="w-64 p-4 bg-background/80 backdrop-blur-xl border-2 border-border rounded-xl shadow-2xl hover:border-emerald-500/50 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Zap className="w-4 h-4 text-emerald-500" /></div>
                    <div className="font-bold text-sm tracking-tight">jobs</div>
                  </div>
                  <div className="space-y-1.5 font-mono text-[9px] opacity-70">
                    <div className="flex items-center gap-2 text-amber-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> id (PK)
                    </div>
                    <div className="flex items-center gap-2 text-blue-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> scene_id (FK)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-border" /> provider
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-border" /> external_id
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-border" /> status
                    </div>
                    <div className="flex items-center gap-2 text-purple-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50" /> result (jsonb)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Table Documentation */}
        <section className="space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Technical Data Dictionary</h2>
            <p className="text-muted-foreground">Every column, type, and rule defined for the system engine.</p>
          </div>

          <div className="grid grid-cols-1 gap-16">
            {/* Table: Projects */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <TableIcon className="w-6 h-6 text-blue-500" />
                <h3 className="text-2xl font-bold font-mono lowercase tracking-tighter italic">Table: projects</h3>
                <Badge variant="secondary" className="text-[10px]">SUPABASE PK: UUID</Badge>
              </div>
              <div className="overflow-hidden bg-muted/10 border border-border rounded-xl p-4">
                {[
                  { name: "id", type: "UUID", desc: "Unique identifier for the project. Primary key.", isPk: true },
                  { name: "title", type: "TEXT", desc: "User-facing project name.", isNullable: false },
                  { name: "status", type: "ENUM", desc: "Process state: draft, processing, completed, failed." },
                  { name: "total_duration", type: "FLOAT", desc: "Total video runtime in seconds." },
                  { name: "master_audio_url", type: "TEXT", desc: "Cloudinary link to the 11Labs master voiceover.", isNullable: true },
                  { name: "metadata", type: "JSONB", desc: "Flexible config (aspect ratio, target platform)." },
                ].map((col, i) => <ColumnRow key={i} {...col} />)}
              </div>
            </div>

            {/* Table: Scenes */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <TableIcon className="w-6 h-6 text-indigo-500" />
                <h3 className="text-2xl font-bold font-mono lowercase tracking-tighter italic">Table: scenes</h3>
                <Badge variant="secondary" className="text-[10px]">CASCADE ON DELETE</Badge>
              </div>
              <div className="overflow-hidden bg-muted/10 border border-border rounded-xl p-4">
                {[
                  { name: "id", type: "UUID", desc: "Primary key.", isPk: true },
                  { name: "project_id", type: "UUID", desc: "Foreign key for project relationship.", isFk: true },
                  { name: "index", type: "INT", desc: "Chronological order weighting." },
                  { name: "start_time", type: "FLOAT", desc: "Timestamp offset in master audio." },
                   { name: "visual_type", type: "ENUM", desc: "Routing key: a-roll, b-roll, graphics, image." },
                   { name: "director_notes", type: "TEXT", desc: "Creative direction for agents." },
                   { name: "scene_type", type: "TEXT", desc: "Scene category (Intro, Demo, etc.)" },
                   { name: "asset_url", type: "TEXT", desc: "Raw asset URL from provider." },
                   { name: "final_video_url", type: "TEXT", desc: "Processed/Rendered asset URL." },
                   { name: "thumbnail_url", type: "TEXT", desc: "UI preview thumbnail link." },
                   { name: "payload", type: "JSONB", desc: "Advanced params (avatarId, searchQuery)." },
                 ].map((col, i) => <ColumnRow key={i} {...col} />)}
               </div>
             </div>
 
             {/* JSONB Payload Anatomy */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                   <Code2 className="w-5 h-5 text-emerald-500" />
                   <h4 className="text-sm font-bold uppercase tracking-widest">Payload Architecture</h4>
                 </div>
                 <Card className="bg-background border-border shadow-xl">
                   <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-mono flex items-center gap-2">
                       <FileJson className="w-4 h-4" />
                       scenes.payload
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                         <span>Visual Type</span>
                         <span>Key Structure</span>
                       </div>
                       <div className="p-3 bg-muted rounded border border-border/50 font-mono text-xs space-y-1">
                         <div className="text-blue-400 font-bold">"a-roll"</div>
                         <div className="opacity-70">{"{ avatarId, emotion, angle }"}</div>
                       </div>
                       <div className="p-3 bg-muted rounded border border-border/50 font-mono text-xs space-y-1 text-emerald-300">
                         <div className="text-amber-400 font-bold">"b-roll"</div>
                         <div className="opacity-70">{"{ searchQuery, speedFactor }"}</div>
                       </div>
                       <div className="p-3 bg-muted rounded border border-border/50 font-mono text-xs space-y-1">
                         <div className="text-purple-400 font-bold">"graphics"</div>
                         <div className="opacity-70">{"{ prompt, style, motionParams }"}</div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </div>
 
               <div className="space-y-6 flex items-center justify-center p-8">
                 <div className="text-center space-y-4">
                    <Shield className="w-12 h-12 text-indigo-500 mx-auto" />
                    <h3 className="text-lg font-bold">Unified Data Structure</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      We migrated to a flattened schema to reduce complexity and improve UI performance. All asset data is now directly attached to the scene.
                    </p>
                 </div>
               </div>
             </div>

            {/* Table: Jobs */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <TableIcon className="w-6 h-6 text-emerald-500" />
                <h3 className="text-2xl font-bold font-mono lowercase tracking-tighter italic">Table: jobs</h3>
                <Badge variant="secondary" className="text-[10px]">POLLING QUEUE</Badge>
              </div>
              <div className="overflow-hidden bg-muted/10 border border-border rounded-xl p-4">
                {[
                  { name: "id", type: "UUID", desc: "Job identifier.", isPk: true },
                  { name: "scene_id", type: "UUID", desc: "Related scene segment.", isFk: true },
                  { name: "provider", type: "TEXT", desc: "heygen, elevenlabs, etc." },
                  { name: "external_id", type: "TEXT", desc: "The ID from the provider API." },
                  { name: "status", type: "ENUM", desc: "pending, processing, done, failed." },
                  { name: "result", type: "JSONB", desc: "Full raw API response for debugging." },
                ].map((col, i) => <ColumnRow key={i} {...col} />)}
              </div>
            </div>
          </div>
        </section>

        {/* JSONB Deep Dive Section */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight italic">Technical Deep Dive: The magic of JSONB</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Why we use "JSON Binary" instead of standard columns for the orchestration layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border bg-muted/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  What is it?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>
                  <strong>JSONB</strong> (JSON Binary) is a PostgreSQL data type that stores semi-structured data in a decomposed binary format. 
                </p>
                <ul className="space-y-2 list-disc pl-4">
                  <li><strong>Fast Retrieval</strong>: Unlike standard JSON (which is stored as text), JSONB is parsed once and stored in a way that allows the database to "jump" to specific keys.</li>
                  <li><strong>GIST/GIN Indexing</strong>: You can create indexes on keys <em>inside</em> the JSON, making it search just as fast as a regular column.</li>
                  <li><strong>Logic Versatility</strong>: It allows us to store different data shapes (HeyGen params vs. Pexels params) in the same table without adding 50 null columns.</li>
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <span>Traditional vs. JSONB</span>
              </div>
              
              {/* Traditional View */}
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/[0.02] space-y-3">
                <div className="text-[10px] font-bold text-red-500 uppercase">Legacy Relational Approach</div>
                <div className="flex gap-2">
                  <div className="px-2 py-1 rounded bg-muted border border-border text-[9px] font-mono">col_avatar_id</div>
                  <div className="px-2 py-1 rounded bg-muted border border-border text-[9px] font-mono opacity-30">col_query (null)</div>
                  <div className="px-2 py-1 rounded bg-muted border border-border text-[9px] font-mono opacity-30">col_prompt (null)</div>
                </div>
                <p className="text-[10px] text-muted-foreground">Wasted space with infinite NULL columns for every edge case.</p>
              </div>

              {/* JSONB View */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                  <Zap className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-[10px] font-bold text-emerald-500 uppercase">Modern JSONB Approach</div>
                <div className="bg-black/40 p-3 rounded-lg border border-emerald-500/20 font-mono text-[10px] text-emerald-300">
                  <span className="text-emerald-500/50">{"{"}</span><br />
                  &nbsp;&nbsp;"type": <span className="text-white">"a-roll"</span>,<br />
                  &nbsp;&nbsp;"avatar_id": <span className="text-white">"host_01"</span><br />
                  <span className="text-emerald-500/50">{"}"}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Clean, expandable, and only stores what is actually needed.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Execution Logic */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight italic">Agent Perspective: The loop</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              How the stateless AI brain knows what to do next without maintaining an internal memory.
            </p>
          </div>

          <div className="relative p-8 bg-indigo-500/[0.03] border border-indigo-500/20 rounded-3xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {/* Step 1: The Query */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.2)]">1</div>
                  <h4 className="text-xs font-bold uppercase tracking-widest">The "Next" Query</h4>
                </div>
                <div className="p-4 bg-background border border-border rounded-xl font-mono text-[10px] space-y-2">
                  <div className="text-indigo-400">SELECT * FROM scenes</div>
                  <div className="text-muted-foreground">WHERE status = 'todo'</div>
                  <div className="text-muted-foreground">ORDER BY index ASC</div>
                  <div className="text-muted-foreground">LIMIT 1;</div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  The agent is <span className="text-indigo-400 font-bold uppercase italic">Stateless</span>. Every time it runs, it first asks the DB: "What is the first thing on my plate?"
                </p>
              </div>

              {/* Step 2: The Lock */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.2)]">2</div>
                  <h4 className="text-xs font-bold uppercase tracking-widest">The State Lock</h4>
                </div>
                <div className="p-4 bg-background border border-border rounded-xl font-mono text-[10px] space-y-2">
                  <div className="text-amber-400">UPDATE scenes</div>
                  <div className="text-muted-foreground">SET status = 'processing'</div>
                  <div className="text-muted-foreground">WHERE id = current_id;</div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  By immediately marking the scene as <span className="text-amber-400 font-bold uppercase italic">'processing'</span>, we prevent other agents (or accidental double-clicks) from picking up the same task.
                </p>
              </div>

              {/* Step 3: The Result */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.2)]">3</div>
                  <h4 className="text-xs font-bold uppercase tracking-widest">The Final Sync</h4>
                </div>
                <div className="p-4 bg-background border border-border rounded-xl font-mono text-[10px] space-y-4">
                  <div className="space-y-1">
                    <div className="text-[8px] text-muted-foreground uppercase opacity-50 italic">// Branch A: Autonomous Tool</div>
                    <div className="text-emerald-400">SET status = 'completed'</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[8px] text-muted-foreground uppercase opacity-50 italic">// Branch B: Manual Placeholder</div>
                    <div className="text-amber-400">SET status = 'awaiting_input'</div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  If the scene is B-Roll or A-Roll, the agent finishes it. If it's a <strong>Graphic/Image</strong>, the agent flags it as <span className="text-amber-400 font-bold uppercase">'awaiting_input'</span> and moves to the next <span className="text-indigo-400 font-bold">'todo'</span>.
                </p>
              </div>
            </div>

            {/* Error Resilience Note */}
            <div className="mt-12 pt-8 border-t border-indigo-500/10 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase">
                <Shield className="w-4 h-4" /> Crash Resistance
              </div>
              <p className="text-[10px] text-muted-foreground italic max-w-lg">
                If the server crashes mid-process, the database still shows <span className="text-amber-500">'processing'</span>. We can have a cleanup job that resets stale 'processing' tasks back to <span className="text-indigo-500">'todo'</span> after 10 minutes.
              </p>
            </div>
          </div>
        </section>

        {/* Closing: The System Contract */}
        <section className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-12 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <Shield className="w-16 h-16 text-indigo-500 mx-auto" />
            <h2 className="text-4xl font-extrabold tracking-tight italic uppercase">The Single Source of Truth.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              This schema creates a rigid contract between the autonomous agents and the playback engine. By offloading state to the persistent layer, we ensure **Zero Context Leaks** and **100% Session Resilience**.
            </p>
          </div>

          <div className="pt-8 relative z-10">
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-500 px-6 py-2 text-sm uppercase tracking-widest font-bold">
              Database Schema Verified & Locked
            </Badge>
          </div>
        </section>

        {/* Footer Navigation */}
        <footer className="pt-12 flex justify-between items-center text-sm text-muted-foreground">
          <Link href="/playground/system-workflow" className="hover:text-primary transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> System Workflow
          </Link>
          <p>© 2026 Autonomous Video Systems • v1.0.4-beta</p>
        </footer>
      </div>
    </div>
  );
}
