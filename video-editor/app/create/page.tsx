"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Terminal, 
  ChevronRight, 
  Loader2, 
  Plus, 
  Brain, 
  Zap, 
  Clock, 
  Globe,
  Settings2,
  PanelLeft,
  LayoutGrid,
  UploadCloud,
  Mic2,
  FileAudio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavSidebar } from "@/components/panels/nav-sidebar";
import { CreationFlowBreadcrumbs } from "@/components/creation/creation-breadcrumbs";
import { uploadToCloudinary } from "@/lib/storage";
import { cn } from "@/lib/utils";

export default function CreativeSparkPage() {
  const [prompt, setPrompt] = useState("");
  const [creationMode, setCreationMode] = useState<"prompt" | "audio">("prompt");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const addLog = (msg: string, type: string = "system") => {
    setLogs((prev) => [...prev.slice(-5), { msg, type }]);
  };

  const handleStart = async () => {
    if (creationMode === "prompt" && !prompt.trim()) return;
    if (creationMode === "audio" && !audioFile) return;
    
    setIsInitializing(true);
    addLog(`System: Initializing Creative Spark Engine (${creationMode === "prompt" ? "Text" : "Audio"})...`, "system");
    
    try {
      let masterAudioUrl = "";
      
      if (creationMode === "audio" && audioFile) {
        addLog("Storage: Syncing acoustic asset to production cloud (Cloudinary)...", "ai");
        masterAudioUrl = await uploadToCloudinary(audioFile);
        addLog("Signal: Asset synchronized successfully.", "system");
      }

      // Initialize Project in Database
      const initResponse = await fetch("/api/projects/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: creationMode === "prompt" ? (prompt.slice(0, 30) + (prompt.length > 30 ? "..." : "")) : audioFile?.name,
          masterAudioUrl,
          metadata: { 
            creation_mode: creationMode,
            prompt: creationMode === "prompt" ? prompt : undefined,
            master_audio_url: masterAudioUrl // Also keep in metadata for safety
          }
        }),
      });
      
      const { projectId, error } = await initResponse.json();
      if (error) throw new Error(error);

      if (creationMode === "audio" && audioFile) {
        localStorage.setItem(`project_${projectId}_audio_url`, masterAudioUrl);
        
        await new Promise(r => setTimeout(r, 800));
        addLog("Acoustic: Analyzing vocal frequencies...", "ai");
        
        await new Promise(r => setTimeout(r, 600));
        addLog(`Signal: Creative buffer synchronized for ${projectId.slice(0,8)}`, "system");
        
        await new Promise(r => setTimeout(r, 1000));
        router.push(`/create/${projectId}/storyboard`);
      } else {
        await new Promise(r => setTimeout(r, 800));
        addLog("Neural: Propagating ideation vectors...", "ai");
        
        await new Promise(r => setTimeout(r, 600));
        addLog(`Signal: Creative buffer synchronized for ${projectId.slice(0,8)}`, "system");
        
        await new Promise(r => setTimeout(r, 1000));
        router.push(`/create/${projectId}/script`);
      }
    } catch (err: any) {
      addLog(`Error: ${err.message}`, "system");
      setIsInitializing(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans relative selection:bg-primary/30">
      {/* Background Depth Layer - Minimalist soft glow from Orchestration page */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(var(--primary-rgb),0.015)_0%,_transparent_60%),radial-gradient(circle_at_70%_80%,_rgba(var(--primary-rgb),0.01)_0%,_transparent_60%)] pointer-events-none" />

      <NavSidebar
        activeItem="studio"
        isCollapsed={isSidebarCollapsed}
        onItemClick={() => {}}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Header - Strictly following Orchestration page structure */}
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
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <PanelLeft className={cn("w-5 h-5 transition-transform", isSidebarCollapsed && "rotate-180")} />
            </button>

            <div className="w-px h-6 bg-border/40 mx-1" />

            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-foreground tracking-tight uppercase italic leading-none">Creative Spark</h1>
                <p className="text-[9px] technical-label text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic">Upstream Pipeline / Phase 01</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CreationFlowBreadcrumbs activeStep="SPARK" className="mr-8" />
            <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-xl border border-border/40">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 py-20 relative overflow-y-auto scrollbar-hide">
          <div className="max-w-2xl w-full space-y-12 text-center mt-20">
            
            <div className="space-y-4">
               <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none text-foreground">
                  Start Your <br /><span className="text-primary tracking-widest not-italic">Production</span>
               </h2>
               <p className="text-muted-foreground text-sm font-medium tracking-wide max-w-md mx-auto opacity-60">
                  Ignite your cinematic narrative with a prompt or voice over. Our agents will handle the rest.
               </p>
            </div>

            <div className="relative group">
              {/* Refined shadow glow like SceneCards */}
              <div className="absolute -inset-1 bg-primary/5 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
              <div className="relative bg-card/60 border border-border/50 rounded-[2.5rem] p-0 backdrop-blur-md shadow-2xl overflow-hidden">
                  
                  {/* Mode Switcher */}
                  <div className="flex border-b border-border/20">
                    <button 
                      onClick={() => setCreationMode("prompt")}
                      className={cn(
                        "flex-1 py-4 flex items-center justify-center gap-2 transition-all duration-300",
                        creationMode === "prompt" ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground/40 hover:text-muted-foreground/60"
                      )}
                    >
                      <Brain className="w-4 h-4" />
                      <span className="text-[10px] technical-label uppercase tracking-widest font-black">Prompt_Engine</span>
                    </button>
                    <button 
                      onClick={() => setCreationMode("audio")}
                      className={cn(
                        "flex-1 py-4 flex items-center justify-center gap-2 transition-all duration-300",
                        creationMode === "audio" ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground/40 hover:text-muted-foreground/60"
                      )}
                    >
                      <Mic2 className="w-4 h-4" />
                      <span className="text-[10px] technical-label uppercase tracking-widest font-black">Audio_Upload</span>
                    </button>
                  </div>

                  <div className="p-10">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-primary shadow-glow shadow-primary/40 animate-pulse" />
                          <span className="text-[10px] technical-label uppercase tracking-[0.3em] text-muted-foreground font-black italic">
                            {creationMode === "prompt" ? "Input_Buffer_Ready" : "Media_Uploader_Ready"}
                          </span>
                       </div>
                       {creationMode === "prompt" ? (
                         <Brain className="w-4 h-4 text-primary/30" />
                       ) : (
                         <FileAudio className="w-4 h-4 text-primary/30" />
                       )}
                    </div>

                    {creationMode === "prompt" ? (
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your video topic here..."
                        className="w-full h-32 bg-transparent border-none focus:ring-0 text-xl font-medium text-foreground placeholder:text-muted-foreground/20 resize-none scrollbar-hide leading-relaxed"
                      />
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-border/20 rounded-2xl hover:border-primary/40 transition-colors cursor-pointer group/upload"
                      >
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                          accept="audio/*"
                          className="hidden"
                        />
                        {audioFile ? (
                          <div className="flex items-center gap-3">
                            <FileAudio className="w-8 h-8 text-primary" />
                            <div className="text-left">
                              <p className="text-sm font-bold text-foreground">{audioFile.name}</p>
                              <p className="text-[10px] technical-label text-muted-foreground uppercase">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-4 h-8 px-2 text-muted-foreground hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); setAudioFile(null); }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 text-muted-foreground/20 group-hover/upload:text-primary/40 transition-colors mb-2" />
                            <p className="text-sm font-bold text-muted-foreground/40 group-hover/upload:text-muted-foreground/60 transition-colors">Drag and drop or click to upload audio</p>
                            <p className="text-[9px] technical-label text-muted-foreground/20 uppercase tracking-widest mt-1">MP3, WAV, M4A up to 50MB</p>
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-8 border-t border-border/20 mt-2">
                       <span className="text-[8px] technical-label text-muted-foreground/30 uppercase tracking-[0.2em] font-black mr-2">Production_Mode:</span>
                       <Badge variant="outline" className="rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all cursor-pointer text-[9px] font-black uppercase tracking-widest px-3 py-1">Cinematic</Badge>
                       <Badge variant="outline" className="rounded-lg border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/40 transition-all cursor-pointer text-[9px] font-black uppercase tracking-widest px-3 py-1">Educational</Badge>
                       <Badge variant="outline" className="rounded-lg border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/40 transition-all cursor-pointer text-[9px] font-black uppercase tracking-widest px-3 py-1">Technical</Badge>
                    </div>
                  </div>
              </div>
            </div>

            <Button 
              disabled={(creationMode === "prompt" && !prompt.trim()) || (creationMode === "audio" && !audioFile) || isInitializing}
              onClick={handleStart}
              className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-sm shadow-glow shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30"
            >
              {isInitializing ? (
                 <div className="flex items-center gap-3">
                   <Loader2 className="w-5 h-5 animate-spin" />
                   <span>Initializing Narrative...</span>
                 </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>Kickstart Production</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </Button>

            {/* Neural Trace Logs - Styled after Studio logs */}
            <div className={cn(
              "max-w-md mx-auto w-full transition-all duration-1000",
              isInitializing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}>
              <div className="bg-card/40 border border-border/30 rounded-2xl p-6 text-left shadow-inner relative overflow-hidden backdrop-blur-sm">
                 <div className="flex items-center gap-2.5 mb-4 opacity-40">
                    <Terminal className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] technical-label uppercase tracking-[0.2em] font-black">Neural_Trace_Log</span>
                 </div>
                 <div className="space-y-2">
                    {logs.map((log, i) => (
                      <div key={i} className="flex items-center gap-3 text-[10px] animate-in slide-in-from-bottom-1 duration-500">
                         <ChevronRight className={cn(
                           "w-3 h-3 transition-colors",
                           log.type === 'ai' ? "text-primary/60" : "text-muted-foreground/30"
                         )} />
                         <span className={cn(
                           "uppercase tracking-tight technical-label font-bold",
                           i === logs.length - 1 ? "text-foreground" : "text-muted-foreground/40",
                           log.type === 'ai' && "text-primary/70"
                         )}>
                           {log.msg}
                         </span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

          </div>
        </main>

        {/* Footer - Consistent with Orchestration aesthetics */}
        <footer className="h-16 flex items-center justify-between px-8 bg-card/40 backdrop-blur-md border-t border-border/40 z-50">
           <div className="flex items-center gap-8 text-muted-foreground/40 font-bold">
              <div className="flex items-center gap-2.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                 <span className="text-[9px] technical-label uppercase tracking-[0.2em] font-black">System_Lina_v3</span>
              </div>
              <div className="h-4 w-px bg-border/20" />
              <div className="flex items-center gap-2.5">
                 <span className="text-[9px] technical-label uppercase tracking-[0.2em] font-black">Latency: 8ms</span>
              </div>
           </div>
           <div className="flex items-center gap-4 opacity-30">
               <Badge variant="outline" className="h-6 border-border/40 text-[8px] font-black uppercase tracking-widest">Master Node: Alpha_7</Badge>
           </div>
        </footer>
      </div>
    </div>
  );
}
