"use client";

import { ArrowLeft, FolderOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Phase } from "@/lib/parse-plan";

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
    <main className="flex min-h-screen flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-fit gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button size="sm" onClick={onCreateProject} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Your Projects</h1>
          <p className="text-sm text-muted-foreground">
            Choose a project to continue or start a fresh one.
          </p>
        </header>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="text-sm text-muted-foreground">
                No projects yet. Create your first one to get started.
              </div>
              <Button onClick={onCreateProject} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => {
              const allTasks = project.phases.flatMap((phase) => phase.tasks);
              const completed = allTasks.filter((task) => task.done).length;
              const total = allTasks.length;
              const progress = total ? Math.round((completed / total) * 100) : 0;
              const isActive = activeProjectId === project.id;

              return (
                <Card key={project.id} className="flex h-full flex-col">
                  <CardHeader className="flex flex-row items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        Updated {formatDate(project.updatedAt)}
                      </div>
                    </div>
                    {isActive ? <Badge variant="secondary">Active</Badge> : null}
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                      <span>
                        {completed} of {total} tasks complete
                      </span>
                      <span className="font-semibold text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5" />
                  </CardContent>
                  <CardFooter className="mt-auto flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectProject(project.id)}
                      className="gap-2"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete "${project.title}"? This cannot be undone.`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="gap-2 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
