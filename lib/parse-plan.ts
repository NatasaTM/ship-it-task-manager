export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export interface Phase {
  id: string;
  name: string;
  hours: string | null;
  tasks: Task[];
}

let idCounter = 0;
function nextId(prefix: string) {
  idCounter++;
  return `${prefix}-${idCounter}`;
}

export function parsePlan(text: string): Phase[] {
  idCounter = 0;
  const phases: Phase[] = [];
  const lines = text.split("\n");

  let currentPhase: Phase | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Match phase headers: ### Phase 1: Name (Hours X-Y) or similar variants
    const phaseMatch = trimmed.match(
      /^#{1,4}\s*(?:Phase\s*\d+\s*[:.]?\s*)?(.+?)(?:\s*\(([^)]+)\))?\s*$/i
    );

    if (phaseMatch && !trimmed.startsWith("- ") && !trimmed.startsWith("* ")) {
      // Save previous phase
      if (currentPhase) {
        phases.push(currentPhase);
      }

      currentPhase = {
        id: nextId("phase"),
        name: phaseMatch[1].trim(),
        hours: phaseMatch[2] ? phaseMatch[2].trim() : null,
        tasks: [],
      };
      continue;
    }

    // Match task items: - Task description or * Task description
    const taskMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (taskMatch && currentPhase) {
      currentPhase.tasks.push({
        id: nextId("task"),
        text: taskMatch[1].trim().replace(/\*\*/g, ""),
        done: false,
      });
    }
  }

  // Push the last phase
  if (currentPhase) {
    phases.push(currentPhase);
  }

  // If no phases were found, create a single "Tasks" phase with all bullet items
  if (phases.length === 0) {
    const fallbackPhase: Phase = {
      id: nextId("phase"),
      name: "Tasks",
      hours: null,
      tasks: [],
    };

    for (const line of lines) {
      const trimmed = line.trim();
      const taskMatch = trimmed.match(/^[-*]\s+(.+)$/);
      if (taskMatch) {
        fallbackPhase.tasks.push({
          id: nextId("task"),
          text: taskMatch[1].trim().replace(/\*\*/g, ""),
          done: false,
        });
      }
    }

    if (fallbackPhase.tasks.length > 0) {
      phases.push(fallbackPhase);
    }
  }

  return phases;
}
