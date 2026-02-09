"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Database, Activity, ShieldCheck, 
  AlertCircle, CheckCircle2, Loader2, RefreshCcw,
  Server, Film, Brain, Terminal, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ServiceStatus = "idle" | "checking" | "healthy" | "error";

interface ServiceHealth {
  id: string;
  name: string;
  icon: any;
  description: string;
  status: ServiceStatus;
  latency?: string;
  message?: string;
  details?: any;
  log?: any;
}

export default function HealthCheckPage() {
  const [services, setServices] = useState<ServiceHealth[]>([
    { 
      id: "supabase", 
      name: "Supabase", 
      icon: Database, 
      description: "Database & Authentication", 
      status: "idle" 
    },
    { 
      id: "openai", 
      name: "OpenAI", 
      icon: Brain, 
      description: "Large Language Models", 
      status: "idle" 
    },
    { 
      id: "pexels", 
      name: "Pexels", 
      icon: Film, 
      description: "Stock Video API", 
      status: "idle" 
    },
    { 
      id: "ffmpeg", 
      name: "FFmpeg Node", 
      icon: Server, 
      description: "Video Processing Backend", 
      status: "idle" 
    },
  ]);

  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleLog = (id: string) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checkService = async (serviceId: string) => {
    try {
      const res = await fetch(`/api/${serviceId}/health`);
      const data = await res.json();
      return { 
        status: res.ok ? "healthy" : "error", 
        latency: data.latency, 
        message: data.message,
        details: data.details,
        log: data
      };
    } catch (err) {
      return { 
        status: "error" as ServiceStatus, 
        message: "Failed to connect to internal health API",
        log: { error: String(err) }
      };
    }
  };

  const runCheck = async (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: "checking" } : s));
    const result = await checkService(id);
    setServices(prev => prev.map(s => s.id === id ? { 
      ...s, 
      status: result.status as ServiceStatus,
      latency: result.latency,
      message: result.message,
      details: result.details,
      log: result.log
    } : s));
  };

  const runAllChecks = async () => {
    setServices(prev => prev.map(s => ({ ...s, status: "checking" })));
    const checks = services.map(s => checkService(s.id));
    const results = await Promise.all(checks);

    setServices(prev => prev.map((s, i) => ({
      ...s,
      status: results[i].status as ServiceStatus,
      latency: results[i].latency,
      message: results[i].message,
      details: results[i].details,
      log: results[i].log
    })));
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-indigo-100 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Navigation */}
        <Link 
          href="/playground" 
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors group font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Playground
        </Link>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 uppercase italic leading-none">System Health</h1>
            <p className="text-neutral-500 font-medium">Monitoring core connectivity and API status.</p>
          </div>
          <Button 
            onClick={runAllChecks} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Audit System
          </Button>
        </header>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {services.map((service) => (
            <Card key={service.id} className="relative bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-4 border-b border-neutral-50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                    service.status === 'healthy' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                    service.status === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                    'bg-neutral-50 border-neutral-100 text-neutral-400'
                  }`}>
                    <service.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-neutral-900">{service.name}</CardTitle>
                    <CardDescription className="text-xs font-medium text-neutral-400 uppercase tracking-widest">{service.description}</CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Indicator (Left of Button) */}
                  <div className="flex items-center">
                    {service.status === 'healthy' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {service.status === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                    {service.status === 'checking' && <Loader2 className="w-5 h-5 animate-spin text-neutral-300" />}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200 font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
                    onClick={() => runCheck(service.id)}
                    disabled={service.status === 'checking'}
                  >
                    Audit
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge className={`rounded-md text-[10px] font-bold px-2 py-0.5 border-none ${
                      service.status === 'healthy' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 
                      service.status === 'error' ? 'bg-rose-100 text-rose-700 hover:bg-rose-100' : 
                      'bg-neutral-100 text-neutral-500 hover:bg-neutral-100'
                    }`}>
                      {service.status.toUpperCase()}
                    </Badge>
                    {service.latency && (
                      <Badge variant="outline" className="rounded-md font-mono text-[10px] text-neutral-400 border-neutral-200 bg-neutral-50">
                        {service.latency}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className={`text-sm p-4 rounded-xl border font-medium ${
                  service.status === 'healthy' ? 'bg-emerald-50/30 border-emerald-100 text-emerald-700/80' : 
                  service.status === 'error' ? 'bg-rose-50/30 border-rose-100 text-rose-700/80' : 
                  'bg-neutral-50/50 border-neutral-100 text-neutral-400 italic'
                }`}>
                  {service.message || "Awaiting manual audit..."}
                </div>

                {service.log && (
                  <div className="space-y-2">
                    <button 
                      onClick={() => toggleLog(service.id)}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors w-full"
                    >
                      <Terminal className="w-3 h-3 text-neutral-400" />
                      View Trace
                      <div className="flex-1 h-px bg-neutral-100" />
                      {expandedLogs[service.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    
                    {expandedLogs[service.id] && (
                      <div className="rounded-xl bg-neutral-900 p-4 shadow-inner border border-neutral-800 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                        <pre className="text-[10px] font-mono text-emerald-400/90 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-48 custom-scrollbar">
                          {JSON.stringify(service.log, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Banner */}
        <section className="p-8 rounded-3xl bg-neutral-900 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/70">System Audit Ready</span>
            </div>
            <h2 className="text-3xl font-extrabold italic uppercase leading-none">High Availability Verified.</h2>
            <p className="text-neutral-400 font-medium text-sm leading-relaxed">
              Connectivity tests for production APIs are configured for manual execution to minimize unnecessary egress. 
              Verify your integration heartbeats before starting video orchestration.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-neutral-100">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.4em]">
            Precision Engineering &bull; Production Ready
          </p>
        </footer>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
