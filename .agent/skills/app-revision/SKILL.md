---
name: app-revision
description: >
  Applies structured, multi-phase revisions to the Mooring Booking application based on business or legal requirements.
  Use this skill whenever the user wants to:
  — Perform a global terminology or branding change across components, i18n files, and legal pages
  — Update legal documentation (Terms, Disclaimer, Privacy) to reflect changes in business model (e.g., from private owners to companies/concessionaires)
  — Add or modify mandatory form fields required by law or policy (e.g., concession numbers, tax IDs, right-of-disposal declarations)
  — Replace an "ownership" declaration with a "right of disposal" (Izjava o pravu raspolaganja) statement
  — Audit and fix navigation links, external links, and visual elements across all pages
  — Produce a full change report listing every file and line number modified
  — Create or update skill files in `.agent/skills/` based on a workflow capture
  
  ALWAYS trigger this skill when the user says things like:
  "revizija aplikacije", "promjena terminologije", "ažuriraj pravnu dokumentaciju", "dodaj polje koncesije",
  "izjava o pravu raspolaganja", "provjeri linkove", "audit stranica", "globalna zamjena teksta",
  "app revision", "terminology change", "legal doc update", "concession number",
  "right of disposal declaration", "link audit", "change report", "review all pages".
---

# App Revision Skill

This skill guides a comprehensive, multi-phase application audit and revision. It covers terminology, legal documents, forms, and navigation integrity.

## When to Use

Trigger this skill for any structured revision request — whether user-reported from an audio transcript, a business memo, or a legal review. Even if they only mention one area (e.g., "update the legal docs"), always check all five phases for completeness.

## Revision Phases

### Phase 1 — Skill File Creation (optional)
If the revision is recurring or complex enough to be reusable, create a new SKILL.md in `.agent/skills/<skill-name>/SKILL.md`.

Follow the skill anatomy:
```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter: name, description
│   └── Markdown instructions
└── (optional) references/, scripts/, assets/
```

### Phase 2 — Terminology Search & Replace

1. Use `grep_search` to find ALL instances of the target term across:
   - `src/i18n/locales/*.json` (all language files: en, hr, de, fr, es, it, el, tr, etc.)
   - `src/components/*.tsx`
   - `src/pages/*.tsx`

2. For each i18n key with the old term:
   - Update the value in `en.json` first, then propagate to other locales that have the same key populated.
   - If other locales fall back to the default key value, updating `en.json` is sufficient.

3. For hardcoded strings in `.tsx` files:
   - Replace inline or convert to an i18n key if the string is user-visible.

**Example pattern (privatni vez → vezovi/provajderski vez):**
```
grep_search("private mooring", src/) → collect all matches
Edit en.json and hr.json keys
Edit hardcoded strings in Blog.tsx, Testimonials.tsx, About.tsx, BecomeProvider.tsx
```

### Phase 3 — Form Changes

For `BecomeProvider.tsx`:

**Adding a new field:**
1. Add the field to `formData` state initializer
2. Add the `<Label>` + `<Input>` JSX in the appropriate section card
3. Pass the new field to the Supabase RPC call (if the column exists in DB)
4. Add translation keys to `en.json` under the `provider` namespace

**Replacing a declaration:**
1. Update the i18n key `provider.declaration1` in `en.json`
2. If the new declaration is legally significant, add a highlighted box (e.g., `bg-warning/10 border-warning`) around the first checkbox
3. Update the consent modal text that summarizes declarations

**Right of Disposal Declaration template (Izjava o pravu raspolaganja):**
```
I declare that I am the authorized representative of a legal entity (company/concessionaire) 
with the legal right of disposal (pravo raspolaganja) over the mooring(s) listed. 
I confirm that all required concessions, permits, and authorizations are in place 
and take full legal responsibility for the accuracy of this statement.
```

### Phase 4 — Legal Document Updates

Files to check: `Terms.tsx`, `Privacy.tsx`, `GDPR.tsx`, `Cookies.tsx`

Key update patterns for company/firm-facing language:
- Replace "owner or long-term lessee" → "authorized representative of a legal entity with right of disposal"
- Replace "sign the ownership/lease declaration" → "sign the right-of-disposal declaration (Izjava o pravu raspolaganja)"
- Replace "moorings you don't own" → "moorings you have no legal right of disposal over"
- Add concession requirement: "Providers must hold a valid concession or equivalent permit for all listed moorings"

Most content in Terms.tsx uses `t('terms.*')` keys. Updating `en.json` propagates to the UI automatically.

### Phase 5 — Link & Visual Audit

Check these files systematically:

**Navigation links (Header.tsx, Footer.tsx):**
- Every `<Link to="...">` value must match a route defined in `App.tsx`
- Every `<a href="...">` external link must have `target="_blank" rel="noopener noreferrer"`

**Within-page links:**
- `Support.tsx`, `Contact.tsx`, `About.tsx` — check email `mailto:` links are valid
- `BecomeProvider.tsx` — Stripe link, terms links

**Visual elements:**
- External images using `https://images.unsplash.com/...` — verify URLs are consistent and not returning 404
- `<img alt="">` attributes — ensure all images have meaningful alt text

## Output: Change Report

After all changes are applied, generate a markdown change report listing every file and line:

```markdown
## Change Report

### Files Modified
| File | Lines Changed | Description |
|------|--------------|-------------|
| src/i18n/locales/en.json | 105, 122, 125, 158... | Replaced "private mooring" language |
| src/pages/BecomeProvider.tsx | 169, 240-250, 502... | Concession field + new declaration |
| src/pages/Terms.tsx | 107, 186... | Right of disposal language |
| src/components/Testimonials.tsx | 11, 38 | Hardcoded text fix |
| src/pages/Blog.tsx | 20, 22, 25, 27 | Hardcoded text fix |
| src/pages/About.tsx | 73 | Hardcoded text fix |
| .agent/skills/app-revision/SKILL.md | NEW | Skill file created |
```

## Important Notes

- The app uses `react-i18next`. Most user-facing text goes through `t('key')` — always prefer updating JSON keys over hardcoding strings.
- The form uses Supabase RPC `publish_provider_profile`. Adding new fields requires the corresponding column to exist in the DB. If not, store the field in metadata or note it for DB migration.
- The Croatian locale (`hr.json`) is the most complete non-English locale (67KB vs 45KB for en). Always update both `en.json` and `hr.json`.
- Other locales (`de`, `it`, `fr`, `el`, `tr`, `es`) may have partial translations. Update only if the key exists in those files; otherwise the app falls back to `en.json`.
