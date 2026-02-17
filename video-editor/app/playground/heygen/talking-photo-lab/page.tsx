"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  Image as ImageIcon, 
  Type, 
  Mic, 
  Play, 
  Loader2, 
  Info, 
  Video,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadToSupabase } from "@/lib/storage";

export default function TalkingPhotoLabPage() {
  // Step State
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Step 1: Registration State
  const [photoUrl, setPhotoUrl] = useState("");
  const [registeredPhotoId, setRegisteredPhotoId] = useState<string | null>(null);
  const [avatarStatus, setAvatarStatus] = useState<string | null>(null);
  const [avatarData, setAvatarData] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPollingAvatar, setIsPollingAvatar] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Step 2: Generation State
  const [activeVoiceType, setActiveVoiceType] = useState<"text" | "audio">("text");
  const [formData, setFormData] = useState({
    input_text: "Hello from the Talking Photo Lab! I am now a dynamic avatar.",
    audio_url: "",
    background_color: "#FFFFFF",
    title: "Talking Photo Output",
    scale: 1,
    caption: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // Tracking State
  const [trackId, setTrackId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackResult, setTrackResult] = useState<any>(null);
  const [manualIdInput, setManualIdInput] = useState("");
  const [manualType, setManualType] = useState<"avatar" | "video">("avatar");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // --- Step 1 Actions ---
  const handleRegisterPhoto = async () => {
    if (!photoUrl) return;
    setIsRegistering(true);
    setRegistrationError(null);
    setRegisteredPhotoId(null);

    try {
      const response = await fetch("/api/heygen/talking-photo/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_url: photoUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Heygen V2 returns data.data.talking_photo_id
      const id = data.data?.talking_photo_id;
      if (id) {
        setRegisteredPhotoId(id);
        setAvatarStatus(data.data?.status || 'pending');
        setAvatarData(data.data);
        // Start polling for avatar readiness
        pollAvatarStatus(id);
      } else {
        throw new Error("No talking_photo_id returned from API");
      }
    } catch (err: any) {
      setRegistrationError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const pollAvatarStatus = async (id: string) => {
    setIsPollingAvatar(true);
    let attempts = 0;
    const maxAttempts = 30; // Poll for 2.5 minutes (5s intervals)

    const poll = async () => {
      try {
        const response = await fetch(`/api/heygen/talking-photo/status?photo_id=${id}`);
        const data = await response.json();
        
        if (response.ok) {
          const status = data.data?.status;
          setAvatarStatus(status);
          setAvatarData(data.data);
          
          if (status === 'completed') {
            setIsPollingAvatar(false);
            return;
          } else if (status === 'failed') {
            setRegistrationError(`Avatar registration failed on Heygen side: ${data.data?.moderation_msg || 'Unknown error'}`);
            setIsPollingAvatar(false);
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setRegistrationError('Avatar readiness timeout. Proceed with caution.');
          setIsPollingAvatar(false);
        }
      } catch (err) {
        console.error('Polling avatar status error:', err);
        setIsPollingAvatar(false);
      }
    };

    poll();
  };

  const handleManualRecovery = () => {
    if (!manualIdInput) return;
    if (manualType === "avatar") {
      setRegisteredPhotoId(manualIdInput);
      pollAvatarStatus(manualIdInput);
    } else {
      setTrackId(manualIdInput);
      setVideoData({ video_id: manualIdInput });
      setTrackResult({ status: 'polling' });
      setCurrentStep(2); // Jump to results step
    }
    setManualIdInput("");
  };

  // --- Step 2 Actions ---
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAudio(true);
    try {
      const publicUrl = await uploadToSupabase(file, `playground-audio/${Date.now()}-${file.name}`);
      setFormData({ ...formData, audio_url: publicUrl });
    } catch (err: any) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!registeredPhotoId) return;
    console.log('[Heygen Lab] Generating video with ID:', registeredPhotoId);
    setIsGenerating(true);
    setGenerationError(null);
    setVideoData(null);

    const payload = {
      caption: formData.caption,
      video_inputs: [
        {
          character: { 
            type: "talking_photo", 
            talking_photo_id: registeredPhotoId,
            scale: formData.scale
          },
          voice: activeVoiceType === "text"
            ? { 
                type: "text", 
                input_text: formData.input_text, 
                voice_id: "2d5b0e6cfdba4191af46571597517b60" // Default 
              }
            : { type: "audio", audio_url: formData.audio_url },
          background: {
            type: "color",
            value: formData.background_color
          }
        }
      ],
      dimension: { width: 1280, height: 720 }
    };

    console.log('[Heygen Lab] Synthesis Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch("/api/heygen/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setVideoData(data.data);
      if (data.data?.video_id) {
        setTrackId(data.data.video_id);
      }
    } catch (err: any) {
      setGenerationError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const checkVideoStatus = async () => {
    if (!trackId) return;
    setIsTracking(true);
    try {
      const response = await fetch(`/api/heygen/video/status?video_id=${trackId}`);
      const data = await response.json();
      if (response.ok) {
        setTrackResult(data.data);
        if (data.data?.status === 'failed') {
          setGenerationError(`Video generation failed: ${data.data?.error?.message || 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 selection:bg-indigo-100 font-sans">
      <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <Link 
              href="/playground/heygen" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Back to Manifest
            </Link>
            <div className="space-y-1">
              <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none text-neutral-900">
                Talking Photo <span className="text-indigo-600">Lab</span>
              </h1>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">
                Sequential Photo Registration & Synthesis Pipeline
              </p>
            </div>
          </div>

          <div className="flex bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200 shadow-sm">
             <div className={`px-6 py-3 rounded-xl flex items-center gap-3 transition-all ${currentStep === 1 ? "bg-white text-indigo-600 shadow-md" : "text-neutral-400"}`}>
                <span className="text-sm font-black italic">01</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Register Photo</span>
             </div>
             <div className="flex items-center px-4 text-neutral-200">
                <ChevronRight className="w-4 h-4" />
             </div>
             <div className={`px-6 py-3 rounded-xl flex items-center gap-3 transition-all ${currentStep === 2 ? "bg-white text-indigo-600 shadow-md" : "text-neutral-400"}`}>
                <span className="text-sm font-black italic">02</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Generate Video</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Workspace */}
          <div className="lg:col-span-12 space-y-10">
            
            {/* RECOVERY SECTION */}
            <Card className="border-4 border-dashed border-neutral-100 bg-neutral-50/50 rounded-[2rem] overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                      <RefreshCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900">Recovery Console</h3>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Track existing entity or video ID</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-1 max-w-2xl gap-2">
                    <div className="flex bg-white rounded-xl border border-neutral-200 p-1">
                      <Button 
                        variant={manualType === "avatar" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setManualType("avatar")}
                        className="rounded-lg text-[9px] font-black tracking-widest px-4 h-8"
                      >
                        AVATAR
                      </Button>
                      <Button 
                        variant={manualType === "video" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setManualType("video")}
                        className="rounded-lg text-[9px] font-black tracking-widest px-4 h-8"
                      >
                        VIDEO
                      </Button>
                    </div>
                    <Input 
                      value={manualIdInput}
                      onChange={(e) => setManualIdInput(e.target.value)}
                      placeholder={`Enter ${manualType} ID...`}
                      className="flex-1 rounded-xl border-neutral-200 text-xs font-mono h-10"
                    />
                    <Button 
                      onClick={handleManualRecovery}
                      disabled={!manualIdInput}
                      className="rounded-xl bg-neutral-900 text-white font-black uppercase text-[9px] tracking-widest px-6 h-10"
                    >
                      SYNC
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* STEP 1: REGISTRATION */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Photo Registration</h2>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Convert any image URL into a Heygen Talking Photo Entity</p>
                    </div>
                  </div>

                  <Card className="border-4 border-white bg-white shadow-2xl rounded-[3rem] overflow-hidden">
                    <CardContent className="p-10 space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Public Image URL</label>
                        <div className="flex flex-col md:flex-row gap-4">
                          <Input 
                            value={photoUrl}
                            onChange={(e) => setPhotoUrl(e.target.value)}
                            placeholder="https://cloudinary.com/your-ai-generated-photo.jpg"
                            className="flex-1 py-8 px-6 rounded-2xl border-2 border-neutral-100 focus:border-indigo-500 text-sm font-mono transition-all"
                          />
                          <Button 
                            onClick={handleRegisterPhoto}
                            disabled={isRegistering || !photoUrl}
                            className="py-8 px-10 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-neutral-200 disabled:opacity-30"
                          >
                            {isRegistering ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <RefreshCcw className="w-4 h-4 mr-3" />
                                Register ID
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-[9px] text-neutral-400 font-medium italic">
                          Tip: Use a URL from Cloudinary or Google Imagen. The image must contain a clear human/humanoid face.
                        </p>
                      </div>

                      {registrationError && (
                        <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-4 animate-in zoom-in-95">
                           <AlertCircle className="w-5 h-5 text-rose-500" />
                           <p className="text-sm font-bold text-rose-600">{registrationError}</p>
                        </div>
                      )}

                      {registeredPhotoId && (
                        <div className="p-8 bg-indigo-50 border-2 border-indigo-100 rounded-[2rem] space-y-6 animate-in fade-in slide-in-from-top-4">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                                  <CheckCircle2 className="w-4 h-4" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black uppercase tracking-tight text-indigo-900">
                                    {isPollingAvatar ? 'Finalizing Entity Configuration...' : 'Entity Successfully Created'}
                                  </p>
                                  <p className="text-[8px] text-indigo-400 font-bold uppercase tracking-widest">
                                    Status: <span className={`${avatarStatus === 'completed' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                                      {avatarStatus?.toUpperCase() || 'UNKNOWN'}
                                    </span>
                                  </p>
                               </div>
                             </div>
                             <Badge className={`bg-white border-2 px-4 py-1 ${avatarStatus === 'completed' ? 'text-emerald-500 border-emerald-100' : 'text-amber-500 border-amber-100'}`}>
                               {avatarStatus === 'completed' ? 'Ready' : 'Pending'}
                             </Badge>
                           </div>

                           <div className="flex flex-col md:flex-row items-center gap-4">
                              <div className="flex-1 w-full p-4 bg-white rounded-xl border border-indigo-100 font-mono text-xs text-indigo-900 flex items-center justify-between overflow-hidden">
                                 <span className="truncate mr-4">{registeredPhotoId}</span>
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   onClick={() => copyToClipboard(registeredPhotoId)}
                                   className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50"
                                 >
                                    {copiedId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                 </Button>
                              </div>
                              <Button 
                                onClick={() => setCurrentStep(2)}
                                className="w-full md:w-auto py-6 px-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px]"
                              >
                                 Proceed to Step 2
                                 <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                           </div>
                        </div>
                      )}

                      {avatarData && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 mt-8">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Raw Entity Schema</label>
                            <Badge variant="outline" className="text-[8px] font-mono border-neutral-100 text-neutral-400">application/json</Badge>
                          </div>
                          <div className="bg-neutral-900 rounded-2xl p-6 font-mono text-[10px] text-indigo-300 overflow-x-auto border-4 border-neutral-800 shadow-inner">
                            <pre>{JSON.stringify(avatarData, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>
              </div>
            )}

            {/* STEP 2: GENERATION */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Config Panel */}
                    <div className="lg:col-span-5 space-y-8">
                       <section className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-100">
                              <Video className="w-5 h-5" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Video Synthesis</h2>
                              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Animate the registered photo with sonic input</p>
                            </div>
                          </div>

                          <Card className="border-4 border-white bg-white shadow-2xl rounded-[3rem] overflow-hidden">
                             <CardContent className="p-8 space-y-8">
                                {/* Voice Selector */}
                                <div className="space-y-4">
                                   <div className="flex items-center justify-between">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Input Protocol</label>
                                   </div>
                                   <div className="flex bg-neutral-50 p-1.5 rounded-2xl border border-neutral-100">
                                      <button 
                                        onClick={() => setActiveVoiceType("text")}
                                        className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${activeVoiceType === "text" ? "bg-white text-indigo-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"}`}
                                      >
                                        <Type className="w-3.5 h-3.5" />
                                        Script
                                      </button>
                                      <button 
                                        onClick={() => setActiveVoiceType("audio")}
                                        className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${activeVoiceType === "audio" ? "bg-white text-indigo-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"}`}
                                      >
                                        <Mic className="w-3.5 h-3.5" />
                                        Audio
                                      </button>
                                   </div>
                                </div>

                                {activeVoiceType === "text" ? (
                                   <div className="space-y-4">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Script Context</label>
                                      <Textarea 
                                        value={formData.input_text}
                                        onChange={(e) => setFormData({ ...formData, input_text: e.target.value })}
                                        className="rounded-2xl border-2 border-neutral-100 focus:border-indigo-500 min-h-[160px] p-6 text-sm leading-relaxed"
                                        placeholder="What should the avatar speak?"
                                      />
                                   </div>
                                ) : (
                                   <div className="space-y-6">
                                      <div className="space-y-4">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Audio Master URL</label>
                                         <div className="flex gap-3">
                                            <Input 
                                              value={formData.audio_url}
                                              onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                                              className="rounded-xl border-2 border-neutral-100 focus:border-indigo-500 font-mono text-xs p-6"
                                              placeholder="https://..."
                                            />
                                            <div className="relative">
                                               <input 
                                                 type="file" 
                                                 accept="audio/*" 
                                                 className="hidden" 
                                                 id="lab-audio-upload"
                                                 onChange={handleAudioUpload}
                                                 disabled={isUploadingAudio}
                                               />
                                               <Button 
                                                 onClick={() => document.getElementById('lab-audio-upload')?.click()}
                                                 disabled={isUploadingAudio}
                                                 className="h-full px-4 rounded-xl border-2 border-neutral-100 bg-neutral-50 text-neutral-400 hover:text-indigo-600"
                                               >
                                                  {isUploadingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                                               </Button>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                )}

                                <div className="pt-6 border-t border-neutral-50">
                                   <Button 
                                     onClick={handleGenerateVideo}
                                     disabled={isGenerating}
                                     className="w-full py-8 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-neutral-200 active:scale-95 transition-all"
                                   >
                                      {isGenerating ? (
                                        <>
                                          <Loader2 className="w-5 h-5 mr-4 animate-spin" />
                                          Mastering Stream...
                                        </>
                                      ) : (
                                        <>
                                          <Play className="w-5 h-5 mr-4 fill-white" />
                                          Initial Synthesis
                                        </>
                                      )}
                                   </Button>
                                    <Button 
                                      variant="ghost"
                                      onClick={() => setCurrentStep(1)}
                                      className="w-full mt-4 text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-rose-500"
                                    >
                                       Back to Step 1
                                    </Button>
                                </div>
                             </CardContent>
                          </Card>
                       </section>
                    </div>

                    {/* Output Panel */}
                    <div className="lg:col-span-7 space-y-8">
                       <section className="space-y-6">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                  <Video className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Virtual Output</h2>
                              </div>
                              <div className="flex items-center gap-3">
                                 <Badge variant="outline" className="text-[8px] border-neutral-100 text-neutral-400 uppercase font-black">Enc: H.264</Badge>
                                 <Badge variant="outline" className="text-[8px] border-neutral-100 text-neutral-400 uppercase font-black">Res: 720p</Badge>
                              </div>
                           </div>

                           <Card className="border-8 border-white bg-white shadow-2xl rounded-[3.5rem] overflow-hidden aspect-video relative group">
                              <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                                 {isGenerating ? (
                                    <div className="text-center space-y-6 relative z-10">
                                      <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
                                      <div className="space-y-1">
                                         <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] animate-pulse">Processing Frame Data</p>
                                         <p className="text-[8px] text-white/30 font-mono italic">Synchronizing audio vertices with facial geometry</p>
                                      </div>
                                    </div>
                                 ) : trackResult?.video_url ? (
                                    <video 
                                      src={trackResult.video_url} 
                                      controls 
                                      className="w-full h-full object-contain"
                                      autoPlay
                                    />
                                 ) : videoData ? (
                                    <div className="text-center space-y-8 p-12">
                                       <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-500/50">
                                          <CheckCircle2 className="w-8 h-8" />
                                       </div>
                                       <div className="space-y-3">
                                          <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">Job Dispatched</h3>
                                          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                                            Telemetry confirms successful hand-off. Video ID: {videoData.video_id}
                                          </p>
                                       </div>
                                       <Button 
                                         onClick={checkVideoStatus}
                                         disabled={isTracking}
                                         className="bg-white text-neutral-900 hover:bg-neutral-100 rounded-2xl px-12 py-7 font-black uppercase tracking-[0.2em] text-[10px]"
                                       >
                                          {isTracking ? "Polling Sensors..." : "Fetch Results"}
                                       </Button>
                                    </div>
                                 ) : (
                                    <div className="text-center space-y-4 opacity-20 group-hover:opacity-40 transition-opacity">
                                       <Video className="w-16 h-16 text-white mx-auto" />
                                       <p className="text-[10px] font-black italic uppercase tracking-[0.3em] text-white">Standby for Signal</p>
                                    </div>
                                 )}
                              </div>
                           </Card>

                           {generationError && (
                             <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl animate-in fade-in flex items-start gap-4">
                                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                                <div>
                                   <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Synthesis Failure</p>
                                   <p className="text-sm font-bold text-rose-600 leading-tight">{generationError}</p>
                                </div>
                             </div>
                           )}

                           {/* Technical Status Overlay */}
                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-6 rounded-3xl bg-white border-2 border-neutral-100 flex items-center justify-between">
                                 <div>
                                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Entity ID</p>
                                    <p className="text-xs font-mono font-bold text-neutral-900 truncate max-w-[120px]">
                                       {registeredPhotoId ? registeredPhotoId : "NULL_PTR"}
                                    </p>
                                 </div>
                                 <div className={`w-3 h-3 rounded-full ${registeredPhotoId ? "bg-emerald-500" : "bg-neutral-100"}`} />
                              </div>
                              <div className="p-6 rounded-3xl bg-white border-2 border-neutral-100 flex items-center justify-between">
                                 <div>
                                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Video Stream</p>
                                    <p className="text-xs font-mono font-bold text-neutral-900">
                                       {trackResult?.status ? trackResult.status.toUpperCase() : "DISCONNECTED"}
                                    </p>
                                 </div>
                                 <div className={`w-3 h-3 rounded-full ${trackResult?.status === 'completed' ? "bg-emerald-500" : trackId ? "bg-amber-500 animate-pulse" : "bg-neutral-100"}`} />
                              </div>
                           </div>
                       </section>
                    </div>

                 </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer info */}
        <footer className="pt-20 border-t border-neutral-100 text-center space-y-4">
           <div className="flex items-center justify-center gap-12">
              <div className="flex flex-col items-center">
                 <span className="text-[8px] font-black uppercase tracking-widest text-neutral-300">Auth Key</span>
                 <span className="text-[10px] font-mono font-bold text-neutral-600">HEY_GEN_CORE_V2</span>
              </div>
              <div className="flex flex-col items-center">
                 <span className="text-[8px] font-black uppercase tracking-widest text-neutral-300">API Status</span>
                 <span className="text-[10px] font-mono font-bold text-emerald-500">OPERATIONAL</span>
              </div>
              <div className="flex flex-col items-center">
                 <span className="text-[8px] font-black uppercase tracking-widest text-neutral-300">GPU Cluster</span>
                 <span className="text-[10px] font-mono font-bold text-neutral-600">US_EAST_014</span>
              </div>
           </div>
           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neutral-300">Autonomous Avatar Production Engine</p>
        </footer>
      </div>
    </div>
  );
}
