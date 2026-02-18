'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, ExternalLink, Check, AlertCircle } from 'lucide-react';

export function APISettings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('anthropic_api_key');
    if (stored) setApiKey(stored);
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('anthropic_api_key', apiKey.trim());
      alert('API key saved locally');
    } else {
      localStorage.removeItem('anthropic_api_key');
      alert('API key removed');
    }
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult('error');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 50,
          messages: [{
            role: 'user',
            content: 'Say "test successful" if you can read this.'
          }]
        })
      });

      if (response.ok) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch (error) {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">AI Integration (Optional)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add your Anthropic API key to generate project plans directly in the app.
          Your key is stored locally in your browser and never sent to our servers.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Anthropic API Key
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg pr-10 font-mono text-sm placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
        </div>
        
        {testResult === 'success' && (
          <div className="flex items-center gap-2 text-primary text-sm">
            <Check size={16} />
            <span>Connection successful!</span>
          </div>
        )}
        
        {testResult === 'error' && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle size={16} />
            <span>Invalid API key or connection failed</span>
          </div>
        )}
        
        <button
          onClick={testConnection}
          disabled={isTesting || !apiKey.trim()}
          className="text-sm text-primary hover:text-primary/80 disabled:text-muted-foreground transition-colors"
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <div className="text-muted-foreground">
            <strong className="text-foreground">Don't have an API key?</strong>
            <br />
            Get one at{' '}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              console.anthropic.com
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <div className="text-sm text-muted-foreground bg-primary/10 border border-primary/20 p-3 rounded">
          <strong className="text-foreground">💰 Cost estimate:</strong> ~$0.01-0.05 per plan generation
          <br />
          <strong className="text-foreground">🔒 Privacy:</strong> Your key never leaves your browser
          <br />
          <strong className="text-foreground">📊 Usage:</strong> Check your usage at console.anthropic.com
        </div>
      </div>
    </div>
  );
}