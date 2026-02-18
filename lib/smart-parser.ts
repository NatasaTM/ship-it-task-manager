export type ParseResult = {
  success: boolean;
  data?: any;
  error?: string;
  format?: 'json' | 'markdown' | 'ai-text' | 'bullets' | 'unknown';
};

/**
 * Smart parser that auto-detects and parses multiple formats:
 * - JSON (current format)
 * - Markdown with checkboxes
 * - AI-generated text (Claude/ChatGPT style)
 * - Simple bullet points
 */
export function smartParse(input: string): ParseResult {
  if (!input || !input.trim()) {
    return { success: false, error: 'Empty input' };
  }

  const trimmed = input.trim();

  // Try JSON first
  const jsonResult = tryParseJSON(trimmed);
  if (jsonResult.success) return jsonResult;

  // Try markdown with checkboxes
  const markdownResult = tryParseMarkdown(trimmed);
  if (markdownResult.success) return markdownResult;

  // Try AI-generated text format
  const aiTextResult = tryParseAIText(trimmed);
  if (aiTextResult.success) return aiTextResult;

  // Try simple bullet points
  const bulletsResult = tryParseBullets(trimmed);
  if (bulletsResult.success) return bulletsResult;

  return {
    success: false,
    error: 'Could not detect a valid format. Supported formats: JSON, Markdown, bullet points',
    format: 'unknown'
  };
}

function tryParseJSON(input: string): ParseResult {
  try {
    // Handle markdown code blocks
    let jsonStr = input;
    const codeBlockMatch = input.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    }

    const data = JSON.parse(jsonStr);

    // Validate structure
    if (data.phases && Array.isArray(data.phases)) {
      return { success: true, data, format: 'json' };
    }

    return { success: false, error: 'Invalid JSON structure' };
  } catch (e) {
    return { success: false };
  }
}

function tryParseMarkdown(input: string): ParseResult {
  // Look for markdown patterns: # headers and - [ ] checkboxes
  const hasHeaders = /^#{1,3}\s+/m.test(input);
  const hasCheckboxes = /^[-*]\s*\[[ x]\]/m.test(input);

  if (!hasHeaders && !hasCheckboxes) {
    return { success: false };
  }

  try {
    const lines = input.split('\n');
    const phases: any[] = [];
    let currentPhase: any = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Check for phase header (# Phase or ## Phase)
      const headerMatch = trimmedLine.match(/^#{1,3}\s+(.+)/);
      if (headerMatch) {
        if (currentPhase) {
          phases.push(currentPhase);
        }
        currentPhase = {
          name: headerMatch[1],
          tasks: []
        };
        continue;
      }

      // Check for task (- [ ] or - [x])
      const taskMatch = trimmedLine.match(/^[-*]\s*\[([ x])\]\s*(.+)/);
      if (taskMatch && currentPhase) {
        currentPhase.tasks.push({
          title: taskMatch[2],
          completed: taskMatch[1].toLowerCase() === 'x'
        });
      }
    }

    if (currentPhase) {
      phases.push(currentPhase);
    }

    if (phases.length === 0) {
      return { success: false };
    }

    return {
      success: true,
      data: {
        name: 'Imported Project',
        phases
      },
      format: 'markdown'
    };
  } catch (e) {
    return { success: false };
  }
}

function tryParseAIText(input: string): ParseResult {
  // Look for common AI output patterns
  const hasPhasePattern = /(?:Phase|Step|Stage)\s*\d+[:\-]/i.test(input);
  const hasNumberedList = /^\d+\.\s+/m.test(input);

  if (!hasPhasePattern && !hasNumberedList) {
    return { success: false };
  }

  try {
    const lines = input.split('\n');
    const phases: any[] = [];
    let currentPhase: any = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Check for phase headers: "Phase 1:", "Step 1 -", etc.
      const phaseMatch = trimmedLine.match(/^(?:Phase|Step|Stage)\s*(\d+)[:\-]\s*(.+)/i);
      if (phaseMatch) {
        if (currentPhase) {
          phases.push(currentPhase);
        }
        currentPhase = {
          name: `Phase ${phaseMatch[1]}: ${phaseMatch[2]}`,
          tasks: []
        };
        continue;
      }

      // Check for tasks (numbered or bulleted)
      const taskMatch = trimmedLine.match(/^(?:\d+\.|[-*])\s+(.+)/);
      if (taskMatch && currentPhase) {
        currentPhase.tasks.push({
          title: taskMatch[1],
          completed: false
        });
      }
    }

    if (currentPhase) {
      phases.push(currentPhase);
    }

    if (phases.length === 0) {
      return { success: false };
    }

    return {
      success: true,
      data: {
        name: 'Imported Project',
        phases
      },
      format: 'ai-text'
    };
  } catch (e) {
    return { success: false };
  }
}

function tryParseBullets(input: string): ParseResult {
  const lines = input.split('\n').filter(l => l.trim());
  
  // Simple heuristic: if most lines start with bullets/numbers, treat as tasks
  const bulletLines = lines.filter(l => /^(?:\d+\.|[-*•])\s+/.test(l.trim()));
  
  if (bulletLines.length < lines.length * 0.5) {
    return { success: false };
  }

  try {
    const tasks = bulletLines.map(line => {
      const match = line.trim().match(/^(?:\d+\.|[-*•])\s+(.+)/);
      return {
        title: match ? match[1] : line.trim(),
        completed: false
      };
    });

    return {
      success: true,
      data: {
        name: 'Imported Project',
        phases: [{
          name: 'Tasks',
          tasks
        }]
      },
      format: 'bullets'
    };
  } catch (e) {
    return { success: false };
  }
}

// Get format-specific hints for users
export function getFormatHints(format?: string): string {
  switch (format) {
    case 'json':
      return 'Paste your JSON plan directly or wrapped in ```json code blocks';
    case 'markdown':
      return 'Paste markdown with # headers and - [ ] checkboxes';
    case 'ai-text':
      return 'Paste AI output with "Phase 1:", "Step 1:", etc.';
    case 'bullets':
      return 'Paste a simple list of tasks (bullets or numbered)';
    default:
      return 'Paste in any format: JSON, Markdown, or plain text';
  }
}
