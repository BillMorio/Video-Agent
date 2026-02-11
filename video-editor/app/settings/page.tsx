"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Key, 
  Zap, 
  Database, 
  ArrowLeft, 
  Loader2, 
  PanelLeft,
  Terminal,
  Cpu,
  FileCode,
  Image as ImageIcon,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { NavSidebar } from "@/components/panels/nav-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Category = "api" | "prompts" | "assets";

export default function SettingsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("api");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        showToast('Failed to load settings', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (key: string, value: string, category: string, isEncrypted: boolean = true) => {
    setIsSaving(key);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, category, is_encrypted: isEncrypted })
      });

      const data = await response.json();
      if (data.success) {
        showToast('Setting saved successfully');
        setSettings(prev => ({ ...prev, [key]: value }));
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error: any) {
      console.error('Failed to save setting:', error);
      showToast(error.message || 'Failed to save setting', 'error');
    } finally {
      setIsSaving(null);
    }
  };

  const categories = [
    { id: "api", label: "APIs & Keys", icon: Key, sub: "External Integrations" },
    { id: "prompts", label: "System Prompts", icon: Terminal, sub: "AI Agent Calibration" },
    { id: "assets", label: "Global Assets", icon: Video, sub: "Overlay & Media Config" },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans relative">
      <NavSidebar
        activeItem="settings"
        isCollapsed={isSidebarCollapsed}
        onItemClick={(id) => id === "studio" ? router.push("/") : null}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-border/40 glass-premium-v2 sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={cn(
                "p-2.5 rounded-xl border transition-all flex items-center justify-center hover:scale-105 active:scale-95",
                isSidebarCollapsed
                  ? "bg-primary text-primary-foreground border-primary shadow-glow shadow-primary/20"
                  : "bg-muted/40 border-border/60 text-foreground hover:bg-muted/60"
              )}
            >
              <PanelLeft className={cn("w-5 h-5 transition-transform", isSidebarCollapsed && "rotate-180")} />
            </button>
            <div className="w-px h-6 bg-border/40 mx-1" />
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Settings className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-foreground tracking-tight">System Settings</h1>
                <p className="text-[9px] technical-label text-muted-foreground uppercase tracking-[0.2em] opacity-40">Configuration Nodes</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <ThemeToggle />
             <Badge variant="outline" className="text-[9px] technical-label font-bold py-1 px-3">NODE_SYNC: ACTIVE</Badge>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Sub-Navigation Sidebar */}
          <aside className="w-64 border-r border-border/40 bg-muted/5 p-6 flex flex-col gap-2">
            <h2 className="text-[10px] technical-label opacity-40 uppercase tracking-[0.2em] mb-4 px-2">Categories</h2>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as Category)}
                className={cn(
                  "flex flex-col items-start gap-1 px-4 py-3 rounded-xl transition-all border text-left",
                  activeCategory === cat.id
                    ? "bg-primary/5 border-primary/20 text-primary shadow-glow-sm"
                    : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <cat.icon className={cn("w-4 h-4", activeCategory === cat.id ? "text-primary" : "text-muted-foreground/40")} />
                  <span className="text-[11px] font-bold tracking-tight uppercase">{cat.label}</span>
                </div>
                <span className="text-[7px] technical-label opacity-40 font-black uppercase tracking-widest pl-7">{cat.sub}</span>
              </button>
            ))}
          </aside>

          {/* Settings Content Area */}
          <main className="flex-1 overflow-y-auto p-12 scrollbar-hide">
            <div className="max-w-3xl space-y-12">
              {activeCategory === "api" && (
                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black tracking-tight italic">API & Integration Keys</h2>
                    <p className="text-xs text-muted-foreground opacity-60">Authentication keys for external production services.</p>
                  </div>
                  
                  <div className="grid gap-6">
                    <SettingField 
                      id="anthropic_api_key"
                      label="Anthropic API Key"
                      description="Used for Claude 3.5 Sonnet scene orchestration and transcript analysis."
                      value={settings.anthropic_api_key || ""}
                      isSaving={isSaving === "anthropic_api_key"}
                      onSave={(val) => handleSave("anthropic_api_key", val, "api_key", true)}
                      type="password"
                      placeholder="sk-ant-..."
                    />
                    <SettingField 
                      id="heygen_api_key"
                      label="HeyGen API Key"
                      description="Integration for AI Avatar video generation and photo-avatar creation."
                      value={settings.heygen_api_key || ""}
                      isSaving={isSaving === "heygen_api_key"}
                      onSave={(val) => handleSave("heygen_api_key", val, "api_key", true)}
                      type="password"
                      placeholder="hg-..."
                    />
                    <SettingField 
                      id="pexels_api_key"
                      label="Pexels API Key"
                      description="Access key for high-quality stock footage retrieval."
                      value={settings.pexels_api_key || ""}
                      isSaving={isSaving === "pexels_api_key"}
                      onSave={(val) => handleSave("pexels_api_key", val, "api_key", true)}
                      type="password"
                    />
                  </div>
                </section>
              )}

              {activeCategory === "prompts" && (
                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black tracking-tight italic">AI System Prompts</h2>
                    <p className="text-xs text-muted-foreground opacity-60">Configure the personality and logic of your production agents.</p>
                  </div>
                  
                  <div className="grid gap-6">
                    <SettingField 
                      id="prompt_script_to_scene"
                      label="Script to Scene Orchestrator"
                      description="The core prompt used to divide a raw script into structured A-Roll and B-Roll scenes."
                      value={settings.prompt_script_to_scene || ""}
                      isSaving={isSaving === "prompt_script_to_scene"}
                      onSave={(val) => handleSave("prompt_script_to_scene", val, "system_prompt", false)}
                      isTextarea
                      rows={10}
                    />
                    <SettingField 
                      id="prompt_image_agent"
                      label="Image Agent Internal Prompt"
                      description="The prompt generator logic used by the Image Agent to create high-fidelity DALL-E or Midjourney style prompts."
                      value={settings.prompt_image_agent || ""}
                      isSaving={isSaving === "prompt_image_agent"}
                      onSave={(val) => handleSave("prompt_image_agent", val, "system_prompt", false)}
                      isTextarea
                      rows={8}
                    />
                  </div>
                </section>
              )}

              {activeCategory === "assets" && (
                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black tracking-tight italic">Global Production Assets</h2>
                    <p className="text-xs text-muted-foreground opacity-60">Public URLs for overlays, LUTs, and shared media assets.</p>
                  </div>
                  
                  <div className="grid gap-6">
                    <SettingField 
                      id="asset_lightleak_overlay"
                      label="Light-Leak Overlay Video"
                      description="The public Supabase or CDN URL for the video file used in batch light-leak transitions."
                      value={settings.asset_lightleak_overlay || ""}
                      isSaving={isSaving === "asset_lightleak_overlay"}
                      onSave={(val) => handleSave("asset_lightleak_overlay", val, "asset", false)}
                      placeholder="https://..."
                    />
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={cn(
          "fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right-10 duration-500 flex items-center gap-3",
          toast.type === "success" 
            ? "bg-green-500/10 border-green-500/30 text-green-500" 
            : "bg-destructive/10 border-destructive/30 text-destructive"
        )}>
          <div className={cn("w-2 h-2 rounded-full", toast.type === "success" ? "bg-green-500" : "bg-destructive")} />
          <span className="text-[10px] technical-label font-bold uppercase tracking-wider">{toast.message}</span>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .technical-label { font-family: var(--font-inter), sans-serif; }
        .shadow-glow { box-shadow: 0 0 20px -5px rgba(var(--primary), 0.3); }
        .shadow-glow-sm { box-shadow: 0 0 12px -3px rgba(var(--primary), 0.2); }
        .glass-premium-v2 {
          background: rgba(var(--background-rgb), 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(var(--border-rgb), 0.1);
        }
      `}</style>
    </div>
  );
}

interface SettingFieldProps {
  id: string;
  label: string;
  description: string;
  value: string;
  onSave: (value: string) => void;
  isSaving?: boolean;
  type?: string;
  placeholder?: string;
  isTextarea?: boolean;
  rows?: number;
}

function SettingField({ 
  id, 
  label, 
  description, 
  value, 
  onSave, 
  isSaving, 
  type = "text", 
  placeholder,
  isTextarea = false,
  rows = 4
}: SettingFieldProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="space-y-4 p-6 rounded-2xl border border-border/40 bg-muted/5 group hover:border-primary/20 transition-colors">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <Label htmlFor={id} className="text-[10px] technical-label font-black uppercase tracking-[0.2em] opacity-60">
            {label}
          </Label>
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed max-w-md">{description}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="technical-label text-[10px] font-black uppercase tracking-widest px-6 h-9 group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0"
          onClick={() => onSave(localValue)}
          disabled={isSaving || localValue === value}
        >
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'SAVE CHANGES'}
        </Button>
      </div>
      
      {isTextarea ? (
        <Textarea
          id={id}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="font-mono text-xs bg-background/50 border-border/20 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="font-mono text-xs bg-background/50 border-border/20 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
