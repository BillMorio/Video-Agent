"use client";

import { Scissors, Play, Clock, Type, Sparkles, Image as ImageIcon, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Scene, VisualType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CompactSceneCardProps {
  scene: Scene;
  isSelected?: boolean;
  onClick?: () => void;
}

const VISUAL_TYPE_CONFIG: Record<VisualType, {
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  "a-roll": {
    label: "A-ROLL",
    icon: Type,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  },
  "b-roll": {
    label: "B-ROLL",
    icon: Video,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30"
  },
  "graphics": {
    label: "GRAPHICS",
    icon: Sparkles,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30"
  },
  "image": {
    label: "IMAGE",
    icon: ImageIcon,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30"
  }
};

export function CompactSceneCard({ 
  scene,
  isSelected, 
  onClick
}: CompactSceneCardProps) {
  const visualType = (scene.visual_type || scene.visualType || "b-roll") as VisualType;
  const config = VISUAL_TYPE_CONFIG[visualType] || VISUAL_TYPE_CONFIG["b-roll"];

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
        isSelected 
          ? "bg-primary/10 border-primary shadow-glow shadow-primary/10" 
          : "bg-card/40 border-border/40 hover:border-border/60 hover:bg-card/60"
      )}
    >
      {/* Index */}
      <div className="flex-shrink-0 w-8 flex flex-col items-start">
        <span className="text-[10px] font-black technical-label opacity-20 italic">#{scene.index?.toString().padStart(2, '0')}</span>
      </div>

      {/* Visual Type Icon */}
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center border",
        config.bgColor,
        config.borderColor,
        config.color
      )}>
        <config.icon className="w-5 h-5" />
      </div>

      {/* Info Core */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={cn("text-[8px] technical-label font-black px-1.5 py-0 h-4 border-none", config.bgColor, config.color)}>
            {config.label}
          </Badge>
          <div className="flex items-center gap-1.5 text-muted-foreground/40">
             <Clock className="w-3 h-3" />
             <span className="text-[9px] technical-label font-bold">{(scene.duration || 0).toFixed(1)}s</span>
          </div>
        </div>
        <p className="text-[11px] font-semibold text-foreground/80 truncate italic">
          {scene.script || "No script segment defined."}
        </p>
      </div>

      {/* Transition Tag */}
      <div className="flex flex-col items-end gap-1.5 ml-2">
         <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/20 border border-border/40 text-[8px] technical-label font-bold text-muted-foreground/60 uppercase">
            <Play className="w-2.5 h-2.5" />
            {scene.transition?.type || "None"}
         </div>
         {scene.fitting_strategy && (
           <span className="text-[7px] technical-label opacity-25 uppercase tracking-tighter">{scene.fitting_strategy}</span>
         )}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-0 right-0 p-1 opacity-20">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
      )}
    </div>
  );
}
