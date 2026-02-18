# Ship It — From AI Plans to Executable Tasks

🔗 **Live Demo:** https://ship-it-task-manager.vercel.app/

**Ship It** explores the gap between AI-generated plans and actual execution. Paste your development plan from any AI assistant, and watch it transform into a structured task board — no manual recreation required.

It tackles the **last mile problem**: plans exist, but execution never starts.

This project is built as a **focused prototype**, optimized for speed, clarity, and UX experimentation.

---

## ✨ What This Does

- **Smart Parsing** — Accepts JSON, Markdown, AI text, or bullet points
- **Multi-Project Support** — Manage multiple plans without accounts
- **Instant Persistence** — Auto-saves to localStorage, works offline
- **Optional AI Generation (BYOK)** — Generate plans using your own Anthropic API key
- **Zero Friction** — No login, no backend, no complexity

**Built for developers who just want to ship.**

---

## 🎯 Why This Exists

When you plan with AI, the output usually becomes:
- A chat message you screenshot
- A markdown block you copy to Notes
- A Google Doc you never open again

This prototype asks a simple question:

> *What if AI planning flowed directly into execution — without friction?*

The goal isn't building another task manager. It's **closing the gap between intention and action**.

---

## 🚀 Quick Start

### Run Locally
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Three Ways to Create Projects

#### 🤖 Generate with AI (Optional)
- Add your Anthropic API key in settings
- Describe your project
- Generate a plan instantly (~$0.01–0.05)

#### 📋 Use Templates
- Copy a prompt template
- Paste into Claude, ChatGPT, or any AI
- Paste the response back into Ship It

#### ✏️ Paste & Create
- Paste JSON, Markdown, or AI output
- Smart parser auto-detects format
- Creates your task board

---

## 🧠 Core Concepts

### 1. Format-Agnostic Parsing
The smart parser handles multiple input formats:
- **JSON** — Standard structured format
- **Markdown** — Headers with checkboxes (`# Phase`, `- [ ] Task`)
- **AI Output** — Natural language (`Phase 1:`, `Step 1:`)
- **Bullet Points** — Simple numbered or bulleted lists

No need to format perfectly — just paste and go.

### 2. Multi-Project Architecture
- Projects stored in `localStorage`
- One active project at a time
- Switch between projects without data loss
- Automatic migration from legacy single-project storage

Mirrors real-world workflows without authentication overhead.

### 3. Intentionally Local-First
This prototype deliberately avoids:
- ❌ User authentication
- ❌ Backend databases
- ❌ Server-side logic
- ❌ Analytics tracking

Instead, it prioritizes:
- ✅ Fast iteration
- ✅ Zero friction
- ✅ Privacy by default
- ✅ Works offline

---

## 🏗️ Tech Stack

- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS**
- **shadcn/ui** components
- **Motion** for animations
- **localStorage** for persistence
- **Anthropic API** (optional, client-side only)

---

## 📂 Project Structure

```
app/
  page.tsx                    # Main app logic, state management
components/
  welcome-screen.tsx          # Landing page with creation modes
  plan-input.tsx              # Paste interface with smart parser
  ai-generator.tsx            # AI plan generation (BYOK)
  prompt-library.tsx          # Copy-paste templates
  api-settings.tsx            # API key management
  projects-dashboard.tsx      # Project list and management
  project-dashboard.tsx       # Task tracking interface
lib/
  smart-parser.ts             # Multi-format input parser
  ai-generator.ts             # Anthropic API integration
```

---

## 🔮 Planned Evolution (Experimental Roadmap)

Ship It is evolving in small, focused steps. These are explorations, not promises.

### Phase 1 — Enhanced Parsing Intelligence
Making AI input more resilient:
- ✅ Multi-format parser (JSON, Markdown, AI text, bullets)
- ✅ Code block stripping (handles ```json wrappers)
- 🚧 Input sanitization (remove conversational AI artifacts)
- 🚧 Smart title extraction from content
- 🚧 Partial JSON recovery for truncated outputs
- 📋 Plan versioning ("Plan A / Plan B" snapshots)

### Phase 2 — Cloud Sync (Optional)
Moving toward optional multi-device sync:
- 📋 Firebase real-time synchronization
- 📋 Anonymous auth with optional upgrade
- 📋 Local-first with background sync
- 📋 Conflict resolution using timestamps
- 📋 "Claim your projects" migration flow

**Goal:** Preserve offline-first behavior while enabling cross-device continuity.

### Phase 3 — Power-User Features
Developer-inspired workflow improvements:
- 📋 Command palette (`Ctrl/Cmd + K`)
- 📋 Keyboard shortcuts for task management
- 📋 Export to Markdown/JSON
- 📋 Input format detection badges
- 📋 Project templates library
- 📋 Bulk task operations

### Phase 4 — Developer Experience
- 📋 Comprehensive test suite for parser edge cases
- 📋 Technical notes on handling non-deterministic AI input
- 📋 API documentation for custom integrations
- 📋 Architecture decision records (ADRs)

**Legend:** ✅ Complete | 🚧 In Progress | 📋 Planned

---

## 🎯 Design Philosophy

### What This Prototype Is
- ✅ A focused exploration of AI → execution workflows
- ✅ A playground for developer-friendly UX patterns
- ✅ An experiment in format-agnostic parsing
- ✅ Built to ship fast with clear scope

### What This Prototype Is Not
- ❌ A full-featured project management tool
- ❌ A collaboration platform
- ❌ A hosted SaaS product
- ❌ A replacement for Linear/Jira/Asana

These are conscious tradeoffs to maintain focus and velocity.

---

## 🚨 Current Limitations

Known constraints (by design):
- **localStorage only** — No cross-device sync yet
- **No collaboration** — Single-user focused
- **No deadlines** — Intentionally simple
- **No dependencies** — Tasks are independent
- **Browser-bound** — Clear cache = lose data

These aren't bugs — they're scope boundaries that might evolve later.

---

## 💡 Use Cases

### For Developers
- Turn Claude/ChatGPT project plans into trackable tasks
- Break down large features into actionable chunks
- Track personal learning projects
- Prototype exploration without overhead

### For Rapid Prototyping
- Validate task breakdown strategies
- Test different parsing approaches
- Experiment with AI integration patterns
- Demonstrate UX concepts quickly

---

## 🤝 Contributing

This is a personal prototype focused on exploration, not a community-driven project.

If you're inspired:
1. Fork it
2. Build your own experiments
3. Share what you learn

**No PRs accepted** — this is a learning sandbox, not a product.

---

## 📸 Screenshots

*(Add screenshots showing:)*
- Welcome screen with three creation modes
- Smart parser handling different formats
- Task tracking interface
- AI generation modal
- Prompt library

---

## 🎤 Talking Points

If asked about the project:

> "Ship It explores the gap between AI-generated plans and actual execution. The core challenge was building a format-agnostic parser that can handle messy, inconsistent LLM output — JSON, Markdown, or plain text — and still produce a usable structure.
>
> I kept the architecture intentionally local-first to ship quickly, while designing it so cloud sync could be layered in later. The interesting part wasn't AI itself, but building reliable behavior around unpredictable input."

---

## 📝 Technical Deep Dive

### Smart Parser Architecture

The parser uses a cascading detection strategy:

```typescript
smartParse(input) {
  1. Try JSON.parse()
  2. Try markdown detection (# headers, - [ ] checkboxes)
  3. Try AI text patterns (Phase 1:, Step 1:)
  4. Try bullet point inference
  5. Return error with format hints
}
```

LLMs often wrap JSON in code blocks, add conversational text, or change formatting. A naive `JSON.parse()` fails instantly — this cascading approach maximizes success rate.

### Persistence Strategy

**Current:** localStorage with JSON serialization  
**Future:** Firebase with optimistic updates + sync

```typescript
localStorage.setItem('ship-it-projects', JSON.stringify([
  { id, title, phases, createdAt, updatedAt }
]))

localStorage.setItem('ship-it-active-project-id', projectId)
```

Migration from single-project to multi-project happens automatically on first load.

---

## 🔐 Privacy & Security

- **Zero tracking** — No analytics, no telemetry
- **Local by default** — All data stays in your browser
- **API keys** — Stored locally only
- **No backend** — Can't leak what we don't collect

Your projects stay yours.

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

Built with:
- **Claude** (Anthropic)
- **shadcn/ui**
- **Vercel**
- **Coffee**

---

## 📬 Contact

Built by [Natasa Todorov Markovic](https://www.linkedin.com/in/natasa-todorov-markovic-91172952/) | 📬 natasa.t.markovic@gmail.com


**Shipping beats perfection.**

---

*Built as an experiment. Shaped by real-world workflows.*