"use client";

import { useRef } from "react";
import { ArrowLeft, Home, CheckCircle2, Download, Upload, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PhaseSection } from "@/components/phase-section";
import type { Phase } from "@/lib/parse-plan";

interface ProjectDashboardProps {
  title: string;
  phases: Phase[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (phaseId: string, text: string) => void;
  onNewProject: () => void;
  onHome: () => void;
  onProjects?: () => void;
  onImport?: (jsonData: { title: string; phases: Phase[] }) => void;
}

export function ProjectDashboard({
  title,
  phases,
  onToggleTask,
  onAddTask,
  onNewProject,
  onHome,
  onProjects,
  onImport,
}: ProjectDashboardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allTasks = phases.flatMap((p) => p.tasks);
  const completedCount = allTasks.filter((t) => t.done).length;
  const totalCount = allTasks.length;
  const overallProgress =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allDone = completedCount === totalCount && totalCount > 0;

  const handleExport = () => {
    const exportData = {
      title,
      phases: phases.map((phase) => ({
        name: phase.name,
        hours: phase.hours || "",
        tasks: phase.tasks.map((task) => ({
          text: task.text,
          done: task.done,
        })),
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "project"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImport) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const data = JSON.parse(jsonString);

        if (data && Array.isArray(data.phases)) {
          // Convert imported data to Phase format
          const importedPhases: Phase[] = data.phases.map((phase: any, idx: number) => ({
            id: `phase-${Date.now()}-${idx}`,
            name: String(phase.name || "Phase").trim(),
            hours: phase.hours ? String(phase.hours).trim() : null,
            tasks: (phase.tasks || []).map((task: any, taskIdx: number) => ({
              id: `task-${Date.now()}-${idx}-${taskIdx}`,
              text: typeof task === "string" ? task : String(task.text || "").trim(),
              done: typeof task === "object" && task.done === true,
            })),
          }));

          onImport({
            title: data.title || title,
            phases: importedPhases,
          });
        }
      } catch (error) {
        console.error("Failed to parse JSON file:", error);
        alert("Failed to import JSON file. Please check the file format.");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
          {onProjects ? (
            <>
              <span className="text-muted-foreground/40">|</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onProjects}
                className="gap-2 text-muted-foreground"
              >
                <LayoutGrid className="h-4 w-4" />
                Projects
              </Button>
            </>
          ) : null}
          <span className="text-muted-foreground/40">|</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewProject}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            New Project
          </Button>
          <span className="text-muted-foreground/40">|</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="gap-2 text-muted-foreground"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          {onImport && (
            <>
              <span className="text-muted-foreground/40">|</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="json-import-input"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 text-muted-foreground"
              >
                <Upload className="h-4 w-4" />
                Import JSON
              </Button>
            </>
          )}
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
