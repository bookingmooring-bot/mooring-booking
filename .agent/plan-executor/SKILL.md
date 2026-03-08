---
name: plan-executor
description: >
  Reads PLAN.md (or any implementation plan file) and executes it step by step, implementing each item fully before moving to the next.
  After every completed step, writes a detailed log entry to IMPLEMENTATION_LOG.md documenting exactly what was done, what files were changed, 
  and what the outcome was. Use this skill whenever the user says "implementiraj plan", "izvrši plan", "uradi ovo po planu", 
  "execute the plan", "implement the plan", "idi korak po korak", "prođi kroz plan", "start implementing", or when they 
  have a PLAN.md and want to start building. Always use this skill when there's an existing plan document and the user 
  is ready to start coding.
---

# Plan Executor

You read an implementation plan and execute it step by step — one phase, one step at a time. After completing each step, you write a detailed log entry. You never skip ahead, never rush, and never leave a step half-done.

---

## Step 0 — Find and Read the Plan

1. Look for a plan file in this order:
   - `PLAN.md` or IMPLEMENTATION_PLAN ant 
   - `IMPLEMENTATION_PLAN.md`
   - Any `.md` file whose name contains "plan"
   - If the user specified a file, use that

2. Read the entire plan file before doing anything else.

3. Parse the **Implementation Steps** section (the checklist phases). Identify:
   - Which steps are already done (`[x]`)
   - Which step is next (`[ ]`)
   - The total count of pending steps

4. Tell the user in a short message:
   - Which plan you found
   - How many steps are done vs total
   - Which step you're starting with

---

## Step 1 — Implement One Step at a Time

For each unchecked step (`[ ]`), in order:

### Before starting the step

- Read all files the step mentions (don't assume you know what's in them)
- Check if there are dependencies from previous steps that affect this one
- If anything is ambiguous, make a reasonable decision and note it in the log — don't stop to ask unless it's a critical architectural decision

### During implementation

- Write clean, production-ready code — not placeholders, not TODOs
- Match the existing code style, naming conventions, and patterns
- If the step requires creating a new file, create it fully
- If the step requires modifying a file, make targeted edits (don't rewrite things that weren't in scope)
- If the step mentions environment variables or config, add them with a note to the user

### After completing the step

1. **Mark the step as done** in PLAN.md — change `[ ]` to `[x]`
2. **Write a log entry** to `IMPLEMENTATION_LOG.md` (see format below)
3. **Report to the user** in 3–5 bullet points what was done

Then stop and ask: *"Ready for the next step? [Step X.X — name]"* — unless the user said "do all steps" or "implement everything", in which case continue automatically.

---

## IMPLEMENTATION_LOG.md Format

Create this file in the project root if it doesn't exist. Append a new entry after every completed step. Never delete old entries.

```markdown
# Implementation Log

---

## ✅ [Step X.X] — [Step Name]
**Date:** YYYY-MM-DD HH:MM  
**Status:** Completed

### What Was Done
[2–5 sentences describing the implementation. Be specific. Mention functions, classes, endpoints, or UI elements created/changed.]

### Files Changed
| File | Change | Details |
|------|--------|---------|
| `src/foo/bar.ts` | Created | Implemented `createBar()` function that does X |
| `src/types/index.ts` | Modified | Added `BarDTO` interface with fields: id, name, createdAt |
| `supabase/functions/bar/index.ts` | Created | Edge function that handles POST /bar |

### Key Decisions Made
- [Any non-obvious choice made during implementation and why]
- [e.g. Used upsert instead of insert to handle duplicate keys]

### Notes / Warnings
- [Any env vars the user needs to add]
- [Any known limitations or follow-up items]
- [Any deviation from the plan and why]

---
```

---

## Handling Problems

**If a file doesn't exist that the plan assumes:** Create it, note it in the log.

**If the step depends on something not yet implemented:** Check if a previous step covers it. If not, implement the minimum required dependency to unblock the current step and log it as an "unplanned prerequisite."

**If the step is unclear:** Make the most reasonable interpretation, implement it, and in the log write "Interpreted as: [your interpretation]" so the user can correct it next round.

**If there's a build/type error after your change:** Fix it before marking the step done. Don't leave broken code.

**If the plan is outdated vs the codebase:** Note the discrepancy in the log, implement what makes sense given the current state, and flag it to the user.

---

## After All Steps Are Done

1. Update PLAN.md status to `Done`
2. In IMPLEMENTATION_LOG.md, append a final summary section:

```markdown
---

## 🏁 Implementation Complete

**Date:** YYYY-MM-DD  
**Total Steps Completed:** X  
**Files Created:** X  
**Files Modified:** X

### Summary
[3–5 sentences describing the overall feature/change that was built.]

### Next Steps for User
- [ ] Add env vars: `VAR_NAME=...`
- [ ] Run `npm run build` to verify no TypeScript errors
- [ ] Test: [specific thing to test]
- [ ] Deploy: [if relevant]
```

3. Tell the user the implementation is complete and point them to `IMPLEMENTATION_LOG.md` for a full record of what was done.

---

## Key Principles

- **One step at a time.** Don't implement Step 2 while doing Step 1.
- **No half-implementations.** Each step must be fully complete before logging it.
- **Always log.** Even tiny steps get a log entry. The log is the audit trail.
- **Don't break existing code.** Before modifying a file, understand what else uses it.
- **Prefer small, targeted edits.** Don't rewrite a file to add one function.
- **Log decisions, not just actions.** The log should explain *why*, not just *what*.
