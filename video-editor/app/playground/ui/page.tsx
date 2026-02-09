"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UIPlaygroundPage() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/playground" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold">UI Components</h1>
              <p className="text-xs text-muted-foreground technical-label uppercase tracking-widest">
                Test components in isolation
              </p>
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm technical-label uppercase tracking-widest">Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm technical-label uppercase tracking-widest">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Default input" />
              <Input type="number" placeholder="Number input" />
            </div>
            <div className="flex items-center gap-4">
              <Input 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type something..."
                className="flex-1"
              />
              <Badge variant="outline">Value: {inputValue || "empty"}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm technical-label uppercase tracking-widest">Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Custom Blue</Badge>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Custom Green</Badge>
              <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30">Custom Purple</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Add more component tests here */}
        <div className="p-6 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
          <p className="text-sm">Add more component tests as needed</p>
        </div>
      </div>
    </div>
  );
}
