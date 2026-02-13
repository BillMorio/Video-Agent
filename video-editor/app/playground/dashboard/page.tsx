"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  LayoutGrid, 
  Video, 
  ChevronRight,
  PanelLeft,
  Calendar,
  Layers,
  ExternalLink,
  Trash2,
  FileVideo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavSidebar } from "@/components/panels/nav-sidebar";
import { cn } from "@/lib/utils";

// Mock Projects Data
const MOCK_PROJECTS = [
  { id: "proj_82af", title: "The Future of Space Habitats", date: "Feb 12, 2026", status: "completed", scenes: 15, duration: "2:45" },
  { id: "proj_91bc", title: "Autonomous Urban Ecosystems", date: "Feb 11, 2026", status: "processing", scenes: 12, duration: "1:30" },
  { id: "proj_44de", title: "Neural Link: A Deep Dive", date: "Feb 09, 2026", status: "draft", scenes: 0, duration: "0:00" },
  { id: "proj_77gh", title: "Synthesizing Reality", date: "Feb 08, 2026", status: "completed", scenes: 22, duration: "4:20" },
  { id: "proj_22jk", title: "The Architecture of 2050", date: "Feb 05, 2026", status: "completed", scenes: 10, duration: "1:15" },
];

export default function ProjectDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  const handleCreateNew = () => {
    router.push("/playground/create");
  };

  const handleOpenProject = (id: string, e: React.MouseEvent) => {
    // In a real app, this would route to the orchestration page for that ID
    router.push(`/playground/orchestration/${id}`);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans relative selection:bg-primary/30">
      {/* Background Depth Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(var(--primary-rgb),0.015)_0%,_transparent_60%),radial-gradient(circle_at_70%_80%,_rgba(var(--primary-rgb),0.01)_0%,_transparent_60%)] pointer-events-none" />

      <NavSidebar
        activeItem="library"
        isCollapsed={isSidebarCollapsed}
        onItemClick={() => {}}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Header - Strictly aligned with Studio layout */}
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
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 text-primary">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-foreground tracking-tight uppercase italic leading-none">Project Dashboard</h1>
                <p className="text-[9px] technical-label text-muted-foreground uppercase tracking-[0.2em] opacity-40 italic">Lumina Production Library</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative group hidden md:block">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                   <Search className="w-3.5 h-3.5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                </div>
                <Input 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search productions..."
                   className="pl-9 w-64 h-10 bg-muted/20 border-border/40 text-[10px] technical-label uppercase tracking-widest focus-visible:ring-primary/20 rounded-xl"
                />
             </div>
             <ThemeToggle />
             <Button 
               onClick={handleCreateNew}
               className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] h-10 flex items-center gap-2 group"
             >
                <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
                Create New Production
             </Button>
          </div>
        </header>

        <main className="flex-1 p-12 pt-32 overflow-y-auto scrollbar-hide">
          <div className="max-w-6xl w-full mx-auto space-y-10">
            
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h2 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">
                    Active <span className="text-primary tracking-widest not-italic">Library</span>
                  </h2>
                  <p className="text-[10px] technical-label font-black uppercase tracking-[0.2em] text-muted-foreground italic">Total_Productions: {MOCK_PROJECTS.length}</p>
               </div>
               <div className="flex items-center gap-2 bg-card/20 p-1.5 rounded-xl border border-border/40 backdrop-blur-sm">
                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg bg-primary/10 text-primary border border-primary/20"><LayoutGrid className="w-4 h-4" /></Button>
                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg text-muted-foreground/40 hover:text-foreground"><MoreVertical className="w-4 h-4" /></Button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {MOCK_PROJECTS.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map((project) => (
                 <div 
                   key={project.id}
                   onClick={(e) => handleOpenProject(project.id, e)}
                   className="group relative bg-card/30 border border-border/40 rounded-[2rem] p-8 hover:border-primary transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-md shadow-2xl hover:shadow-primary/5 active:scale-[0.98]"
                 >
                    {/* Thumbnail Concept Area */}
                    <div className="aspect-video bg-muted/40 rounded-2xl border border-border/20 mb-8 flex items-center justify-center relative overflow-hidden group-hover:border-primary/20 transition-colors">
                       <FileVideo className="w-10 h-10 text-muted-foreground/10 group-hover:text-primary/20 transition-colors" />
                       
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <Badge className="bg-primary/90 text-primary-foreground border-none text-[8px] font-black tracking-widest uppercase">Open in Studio</Badge>
                       </div>

                       {project.status === 'processing' && (
                          <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                             <span className="text-[8px] technical-label font-black uppercase tracking-widest opacity-60">Processing</span>
                          </div>
                       )}
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-start justify-between">
                          <div className="space-y-1">
                             <h4 className="text-lg font-black uppercase italic tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">{project.title}</h4>
                             <p className="text-[9px] technical-label text-muted-foreground/30 uppercase tracking-[0.2em] font-black">{project.id}</p>
                          </div>
                          <button className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground/20 hover:text-foreground transition-colors">
                             <MoreVertical className="w-4 h-4" />
                          </button>
                       </div>

                       <div className="flex items-center gap-4 pt-4 border-t border-border/10">
                          <div className="flex items-center gap-2">
                             <Calendar className="w-3 h-3 text-muted-foreground/30" />
                             <span className="text-[9px] technical-label font-black uppercase tracking-tight text-muted-foreground/60">{project.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Layers className="w-3 h-3 text-primary/40" />
                             <span className="text-[9px] technical-label font-black uppercase tracking-tight text-primary/60">{project.scenes} Scenes</span>
                          </div>
                          <div className="ml-auto">
                             <div className="flex items-center gap-1.5 text-[9px] technical-label font-black text-foreground/40 italic">
                                <Clock className="w-3 h-3" />
                                {project.duration}
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
               
               {/* Empty Placeholder Card for "Create New" */}
               <div 
                 onClick={handleCreateNew}
                 className="group relative border-2 border-dashed border-border/20 rounded-[2rem] p-8 hover:border-primary/40 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center text-center gap-4 hover:bg-primary/[0.02]"
               >
                  <div className="w-16 h-16 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                     <Plus className="w-8 h-8 text-muted-foreground/20 group-hover:text-primary transition-all" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary/60 transition-colors">Initiate New Production</p>
                     <p className="text-[9px] technical-label opacity-20 uppercase tracking-[0.2em] font-black">Agentic_Creation_Pipeline_v1.0</p>
                  </div>
               </div>
            </div>
          </div>
        </main>

        <footer className="h-16 flex items-center justify-between px-8 bg-card/40 backdrop-blur-md border-t border-border/40 z-50">
           <div className="flex items-center gap-8 text-muted-foreground/30 font-bold">
              <div className="flex items-center gap-2.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                 <span className="text-[9px] technical-label uppercase tracking-[0.2em] font-black">Library_System_Operational</span>
              </div>
           </div>
           <div className="flex items-center gap-4 text-muted-foreground/20">
              <span className="text-[9px] technical-label font-black uppercase tracking-[0.2em]">User: BillMorio</span>
           </div>
        </footer>
      </div>
    </div>
  );
}
