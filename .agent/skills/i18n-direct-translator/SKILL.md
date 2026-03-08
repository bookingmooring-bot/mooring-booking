---
name: i18n-direct-translator
description: >
  Audits and completes translations for ALL 15 language locale files in the Mooring Booking app
  using direct inline AI translation — NO external services, NO n8n, NO API credits.
  The agent reads en.json + hr.json as master references, identifies missing keys, and writes
  native-quality translations directly into each locale file, section by section.
  
  Use this skill whenever the user wants to: add missing translations, fill incomplete locales,
  add new i18n keys across all languages, fix bad/placeholder translations, or ensure full multilingual parity.

  ⚠️ REPLACES: the old n8n-based translation workflow. Instead of calling any external service,
  the agent translates inline from the English/Croatian master files — faster, cheaper, higher quality.

  Trigger on: "prijevod", "prijevodi", "prevedi", "translate", "translation", "i18n",
  "svi jezici", "nedostaje prijevod", "missing translation", "dodaj jezik", "dodaj ključ",
  "add translation key", "provjeri prijevode", "audit translations", "svi prijevodi rade",
  "multilingual", "full translation", "complete translation", "prevedi sve",
  "podesi za sve jezike", "napravi da sve gori na svakom jeziku", "prijevod fali",
  "en.json", "hr.json", "jezici ne rade", "string nije preveden".
---

# i18n Direct Translator Skill

## ⚡ Core Principle: Zero External Services

**DO NOT** use n8n, any HTTP API, or any translation service endpoint.  
**DO** translate directly, inline, using your own language knowledge as the AI agent.  
You are a multilingual AI — use that capability. Read the English/Croatian source, write the target language text yourself.

---

## App i18n Architecture

- **Framework**: `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- **Config**: `src/i18n/index.ts` — imports all 15 locale JSONs, sets `fallbackLng: 'en'`
- **Locales dir**: `src/i18n/locales/`

### The 15 Locale Files

| Code | Language     | Typical Size | Status |
|------|-------------|-------------|--------|
| `hr` | Hrvatski    | ~67 KB      | **MASTER** — most complete, primary reference |
| `en` | English     | ~46 KB      | **MASTER** — secondary reference |
| `de` | Deutsch     | ~40 KB      | Near-complete |
| `el` | Ελληνικά   | ~51 KB      | Near-complete |
| `fr` | Français    | ~41 KB      | Near-complete |
| `it` | Italiano    | ~38 KB      | Near-complete |
| `es` | Español     | ~38 KB      | Near-complete |
| `tr` | Türkçe      | ~36 KB      | Near-complete |
| `cs` | Čeština     | ~17 KB      | INCOMPLETE |
| `hu` | Magyar      | ~18 KB      | INCOMPLETE |
| `mt` | Malti       | ~17 KB      | INCOMPLETE |
| `pl` | Polski      | ~17 KB      | INCOMPLETE |
| `sk` | Slovenčina  | ~17 KB      | INCOMPLETE |
| `sl` | Slovenščina | ~17 KB      | INCOMPLETE |
| `sq` | Shqip       | ~17 KB      | INCOMPLETE |

### Top-Level Section Order (match en.json)

```
nav → hero → popular → explore → booking → howItWorks → testimonials →
providerCta → footer → aiChat → provider → admin → affiliate → legal →
terms → privacy → gdpr → cookies → about → pricing → userPricing →
support → contact → blog → marina → sailing → howItWorksPage →
notFound → homePricing → auth → dashboard → ratings
```

---

## Execution Protocol

### PHASE 1 — Understand the Task

Determine what needs to be done:

**A) New key added to app** — user added a new i18n key to the codebase and needs it translated into all 15 languages.
   - Read en.json (and hr.json) to find the new key and its English/Croatian value.
   - For each locale file that is missing this key: add it in the correct JSON location with a proper translation.
   - Work through all 15 locales in order.

**B) Existing incomplete locale** — one or more locales is missing whole sections.
   - Read en.json fully. Read hr.json fully.
   - Build the union of all keys = COMPLETE key set.
   - For each incomplete locale: compare, identify all missing keys/sections, add them.

**C) Bad translation fix** — user reports a specific string is wrong or untranslated.
   - Locate the key in the locale file.
   - Replace with a correct native translation.

**D) Full audit** — user wants all 15 locales to be complete.
   - Run full audit + fill for all locales. See Phase 2.

---

### PHASE 2 — Audit (for full audits or incomplete locales)

**Step 2.1 — Read master files**

```
view_file: src/i18n/locales/en.json   (full file)
view_file: src/i18n/locales/hr.json   (full file)
```

Build the union key set from both. `hr.json` often has keys not yet in `en.json` (e.g. `about.ceoRole`, `affiliate.lifetimeCommission`, `terms.lastUpdated`).

**Step 2.2 — Audit each target locale**

For INCOMPLETE locales (cs, hu, mt, pl, sk, sl, sq):
- Read the file. Note which top-level sections are completely missing.
- These are typically: `terms`, `privacy`, `gdpr`, `cookies`, `about`, `pricing`, `userPricing`, `support`, `contact`, `blog`, `marina`, `sailing`, `howItWorksPage`, `notFound`, `affiliate` (full), `auth`, `dashboard`, `ratings`, `homePricing` (premium annual keys).

For NEAR-COMPLETE locales (de, el, fr, it, es, tr):
- Read the file. Note only missing individual keys — these are usually newer additions.
- Check specifically: `affiliate.joinNow`, `affiliate.step1-3`, `affiliate.lifetimeCommission`, `explore.now4TodayOnly`, `explore.winterStorage`, `explore.exploreTitle`, `explore.mooringsCountries`, `explore.exploreAllMoorings`, `cookies.year/years/hours/minute/days/months`, `terms.lastUpdated`, `about.storyP1-P5`, `about.ceoRole/ceoBio`, `about.advisorRole/advisorBio`, `about.expansionRole/expansionBio`, `about.tagline`, `provider.concessionNumber/Placeholder/Desc`, `provider.declarationRightOfDisposal`, `testimonials.discount1/owner5/owner6/roleDirector/roleDockConcessionaire`, `homePricing` premium annual keys, `auth` section, `dashboard`, `ratings`.

---

### PHASE 3 — Translate & Write

**Core rules for all translations:**

1. **Translate inline, directly** — you are the translator. No external calls.
2. **Use en.json as primary source** — translate from English to target language.
3. **Cross-reference hr.json** — for context, nautical terminology, fuller text.
4. **Never leave English text in a non-English locale file.** Every value must be in the target language.
5. **Keep brand names untranslated**: `Mooring Booking`, `AI Captain`, `Stripe`, `PayPal`, `Now4Today`, `Google Pay`, `Maestro`, `Visa`, `Mastercard`, `GDPR`, `API`, `QR`, `GPS`, `WhatsApp`, `Intelligent Matrix`.
6. **Keep numbers and percentages as-is**: `15%`, `€19.99`, `50%`, `300%`.
7. **Preserve JSON special characters**: `&`, `\n`, escaped quotes `\"`.
8. **Maintain JSON structure**: nested objects stay nested. Never flatten.
9. **Tone**: professional but approachable; maritime/nautical terminology must be accurate.
10. **Do NOT skip or abbreviate** long legal sections (`terms`, `privacy`, `gdpr`) — translate them fully and faithfully.

**For SMALL/INCOMPLETE locales (cs, hu, mt, pl, sk, sl, sq):**
- Use `write_to_file` with `Overwrite: true` to replace the entire file with a complete version that has ALL sections properly translated.
- Build the full JSON from scratch: start with existing content + add all missing sections.
- This is better than patching — ensures no duplicate keys and correct JSON structure.

**For NEAR-COMPLETE locales (de, el, fr, it, es, tr):**
- Use `multi_replace_file_content` to insert only the missing keys in the correct locations.
- Do NOT rewrite the entire file — only add what is missing.

**Working order (most-incomplete first):**
```
cs → hu → mt → pl → sk → sl → sq → tr → es → it → fr → de → el → en → hr
```

---

### PHASE 4 — Verify

After writing each locale:

1. **Key count check** — top-level sections must match en.json count.
2. **Spot check** — verify 3–5 newly added strings are correctly translated (not English fallback).
3. **JSON validity** — no trailing commas, all objects closed with `}`, no duplicate keys.
4. **Confirm no English leakage** — grep for tell-tale English phrases in the locale if in doubt.

---

## Language-Specific Notes

### Diacritics & Special Characters

| Locale | Characters to use |
|--------|------------------|
| `cs` | á, č, ě, í, ř, š, ý, ž |
| `hu` | á, é, í, ó, ö, ő, ú, ü, ű |
| `pl` | ą, ć, ę, ł, ń, ó, ś, ź, ż |
| `sk` | á, č, ď, é, í, ĺ, ľ, ň, ó, ô, ŕ, š, ť, ú, ý, ž |
| `sl` | č, š, ž |
| `sq` | ë, ç |
| `mt` | għ, ħ, ie, għ |
| `de` | ä, ö, ü, ß |
| `fr` | é, è, ê, à, â, î, ô, ù, û, ç, œ |
| `el` | full Greek alphabet |
| `tr` | ç, ğ, ı, İ, ö, ş, ü |

### Translation Style

| Locale | Formality | Notes |
|--------|-----------|-------|
| `cs` | Formal | Correct Czech grammar, proper declension |
| `hu` | Formal | Vowel harmony, agglutinative forms |
| `mt` | Semi-formal | Borrow English for tech terms, Maltese for general |
| `pl` | Formal | Correct Polish cases and aspect |
| `sk` | Formal | Maintain Slovak declension |
| `sl` | Formal | Dual number where required |
| `sq` | Formal | Standard Albanian (Tosk-based) |
| `de` | Formal (Sie) | Correct compound nouns |
| `el` | Formal | Modern Greek (Monotonic script) |
| `fr` | Formal | Correct contractions (l'amarrage, etc.) |
| `it` | Formal | Correct articles and agreement |
| `es` | Neutral | No regional variants; Latin-American neutral |
| `tr` | Formal | Correct Turkish suffix morphology |

---

## Nautical Terminology Reference

| English | HR | CS | HU | PL | SK | SL | SQ | MT |
|---------|----|----|----|----|----|----|----|----|
| mooring | vez | kotviště | kikötőhely | cumowisko | kotvisko | privez | vendosje | miżband |
| berth | vez | místo | kikötőhely | miejsce | miesto | vez | vend | post |
| dock | dok | dok/molo | dok | dok | dok | pomol | dok | dockyard |
| anchor | sidro | kotva | vasmacska | kotwica | kotva | sidro | spirancë | ankra |
| marina | marina | marina | marina | marina | marina | marina | marina | marina |
| sailor | nautičar | jachtař | tengerész | żeglarz | námorník | jadralec | lundrues | baħħar |
| navigation | navigacija | navigace | navigáció | nawigacja | navigácia | navigacija | navigim | navigazzjoni |
| weather forecast | vremenska prognoza | předpověď počasí | időjárás-előrejelzés | prognoza pogody | predpoveď počasia | vremenska napoved | parashikim moti | previżjoni tal-temp |
| harbour/port | luka | přístav | kikötő | port | prístav | pristanišče | port | port |

---

## Common UI Terms Reference

| EN | CS | HU | PL | SK | SL | SQ | MT |
|----|----|----|----|----|----|----|-----|
| Search | Hledat | Keresés | Szukaj | Hľadať | Iskanje | Kërko | Fittex |
| Book Now | Rezervovat | Foglalás | Zarezerwuj teraz | Rezervovať | Rezerviraj zdaj | Rezervo tani | Ibbukkja issa |
| Filters | Filtry | Szűrők | Filtry | Filtre | Filtri | Filtra | Filtri |
| Price | Cena | Ár | Cena | Cena | Cena | Çmim | Prezz |
| Available | Dostupné | Elérhető | Dostępny | Dostupné | Na voljo | I disponueshëm | Disponibbli |
| Booked | Rezervováno | Foglalt | Zarezerwowany | Rezervované | Rezervirano | I rezervuar | Imbukkjat |
| Night | Noc | Éjszaka | Noc | Noc | Noč | Natë | Lejl |
| Total | Celkem | Összesen | Razem | Celkovo | Skupaj | Total | Total |
| Continue | Pokračovat | Tovább | Kontynuuj | Pokračovať | Nadaljuj | Vazhdo | Kompli |
| Back | Zpět | Vissza | Wróć | Späť | Nazaj | Kthehu | Lura |
| Submit | Odeslat | Elküldés | Wyślij | Odoslať | Pošlji | Dërgo | Ibgħat |
| Settings | Nastavení | Beállítások | Ustawienia | Nastavenia | Nastavitve | Cilësimet | Settings |
| Dashboard | Ovládací Panel | Irányítópult | Panel | Panel | Nadzorna plošča | Paneli | Dashboard |
| Sign In | Přihlásit | Bejelentkezés | Zaloguj | Prihlásiť | Prijava | Hyni | Idħol |
| Sign Up | Registrovat | Regisztráció | Zarejestruj | Registrovať | Registracija | Regjistrohu | Irreġistra |

---

## Adding New Keys (Most Common Use Case)

When the user or developer adds a new i18n key to the app (e.g. in a component using `t('someSection.newKey')`), follow this process:

### Step 1 — Find the key in master files
```
view_file: en.json  →  find the English value
view_file: hr.json  →  find the Croatian value (if present)
```

### Step 2 — Plan translations
Translate the key value into all 13 non-master languages. Write out all 13 translations before touching files. Use your knowledge + the reference tables above.

### Step 3 — Insert into each locale file
For each of the 15 locale files:
1. Read the file (or the relevant section).
2. Find the correct JSON location (match the section path, e.g. `"explore": { ... }`).
3. Add the new key-value pair in the right place using `multi_replace_file_content`.
4. Ensure no trailing comma errors.

### Step 4 — Verify
After all 15 files updated, spot-check 3 of them to confirm:
- Key is present at the correct path
- Value is in the correct language
- JSON is valid

---

## Important Notes on Specific Sections

### `terms`, `privacy`, `gdpr` (Legal Sections)
- These are long. Translate them **fully** — do not abbreviate or summarize.
- Keep legal language formal and precise.
- `"AS IS"` → keep in caps or use equivalent (e.g. German: `"WIE BESEHEN"`, French: `"EN L'ÉTAT"`).
- `"Intelligent Matrix"` — **brand name, do not translate**.

### Nested FAQ sections
`support.faq` and `pricing.faq` are nested objects. Preserve the nesting:
```json
"support": {
  "faqTitle": "...",
  "faq": {
    "bookQ1": "...",
    "bookA1": "...",
    ...
  }
}
```

### `homePricing` premium annual keys
These were added later — many locales are missing the annual plan keys. Check:
```json
"premiumAnnual": "...",
"premiumAnnualBadge": "...",
"premiumAnnualPrice": "...",
"premiumAnnualBilledAs": "...",
"premiumAnnualFeature1-6": "..."
```

---

## Full Execution Checklist

When doing a full audit/completion run:

- [ ] Read `en.json` (full)
- [ ] Read `hr.json` (full)
- [ ] Build complete key set (union of both)
- [ ] **cs** — audit, write complete file with all missing sections translated
- [ ] **hu** — audit, write complete file with all missing sections translated
- [ ] **mt** — audit, write complete file with all missing sections translated
- [ ] **pl** — audit, write complete file with all missing sections translated
- [ ] **sk** — audit, write complete file with all missing sections translated
- [ ] **sl** — audit, write complete file with all missing sections translated
- [ ] **sq** — audit, write complete file with all missing sections translated
- [ ] **tr** — patch missing individual keys
- [ ] **es** — patch missing individual keys
- [ ] **it** — patch missing individual keys
- [ ] **fr** — patch missing individual keys
- [ ] **de** — patch missing individual keys
- [ ] **el** — patch missing individual keys
- [ ] **en** — verify vs hr.json, patch any hr-only keys
- [ ] **hr** — verify vs en.json, patch any en-only keys

After EACH locale:
- Confirm JSON validity (no trailing commas, all `}` closed)
- Confirm section count matches `en.json`
- Spot-check 3–5 strings for quality

> **CRITICAL**: Go locale by locale. Do not skip. Do not leave English strings in non-English files.
> Any English text in a non-English locale = FAILURE.
> Any invalid JSON = FAILURE.
