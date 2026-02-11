"use client";

import { useState, useEffect } from "react";
import { Settings, Key, Zap, Database, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState({
    anthropic_api_key: "",
    wavespeed_api_key: "",
    heygen_api_key: "",
    pexels_api_key: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load settings from database on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (data.settings) {
          // Ensure all keys have default empty string values
          setApiKeys({
            anthropic_api_key: data.settings.anthropic_api_key || "",
            wavespeed_api_key: data.settings.wavespeed_api_key || "",
            heygen_api_key: data.settings.heygen_api_key || "",
            pexels_api_key: data.settings.pexels_api_key || ""
          });
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

  const handleSaveKey = async (key: string, value: string) => {
    setIsSaving(key);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });

      const data = await response.json();
      
      if (data.success) {
        showToast('API key saved successfully');
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error: any) {
      console.error('Failed to save setting:', error);
      showToast(error.message || 'Failed to save API key', 'error');
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border technical-label text-xs font-bold uppercase tracking-wider ${
          toast.type === "success" 
            ? "bg-green-500/10 border-green-500/30 text-green-500" 
            : "bg-destructive/10 border-destructive/30 text-destructive"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-muted">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                  <Settings className="w-6 h-6 text-primary" />
                  Settings
                </h1>
                <p className="text-[10px] technical-label opacity-40 uppercase tracking-widest mt-1">
                  System Configuration
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] technical-label font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
              ONLINE
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* API Keys Section */}
        <Card className="glass-premium-v2 border-border/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">API Keys</CardTitle>
                <CardDescription className="text-[10px] technical-label opacity-40 uppercase tracking-wider">
                  Configure external service integrations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Anthropic API Key */}
            <div className="space-y-2">
              <Label htmlFor="anthropic" className="text-[10px] technical-label font-bold uppercase tracking-wider opacity-60">
                Anthropic API Key
              </Label>
              <div className="flex gap-2">
                <Input
                  id="anthropic"
                  type="password"
                  value={apiKeys.anthropic_api_key}
                  onChange={(e) => setApiKeys({ ...apiKeys, anthropic_api_key: e.target.value })}
                  className="font-mono text-xs"
                  placeholder="sk-ant-..."
                  disabled={isLoading}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="technical-label text-[10px]"
                  onClick={() => handleSaveKey('anthropic_api_key', apiKeys.anthropic_api_key)}
                  disabled={isSaving === 'anthropic_api_key' || isLoading}
                >
                  {isSaving === 'anthropic_api_key' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground">Used for Claude AI scene generation</p>
            </div>

            {/* Wavespeed API Key */}
            <div className="space-y-2">
              <Label htmlFor="wavespeed" className="text-[10px] technical-label font-bold uppercase tracking-wider opacity-60">
                Wavespeed API Key
              </Label>
              <div className="flex gap-2">
                <Input
                  id="wavespeed"
                  type="password"
                  value={apiKeys.wavespeed_api_key}
                  onChange={(e) => setApiKeys({ ...apiKeys, wavespeed_api_key: e.target.value })}
                  className="font-mono text-xs"
                  placeholder="ws-..."
                  disabled={isLoading}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="technical-label text-[10px]"
                  onClick={() => handleSaveKey('wavespeed_api_key', apiKeys.wavespeed_api_key)}
                  disabled={isSaving === 'wavespeed_api_key' || isLoading}
                >
                  {isSaving === 'wavespeed_api_key' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground">Used for avatar video generation and images</p>
            </div>

            {/* Heygen API Key */}
            <div className="space-y-2">
              <Label htmlFor="heygen" className="text-[10px] technical-label font-bold uppercase tracking-wider opacity-60">
                Heygen API Key
              </Label>
              <div className="flex gap-2">
                <Input
                  id="heygen"
                  type="password"
                  value={apiKeys.heygen_api_key}
                  onChange={(e) => setApiKeys({ ...apiKeys, heygen_api_key: e.target.value })}
                  className="font-mono text-xs"
                  placeholder="hg-..."
                  disabled={isLoading}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="technical-label text-[10px]"
                  onClick={() => handleSaveKey('heygen_api_key', apiKeys.heygen_api_key)}
                  disabled={isSaving === 'heygen_api_key' || isLoading}
                >
                  {isSaving === 'heygen_api_key' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground">Alternative avatar video generation service</p>
            </div>

            {/* Pexels API Key */}
            <div className="space-y-2">
              <Label htmlFor="pexels" className="text-[10px] technical-label font-bold uppercase tracking-wider opacity-60">
                Pexels API Key
              </Label>
              <div className="flex gap-2">
                <Input
                  id="pexels"
                  type="password"
                  value={apiKeys.pexels_api_key}
                  onChange={(e) => setApiKeys({ ...apiKeys, pexels_api_key: e.target.value })}
                  className="font-mono text-xs"
                  placeholder="px-..."
                  disabled={isLoading}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="technical-label text-[10px]"
                  onClick={() => handleSaveKey('pexels_api_key', apiKeys.pexels_api_key)}
                  disabled={isSaving === 'pexels_api_key' || isLoading}
                >
                  {isSaving === 'pexels_api_key' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground">Used for B-roll stock footage</p>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card className="glass-premium-v2 border-border/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-lg">System Configuration</CardTitle>
                <CardDescription className="text-[10px] technical-label opacity-40 uppercase tracking-wider">
                  Performance and processing settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ffmpeg-url" className="text-[10px] technical-label font-bold uppercase tracking-wider opacity-60">
                FFmpeg Server URL
              </Label>
              <Input
                id="ffmpeg-url"
                type="url"
                defaultValue="http://localhost:3333"
                className="font-mono text-xs"
              />
              <p className="text-[9px] text-muted-foreground">Local FFmpeg processing server endpoint</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabase-url" className="text-[10px] technical-label font-bold uppercase tracking-wider opacity-60">
                Supabase Project URL
              </Label>
              <Input
                id="supabase-url"
                type="url"
                defaultValue="https://your-project.supabase.co"
                className="font-mono text-xs"
              />
              <p className="text-[9px] text-muted-foreground">Database and storage backend</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
