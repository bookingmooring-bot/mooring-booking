---
name: implementation-planner
description: >
  Creates a detailed, structured implementation plan (PLAN.md) for any feature, refactor, bugfix, or project task.
  Use this skill whenever the user asks to "make a plan", "plan the implementation", "what's the implementation plan", 
  "kako da implementiramo", "napravi plan", "razradi plan", "šta treba uraditi za", or anytime they describe a feature or change 
  and need a clear roadmap before touching code. Also trigger this skill when the user says things like "gdje početi", 
  "how to approach", "break this down for me", or when there's a complex multi-file/multi-step task ahead.
  Always use this skill proactively when the user is about to start a non-trivial implementation.
---

# Implementation Planner

You create detailed, actionable implementation plans that serve as a roadmap before writing any code. A good plan prevents wasted effort, catches design issues early, and gives the team (or just the user) a shared understanding of what will be built.

## When to skip straight to a short answer

If the user is asking about a **single-file, 1–2 function change** that is totally obvious (e.g. "add a field to this interface"), you can answer directly without a full plan. Otherwise, write a plan.

---

## Step 1 — Gather Context

Before writing anything, understand the task fully. Do **all** of the following in parallel:

1. **Read the codebase** — scan relevant files (entry points, related modules, shared types, configs). Don't guess at imports; verify them.
2. **Read any existing plan** — if `PLAN.md` or a similar doc already exists in the project root, read it and extend/replace as needed.
3. **Check the stack** — identify frameworks, databases, APIs, env vars, and any MCPs in use.
4. **Identify unknowns** — list everything you don't know yet. You'll surface these to the user.

If the user's request is ambiguous, ask **one focused clarifying question** before proceeding (not multiple questions at once). Prefer to make a reasonable assumption and call it out in the plan.

---

## Step 2 — Write the Plan

Write the plan to **`PLAN.md`** in the project root (or update it if it already exists). Use the template below exactly. Fill every section — don't leave placeholders.

```markdown
# Implementation Plan: [Short Title]

> **Status:** Draft | In Progress | Done  
> **Created:** YYYY-MM-DD  
> **Scope:** [one sentence — what this plan covers]

---

## 🎯 Goal

What we are building / fixing / refactoring, and why. Write 2–4 sentences from the perspective of user value or system correctness.

---

## 📋 Requirements

### Functional
- [ ] Requirement 1
- [ ] Requirement 2

### Non-Functional
- [ ] Performance / scalability constraints
- [ ] Security / auth requirements
- [ ] Error handling expectations

---

## 🗺️ Architecture Overview

Describe the high-level design. Include:
- Which existing components are affected
- Which new components will be created
- How data flows between them

Use a Mermaid diagram if it helps:

```mermaid
flowchart LR
    A[Client] --> B[API Layer]
    B --> C[Service]
    C --> D[Database]
```

---

## 📁 Files to Change

Group by component/layer. Use icons to signal intent:

| File | Change Type | Summary |
|------|------------|---------|
| `src/api/foo.ts` | ✏️ Modify | Add new endpoint `/bar` |
| `src/types/index.ts` | ✏️ Modify | Add `BarDTO` type |
| `src/services/barService.ts` | 🆕 Create | Business logic for bar |
| `src/old-thing.ts` | 🗑️ Delete | Replaced by barService |
| `supabase/functions/bar/index.ts` | 🆕 Create | Edge function for bar |

---

## 🧩 Implementation Steps

Break the work into ordered, atomic steps that can be ticked off one by one. Each step should be completable in a single session. Include **which file(s)** each step touches.

### Phase 1 — Foundation
- [ ] **Step 1.1** — [What to do] (`file.ts`)
  - Details: ...
- [ ] **Step 1.2** — [What to do] (`other-file.ts`)

### Phase 2 — Core Logic
- [ ] **Step 2.1** — ...

### Phase 3 — Integration & Polish
- [ ] **Step 3.1** — ...

---

## ⚠️ Risks & Decisions

| # | Risk / Decision | Impact | Mitigation / Decision Made |
|---|----------------|--------|---------------------------|
| 1 | [e.g. Pinecone index dimension mismatch] | High | Use Pinecone Inference API instead of Gemini embeddings |
| 2 | [e.g. Breaking change to existing API contract] | Medium | Version the endpoint or add backwards-compatible field |

---

## 🔗 Dependencies & Prerequisites

- Environment variables needed: `SUPABASE_URL`, `OPENAI_API_KEY`, ...
- External services: ...
- Must be done first: [link to another task/step]

---

## ✅ Verification Plan

How to know the implementation is correct:

### Automated
- [ ] Run `npm run build` — no TypeScript errors
- [ ] Run `npm test` — all tests pass
- [ ] [specific test command for this feature]

### Manual
- [ ] [Specific thing to click/observe in the UI]
- [ ] [Specific API call to make and expected response]
- [ ] [Edge case to test manually]

---

## 📝 Notes

Any open questions, future improvements, or context that didn't fit above.
```

---

## Step 3 — Present the Plan to the User

After writing `PLAN.md`:

1. **Summarize** the plan in 3–5 bullet points directly in the chat (don't make the user open the file to understand what you're suggesting).
2. **Highlight** any risks, design decisions, or unknowns that need user input.
3. **Ask** if they want to start with Phase 1 or if any part of the plan needs adjustment.

Do NOT start implementing until the user confirms the plan (or explicitly says "just do it").

---

## Style Guidelines for Plans

- **Be specific.** Don't write "update the service" — write "add `createMooring()` to `mooringService.ts` that calls `supabase.from('moorings').insert()`."
- **Be honest about unknowns.** Surface them in the Risks section rather than pretending you know the answer.
- **Think in phases.** Foundation first, then core logic, then integration. Never mix them.
- **Keep it scannable.** Tables, checkboxes, and code references make plans dramatically more useful than prose.
- **File paths matter.** Always use paths relative to the project root.
- **Mermaid diagrams** are worth adding whenever data flow is non-trivial.
- **Avoid over-planning.** A plan that takes longer to write than to implement is a bad plan. Aim for clarity, not exhaustiveness.
