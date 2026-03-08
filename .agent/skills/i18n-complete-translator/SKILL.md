---
name: i18n-complete-translator
description: >
  Audits and completes translations for ALL 15 language locale files in the Mooring Booking app.
  Ensures EVERY key present in the English (en.json) and Croatian (hr.json) master files is
  translated into all other languages with zero missing keys. Use this skill whenever the user
  wants to: ensure full multilingual parity, add a new language, fill in missing translations,
  update existing translations, or audit locales for missing/untranslated strings.

  Trigger on: "prijevod", "prijevodi", "prevedi", "translate", "translation", "i18n", "internacionalizacija",
  "svi jezici", "nedostaje prijevod", "missing translation", "dodaj jezik", "novi jezik", "add language",
  "isti za sve jezike", "parity", "paritet", "provjeri prijevode", "audit translations",
  "svi prijevodi rade", "multilingual", "višejezičnost", "language file", "locale file",
  "en.json", "hr.json", "de.json", "jezici ne rade", "string nije preveden",
  "prijevod fali", "napravi da sve gori na svakom jeziku", "sve jezike",
  "podesi za sve jezike", "full translation", "complete translation", "prevedi sve".
---

# i18n Complete Translation Skill

## App i18n Architecture

- **Framework**: `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- **Config file**: `src/i18n/index.ts` — imports all locale JSONs, registers them, sets `fallbackLng: 'en'`
- **Locales directory**: `src/i18n/locales/`
- **15 supported locale files**:

| Code | Language     | File size | Status |
|------|-------------|-----------|--------|
| `hr` | Hrvatski    | ~67 KB    | MASTER — richest, most complete |
| `en` | English     | ~46 KB    | MASTER — primary reference |
| `de` | Deutsch     | ~40 KB    | Near-complete |
| `el` | Ελληνικά    | ~51 KB    | Near-complete |
| `fr` | Français    | ~41 KB    | Near-complete |
| `it` | Italiano    | ~38 KB    | Near-complete |
| `es` | Español     | ~38 KB    | Near-complete |
| `tr` | Türkçe      | ~36 KB    | Near-complete |
| `cs` | Čeština     | ~17 KB    | INCOMPLETE — many sections missing |
| `hu` | Magyar      | ~18 KB    | INCOMPLETE — many sections missing |
| `mt` | Malti       | ~17 KB    | INCOMPLETE — many sections missing |
| `pl` | Polski      | ~17 KB    | INCOMPLETE — many sections missing |
| `sk` | Slovenčina  | ~17 KB    | INCOMPLETE — many sections missing |
| `sl` | Slovenščina | ~17 KB    | INCOMPLETE — many sections missing |
| `sq` | Shqip       | ~17 KB    | INCOMPLETE — many sections missing |

## Master Key Structure (en.json / hr.json)

All locale files MUST contain these top-level sections with ALL their nested keys:

```
nav, hero, popular, explore, booking, howItWorks, testimonials,
providerCta, footer, aiChat, provider, admin, affiliate, legal,
terms, privacy, gdpr, cookies, about, pricing, pricing.faq,
userPricing, support, support.faq, contact, blog, marina, sailing,
howItWorksPage, notFound, homePricing, auth, dashboard, ratings
```

> **NOTE**: `hr.json` is the MOST COMPLETE locale (it has `terms`, `privacy`, `gdpr`, `cookies`,
> `about.storyP1-P5`, `about.ceoRole`, `support.faq`, `pricing.faq`, `affiliate.joinNow`,
> `affiliate.lifetimeCommission`, etc.) and MUST be used as the definitive reference alongside `en.json`.
> Always cross-check BOTH.

---

## Execution Protocol

### PHASE 1 — Audit: Find All Missing Keys

**Step 1.1 — Read the master files**

Read `src/i18n/locales/en.json` in full. Then read `src/i18n/locales/hr.json` in full.
Construct the UNION of all keys from both files. That union is the COMPLETE key set.

**Step 1.2 — Audit each incomplete locale**

For each locale file that is ~17KB (cs, hu, mt, pl, sk, sl, sq), compare its keys against the complete key set.
List every missing key path (e.g., `terms.agreementTitle`, `privacy.overview`, `about.storyP1`, etc.).

Common sections missing from small locales:
- `terms` (all sub-keys: agreementTitle, agreementText, agreementText2, platformTitle, platformDesc, platformBold, asIsWarning, userAccountsTitle, userAccountsText, userAccount1-6, bookingsTitle, forCustomers, customer1-6, forProviders, provider1-6, providerResponsibilitiesTitle, providerResponsibilitiesText, provResp1-10, dataTransferTitle, dataTransferText1-3, liabilityTitle, liabilityWarning, noLiabilityMooring, noLiabilityMooringText, noLiabilityInjury, noLiabilityInjuryText, noLiabilityFinancial, noLiabilityFinancialText, noLiabilityWeather, noLiabilityWeatherText, noLiabilityThirdParty, noLiabilityThirdPartyText, aiCaptainDisclaimer, aiCaptainDisclaimerText, maxLiabilityCap, indemnificationTitle, indemnificationText, indem1-7, forceMajeureTitle, forceMajeureText, intellectualPropertyTitle, ipText1, ipText2, prohibitedTitle, prohibited1-11, subscriptionTitle, subscriptionText, sub1-5, disputeTitle, disputeText, generalTitle, generalText, changesToTermsTitle, changesToTermsText, contactTitle, contactText, address, phone)
- `privacy` (all sub-keys: overview, overviewText, infoCollectTitle, infoCollectText, personalData, personalDataDesc, locationData, locationDataDesc, usageData, usageDataDesc, deviceData, deviceDataDesc, howWeUseTitle, howWeUseText, use1-6, dataSharingTitle, dataSharingText, sharing1-4, yourRightsTitle, yourRightsText, right1-5, cookiesTitle, cookiesText, dataSecurityTitle, dataSecurityText, contactTitle, contactText)
- `gdpr` (all sub-keys)
- `cookies` (all sub-keys including: year, years, hours, minute, days, months)
- `about` (all sub-keys including: tagline, storyTitle, storyP1-P5, ourValues, passionTitle, passionDesc, trustTitle, trustDesc, communityTitle, communityDesc, qualityTitle, qualityDesc, meetTeam, meetTeamSubtitle, readyToFind, exploreMoorings, listYourMooring; HR-only: ceoRole, ceoBio, advisorRole, advisorBio, expansionRole, expansionBio)
- `pricing` (all sub-keys including nested `faq` object with q1-a6)
- `userPricing` (all sub-keys)
- `support` (all sub-keys including nested `faq` object with bookQ1-techQ3)
- `contact` (all sub-keys)
- `blog` (all sub-keys)
- `marina` (all sub-keys)
- `sailing` (all sub-keys)
- `howItWorksPage` (all sub-keys)
- `notFound` (all sub-keys)
- `affiliate` (many sub-keys: heroTitle, heroTitleHighlight, joinProgram, freeToJoin, paidToAffiliates, activeAffiliates, topCommissionRate, cookieDuration, step1Title-step4Desc, successStories, successStoriesSubtitle, commissionTiers, commissionTiersSubtitle, starter, pro, elite, ofPlatformFee, topPerforming, topPerformingSubtitle, bookings, earnings, readyToStart, readyToStartDesc, minPayout, mostPopular)
- `provider` (many sub-keys: mooringUnits, mooringUnitsDesc, mooringInsurance, mooringInsuranceDesc, offerWinterStorage, winterSeason, wetStorage, dryStorage, bothStorage, now4todayTitle, now4todaySurcharge, now4todayDesc, now4todayAvailable, basePrice, now4todayPrice, monthlyAddOnTotal, yearlyAddOnTotal, activePromotions, marketingToolsActive, premiumListingActive, mooringInsuranceActive, active, servicesBillingNote, stripeAccountId, stripePayoutsNote, noStripeAccount, createStripeFree, calendarCustomPrice, addressPlaceholder, concessionNumber, concessionNumberPlaceholder, concessionNumberDesc, declarationRightOfDisposal, basicInfo, mooringDetails, pricingPayment, premiumAddOns, photos, stripeIntegration, stripeDesc, connectStripe, startListingNow, viewPricingDetails, whyProvidersLove, successStories, successStoriesSubtitle, readyToEarn, readyToEarnDesc, createProviderAccount, joinProviders, increaseIncome, increaseIncomeDesc, simpleTransparent, simpleTransparentDesc, marketingToolsTitle, marketingToolsTitleDesc, joinCommunity, joinCommunityDesc)
- `admin` (additional keys: subtitle, exportReport, sendReminders, overview, viewAll, revenueByCountry, ofTotal, searchProviders, searchBookings, viewProfile, sendEmail, generateInvoice, totalPending, exportInvoices, sendAllReminders, remind, invoice, monthlyRevenueTrend, topPerformingMoorings)
- `testimonials` (additional keys: aiCaptain1, aiCaptain2, aiCaptain3, discount1, owner5, owner6, roleDirector, roleDockConcessionaire)
- `explore` (additional keys: exploreTitle, mooringsCountries, exploreAllMoorings, now4TodayOnly, winterStorage)
- `homePricing.premiumAnnual*` (full annual plan keys)
- `auth` (many locales missing this entirely)
- `dashboard`, `ratings` (if used in hr.json)

**Step 1.3 — Also audit larger locales (de, el, fr, it, es, tr)**

These may be missing some newer keys added to hr.json that are not yet in en.json. In particular check:
- `affiliate.joinNow`, `affiliate.step1-3`, `affiliate.lifetimeCommission`
- `explore.now4TodayOnly`, `explore.winterStorage`, `explore.exploreTitle`, `explore.mooringsCountries`, `explore.exploreAllMoorings`
- `cookies.year`, `cookies.years`, `cookies.hours`, `cookies.minute`, `cookies.days`, `cookies.months`
- `terms.lastUpdated`
- `about.storyP1-P5`, `about.ceoRole`, `about.ceoBio`, `about.advisorRole`, `about.advisorBio`, `about.expansionRole`, `about.expansionBio`, `about.tagline`
- `provider.concessionNumber`, `provider.concessionNumberPlaceholder`, `provider.concessionNumberDesc`, `provider.declarationRightOfDisposal`
- `testimonials.discount1`, `testimonials.owner5`, `testimonials.owner6`, `testimonials.roleDirector`, `testimonials.roleDockConcessionaire`
- `homePricing` section (premium annual keys)
- `auth` section

---

### PHASE 2 — Translation: Fill Missing Keys

**Translation Rules:**
1. **Never leave a key untranslated** — every key must have a proper, native-quality translation in the target language
2. **Use en.json as the primary translation source** — translate from English into the target language
3. **Cross-reference hr.json** for context and fuller text (sometimes hr.json has more expanded text)
4. **Maintain JSON structure** — nested objects must stay nested (e.g., `pricing.faq.q1`)
5. **Preserve special characters** — keep `&`, `\n`, escaped quotes correctly
6. **Keep brand names untranslated**: Mooring Booking, AI Captain, Stripe, PayPal, Now4Today, Google Pay, Maestro, Visa, Mastercard, GDPR, API, QR, GPS, WhatsApp, Now4Today
7. **Keep numbers and percentages as-is**: 15%, €19.99, 50%, 300%, etc.
8. **Date formats**: adapt to target locale conventions (e.g., Czech uses "1. ledna 2026" not "January 1, 2026")
9. **Maintain tone**: professional but approachable; maritme/nautical terminology must be correct

**Language-specific translation targets:**

| Locale | Language | Translation style notes |
|--------|----------|------------------------|
| `cs` | Czech | Formal, use diacritics correctly (á, č, ě, í, ř, š, ý, ž) |
| `hu` | Hungarian | Formal, use vowel harmony, diacritics (á, é, í, ó, ö, ő, ú, ü, ű) |
| `mt` | Maltese | Use technical nautical Maltese, borrow English for tech terms |
| `pl` | Polish | Formal, use Polish diacritics (ą, ć, ę, ł, ń, ó, ś, ź, ż) |
| `sk` | Slovak | Formal, maintain Slovak diacritics (á, č, ď, é, í, ĺ, ľ, ň, ó, ô, ŕ, š, ť, ú, ý, ž) |
| `sl` | Slovenian | Formal, use Slovenian diacritics (č, š, ž) |
| `sq` | Albanian | Formal, use Albanian specific characters (ë, ç) |
| `de` | German | Formal (Sie), correct compound nouns, umlauts (ä, ö, ü, ß) |
| `el` | Greek | Formal Greek, correct polytonic where needed |
| `fr` | French | Formal, correct accents and contractions |
| `it` | Italian | Formal, correct accents |
| `es` | Spanish | Neutral Spanish (not regional), correct accents |
| `tr` | Turkish | Formal, correct Turkish characters (ç, ğ, ı, İ, ö, ş, ü) |

---

### PHASE 3 — Implementation: Write Updated Locale Files

**For each locale file that needs updates:**

1. Read the current file completely using `view_file`
2. Identify exact missing key paths from Phase 1 audit
3. For SMALL locales (cs, hu, mt, pl, sk, sl, sq) that are missing whole sections:
   - Add entire missing sections at the correct JSON position (maintain alphabetical or logical section order matching en.json)
   - Insert each section before the closing `}` of the file or in its proper JSON location
4. For LARGE locales (de, el, fr, it, es, tr) that may be missing individual keys:
   - Use `multi_replace_file_content` to add only the missing keys within their parent objects
5. **Validate JSON** — ensure the result is valid JSON with no trailing commas, no duplicate keys, proper nesting

**Section insertion order** (follow en.json ordering):
```
nav → hero → popular → explore → booking → howItWorks → testimonials →
providerCta → footer → aiChat → provider → admin → affiliate → legal →
terms → privacy → gdpr → cookies → about → pricing → userPricing →
support → contact → blog → marina → sailing → howItWorksPage →
notFound → homePricing → auth → dashboard → ratings
```

**For complete locale rewrites (small locales):**
Use `write_to_file` with `Overwrite: true` to replace the entire file with a complete, properly structured JSON that contains ALL sections translated.

---

### PHASE 4 — Verification

**Step 4.1 — Key count check**
After updating all files, count the top-level sections in each locale and compare to en.json.
All locales must have the same top-level sections.

**Step 4.2 — Spot check**
For each updated locale, verify 3-5 keys from the newly added sections are correctly translated and not left as English fallback text.

**Step 4.3 — JSON validity**
Confirm each file is valid JSON by checking the structure visually:
- No trailing commas
- All strings properly quoted
- All objects properly closed with `}`
- No duplicate keys

**Step 4.4 — App runtime check** (optional but recommended)
If the dev server is running (`npm run dev`), switch language in the app UI for each updated locale and verify:
- Navigation items render in the correct language
- Booking form fields show translated labels
- Footer links are translated
- Legal pages render in the target language

---

## Quick Reference: Key Sections by Priority

### 🔴 CRITICAL (user-facing, appear on every page)
- `nav`, `hero`, `popular`, `explore`, `booking`, `footer`, `aiChat`, `notFound`, `auth`

### 🟠 HIGH (major page content)
- `howItWorks`, `testimonials`, `providerCta`, `provider`, `affiliate`, `homePricing`

### 🟡 MEDIUM (important pages)
- `about`, `pricing`, `userPricing`, `support`, `contact`, `blog`, `howItWorksPage`

### 🟢 LOWER (legal/info pages, still must be complete)
- `terms`, `privacy`, `gdpr`, `cookies`, `marina`, `sailing`, `admin`, `legal`

---

## Translation Quality Guidelines

### Nautical terms by language:
| English | Croatian | Czech | Hungarian | Polish | Slovak | Slovenian | Albanian | Maltese |
|---------|----------|-------|-----------|--------|--------|-----------|----------|---------|
| mooring | vez | kotviště | kikötőhely | cumowisko | kotvisko | privez | vendosje | miżband |
| berth | vez/pozicija | místo | kikötőhely | miejsce | miesto | vez | vend | post |
| dock | dok | dok/molo | dok | dok/nabrzeże | dok | pomol | dok | dockyard |
| anchor | sidro | kotva | vasmacska | kotwica | kotva | sidro | spirancë | ankra |
| marina | marina | marina | marina | marina | marina | marina | marina | marina |
| sailor | nautičar | jachtař/námořník | tengerész | żeglarz | námorník | jadralec | lundrues | baħħar |
| navigation | navigacija | navigace | navigáció | nawigacja | navigácia | navigacija | navigim | navigazzjoni |
| weather forecast | vremenska prognoza | předpověď počasí | időjárás-előrejelzés | prognoza pogody | predpoveď počasia | vremenska napoved | parashikim moti | previżjoni tal-temp |

### Common UI terms by language:
| English | Czech | Hungarian | Polish | Slovak | Slovenian | Albanian | Maltese |
|---------|-------|-----------|--------|--------|-----------|----------|---------|
| Search | Hledat | Keresés | Szukaj | Hľadať | Iskanje | Kërko | Fittex |
| Book Now | Rezervovat | Foglalás | Zarezerwuj | Rezervovať | Rezerviraj | Rezervo | Ibbukkja |
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
| Profile | Profil | Profil | Profil | Profil | Profil | Profili | Profil |
| Sign In | Přihlásit | Bejelentkezés | Zaloguj | Prihlásiť | Prijava | Hyni | Idħol |
| Sign Up | Registrovat | Regisztráció | Zarejestruj | Registrovať | Registracija | Regjistrohu | Irreġistra |

---

## Notes on Specific Challenging Sections

### `terms` section (legal text)
The Terms of Service is a long legal document. When translating:
- Keep legal language formal and precise
- Match the original English structure exactly
- "Intelligent Matrix" — keep as brand name, do not translate
- "AS IS" — keep in all-caps in translations too (or equivalent: "KAKAV JEST" in HR)
- Liability disclaimers must be translated faithfully

### `support.faq` section
This is a nested object inside `support`. It has many Q&A pairs grouped by topic:
`bookQ1/bookA1` through `techQ3/techA3`. Each must be translated with the answer being helpful and natural. The JSON structure uses a nested `faq` object:
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

### `pricing.faq` section
Similarly nested:
```json
"pricing": {
  "heroTitle": "...",
  "faq": {
    "q1": "...",
    "a1": "...",
    ...
  }
}
```

---

## Full Execution Checklist

Work through each locale in this order (most incomplete first):

- [ ] **cs** (Czech) — add all missing sections
- [ ] **hu** (Hungarian) — add all missing sections  
- [ ] **mt** (Maltese) — add all missing sections
- [ ] **pl** (Polish) — add all missing sections
- [ ] **sk** (Slovak) — add all missing sections
- [ ] **sl** (Slovenian) — add all missing sections
- [ ] **sq** (Albanian) — add all missing sections
- [ ] **tr** (Turkish) — fill missing keys in existing sections
- [ ] **es** (Spanish) — fill missing keys in existing sections
- [ ] **it** (Italian) — fill missing keys in existing sections
- [ ] **fr** (French) — fill missing keys in existing sections
- [ ] **de** (German) — fill missing keys in existing sections
- [ ] **el** (Greek) — fill missing keys in existing sections
- [ ] **en** — verify completeness vs hr.json
- [ ] **hr** — master, verify it has all keys; add any from en.json it may lack

After completing each locale:
- Confirm JSON is valid (no trailing commas, properly closed objects)
- Confirm top-level section count matches en.json
- Spot-check 5 random translated strings for quality

> **IMPORTANT**: Do NOT rush. Go locale by locale, section by section. Each locale file must be 100% complete before moving to the next.
> Any key left as an English string in a non-English locale is considered a FAILURE.
> Any invalid JSON is a FAILURE.
> The fallback is `en`, but the goal is that NO fallback is ever needed for any UI-visible string.
