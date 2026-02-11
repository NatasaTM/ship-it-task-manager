"use client";

import { useRef } from "react";
import { ArrowLeft, Home, CheckCircle2, Download, Upload, LayoutGrid, Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhaseSection } from "@/components/phase-section";
import type { Phase } from "@/lib/parse-plan";
import { motion } from "motion/react";

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
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
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
        alert("Failed to import JSON file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-[slate-950] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4 py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between rounded-2xl border border-primary/10 bg-card/50 p-1.5 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onHome} className="h-8 gap-2 rounded-xl hover:bg-primary/10 transition-all">
              <Home className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
            </Button>
            {onProjects && (
              <Button variant="ghost" size="sm" onClick={onProjects} className="h-8 gap-2 rounded-xl hover:bg-primary/10 transition-all">
                <LayoutGrid className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Projects</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onNewProject} className="h-8 gap-2 rounded-xl text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase">Back</span>
            </Button>
            <div className="mx-1 h-4 w-[1px] bg-border/50" />
            <Button variant="ghost" size="sm" onClick={handleExport} className="h-8 gap-1.5 rounded-lg hover:bg-primary/10">
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-wide">Export JSON</span>
            </Button>
            {onImport && (
               <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 gap-1.5 rounded-lg hover:bg-primary/10">
                <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-wide">Import JSON</span>
              </Button>
            )}
          </div>
        </nav>

        <div className="rounded-2xl border border-primary/10 bg-card/40 px-4 py-3 text-xs text-muted-foreground">
          <p>
            Export JSON downloads this project with title, phases, tasks, and each task completion state.
          </p>
          {onImport && (
            <p className="mt-1">
              Import JSON accepts a previously exported project file with the same structure.
            </p>
          )}
        </div>

        {/* Hero Header Dashboard */}
        <header className="group relative overflow-hidden rounded-[2rem] border border-primary/20 bg-card p-6 shadow-[0_0_50px_-12px_rgba(var(--primary),0.2)] transition-all hover:border-primary/40">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-[60px] transition-all group-hover:bg-primary/20" />
          
          <div className="relative space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Terminal / Active_Plan</span>
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                  {title}
                </h1>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-5xl font-black tabular-nums tracking-tighter text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.4)]">
                  {Math.round(overallProgress)}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Progress</span>
              </div>
            </div>

            {/* Glowing Progress Bar */}
            <div className="space-y-3">
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/30 ring-1 ring-inset ring-primary/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]"
                />
                <div 
                  className="absolute inset-0 opacity-[0.15]" 
                  style={{ 
                    backgroundImage: 'linear-gradient(90deg, transparent 94%, #000 6%)', 
                    backgroundSize: '20px 100%' 
                  }} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight text-muted-foreground">
                  <Activity className="h-3 w-3 text-primary" />
                  Tasks: <span className="text-foreground">{completedCount}</span> / {totalCount}
                </p>

                {allDone && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter text-primary-foreground">
                    <CheckCircle2 className="h-3 w-3" />
                    Mission Success
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Phase List */}
        <div className="flex flex-col gap-6">
          {phases.map((phase) => (
            <div key={phase.id}>
              <PhaseSection
                phase={phase}
                onToggleTask={onToggleTask}
                onAddTask={onAddTask}
              />
            </div>
          ))}
        </div>
      </div>

      <input 
        ref={fileInputRef} 
        type="file" 
        accept=".json" 
        onChange={handleImport} 
        className="hidden" 
      />
    </main>
  );
}
