"use client";

interface TwoColumnLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function TwoColumnLayout({
  leftPanel,
  rightPanel,
}: TwoColumnLayoutProps) {
  return (
    <div className="flex h-full">
      {/* Left Panel - Output/Preview (55%) */}
      <div className="flex-[55] min-w-0 overflow-y-auto scrollbar-hide border-r border-border">
        {leftPanel}
      </div>
      
      {/* Right Panel - Input/Settings (45%) */}
      <div className="flex-[45] min-w-0 overflow-y-auto scrollbar-hide bg-muted/5">
        {rightPanel}
      </div>
    </div>
  );
}
