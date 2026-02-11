"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ClipboardCopy,
  Check,
  Sparkles,
  Terminal,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

const JSON_PROMPT_TEMPLATE = `You are generating a DEVELOPMENT BUILD PLAN that will be parsed by software.

Return ONLY valid JSON. No Markdown. No explanations. No code fences.

Schema:
{
  "phases": [
    {
      "name": "string",
      "hours": "X-Y",
      "tasks": ["task", "task", "task"]
    }
  ]
}

Rules:
- 3-5 phases
- 3-6 tasks per phase
- Tasks must be short, concrete, and implementation-focused
- Keep tasks ordered (they will be executed top-to-bottom)
- Do NOT include any fields other than: phases[].name, phases[].hours, phases[].tasks

Project description:
<PASTE PROJECT DESCRIPTION HERE>`;

// What we expect from AI output
type PlanJson = {
  phases: Array<{
    name: string;
    hours: string; // "X-Y"
    tasks: string[];
  }>;
};

// Minimal normalization so downstream is consistent
function normalizePlanJson(raw: PlanJson): PlanJson {
  return {
    phases: (raw.phases ?? [])
      .filter((p) => p && typeof p.name === "string" && Array.isArray(p.tasks))
      .map((p) => ({
        name: String(p.name).trim() || "Phase",
        hours: String(p.hours ?? "").trim() || "0-0",
        tasks: p.tasks
          .map((t) => String(t).trim())
          .filter(Boolean)
          .slice(0, 12),
      }))
      .slice(0, 8),
  };
}

// If a model wraps JSON in prose/code fences, try to extract the JSON object safely.
function parsePossiblyWrappedJson(input: string): PlanJson {
  const trimmed = input.trim();

  // Try direct parse first
  try {
    return JSON.parse(trimmed) as PlanJson;
  } catch {}

  // Remove ```json fences if present
  const fenceStripped = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(fenceStripped) as PlanJson;
  } catch {}

  // Last attempt: extract first top-level {...} block (best-effort)
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    return JSON.parse(candidate) as PlanJson;
  }

  throw new Error("Could not parse JSON. Make sure the response is valid JSON.");
}

interface PlanInputProps {
  // Keep your existing signature; we'll pass JSON string instead of Markdown
  onGenerate: (text: string, title: string) => void;
  onBack: () => void;
}

export function PlanInput({ onGenerate, onBack }: PlanInputProps) {
  const [planText, setPlanText] = useState("");
  const [title, setTitle] = useState("");
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const placeholderJson = useMemo(
    () =>
      JSON.stringify(
        {
          phases: [
            {
              name: "Project Setup",
              hours: "0-2",
              tasks: [
                "Initialize Next.js project",
                "Set up Tailwind CSS",
                "Configure ESLint and Prettier",
              ],
            },
            {
              name: "Core Features",
              hours: "2-8",
              tasks: [
                "Implement authentication (mock or real)",
                "Build main dashboard layout",
                "Add CRUD for primary entity",
              ],
            },
            {
              name: "Polish & Ship",
              hours: "8-10",
              tasks: [
                "Add loading/empty/error states",
                "Mobile responsive pass",
                "Deploy to Vercel",
              ],
            },
          ],
        },
        null,
        2
      ),
    []
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON_PROMPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    setParseError(null);

    const input = planText.trim();
    if (!input) return;

    try {
      const parsed = parsePossiblyWrappedJson(input);
      const normalized = normalizePlanJson(parsed);

      if (!normalized.phases.length) {
        throw new Error("JSON parsed, but 'phases' is empty or invalid.");
      }

      // Pass clean JSON string to the parent (so the rest of your app can parse deterministically)
      onGenerate(JSON.stringify(normalized), title.trim() || "Untitled Project");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unknown error while parsing JSON.";
      setParseError(msg);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex w-full max-w-2xl flex-col gap-10"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-fit gap-2 rounded-xl text-muted-foreground hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Section 1: Get Your Build Plan */}
        <section className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                  Step_01
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tighter">
                Get Your Build Plan (JSON)
              </h2>
            </div>
            <Button
              variant={copied ? "default" : "outline"}
              size="sm"
              onClick={handleCopy}
              className="h-9 gap-2 rounded-xl border-primary/20 bg-background/50 text-[10px] font-bold uppercase transition-all hover:bg-primary/10"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  Copy Prompt
                </>
              )}
            </Button>
          </div>

          <p className="px-2 text-sm text-muted-foreground">
            Copy the JSON-only prompt below and paste it into your favorite AI
            assistant. Then paste the JSON response into the box.
          </p>

          <div className="relative rounded-[2rem] border border-primary/10 bg-card/30 p-8 shadow-inner backdrop-blur-sm">
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/80">
              {JSON_PROMPT_TEMPLATE}
            </pre>
            <div className="absolute left-8 top-0 h-[1px] w-12 bg-primary/40" />
            <div className="absolute left-0 top-8 h-12 w-[1px] bg-primary/40" />
          </div>
        </section>

        {/* Project Title */}
        <section className="space-y-3 px-2">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
              Step_02
            </span>
          </div>
          <label
            htmlFor="project-title"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
          >
            Project Title
          </label>
          <input
            id="project-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Spec2Steps Prototype"
            className="w-full rounded-2xl border border-primary/10 bg-card px-6 py-4 text-lg font-bold tracking-tight transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5"
          />
        </section>

        {/* Section 2: Paste Your Plan */}
        <section className="space-y-6 pb-20">
          <div className="space-y-1 px-2">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                Step_03
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tighter">
              Paste Your JSON Plan
            </h2>
          </div>

          <p className="px-2 text-sm text-muted-foreground">
            Paste the AI JSON response below and we'll parse it into trackable
            tasks.
          </p>

          <div className="relative">
            <textarea
              value={planText}
              onChange={(e) => setPlanText(e.target.value)}
              placeholder={placeholderJson}
              className="min-h-[350px] w-full resize-none rounded-[2rem] border border-primary/10 bg-card/50 p-8 font-mono text-sm leading-relaxed shadow-2xl transition-all focus:border-primary/40 focus:outline-none"
            />

            <AnimatePresence>
              {parseError ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-x-6 bottom-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 backdrop-blur-md"
                >
                  <div className="text-sm font-medium text-destructive">
                    Couldn't parse JSON
                  </div>
                  <div className="mt-1 text-sm text-destructive/90">
                    {parseError}
                  </div>
                  <div className="mt-2 text-xs text-destructive/80">
                    Tip: ensure the response is a single JSON object with{" "}
                    <span className="font-mono">{"{ phases: [...] }"}</span> and
                    no extra text.
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!planText.trim()}
            className="group h-16 w-full gap-3 rounded-[1.4rem] text-base font-bold uppercase tracking-wide shadow-[0_20px_40px_-15px_rgba(var(--primary),0.5)] transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
            Generate Tasks
          </Button>
        </section>
      </motion.div>
    </main>
  );
}
