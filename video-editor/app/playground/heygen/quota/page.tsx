"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  Database,
  RefreshCcw,
  Loader2,
  Video,
  User,
  Zap,
  LayoutDashboard,
  Clock,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function QuotaDashboardPage() {
  const [quotaData, setQuotaData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchQuota = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/heygen/quota");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch quota");
      }
      
      setQuotaData(data.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-neutral-900 font-sans pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Premium Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-neutral-100 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/playground" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-all">
            <div className="w-8 h-8 rounded-xl bg-neutral-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Arena
          </Link>
          <div className="h-6 w-px bg-neutral-200" />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 animate-pulse">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Credit Terminal</h1>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Resource Management Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={fetchQuota} 
            disabled={isLoading}
            variant="ghost"
            className="rounded-xl px-6 h-12 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-neutral-100"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <RefreshCcw className="w-4 h-4 mr-3" />}
            Refresh Node
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16 space-y-16">
        {/* Statistics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-4 border-white bg-white shadow-2xl rounded-[3rem] overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <CardContent className="p-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  <Database className="w-7 h-7" />
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight">Active API</Badge>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Total Remaining Quota</p>
                <h3 className="text-5xl font-black tracking-tighter text-neutral-900 leading-none antialiased">
                  {isLoading ? <Loader2 className="w-10 h-10 animate-spin text-neutral-200" /> : quotaData?.remaining_quota?.toLocaleString() || "0"}
                </h3>
              </div>
              <div className="pt-6 border-t border-neutral-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  <span>Usage Strategy</span>
                  <span className="text-indigo-600 italic underline cursor-help">Optimized</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-white bg-white shadow-2xl rounded-[3rem] overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <CardContent className="p-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  <Zap className="w-7 h-7" />
                </div>
                <Badge className="bg-rose-50 text-rose-600 border-rose-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight">V-Agent</Badge>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Video Agent Free Credits</p>
                <h3 className="text-5xl font-black tracking-tighter text-neutral-900 leading-none">
                   {isLoading ? <Loader2 className="w-10 h-10 animate-spin text-neutral-200" /> : quotaData?.details?.video_agent_free_video || "0"}
                </h3>
              </div>
              <div className="pt-6 border-t border-neutral-50 flex items-center justify-between">
                 <div className="flex gap-1.5">
                   {[1,2,3].map(i => (
                     <div key={i} className={`h-1.5 w-6 rounded-full ${i <= (quotaData?.details?.video_agent_free_video || 0) ? 'bg-rose-500' : 'bg-rose-100'}`} />
                   ))}
                 </div>
                 <span className="text-[9px] font-black text-rose-300 uppercase italic tracking-widest">Free Tier Tracking</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-white bg-white shadow-2xl rounded-[3rem] overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <CardContent className="p-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  <User className="w-7 h-7" />
                </div>
                <Badge className="bg-amber-50 text-amber-600 border-amber-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight">Interactive</Badge>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Avatar IV Free Credits</p>
                <h3 className="text-5xl font-black tracking-tighter text-neutral-900 leading-none">
                  {isLoading ? <Loader2 className="w-10 h-10 animate-spin text-neutral-200" /> : quotaData?.details?.avatar_iv_free_credit || "0"}
                </h3>
              </div>
              <div className="pt-6 border-t border-neutral-50 flex items-center gap-3 uppercase text-[9px] font-black tracking-widest text-neutral-400">
                 <TrendingUp className="w-3 h-3 text-emerald-500" />
                 Stable Performance
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-neutral-900 flex items-center justify-center text-white">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-neutral-900">Breakdown</h2>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.3em]">Technical Specification Details</p>
                </div>
              </div>

              <Card className="border-4 border-white bg-white shadow-2xl rounded-[3.5rem] overflow-hidden">
                <CardContent className="p-12">
                  <div className="space-y-8">
                     <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                              <Video className="w-8 h-8" />
                           </div>
                           <div>
                              <h4 className="text-lg font-black uppercase tracking-tight">Primary API Quota</h4>
                              <p className="text-xs text-neutral-400 font-medium">Standard video generation throughput</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black tracking-tighter">{quotaData?.details?.api?.toLocaleString() || "0"}</p>
                           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Available</p>
                        </div>
                     </div>

                     <div className="h-px bg-neutral-50" />

                     <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                              <Sparkles className="w-8 h-8" />
                           </div>
                           <div>
                              <h4 className="text-lg font-black uppercase tracking-tight">Interactive Avatar IV</h4>
                              <p className="text-xs text-neutral-400 font-medium">High fidelity digital twin interactions</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black tracking-tighter">{quotaData?.details?.avatar_iv_free_credit || "0"}</p>
                           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-300">Remaining</p>
                        </div>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-10">
             <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-900 flex items-center justify-center text-white">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-neutral-900">Sync Node</h2>
                </div>

                <Card className="border-4 border-white bg-white shadow-2xl rounded-[3.5rem] p-10 space-y-8">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Current Feed</p>
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                         <span className="text-sm font-black text-neutral-900">Stream Operational</span>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                         <span className="text-neutral-400 font-bold uppercase tracking-widest text-[9px]">Last Updated</span>
                         <span className="font-mono font-bold text-neutral-900">{lastUpdated?.toLocaleTimeString() || "WAIT_SIGNAL"}</span>
                      </div>
                      
                      {error && (
                         <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-center gap-4">
                            <Zap className="w-5 h-5 text-rose-500" />
                            <p className="text-[10px] font-bold text-rose-600 leading-tight">FAIL: {error}</p>
                         </div>
                      )}
                   </div>

                   <div className="pt-4">
                      <Button 
                        onClick={fetchQuota}
                        disabled={isLoading}
                        className="w-full py-7 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-neutral-200 active:scale-95 transition-all"
                      >
                         Re-Synchronize Quota
                         <ChevronRight className="w-4 h-4 ml-3" />
                      </Button>
                   </div>
                </Card>
             </section>
          </div>
        </div>

        {/* Schema Viewer */}
        <section className="space-y-6 pt-10">
           <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-300">Raw Telemetry Schema</h2>
              <Badge variant="outline" className="text-[8px] border-neutral-100 text-neutral-300 font-mono tracking-widest">GET /v2/quota</Badge>
           </div>
           <Card className="border-4 border-white bg-neutral-900 shadow-2xl rounded-[3rem] overflow-hidden relative group">
              <div className="absolute top-6 right-8 text-[10px] font-mono text-white/20 select-none">DATA_PUMP_ACTIVE</div>
              <CardContent className="p-10 font-mono text-xs text-indigo-400/80 leading-relaxed overflow-x-auto selection:bg-indigo-500/30">
                 <pre>{JSON.stringify({ error: null, data: quotaData }, null, 2)}</pre>
              </CardContent>
           </Card>
        </section>
      </main>

      {/* Footer Info */}
      <footer className="pt-20 border-t border-neutral-100 text-center space-y-4">
         <div className="flex items-center justify-center gap-12 text-[9px] font-black uppercase tracking-[0.3em] text-neutral-300">
            <span className="hover:text-neutral-900 transition-colors cursor-pointer italic underline">Privacy Protocol</span>
            <span className="hover:text-neutral-900 transition-colors cursor-pointer italic underline">Security Layer 4</span>
            <span className="hover:text-neutral-900 transition-colors cursor-pointer italic underline">Compute Logs</span>
         </div>
      </footer>
    </div>
  );
}
