"use client";

import { useState } from "react";
import { 
  Upload, CheckCircle2, AlertCircle, 
  File, Loader2, Link as LinkIcon,
  ArrowLeft, Database, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { uploadToSupabase } from "@/lib/storage";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function StorageTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setUploadedUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadToSupabase(file);
      setUploadedUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-neutral-900 selection:bg-indigo-100 font-sans">
      <nav className="border-b border-indigo-50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/playground">
              <Button variant="ghost" className="rounded-xl hover:bg-neutral-50 group px-3">
                <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
              </Button>
            </Link>
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-600 text-white border-none text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm">Resource Bridge</Badge>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">Supabase Storage Hub</span>
               </div>
               <h1 className="text-xl font-black uppercase tracking-tight text-neutral-900">Upload <span className="text-indigo-600 italic">Playground</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Database className="w-5 h-5 text-indigo-500" />
             <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Lumina Web3 Storage</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-12 space-y-12">
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 italic">Storage Verification</h2>
          <Card className="border-2 border-neutral-100 shadow-xl shadow-neutral-500/5 rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-lg font-black uppercase italic">Universal File Uploader</CardTitle>
              <CardDescription className="text-xs font-bold text-neutral-400 uppercase">Test the direct connection between the application and Supabase Storage buckets.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="relative group border-2 border-dashed border-neutral-100 rounded-[2rem] p-12 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all cursor-pointer">
                  <Input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-neutral-900 uppercase tracking-tight">
                        {file ? file.name : "Select Asset for Upload"}
                      </p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                        {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "MP4, PNG, JPG, JSON accepted"}
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full bg-neutral-900 hover:bg-black text-white py-8 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-neutral-200 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                      Streaming to Web3 Bucket...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-3" />
                      Initialize Upload
                    </>
                  )}
                </Button>
              </div>

              {uploadedUrl && (
                <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 space-y-4 animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 italic">Upload Successful</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/50 p-4 rounded-xl border border-emerald-100 overflow-hidden">
                    <LinkIcon className="w-4 h-4 text-neutral-300 shrink-0" />
                    <code className="text-[10px] font-bold text-neutral-600 truncate flex-1">
                      {uploadedUrl}
                    </code>
                    <a 
                      href={uploadedUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-indigo-50 rounded-lg transition-all text-indigo-500"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 flex items-center gap-4 animate-in fade-in zoom-in duration-500">
                  <AlertCircle className="w-6 h-6 text-rose-500" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 italic">Upload Protocol Failure</p>
                    <p className="text-xs font-bold text-rose-600">{error}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 rounded-[2.5rem] bg-neutral-900 text-white relative overflow-hidden group">
              <Database className="absolute top-0 right-0 p-8 w-24 h-24 opacity-20 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700" />
              <div className="relative z-10 space-y-4">
                 <Badge className="bg-indigo-500 text-white border-none font-bold text-[8px] uppercase tracking-widest">Protocol Stats</Badge>
                 <h3 className="text-xl font-black italic uppercase">Bucket Metadata</h3>
                 <p className="text-neutral-400 text-[10px] font-medium leading-relaxed uppercase tracking-tight">
                    TARGET: Lumina web3 file storage<br />
                    PROVIDER: Supabase Relational Storage<br />
                    VISIBILITY: Public Read Access
                 </p>
              </div>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-indigo-50 border-2 border-indigo-100 relative overflow-hidden group">
              <File className="absolute top-0 right-0 p-8 w-24 h-24 opacity-20 group-hover:-rotate-12 group-hover:scale-110 transition-all duration-700 text-indigo-500" />
              <div className="relative z-10 space-y-4">
                 <Badge className="bg-indigo-600 text-white border-none font-bold text-[8px] uppercase tracking-widest">Technical Guide</Badge>
                 <h3 className="text-xl font-black italic uppercase text-indigo-900">Direct integration</h3>
                 <p className="text-indigo-600/60 text-[10px] font-medium leading-relaxed uppercase tracking-tight">
                    Utilize 'lib/storage.ts' for unified asset persistence across agents and production pipelines.
                 </p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
