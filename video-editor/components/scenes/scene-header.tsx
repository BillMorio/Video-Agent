"use client";

import { Save, Download, Sparkles, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

interface SceneHeaderProps {
  title: string;
  onSave?: () => void;
  onExport?: () => void;
  onAiSuggest?: () => void;
  onGenerateStoryboard?: () => void;
}

export function SceneHeader({ 
  title, 
  onSave, 
  onExport, 
  onAiSuggest, 
  onGenerateStoryboard 
}: SceneHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
          <LayoutGrid className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground">{title}</h1>
          <p className="text-[10px] technical-label text-muted-foreground uppercase tracking-wider">Video Editor</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onGenerateStoryboard}
          className="technical-label text-[10px] font-bold uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
          Generate
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onAiSuggest}
          className="technical-label text-[10px] font-bold uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
          AI Suggest
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSave}
          className="technical-label text-[10px] font-bold uppercase tracking-wider"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Save
        </Button>
        
        <Button 
          size="sm" 
          onClick={onExport}
          className="technical-label text-[10px] font-bold uppercase tracking-wider"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export
        </Button>
      </div>
    </header>
  );
}
