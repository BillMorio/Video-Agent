"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ChevronRight, 
  Terminal, 
  History, 
  Save, 
  Clock, 
  Zap, 
  Brain,
  MessageSquare,
  PanelLeft,
  Type,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavSidebar } from "@/components/panels/nav-sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const INITIAL_SCRIPT = `In a world where technology and nature coexist, a new architecture is emerging. Vertical forests are replacing concrete jungles, cooling our streets naturally and bringing biodiversity back to the heart of our urban centers. 

Solar skins on skyscrapers are turning every building into a power plant, while smart grids utilize AI to distribute energy where it is needed most. This is not just a dream of the future; it is the blueprint for our urban evolution.`;

export default function ScriptEditorPage() {
  const [script, setScript] = useState(INITIAL_SCRIPT);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    router.push("/playground/create/voice");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans relative selection:bg-primary/30">
      {/* Background Depth Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(var(--primary-rgb),0.015)_0%,_transparent_60%),radial-gradient(circle_at_70%_80%,_rgba(var(--primary-rgb),0.01)_0%,_transparent_60%)] pointer-events-none" />

      <NavSidebar
        activeItem="studio"
        isCollapsed={isSidebarCollapsed}
        onItemClick={() => {}}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Header - Unified with Orchestration page */}
        <header className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-8 z-50 glass-premium">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={cn(
                "p-2.5 rounded-xl border transition-all flex items-center justify-center hover:scale-105 active:scale-95 group",
                isSidebarCollapsed
                  ? "bg-primary text-primary-foreground border-primary shadow-glow shadow-primary/20"
                  : "bg-muted/40 border-border/60 text-foreground hover:bg-muted/60"
              )}
            >
              <PanelLeft className={cn("w-5 h-5 transition-transform", isSidebarCollapsed && "rotate-180")} />
            </button>

            <div className="w-px h-6 bg-border/40 mx-1" />

            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                <Type className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-foreground tracking-tight uppercase italic leading-none">The Manuscript</h1>
                <p className="text-[9px] technical-label text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic">Upstream Pipeline / Phase 02</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Progress Indicator */}
             <div className="hidden md:flex items-center gap-3 mr-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Scripting</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Vocal</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Forge</span>
             </div>
             
             <ThemeToggle />
             <Button 
               onClick={handleNext}
               className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]"
             >
                Approve & Next
             </Button>
          </div>
        </header>

        <main className="flex-1 flex pt-24 overflow-hidden">
           {/* Editor Panel - Taking inspiration from the main workspace */}
           <div className="flex-1 flex flex-col p-8 overflow-y-auto scrollbar-hide">
              <div className="max-w-4xl w-full mx-auto space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <h3 className="text-[10px] technical-label font-black uppercase tracking-[0.2em] text-primary italic">Narrative_Editor</h3>
                       <p className="text-xs font-bold text-foreground/60">Professional drafting interface for cinematic narration.</p>
                    </div>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 text-[9px] technical-label italic px-3 py-1">
                       <History className="w-3 h-3 mr-1.5" />
                       AUTOSAVE_ACTIVE
                    </Badge>
                 </div>

                 <Card className="border-border/40 bg-card/30 backdrop-blur-sm shadow-2xl overflow-hidden">
                    <div className="p-8">
                       <Textarea
                         value={script}
                         onChange={(e) => setScript(e.target.value)}
                         className="w-full min-h-[500px] bg-transparent border-none focus-visible:ring-0 text-lg font-medium leading-[2] text-foreground/90 placeholder:text-muted-foreground/10 resize-none scrollbar-hide"
                         spellCheck={false}
                       />
                    </div>
                 </Card>
              </div>
           </div>

           {/* Directorial Sidebar - Styled after SettingsPanel */}
           <aside className="w-[420px] border-l border-border/40 bg-card/20 backdrop-blur-3xl overflow-y-auto p-8 space-y-8 scrollbar-hide">
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] technical-label font-black uppercase tracking-[0.2em] text-muted-foreground italic">Temporal_Analytics</span>
                       <span className="text-xs font-bold text-foreground/80">Estimated Pacing</span>
                    </div>
                 </div>

                 <Card className="border-border/40 bg-muted/5 shadow-xl">
                    <CardContent className="p-6 space-y-5">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] technical-label font-black uppercase tracking-widest text-muted-foreground/40">MASTER_DURATION</span>
                          <span className="text-4xl font-black italic text-foreground tracking-tighter">42.8<span className="text-sm opacity-30 ml-1">S</span></span>
                       </div>
                       <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
                          <div className="h-full w-[68%] bg-primary shadow-glow shadow-primary/40"></div>
                       </div>
                       <div className="flex justify-between text-[9px] technical-label font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                          <span>THRESHOLD: 40S</span>
                          <span>SIGNAL: OPTIMAL</span>
                       </div>
                    </CardContent>
                 </Card>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Brain className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] technical-label font-black uppercase tracking-[0.2em] text-muted-foreground italic">Director_Intelligence</span>
                       <span className="text-xs font-bold text-foreground/80">Lumina AI Suggestions</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="p-5 bg-purple-500/5 border border-purple-500/20 rounded-2xl flex gap-4">
                       <Zap className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                       <p className="text-[11px] font-medium text-muted-foreground leading-relaxed uppercase tracking-tight">
                          The opening hook has high engagement potential. Consider a <span className="text-purple-400 font-black italic">2-second pause</span> after the first paragraph to let the concept breathe.
                       </p>
                    </div>
                    
                    <div className="p-5 bg-muted/20 border border-border/40 rounded-2xl flex gap-4 backdrop-blur-sm">
                       <MessageSquare className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                       <div className="space-y-2">
                          <p className="text-[10px] technical-label font-black uppercase text-foreground/40 tracking-widest">TONE_DETECTION</p>
                          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed uppercase tracking-tight">
                             Active Tone: <span className="text-foreground/80 font-black">Cinematic-Education</span>. Detected narrative flow is <span className="text-foreground/80 font-black">8.4/10</span>.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-8">
                 <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
                    <div className="relative space-y-3">
                       <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-primary" />
                          <h4 className="text-[10px] technical-label font-black uppercase tracking-widest text-primary italic">Ready_for_Synthesis</h4>
                       </div>
                       <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-tight">
                          Proceed to Step 3. All narrative vectors have been validated against the factory default production schema.
                       </p>
                    </div>
                 </div>
              </div>
           </aside>
        </main>

        {/* Footer Meta */}
        <footer className="h-16 flex items-center justify-between px-8 bg-card/40 backdrop-blur-md border-t border-border/40 z-50">
           <div className="flex items-center gap-8 text-muted-foreground/30 font-bold">
              <div className="flex items-center gap-2.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-border" />
                 <span className="text-[9px] technical-label uppercase tracking-[0.2em] font-black">BUFFER: MANUSCRIPT_V3</span>
              </div>
              <div className="flex items-center gap-2.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-border" />
                 <span className="text-[9px] technical-label uppercase tracking-[0.2em] font-black">PROTOCOL: L-SCHEMA_01</span>
              </div>
           </div>
           <div className="flex items-center gap-4 text-muted-foreground/20">
              <span className="text-[9px] technical-label font-black uppercase tracking-[0.2em]">UTF-8 / CINEMATIC_NARRATION</span>
           </div>
        </footer>
      </div>
    </div>
  );
}
