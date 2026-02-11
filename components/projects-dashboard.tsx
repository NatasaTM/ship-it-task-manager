"use client";

import { ArrowLeft, FolderOpen, Plus, Trash2, Clock, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Phase } from "@/lib/parse-plan";
import { motion } from "motion/react";

interface ProjectRecord {
  id: string;
  title: string;
  phases: Phase[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectsDashboardProps {
  projects: ProjectRecord[];
  activeProjectId?: string | null;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onBack: () => void;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ProjectsDashboard({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onBack,
}: ProjectsDashboardProps) {
  return (
    <main className="min-h-screen bg-[slate-950] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between rounded-2xl border border-primary/10 bg-card/50 p-1.5 backdrop-blur-xl shadow-2xl">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-8 gap-2 rounded-xl text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Back</span>
          </Button>
          
          <Button onClick={onCreateProject} size="sm" className="h-8 gap-2 rounded-xl bg-primary px-4 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_-5px_rgba(var(--primary),0.5)]">
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Button>
        </nav>

        {/* Header */}
        <header className="flex flex-col gap-2 pl-2">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Your Projects</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter sm:text-5xl">Your Projects</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Choose a project to continue or start a fresh one.
          </p>
        </header>

        {projects.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-dashed border-primary/20 bg-primary/5">
              <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Box className="h-8 w-8 text-primary/40" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold">No projects yet.</p>
                  <p className="text-sm text-muted-foreground">Create your first one to get started.</p>
                </div>
                <Button onClick={onCreateProject} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project, idx) => {
              const allTasks = project.phases.flatMap((phase) => phase.tasks);
              const completed = allTasks.filter((task) => task.done).length;
              const total = allTasks.length;
              const progress = total ? Math.round((completed / total) * 100) : 0;
              const isActive = activeProjectId === project.id;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`group relative h-full flex flex-col overflow-hidden border-primary/10 bg-card/60 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-[0_0_30px_-10px_rgba(var(--primary),0.2)] ${isActive ? 'ring-1 ring-primary' : ''}`}>
                    <CardHeader className="relative flex flex-row items-start justify-between gap-3 pb-4">
                      <div className="space-y-1.5">
                        <CardTitle className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                          {project.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Updated {formatDate(project.updatedAt)}
                        </div>
                      </div>
                      {isActive && (
                        <Badge className="bg-primary text-[10px] font-black uppercase tracking-tighter">
                          Active
                        </Badge>
                      )}
                    </CardHeader>

                    <CardContent className="flex flex-col gap-4">
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>{completed} of {total} tasks complete</span>
                          <span className="text-primary">{progress}%</span>
                        </div>
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/10">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="absolute h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                          />
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="mt-auto flex items-center justify-between gap-2 border-t border-primary/5 bg-primary/5 p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectProject(project.id)}
                        className="h-9 gap-2 rounded-lg bg-background/50 font-bold hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <FolderOpen className="h-4 w-4" />
                        Open
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Delete "${project.title}"? This cannot be undone.`)) {
                            onDeleteProject(project.id);
                          }
                        }}
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
