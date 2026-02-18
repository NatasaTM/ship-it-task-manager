'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Settings } from 'lucide-react';
import { generatePlanWithAI, hasAPIKey, type GeneratePlanOptions } from '@/lib/ai-generator';

interface AIGeneratorProps {
  onPlanGenerated: (plan: any) => void;
  onOpenSettings: () => void;
}

export function AIGenerator({ onPlanGenerated, onOpenSettings }: AIGeneratorProps) {
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState<GeneratePlanOptions['projectType']>('other');
  const [complexity, setComplexity] = useState<GeneratePlanOptions['complexity']>('medium');
  const [includeEstimates, setIncludeEstimates] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasKey = hasAPIKey();

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please describe your project');
      return;
    }

    if (!hasKey) {
      setError('Please add your API key in settings first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const result = await generatePlanWithAI({
      description,
      projectType,
      complexity,
      includeEstimates
    });

    setIsGenerating(false);

    if (result.success && result.data) {
      onPlanGenerated(result.data);
      setDescription('');
      
      // Show token usage if available
      if (result.tokensUsed) {
        const cost = (result.tokensUsed / 1_000_000) * 3; // Rough estimate
        console.log(`Tokens used: ${result.tokensUsed} (~$${cost.toFixed(4)})`);
      }
    } else {
      setError(result.error || 'Failed to generate plan');
    }
  };

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border-2 border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={24} />
          <h3 className="text-lg font-semibold text-foreground">AI Plan Generator</h3>
        </div>
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings size={16} />
          Settings
        </button>
      </div>

      {!hasKey && (
        <div className="bg-destructive/10 border border-destructive/20 rounded p-3 text-sm text-foreground">
          <strong>⚠️ API Key Required</strong>
          <br />
          <span className="text-muted-foreground">Add your Anthropic API key in settings to use AI generation.</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Project Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g., Build a task management app with real-time collaboration, user authentication, and project dashboards..."
            rows={4}
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg resize-none placeholder:text-muted-foreground"
            disabled={isGenerating}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Project Type
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as any)}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg"
              disabled={isGenerating}
            >
              <option value="web-app">Web App</option>
              <option value="mobile-app">Mobile App</option>
              <option value="api">API/Backend</option>
              <option value="library">Library/Package</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Complexity
            </label>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value as any)}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg"
              disabled={isGenerating}
            >
              <option value="simple">Simple (3-4 phases)</option>
              <option value="medium">Medium (4-6 phases)</option>
              <option value="complex">Complex (6+ phases)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="estimates"
            checked={includeEstimates}
            onChange={(e) => setIncludeEstimates(e.target.checked)}
            disabled={isGenerating}
            className="rounded"
          />
          <label htmlFor="estimates" className="text-sm text-foreground">
            Include time estimates
          </label>
        </div>

        {error && (
          <div className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 p-3 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !hasKey || !description.trim()}
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Generating Plan...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate Plan with AI
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Cost: ~$0.01-0.05 per generation • Uses your API key
        </p>
      </div>
    </div>
  );
}