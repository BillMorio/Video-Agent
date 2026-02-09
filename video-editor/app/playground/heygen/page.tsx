"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  RefreshCcw, 
  Search, 
  Copy, 
  Check,
  Video,
  Info,
  ExternalLink,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Avatar {
  avatar_id: string;
  avatar_name: string;
  gender: string;
  preview_image_url: string;
  preview_video_url?: string;
  category?: string;
}

export default function HeygenPlaygroundPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAvatars = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/heygen/avatars");
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Heygen v2 usually returns { data: { avatars: [...] } }
      setAvatars(data.data?.avatars || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch avatars");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAvatars = avatars.filter(avatar => 
    avatar.avatar_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    avatar.avatar_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-indigo-100 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/playground" 
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors group font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Playground
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-700">Heygen API Live</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-tight">
              Avatar <br /> <span className="text-indigo-600 opacity-80">Manifest</span>
            </h1>
            <p className="text-neutral-500 font-medium max-w-lg leading-relaxed text-lg">
              Synchronize with the Heygen ecosystem to retrieve and visualize high-fidelity talking head avatars available for orchestration.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-neutral-100 bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-neutral-300 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchAvatars}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-neutral-900 text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
          </div>
        </header>

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-2xl bg-red-50 border-2 border-red-100 text-red-600 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <Info className="w-6 h-6" />
            <div className="flex-1">
              <p className="font-bold uppercase tracking-tight text-sm">Synchronization Error</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
            <button 
              onClick={fetchAvatars}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Avatars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-2 border-neutral-100 overflow-hidden rounded-2xl">
                <Skeleton className="aspect-[4/5] w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : filteredAvatars.length > 0 ? (
            filteredAvatars.map((avatar) => (
              <Card key={avatar.avatar_id} className="group border-2 border-neutral-100 overflow-hidden rounded-2xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100 bg-white">
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  <img 
                    src={avatar.preview_image_url} 
                    alt={avatar.avatar_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <Badge className="bg-white/90 backdrop-blur-sm text-neutral-900 border-none text-[9px] font-black uppercase">
                      {avatar.gender}
                    </Badge>
                    {avatar.category && (
                      <Badge className="bg-indigo-600/90 backdrop-blur-sm text-white border-none text-[9px] font-black uppercase">
                        {avatar.category}
                      </Badge>
                    )}
                  </div>
                  {avatar.preview_video_url && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-indigo-600 shadow-sm transition-transform hover:scale-110 active:scale-95">
                        <Video className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button 
                      onClick={() => copyToClipboard(avatar.avatar_id)}
                      className="w-full py-2 rounded-lg bg-white text-neutral-900 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-100 transition-colors"
                    >
                      {copiedId === avatar.avatar_id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy ID
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg tracking-tight group-hover:text-indigo-600 transition-colors truncate">
                      {avatar.avatar_name}
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono tracking-tighter truncate uppercase">
                      ID: {avatar.avatar_id}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : !loading && (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center mx-auto text-neutral-300">
                <Sparkles className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold italic uppercase tracking-tight">No Entities Found</h3>
                <p className="text-neutral-500 font-medium">Try refining your search query or re-syncing the manifest.</p>
              </div>
            </div>
          )}
        </div>

        {/* System Context */}
        <section className="p-8 rounded-[2.5rem] bg-indigo-600 text-white relative overflow-hidden group">
           <div className="absolute -top-12 -right-12 p-8 opacity-10 transition-transform group-hover:rotate-12 duration-700">
              <ShieldCheck className="w-64 h-64" />
           </div>
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Authorized Protocol</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Generative Neural <br /> Interface</h2>
                <p className="text-indigo-100 text-sm font-medium leading-relaxed max-w-sm">
                  This instance is connected to the Heygen V2 API backbone. Use these avatars as base models for automated script processing.
                </p>
              </div>
              <div className="flex gap-3">
                <Link 
                  href="https://docs.heygen.com" 
                  target="_blank"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  API Documentation
                </Link>
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-12 border-t border-neutral-100">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.4em]">
            Autonomous Avatar Engine &bull; Heygen Core v2
          </p>
        </footer>
      </div>
    </div>
  );
}
