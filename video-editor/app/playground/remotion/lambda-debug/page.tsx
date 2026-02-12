"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Zap, 
  Loader2, 
  Play,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const REMOTION_SERVER = "http://localhost:3000";

export default function LambdaDebugPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [renderId, setRenderId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bucket, setBucket] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  const startDebugRender = async () => {
    setIsProcessing(true);
    setError(null);
    setRenderId(null);
    setStatus("Initiating...");
    setProgress(0);
    setOutputUrl(null);
    setEstimatedCost(null);

    try {
      const response = await fetch(`${REMOTION_SERVER}/lambda/debug`, {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to start debug render");

      setRenderId(data.renderId);
      setBucket(data.bucketName);
      setEstimatedCost(data.estimatedCost);
      setStatus("Rendering on Lambda...");
      pollStatus(data.renderId, data.bucketName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsProcessing(false);
      setStatus("Failed");
    }
  };

  const pollStatus = (id: string, bucketName: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${REMOTION_SERVER}/lambda/status/${id}?bucketName=${bucketName}`);
        const data = await res.json();

        if (data.status === "completed") {
          setOutputUrl(data.videoUrl);
          setIsProcessing(false);
          setProgress(100);
          setStatus("Completed");
          clearInterval(interval);
        } else if (data.status === "failed") {
          setError(data.error || "Lambda render failed");
          setIsProcessing(false);
          setStatus("Failed");
          clearInterval(interval);
        } else if (data.status === "in-progress") {
          setProgress(Math.round(data.progress * 100));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-indigo-500/30 font-sans p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link 
            href="/playground/remotion" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-colors group w-fit"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Remotion Experiments
          </Link>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Lambda Debug
            </h1>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-[0.3em]">Bypassing Frontend Fetch • Hardcoded S3 Assets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Action Card */}
          <Card className="bg-neutral-900/50 border-neutral-800 border-2 rounded-[2rem] overflow-hidden backdrop-blur-xl">
            <CardHeader className="p-8 border-b border-neutral-800">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-neutral-400">Execution Panel</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Hardcoded Payload</p>
                  <ul className="text-[11px] font-bold text-neutral-500 space-y-1 list-disc list-inside">
                    <li>Avatar IV Video (Clip 1)</li>
                    <li>Avatar IV Video (Clip 2)</li>
                    <li>Light Leak Transition (30f)</li>
                    <li className="text-indigo-500/80 italic">Aspect Ratio: 9:16 (Portrait)</li>
                  </ul>
                </div>

                {estimatedCost !== null && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-2 duration-500">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Est. Lambda Cost</span>
                    <span className="text-xs font-black text-emerald-400">${estimatedCost.toFixed(6)}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={startDebugRender}
                disabled={isProcessing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] text-xs py-8 rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 border-t border-indigo-400/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Processing {progress}%
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-3 fill-current" />
                    Start-Lambda-Render
                  </>
                )}
              </Button>

              {status && (
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Activity className={`w-4 h-4 ${isProcessing ? 'text-indigo-500 animate-pulse' : 'text-neutral-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{status}</span>
                  </div>
                  {renderId && (
                    <Badge variant="outline" className="text-[9px] font-bold border-neutral-800 text-neutral-500">
                      ID: {renderId.slice(0, 8)}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Result Card */}
          <Card className="bg-neutral-900/50 border-neutral-800 border-2 rounded-[2rem] overflow-hidden backdrop-blur-xl flex flex-col">
            <CardHeader className="p-8 border-b border-neutral-800">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-neutral-400 italic">Production Monitor</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-8 flex flex-col items-center justify-center text-center">
              {outputUrl ? (
                <div className="w-full space-y-6 animate-in fade-in zoom-in duration-500">
                  <div className="aspect-video rounded-2xl overflow-hidden border-4 border-indigo-500/20 shadow-2xl bg-black">
                    <video src={outputUrl} controls autoPlay className="w-full h-full object-contain" />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Master Render Complete</span>
                  </div>
                </div>
              ) : error ? (
                <div className="space-y-4 text-rose-500 animate-in slide-in-from-bottom-4 duration-300">
                  <XCircle className="w-12 h-12 mx-auto opacity-50" />
                  <p className="text-xs font-bold leading-relaxed">{error}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setError(null)}
                    className="border-rose-500/20 text-rose-500 hover:bg-rose-500/5 text-[10px] uppercase font-black tracking-widest"
                  >
                    Clear Fault
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 opacity-20 group transition-opacity hover:opacity-100">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mx-auto">
                    <Play className="w-8 h-8 ml-1" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting S3 Artifacts</p>
                    <p className="text-[8px] font-bold text-neutral-600 uppercase">Trigger render to begin assembly</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex-shrink-0 flex items-center justify-center text-indigo-400">
             <Zap className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-widest italic">Lambda Pipeline Info</h4>
            <p className="text-[11px] font-bold text-neutral-500 leading-relaxed uppercase">
              The backend will directly request assets from Supabase. <br />
              Rendering is distributed across multiple AWS Lambda instances. <br />
              Monitor your terminal for real-time CloudWatch logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
