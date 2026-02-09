"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Sparkles, Terminal, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hydrationService } from "@/lib/services/api/hydration-service";
import { ThemeToggle } from "@/components/theme-toggle";

export default function StartProjectPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-4), msg]);
  };

  const handleStart = async () => {
    setIsSeeding(true);
    addLog("Initializing Project Factory...");
    
    try {
      addLog("Seeding 15-scene production nodes...");
      // Simulate technical delay for aesthetic
      await new Promise(r => setTimeout(r, 800));
      
      const project = await hydrationService.seedProject("AI Cities: 2050 Masterclass");
      
      addLog("Injecting agent memory buffers...");
      await new Promise(r => setTimeout(r, 600));
      
      addLog("Relational mapping complete.");
      addLog(`Redirecting to Studio: ${project.id.slice(0, 8)}...`);
      
      await new Promise(r => setTimeout(r, 500));
      router.push(`/playground/orchestration/${project.id}`);
    } catch (error: any) {
      console.log("--- HYDRATION FAILURE DETECTED ---");
      console.error("Direct Error Object:", error);
      if (error instanceof Error) {
        console.error("Stack Trace:", error.stack);
      }
      addLog(`CRITICAL ERROR: ${error.message || "Check console for DB logs."}`);
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8 text-center relative">
        <div className="space-y-4">
          <Badge variant="outline" className="px-3 py-1 text-[10px] tracking-[0.2em] font-bold uppercase border-primary/30 bg-primary/5 text-primary">
            Project Launcher v1.0
          </Badge>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent italic leading-tight">
            START YOUR <br />PRODUCTION
          </h1>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-[300px] mx-auto opacity-70">
            Initialize a new agentic workspace with a 15-scene production seed.
          </p>
        </div>

        <div className="relative group">
          <Button 
            size="lg" 
            onClick={handleStart}
            disabled={isSeeding}
            className="w-full h-16 rounded-2xl text-lg font-bold transition-all duration-500 group-hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden bg-primary text-primary-foreground shadow-2xl shadow-primary/20"
          >
            {isSeeding ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="animate-pulse">Initializing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Create New Project</span>
                <Sparkles className="w-4 h-4 ml-2 opacity-50" />
              </div>
            )}
          </Button>

          {/* Technical Logs */}
          <div className={`mt-8 transition-all duration-700 ${isSeeding ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-left font-mono backdrop-blur-sm shadow-inner overflow-hidden">
              <div className="flex items-center gap-2 mb-3 opacity-40">
                <Terminal className="w-3 h-3" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Launcher Logs</span>
              </div>
              <div className="space-y-1.5">
                {logs.map((log, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <ChevronRight className="w-3 h-3 text-primary opacity-50" />
                    <span className={i === logs.length - 1 ? "text-foreground font-bold" : "text-muted-foreground opacity-60"}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 pt-12">
            <div className="flex items-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default scale-90">
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-bold uppercase tracking-widest mb-2">Engines</span>
                    <div className="flex gap-4">
                        <Badge variant="outline" className="rounded-md h-5 px-1.5 text-[8px] font-bold border-white/10 uppercase">HeyGen</Badge>
                        <Badge variant="outline" className="rounded-md h-5 px-1.5 text-[8px] font-bold border-white/10 uppercase">Pexels</Badge>
                        <Badge variant="outline" className="rounded-md h-5 px-1.5 text-[8px] font-bold border-white/10 uppercase">ElevenLabs</Badge>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
