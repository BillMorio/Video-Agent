"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Send, Paperclip, X, Mic2, Sparkles, 
  Loader2, Play, Download, History, MessageSquare, 
  Terminal, Activity, Settings2, Music, Film, FileAudio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FFMPEG_SERVER = "http://localhost:3333";

interface Attachment { 
  name: string; 
  filename: string; 
  url: string; 
  type: string; 
  metadata?: any; 
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[];
  operation?: {
    name: string;
    status: "pending" | "completed" | "failed";
    output?: string;
    details?: any;
  };
}

export default function AgentLabPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content: "Protocol initialized. I am the **Sonic Architect**. Upload your audio assets and describe the temporal surgery you require. I have full orchestration over the FFmpeg cluster.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFilesToUpload([...filesToUpload, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFilesToUpload(filesToUpload.filter((_, i) => i !== index));
  };

  const uploadFilesToServer = async () => {
    const results = [];
    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(`${FFMPEG_SERVER}/api/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        
        // Auto-probe metadata
        let metadata = null;
        try {
          const probeRes = await fetch(`${FFMPEG_SERVER}/api/agent/probe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: data.filename })
          });
          const probeData = await probeRes.json();
          metadata = probeData.metadata;
        } catch (mErr) {
          console.error("Probe error:", mErr);
        }

        results.push({
          name: file.name,
          filename: data.filename,
          url: `${FFMPEG_SERVER}${data.path}`,
          type: file.type.startsWith("video") ? "video" : "audio",
          metadata
        });
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
    return results;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() && filesToUpload.length === 0) return;

    const userMessageContent = inputValue.trim();
    setInputValue("");
    
    // Upload files first if any
    let newAttachments: any[] = [];
    if (filesToUpload.length > 0) {
      newAttachments = await uploadFilesToServer();
      setUploadedFiles([...uploadedFiles, ...newAttachments]);
      setFilesToUpload([]);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessageContent,
      attachments: newAttachments,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Prepare context for the agent
      const messagesForAI = messages.concat(userMsg).map((m) => {
        let content = m.content || "";
        if (m.role === "user" && m.attachments) {
           const attachmentsContext = m.attachments.map(a => 
             `${a.name} (ID: ${a.filename}${a.metadata ? `, Duration: ${a.metadata.duration?.toFixed(3)}s` : ""})`
           ).join(", ");
           content += `\n\n[SYSTEM CONTEXT: User uploaded files: ${attachmentsContext}]`;
        }
        return {
          role: m.role,
          content: content,
        };
      });

      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesForAI }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message.content,
        operation: data.operation_details ? {
          name: data.operation_details[0]?.name || "Unknown Operation",
          status: "completed",
          output: data.operation_details[0]?.content ? JSON.parse(data.operation_details[0].content).outputFile : null,
          details: data.operation_details[0]?.content ? JSON.parse(data.operation_details[0].content) : null,
        } : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: "error",
        role: "system",
        content: `Sonic Pipeline Breach: ${err instanceof Error ? err.message : "Connection Lost"}`,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 font-sans flex flex-col">
      {/* Premium Header */}
      <nav className="border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/playground/ffmpeg">
              <Button variant="ghost" className="rounded-xl hover:bg-neutral-50 group px-3">
                <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
              </Button>
            </Link>
            <div className="h-8 w-[1px] bg-neutral-100" />
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-600 text-white border-none text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm">Agent Core v4.2</Badge>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic flex items-center gap-1.5">
                    <Activity className="w-3 h-3" />
                    Neural Hub Active
                  </span>
               </div>
               <h1 className="text-xl font-black uppercase tracking-tight text-neutral-900">Agent <span className="text-indigo-600 italic">Lab</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-neutral-100 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20" />
                  </div>
                ))}
             </div>
             <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-2">Autonomous Mode</span>
          </div>
        </div>
      </nav>

      {/* Chat Space */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto p-8 flex flex-col gap-8 h-[calc(100vh-80px)] overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar scroll-smooth"
        >
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-500`}
            >
              <div className="flex gap-4 max-w-[80%]">
                {message.role === "assistant" && (
                   <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
                      <Sparkles className="w-5 h-5" />
                   </div>
                )}
                
                <div className="space-y-3">
                   {message.content && (
                     <div className={`p-6 rounded-[1.5rem] shadow-sm border-2 ${
                        message.role === "user" 
                          ? "bg-indigo-600 text-white border-indigo-500 rounded-tr-none" 
                          : message.role === "system"
                            ? "bg-rose-50 text-rose-600 border-rose-100 text-xs font-bold font-mono"
                            : "bg-white text-neutral-800 border-neutral-100 rounded-tl-none px-8"
                      }`}>
                        <div className="prose prose-sm prose-neutral">
                           {message.content.split('\n').map((line, i) => (
                             <p key={i} className={`m-0 ${message.role === "user" ? "text-white" : ""}`}>
                                {line}
                             </p>
                           ))}
                        </div>
                     </div>
                   )}

                   {/* Attachments Display */}
                   {message.attachments && message.attachments.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                        {message.attachments.map((file, i) => (
                          <div key={i} className="bg-white p-3 rounded-xl border border-neutral-100 flex items-center gap-3 shadow-sm group hover:border-indigo-200 transition-all">
                             <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                {file.type === "video" ? <Film className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                             </div>
                             <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-black uppercase tracking-tight truncate max-w-[100px]">{file.name}</span>
                                   {file.metadata?.duration && (
                                     <Badge className="bg-blue-100 text-blue-600 border-none text-[7px] font-black h-3 px-1">
                                       {file.metadata.duration.toFixed(2)}s
                                     </Badge>
                                   )}
                                </div>
                                <span className="text-[8px] font-bold text-neutral-400">Telemetry Captured</span>
                             </div>
                          </div>
                        ))}
                     </div>
                   )}

                   {/* Operation Results */}
                   {message.operation && message.operation.status === "completed" && message.operation.output && (
                     <Card className="border-emerald-200 bg-emerald-50/20 shadow-none rounded-[2rem] overflow-hidden border-2 animate-in zoom-in-95 duration-500 mt-4">
                        <CardHeader className="p-5 border-b border-emerald-100 flex flex-row items-center justify-between bg-emerald-100/30">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-500 rounded-xl text-white">
                                 <Play className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600">Generated Asset</span>
                                 <CardTitle className="text-[11px] font-black uppercase tracking-tight">Audio Fragment Result</CardTitle>
                              </div>
                           </div>
                           <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-black">2.4MB • MP3</Badge>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                           <audio src={`${FFMPEG_SERVER}${message.operation.output}`} controls className="w-full h-10" />
                           <div className="flex gap-3">
                              <Button className="flex-1 bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 rounded-xl py-5 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                 <Download className="w-3.5 h-3.5 mr-2" />
                                 Export Original
                              </Button>
                              <Button variant="outline" className="flex-1 border-neutral-200 rounded-xl py-5 text-[10px] font-black uppercase tracking-widest bg-white">
                                 Save to Library
                              </Button>
                           </div>
                        </CardContent>
                     </Card>
                   )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
             <div className="flex items-center gap-3 text-neutral-400 animate-pulse">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                   <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest italic">Awaiting Agent Computation...</span>
             </div>
          )}
        </div>

        {/* Action Zone / Input */}
        <div className="space-y-4">
           {filesToUpload.length > 0 && (
             <div className="flex flex-wrap gap-2 animate-in slide-in-from-bottom-4">
                {filesToUpload.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-neutral-900 text-white p-2 rounded-xl pr-3 group">
                     <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                        <Paperclip className="w-3 h-3" />
                     </div>
                     <span className="text-[10px] font-bold truncate max-w-[150px]">{file.name}</span>
                     <button onClick={() => removeFile(i)} className="p-1 hover:bg-white/20 rounded-md transition-colors">
                        <X className="w-3 h-3 text-neutral-400" />
                     </button>
                  </div>
                ))}
             </div>
           )}

           <div className="bg-white border-2 border-neutral-100 rounded-[2.5rem] p-3 pl-8 shadow-xl shadow-neutral-200/50 flex items-center gap-4 group focus-within:border-indigo-400 transition-all duration-500">
              <input 
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-2xl transition-all hover:scale-105 active:scale-95 group/btn"
              >
                <Paperclip className="w-5 h-5 text-neutral-400 group-focus-within:text-indigo-500 group-hover/btn:text-indigo-600 transition-colors" />
              </button>
              
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Instruct the Sonic Architect..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm font-bold text-neutral-800 placeholder:text-neutral-300 placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
              />

              <Button 
                onClick={sendMessage}
                disabled={isTyping || (!inputValue.trim() && filesToUpload.length === 0)}
                className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center p-0 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none"
              >
                <Send className="w-5 h-5" />
              </Button>
           </div>
           
           <div className="flex justify-center gap-8 py-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 italic">Cluster Online: Port 3333</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings2 className="w-3 h-3 text-neutral-300" />
                <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Context: Global Audio Buffer</span>
              </div>
           </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #EEF2FF;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #E0E7FF;
        }
      `}</style>
    </div>
  );
}
