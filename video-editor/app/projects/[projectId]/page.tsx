"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Play, 
  RotateCcw, 
  Clock, 
  Terminal,
  Cpu,
  Plus,
  LayoutGrid,
  PanelLeft,
  Loader2,
  User,
  Video,
  Image as ImageIcon,
  Zap,
  CheckCircle2,
  AlertCircle,
  Layers,
  Download,
  Link2,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NavSidebar } from "@/components/panels/nav-sidebar";
import { CreationFlowBreadcrumbs } from "@/components/creation/creation-breadcrumbs";
import { SceneCard } from "@/components/scenes/scene-card";
import { SceneModal } from "@/components/modals/scene-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useProject } from "@/hooks/use-projects";
import { useScenes, useUpdateScene } from "@/hooks/use-scenes";
import { useAgentState, useResetAgentState, useUpdateAgentState } from "@/hooks/use-agent-state";
import { useParams, useRouter } from "next/navigation";
import { SettingsPanel } from "@/components/panels/settings-panel";

// Agent to Icon Mapping for Premium UI
const AGENT_ICONS: Record<string, any> = {
  'A-Roll Agent': User,
  'B-Roll Agent': Video,
  'Image Agent': ImageIcon,
  'Motion Graphics Agent': Zap,
  'Orchestrator': Cpu,
  'System': Terminal,
};

export default function DynamicStudioPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  // React Query Hooks (Real Data)
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: dbScenes, isLoading: scenesLoading } = useScenes(projectId);
  const { data: agentMemory } = useAgentState(projectId);
  
  const updateSceneMutation = useUpdateScene(projectId);
  const updateAgentStateMutation = useUpdateAgentState(projectId);
  const resetAgentStateMutation = useResetAgentState(projectId);

  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProducing, setIsProducing] = useState(false);
  const [isStitching, setIsStitching] = useState(false);
  const [masterVideoUrl, setMasterVideoUrl] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [asideWidth, setAsideWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [localLogs, setLocalLogs] = useState<{ msg: string; type: string }[]>([
    { msg: "System: Production environment initialized.", type: 'system' }
  ]);
  const [activeView, setActiveView] = useState("studio");
  const [useFadeTransition, setUseFadeTransition] = useState(true);
  const [useLightLeak, setUseLightLeak] = useState(false);
  const [useCloudRender, setUseCloudRender] = useState(false);
  const [cloudProgress, setCloudProgress] = useState<number>(0);
  const [customLightLeakUrl, setCustomLightLeakUrl] = useState("");
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [isSyncingDurations, setIsSyncingDurations] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const getVideoDuration = async (url: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.crossOrigin = "anonymous"; 
      video.src = url;
      video.onloadedmetadata = () => resolve(video.duration);
      video.onerror = () => reject("Failed to load video metadata");
      setTimeout(() => reject("Timeout fetching metadata"), 8000);
    });
  };

  const handleSyncDurations = async () => {
    if (!dbScenes || isSyncingDurations) return;
    setIsSyncingDurations(true);
    await addLog("System: Initializing asset metadata sync... Probing durations for all scenes.", 'system');

    try {
      let syncCount = 0;
      for (const scene of [...dbScenes].sort((a, b) => a.index - b.index)) {
        const url = scene.final_video_url || scene.asset_url;
        if (!url) continue;

        try {
          const duration = await getVideoDuration(url);
          if (duration > 0) {
            await updateSceneMutation.mutateAsync({
              id: scene.id,
              updates: { duration }
            });
            syncCount++;
            await addLog(`System: Synced Scene ${scene.index + 1} -> ${duration.toFixed(2)}s`, 'system');
          }
        } catch (err) {
          console.error(`Failed to sync duration for scene ${scene.id}:`, err);
          await addLog(`Error: Could not sync Scene ${scene.index + 1}.`, 'error');
        }
      }
      await addLog(`✅ System: Sync complete. ${syncCount} scenes updated with precise durations.`, 'success');
    } catch (err) {
      console.error("Sync failed:", err);
      await addLog("Error: Duration synchronization failed.", 'error');
    } finally {
      setIsSyncingDurations(false);
    }
  };

  const handleNavClick = (id: string) => {
    if (id === "settings") {
      router.push("/settings");
    } else {
      setActiveView(id);
    }
  };

  // Resize handling logic
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 200 && newWidth <= 600) {
        setAsideWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Sync internal logs with DB logs
  useEffect(() => {
    if (agentMemory?.last_log) {
        setLocalLogs(prev => {
            // Only add if it's different from the last log to avoid duplicates during polling
            if (prev.length > 0 && prev[prev.length - 1].msg === agentMemory.last_log) return prev;
            return [...prev, { msg: agentMemory.last_log as string, type: 'orchestrator' }];
        });
    }
  }, [agentMemory?.last_log]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localLogs]);

  const addLog = async (msg: string, type: 'system' | 'orchestrator' | 'agent' | 'success' | 'error' = 'system') => {
    setLocalLogs(prev => [...prev.slice(-50), { msg, type }]);
    // Also push to DB for persistence/orchestration memory
    await updateAgentStateMutation.mutateAsync({ last_log: msg });
  };

  const startProduction = async () => {
    if (isProducing) return;
    setIsProducing(true);
    
    await updateAgentStateMutation.mutateAsync({ workflow_status: 'processing' });
    await addLog("Orchestrator: Production Started. Taking control of the orchestration pipeline.", 'orchestrator');
    
    // Use the Server Action
    const { processNextScene } = await import("@/app/actions/orchestrator");

    // Loop through scenes using a local active flag
    let active = true;
    while (active) {
        const result = await processNextScene(projectId);
        
        console.log("[Studio] Result from scene processor:", result);

        if (result.success && result.message === "Project completed.") {
            await addLog("✅ All scenes processed. Pipeline complete.", 'success');
            active = false;
        } else if (!result.success) {
            if (result.message.includes("inactive") || result.message.includes("completed")) {
                active = false;
            } else {
                console.error("Simulation Error:", result.error || result.message);
                await addLog(`❌ Error: ${result.message}`, 'error');
                active = false;
            }
        }

        // Small pause between scenes for UI visibility/DB polling
        if (active) {
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    setIsProducing(false);
  };

  const handleStitch = async () => {
    if (isStitching) return;
    
    setIsStitching(true);
    setCloudProgress(0);
    setEstimatedCost(null);
    await addLog(`Production Orchestrator: Initializing final high-fidelity stitching sequence (${useCloudRender ? 'Cloud Lambda' : 'Local FFmpeg'})...`, 'orchestrator');

    try {
      const response = await fetch(`/api/projects/${projectId}/stitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          useFadeTransition, 
          useLightLeak,
          useCloudRender,
          lightLeakUrl: customLightLeakUrl
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Stitching failed");
      }

      const data = await response.json();
      
      if (data.isCloudRender) {
        await addLog("☁️ Production Orchestrator: Cloud render dispatched to AWS Lambda. Monitoring progress...", 'orchestrator');
        if (data.details?.estimatedCost) {
            setEstimatedCost(data.details.estimatedCost);
        }
        pollCloudStitchStatus(data.renderId, data.bucketName);
      } else {
        setMasterVideoUrl(data.publicUrl);
        await addLog("✅ Production Orchestrator: Master production assembled successfully! Final render is ready for review.", 'success');
        setIsStitching(false);
      }

    } catch (err: any) {
      console.error("Stitching failed:", err);
      await addLog(`❌ Error: Final assembly failed - ${err.message}`, 'error');
      setIsStitching(false);
    }
  };

  const pollCloudStitchStatus = async (renderId: string, bucketName: string) => {
    const REMOTE_RENDER_SERVER = "http://localhost:3000";
    const interval = setInterval(async () => {
        try {
            const res = await fetch(`${REMOTE_RENDER_SERVER}/lambda/status/${renderId}?bucketName=${bucketName}`);
            const data = await res.json();

            if (data.status === "completed") {
                setMasterVideoUrl(data.videoUrl);
                setIsStitching(false);
                setCloudProgress(100);
                await addLog("✅ Production Orchestrator: Cloud assembly complete! Master video is available.", 'success');
                clearInterval(interval);
            } else if (data.status === "failed") {
                await addLog(`❌ Error: Cloud assembly failed - ${data.error}`, 'error');
                setIsStitching(false);
                clearInterval(interval);
            } else if (data.status === "in-progress") {
                setCloudProgress(Math.round(data.progress * 100));
            }
        } catch (err) {
            console.error("Cloud Polling error:", err);
        }
    }, 2000);
  };

  const handleReset = async () => {
    if (confirm("Reset production state? This will wipe progress in the database.")) {
        setIsProducing(false);
        setLocalLogs([{ msg: "System: Production reset by user. Memory cleared.", type: 'system' }]);
        
        const { resetProjectProduction } = await import("@/app/actions/orchestrator");
        await resetProjectProduction(projectId);
    }
  };

  // Map DB scene format to SceneCard's expected format
  const mappedScenes = dbScenes?.map(s => ({
    ...s,
    startTime: s.start_time,
    endTime: s.end_time,
    duration: s.duration || (s.end_time - s.start_time),
    visualType: s.visual_type,
    directorNote: s.director_notes || s.payload?.directorNote,
    // Add fake structures for the Card UI colors/icons if payload is missing
    aRoll: s.visual_type === 'a-roll' ? { 
      assetStatus: s.status === 'completed' ? 'ready' : (s.status === 'processing' ? 'pending_generation' : 'generated'),
      ...s.payload 
    } : undefined,
    bRoll: s.visual_type === 'b-roll' ? { 
      assetStatus: s.status === 'completed' ? 'ready' : (s.status === 'processing' ? 'pending_generation' : 'generated'),
      ...s.payload 
    } : undefined,
    graphics: s.visual_type === 'graphics' ? { 
      assetStatus: s.status === 'completed' ? 'ready' : (s.status === 'processing' ? 'pending_generation' : 'generated'),
      ...s.payload 
    } : undefined,
    image: s.visual_type === 'image' ? { 
      assetStatus: s.status === 'completed' ? 'ready' : (s.status === 'processing' ? 'pending_generation' : 'generated'),
      ...s.payload 
    } : undefined,
    transition: s.transition || { type: 'none', duration: 0 }
  })) || [];

  if (projectLoading || scenesLoading) {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-[10px] technical-label opacity-40 uppercase tracking-widest">Waking up project nodes...</p>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans relative">
      {/* Background Depth Layer - Minimalist soft glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(var(--primary-rgb),0.015)_0%,_transparent_60%),radial-gradient(circle_at_70%_80%,_rgba(var(--primary-rgb),0.01)_0%,_transparent_60%)] pointer-events-none" />

      <NavSidebar
        activeItem={activeView}
        isCollapsed={isSidebarCollapsed}
        onItemClick={handleNavClick}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Header - Absolute positioning with premium glassmorphism */}
        <header className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-8 z-50 glass-premium">
          <div className="flex items-center gap-6">
            {/* Sidebar Toggle - High visibility, standard pro-tool pattern */}
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
                <span className="text-[14px]">🎬</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-foreground tracking-tight line-clamp-1">{project?.title || "Loading..."}</h1>
                <p className="text-[9px] technical-label text-muted-foreground uppercase tracking-[0.2em] opacity-40">Production Node {projectId.slice(0, 4)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <CreationFlowBreadcrumbs activeStep="STUDIO" className="mr-4" />
             <div className="flex items-center gap-3">
               <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-xl border border-border/40">
              <ThemeToggle />
              <button 
                  onClick={handleReset}
                  disabled={isProducing}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all disabled:opacity-20 hover:text-foreground"
                  title="Reset Database State"
              >
                  <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="w-px h-6 bg-border/40 mx-1" />
            <button 
                onClick={startProduction}
                disabled={isProducing || agentMemory?.workflow_status === 'completed'}
                className={cn(
                    "flex items-center gap-2.5 px-5 py-2.5 rounded-xl technical-label text-[10px] font-bold uppercase tracking-[0.15em] transition-all",
                    isProducing 
                      ? "bg-primary/10 text-primary border border-primary/30 animate-pulse" 
                      : (agentMemory?.workflow_status === 'completed' ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow active:scale-95")
                )}
            >
                {isProducing ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                {isProducing ? "PRODUCING..." : (agentMemory?.workflow_status === 'completed' ? "COMPLETED" : "START PRODUCTION")}
            </button>

            {agentMemory?.workflow_status === 'completed' && (
              <div className="flex items-center gap-3">
                {/* Sync Assets Button */}
                <button
                  onClick={handleSyncDurations}
                  disabled={isSyncingDurations || isStitching}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 cursor-pointer hover:bg-indigo-500/20 transition-all",
                    isSyncingDurations && "animate-pulse"
                  )}
                  title="Sync exact asset durations from metadata"
                >
                  <RefreshCw className={cn("w-3 h-3 text-indigo-500", isSyncingDurations && "animate-spin")} />
                  <span className="text-[10px] technical-label font-bold uppercase tracking-[0.15em] text-indigo-700/80">
                    {isSyncingDurations ? "Syncing..." : "Sync Assets"}
                  </span>
                </button>

                <label 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 cursor-pointer hover:bg-orange-500/20 transition-all"
                  title="Render using AWS Lambda for high-fidelity transitions"
                >
                  <input
                    type="checkbox"
                    checked={useCloudRender}
                    onChange={(e) => setUseCloudRender(e.target.checked)}
                    className="w-4 h-4 rounded border-orange-500/60 text-orange-500 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <Zap className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] technical-label font-bold uppercase tracking-[0.15em] text-orange-700/80">
                    Cloud Render
                  </span>
                </label>

                {useCloudRender && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/5 border border-orange-500/20 animate-in fade-in slide-in-from-right-2">
                    <Link2 className="w-3 h-3 text-orange-500/50" />
                    <input
                      type="text"
                      placeholder="Light Leak URL (Optional)"
                      value={customLightLeakUrl}
                      onChange={(e) => setCustomLightLeakUrl(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-[10px] technical-label font-bold text-orange-950/70 placeholder:text-orange-950/30 w-48"
                    />
                  </div>
                )}

                {!useCloudRender && (
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/20 border border-border/40 cursor-pointer hover:bg-muted/30 transition-all">
                      <input
                        type="checkbox"
                        checked={useLightLeak}
                        onChange={(e) => {
                          setUseLightLeak(e.target.checked);
                          if (e.target.checked) setUseFadeTransition(false);
                        }}
                        className="w-4 h-4 rounded border-border/60 text-primary focus:ring-primary"
                      />
                      <span className="text-[10px] technical-label font-bold uppercase tracking-[0.15em] text-foreground/70">Light Leak</span>
                    </label>

                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/20 border border-border/40 cursor-pointer hover:bg-muted/30 transition-all">
                      <input
                        type="checkbox"
                        checked={useFadeTransition}
                        onChange={(e) => {
                          setUseFadeTransition(e.target.checked);
                          if (e.target.checked) setUseLightLeak(false);
                        }}
                        className="w-4 h-4 rounded border-border/60 text-primary focus:ring-primary"
                      />
                      <span className="text-[10px] technical-label font-bold uppercase tracking-[0.15em] text-foreground/70">Fade</span>
                    </label>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {estimatedCost !== null && !isStitching && (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-in zoom-in-95">
                      <Zap className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] technical-label font-black text-emerald-600 uppercase tracking-wider">
                        EST. ${estimatedCost.toFixed(6)}
                      </span>
                    </div>
                  )}

                  <button 
                    onClick={masterVideoUrl ? () => window.open(masterVideoUrl, '_blank') : handleStitch}
                    disabled={isStitching || isSyncingDurations}
                    className={cn(
                      "flex items-center gap-2.5 px-6 py-2.5 rounded-xl technical-label text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-glow-sm",
                      isStitching 
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/30" 
                        : (masterVideoUrl 
                            ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-glow"
                            : "bg-foreground text-background hover:bg-foreground/90 active:scale-95")
                    )}
                  >
                    {isStitching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{cloudProgress > 0 ? `ASSEMBLING ${cloudProgress}%` : "ASSEMBLING..."}</span>
                      </>
                    ) : masterVideoUrl ? (
                      <>
                        <Download className="w-4 h-4" />
                        <span>VIEW MASTER</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4" />
                        <span>EXPORT MASTER</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

        <div className="flex-1 flex overflow-hidden">
          {activeView === "studio" ? (
            <main className="flex-1 overflow-auto p-6 md:p-8 pt-24 md:pt-28 scrollbar-hide">
              <div className="max-w-6xl mx-auto space-y-8">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/40 pb-6 gap-6">
                  <div className="space-y-1.5">
                    <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent italic">Storyboard Canvas</h1>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] technical-label opacity-30 uppercase tracking-[0.3em]">
                        Status: <span className="text-primary font-black">{agentMemory?.workflow_status.toUpperCase()}</span>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[9px] technical-label opacity-30 uppercase tracking-[0.3em]">
                        {project?.total_duration}s Production Duration
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Badge variant="outline" className="text-[9px] technical-label font-bold py-1.5 px-4 rounded-lg bg-background/40 backdrop-blur-sm border-border/40">
                      {mappedScenes.length} SCENES
                    </Badge>
                    <Badge variant="outline" className="text-[9px] technical-label font-bold py-1.5 px-4 rounded-lg bg-green-500/5 text-green-600 border-green-500/10">
                      {agentMemory?.completed_count || 0} READY
                    </Badge>
                  </div>
                </div>

                <div 
                  className="grid gap-8 pb-32 px-1 max-w-7xl"
                  style={{ gridTemplateColumns: `repeat(auto-fill, minmax(340px, 1fr))` }}
                >
                  {mappedScenes.map((scene, i) => (
                    <SceneCard 
                      key={scene.id} 
                      scene={scene as any}
                      isSelected={selectedSceneIndex === i}
                      onClick={() => setSelectedSceneIndex(i)}
                      onDoubleClick={() => {
                          setSelectedSceneIndex(i);
                          setIsModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            </main>
          ) : activeView === "settings" ? (
            <SettingsPanel 
                memory={agentMemory as any} 
                onUpdate={(updates) => updateAgentStateMutation.mutateAsync(updates)} 
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground/30 uppercase technical-label text-[10px] tracking-widest italic">
               Module Offline or Under Maintenance
            </div>
          )}

          <div 
            onMouseDown={startResizing}
            className={cn(
                "w-1.5 h-full cursor-col-resize hover:bg-primary/20 transition-colors z-30 relative shrink-0",
                isResizing && "bg-primary/40"
            )}
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-border/50" />
          </div>

          <aside 
            style={{ width: `${asideWidth}px` }}
            className="border-l border-border/50 bg-background flex flex-col shrink-0 relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-6 z-20 glass-premium">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Terminal className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[10px] technical-label font-black uppercase tracking-[0.2em] text-foreground/60">Production Status</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/20 px-3 py-1.5 rounded-full border border-border/40">
                    <span className={cn("w-1.5 h-1.5 rounded-full", isProducing ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-muted")} />
                    <span className="text-[8px] technical-label opacity-40 uppercase font-black tracking-[0.1em]">
                        {isProducing ? "LIVE" : "IDLE"}
                    </span>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto pt-24 pb-12 px-6 flex flex-col gap-4 scrollbar-hide">
                {localLogs.map((log, i) => {
                    const isLast = i === localLogs.length - 1;
                    const agentName = log.msg.split(':')[0];
                    const cleanMsg = log.msg.includes(':') ? log.msg.split(':').slice(1).join(':').trim() : log.msg;
                    
                    return (
                        <div key={i} className={cn("flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2", !isLast && "opacity-60")}>
                            <div className="mt-1.5 shrink-0">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    log.type === 'orchestrator' ? "bg-primary" : 
                                    log.type === 'agent' ? "bg-amber-500" : 
                                    log.type === 'success' ? "bg-green-500" : "bg-muted-foreground/30"
                                )} />
                            </div>
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] technical-label font-bold uppercase tracking-widest opacity-50">{agentName || log.type}</span>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>
                                <p className="text-[11px] font-medium leading-relaxed text-foreground/80 break-words">{cleanMsg}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={logEndRef} />
             </div>

             <div className="p-4 border-t border-border/50 bg-muted/10 flex items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <span className="text-[7px] technical-label opacity-30 uppercase tracking-[0.4em] font-black">EVENT_ID</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                      <span className="text-[9px] technical-label font-bold text-primary/70 truncate max-w-[140px] lowercase tracking-tighter uppercase">
                          {agentMemory?.active_agents && agentMemory.active_agents.length > 0 ? agentMemory.active_agents[0] : "ENGINE STANDBY"}
                      </span>
                    </div>
                </div>
                 <div className="text-right">
                    <span className="text-[7px] technical-label opacity-30 uppercase tracking-[0.4em] font-black">Orchestration Engine</span>
                    <p className="text-[9px] technical-label font-bold uppercase text-green-600/60 leading-none mt-1">Agent Pipeline</p>
                </div>
             </div>
          </aside>
        </div>
      </div>

      {selectedSceneIndex !== null && dbScenes && (
          <SceneModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            scene={mappedScenes[selectedSceneIndex] as any}
            onUpdate={async (data) => {
                await updateSceneMutation.mutateAsync({ id: dbScenes[selectedSceneIndex].id, updates: data });
            }}
          />
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .technical-label { font-family: var(--font-inter), sans-serif; }
        .shadow-glow { box-shadow: 0 0 20px -5px rgba(var(--primary), 0.3); }
      `}</style>
    </div>
  );
}
