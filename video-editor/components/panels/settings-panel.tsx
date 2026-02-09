"use client";

import { useState } from "react";
import { 
  Settings, 
  Sparkles, 
  Save, 
  Link as LinkIcon,
  Video,
  Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentMemory } from "@/lib/agents/types";

interface SettingsPanelProps {
  memory: AgentMemory | null;
  onUpdate: (updates: Partial<AgentMemory>) => Promise<any>;
}

export function SettingsPanel({ memory, onUpdate }: SettingsPanelProps) {
  const [lightLeakUrl, setLightLeakUrl] = useState(memory?.metadata?.lightLeakOverlayUrl || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        metadata: {
          ...memory?.metadata,
          lightLeakOverlayUrl: lightLeakUrl
        }
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 pt-24 space-y-8 scrollbar-hide max-w-4xl mx-auto">
      <div className="space-y-1.5 border-b border-border/40 pb-6">
        <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent italic flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          Production Settings
        </h1>
        <p className="text-[9px] technical-label opacity-30 uppercase tracking-[0.3em]">
          Global Configuration & Asset Management
        </p>
      </div>

      <div className="grid gap-6">
        {/* Transition Assets Section */}
        <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Transition Assets</CardTitle>
              </div>
              <Badge variant="outline" className="text-[8px] technical-label font-black opacity-50">VFX_CORE</Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Configure global overlay assets used for high-fidelity transitions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] technical-label font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <LinkIcon className="w-3 h-3" />
                  Global Light Leak Overlay URL
                </label>
                {lightLeakUrl && (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[8px] technical-label">URL_MOUNTED</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Input 
                  value={lightLeakUrl}
                  onChange={(e) => setLightLeakUrl(e.target.value)}
                  placeholder="https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/9255201-hd_1920_1080_24fps.mp4"
                  className="bg-muted/10 border-border/40 text-xs font-mono"
                />
                <Button 
                  onClick={handleSave}
                  disabled={isSaving || lightLeakUrl === (memory?.metadata?.lightLeakOverlayUrl || "")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSaving ? "Saving..." : <Save className="w-4 h-4" />}
                </Button>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-3">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  This URL will be used as the default for all <span className="text-primary font-bold italic">light-leak</span> transitions across the project. 
                  Individual scenes can still override this if specified in their metadata.
                </p>
              </div>
            </div>

            {lightLeakUrl && (
               <div className="pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Video className="w-3 h-3" />
                    <span className="text-[9px] technical-label font-black uppercase tracking-[0.2em]">Asset Preview Signal</span>
                  </div>
                  <div className="aspect-video bg-black/40 rounded-xl border border-border/40 flex items-center justify-center overflow-hidden">
                     <video 
                        src={lightLeakUrl} 
                        className="w-full h-full object-contain" 
                        controls
                        muted
                        onError={() => console.warn("Asset preview unavailable")}
                     />
                  </div>
               </div>
            )}
          </CardContent>
        </Card>

        {/* System Diagnostics (Placeholder for more settings) */}
        <Card className="border-border/40 bg-card/30 backdrop-blur-sm opacity-50 cursor-not-allowed">
          <CardHeader className="pb-4">
             <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Advanced Render Parameters</CardTitle>
              </div>
          </CardHeader>
          <CardContent>
             <p className="text-[10px] text-muted-foreground technical-label italic uppercase tracking-widest text-center py-4">
                Additional production nodes coming soon...
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
