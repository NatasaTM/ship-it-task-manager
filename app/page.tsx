"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { WelcomeScreen } from "@/components/welcome-screen";
import { PlanInput } from "@/components/plan-input";
import { ProjectDashboard } from "@/components/project-dashboard";
import { ProjectsDashboard } from "@/components/projects-dashboard";
import { parsePlan, type Phase } from "@/lib/parse-plan";
import { APISettings } from '@/components/api-settings';
import { AIGenerator } from '@/components/ai-generator';
import { PromptLibrary } from '@/components/prompt-library';

type Screen = "welcome" | "input" | "projects" | "dashboard";

const PROJECTS_STORAGE_KEY = "ship-it-projects";
const ACTIVE_PROJECT_KEY = "ship-it-active-project-id";
const LEGACY_STORAGE_KEY = "ship-it-project-data";

interface StoredProject {
  id: string;
  title: string;
  phases: Phase[];
  createdAt: string;
  updatedAt: string;
}

function clonePhases(phases: Phase[]) {
  return phases.map((phase) => ({
    ...phase,
    tasks: phase.tasks.map((task) => ({ ...task })),
  }));
}

function createProjectId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createProject(title: string, phases: Phase[]): StoredProject {
  const now = new Date().toISOString();
  return {
    id: createProjectId(),
    title,
    phases: clonePhases(phases),
    createdAt: now,
    updatedAt: now,
  };
}

function saveProjectsToLocalStorage(
  projects: StoredProject[],
  activeProjectId: string | null
) {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    if (activeProjectId) {
      localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
    } else {
      localStorage.removeItem(ACTIVE_PROJECT_KEY);
    }
  } catch (error) {
    console.error("Failed to save projects to localStorage:", error);
  }
}

function loadProjectsFromLocalStorage(): {
  projects: StoredProject[];
  activeProjectId: string | null;
} {
  let projects: StoredProject[] = [];
  let activeProjectId: string | null = null;

  try {
    const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (storedProjects) {
      const parsed = JSON.parse(storedProjects);
      if (Array.isArray(parsed)) {
        projects = parsed as StoredProject[];
      }
    }

    const storedActive = localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (storedActive) {
      activeProjectId = storedActive;
    }
  } catch (error) {
    console.error("Failed to load projects from localStorage:", error);
  }

  if (projects.length === 0) {
    try {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        const legacyData = JSON.parse(legacy) as {
          title: string;
          phases: Phase[];
        };
        if (legacyData?.phases?.length) {
          const migrated = createProject(
            legacyData.title || "Untitled Project",
            legacyData.phases
          );
          projects = [migrated];
          activeProjectId = migrated.id;
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          saveProjectsToLocalStorage(projects, activeProjectId);
        }
      }
    } catch (error) {
      console.error("Failed to migrate legacy project data:", error);
    }
  }

  if (projects.length > 0 && activeProjectId) {
    const exists = projects.some((project) => project.id === activeProjectId);
    if (!exists) {
      activeProjectId = projects[0].id;
    }
  }

  return { projects, activeProjectId };
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  // ✨ NEW: AI Features state
  const [showSettings, setShowSettings] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  const hasProjects = projects.length > 0;

  useEffect(() => {
    const loaded = loadProjectsFromLocalStorage();
    if (loaded.projects.length > 0) {
      setProjects(loaded.projects);
      setActiveProjectId(loaded.activeProjectId ?? loaded.projects[0].id);
    }
  }, []);

  const handleGenerate = useCallback((text: string, title: string) => {
    const parsed = parsePlan(text);
    if (parsed.length > 0) {
      const newProject = createProject(title, parsed);
      setProjects((prev) => {
        const next = [newProject, ...prev];
        saveProjectsToLocalStorage(next, newProject.id);
        return next;
      });
      setActiveProjectId(newProject.id);
      setScreen("dashboard");
    }
  }, []);

  // ✨ NEW: Handle AI-generated plans
  const handleAIGenerated = useCallback((planData: any) => {
    if (!planData.phases?.length) return;
    
    const newProject = createProject(
      planData.name || planData.title || "AI Generated Project",
      planData.phases
    );
    
    setProjects((prev) => {
      const next = [newProject, ...prev];
      saveProjectsToLocalStorage(next, newProject.id);
      return next;
    });
    setActiveProjectId(newProject.id);
    setShowAIGenerator(false);
    setScreen("dashboard");
  }, []);

  const handleToggleTask = useCallback(
    (taskId: string) => {
      if (!activeProjectId) return;
      setProjects((prev) => {
        const next = prev.map((project) => {
          if (project.id !== activeProjectId) return project;
          const updatedPhases = project.phases.map((phase) => ({
            ...phase,
            tasks: phase.tasks.map((task) =>
              task.id === taskId ? { ...task, done: !task.done } : task
            ),
          }));
          return {
            ...project,
            phases: updatedPhases,
            updatedAt: new Date().toISOString(),
          };
        });
        saveProjectsToLocalStorage(next, activeProjectId);
        return next;
      });
    },
    [activeProjectId]
  );

  const handleAddTask = useCallback(
    (phaseId: string, text: string) => {
      if (!activeProjectId) return;
      setProjects((prev) => {
        const next = prev.map((project) => {
          if (project.id !== activeProjectId) return project;
          const updatedPhases = project.phases.map((phase) =>
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
          return {
            ...project,
            phases: updatedPhases,
            updatedAt: new Date().toISOString(),
          };
        });
        saveProjectsToLocalStorage(next, activeProjectId);
        return next;
      });
    },
    [activeProjectId]
  );

  const handleNewProject = useCallback(() => {
    setScreen("input");
  }, []);

  const handleHome = useCallback(() => {
    setScreen("welcome");
  }, []);

  const handleProjects = useCallback(() => {
    setScreen("projects");
  }, []);

  const handleSelectProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    setScreen("dashboard");
    saveProjectsToLocalStorage(projects, projectId);
  }, [projects]);

  const handleDeleteProject = useCallback(
    (projectId: string) => {
      const next = projects.filter((project) => project.id !== projectId);
      const nextActiveId =
        projectId === activeProjectId ? next[0]?.id ?? null : activeProjectId;
      setProjects(next);
      setActiveProjectId(nextActiveId);
      if (next.length === 0) {
        setScreen("welcome");
      }
      saveProjectsToLocalStorage(next, nextActiveId);
    },
    [activeProjectId, projects]
  );

  const handleImport = useCallback((data: { title: string; phases: Phase[] }) => {
    if (!data.phases?.length) return;
    const importedProject = createProject(
      data.title?.trim() || "Imported Project",
      data.phases
    );
    setProjects((prev) => {
      const next = [importedProject, ...prev];
      saveProjectsToLocalStorage(next, importedProject.id);
      return next;
    });
    setActiveProjectId(importedProject.id);
    setScreen("dashboard");
  }, []);

  return (
    <>
      {/* ✨ NEW: Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-muted-foreground hover:text-foreground text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <APISettings />
            </div>
          </div>
        </div>
      )}

      {/* ✨ NEW: AI Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Generate Plan with AI</h2>
              <button
                onClick={() => setShowAIGenerator(false)}
                className="text-muted-foreground hover:text-foreground text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <AIGenerator
                onPlanGenerated={handleAIGenerated}
                onOpenSettings={() => {
                  setShowAIGenerator(false);
                  setShowSettings(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ✨ NEW: Prompt Library Modal */}
      {showPromptLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Prompt Templates</h2>
              <button
                onClick={() => setShowPromptLibrary(false)}
                className="text-muted-foreground hover:text-foreground text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <PromptLibrary />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {screen === "welcome" && (
        <WelcomeScreen
          onStart={() => {
            setScreen("input");
          }}
          onContinue={
            activeProject
              ? () => {
                  setScreen("dashboard");
                }
              : undefined
          }
          onProjects={hasProjects ? () => setScreen("projects") : undefined}
          hasProject={hasProjects}
          projectTitle={activeProject?.title}
          projectCount={projects.length}
          // ✨ NEW: Pass AI feature handlers
          onShowAIGenerator={() => setShowAIGenerator(true)}
          onShowPromptLibrary={() => setShowPromptLibrary(true)}
          onShowSettings={() => setShowSettings(true)}
        />
      )}

      {screen === "input" && (
        <PlanInput
          onGenerate={handleGenerate}
          onBack={() => setScreen("welcome")}
        />
      )}

      {screen === "projects" && (
        <ProjectsDashboard
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={handleNewProject}
          onDeleteProject={handleDeleteProject}
          onBack={handleHome}
        />
      )}

      {screen === "dashboard" && (
        <ProjectDashboard
          title={activeProject?.title ?? "Untitled Project"}
          phases={activeProject?.phases ?? []}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
          onNewProject={handleNewProject}
          onHome={handleHome}
          onProjects={hasProjects ? handleProjects : undefined}
          onImport={handleImport}
        />
      )}
    </>
  );
}