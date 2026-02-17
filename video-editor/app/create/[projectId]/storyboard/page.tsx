"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
  LayoutGrid,
  FileText,
  Clock,
  Languages,
  Mic2,
  Save,
  Code,
  X,
  Play,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavSidebar } from "@/components/panels/nav-sidebar";
import { CreationFlowBreadcrumbs } from "@/components/creation/creation-breadcrumbs";
import { CompactSceneCard } from "@/components/scenes/compact-scene-card";
import { SceneModal } from "@/components/modals/scene-modal";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useProject, useUpdateProject } from "@/hooks/use-projects";

type SynthesisPhase = "IDLE" | "TRANSCRIBING" | "REVIEW_TRANSCRIPT" | "GENERATING_SCENES" | "REVIEW_STORYBOARD";
type ActiveTab = "transcript" | "storyboard";

const VISUAL_OPTIONS = [
  { id: "a-roll", label: "A ROLL" },
  { id: "b-roll", label: "B ROLL" },
  { id: "graphics", label: "GRAPHICS" },
  { id: "image", label: "IMAGE" }
];

export default function DraftStoryboardPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [phase, setPhase] = useState<SynthesisPhase>("IDLE");
  const [activeTab, setActiveTab] = useState<ActiveTab>("transcript");
  const [transcription, setTranscription] = useState<any>(null);
  const [storyboard, setStoryboard] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);
  const [projectTitle, setProjectTitle] = useState("Untitled Project");
  const [allowedVisualTypes, setAllowedVisualTypes] = useState<string[]>(["a-roll", "b-roll", "graphics", "image"]);
  
  const router = useRouter();

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const updateProjectMutation = useUpdateProject();

  useEffect(() => {
    if (projectLoading || !project) return;

    const creationMode = project.metadata?.creation_mode;
    const projectAudio = project.master_audio_url || localStorage.getItem(`project_${projectId}_audio_url`);
    const savedAudio = projectAudio || localStorage.getItem("latest_vocal_audio_url") || localStorage.getItem("latest_whisper_audio_url");
    
    if (creationMode === "prompt") {
      // Prompt flow: Skip transcription, go straight to synthesis if script exists
      if (project.metadata?.script) {
        if (!storyboard && phase === "IDLE") {
          handleGenerateStoryboard(project.metadata.script);
        }
      } else {
        setStatus("Awaiting_Script_Buffer");
      }
    } else {
      // Audio flow: Use transcription logic
      if (savedAudio) {
        setAudioUrl(savedAudio);
        if (phase === "IDLE") {
          handleTranscribe(savedAudio);
        }
      } else {
        setStatus("Awaiting_Acoustic_Signal");
      }
    }
  }, [projectId, projectLoading, project]);

  const handleGenerateStoryboard = async (scriptText: string) => {
    setPhase("GENERATING_SCENES");
    setIsProcessing(true);
    setStatus("Deconstructing_Narrative_Logic");
    setError(null);

    try {
      const response = await fetch("/api/ai/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          script: scriptText,
          allowedVisualTypes
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Storyboard synthesis failed");

      setStoryboard(data);
      setProjectTitle(data.project?.title || "My Production");
      setPhase("REVIEW_STORYBOARD");
      setActiveTab("storyboard");
      setStatus("Storyboard_Synthesized");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPhase("IDLE");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranscribe = async (url: string) => {
    setPhase("TRANSCRIBING");
    setIsProcessing(true);
    setStatus("Extracting_Lexical_Offsets");
    setError(null);

    try {
      setStatus("Aligning_Temporal_Markers");
      
      const response = await fetch("/api/ai/whisper/from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl: url }),
      });

      if (!response.ok) {
        const saved = localStorage.getItem("latest_whisper_transcription");
        if (saved) {
          setTranscription(JSON.parse(saved));
          setPhase("REVIEW_TRANSCRIPT");
        } else {
          throw new Error("Acoustic extraction failed");
        }
      } else {
        const data = await response.json();
        setTranscription(data);
        localStorage.setItem("latest_whisper_transcription", JSON.stringify(data));
        setPhase("REVIEW_TRANSCRIPT");
      }
      
      setStatus("Transcription_Finalized");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPhase("IDLE");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateScenes = async () => {
    if (project?.metadata?.creation_mode === "prompt" && project?.metadata?.script) {
      return handleGenerateStoryboard(project.metadata.script);
    }

    if (!transcription) return;
    
    setPhase("GENERATING_SCENES");
    setIsProcessing(true);
    setStatus("Deconstructing_Narrative_Logic");
    setError(null);

    try {
      const response = await fetch("/api/ai/whisper/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transcription,
          allowedVisualTypes
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Storyboard synthesis failed");

      setStoryboard(data);
      setProjectTitle(data.project?.title || "My Production");
      setPhase("REVIEW_STORYBOARD");
      setActiveTab("storyboard");
      setStatus("Storyboard_Synthesized");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPhase("REVIEW_TRANSCRIPT");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnterStudio = async () => {
    if (!storyboard) return;
    
    setIsProcessing(true);
    setStatus("Orchestrating_Studio_Resources");

    try {
      const response = await fetch("/api/projects/create-from-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          projectTitle,
          storyboardData: storyboard,
          masterAudioUrl: audioUrl
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Finalization failed");

      router.push(`/projects/${data.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVisualType = (id: string) => {
    setAllowedVisualTypes(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans relative selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(var(--primary-rgb),0.015)_0%,_transparent_60%),radial-gradient(circle_at_70%_80%,_rgba(var(--primary-rgb),0.01)_0%,_transparent_60%)] pointer-events-none" />

      <NavSidebar
        activeItem="studio"
        isCollapsed={isSidebarCollapsed}
        onItemClick={() => {}}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
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
                <LayoutGrid className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-foreground tracking-tight uppercase italic leading-none">Draft Storyboard</h1>
                <p className="text-[9px] technical-label text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic">Upstream Pipeline / Phase 04</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <CreationFlowBreadcrumbs activeStep="STORYBOARD" projectId={projectId} className="mr-8" />
             <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex flex-col p-8 pt-28 relative overflow-y-auto scrollbar-hide">
          <div className="max-w-6xl mx-auto w-full space-y-8">
            
            {/* Phase Indicator & Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/20 pb-8 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[9px] technical-label uppercase tracking-widest bg-primary/5 border-primary/20 text-primary px-3">{phase}</Badge>
                  <h2 className="text-3xl font-black uppercase tracking-tight italic">
                    {phase.includes("STORYBOARD") ? "Synthesized Draft" : "Acoustic Alignment"}
                  </h2>
                </div>

                {/* Tabs UI */}
                {(transcription || storyboard) && !isProcessing && (
                  <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-xl border border-border/40 w-fit">
                    <button
                      onClick={() => setActiveTab("transcript")}
                      disabled={!transcription}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === "transcript" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-20"
                      )}
                    >
                      Transcript
                    </button>
                    <button
                      onClick={() => setActiveTab("storyboard")}
                      disabled={!storyboard}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === "storyboard" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-20"
                      )}
                    >
                      Storyboard
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {phase === "REVIEW_TRANSCRIPT" && (
                  <Button 
                    onClick={handleGenerateScenes}
                    disabled={isProcessing}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-glow shadow-primary/20 group"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />}
                    Compose Storyboard
                  </Button>
                )}
                {phase === "REVIEW_STORYBOARD" && (
                  <Button 
                    onClick={handleEnterStudio}
                    disabled={isProcessing}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-glow shadow-primary/20 group"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />}
                    Enter Design Studio
                  </Button>
                )}
              </div>
            </div>

            {isProcessing && (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
                <div className="relative w-24 h-24 mb-8">
                   <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                   <div className="relative h-full w-full bg-card/40 border border-primary/20 rounded-3xl flex items-center justify-center">
                      <Cpu className="w-10 h-10 text-primary animate-spin" />
                   </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] technical-label uppercase tracking-[0.4em] text-primary italic font-black animate-pulse">{status}</p>
                  <p className="text-xs text-muted-foreground/40 font-bold uppercase tracking-widest italic">Phase Control Active</p>
                </div>
              </div>
            )}

            {!isProcessing && transcription && (
              <div className={cn(
                "grid grid-cols-1 gap-8 animate-in fade-in duration-700",
                activeTab === "storyboard" ? "lg:grid-cols-12" : "max-w-4xl mx-auto w-full"
              )}>
                {/* Visual Distribution Panel (Only in Storyboard tab) */}
                {activeTab === "storyboard" && (
                  <div className="lg:col-span-4 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-[10px] technical-label uppercase tracking-[0.3em] font-black text-muted-foreground italic pl-1">Visual Distribution</h3>
                        <Card className="bg-card/40 border-border/40 rounded-2xl overflow-hidden shadow-sm">
                          <CardContent className="p-6 space-y-5">
                            {VISUAL_OPTIONS.map((opt) => (
                              <div 
                                key={opt.id} 
                                className="flex items-center space-x-3 p-2 -ml-2 rounded-xl hover:bg-primary/5 transition-all group cursor-pointer" 
                                onClick={() => toggleVisualType(opt.id)}
                              >
                                <div className="pointer-events-none">
                                  <Checkbox 
                                    id={opt.id} 
                                    checked={allowedVisualTypes.includes(opt.id)}
                                    className="w-5 h-5 rounded border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    readOnly
                                  />
                                </div>
                                <Label 
                                  className="text-[11px] font-black uppercase tracking-widest cursor-pointer group-hover:text-primary transition-colors italic pointer-events-none"
                                >
                                  {opt.label}
                                </Label>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                    </div>

                    <Button 
                      onClick={handleGenerateScenes}
                      disabled={isProcessing}
                      variant="outline"
                      className="w-full h-16 rounded-2xl border-border/40 bg-card hover:bg-muted/40 text-primary font-black uppercase tracking-widest text-[10px] shadow-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-primary" />}
                      Regenerate Storyboard
                    </Button>
                  </div>
                )}

                {/* Content View (Full width if transcript, 8/12 if storyboard) */}
                <div className={cn(
                  activeTab === "storyboard" ? "lg:col-span-8" : "w-full"
                )}>
                  {activeTab === "transcript" ? (
                    <div className="space-y-6">
                      <Card className="bg-card/20 border-border/40 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
                        <CardContent className="p-8 space-y-8">
                           <div className="space-y-2">
                              <div className="flex items-center gap-2 opacity-20">
                                 <FileText className="w-3.5 h-3.5 text-primary" />
                                 <span className="text-[8px] technical-label uppercase tracking-widest font-black italic">Narrative Buffer</span>
                              </div>
                              <p className="text-xl font-black leading-snug tracking-tight italic text-foreground/80">
                                "{transcription.text}"
                              </p>
                           </div>
                           
                           <div className="space-y-4 pt-6 border-t border-border/10">
                             <div className="flex items-center gap-2 text-muted-foreground/30 font-bold italic">
                                <Clock className="w-3 h-3" />
                                <span className="text-[8px] technical-label uppercase tracking-[0.2em]">Lexical Temporal Nodes</span>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {transcription.words?.map((word: any, i: number) => (
                                  <div key={i} className="bg-muted/10 border border-border/5 px-3 py-2 rounded-lg hover:border-primary/20 transition-all group cursor-default flex flex-col items-start gap-1">
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-foreground/60 group-hover:text-primary transition-colors">{word.word}</p>
                                    <div className="flex items-center gap-2 text-[7px] technical-label opacity-20 font-black">
                                      <span className="text-primary/40">START</span>
                                      <span>{word.start.toFixed(2)}s</span>
                                    </div>
                                  </div>
                                ))}
                             </div>
                           </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-700">
                      <div className="mb-4 flex items-center justify-between px-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-2 py-0.5 font-black text-[8px] technical-label italic uppercase tracking-widest">Draft Schema</Badge>
                          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">{storyboard.scenes?.length} Nodes Active</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {storyboard.scenes?.map((scene: any, idx: number) => (
                          <CompactSceneCard
                            key={idx}
                            scene={{...scene, index: idx + 1} as any}
                            isSelected={selectedSceneIndex === idx}
                            onClick={() => {
                              setSelectedSceneIndex(idx);
                              setIsModalOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="p-12 rounded-[3rem] bg-destructive/5 border border-destructive/10 text-center space-y-6 animate-in zoom-in-95 duration-500 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
                   <X className="w-6 h-6 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-black uppercase tracking-widest text-destructive">Signal Interrupted</h4>
                  <p className="text-xs font-bold text-destructive/40 italic">"{error}"</p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl uppercase font-black text-[10px] tracking-widest h-12 bg-transparent border-destructive/20 hover:bg-destructive/5 text-destructive">
                  Recalibrate Connection
                </Button>
              </div>
            )}

          </div>
        </main>

        <footer className="h-16 flex items-center justify-between px-8 bg-card/40 backdrop-blur-md border-t border-border/40 z-50">
           <div className="flex items-center gap-8 text-muted-foreground/30 font-bold">
              <div className="flex items-center gap-2.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                 <span className="text-[9px] technical-label uppercase tracking-[0.2em] font-black italic">SYNTHESIS_LAYER_LOCK</span>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-border/40 text-[8px] technical-label font-black uppercase tracking-widest h-6 px-3 italic bg-muted/40 opacity-40">GPT-4o Precision Engine</Badge>
              <Badge variant="outline" className="border-border/10 text-[8px] technical-label font-black uppercase tracking-widest h-6 px-3">Rev: 2.3.0</Badge>
           </div>
        </footer>
      </div>

      {selectedSceneIndex !== null && storyboard && (
        <SceneModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          scene={storyboard.scenes[selectedSceneIndex]}
          onUpdate={(updates) => {
             const newScenes = [...storyboard.scenes];
             newScenes[selectedSceneIndex] = { ...newScenes[selectedSceneIndex], ...updates };
             setStoryboard({ ...storyboard, scenes: newScenes });
          }}
        />
      )}
    </div>
  );
}
