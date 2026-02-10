"use client";

import { useState, useCallback } from "react";
import { WelcomeScreen } from "@/components/welcome-screen";
import { PlanInput } from "@/components/plan-input";
import { ProjectDashboard } from "@/components/project-dashboard";
import { parsePlan, type Phase } from "@/lib/parse-plan";

type Screen = "welcome" | "input" | "dashboard";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [phases, setPhases] = useState<Phase[]>([]);
  const [projectTitle, setProjectTitle] = useState("");

  const hasProject = phases.length > 0;

  const handleGenerate = useCallback((text: string, title: string) => {
    const parsed = parsePlan(text);
    if (parsed.length > 0) {
      setPhases(parsed);
      setProjectTitle(title);
      setScreen("dashboard");
    }
  }, []);

  const handleToggleTask = useCallback((taskId: string) => {
    setPhases((prev) =>
      prev.map((phase) => ({
        ...phase,
        tasks: phase.tasks.map((task) =>
          task.id === taskId ? { ...task, done: !task.done } : task
        ),
      }))
    );
  }, []);

  const handleAddTask = useCallback((phaseId: string, text: string) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              tasks: [
                ...phase.tasks,
                {
                  id: `task-${Date.now()}`,
                  text,
                  done: false,
                },
              ],
            }
          : phase
      )
    );
  }, []);

  const handleReset = useCallback(() => {
    setPhases([]);
    setProjectTitle("");
    setScreen("input");
  }, []);

  const handleHome = useCallback(() => {
    setScreen("welcome");
  }, []);

  switch (screen) {
    case "welcome":
      return (
        <WelcomeScreen
          onStart={() => {
            setPhases([]);
            setProjectTitle("");
            setScreen("input");
          }}
          onContinue={() => setScreen("dashboard")}
          hasProject={hasProject}
          projectTitle={projectTitle}
        />
      );
    case "input":
      return (
        <PlanInput
          onGenerate={handleGenerate}
          onBack={() => setScreen("welcome")}
        />
      );
    case "dashboard":
      return (
        <ProjectDashboard
          title={projectTitle}
          phases={phases}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
          onReset={handleReset}
          onHome={handleHome}
        />
      );
  }
}
