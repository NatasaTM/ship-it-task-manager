"use client";

import { Rocket, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onStart: () => void;
  onContinue?: () => void;
  hasProject: boolean;
  projectTitle?: string;
}

export function WelcomeScreen({
  onStart,
  onContinue,
  hasProject,
  projectTitle,
}: WelcomeScreenProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Rocket className="h-10 w-10 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            ShipIt
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Turn AI Plans into Action
          </p>
        </div>
        <p className="max-w-md text-pretty text-sm text-muted-foreground">
          Paste your AI-generated development plan and instantly get an
          interactive task board with progress tracking.
        </p>
        <div className="mt-4 flex flex-col items-center gap-3">
          <Button size="lg" onClick={onStart} className="gap-2 px-8">
            <Rocket className="h-4 w-4" />
            Start New Project
          </Button>
          {hasProject && onContinue && (
            <Button
              size="lg"
              variant="outline"
              onClick={onContinue}
              className="gap-2 px-8 bg-transparent"
            >
              <FolderOpen className="h-4 w-4" />
              Continue{projectTitle ? `: ${projectTitle}` : " Project"}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
