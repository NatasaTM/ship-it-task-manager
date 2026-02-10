# 🧩 Ship It — From AI Plans to Executable Tasks

**Ship It** is a lightweight prototype that turns AI-generated development plans into structured, trackable tasks — without forcing you to manually recreate everything in a todo app.

It focuses on the **last mile problem**: plans exist, but execution never starts.

This project is intentionally built as a **vibe-coding / prototyping demo**, optimized for speed, clarity, and UX experimentation rather than completeness.

---

## ✨ What This Prototype Does

- Converts AI-generated build plans (JSON) into structured project phases and tasks
- Tracks task completion with instant feedback
- Persists progress across browser refreshes
- Supports multiple projects without user accounts
- Automatically migrates legacy single-project data

**No login. No backend. No overengineering.**

---

## 🎯 Why This Exists

When planning with AI, the output usually ends as:
- a chat message
- a markdown block
- a document you never act on

This prototype explores a simple question:

> *What if AI planning flowed directly into execution — without friction?*

The goal is not task management. The goal is **reducing the gap between intention and action**.

---

## 🧠 Core Concepts

### 1. AI → JSON → UI

AI is used only to generate a structured plan (JSON). The app is responsible for:
- validating structure
- rendering tasks
- tracking progress

This keeps AI usage transparent and replaceable.

### 2. Multi-Project by Design

- Multiple projects are stored in `localStorage`
- One project is always marked as active
- Users can create, open, and delete projects
- Switching projects does not erase data

This mirrors real-world workflows without adding auth complexity.

### 3. No Accounts (On Purpose)

This prototype avoids:
- authentication
- databases
- user management

Instead, it prioritizes:
- fast iteration
- low friction
- realistic validation flows

Persistence is handled via `localStorage`, which is sufficient for this stage.

---

## 🗂️ Persistence Strategy

- Projects are stored in `localStorage`
- Task completion is auto-saved on every change
- Data persists across:
  - page refreshes
  - browser restarts

### Legacy Migration

If an older single-project key is detected:
- data is automatically migrated
- the new multi-project structure is initialized
- no user action required

---

## 🧪 What This Prototype Intentionally Does Not Do

- ❌ No real AI calls (output is pasted or mocked)
- ❌ No user accounts
- ❌ No backend or database
- ❌ No collaboration
- ❌ No analytics

These are conscious tradeoffs to keep the focus on core UX and flow.

---

## 🧱 Tech Stack

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **localStorage** for persistence
- **Tailwind CSS** for styling

---

## 🧭 Project Structure (Relevant Files)

```
├── page.tsx                    # main app entry
├── welcome-screen.tsx          # project overview & entry points
├── projects-dashboard.tsx      # create, open, delete projects
├── project-dashboard.tsx       # task tracking and progress
└── localStorage helpers        # save/load/migrate project data
```

---

## 🚀 How to Run Locally

```bash
npm install
npm run dev
```

Then open: 👉 **http://localhost:3000**

---

## 🧠 Future Directions (Out of Scope for This Prototype)

- Shareable project links
- Backend persistence (KV / Redis / DB)
- AI prompt automation
- Export to GitHub Issues / Notion
- Collaboration

These were intentionally left out to preserve scope.

---

## 🏁 Final Notes

This project is **not a finished product**. It is a focused prototype designed to demonstrate:

- product thinking
- scope discipline
- UX decisions
- pragmatic AI usage
- real developer pain points

**That's the point.**

---

## 📄 License

MIT

---

**Built with ⚡ by a developer who ships.**