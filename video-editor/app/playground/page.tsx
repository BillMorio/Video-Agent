"use client";

import Link from "next/link";
import { 
  Beaker, 
  Palette, 
  Server, 
  Film, 
  ArrowRight,
  Sparkles,
  Book,
  Cpu,
  Database,
  Workflow,
  Settings2,
  User
} from "lucide-react";

const testPages = [
  {
    title: "Agent Orchestration (New)",
    description: "Launch a 15-scene project and visualize Multi-Agent handoffs in a dynamic studio",
    href: "/playground/start",
    icon: Workflow,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  },
  {
    title: "System Health",
    description: "Real-time monitoring of Supabase, OpenAI, Pexels, and FFmpeg",
    href: "/health-check",
    icon: Database,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30"
  },
  {
    title: "System Workflow",
    description: "End-to-End autonomous pipeline: Script to Final Video",
    href: "/playground/system-workflow",
    icon: Workflow,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30"
  },
  {
    title: "API Documentation",
    description: "Quick reference for OpenAI, Pexels, and FFmpeg APIs",
    href: "/playground/docs",
    icon: Book,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30"
  },
  {
    title: "AI Agent Logic",
    description: "Understanding Agent Loops, Tool Schemas, and Orchestration",
    href: "/playground/agent-docs",
    icon: Cpu,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30"
  },
  {
    title: "FFmpeg Architecture",
    description: "Deep dive into Video Normalization, Handles, and N-Way Stitching",
    href: "/playground/ffmpeg-docs",
    icon: Settings2,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30"
  },
  {
    title: "UI Components",
    description: "Test UI components like buttons, inputs, modals, and cards in isolation",
    href: "/playground/ui",
    icon: Palette,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  },
  {
    title: "OpenAI API",
    description: "Test OpenAI API with different models and prompts",
    href: "/playground/openai",
    icon: Sparkles,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30"
  },
  {
    title: "Pexels Videos",
    description: "Search and preview stock videos from Pexels",
    href: "/playground/pexels",
    icon: Film,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30"
  },
  {
    title: "FFmpeg Operations",
    description: "Test video processing operations like trim, fit, zoom, and speed",
    href: "/playground/ffmpeg",
    icon: Film,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30"
  },
  {
    title: "Heygen Avatars",
    description: "Connect to Heygen V2 API to list and preview talking head avatars",
    href: "/playground/heygen",
    icon: User,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30"
  },
];

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Beaker className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Playground</h1>
              <p className="text-xs text-muted-foreground technical-label uppercase tracking-widest">
                UI Experiments & API Testing
              </p>
            </div>
          </div>
        </div>

        {/* Test Pages Grid */}
        <div className="grid gap-4">
          {testPages.map((page) => (
            <Link 
              key={page.href} 
              href={page.href}
              className={`group p-6 rounded-lg border ${page.borderColor} ${page.bgColor} hover:scale-[1.01] transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center ${page.color}`}>
                    <page.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">{page.title}</h2>
                    <p className="text-sm text-muted-foreground">{page.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4 technical-label uppercase tracking-widest">
            Quick Actions
          </p>
          <div className="flex gap-3">
            <Link 
              href="/"
              className="px-4 py-2 rounded-md bg-muted/10 border border-border text-sm hover:bg-muted/20 transition-colors"
            >
              ← Back to Editor
            </Link>
            <button 
              className="px-4 py-2 rounded-md bg-primary/10 border border-primary/30 text-sm text-primary hover:bg-primary/20 transition-colors flex items-center gap-2"
              onClick={() => alert("Feature coming soon!")}
            >
              <Sparkles className="w-4 h-4" />
              Create New Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
