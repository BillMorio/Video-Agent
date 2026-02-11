"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Image as ImageIcon,
  Search
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AGE_OPTIONS = ["Young Adult", "Early Middle Age", "Late Middle Age", "Senior", "Unspecified"];
const GENDER_OPTIONS = ["Woman", "Man", "Unspecified"];
const ETHNICITY_OPTIONS = [
  "White", "Black", "Hispanic", "Asian", "Middle Eastern", 
  "Indian", "Pacific Islander", "Native American", "Mixed", "Other", "Unspecified"
];
const ORIENTATION_OPTIONS = ["square", "horizontal", "vertical"];
const POSE_OPTIONS = ["half_body", "close_up", "full_body"];
const STYLE_OPTIONS = ["Realistic", "Pixar", "Cinematic", "Vintage", "Noir", "Cyberpunk", "Unspecified"];

export default function GeneratePhotoAvatarPage() {
  const [formData, setFormData] = useState({
    name: "",
    age: "Young Adult",
    gender: "Woman",
    ethnicity: "White",
    orientation: "square",
    pose: "half_body",
    style: "Realistic",
    appearance: ""
  });

  const [generating, setGenerating] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/heygen/photo-avatar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      // Heygen returns generation_id in the response
      const id = data.data?.generation_id || data.generation_id;
      setPhotoId(id);
      
      // Start polling for status
      if (id) {
        pollStatus(id);
      } else {
        throw new Error("No generation ID returned from API");
      }

    } catch (err: any) {
      setError(err.message);
      setGenerating(false);
    }
  };

  const pollStatus = async (id: string) => {
    setPolling(true);
    const maxAttempts = 60; // Poll for up to 5 minutes (5s intervals)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/heygen/photo-avatar/status?photo_id=${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Status check failed");
        }

        const status = data.data?.status || data.status;

        if (status === "completed") {
          setResult(data.data || data);
          setGenerating(false);
          setPolling(false);
          return;
        } else if (status === "failed") {
          throw new Error("Photo avatar generation failed");
        }

        // Continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          throw new Error("Generation timeout - please check status manually");
        }

      } catch (err: any) {
        setError(err.message);
        setGenerating(false);
        setPolling(false);
      }
    };

    poll();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-indigo-100 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Navigation */}
        <Link 
          href="/playground/heygen" 
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors group font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Avatar Manifest
        </Link>

        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Photo Avatar Generator</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-tight">
            Generate <br /> <span className="text-indigo-600 opacity-80">Custom Avatar</span>
          </h1>
          <p className="text-neutral-500 font-medium max-w-lg leading-relaxed">
            Create a high-fidelity AI-generated photo avatar using text prompts. Specify demographics, style, and appearance details.
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border-2 border-neutral-100 rounded-2xl overflow-hidden">
            <CardContent className="p-8 space-y-6">
              {/* Avatar Name */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-700">
                  Avatar Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  placeholder="e.g., Professional Business Avatar"
                />
              </div>

              {/* Demographics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-700">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  >
                    {AGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-700">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  >
                    {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {/* Ethnicity */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-700">
                    Ethnicity <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.ethnicity}
                    onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  >
                    {ETHNICITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {/* Orientation */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-700">
                    Orientation <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.orientation}
                    onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  >
                    {ORIENTATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {/* Pose */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-700">
                    Pose <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.pose}
                    onChange={(e) => setFormData({ ...formData, pose: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  >
                    {POSE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                  </select>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-700">
                    Style <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.style}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  >
                    {STYLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              {/* Appearance Description */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-700">
                  Appearance Description <span className="text-red-500">*</span>
                  <span className="text-neutral-400 font-normal ml-2">({formData.appearance.length}/1000)</span>
                </label>
                <textarea
                  required
                  value={formData.appearance}
                  onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                  maxLength={1000}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-white focus:border-indigo-500 outline-none transition-all font-medium resize-none"
                  placeholder="Describe clothing, mood, lighting, background, etc. Be specific and detailed."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={generating}
            className="w-full px-8 py-4 rounded-xl bg-neutral-900 text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {polling ? "Generating Avatar..." : "Initiating..."}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Photo Avatar
              </>
            )}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="p-6 rounded-2xl bg-red-50 border-2 border-red-100 text-red-600 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-6 h-6" />
            <div className="flex-1">
              <p className="font-bold uppercase tracking-tight text-sm">Generation Error</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <Card className="border-2 border-emerald-100 rounded-2xl overflow-hidden bg-emerald-50/50 animate-in fade-in slide-in-from-bottom-4">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-black uppercase tracking-tight text-sm text-emerald-900">Avatar Generated Successfully</p>
                  <p className="text-xs text-emerald-700">Your custom photo avatar is ready</p>
                </div>
              </div>

              {/* Preview Image */}
              {result.image_url && (
                <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
                  <img 
                    src={result.image_url} 
                    alt="Generated Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Avatar Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-neutral-100">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Avatar ID</p>
                    <p className="font-mono text-sm text-neutral-900">{result.avatar_id || photoId}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.avatar_id || photoId || '')}
                    className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-800 transition-colors"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy ID
                      </>
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Status Checker */}
        <Card className="border-2 border-neutral-100 rounded-2xl overflow-hidden">
          <CardContent className="p-8 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight">Check Generation Status</h3>
              <p className="text-sm text-neutral-500 font-medium">
                Enter a generation ID to check the status of a photo avatar generation.
              </p>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter generation ID..."
                value={photoId || ""}
                onChange={(e) => setPhotoId(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-neutral-100 bg-white focus:border-indigo-500 outline-none transition-all font-medium font-mono text-sm"
              />
              <button
                onClick={() => photoId && pollStatus(photoId)}
                disabled={!photoId || polling}
                className="px-6 py-3 rounded-xl bg-neutral-900 text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {polling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Check Status
                  </>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
