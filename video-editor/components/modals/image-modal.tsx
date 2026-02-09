"use client";

import { Scene } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TwoColumnLayout } from "@/components/ui/resizable-panel-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Image as ImageIcon,
  ZoomIn,
  Save,
  Search,
  Upload,
  Sparkles,
  Wand2,
  Target,
  Play,
  Video,
  Clock
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: Scene;
  onUpdate: (data: Partial<Scene>) => void;
}

export function ImageModal({ isOpen, onClose, scene, onUpdate }: ImageModalProps) {
  const [zoomType, setZoomType] = useState<"zoom-in" | "zoom-out" | "pan" | "static">(
    (scene.image?.fittingStrategy as any) || "zoom-in"
  );
  const [startZoom, setStartZoom] = useState(scene.image?.zoomParams?.startZoom || 1);
  const [endZoom, setEndZoom] = useState(scene.image?.zoomParams?.endZoom || 1.3);
  const [centerX, setCenterX] = useState(scene.image?.zoomParams?.centerX || 0.5);
  const [centerY, setCenterY] = useState(scene.image?.zoomParams?.centerY || 0.5);
  const [searchQuery, setSearchQuery] = useState(scene.image?.searchQuery || "");
  const [aiPrompt, setAiPrompt] = useState("");
  const [directorNote, setDirectorNote] = useState(scene.directorNote || "");

  const image = scene.image;

  const handleSave = () => {
    onUpdate({
      directorNote,
      image: {
        ...scene.image!,
        fittingStrategy: zoomType,
        zoomParams: {
          startZoom,
          endZoom,
          centerX,
          centerY
        }
      }
    });
    onClose();
  };

  const leftPanel = (
    <div className="p-6 space-y-6">
      {/* Preview with click-to-set center */}
      <div className="space-y-2">
        <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Target className="w-3.5 h-3.5" />
          Image Preview (Click to set zoom center)
        </label>
        <div
          className="aspect-[16/10] bg-muted/10 border border-border rounded-lg flex flex-col items-center justify-center relative overflow-hidden cursor-crosshair"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            setCenterX(Math.round(x * 100) / 100);
            setCenterY(Math.round(y * 100) / 100);
          }}
        >
          {scene.asset_url ? (
            <img 
              src={scene.asset_url}
              className="absolute inset-0 w-full h-full object-cover"
              alt="Source"
            />
          ) : (
            <>
              <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
              <span className="technical-label text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mt-2">
                Click to set zoom center
              </span>
            </>
          )}

          {/* Zoom center indicator */}
          <div
            className="absolute w-4 h-4 border-2 border-primary rounded-full bg-primary/20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
            style={{ left: `${centerX * 100}%`, top: `${centerY * 100}%` }}
          />

          <div className="absolute bottom-3 left-3 flex gap-2">
            <Badge variant="outline" className="text-[8px] bg-background/60">{scene.duration.toFixed(1)}s</Badge>
            <Badge variant="outline" className="text-[8px] bg-background/60">
              Center: ({centerX.toFixed(2)}, {centerY.toFixed(2)})
            </Badge>
          </div>
        </div>
      </div>

      {/* Ken Burns Controls */}
      <div className="space-y-3">
        <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ZoomIn className="w-3.5 h-3.5" />
          Ken Burns Effect
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(["zoom-in", "zoom-out", "pan", "static"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setZoomType(type)}
              className={cn(
                "h-9 rounded-md border text-[9px] technical-label font-bold uppercase transition-colors",
                zoomType === type
                  ? "bg-green-500/10 text-green-500 border-green-500/30"
                  : "bg-muted/10 border-border hover:bg-muted/20"
              )}
            >
              {type.replace("-", " ")}
            </button>
          ))}
        </div>
        
        {zoomType !== "static" && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground">Start Zoom</span>
              <Input 
                type="number" 
                value={startZoom} 
                onChange={(e) => setStartZoom(parseFloat(e.target.value) || 1)}
                className="h-9 text-xs font-mono"
                step={0.1}
                min={0.5}
                max={3}
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground">End Zoom</span>
              <Input 
                type="number" 
                value={endZoom} 
                onChange={(e) => setEndZoom(parseFloat(e.target.value) || 1.3)}
                className="h-9 text-xs font-mono"
                step={0.1}
                min={0.5}
                max={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Script & Director Note */}
      <div className="space-y-4">
        <div className="p-4 bg-muted/5 border border-border rounded-xl space-y-3">
          <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground">
            Script Context
          </label>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {scene.script}
          </p>
        </div>

        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
          <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-amber-500/80 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Director's Intent
          </label>
          <Textarea 
            value={directorNote}
            onChange={(e) => setDirectorNote(e.target.value)}
            placeholder="Visual vibe, energy, or specific cinematic instructions..."
            className="min-h-[100px] text-xs italic bg-transparent border-none focus-visible:ring-0 p-0 shadow-none"
          />
        </div>
      </div>
    </div>
  );

  const rightPanel = (
    <div className="p-6 space-y-6">
      {/* Search */}
      <div className="space-y-3">
        <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Search className="w-3.5 h-3.5" />
          Search Images
        </label>
        <div className="flex gap-2">
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Pexels/Unsplash..."
            className="h-9 text-xs"
          />
          <Button variant="outline" size="sm" className="h-9 px-4">
            <Search className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Search Results */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i}
            className="aspect-square bg-muted/10 border border-border rounded-md flex items-center justify-center hover:border-primary/50 cursor-pointer transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-muted-foreground/20" />
          </div>
        ))}
      </div>

      {/* Upload */}
      <div className="space-y-3">
        <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Upload className="w-3.5 h-3.5" />
          Upload Image
        </label>
        <div className="aspect-video bg-muted/10 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
          <Upload className="w-6 h-6 text-muted-foreground/30" />
          <span className="text-[10px] text-muted-foreground mt-2">Drop image or click to upload</span>
        </div>
      </div>

      {/* AI Generation */}
      <div className="space-y-3 pt-4 border-t border-border">
        <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          AI Image Generation
        </label>
        <textarea 
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="w-full h-20 p-3 bg-muted/10 border border-border rounded-md text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-9 text-[10px] technical-label font-bold">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Generate
          </Button>
          <Button variant="outline" className="h-9 text-[10px] technical-label font-bold">
            <Wand2 className="w-3.5 h-3.5 mr-1" />
            Edit with AI
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border border-border dark:border-2 dark:border-border/80 shadow-2xl h-[85vh] flex flex-col" style={{ backgroundColor: 'hsl(var(--background))', opacity: 1 }}>
        <DialogHeader className="p-6 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="technical-label text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Image Editor // Scene {scene.index.toString().padStart(2, '0')}
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/20 rounded-md border border-border/50 text-[10px] technical-label font-black text-green-500">
                  <Clock className="w-3 h-3" />
                  {(scene.startTime || 0).toFixed(1)}s - {(scene.endTime || 0).toFixed(1)}s
                </div>
              </DialogTitle>
              <DialogDescription className="text-[10px] technical-label opacity-60 uppercase">
                Ken Burns & Image Configuration
              </DialogDescription>
            </div>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/30 text-[9px] technical-label">
              {image?.provider?.toUpperCase() || "IMAGE"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <TwoColumnLayout 
            leftPanel={leftPanel}
            rightPanel={rightPanel}
          />
        </div>

        <DialogFooter className="p-4 border-t border-border bg-background/50 flex items-center justify-end gap-3 shrink-0">
          <Button variant="ghost" onClick={onClose} className="technical-label text-[10px] font-bold uppercase">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground technical-label text-[10px] font-bold uppercase px-6">
            <Save className="w-3.5 h-3.5 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
