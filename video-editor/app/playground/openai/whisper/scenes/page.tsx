"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Loader2, Sparkles, Layout, 
  ChevronRight, Save, Type, Film, 
  Image as ImageIcon, Zap, Activity,
  CheckCircle2, Clock, Code, X,
  RefreshCw, Trash2, ChevronUp, ChevronDown, Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SceneCard } from "@/components/scenes/scene-card";
import { SceneModal } from "@/components/modals/scene-modal";
import { cn } from "@/lib/utils";

export default function ScenePreviewPage() {
  const router = useRouter();
  const [transcription, setTranscription] = useState<any>(null);
  const [storyboard, setStoryboard] = useState<any>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [showJson, setShowJson] = useState(false);
  const [allowedVisualTypes, setAllowedVisualTypes] = useState(["a-roll", "b-roll", "graphics", "image"]);
  const [editingSceneIndex, setEditingSceneIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [masterAudioUrl, setMasterAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("latest_whisper_transcription");
    const savedAudio = localStorage.getItem("latest_whisper_audio_url");
    
    if (!saved) {
      router.push("/playground/openai/whisper");
      return;
    }
    const parsed = JSON.parse(saved);
    setTranscription(parsed);
    setMasterAudioUrl(savedAudio);
    generateStoryboard(parsed);
  }, []);

  const generateStoryboard = async (trans: any) => {
    setIsGenerating(true);
    setStatus("Deconstructing temporal markers...");
    setError(null);

    try {
      const response = await fetch("/api/ai/whisper/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transcription: trans,
          allowedVisualTypes
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate storyboard");

      setStoryboard(data);
      if (!projectTitle) setProjectTitle(data.project?.title || "My New Video Project");
      setStatus("Storyboard synthesized successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateScene = (index: number, updates: any) => {
    if (!storyboard) return;
    const newScenes = [...storyboard.scenes];
    newScenes[index] = { ...newScenes[index], ...updates };
    setStoryboard({ ...storyboard, scenes: newScenes });
  };

  const removeScene = (index: number) => {
    if (!storyboard) return;
    const newScenes = storyboard.scenes.filter((_: any, i: number) => i !== index);
    setStoryboard({ ...storyboard, scenes: newScenes });
  };

  const moveScene = (index: number, direction: 'up' | 'down') => {
    if (!storyboard) return;
    const newScenes = [...storyboard.scenes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newScenes.length) return;
    
    [newScenes[index], newScenes[targetIndex]] = [newScenes[targetIndex], newScenes[index]];
    setStoryboard({ ...storyboard, scenes: newScenes });
  };

  const handleCreateProject = async () => {
    if (!projectTitle.trim()) {
      setError("Please provide a project title.");
      return;
    }

    setIsSaving(true);
    setStatus("Orchestrating database allocation...");

    try {
      const response = await fetch("/api/projects/create-from-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle,
          storyboardData: storyboard,
          masterAudioUrl
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create project");

      setStatus("Project initialized. Redirecting to Master Control...");
      router.push(`/playground/orchestration/${data.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const getVisualIcon = (type: string) => {
    switch (type) {
      case "a-roll": return <Zap className="w-4 h-4 text-amber-500" />;
      case "b-roll": return <Film className="w-4 h-4 text-blue-500" />;
      case "graphics": return <Activity className="w-4 h-4 text-emerald-500" />;
      case "image": return <ImageIcon className="w-4 h-4 text-violet-500" />;
      default: return <Layout className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-neutral-900 selection:bg-indigo-100 font-sans">
      {/* Navigation Header */}
      <nav className="border-b border-indigo-50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/playground/openai/whisper">
              <Button variant="ghost" className="rounded-xl hover:bg-neutral-50 group px-3">
                <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
              </Button>
            </Link>
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-600 text-white border-none text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm">Logic Synthesis</Badge>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">Phase 2: Orchestration Design</span>
               </div>
               <h1 className="text-xl font-black uppercase tracking-tight text-neutral-900">Storyboard <span className="text-indigo-600 italic">Synthesizer</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end mr-6">
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Current Trace</span>
                <span className="text-[11px] font-bold text-indigo-500 uppercase italic flex items-center gap-2">
                   {isGenerating || isSaving ? (
                     <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                   ) : (
                     <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                   )}
                   {status || "Awaiting design initialization..."}
                </span>
             </div>
             
             <Button 
               variant="outline"
               onClick={() => setShowJson(!showJson)}
               className="border-neutral-200 rounded-xl px-4 py-6 font-bold uppercase tracking-widest text-[10px] hover:bg-neutral-50"
             >
               <Code className="w-4 h-4 mr-2" />
               View JSON
             </Button>

             <Button 
               onClick={handleCreateProject}
               disabled={!storyboard || isSaving || isGenerating}
               className="bg-neutral-900 hover:bg-black text-white px-8 py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-neutral-200 disabled:opacity-50"
             >
               {isSaving ? (
                 <>
                   <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                   Allocating Resources...
                 </>
               ) : (
                 <>
                   <Save className="w-4 h-4 mr-3" />
                   Finalize & Create Project
                 </>
               )}
             </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-12 space-y-12">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-8">
             <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 flex items-center justify-center animate-pulse">
                   <Sparkles className="w-10 h-10 text-indigo-400" />
                </div>
                <div className="absolute inset-0 w-24 h-24 rounded-[2rem] border-4 border-indigo-500 border-t-transparent animate-spin" />
             </div>
             <div className="text-center space-y-2">
                <p className="text-sm font-black text-neutral-300 uppercase tracking-[0.4em] italic leading-tight">Dreaming Up Scenes</p>
                <p className="text-[10px] font-bold text-neutral-200 uppercase tracking-widest">Applying GPT-4o Cinematic Intelligence</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
             
             {/* Left Column: Project Config */}
             <div className="lg:col-span-4 space-y-8">
                <Card className="border-2 border-neutral-100 shadow-xl shadow-neutral-500/5 rounded-[2.5rem] bg-white overflow-hidden">
                   <CardHeader className="p-8 pb-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 italic">Project Identity</span>
                        <CardTitle className="text-xs font-black uppercase tracking-tight">Core Configuration</CardTitle>
                      </div>
                   </CardHeader>
                   <CardContent className="p-8 space-y-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Project Name</label>
                         <div className="relative group">
                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 group-focus-within:text-indigo-500 transition-colors" />
                            <Input 
                              value={projectTitle}
                              onChange={(e) => setProjectTitle(e.target.value)}
                              placeholder="Enter project name..."
                              className="pl-12 py-7 rounded-2xl bg-neutral-50 border-2 border-neutral-100 focus:border-indigo-500 focus:bg-white transition-all font-bold text-sm"
                            />
                         </div>
                      </div>

                      <div className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">Storyboard Summary</p>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                               <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">Total Scenes</p>
                               <p className="text-2xl font-black text-indigo-600">{storyboard?.scenes?.length || 0}</p>
                            </div>
                            <div className="space-y-1 text-right">
                               <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">Total Duration</p>
                               <p className="text-2xl font-black text-indigo-600">{storyboard?.project?.totalDuration?.toFixed(1) || 0}s</p>
                            </div>
                         </div>
                      </div>

                       <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Visual Distribution</p>
                        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-3">
                           {["a-roll", "b-roll", "graphics", "image"].map((type) => (
                              <div key={type} className="flex items-center space-x-3">
                                 <Checkbox 
                                    id={`type-${type}`}
                                    checked={allowedVisualTypes.includes(type)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                       const isChecked = e.target.checked;
                                       setAllowedVisualTypes(prev => 
                                          isChecked ? [...prev, type] : prev.filter(t => t !== type)
                                       );
                                    }}
                                 />
                                 <label htmlFor={`type-${type}`} className="text-[11px] font-bold text-neutral-600 uppercase tracking-tight cursor-pointer">
                                    {type.replace("-", " ")}
                                 </label>
                              </div>
                           ))}
                        </div>
                        <Button 
                           onClick={() => generateStoryboard(transcription)}
                           disabled={isGenerating || allowedVisualTypes.length === 0}
                           variant="outline"
                           className="w-full py-6 rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest"
                        >
                           <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating && "animate-spin")} />
                           Regenerate Storyboard
                        </Button>
                      </div>
                   </CardContent>
                </Card>

                <div className="p-8 rounded-[2.5rem] bg-neutral-900 text-white relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
                      <Zap className="w-24 h-24" />
                   </div>
                   <div className="relative z-10 space-y-4">
                      <Badge className="bg-emerald-500 text-white border-none font-bold text-[8px] uppercase tracking-widest">Verified Production Logic</Badge>
                      <h3 className="text-xl font-black italic uppercase italic">Agent Orchestrator</h3>
                      <p className="text-neutral-400 text-[10px] font-medium leading-relaxed uppercase tracking-tight">
                         Upon initialization, specialized agents will automate asset generation for each scene.
                      </p>
                   </div>
                </div>
             </div>

             {/* Right Column: Scene List */}
             <div className="lg:col-span-8 space-y-8">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 italic">Conceptual Storyboard</h2>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 tracking-tighter">Draft Review Active</span>
                   </div>
                </div>

                <div className="grid gap-6">
                    {storyboard?.scenes?.map((scene: any, idx: number) => (
                      <SceneCard
                        key={idx}
                        scene={{...scene, index: idx + 1} as any}
                        isSelected={selectedSceneIndex === idx}
                        onClick={() => setSelectedSceneIndex(idx)}
                        onDoubleClick={() => {
                          setSelectedSceneIndex(idx);
                          setIsModalOpen(true);
                        }}
                      />
                    ))}
                </div>
             </div>
          </div>
        )}
 
        {selectedSceneIndex !== null && storyboard && (
          <SceneModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            scene={storyboard.scenes[selectedSceneIndex]}
            onUpdate={(updates) => updateScene(selectedSceneIndex, updates)}
          />
        )}

        {/* JSON Inspector Modal/Overlay */}
        {showJson && storyboard && (
          <div className="fixed inset-0 z-[100] bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-300">
             <Card className="w-full max-w-4xl h-[80vh] border-none shadow-2xl rounded-[3rem] overflow-hidden bg-neutral-950 text-emerald-400 font-mono">
                <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-2 bg-emerald-500/10 rounded-xl">
                         <Code className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                         <CardTitle className="text-xs font-black uppercase tracking-widest text-white/40 italic">Linguistic JSON Stream</CardTitle>
                         <p className="text-[10px] font-bold text-emerald-500/60 uppercase">System Manifest / v1.2</p>
                      </div>
                   </div>
                   <button onClick={() => setShowJson(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white/20 hover:text-white">
                      <X className="w-5 h-5" />
                   </button>
                </CardHeader>
                <CardContent className="p-8 overflow-y-auto h-full pb-24">
                   <pre className="text-xs leading-relaxed">
                      {JSON.stringify(storyboard, null, 2)}
                   </pre>
                </CardContent>
             </Card>
          </div>
        )}

        {error && (
          <div className="mt-8 p-6 rounded-[2rem] bg-rose-50 border-2 border-rose-100 flex items-center gap-6 animate-in fade-in zoom-in duration-500">
             <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500">
                <Zap className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 italic mb-1">Synthesis Breach Error</p>
                <p className="text-sm font-bold text-rose-600 italic">"{error}"</p>
             </div>
             <Button onClick={() => window.location.reload()} variant="outline" className="ml-auto border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl uppercase font-black text-[10px]">
                Re-Initialize Link
             </Button>
          </div>
        )}
      </main>
    </div>
  );
}
