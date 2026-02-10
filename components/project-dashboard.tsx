"use client";

import { ArrowLeft, Home, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PhaseSection } from "@/components/phase-section";
import type { Phase } from "@/lib/parse-plan";

interface ProjectDashboardProps {
  title: string;
  phases: Phase[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (phaseId: string, text: string) => void;
  onReset: () => void;
  onHome: () => void;
}

export function ProjectDashboard({
  title,
  phases,
  onToggleTask,
  onAddTask,
  onReset,
  onHome,
}: ProjectDashboardProps) {
  const allTasks = phases.flatMap((p) => p.tasks);
  const completedCount = allTasks.filter((t) => t.done).length;
  const totalCount = allTasks.length;
  const overallProgress =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <main className="flex min-h-screen flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onHome}
            className="gap-2 text-muted-foreground"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
          <span className="text-muted-foreground/40">|</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-balance">
              {title}
            </h1>
            {allDone && (
              <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </div>
            )}
          </div>

          {/* Overall progress */}
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-sm font-medium text-card-foreground">
                Overall Progress
              </span>
              <span className="text-sm font-bold text-primary">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-2.5" />
            <p className="mt-2 text-xs text-muted-foreground">
              {completedCount} of {totalCount} tasks complete
            </p>
          </div>
        </header>

        {/* Phases */}
        <div className="flex flex-col gap-4">
          {phases.map((phase) => (
            <PhaseSection
              key={phase.id}
              phase={phase}
              onToggleTask={onToggleTask}
              onAddTask={onAddTask}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
