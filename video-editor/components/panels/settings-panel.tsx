import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

import { 
  Settings, 
  Sparkles, 
  Save, 
  Link as LinkIcon,
  Video,
  Info,
  Type,
  Key,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AgentMemory } from "@/lib/agents/types";

interface SettingsPanelProps {
  memory: AgentMemory | null;
  onUpdate: (updates: Partial<AgentMemory>) => Promise<any>;
}

export function SettingsPanel({ memory, onUpdate }: SettingsPanelProps) {
  const [lightLeakUrl, setLightLeakUrl] = useState(memory?.metadata?.lightLeakOverlayUrl || "");
  const [transcriptPrompt, setTranscriptPrompt] = useState(memory?.metadata?.config?.transcript_to_scenes_prompt || "");
  const [imagePrompt, setImagePrompt] = useState(memory?.metadata?.config?.image_gen_prompt_engineer_prompt || "");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(memory?.metadata?.config?.api_keys || {
    WAVESPEED_API_KEY: "",
    HEY_GEN_API: "",
    ANTHROPIC_API: "",
    PEXELS_API_KEY: "",
    ELEVENLABS_API_KEY: "",
    OPENAI_API_KEY: "",
    FFMPEG_SERVER_URL: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [systemDefaults, setSystemDefaults] = useState<any>(null);

  // Sync state when memory is loaded or changed
  useEffect(() => {
    if (memory?.metadata) {
      if (memory.metadata.lightLeakOverlayUrl !== undefined) {
        setLightLeakUrl(memory.metadata.lightLeakOverlayUrl || "");
      }
      
      const config = memory.metadata.config;
      if (config) {
        if (config.transcript_to_scenes_prompt !== undefined) {
          setTranscriptPrompt(config.transcript_to_scenes_prompt || "");
        }
        if (config.image_gen_prompt_engineer_prompt !== undefined) {
          setImagePrompt(config.image_gen_prompt_engineer_prompt || "");
        }
        if (config.api_keys) {
          setApiKeys(prev => ({ ...prev, ...config.api_keys }));
        }
      }
    }
  }, [memory?.project_id, memory?.metadata]);

  // Fetch defaults and only apply if state is still blank
  useEffect(() => {
    async function fetchDefaults() {
        try {
            const res = await fetch('/api/system/config');
            const data = await res.json();
            setSystemDefaults(data);
            
            // Only pre-fill defaults if we have absolutely nothing in state 
            // AND we've already tried syncing with memory (memory loaded or not)
            setTranscriptPrompt(prev => {
                if (prev) return prev;
                // If memory is still loading, we might want to wait, but for now we fallback
                return data.prompts?.transcript_to_scenes || "";
            });

            setImagePrompt(prev => {
                if (prev) return prev;
                return data.prompts?.visual_prompt_engineer || "";
            });

            if (!apiKeys.FFMPEG_SERVER_URL && data.apiKeys?.FFMPEG_SERVER_URL) {
                setApiKeys(prev => ({ ...prev, FFMPEG_SERVER_URL: data.apiKeys.FFMPEG_SERVER_URL }));
            }
        } catch (e) {
            console.error("Failed to fetch system defaults:", e);
        }
    }
    fetchDefaults();
  }, [systemDefaults === null]);

  const handleApiKeyChange = (key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        metadata: {
          ...memory?.metadata,
          lightLeakOverlayUrl: lightLeakUrl,
          config: {
            transcript_to_scenes_prompt: transcriptPrompt,
            image_gen_prompt_engineer_prompt: imagePrompt,
            api_keys: apiKeys
          }
        }
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const isChanged = 
    lightLeakUrl !== (memory?.metadata?.lightLeakOverlayUrl || "") ||
    transcriptPrompt !== (memory?.metadata?.config?.transcript_to_scenes_prompt || "") ||
    imagePrompt !== (memory?.metadata?.config?.image_gen_prompt_engineer_prompt || "") ||
    JSON.stringify(apiKeys) !== JSON.stringify(memory?.metadata?.config?.api_keys || {
        WAVESPEED_API_KEY: "",
        HEY_GEN_API: "",
        ANTHROPIC_API: "",
        PEXELS_API_KEY: "",
        ELEVENLABS_API_KEY: "",
        OPENAI_API_KEY: "",
        FFMPEG_SERVER_URL: ""
    });

  return (
    <div className="flex-1 overflow-y-auto p-8 pt-24 pb-32 space-y-8 scrollbar-hide max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-border/40 pb-6">
        <div className="space-y-1.5">
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent italic flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" />
            Production Node Configuration
            </h1>
            <p className="text-[9px] technical-label opacity-30 uppercase tracking-[0.3em]">
            Global Orchestration & Pipeline Intelligence
            </p>
        </div>
        <Button 
            onClick={handleSave}
            disabled={isSaving || !isChanged}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-8"
        >
            {isSaving ? "Syncing..." : <><Save className="w-4 h-4 mr-2" /> Commit Changes</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* System Prompts Section */}
            <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl">
                <CardHeader className="pb-4 border-b border-border/10 bg-muted/5">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">System Prompts</CardTitle>
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] technical-label">LLM_REASONING</Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                    Control the core logic used by the orchestrator to process your content.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                    {/* Transcript to Scenes */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] technical-label font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Type className="w-3.5 h-3.5" />
                            Transcript to Scenes System Prompt
                            </label>
                            {transcriptPrompt ? <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[8px] technical-label italic">CUSTOM_ACTIVE</Badge> : <span className="text-[10px] technical-label opacity-30 italic">Using System Default</span>}
                        </div>
                        <Textarea 
                            value={transcriptPrompt}
                            onChange={(e) => setTranscriptPrompt(e.target.value)}
                            placeholder="Describe how the transcript should be segmented into scenes..."
                            className="min-h-[200px] bg-muted/10 border-border/40 text-xs font-mono leading-relaxed"
                        />
                         <div className="p-3 bg-muted/10 rounded-lg border border-border/10">
                            <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic">
                                Leave blank to use the factory default optimized for sequential continuity and 1:1 narrative precision.
                            </p>
                        </div>
                    </div>

                    {/* Image Gen Prompt Engineer */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] technical-label font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            Visual Prompt Engineer Prompt
                            </label>
                            {imagePrompt ? <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[8px] technical-label italic">CUSTOM_ACTIVE</Badge> : <span className="text-[10px] technical-label opacity-30 italic">Using System Default</span>}
                        </div>
                        <Textarea 
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder="The instructions for Claude on how to generate the actual image prompts..."
                            className="min-h-[150px] bg-muted/10 border-border/40 text-xs font-mono leading-relaxed"
                        />
                         <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Info className="w-4 h-4 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-primary italic uppercase tracking-wider">The "Prompt for a Prompt"</p>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    This isn't an image prompt. It's the **blueprint** telling the Image Agent how to write prompts. Use this to enforce styles like "cinematic 4k", "glassmorphism", or "dark corporate tech".
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* API Keys Section */}
            <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl">
                <CardHeader className="pb-4 border-b border-border/10 bg-muted/5">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">API Management</CardTitle>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] technical-label">AUTH_GATEWAY</Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                    Project-level overrides for external service credentials.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/10">
                        {Object.entries(apiKeys).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-6 p-4 hover:bg-muted/5 transition-colors">
                                <div className="w-48 shrink-0">
                                    <span className="text-[10px] technical-label font-bold text-muted-foreground tracking-tighter">{key}</span>
                                </div>
                                <div className="flex-1 relative group">
                                    <Input 
                                        type="password"
                                        value={value}
                                        onChange={(e) => handleApiKeyChange(key, e.target.value)}
                                        placeholder="Using .env variable"
                                        className="bg-transparent border-none focus-visible:ring-0 text-xs font-mono h-8 p-0"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-px bg-border/20 group-hover:bg-primary/30 transition-colors" />
                                </div>
                                <div className="w-24 flex justify-end">
                                    {value ? (
                                        <div className="flex items-center gap-1.5 text-green-500">
                                            <ShieldCheck className="w-3 h-3" />
                                            <span className="text-[8px] technical-label font-black uppercase">Active</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-muted-foreground/30">
                                            <div className="w-1 h-1 rounded-full bg-current" />
                                            <span className="text-[8px] technical-label font-black uppercase">Inherited</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 bg-muted/5 border-t border-border/10">
                         <div className="p-4 bg-muted/10 rounded-xl border border-border/10 flex items-start gap-4">
                            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Keys entered here are stored in the <span className="font-bold underline">Project Memory</span>. If left empty, the engine will safely fallback to the server-side environment variables defined in <code className="bg-black/20 px-1.5 py-0.5 rounded text-primary">.env.local</code>.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            {/* Global Assets Section */}
            <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl">
                <CardHeader className="pb-4 border-b border-border/10 bg-muted/5">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Production Overlays</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] technical-label font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <LinkIcon className="w-3 h-3" />
                            Light Leak Overlay URL
                        </label>
                        {lightLeakUrl && (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[8px] technical-label">MOUNTED</Badge>
                        )}
                    </div>
                    <Input 
                        value={lightLeakUrl}
                        onChange={(e) => setLightLeakUrl(e.target.value)}
                        placeholder="https://..."
                        className="bg-muted/10 border-border/40 text-xs font-mono"
                    />
                    {lightLeakUrl && (
                        <div className="aspect-video bg-black/40 rounded-xl border border-border/40 flex items-center justify-center overflow-hidden group relative">
                            <video 
                                src={lightLeakUrl} 
                                className="w-full h-full object-contain" 
                                autoPlay
                                muted
                                loop
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <span className="text-[8px] technical-label font-bold uppercase tracking-widest">Live Stream Preview</span>
                            </div>
                        </div>
                    )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions / Info */}
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Info className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-foreground/80 italic">Engine Diagnostics</span>
                </div>
                <div className="space-y-3">
                    {[
                        { label: "Pipeline Status", value: "Optimal", color: "text-green-500" },
                        { label: "Active Project", value: memory?.project_name || "Unknown", color: "text-primary" },
                        { label: "Memory Version", value: "v2.4.0-agentic", color: "text-muted-foreground" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-border/10 pb-2 last:border-0">
                            <span className="text-[10px] technical-label opacity-40 uppercase tracking-widest">{item.label}</span>
                            <span className={cn("text-[10px] technical-label font-bold uppercase", item.color)}>{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
