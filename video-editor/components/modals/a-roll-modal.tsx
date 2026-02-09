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
  User,
  Sparkles,
  Scissors, 
  ZoomIn, 
  ZoomOut,
  Save,
  RefreshCw,
  Play,
  Pause,
  Clock,
  Gauge
} from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface ARollModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: Scene;
  onUpdate: (data: Partial<Scene>) => void;
}

export function ARollModal({ isOpen, onClose, scene, onUpdate }: ARollModalProps) {
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(scene.duration);
  const [zoomType, setZoomType] = useState<"in" | "out" | "none">("none");
  const [startZoom, setStartZoom] = useState(1);
  const [endZoom, setEndZoom] = useState(1.3);
  const [centerX, setCenterX] = useState(0.5);
  const [centerY, setCenterY] = useState(0.5);
  const [directorNote, setDirectorNote] = useState(scene.directorNote || "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const aRoll = scene.aRoll;

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevents togglePlayback since it's inside the preview div
    if (!videoRef.current || videoDuration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekTime = (x / rect.width) * videoDuration;
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleSave = () => {
    onUpdate({
      directorNote,
      aRoll: {
        ...scene.aRoll!,
      }
    });
    onClose();
  };

  const leftPanel = (
    <div className="p-6 space-y-6">
      {/* Preview */}
      <div 
        className="aspect-[16/10] bg-muted/10 border border-border rounded-lg flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
        onClick={togglePlayback}
      >
        {(scene.final_video_url || scene.asset_url) ? (
          <video 
            ref={videoRef}
            src={scene.final_video_url || scene.asset_url}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
        ) : (
          <>
            <User className="w-12 h-12 text-muted-foreground/30" />
            <span className="technical-label text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mt-2">
              Avatar Preview
            </span>
          </>
        )}


        {/* Progress Bar (Full Width, pinned to top of control bar or just above) */}
        {(scene.final_video_url || scene.asset_url) && (
          <div 
            className={cn(
              "absolute inset-x-0 bottom-0 h-1.5 bg-white/10 backdrop-blur-sm cursor-range-track z-40 transition-opacity",
              isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            )}
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-primary shadow-glow transition-all duration-100 relative"
              style={{ width: `${(currentTime / (videoDuration || 1)) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-lg pointer-events-none" />
            </div>
          </div>
        )}

        {/* Media Player Control Bar */}
        {(scene.final_video_url || scene.asset_url) && (
          <div className={cn(
            "absolute inset-x-0 bottom-0 py-3 px-4 flex items-center gap-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity z-30",
            isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          )}>
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlayback(); }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/20 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.4)] group/play"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-current transition-transform group-hover/play:scale-110" />
              ) : (
                <Play className="w-5 h-5 text-white fill-current ml-0.5 transition-transform group-hover/play:scale-110" />
              )}
            </button>

            <div className="flex flex-col flex-1 gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                  <span className="text-[10px] font-mono font-bold text-white tracking-tight">
                    {currentTime.toFixed(1)}s
                  </span>
                  <span className="text-[10px] text-white/30">/</span>
                  <span className="text-[10px] font-mono text-white/50">
                    {videoDuration.toFixed(1)}s
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[9px] bg-black/40 backdrop-blur-md border-white/10 text-white font-medium py-1 px-2.5 rounded-full shadow-sm">
                    {aRoll?.cameraAngle}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Play Icon Center Overlay (Only shown when paused and not hovering bar) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl transition-transform group-hover:scale-110">
              <Play className="w-10 h-10 text-white fill-current translate-x-1" />
            </div>
          </div>
        )}
      </div>

      {/* Trim Controls */}
      <div className="space-y-3">
        <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Scissors className="w-3.5 h-3.5" />
          Trim
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground">Start</span>
            <Input 
              type="number" 
              value={trimStart} 
              onChange={(e) => setTrimStart(parseFloat(e.target.value) || 0)}
              className="h-9 text-xs font-mono"
              step={0.1}
              min={0}
            />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground">End</span>
            <Input 
              type="number" 
              value={trimEnd} 
              onChange={(e) => setTrimEnd(parseFloat(e.target.value) || scene.duration)}
              className="h-9 text-xs font-mono"
              step={0.1}
              max={scene.duration * 2}
            />
          </div>
        </div>
      </div>

      {/* Fit to Duration */}
      <div className="space-y-3">
        <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Gauge className="w-3.5 h-3.5" />
          Fit to Duration
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-9 px-3 bg-muted/10 border border-border rounded-md flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Target:</span>
            <span className="text-xs font-mono font-bold">{scene.duration.toFixed(1)}s</span>
          </div>
          <Button variant="outline" size="sm" className="h-9 text-[10px] technical-label">
            <Play className="w-3 h-3 mr-1" /> Apply Fit
          </Button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="space-y-3">
        <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ZoomIn className="w-3.5 h-3.5" />
          Zoom Effect
        </label>
        <div className="flex gap-2">
          {(["none", "in", "out"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setZoomType(type)}
              className={cn(
                "flex-1 h-9 rounded-md border text-[10px] technical-label font-bold uppercase transition-colors",
                zoomType === type 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-muted/10 border-border hover:bg-muted/20"
              )}
            >
              {type === "none" ? "None" : type === "in" ? "Zoom In" : "Zoom Out"}
            </button>
          ))}
        </div>
        
        {zoomType !== "none" && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground">Start Zoom</span>
              <Input 
                type="number" 
                value={startZoom} 
                onChange={(e) => setStartZoom(parseFloat(e.target.value) || 1)}
                className="h-9 text-xs font-mono"
                step={0.1}
                min={1}
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
                min={1}
                max={3}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const rightPanel = (
    <div className="p-6 space-y-6">
      {/* Avatar Settings */}
      <div className="space-y-3">
        <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground">
          Avatar Settings
        </label>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground">Emotion</span>
            <select className="w-full h-9 bg-muted/10 border border-border rounded-md text-xs px-3">
              <option>{aRoll?.emotion || "neutral"}</option>
              <option>enthusiastic</option>
              <option>serious</option>
              <option>friendly</option>
              <option>urgent</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground">Camera Angle</span>
            <select className="w-full h-9 bg-muted/10 border border-border rounded-md text-xs px-3">
              <option>medium-shot</option>
              <option>close-up</option>
              <option>wide-shot</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground">Video Scale (Framing)</span>
            <div className="flex items-center gap-3">
              <Input 
                type="number" 
                value={scene.scale || aRoll?.scale || 1.0} 
                onChange={(e) => onUpdate({ scale: parseFloat(e.target.value) || 1.0 })}
                className="h-9 text-xs font-mono"
                step={0.1}
                min={1.0}
                max={2.0}
              />
              <span className="text-[10px] technical-label font-bold text-muted-foreground whitespace-nowrap">
                {((scene.scale || aRoll?.scale || 1.0) >= 1.5) ? "CLOSE UP" : "MEDIUM"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Script & Director Note */}
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-muted-foreground">
            Script
          </label>
          <div className="p-3 bg-muted/10 border border-border rounded-md min-h-[80px]">
            <p className="text-sm leading-relaxed">{scene.script}</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] technical-label font-bold uppercase tracking-widest text-amber-500/80 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Director's Intent
          </label>
          <Textarea 
            value={directorNote}
            onChange={(e) => setDirectorNote(e.target.value)}
            placeholder="Visual vibe, energy, or specific cinematic instructions..."
            className="min-h-[100px] text-xs italic bg-amber-500/5 border-amber-500/20 focus-visible:border-amber-500/40"
          />
        </div>
      </div>

      {/* Regenerate */}
      <Button variant="outline" className="w-full h-10 text-[10px] technical-label font-bold">
        <RefreshCw className="w-3.5 h-3.5 mr-2" />
        Regenerate Avatar
      </Button>
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
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  A-Roll Editor // Scene {scene.index.toString().padStart(2, '0')}
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/20 rounded-md border border-border/50 text-[10px] technical-label font-black text-blue-400">
                  <Clock className="w-3 h-3" />
                  {(scene.startTime || 0).toFixed(1)}s - {(scene.endTime || 0).toFixed(1)}s
                </div>
              </DialogTitle>
              <DialogDescription className="text-[10px] technical-label opacity-60 uppercase">
                AI Avatar Configuration
              </DialogDescription>
            </div>
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-[9px] technical-label">
              {aRoll?.provider?.toUpperCase() || "HEYGEN"}
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
