"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export type CreationStep = "SPARK" | "SCRIPTING" | "VOCAL" | "STORYBOARD" | "STUDIO";

interface BreadcrumbsProps {
  activeStep: CreationStep;
  projectId?: string;
  className?: string;
}

const STEPS: { id: CreationStep; label: string; phase: string; route: string }[] = [
  { id: "SPARK", label: "spark", phase: "01", route: "/create" },
  { id: "SCRIPTING", label: "scripting", phase: "02", route: "/create/[projectId]/script" },
  { id: "VOCAL", label: "vocal", phase: "03", route: "/create/[projectId]/voice" },
  { id: "STORYBOARD", label: "draft storyboard", phase: "04", route: "/create/[projectId]/storyboard" },
  { id: "STUDIO", label: "design studio", phase: "05", route: "/projects/[projectId]" },
];

export function CreationFlowBreadcrumbs({ activeStep, projectId, className }: BreadcrumbsProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {STEPS.map((step, index) => {
        const isActive = activeStep === step.id;
        const isPast = STEPS.findIndex(s => s.id === activeStep) > index;
        const canNavigate = isPast && projectId;
        
        const href = step.route.replace("[projectId]", projectId || "");

        const content = isActive ? (
          <Badge 
            variant="default" 
            className="text-base px-5 py-1.5 rounded-full lowercase shadow-[0_0_30px_rgba(var(--primary-rgb),0.6)] animate-in zoom-in-95 duration-300 italic font-black border-2 border-primary-foreground/20"
          >
            {step.label}
          </Badge>
        ) : (
          <span
            className={cn(
              "text-sm transition-all duration-300 lowercase px-2",
              isPast 
                ? "text-foreground font-bold hover:text-primary cursor-pointer" 
                : "text-muted-foreground/30 font-medium cursor-default"
            )}
          >
            {step.label}
          </span>
        );

        return (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex items-center relative">
              {canNavigate ? (
                <Link href={href}>
                  {content}
                </Link>
              ) : content}
            </div>
            {index < STEPS.length - 1 && (
              <ChevronRight className={cn(
                "w-5 h-5 transition-colors duration-500",
                isPast ? "text-primary/40" : "text-muted-foreground/10"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
