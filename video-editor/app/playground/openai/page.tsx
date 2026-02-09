"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Brain, Send, Loader2, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Status = "idle" | "loading" | "success" | "error";

const MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast & Cheap)" },
  { value: "gpt-4o", label: "GPT-4o (Best)" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Legacy)" },
];

const SAMPLE_PROMPTS = [
  "Say hello in 5 different languages",
  "Write a haiku about coding",
  "Explain quantum computing in one sentence",
  "Generate a creative name for a video editing app",
];

export default function OpenAIPlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [status, setStatus] = useState<Status>("idle");
  const [response, setResponse] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ prompt_tokens: number; completion_tokens: number; total_tokens: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = async () => {
    if (!prompt.trim()) return;
    
    setStatus("loading");
    setResponse(null);
    setError(null);
    setUsage(null);

    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Unknown error");
        return;
      }

      setStatus("success");
      setResponse(data.message);
      setUsage(data.usage);
    } catch (err) {
      setStatus("error");
      setError(String(err));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendRequest();
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/playground" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">OpenAI API Test</h1>
            <p className="text-xs text-muted-foreground technical-label uppercase tracking-widest">
              Test OpenAI API integration
            </p>
          </div>
        </div>

        {/* Model Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm technical-label uppercase tracking-widest">Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setModel(m.value)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    model === m.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/10 border-border hover:bg-muted/20"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prompt Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm technical-label uppercase tracking-widest">Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your prompt..."
                className="flex-1"
              />
              <Button onClick={sendRequest} disabled={status === "loading" || !prompt.trim()}>
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Sample Prompts */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Try a sample prompt:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className="px-2 py-1 text-xs rounded bg-muted/10 border border-border hover:bg-muted/20 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response */}
        {(response || error) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm technical-label uppercase tracking-widest flex items-center gap-2">
                {status === "success" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                Response
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                status === "success" 
                  ? "bg-green-500/5 border-green-500/30" 
                  : "bg-red-500/5 border-red-500/30"
              }`}>
                <pre className="whitespace-pre-wrap text-sm">{response || error}</pre>
              </div>

              {usage && (
                <div className="flex gap-3">
                  <Badge variant="outline" className="font-mono">
                    Prompt: {usage.prompt_tokens} tokens
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    Completion: {usage.completion_tokens} tokens
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    Total: {usage.total_tokens} tokens
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status Indicator */}
        {status === "idle" && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Enter a prompt and hit send to test the OpenAI API</p>
          </div>
        )}
      </div>
    </div>
  );
}
