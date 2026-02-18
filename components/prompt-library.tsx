'use client';

import { useState } from 'react';
import { Copy, Check, BookOpen } from 'lucide-react';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  tags: string[];
}

const TEMPLATES: PromptTemplate[] = [
  {
    id: 'json-basic',
    name: 'JSON Format (Recommended)',
    description: 'Get a structured plan in JSON format - works best with Ship It',
    tags: ['json', 'structured'],
    prompt: `Create a development plan in this exact JSON format:

{
  "name": "Project Name",
  "description": "Brief project description",
  "phases": [
    {
      "name": "Phase 1: Setup & Foundation",
      "tasks": [
        {"title": "Initialize project repository", "completed": false},
        {"title": "Set up development environment", "completed": false}
      ]
    },
    {
      "name": "Phase 2: Core Development",
      "tasks": [
        {"title": "Implement main features", "completed": false}
      ]
    }
  ]
}

Project to plan:
[DESCRIBE YOUR PROJECT HERE]

Requirements:
- Include 3-6 phases
- Each phase should have 3-8 specific, actionable tasks
- Order tasks logically (dependencies first)
- Use clear, developer-friendly language
- Return ONLY the JSON, no additional text`
  },
  {
    id: 'markdown',
    name: 'Markdown Checklist',
    description: 'Simple markdown format with checkboxes',
    tags: ['markdown', 'simple'],
    prompt: `Create a development plan in markdown format with checkboxes:

# Phase 1: Setup
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

# Phase 2: Development
- [ ] Task 4
- [ ] Task 5

# Phase 3: Testing & Deployment
- [ ] Task 6
- [ ] Task 7

Project to plan:
[DESCRIBE YOUR PROJECT HERE]

Include 3-6 phases with specific, actionable tasks.`
  },
  {
    id: 'detailed',
    name: 'Detailed with Estimates',
    description: 'Includes time estimates and task descriptions',
    tags: ['json', 'detailed', 'estimates'],
    prompt: `Create a detailed development plan with time estimates in JSON format:

{
  "name": "Project Name",
  "description": "Project description",
  "phases": [
    {
      "name": "Phase 1: Planning",
      "tasks": [
        {
          "title": "Define requirements",
          "completed": false,
          "estimatedHours": 4,
          "description": "Gather and document all project requirements"
        }
      ]
    }
  ]
}

Project to plan:
[DESCRIBE YOUR PROJECT HERE]

Include:
- 3-6 phases covering full development lifecycle
- Realistic time estimates in hours
- Brief descriptions for complex tasks
- Logical task ordering`
  },
  {
    id: 'web-app',
    name: 'Web Application',
    description: 'Template optimized for web app development',
    tags: ['web', 'frontend', 'backend'],
    prompt: `Create a development plan for a web application in JSON format:

{
  "name": "Web App Name",
  "phases": [
    {
      "name": "Phase 1: Setup & Architecture",
      "tasks": [
        {"title": "Set up project structure", "completed": false},
        {"title": "Configure build tools", "completed": false}
      ]
    },
    {
      "name": "Phase 2: Frontend Development",
      "tasks": []
    },
    {
      "name": "Phase 3: Backend & API",
      "tasks": []
    },
    {
      "name": "Phase 4: Database & Auth",
      "tasks": []
    },
    {
      "name": "Phase 5: Testing & Polish",
      "tasks": []
    },
    {
      "name": "Phase 6: Deployment",
      "tasks": []
    }
  ]
}

Web application to build:
[DESCRIBE YOUR WEB APP HERE]

Focus on: UI/UX, API design, database schema, authentication, testing, and deployment.`
  },
  {
    id: 'mobile-app',
    name: 'Mobile Application',
    description: 'Template for iOS/Android app development',
    tags: ['mobile', 'ios', 'android'],
    prompt: `Create a development plan for a mobile application:

Mobile app to build:
[DESCRIBE YOUR MOBILE APP HERE]

Platform: [iOS / Android / React Native / Flutter]

Create a JSON plan covering:
- UI/UX design and prototyping
- Core feature implementation
- API integration
- Local storage and caching
- Push notifications
- Testing on devices
- App store submission`
  },
  {
    id: 'api',
    name: 'API/Backend Service',
    description: 'For REST APIs and backend services',
    tags: ['backend', 'api'],
    prompt: `Create a development plan for a backend API service:

API to build:
[DESCRIBE YOUR API HERE]

Create a JSON plan covering:
- API design and documentation
- Database schema design
- Authentication & authorization
- Endpoint implementation
- Rate limiting & security
- Testing & validation
- Deployment & monitoring`
  }
];

export function PromptLibrary() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const handleCopy = async (template: PromptTemplate) => {
    await navigator.clipboard.writeText(template.prompt);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allTags = Array.from(new Set(TEMPLATES.flatMap(t => t.tags)));
  const filtered = filter === 'all' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.tags.includes(filter));

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border border-border">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="text-primary" size={24} />
          <h3 className="text-lg font-semibold text-foreground">Prompt Templates</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Copy these prompts to use with Claude, ChatGPT, or any AI assistant.
          Paste the AI's response back into Ship It.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === tag
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(template => (
          <div
            key={template.id}
            className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors bg-card"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-foreground">{template.name}</h4>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
              <button
                onClick={() => handleCopy(template)}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm transition-colors"
              >
                {copiedId === template.id ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
            
            <details className="mt-3">
              <summary className="text-sm text-primary cursor-pointer hover:text-primary/80">
                View prompt
              </summary>
              <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto text-foreground">
                {template.prompt}
              </pre>
            </details>
          </div>
        ))}
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded p-4 text-sm">
        <strong className="text-foreground">💡 How to use:</strong>
        <ol className="mt-2 ml-4 space-y-1 list-decimal text-muted-foreground">
          <li>Copy a template above</li>
          <li>Replace [DESCRIBE YOUR PROJECT] with your idea</li>
          <li>Paste into Claude, ChatGPT, or any AI</li>
          <li>Copy the AI's response</li>
          <li>Paste it back into Ship It</li>
        </ol>
      </div>
    </div>
  );
}