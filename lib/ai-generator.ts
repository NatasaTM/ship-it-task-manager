export interface GeneratePlanOptions {
  description: string;
  projectType?: 'web-app' | 'mobile-app' | 'api' | 'library' | 'other';
  complexity?: 'simple' | 'medium' | 'complex';
  includeEstimates?: boolean;
}

export interface GeneratePlanResult {
  success: boolean;
  data?: any;
  error?: string;
  tokensUsed?: number;
}

export async function generatePlanWithAI(
  options: GeneratePlanOptions
): Promise<GeneratePlanResult> {
  const apiKey = localStorage.getItem('anthropic_api_key');

  if (!apiKey) {
    return {
      success: false,
      error: 'No API key found. Please add your Anthropic API key in settings.'
    };
  }

  const prompt = buildPrompt(options);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || 'API request failed'
      };
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from response (Claude might wrap it in markdown)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                      content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return {
        success: false,
        error: 'Could not extract valid JSON from AI response'
      };
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const plan = JSON.parse(jsonStr);

    return {
      success: true,
      data: plan,
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

function buildPrompt(options: GeneratePlanOptions): string {
  const { description, projectType, complexity, includeEstimates } = options;

  return `You are a project planning assistant. Generate a detailed development plan for the following project.

Project Description: ${description}
${projectType ? `Project Type: ${projectType}` : ''}
${complexity ? `Complexity: ${complexity}` : ''}

Return ONLY a valid JSON object with this exact structure:
{
  "name": "Project Name",
  "description": "Brief project description",
  "phases": [
    {
      "name": "Phase 1: Setup",
      "tasks": [
        {
          "title": "Task description",
          "completed": false${includeEstimates ? ',\n          "estimatedHours": 2' : ''}
        }
      ]
    }
  ]
}

Requirements:
- Include 3-6 phases depending on project complexity
- Each phase should have 3-8 actionable tasks
- Tasks should be specific and measurable
- Order tasks logically (dependencies first)
${includeEstimates ? '- Include realistic time estimates in hours for each task' : ''}
- Use clear, developer-friendly language

Return ONLY the JSON, no additional text or explanation.`;
}

// Helper to check if user has API key configured
export function hasAPIKey(): boolean {
  return !!localStorage.getItem('anthropic_api_key');
}

// Helper to validate API key format
export function isValidAPIKeyFormat(key: string): boolean {
  return key.startsWith('sk-ant-') && key.length > 20;
}
