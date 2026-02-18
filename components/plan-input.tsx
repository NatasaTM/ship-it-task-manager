"use client";

import { useState } from "react";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { smartParse } from "@/lib/smart-parser";

interface PlanInputProps {
  onGenerate: (text: string, title: string) => void;
  onBack: () => void;
}

export function PlanInput({ onGenerate, onBack }: PlanInputProps) {
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!input.trim()) {
      setError("Please paste your project plan");
      return;
    }

    // ✨ NEW: Use smart parser instead of old parsePlan
    const result = smartParse(input);

    if (result.success && result.data) {
      // Call the existing onGenerate with the parsed data
      const projectTitle = title.trim() || result.data.name || "Untitled Project";
      
      // Convert smart parser output to the format expected by onGenerate
      // The old format expects just the phases array, but smart parser returns the full project
      const phasesText = JSON.stringify(result.data);
      
      onGenerate(phasesText, projectTitle);
      setError(null);
    } else {
      setError(result.error || "Could not parse your input. Please check the format.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Create New Project</h1>
            <p className="text-sm text-muted-foreground">
              Paste your AI-generated plan or JSON
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="space-y-6">
          {/* Project Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Project Name (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Project"
              className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              If left empty, we'll use the name from your plan
            </p>
          </div>

          {/* Plan Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Paste Your Plan
            </label>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              placeholder="Paste your AI-generated plan here...

Supports multiple formats:
• JSON from AI or templates
• Markdown with checkboxes
• Plain text with phases
• Simple bullet points"
              rows={16}
              className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg font-mono text-sm resize-none placeholder:text-muted-foreground placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Format Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-medium text-foreground">
                  ✨ Smart Parser Enabled
                </p>
                <p className="text-muted-foreground">
                  Our smart parser automatically detects and handles:
                </p>
                <ul className="ml-4 space-y-1 text-muted-foreground">
                  <li>• <strong className="text-foreground">JSON format</strong> - Standard or wrapped in code blocks</li>
                  <li>• <strong className="text-foreground">Markdown</strong> - Headers and checkboxes (# Phase, - [ ] Task)</li>
                  <li>• <strong className="text-foreground">AI output</strong> - Phase 1:, Step 1:, etc.</li>
                  <li>• <strong className="text-foreground">Bullet points</strong> - Simple numbered or bulleted lists</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive-foreground">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="flex-1 gap-2"
              size="lg"
            >
              <Sparkles className="h-4 w-4" />
              Create Project
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <button
                onClick={onBack}
                className="text-primary hover:underline"
              >
                Check out prompt templates
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}