"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ClipboardCopy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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
- 3–5 phases
- 3–6 tasks per phase
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
  } catch { }

  // Remove ```json fences if present
  const fenceStripped = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(fenceStripped) as PlanJson;
  } catch { }

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
  // Keep your existing signature; we’ll pass JSON string instead of Markdown
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
            <h2 className="text-lg font-semibold">Get Your Build Plan (JSON)</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Copy the JSON-only prompt below and paste it into your favorite AI assistant.
            Then paste the JSON response into the box.
          </p>

          <div className="relative rounded-lg border bg-card">
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-card-foreground/80">
              {JSON_PROMPT_TEMPLATE}
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
            placeholder="e.g. Spec2Steps Prototype"
            className="w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </section>

        {/* Section 2: Paste Your Plan */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-sm font-bold text-primary">2</span>
            </div>
            <h2 className="text-lg font-semibold">Paste Your JSON Plan</h2>
          </div>

          <p className="text-sm text-muted-foreground">
            Paste the AI JSON response below and we’ll parse it into trackable tasks.
          </p>

          <textarea
            value={planText}
            onChange={(e) => setPlanText(e.target.value)}
            placeholder={placeholderJson}
            className="min-h-[240px] w-full resize-y rounded-lg border bg-card p-4 font-mono text-sm text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {parseError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <div className="font-medium">Couldn’t parse JSON</div>
              <div className="mt-1 opacity-90">{parseError}</div>
              <div className="mt-2 text-xs text-destructive/80">
                Tip: ensure the response is a single JSON object with{" "}
                <span className="font-mono">{"{ phases: [...] }"}</span> and no extra text.
              </div>
            </div>
          ) : null}

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
