"use client";

import { useState } from "react";
import { ArrowLeft, ClipboardCopy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PROMPT_TEMPLATE = `I'm planning a development project and need a structured build plan. Please provide a plan in this format:

### Phase 1: [Name] (Hours X-Y)
- Task description
- Another task

### Phase 2: [Name] (Hours X-Y)
- Task description

My project is: [USER DESCRIBES PROJECT]`;

interface PlanInputProps {
  onGenerate: (text: string, title: string) => void;
  onBack: () => void;
}

export function PlanInput({ onGenerate, onBack }: PlanInputProps) {
  const [planText, setPlanText] = useState("");
  const [title, setTitle] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(PROMPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    if (planText.trim()) {
      onGenerate(planText, title.trim() || "Untitled Project");
    }
  };

  return (
    <main className="flex min-h-screen flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-fit gap-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Section 1: Get Your Build Plan */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Get Your Build Plan</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Copy the prompt below and paste it into your favorite AI assistant
            to generate a structured build plan.
          </p>
          <div className="relative rounded-lg border bg-card">
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-card-foreground/80">
              {PROMPT_TEMPLATE}
            </pre>
            <div className="absolute right-2 top-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="h-3 w-3" />
                    Copy Prompt
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* Project Title */}
        <section className="flex flex-col gap-3">
          <label
            htmlFor="project-title"
            className="text-sm font-medium text-card-foreground"
          >
            Project Title
          </label>
          <input
            id="project-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. My SaaS App"
            className="w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </section>

        {/* Section 2: Paste Your Plan */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-sm font-bold text-primary">2</span>
            </div>
            <h2 className="text-lg font-semibold">Paste Your Plan</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Paste the AI-generated response below and we will parse it into
            trackable tasks.
          </p>
          <textarea
            value={planText}
            onChange={(e) => setPlanText(e.target.value)}
            placeholder={`### Phase 1: Project Setup (Hours 0-2)\n- Initialize Next.js project\n- Set up Tailwind CSS\n- Configure ESLint and Prettier\n\n### Phase 2: Core Features (Hours 2-8)\n- Build user authentication\n- Create dashboard layout`}
            className="min-h-[240px] w-full resize-y rounded-lg border bg-card p-4 font-mono text-sm text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!planText.trim()}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Tasks
          </Button>
        </section>
      </div>
    </main>
  );
}
