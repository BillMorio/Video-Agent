"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, 
  Terminal, 
  Zap, 
  Brain,
  Loader2,
  CheckCircle2,
  Cpu,
  Activity,
  Waves,
  Sparkles,
  PanelLeft,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavSidebar } from "@/components/panels/nav-sidebar";
import { cn } from "@/lib/utils";

const LOG_MESSAGES = [
  { msg: "SIGNAL_LOCKED: ELEVENLABS_V2_PCM_STREAM", delay: 800 },
  { msg: "EXTRACTING_LEXICAL_TEMPORAL_OFFSETS...", delay: 1500 },
  { msg: "WHISPER_TRANSCRIPTION_V3: 84% ACCURACY", delay: 2200 },
  { msg: "CLAUDE: INITIATING_SILENCE_SNAP_PROTOCOL", delay: 3000 },
  { msg: "MAPPING_SCENE_BOUNDARIES: 1:1_PRECISION", delay: 3800 },
  { msg: "STORYBOARD_SCHEMA_HYDRATED: 15_NODES", delay: 4500 },
  { msg: "NEURAL_LINK_STABLE: READY_FOR_STUDIO", delay: 5200 },
];

export default function NeuralForgePage() {
  const [progress, setProgress] = useState(0);
  const [activeLogs, setActiveLogs] = useState<{ msg: string; time: string }[]>([]);
  const [status, setStatus] = useState("Initializing_Forge");
  const [isComplete, setIsComplete] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Progress Animation
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsComplete(true);
          return 100;
        }
        return prev + 1;
      });
    }, 60);

    // Logs Animation
    LOG_MESSAGES.forEach((log) => {
      setTimeout(() => {
        const time = new Array(3).fill(0).map(() => Math.floor(Math.random() * 99).toString().padStart(2, '0')).join(':');
        setActiveLogs((prev) => [...prev.slice(-4), { msg: log.msg, time }]);
        if (log.msg.includes("READY")) setStatus("Synthesis_Finalized");
        else if (log.msg.includes("CLAUDE")) setStatus("Segmenting_Scenes");
        else if (log.msg.includes("WHISPER")) setStatus("Transcribing_Acoustics");
      }, log.delay);
    });

    return () => clearInterval(timer);
  }, []);

  const handleEnterStudio = () => {
    router.push("/playground/dashboard");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans relative selection:bg-primary/30">
      {/* Background Cinematic Accents - Strictly mirroring Studio depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(var(--primary-rgb),0.015)_0%,_transparent_60%),radial-gradient(circle_at_70%_80%,_rgba(var(--primary-rgb),0.01)_0%,_transparent_60%)] pointer-events-none" />

      <NavSidebar
        activeItem="studio"
        isCollapsed={isSidebarCollapsed}
        onItemClick={() => {}}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Header - Strictly following Studio layout */}
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
                <Cpu className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-foreground tracking-tight uppercase italic leading-none">The Neural Forge</h1>
                <p className="text-[9px] technical-label text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic">Upstream Pipeline / Phase 04</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Progress Indicator */}
             <div className="hidden md:flex items-center gap-3 mr-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Scripting</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Vocal</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Forge</span>
             </div>
             <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 py-20 relative overflow-y-auto scrollbar-hide">
          <div className="max-w-xl w-full text-center space-y-20 mt-10">
            
            {/* Status Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                   <Badge variant="outline" className="border-border/40 text-muted-foreground/40 text-[8px] technical-label font-black uppercase tracking-[0.3em] px-3 py-1">Autonomous_Synthesis_Cycle</Badge>
                   <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow shadow-primary/40 animate-pulse" />
                </div>
                <h2 className="text-4xl font-black tracking-[0.3em] uppercase italic leading-none text-foreground">
                   The <span className="text-primary not-italic">Forge</span>
                </h2>
            </div>

            {/* Synthesis Core - Refined for Studio Aesthetic */}
            <div className="relative group">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-primary/10 rounded-full animate-spin-slow" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-border/20 rounded-full animate-reverse-spin opacity-20" />
               
               <div className="relative w-36 h-36 bg-card/60 border border-primary/30 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl backdrop-blur-xl group-hover:scale-105 transition-transform duration-1000">
                  <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                  {isComplete ? (
                     <CheckCircle2 className="w-14 h-14 text-primary animate-in zoom-in-50 duration-700 shadow-glow" />
                  ) : (
                     <div className="relative">
                        <Cpu className="w-12 h-12 text-primary animate-pulse" />
                     </div>
                  )}
               </div>
            </div>

            {/* Progress & Logs - Strictly mirroring Production logs */}
            <div className="space-y-10">
               <div className="space-y-4">
                  <div className="flex justify-between items-end px-3">
                     <span className="text-[10px] technical-label font-black uppercase tracking-[0.4em] text-primary italic transition-all duration-500">{status}</span>
                     <span className="text-[11px] technical-label font-black text-muted-foreground/40">{progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-primary transition-all duration-300 ease-out shadow-glow shadow-primary/40" 
                       style={{ width: `${progress}%` }}
                     />
                  </div>
               </div>

               <Card className="bg-card/30 border-border/40 rounded-[2rem] p-8 text-left shadow-2xl relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                     <Brain className="w-24 h-24 text-primary" />
                  </div>
                  <div className="flex items-center gap-2.5 mb-6 opacity-30">
                    <Terminal className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] technical-label uppercase tracking-[0.2em] font-black">Lumina_Orchestration_Core</span>
                  </div>
                  <div className="space-y-3 min-h-[120px]">
                     {activeLogs.map((log, i) => (
                       <div key={i} className="flex items-center gap-4 text-[10px] animate-in slide-in-from-bottom-1 duration-500">
                          <span className="text-muted-foreground/30 technical-label">[{log.time}]</span>
                          <span className={cn(
                            "technical-label uppercase tracking-tight font-bold",
                            i === activeLogs.length - 1 ? "text-primary" : "text-muted-foreground/50",
                            log.msg.includes("READY") && "text-emerald-500"
                          )}>
                            {log.msg}
                          </span>
                       </div>
                     ))}
                  </div>
               </Card>
            </div>

            <div className={cn(
              "transition-all duration-1000 delay-500",
              isComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
            )}>
              <Button 
                onClick={handleEnterStudio}
                className="h-16 px-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-[0.2em] text-sm shadow-glow shadow-primary/20 group transition-all hover:scale-105 active:scale-95"
              >
                <span>Enter Design Studio</span>
                <ChevronRight className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

          </div>
        </main>

        <footer className="h-16 flex items-center justify-between px-8 bg-card/40 backdrop-blur-md border-t border-border/40 z-50">
           <div className="flex items-center gap-8 text-muted-foreground/30 font-bold">
              <div className="flex items-center gap-2.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                 <span className="text-[9px] technical-label uppercase tracking-[0.2em] font-black">NEURAL_LINK_SYNCHRONIZED</span>
              </div>
           </div>
           <div className="flex items-center gap-4 text-muted-foreground/20">
              <span className="text-[9px] technical-label font-black uppercase tracking-[0.2em]">Cluster: PROD_X1</span>
           </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes reverse-spin {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-reverse-spin {
          animation: reverse-spin 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
