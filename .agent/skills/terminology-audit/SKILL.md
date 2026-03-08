---
name: terminology-audit
description: >
  Audits the entire Mooring Booking application codebase for forbidden or outdated terminology and replaces it with the correct term.
  Use this skill whenever the user wants to:
  — Search the whole app for a specific phrase or word that should be changed (e.g. "privatni vez" → "vez")
  — Find EVERY file and line where an outdated term appears (TSX, TS, JSON, MD, HTML, CSS, JS)
  — Perform a global terminology/branding replacement across components, i18n locales, legal pages, and any other file
  — Produce a full change report listing every file and line number that was modified
  — Verify that no occurrence of the old term remains after replacement

  Trigger on: "pronađi sve gdje piše", "zamijeni svugdje", "globalnu zamjenu", "terminology change",
  "svuda promijeni", "privatni vez", "promijeni termin", "audit terminologije", "rename throughout app",
  "find and replace all", "global search replace", "change wording everywhere", "provjeri terminologiju",
  "zamjena teksta svugdje", "sve instance", "svaka pojava".

  ALWAYS use this skill when the user wants to find and/or replace any phrase across the entire codebase — even for a single word change.
---

# Terminology Audit & Replace Skill

This skill performs a thorough, lossless search-and-replace across the entire Mooring Booking codebase.
It **finds every occurrence** of the target phrase, reports them, and then replaces them — leaving no instance behind.

---

## Phase 1 – Discovery (Find ALL occurrences)

Use `grep_search` with `CaseInsensitive: true` and `MatchPerLine: true` for each relevant file extension.
Run separate passes for:

- Source code → `*.tsx, *.ts, *.js, *.jsx`
- Translations → `*.json`
- Markup & docs → `*.html, *.md`
- Styles → `*.css, *.scss`

Search root: `c:\Users\User\Desktop\Aplikacije1\Mooring Booking\Mooring Booking`

Also search the `.agent` directory for skill and config files:
`c:\Users\User\Desktop\Aplikacije1\Mooring Booking\.agent`

### Variations to search for

Always search for **all grammatical forms** of the target phrase, for example:
- `privatni vez` (nominative singular)
- `privatnog veza` (genitive singular)
- `privatnom vezu` (dative/locative)
- `privatni vezovi` (nominative plural)
- `Privatni vez` (sentence-start capitalisation)
- `PRIVATNI VEZ` (all-caps)

Run all variation searches in parallel.

---

## Phase 2 – Report

After discovery, produce a **full occurrence report** in this format:

```
=== TERMINOLOGY AUDIT REPORT ===
Target phrase: "privatni vez" (all forms)
Replacement : "vez" (all forms)

FOUND X occurrences across Y files:

FILE: src/i18n/locales/hr.json
  Line 122: "...Pronašao privatni vez u Dubrovniku..."
  Line 125: "...Privatni vezovi su bolji od marina..."
  Line 586: "...svaki privatni vez i marinski vez..."

FILE: src/components/SomeComponent.tsx
  Line 45: "...privatnom vezu za..."
  ...

TOTAL: X lines changed across Y files
```

Report EVERY file and line — do not skip any.

---

## Phase 3 – Replace

For each file that contains occurrences, use `multi_replace_file_content` or `replace_file_content` to replace **all** instances.

### Replacement mapping

| Old form              | New form     |
|-----------------------|--------------|
| privatni vez          | vez          |
| privatnog veza        | veza         |
| privatnom vezu        | vezu         |
| privatni vezovi       | vezovi       |
| privatnih vezova      | vezova       |
| Privatni vez          | Vez          |
| Privatni Vez          | Vez          |
| PRIVATNI VEZ          | VEZ          |
| privatnih vezova      | vezova       |

Apply the mapping context-sensitively — preserve capitalisation and grammatical form.

### Rules
- Never change `marinski vez` or other compound terms — only remove the `privatni`/`privatnog`/`privatnom` qualifier.
- In i18n JSON files, replace inside string values only — never touch JSON keys.
- In TSX/TS: replace inside string literals, template literals, and JSX text nodes.
- In Markdown (`.md`): replace everywhere in the body text.
- Do **not** modify binary files, images, or lock files (`package-lock.json`, `yarn.lock`, etc.).

---

## Phase 4 – Verification

After all replacements, re-run the same `grep_search` passes from Phase 1 to confirm **zero remaining occurrences**.

If any are still found, fix them immediately and re-verify.

---

## Phase 5 – Final Report

Produce a concise final summary:

```
=== REPLACEMENT COMPLETE ===
✅ X occurrences replaced across Y files
✅ 0 remaining occurrences found in verification pass

Files modified:
- src/i18n/locales/hr.json  (3 lines)
- src/components/Foo.tsx    (1 line)
...
```

---

## Important Notes

- This skill is **non-destructive** — always read the file first, then replace only the exact matched text.
- If a file has many unrelated occurrences on the same line (e.g. `privatni vez` appears twice), replace all of them.
- Use `AllowMultiple: true` in replace tools when replacing within the same line range.
- After completing the audit, suggest the user commits the changes with a message like:
  `chore: replace "privatni vez" → "vez" across entire codebase`
