"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SceneHeader } from "@/components/scenes/scene-header";
import { SceneCard } from "@/components/scenes/scene-card";
import { SceneModal } from "@/components/modals/scene-modal";
import { NavSidebar } from "@/components/panels/nav-sidebar";
import { ScenePropertiesPanel } from "@/components/panels/scene-properties-panel";
import { Scene } from "@/lib/types";
import { sampleScenes, sampleProject } from "@/lib/sample-data";

export default function VideoEditorPage() {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>(sampleScenes);
  const [activeNavItem, setActiveNavItem] = useState("studio");
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addScene = () => {
    const newScene: Scene = { 
      id: `scene_${Date.now()}`,
      index: scenes.length + 1,
      startTime: scenes.length > 0 ? scenes[scenes.length - 1].endTime : 0,
      endTime: scenes.length > 0 ? scenes[scenes.length - 1].endTime + 10 : 10,
      duration: 10,
      script: "New scene content. Click to edit and add your script.", 
      visualType: "a-roll",
      aRoll: {
        type: "ai-avatar",
        avatarId: "avatar_host_01",
        provider: "heygen",
        emotion: "neutral",
        cameraAngle: "medium-shot",
        sourceUrl: null,
        assetStatus: "pending_generation",
        fittingRequired: true,
        fittingStrategy: "generate_to_duration"
      },
      transition: { type: "fade", duration: 0.5, direction: "in" }
    };
    setScenes([...scenes, newScene]);
    showToast(`Scene ${scenes.length + 1} added`);
  };

  const selectedScene = selectedSceneIndex !== null ? scenes[selectedSceneIndex] : null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border technical-label text-xs font-bold uppercase tracking-wider ${
          toast.type === "success" 
            ? "bg-green-500/10 border-green-500/30 text-green-500" 
            : "bg-destructive/10 border-destructive/30 text-destructive"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Left Navigation Sidebar (Retractable) */}
      <NavSidebar 
        activeItem={activeNavItem} 
        onItemClick={(id) => setActiveNavItem(id)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <SceneHeader 
          title={`🎬 ${sampleProject.title}`}
          onSave={() => showToast("Project saved")}
          onExport={() => showToast("Exporting...")}
          onAiSuggest={() => showToast("AI generating suggestions...")}
          onGenerateStoryboard={() => showToast("Generating storyboard...")}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Main Canvas */}
          <main className="flex-1 overflow-auto p-6 md:p-8 scrollbar-hide bg-muted/5">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Storyboard Canvas</h1>
                  <p className="text-[10px] technical-label opacity-40 uppercase tracking-widest mt-1">
                    Scene Orchestrator // {sampleProject.totalDuration.toFixed(1)}s total
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px] technical-label font-bold py-1.5 px-4">
                    {scenes.length} SCENES
                  </Badge>
                  <Badge variant="outline" className="text-[10px] technical-label font-bold py-1.5 px-4 text-green-500 border-green-500/30">
                    {scenes.filter(s => {
                      const status = s.aRoll?.assetStatus || s.bRoll?.assetStatus || s.graphics?.assetStatus || s.image?.assetStatus;
                      return status === "ready" || status === "generated";
                    }).length} READY
                  </Badge>
                  <Badge variant="outline" className="text-[10px] technical-label font-bold py-1.5 px-4 text-amber-500 border-amber-500/30">
                    {scenes.filter(s => {
                      const status = s.aRoll?.assetStatus || s.bRoll?.assetStatus || s.graphics?.assetStatus || s.image?.assetStatus;
                      return status === "pending_generation";
                    }).length} PENDING
                  </Badge>
                </div>
              </div>

              {/* Scene Grid - No drag and drop (scenes are sequential from AI) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-500">
                {scenes.map((scene, i) => (
                  <SceneCard 
                    key={scene.id} 
                    scene={scene}
                    isSelected={selectedSceneIndex === i}
                    onClick={() => {
                      setSelectedSceneIndex(i);
                    }}
                    onDoubleClick={() => {
                      setSelectedSceneIndex(i);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
                
                <button 
                  onClick={addScene}
                  className="border-2 border-dashed border-border rounded-lg aspect-video flex flex-col items-center justify-center gap-4 hover:bg-muted/10 hover:border-border/80 transition-all group relative overflow-hidden min-h-[180px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center group-hover:bg-muted/50 group-hover:scale-110 transition-all border border-border">
                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="technical-label text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-all">Add Scene</span>
                    <span className="text-[9px] opacity-40 technical-label">Scene {scenes.length + 1}</span>
                  </div>
                </button>
              </div>
            </div>
          </main>

          {/* Right Properties Panel */}
          <ScenePropertiesPanel 
            scene={selectedScene}
            onUpdate={(data) => {
              if (selectedSceneIndex !== null) {
                const newScenes = [...scenes];
                newScenes[selectedSceneIndex] = { ...newScenes[selectedSceneIndex], ...data };
                setScenes(newScenes);
              }
            }}
          />
        </div>
      </div>

      <SceneModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scene={selectedScene}
        onUpdate={(data: Partial<Scene>) => {
          if (selectedSceneIndex !== null) {
            const newScenes = [...scenes];
            newScenes[selectedSceneIndex] = { 
              ...newScenes[selectedSceneIndex], 
              ...data
            };
            setScenes(newScenes);
          }
        }}
      />
    </div>
  );
}
