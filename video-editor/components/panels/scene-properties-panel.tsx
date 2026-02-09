"use client";

import { Scene, VisualType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Film, 
  Clock, 
  Sparkles, 
  Video,
  Image as ImageIcon,
  Wand2,
  ArrowRight,
  ZoomIn
} from "lucide-react";

interface ScenePropertiesPanelProps {
  scene: Scene | null;
  onUpdate?: (data: Partial<Scene>) => void;
}

// Visual type configuration
const VISUAL_TYPE_CONFIG: Record<VisualType, {
  label: string;
  color: string;
}> = {
  "a-roll": { label: "A-ROLL", color: "text-blue-500 border-blue-500/30" },
  "b-roll": { label: "B-ROLL", color: "text-purple-500 border-purple-500/30" },
  "graphics": { label: "GRAPHICS", color: "text-amber-500 border-amber-500/30" },
  "image": { label: "IMAGE", color: "text-green-500 border-green-500/30" }
};

export function ScenePropertiesPanel({ scene, onUpdate }: ScenePropertiesPanelProps) {
  if (!scene) {
    return (
      <aside className="w-80 h-full border-l border-border bg-card/30 p-6 flex flex-col items-center justify-center text-center shrink-0">
        <div className="w-16 h-16 rounded-lg bg-muted/30 flex items-center justify-center mb-4">
          <Film className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground">Select a scene to view properties</p>
      </aside>
    );
  }

  // Get asset data based on visual type
  const getAssetData = () => {
    switch (scene.visualType) {
      case "a-roll":
        return { provider: scene.aRoll?.provider, status: scene.aRoll?.assetStatus };
      case "b-roll":
        return { provider: scene.bRoll?.provider, status: scene.bRoll?.assetStatus };
      case "graphics":
        return { provider: scene.graphics?.provider, status: scene.graphics?.assetStatus };
      case "image":
        return { provider: scene.image?.provider, status: scene.image?.assetStatus };
      default:
        return { provider: undefined, status: undefined };
    }
  };

  const { provider, status: assetStatus } = getAssetData();
  const typeConfig = VISUAL_TYPE_CONFIG[scene.visualType];

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "ready":
      case "generated":
        return "text-green-500 bg-green-500/10 border-green-500/30";
      case "pending_generation":
        return "text-amber-500 bg-amber-500/10 border-amber-500/30";
      default:
        return "text-muted-foreground bg-muted/10 border-border";
    }
  };

  const getProviderIcon = () => {
    switch (scene.visualType) {
      case "a-roll":
        return <User className="w-3.5 h-3.5" />;
      case "b-roll":
        return <Film className="w-3.5 h-3.5" />;
      case "graphics":
        return <Sparkles className="w-3.5 h-3.5" />;
      case "image":
        return <ImageIcon className="w-3.5 h-3.5" />;
      default:
        return <Video className="w-3.5 h-3.5" />;
    }
  };

  return (
    <aside className="w-80 h-full border-l border-border bg-card/30 flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs technical-label font-bold uppercase tracking-widest text-muted-foreground">
            Scene Properties
          </h3>
          <Badge 
            variant="outline" 
            className={`text-[9px] technical-label ${typeConfig.color}`}
          >
            {typeConfig.label}
          </Badge>
        </div>
        <p className="text-lg font-bold">Scene {scene.index.toString().padStart(2, '0')}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {/* Timing */}
        <div className="space-y-3">
          <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Timing
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground">Start</span>
              <div className="h-9 px-3 bg-muted/20 border border-border rounded-md flex items-center text-xs font-mono">
                {scene.startTime.toFixed(1)}s
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground">End</span>
              <div className="h-9 px-3 bg-muted/20 border border-border rounded-md flex items-center text-xs font-mono">
                {scene.endTime.toFixed(1)}s
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground">Duration</span>
              <div className="h-9 px-3 bg-primary/10 border border-primary/30 rounded-md flex items-center text-xs font-mono text-primary font-bold">
                {scene.duration.toFixed(1)}s
              </div>
            </div>
          </div>
        </div>

        {/* Asset Info */}
        <div className="space-y-3">
          <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Video className="w-3.5 h-3.5" />
            Asset
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/10 border border-border rounded-md">
              <div className="flex items-center gap-2">
                {getProviderIcon()}
                <span className="text-xs font-medium uppercase">{provider || "Unknown"}</span>
              </div>
              <Badge variant="outline" className={`text-[9px] ${getStatusColor(assetStatus)}`}>
                {assetStatus?.replace("_", " ") || "N/A"}
              </Badge>
            </div>

            {/* A-Roll specific info */}
            {scene.visualType === "a-roll" && scene.aRoll && (
              <div className="p-3 bg-muted/5 border border-border rounded-md space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Camera</span>
                  <span className="font-medium uppercase text-[10px]">{scene.aRoll.cameraAngle}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Emotion</span>
                  <span className="font-medium">{scene.aRoll.emotion}</span>
                </div>
              </div>
            )}

            {/* B-Roll specific info */}
            {scene.visualType === "b-roll" && scene.bRoll && (
              <div className="p-3 bg-muted/5 border border-border rounded-md space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium uppercase text-[10px]">{scene.bRoll.type}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Fitting</span>
                  <span className="font-medium">{scene.bRoll.fittingStrategy}</span>
                </div>
                {scene.bRoll.searchQuery && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-[9px] text-muted-foreground block mb-1">Search Query</span>
                    <p className="text-xs text-foreground/80 leading-relaxed">{scene.bRoll.searchQuery}</p>
                  </div>
                )}
              </div>
            )}

            {/* Graphics specific info */}
            {scene.visualType === "graphics" && scene.graphics && (
              <div className="p-3 bg-muted/5 border border-border rounded-md space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium uppercase text-[10px]">{scene.graphics.type}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Fitting</span>
                  <span className="font-medium">{scene.graphics.fittingStrategy}</span>
                </div>
                {scene.graphics.prompt && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-[9px] text-muted-foreground block mb-1">Prompt</span>
                    <p className="text-xs text-foreground/80 leading-relaxed">{scene.graphics.prompt}</p>
                  </div>
                )}
              </div>
            )}

            {/* Image specific info */}
            {scene.visualType === "image" && scene.image && (
              <div className="p-3 bg-muted/5 border border-border rounded-md space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Effect</span>
                  <span className="font-medium uppercase text-[10px]">{scene.image.fittingStrategy}</span>
                </div>
                {scene.image.zoomParams && (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Zoom</span>
                      <span className="font-medium font-mono">
                        {scene.image.zoomParams.startZoom}x → {scene.image.zoomParams.endZoom}x
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Center</span>
                      <span className="font-medium font-mono">
                        ({scene.image.zoomParams.centerX}, {scene.image.zoomParams.centerY})
                      </span>
                    </div>
                  </>
                )}
                {scene.image.searchQuery && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-[9px] text-muted-foreground block mb-1">Search Query</span>
                    <p className="text-xs text-foreground/80 leading-relaxed">{scene.image.searchQuery}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Transition */}
        <div className="space-y-3">
          <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5" />
            Transition
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-9 px-3 bg-muted/20 border border-border rounded-md flex items-center text-xs font-medium uppercase">
              {scene.transition.type}
            </div>
            <div className="h-9 px-3 bg-muted/20 border border-border rounded-md flex items-center text-xs font-mono">
              {scene.transition.duration}s
            </div>
          </div>
        </div>

        {/* Script */}
        <div className="space-y-3">
          <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground">
            Script
          </label>
          <div className="p-3 bg-muted/10 border border-border rounded-md">
            <p className="text-sm leading-relaxed text-foreground/90">{scene.script}</p>
          </div>
          <div className="flex items-center justify-between text-[9px] text-muted-foreground">
            <span>{scene.script.length} chars</span>
            <span>~{Math.ceil(scene.script.split(' ').length / 2.5)}s read time</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
