# Premium Studio Animations Reference

This file contains the high-end, high-motion animations for the Storyboard Studio. These have been backed up here to allow for a simplified "basic" UI during initial client showcases, while preserving the premium "vibe" for the final delivery.

## 1. Global CSS Animations (`app/globals.css`)

```css
@keyframes scan {
  0% { top: 0; opacity: 0; }
  5% { opacity: 1; }
  95% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes thought-stream-in {
  0% { transform: translateX(20px); opacity: 0; filter: blur(4px); }
  100% { transform: translateX(0); opacity: 1; filter: blur(0); }
}

@keyframes minimal-glow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.mask-fade-horizontal {
  mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
}
```

## 2. Minimalist "Thought Stream" Log (`page.tsx`)

```tsx
<div className="flex-1 overflow-y-auto pt-24 pb-12 p-6 flex flex-col gap-5 scrollbar-hide">
  {localLogs.map((log, i) => {
      const isLast = i === localLogs.length - 1;
      const agentName = log.msg.split(':')[0];
      const cleanMsg = log.msg.includes(':') ? log.msg.split(':').slice(1).join(':').trim() : log.msg;
      
      return (
          <div 
            key={i} 
            className={cn(
                "group flex items-start gap-4 animate-[thought-stream-in_0.6s_ease-out_forwards]",
                !isLast && "opacity-40 grayscale-[0.5] scale-[0.98] origin-left transition-all duration-700"
            )}
            style={{ animationDelay: `${(localLogs.length - i) * 50}ms` }}
          >
              {/* Minimalist Glowing Indicator */}
              <div className="mt-1.5 shrink-0 relative">
                  <div className={cn(
                      "w-1.5 h-1.5 rounded-full z-10 relative shadow-[0_0_8px]",
                      log.type === 'orchestrator' ? "bg-primary shadow-primary/50" : 
                      log.type === 'agent' ? "bg-amber-500 shadow-amber-500/50" : 
                      log.type === 'success' ? "bg-green-500 shadow-green-500/50" : "bg-muted-foreground/40 shadow-transparent"
                  )} />
                  {isLast && isSimulating && (
                      <div className="absolute inset-0 w-1.5 h-1.5 bg-current rounded-full animate-ping opacity-40" />
                  )}
              </div>

              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                      <span className={cn(
                          "text-[8px] technical-label font-bold uppercase tracking-[0.2em] whitespace-nowrap",
                          log.type === 'orchestrator' ? "text-primary/70" : 
                          log.type === 'agent' ? "text-amber-500/70" : 
                          log.type === 'success' ? "text-green-500/70" : "text-muted-foreground/40"
                      )}>
                          {agentName || log.type}
                      </span>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-border/20 via-border/5 to-transparent" />
                  </div>
                  
                  <div className="relative overflow-hidden group/text">
                      <p className={cn(
                          "text-[10px] font-medium tracking-tight whitespace-nowrap",
                          isLast && isSimulating ? "animate-[scroll_15s_linear_infinite]" : "truncate"
                      )}>
                          {cleanMsg}
                          {isLast && isSimulating && <span className="ml-12 opacity-30 text-[8px] uppercase tracking-widest">{cleanMsg}</span>}
                      </p>
                  </div>
              </div>
          </div>
      );
  })}
  <div ref={logEndRef} />
</div>
```

## 3. Cinematic Scene Processing Overlay (`scene-card.tsx`)

```tsx
{isProcessing && (
  <div className="absolute inset-0 z-40 bg-amber-950/10 backdrop-blur-[4px] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
    {/* Minimalist Top-Left Loaders (Film Reels) */}
    <div className="absolute top-4 left-4 flex gap-2 opacity-80 z-50">
        <Film className="w-5 h-5 text-amber-500 animate-[spin_4s_linear_infinite]" />
        <div className="absolute -top-1 -right-4 flex items-center gap-1.5 px-2 py-0.5 bg-red-600/90 rounded-md border border-white/20 animate-pulse">
            <div className="w-1 h-1 rounded-full bg-white" />
            <span className="text-[7px] font-black tracking-widest text-white uppercase">REC</span>
        </div>
    </div>

    {/* Bottom Live Data Ribbon */}
    <div className="absolute bottom-4 inset-x-4 overflow-hidden mask-fade-horizontal">
        <div className="flex gap-8 whitespace-nowrap animate-[scroll_15s_linear_infinite]">
            <span className="text-[7px] technical-label font-black text-amber-500/60 uppercase tracking-[0.2em]">PRODUCTION_PIPELINE_ACTIVE...</span>
            <span className="text-[7px] technical-label font-black text-amber-500/60 uppercase tracking-[0.2em]">GENERATING_SCENE_ASSETS...</span>
            <span className="text-[7px] technical-label font-black text-amber-500/60 uppercase tracking-[0.2em]">ENCODING_PIXELS_V4...</span>
            <span className="text-[7px] technical-label font-black text-amber-500/60 uppercase tracking-[0.2em]">AGENT_ORCHESTRATION_SYNCING...</span>
        </div>
    </div>
  </div>
)}
```
