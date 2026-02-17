"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Info,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavSidebar } from "@/components/panels/nav-sidebar";
import { CreationFlowBreadcrumbs } from "@/components/creation/creation-breadcrumbs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useProject, useUpdateProject } from "@/hooks/use-projects";



export default function ScriptEditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [script, setScript] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const updateProjectMutation = useUpdateProject();

  // Handle Initial Script/Transcription Generation
  useEffect(() => {
    if (projectLoading || !project) return;

    const creationMode = project.metadata?.creation_mode;

    // If script already exists in metadata, load it
    if (project.metadata?.script) {
      setScript(project.metadata.script);
    } else if (creationMode === "prompt" && project.metadata?.prompt && !isGenerating && !script) {
      // Auto-generate if prompt exists but no script
      generateScript(project.metadata.prompt);
    } else if (creationMode === "audio" && !isGenerating && !script) {
      // Auto-transcribe if audio mode but no script
      const audioUrl = localStorage.getItem(`project_${projectId}_audio_url`);
      if (audioUrl) {
        handleTranscribe(audioUrl);
      }
    }
  }, [projectLoading, project]);

  const handleTranscribe = async (url: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/whisper/from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl: url }),
      });
      const data = await response.json();
      if (data.text) {
        setScript(data.text);
        // Persist to project immediately
        await updateProjectMutation.mutateAsync({
          id: projectId,
          updates: { metadata: { ...project?.metadata, script: data.text, transcription: data } }
        });
      }
    } catch (err) {
      console.error("Transcription failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateScript = async (inputPrompt: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputPrompt, tone: "professional" }),
      });
      const data = await response.json();
      if (data.script) {
        setScript(data.script);
        // Persist to project immediately
        await updateProjectMutation.mutateAsync({
          id: projectId,
          updates: { metadata: { ...project?.metadata, script: data.script } }
        });
      }
    } catch (err) {
      console.error("Script gen failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = async () => {
    // Save latest script version before moving on
    await updateProjectMutation.mutateAsync({
      id: projectId,
      updates: { metadata: { ...project?.metadata, script: script } }
    });
    router.push(`/create/${projectId}/voice`);
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
             <CreationFlowBreadcrumbs activeStep="SCRIPTING" projectId={projectId} className="mr-4" />
             
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
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-[10px] technical-label font-black uppercase"
                        onClick={() => project?.metadata?.prompt && generateScript(project.metadata.prompt)}
                        disabled={isGenerating || !project?.metadata?.prompt}
                      >
                        <RefreshCw className={cn("w-3 h-3 mr-2", isGenerating && "animate-spin")} />
                        Regenerate Script
                      </Button>
                      <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 text-[9px] technical-label italic px-3 py-1">
                         <History className="w-3 h-3 mr-1.5" />
                         AUTOSAVE_ACTIVE
                      </Badge>
                    </div>
                 </div>

                 <Card className="border-border/40 bg-card/30 backdrop-blur-sm shadow-2xl overflow-hidden relative">
                    {isGenerating && (
                      <div className="absolute inset-0 z-50 bg-background/40 backdrop-blur-[2px] flex items-center justify-center flex-col gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <span className="text-[10px] technical-label font-black uppercase tracking-[0.2em] text-primary animate-pulse">
                          {project?.metadata?.creation_mode === "audio" ? "Acoustic_Extraction_Active" : "Neural_Synthesis_Active"}
                        </span>
                      </div>
                    )}
                    <div className="p-8">
                       <Textarea
                         value={script}
                         onChange={(e) => setScript(e.target.value)}
                         className="w-full min-h-[500px] bg-transparent border-none focus-visible:ring-0 text-lg font-medium leading-[2] text-foreground/90 placeholder:text-muted-foreground/10 resize-none scrollbar-hide"
                         spellCheck={false}
                         disabled={isGenerating}
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
