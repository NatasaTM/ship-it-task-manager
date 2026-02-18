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
  
  if (!originalText) {
    return [];
  }

  // Try JSON first
  const jsonResult = tryParseAsJson(originalText);
  if (jsonResult && jsonResult.length > 0) {
    return jsonResult;
  }

  // Fallback to markdown
  console.log("JSON parsing failed, trying Markdown");
  return parseMarkdown(originalText);
}

function tryParseAsJson(text: string): Phase[] | null {
  let jsonString = text;

  // Step 1: Remove markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    jsonString = fenceMatch[1].trim();
  }

  // Step 2: Try to extract JSON object or array
  let extracted = jsonString;
  
  // If it doesn't start with { or [, try to find the JSON part
  if (!jsonString.trim().startsWith('{') && !jsonString.trim().startsWith('[')) {
    const objStart = jsonString.indexOf('{');
    const objEnd = jsonString.lastIndexOf('}');
    const arrStart = jsonString.indexOf('[');
    const arrEnd = jsonString.lastIndexOf(']');
    
    if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
      extracted = jsonString.substring(objStart, objEnd + 1);
    } else if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
      extracted = jsonString.substring(arrStart, arrEnd + 1);
    } else {
      return null;
    }
  }

  // Step 3: Sanitize the JSON
  try {
    const sanitized = extracted
      // Remove single-line comments
      .replace(/\/\/.*$/gm, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Replace smart quotes with regular quotes
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      // Remove zero-width spaces
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();

    // Step 4: Parse JSON
    const parsed = JSON.parse(sanitized);
    
    // Step 5: Extract phases array
    let phasesArray: any[];
    
    if (Array.isArray(parsed)) {
      phasesArray = parsed;
    } else if (parsed && typeof parsed === 'object') {
      // Try common property names
      if (Array.isArray(parsed.phases)) {
        phasesArray = parsed.phases;
      } else if (Array.isArray(parsed.plan)) {
        phasesArray = parsed.plan;
      } else if (Array.isArray(parsed.steps)) {
        phasesArray = parsed.steps;
      } else {
        // Find first array property
        const firstArray = Object.values(parsed).find(v => Array.isArray(v));
        if (firstArray) {
          phasesArray = firstArray as any[];
        } else {
          return null;
        }
      }
    } else {
      return null;
    }

    // Step 6: Validate and transform
    if (!Array.isArray(phasesArray) || phasesArray.length === 0) {
      return null;
    }

    const result = phasesArray
      .filter(p => p && typeof p === 'object')
      .map((p: any) => {
        // Get phase name
        const name = (p.name || p.title || p.phase || p.label || "Phase").toString().trim();
        
        // Get hours
        let hours: string | null = null;
        const hoursValue = p.hours || p.duration || p.timeEstimate || p.time;
        if (hoursValue) {
          hours = hoursValue.toString().trim();
        }

        // Get tasks
        const tasksRaw = p.tasks || p.items || p.steps || p.todo || [];
        const tasks = (Array.isArray(tasksRaw) ? tasksRaw : [])
          .filter(t => t !== null && t !== undefined)
          .map((t: any) => {
            let text = '';
            let done = false;

            if (typeof t === 'string') {
              text = t.trim();
            } else if (typeof t === 'object') {
              text = (t.text || t.task || t.name || t.description || t.title || '').toString().trim();
              done = Boolean(t.done || t.completed || t.checked);
            } else {
              text = t.toString().trim();
            }

            if (!text) return null;

            return {
              id: nextId("task"),
              text,
              done,
            };
          })
          .filter((t): t is Task => t !== null);

        return {
          id: nextId("phase"),
          name,
          hours,
          tasks,
        };
      })
      .filter(phase => phase.tasks.length > 0);

    return result.length > 0 ? result : null;

  } catch (error) {
    console.error("JSON parsing error:", error);
    return null;
  }
}

function parseMarkdown(text: string): Phase[] {
  const phases: Phase[] = [];
  const lines = text.split("\n");
  let currentPhase: Phase | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) continue;

    // Check if this is a phase header
    // Matches: ### Phase 1: Setup (2-4 hours)
    //          ## Setup (2-4 hours)
    //          Phase 1: Setup
    //          **Phase 1: Setup**
    const isHeader = 
      trimmed.match(/^#{1,6}\s+/) ||  // Markdown headers
      trimmed.match(/^\*\*[^*]+\*\*$/) || // Bold text
      (trimmed.match(/^(?:Phase\s*\d+|Step\s*\d+)/i) && !trimmed.match(/^[-*+\d.]/)); // Phase/Step prefix

    if (isHeader) {
      // Extract name and hours
      let cleanLine = trimmed
        .replace(/^#{1,6}\s+/, '') // Remove #
        .replace(/^\*\*/, '').replace(/\*\*$/, '') // Remove bold
        .trim();

      // Try to extract hours in parentheses
      const hoursMatch = cleanLine.match(/\(([^)]+)\)\s*$/);
      let hours: string | null = null;
      let name = cleanLine;

      if (hoursMatch) {
        hours = hoursMatch[1].trim();
        name = cleanLine.replace(/\s*\([^)]+\)\s*$/, '').trim();
      }

      // Remove "Phase X:" or "Step X:" prefix for cleaner names
      name = name.replace(/^(?:Phase|Step)\s*\d+\s*:?\s*/i, '').trim();

      if (currentPhase && currentPhase.tasks.length > 0) {
        phases.push(currentPhase);
      }

      currentPhase = {
        id: nextId("phase"),
        name: name || "Phase",
        hours,
        tasks: [],
      };
      continue;
    }

    // Check if this is a task
    // Matches: - Task
    //          * Task  
    //          + Task
    //          1. Task
    //          [ ] Task
    //          [x] Task
    const taskMatch = trimmed.match(/^(?:[-*+]|\d+\.|\[[ xX]\])\s+(.+)$/);
    
    if (taskMatch) {
      const taskText = taskMatch[1]
        .trim()
        .replace(/\*\*/g, '') // Remove bold
        .replace(/`/g, '') // Remove code markers
        .replace(/^~~(.+)~~$/, '$1'); // Remove strikethrough

      const done = trimmed.match(/^\[xX\]/) !== null;

      const task: Task = {
        id: nextId("task"),
        text: taskText,
        done,
      };

      if (!currentPhase) {
        // Create default phase if none exists
        currentPhase = {
          id: nextId("phase"),
          name: "Tasks",
          hours: null,
          tasks: [],
        };
      }

      currentPhase.tasks.push(task);
    }
  }

  // Add last phase
  if (currentPhase && currentPhase.tasks.length > 0) {
    phases.push(currentPhase);
  }

  return phases;
}