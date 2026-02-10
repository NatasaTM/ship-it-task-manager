"use client";

import { useState, useCallback, useEffect } from "react";
import { WelcomeScreen } from "@/components/welcome-screen";
import { PlanInput } from "@/components/plan-input";
import { ProjectDashboard } from "@/components/project-dashboard";
import { parsePlan, type Phase } from "@/lib/parse-plan";

type Screen = "welcome" | "input" | "dashboard";

const STORAGE_KEY = "ship-it-project-data";

interface StoredProjectData {
  title: string;
  phases: Phase[];
}

function saveToLocalStorage(title: string, phases: Phase[]) {
  try {
    const data: StoredProjectData = {
      title,
      phases: phases.map((phase) => ({
        ...phase,
        tasks: phase.tasks.map((task) => ({
          ...task,
        })),
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

function loadFromLocalStorage(): StoredProjectData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as StoredProjectData;
    }
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
  }
  return null;
}

function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [phases, setPhases] = useState<Phase[]>([]);
  const [projectTitle, setProjectTitle] = useState("");

  const hasProject = phases.length > 0;

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadFromLocalStorage();
    if (stored && stored.phases.length > 0) {
      setPhases(stored.phases);
      setProjectTitle(stored.title);
    }
  }, []);

  const handleGenerate = useCallback((text: string, title: string) => {
    const parsed = parsePlan(text);
    if (parsed.length > 0) {
      setPhases(parsed);
      setProjectTitle(title);
      setScreen("dashboard");
      // Save initial JSON to localStorage
      saveToLocalStorage(title, parsed);
    }
  }, []);

  const handleToggleTask = useCallback(
    (taskId: string) => {
      setPhases((prev) => {
        const updated = prev.map((phase) => ({
          ...phase,
          tasks: phase.tasks.map((task) =>
            task.id === taskId ? { ...task, done: !task.done } : task
          ),
        }));
        // Save changes to localStorage
        saveToLocalStorage(projectTitle, updated);
        return updated;
      });
    },
    [projectTitle]
  );

  const handleAddTask = useCallback(
    (phaseId: string, text: string) => {
      setPhases((prev) => {
        const updated = prev.map((phase) =>
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
        );
        // Save changes to localStorage
        saveToLocalStorage(projectTitle, updated);
        return updated;
      });
    },
    [projectTitle]
  );

  const handleReset = useCallback(() => {
    setPhases([]);
    setProjectTitle("");
    setScreen("input");
    // Clear localStorage
    clearLocalStorage();
  }, []);

  const handleHome = useCallback(() => {
    setScreen("welcome");
  }, []);

  const handleImport = useCallback((data: { title: string; phases: Phase[] }) => {
    setPhases(data.phases);
    setProjectTitle(data.title);
    setScreen("dashboard");
    // Save imported data to localStorage
    saveToLocalStorage(data.title, data.phases);
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
            onImport={handleImport}
          />
        );
  }
}
