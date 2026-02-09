"use client";

import { Scissors, Play, Plus, User, Film, Sparkles, Image as ImageIcon, Camera, Aperture, Activity, Loader2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scene, VisualType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SceneCardProps {
  scene: Scene;
  isSelected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

// Visual type configuration
const VISUAL_TYPE_CONFIG: Record<VisualType, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  "a-roll": {
    label: "A-ROLL",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  },
  "b-roll": {
    label: "B-ROLL",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30"
  },
  "graphics": {
    label: "GRAPHICS",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30"
  },
  "image": {
    label: "IMAGE",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30"
  }
};

export function SceneCard({ 
  scene,
  isSelected, 
  onClick,
  onDoubleClick
}: SceneCardProps) {
  const visualType = scene.visual_type || scene.visualType || "b-roll";

  // Get asset data based on visual type
  const getAssetData = () => {
    switch (visualType) {
      case "a-roll":
        return { provider: scene.payload?.provider, status: scene.payload?.assetStatus };
      case "b-roll":
        return { provider: scene.payload?.provider, status: scene.payload?.assetStatus };
      case "graphics":
        return { provider: scene.payload?.provider, status: scene.payload?.assetStatus };
      case "image":
        return { provider: scene.payload?.provider, status: scene.payload?.assetStatus };
      default:
        return { provider: undefined, status: undefined };
    }
  };

  const { provider, status: assetStatus } = getAssetData();
  const typeConfig = VISUAL_TYPE_CONFIG[visualType] || VISUAL_TYPE_CONFIG["b-roll"];

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "ready":
      case "generated":
        return "bg-green-500";
      case "pending_generation":
        return "bg-amber-500";
      default:
        return "bg-muted-foreground";
    }
  };

  const getProviderIcon = () => {
    switch (visualType) {
      case "a-roll":
        return <User className="w-3 h-3" />;
      case "b-roll":
        return <Film className="w-3 h-3" />;
      case "graphics":
        return <Sparkles className="w-3 h-3" />;
      case "image":
        return <ImageIcon className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Get fitting strategy label
  const getFittingLabel = () => {
    return scene.fitting_strategy;
  };

  const isProcessing = scene.status === 'processing';

  return (
    <Card 
      className={cn(
        "glass-premium-v2 overflow-hidden group transition-all duration-700 cursor-pointer rounded-2xl relative border border-border/40",
        isSelected 
          ? "ring-2 ring-primary/40 bg-card/90 border-primary/60 shadow-glow-sm" 
          : "hover:scale-[1.015] hover:border-primary/20",
        isProcessing && "ring-2 ring-amber-500/50 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Selection Glow / Accent - Highly subtle top line */}
      {isSelected && (
        <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent z-30" />
      )}

      <div className="aspect-video bg-muted/5 relative flex items-center justify-center overflow-hidden rounded-t-2xl">
        {/* Thumbnail Background */}
        {(scene.thumbnail_url || (visualType === 'image' && scene.asset_url)) && (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ backgroundImage: `url(${scene.thumbnail_url || scene.asset_url})` }}
          />
        )}
        {/* Modern Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 group-hover:from-black/20 group-hover:to-black/40 transition-colors" />

        {/* Top left - Scene number badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[9px] technical-label font-black tracking-widest px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm border-white/10",
              isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-black/40 text-white/70"
            )}
          >
            {scene.index.toString().padStart(2, '0')}
          </Badge>
        </div>

        {/* Top right - Visual type badge + Status */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[8px] technical-label font-black tracking-widest px-2 py-1 rounded-lg backdrop-blur-md shadow-sm",
              typeConfig.color,
              typeConfig.borderColor,
              typeConfig.bgColor
            )}
          >
            {typeConfig.label}
          </Badge>
          <div className={cn(
            "w-2.5 h-2.5 rounded-full ring-2 ring-black/20 shadow-glow-sm", 
            getStatusColor(assetStatus)
          )} />
        </div>
        
        {/* Center UI - Provider indicator */}
        <div className="flex flex-col items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 relative z-10">
          <div className={cn(
            "w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl",
            typeConfig.bgColor
          )}>
            {getProviderIcon() || <Plus className="w-6 h-6" />}
          </div>
          <span className="technical-label text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-sm">
            {provider?.toUpperCase() || "NO ASSET"}
          </span>
        </div>
        
        {/* Bottom overlay with timing */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[9px] technical-label font-bold text-white shadow-sm">
                <Scissors className="w-3.5 h-3.5 text-blue-400" /> 
                {(scene.duration || 0).toFixed(1)}s
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[9px] technical-label font-bold text-white shadow-sm">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> 
                {(scene.start_time ?? scene.startTime ?? 0).toFixed(1)}s - {(scene.end_time ?? scene.endTime ?? 0).toFixed(1)}s
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[9px] technical-label font-bold text-white shadow-sm">
                <Play className="w-3.5 h-3.5 text-primary" /> 
                {scene.transition?.type?.toUpperCase() || "NONE"}
              </div>
              {(visualType === 'a-roll' || scene.scale) && (
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[9px] technical-label font-bold text-white shadow-sm">
                  <Aperture className="w-3.5 h-3.5 text-primary" /> 
                  Scale: {(scene.scale || scene.aRoll?.scale || 1.0).toFixed(1)}x
                </div>
              )}
            </div>
            {getFittingLabel() && getFittingLabel() !== "none" && (
              <Badge variant="outline" className="text-[8px] opacity-80 py-0.5 px-2 bg-black/20 backdrop-blur-sm border-white/5 rounded-md self-end">
                {getFittingLabel()?.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
        </div>

        {/* --- SIMPLIFIED PROCESSING OVERLAY (CLIENT DEMO) --- */}
        {isProcessing && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] technical-label font-bold text-white/90 tracking-[0.2em] uppercase animate-pulse">
                  System_Processing
                </span>
                <span className="text-[8px] technical-label font-medium text-white/40 uppercase tracking-widest">
                  Analyzing Scene Content
                </span>
              </div>
            </div>

            {/* Subtle Minimalist Indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2 px-2 py-0.5 bg-primary/10 rounded-md border border-primary/20">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[7px] font-black tracking-widest text-primary uppercase">ACTIVE</span>
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-5 bg-card/40 backdrop-blur-sm space-y-4">
        <p className={cn(
          "text-[13px] line-clamp-2 leading-relaxed font-semibold tracking-tight transition-colors",
          isSelected ? "text-foreground" : "text-foreground/80"
        )}>
          {scene.script}
        </p>
        
        {scene.directorNote && (
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 space-y-2 group/note relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 opacity-20 transform translate-x-1 -translate-y-1">
              <Sparkles className="w-8 h-8 text-primary/20" />
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary/60" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 leading-none">Director's Intent</span>
            </div>
            <p className="text-[11px] text-muted-foreground/90 italic leading-snug line-clamp-3 font-medium">
              {scene.directorNote}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
