"use client";

import { Rocket, FolderOpen, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onStart: () => void;
  onProjects?: () => void;
  onContinue?: () => void;
  hasProject: boolean;
  projectTitle?: string;
  projectCount?: number;
}

export function WelcomeScreen({
  onStart,
  onProjects,
  onContinue,
  hasProject,
  projectTitle,
  projectCount,
}: WelcomeScreenProps) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-pulse-soft" />
        <div className="absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-pulse-soft" />
      </div>

      <div className="relative flex max-w-2xl flex-col items-center gap-7 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-primary/10 bg-primary/10 shadow-sm animate-float">
          <Rocket className="h-12 w-12 text-primary" />
        </div>
        <div className="flex flex-col gap-3 animate-fade-up">
          <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
            ShipIt
          </h1>
          <p className="text-pretty text-xl text-muted-foreground sm:text-2xl">
            Turn AI Plans into Action
          </p>
        </div>
        <p className="max-w-lg text-pretty text-base text-muted-foreground sm:text-lg animate-fade-up-delay">
          Paste your AI-generated development plan and instantly get an
          interactive task board with progress tracking.
        </p>
        {hasProject && projectCount ? (
          <div className="rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            {projectCount} saved project{projectCount === 1 ? "" : "s"} ready to open
          </div>
        ) : null}
        <div className="mt-2 flex flex-col items-center gap-3">
          <Button size="lg" onClick={onStart} className="gap-2 px-10">
            <Rocket className="h-4 w-4" />
            Start New Project
          </Button>
          {hasProject && onContinue ? (
            <Button
              size="lg"
              variant="outline"
              onClick={onContinue}
              className="gap-2 px-10 bg-transparent"
            >
              <FolderOpen className="h-4 w-4" />
              Open Last{projectTitle ? `: ${projectTitle}` : " Project"}
            </Button>
          ) : null}
          {hasProject && onProjects ? (
            <Button
              size="lg"
              variant="ghost"
              onClick={onProjects}
              className="gap-2 px-10"
            >
              <LayoutGrid className="h-4 w-4" />
              View All Projects
            </Button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
