"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ChevronRight, 
  Mic2, 
  Play, 
  Pause,
  Volume2,
  Check,
  Settings2,
  Globe,
  Zap,
  User,
  Activity,
  Waves,
  PanelLeft,
  VolumeX,
  AudioLines
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavSidebar } from "@/components/panels/nav-sidebar";
import { CreationFlowBreadcrumbs } from "@/components/creation/creation-breadcrumbs";
import { cn } from "@/lib/utils";

const VOICES = [
  { id: 'sirius', name: 'Sirius', tone: 'Cinematic', gender: 'Male', description: 'Deep, authoritative, and narrative-driven.', color: 'indigo' },
  { id: 'alara', name: 'Alara', tone: 'Professional', gender: 'Female', description: 'Clear, informative, and engaging.', color: 'purple' },
  { id: 'atlas', name: 'Atlas', tone: 'Technical', gender: 'Male', description: 'Precise, calm, and highly detailed.', color: 'emerald' },
  { id: 'nova', name: 'Nova', tone: 'Dynamic', gender: 'Female', description: 'Energetic, modern, and youthful.', color: 'blue' },
];

export default function VocalGalleryPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    router.push(`/create/${projectId}/storyboard`);
  };

  const handleBack = () => {
    router.back();
  };

  const togglePreview = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(isPlaying === id ? null : id);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans relative selection:bg-primary/30">
      {/* Background Depth Layer - Same as Orchestration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(var(--primary-rgb),0.015)_0%,_transparent_60%),radial-gradient(circle_at_70%_80%,_rgba(var(--primary-rgb),0.01)_0%,_transparent_60%)] pointer-events-none" />

      <NavSidebar
        activeItem="studio"
        isCollapsed={isSidebarCollapsed}
        onItemClick={() => {}}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Header - Strictly following Studio layout */}
        <header className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-8 z-50 glass-premium">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={cn(
                "p-2.5 rounded-xl border transition-all flex items-center justify-center hover:scale-105 active:scale-95 group",
                isSidebarCollapsed
                  ? "bg-primary text-primary-foreground border-primary shadow-glow shadow-primary/20"
                  : "bg-muted/40 border-border/60 text-foreground hover:bg-muted/60"
              )}
            >
              <PanelLeft className={cn("w-5 h-5 transition-transform", isSidebarCollapsed && "rotate-180")} />
            </button>

            <div className="w-px h-6 bg-border/40 mx-1" />

            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                <AudioLines className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-foreground tracking-tight uppercase italic leading-none">The Vocal Gallery</h1>
                <p className="text-[9px] technical-label text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic">Upstream Pipeline / Phase 03</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Progress Indicator */}
             <CreationFlowBreadcrumbs activeStep="VOCAL" projectId={projectId} className="mr-4" />
             
             <ThemeToggle />
             <Button 
               onClick={handleNext}
               className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-8 rounded-xl font-bold uppercase tracking-widest text-[10px] h-10"
             >
                Bind Voice & Synthesize
             </Button>
          </div>
        </header>

        <main className="flex-1 p-12 pt-32 overflow-y-auto scrollbar-hide">
          <div className="max-w-5xl w-full mx-auto space-y-12">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-foreground">
                    Acoustic <span className="text-primary tracking-widest not-italic">Configuration</span>
                 </h2>
                 <Badge variant="outline" className="text-[8px] technical-label font-black uppercase text-primary border-primary/20 bg-primary/5 px-2 py-0.5 mt-1">High_Fidelity_PCM</Badge>
              </div>
              <p className="text-muted-foreground text-sm font-medium tracking-wide max-w-lg opacity-60 uppercase tracking-tight leading-relaxed">
                 Select a neural engine that resonates with your narrative vectors. Powered by ElevenLabs high-fidelity acoustic models.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
               {VOICES.map((voice) => (
                 <div 
                   key={voice.id}
                   onClick={() => setSelectedVoice(voice.id)}
                   className={cn(
                     "group relative p-10 rounded-[2.5rem] border transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-sm",
                     selectedVoice === voice.id 
                      ? "bg-card/40 border-primary shadow-glow shadow-primary/10" 
                      : "bg-card/20 border-border/40 hover:border-border/60"
                   )}
                 >
                    {/* Depth Accents like Orchestration page */}
                    {selectedVoice === voice.id && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-12 translate-x-12 opacity-50" />
                    )}

                    <div className="relative flex items-center justify-between mb-10">
                       <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all group-hover:scale-105 duration-500 shadow-xl",
                            selectedVoice === voice.id ? "bg-primary text-primary-foreground shadow-glow shadow-primary/20" : "bg-muted/40 border border-border/40 text-muted-foreground/40"
                          )}>
                             <User className="w-8 h-8" />
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-1.5">
                                <h4 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">{voice.name}</h4>
                                <Badge variant="outline" className="border-border/60 text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 px-2 py-0 h-4">{voice.gender}</Badge>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                                <p className="text-[10px] technical-label font-black uppercase tracking-[0.2em] text-primary/80 italic">{voice.tone}</p>
                             </div>
                          </div>
                       </div>
                       <button 
                         onClick={(e) => togglePreview(voice.id, e)}
                         className={cn(
                           "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 group/btn",
                           isPlaying === voice.id 
                            ? "bg-primary text-primary-foreground shadow-glow shadow-primary/40" 
                            : "bg-muted/40 border border-border/40 text-foreground hover:bg-muted/60"
                         )}
                       >
                          {isPlaying === voice.id ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                       </button>
                    </div>

                    <div className="space-y-6">
                       <p className="text-xs font-bold text-muted-foreground/40 leading-relaxed uppercase tracking-tight h-10 group-hover:text-muted-foreground/60 transition-colors">
                         {voice.description}
                       </p>

                       <div className="relative h-14 flex items-center gap-1.5 opacity-20 group-hover:opacity-40 transition-all duration-500 mask-fade-horizontal">
                          {[...Array(24)].map((_, i) => (
                            <div 
                              key={i} 
                              className={cn(
                                "w-1.5 flex-1 bg-primary rounded-full transition-all duration-300",
                                isPlaying === voice.id ? "animate-waveform" : "h-1"
                              )}
                              style={{ 
                                animationDelay: `${i * 0.05}s`,
                                height: isPlaying === voice.id ? `${30 + Math.random() * 70}%` : '4px'
                              }}
                            />
                          ))}
                       </div>
                    </div>

                    {selectedVoice === voice.id && (
                      <div className="absolute top-6 right-8">
                         <div className="flex items-center gap-2 text-primary font-black italic text-[9px] technical-label">
                            <Check className="w-3.5 h-3.5" />
                            SELECTED
                         </div>
                      </div>
                    )}
                 </div>
               ))}
            </div>

            {/* Diagnostic Footer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
               {[
                 { label: "Neural Engine", value: "PCM_Direct_v2", icon: Activity },
                 { label: "Sample Accuracy", value: "99.2% Sync", icon: Waves },
                 { label: "Vocal Protocol", value: "Secure_AES_256", icon: Globe },
               ].map((item, i) => (
                 <div key={i} className="p-8 bg-card/10 border border-border/20 rounded-[2.5rem] flex flex-col gap-5 backdrop-blur-sm group hover:border-border/40 transition-colors">
                    <item.icon className="w-5 h-5 text-primary/30 group-hover:text-primary transition-colors" />
                    <div>
                      <p className="text-[9px] technical-label uppercase tracking-[0.2em] text-muted-foreground/30 mb-1.5 font-black">Lumina_{item.label}</p>
                      <p className="text-xs font-black uppercase tracking-tight text-foreground/60 italic">{item.value}</p>
                    </div>
                 </div>
               ))}
            </div>

          </div>
        </main>

        <footer className="h-16 flex items-center justify-between px-8 bg-card/40 backdrop-blur-md border-t border-border/40 z-50">
           <div className="flex items-center gap-8 text-muted-foreground/30 font-bold">
              <div className="flex items-center gap-2.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                 <span className="text-[9px] technical-label uppercase tracking-[0.2em] font-black">Acoustic_Link_Locked</span>
              </div>
           </div>
           <div className="flex items-center gap-4 text-muted-foreground/20">
              <span className="text-[9px] technical-label font-black uppercase tracking-[0.2em]">Signal: 100% Stability</span>
           </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes waveform {
          0%, 100% { height: 10%; }
          50% { height: 90%; }
        }
        .animate-waveform {
          animation: waveform 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
