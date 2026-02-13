"use client";

import { useState } from "react";
import { 
  LayoutGrid, 
  Settings,
  FileVideo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  id: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  href: string;
}

interface NavSidebarProps {
  activeItem?: string;
  isCollapsed?: boolean;
  onItemClick?: (itemId: string) => void;
}

export function NavSidebar({ activeItem = "studio", isCollapsed = false, onItemClick }: NavSidebarProps) {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    { id: "library", label: "Library", sub: "Production Fleet", icon: <LayoutGrid className="w-4 h-4" />, href: "/playground/dashboard" },
    { id: "studio", label: "Studio", sub: "Primary Workflow", icon: <FileVideo className="w-4 h-4" />, href: "/playground/start" },
    { id: "settings", label: "Settings", sub: "Configuration", icon: <Settings className="w-4 h-4" />, href: "#" },
  ];

  // Derive active item from pathname if not provided
  const currentActive = activeItem || (pathname?.includes('dashboard') ? 'library' : 'studio');

  return (
    <aside 
      className={cn(
        "h-full border-r border-border/50 bg-background flex flex-col transition-all duration-500 ease-in-out shrink-0 relative z-20",
        isCollapsed ? "w-16" : "w-56"
      )}
    >
      {/* Brand / Master Node Indicator - Fixed h-20 for header sync */}
      <div className={cn(
        "h-20 border-b border-border/50 flex items-center px-5 gap-3 relative",
        isCollapsed && "justify-center px-0 gap-0"
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-glow-sm relative group">
          <LayoutGrid className="w-4 h-4 text-primary relative z-10" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col flex-1">
            <span className="font-bold text-[11px] tracking-[0.05em] uppercase text-foreground leading-none">Lumina Studio</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1 h-1 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
              <span className="text-[7px] technical-label opacity-30 uppercase tracking-widest font-black">Online</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items - Compacted py-2, smaller icons and text */}
      <div className="flex-1 py-8 px-3 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => onItemClick?.(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 group relative",
              currentActive === item.id
                ? "bg-primary/5 text-primary border border-primary/10 shadow-glow-sm"
                : "text-muted-foreground/50 hover:text-foreground hover:bg-muted/20",
              isCollapsed && "justify-center px-0"
            )}
          >
            <div className={cn(
               "transition-transform duration-300",
               currentActive === item.id ? "text-primary scale-105" : "text-muted-foreground/30 group-hover:scale-110"
            )}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col items-start translate-y-[0.5px]">
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                <span className="text-[6px] technical-label opacity-25 font-black tracking-tighter mt-0.5 uppercase">{item.sub}</span>
              </div>
            )}

            {currentActive === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-primary rounded-r-full shadow-glow" />
            )}
          </Link>
        ))}
      </div>

      {/* Bottom Footer Section - Tighter padding */}
      {!isCollapsed && (
        <div className="p-6 border-t border-border/50 bg-muted/5">
           <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2.5">
               <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
               <span className="text-[8px] technical-label opacity-20 uppercase tracking-[0.2em] font-black">System_L3</span>
             </div>
           </div>
        </div>
      )}
    </aside>
  );
}
