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
function nextId(prefix: string): string {
  idCounter++;
  return `${prefix}-${idCounter}`;
}

export function parsePlan(text: string): Phase[] {
  idCounter = 0;
  const originalText = text.trim();
  
  // 1. EXTRACT ONLY THE JSON PART
  let jsonPart = "";
  const start = originalText.indexOf('{');
  const end = originalText.lastIndexOf('}');
  
  if (start !== -1 && end !== -1 && end > start) {
    jsonPart = originalText.substring(start, end + 1);
  } else {
    // If there are no braces, fall back to Markdown immediately
    return parseMarkdown(originalText);
  }

  try {
    // 2. REMOVE "TRAILING COMMAS" (main culprit)
    // This regex looks for a comma right before ] or }
    const sanitized = jsonPart
      .replace(/,\s*([\]}])/g, '$1') 
      .replace(/[\u201C\u201D]/g, '"'); // Replaces "smart" quotes with regular quotes

    const data = JSON.parse(sanitized);
    const phasesArray = data.phases || data; // Supports both a direct array and {phases: []}

    if (Array.isArray(phasesArray)) {
      return phasesArray.map((p: any) => ({
        id: nextId("phase"),
        name: String(p.name || "Phase").trim(),
        hours: p.hours ? String(p.hours).trim() : null,
        tasks: (p.tasks || []).map((t: any) => ({
          id: nextId("task"),
          text: String(t).trim(),
          done: false,
        })),
      }));
    }
  } catch (e) {
    console.error("JSON parse failed čak i nakon čišćenja, pokušavam Markdown...");
  }

  return parseMarkdown(originalText);
}

// Extracted Markdown function to keep the code cleaner
function parseMarkdown(text: string): Phase[] {
  const phases: Phase[] = [];
  const lines = text.split("\n");
  let currentPhase: Phase | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Looks for headings (Phase 1, ### Setup...)
    const phaseMatch = trimmed.match(/^#{1,4}\s*(?:Phase\s*\d+\s*[:.]?\s*)?(.+?)(?:\s*\(([^)]+)\))?\s*$/i);
    
    if (phaseMatch && !trimmed.startsWith("-") && !trimmed.startsWith("*")) {
      if (currentPhase) phases.push(currentPhase);
      currentPhase = {
        id: nextId("phase"),
        name: phaseMatch[1].trim(),
        hours: phaseMatch[2] ? phaseMatch[2].trim() : null,
        tasks: [],
      };
      continue;
    }

    // Looks for tasks (- Task, * Task)
    const taskMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (taskMatch) {
      const taskObj = {
        id: nextId("task"),
        text: taskMatch[1].trim().replace(/\*\*/g, ""),
        done: false,
      };
      
      if (currentPhase) {
        currentPhase.tasks.push(taskObj);
      } else {
        // If there is no phase, create a default "General" phase
        currentPhase = { id: nextId("phase"), name: "General", hours: null, tasks: [taskObj] };
      }
    }
  }

  if (currentPhase) phases.push(currentPhase);
  return phases;
}
