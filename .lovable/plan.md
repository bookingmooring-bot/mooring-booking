
# Complete Fix: Translations, Legal, Business Logic, Content & Branding

## Overview
This plan addresses ALL remaining issues: untranslated pages, Czech Republic legal jurisdiction, phone number priority, AI Captain limits, provider discount range, affiliate Stripe payouts, no-refund policy, blog functionality, marina additions, statistics update, and founder rebranding.

---

## 1. Privacy Policy Page -- Full i18n Conversion

**File:** `src/pages/Privacy.tsx`

Currently 100% hardcoded English. Refactor to use `useTranslation()` and `t()` for all text: hero title, subtitle, all section headings (Overview, Information We Collect, How We Use, Data Sharing, Your Rights, Cookies, Data Security, Contact Us), and all paragraph body text. Add corresponding keys to `en.json` under `privacy.*` namespace (many already exist but body text keys are missing).

**Missing keys to add in en.json:**
- `privacy.personalInfo`, `privacy.locationData`, `privacy.usageData`, `privacy.deviceInfo` (with full descriptions)
- `privacy.use1`-`privacy.use7` (list items)
- `privacy.sharingIntro`, `privacy.sharingProviders`, `privacy.sharingPayment`, `privacy.sharingLegal`, `privacy.sharingNever`
- `privacy.right1`-`privacy.right6`
- `privacy.cookiesText1`, `privacy.cookiesText2`
- `privacy.dataSecurityFullText`
- `privacy.contactIntro`, `privacy.contactCompany`, `privacy.contactEmail`, `privacy.contactAddress`

---

## 2. Sailing Manual Page -- Full i18n Conversion

**File:** `src/pages/SailingManual.tsx`

Currently 100% hardcoded English (all sections, quick tips, emergency contacts, disclaimer). Refactor to use `t()` for:
- Hero badge, title, subtitle
- All 6 section titles + all subtitles + all list items (~100 strings)
- Quick tips (5 items)
- Emergency contacts section
- Disclaimer text

Add `sailing.*` keys with full content translations.

---

## 3. Marina Partnership Page -- Full i18n Conversion

**File:** `src/pages/MarinaPartnership.tsx`

Currently 100% hardcoded English. Refactor all text to use `t('marina.*')` keys. Keys already exist in `en.json` and `hr.json` but the component doesn't use them. Wire up:
- Hero badge, title, subtitle
- All 6 partner features (title + desc)
- Pricing section (B2B Plan, price, features list)
- Form labels and placeholders
- Submit button text

---

## 4. BecomeProvider Page -- Remaining Hardcoded Text

**File:** `src/pages/BecomeProvider.tsx`

Still has hardcoded English in:
- "Why Providers Love Mooring Booking" heading (line 287) -- use `t('provider.whyProvidersLove')`
- "Success Stories from Providers" heading (line 311) -- use `t('provider.successStories')`
- All testimonial quotes, authors, locations (lines 93-136) -- hardcoded
- Benefits array titles/descriptions (lines 62-91) -- hardcoded, use `t('provider.increaseIncome')` etc.
- "Start Listing Now" button (line 268) -- use `t('provider.startListingNow')`
- "View Pricing Details" button (line 272) -- use `t('provider.viewPricingDetails')`
- "Ready to Start Earning?" CTA (line 348) -- use `t('provider.readyToEarn')`
- "Create Your Provider Account" button (line 360) -- use `t('provider.createProviderAccount')`
- Form section headers: "Basic Information", "Mooring Details", "Winter Berth / Dry Storage"
- Digital consent modal text (lines 416, 427, 435, 440)
- "Join 10,000+ Providers" badge (line 252)
- Amenity labels, payment method labels, winter service labels

---

## 5. Czech Republic Legal Jurisdiction

**All legal pages + Footer:**

Update legal jurisdiction from Austria to Czech Republic:
- `src/pages/Terms.tsx`: Dispute resolution -- change to "Czech courts have exclusive jurisdiction" and "governed by Czech law"
- `src/pages/GDPR.tsx`: Supervisory authority -- add Czech DPA (UOOU - Urad pro ochranu osobnich udaju) as primary
- `src/pages/Privacy.tsx`: Contact address -- change to "Prague, Czech Republic"
- `src/pages/Support.tsx`: Headquarters -- "Intelligent Matrix, Prague, Czech Republic"
- `src/components/Footer.tsx`: Address display -- Prague first
- Update all locale files (`terms.address`, `terms.disputeText`)

**Phone number priority:** Put Czech number (+420 739 328 337) FIRST in Footer and all contact areas, Austrian number second.

---

## 6. AI Captain -- 10 Total Questions Limit (Not Daily)

**File:** `src/components/AIChatWidget.tsx`

Change from daily 5-question limit to TOTAL 10-question lifetime limit for Basic users:
- Replace `AI_QUESTION_KEY` logic: instead of resetting daily, track a cumulative `ai_captain_total_count` in localStorage
- Remove date-based reset logic
- Check `totalCount >= 10` instead of `dailyCount >= 5`
- Update the limit message to explain it's a lifetime limit until Premium upgrade

**File:** `src/lib/subscription.ts`
- No changes needed (isPremium already works)

**Update en.json and hr.json:**
- `homePricing.basicFeature2`: Change "AI Captain: 5 questions/day" to "AI Captain: 10 questions total"
- Same across all 15 locale files

---

## 7. Provider Discount Range: 0-20% (Not 5-20%)

**Files to update:**
- `src/pages/BecomeProvider.tsx`: Change slider min from 5 to 0
- `src/pages/Terms.tsx` / `en.json` `terms.provider3`: Change "5-20%" to "0-20%"
- `src/i18n/locales/hr.json` `terms.provider3`: Change "5-20%" to "0-20%"
- All other locale files with same key

---

## 8. Affiliate Payouts via Stripe (Not PayPal)

**Files to update:**
- `src/pages/Affiliate.tsx` line 105: `t('affiliate.minPayout')` -- change text
- `en.json` `affiliate.minPayout`: "Minimum payout: EUR50 -- Monthly payments via Stripe or bank transfer"
- `hr.json` same key update
- `support.faq.affA3` in en.json and hr.json: Change "PayPal" to "Stripe"
- All 15 locale files

---

## 9. No Refunds for Early Departure

**Files to update:**
- `en.json` `support.faq.safetyA1`: Remove "may qualify for partial refund", replace with "No refunds are provided for early departure from moorings"
- `hr.json` same key
- `terms` section: Add clause about no refunds for early departure
- All 15 locale files

---

## 10. Blog -- Activate Category Buttons + Add Dummy Articles

**File:** `src/pages/Blog.tsx`

- Add state for active category filter
- Make category buttons functional (filter posts by category)
- Add more dummy blog posts covering nautical tourism topics:
  - "Best Mediterranean Marinas for Winter Storage" (For Providers)
  - "How to Choose Between Private Moorings and Marinas" (Tips & Guides)
  - "Mooring Booking Launches in Albania and Malta" (News)
- Ensure each category has at least 1 post

---

## 11. Add Marinas as Providers Alongside Private Moorings

Update text across pages to include marinas:
- `hero.subtitle` in en.json: Add "marinas" alongside private moorings
- `about.missionText`: Include marina operators
- `providerCta.subtitle`: Mention marinas
- `explore.exploreTitle`: "private moorings and marina berths"
- Various provider-facing descriptions

---

## 12. Statistics Update -- "We Aspire To"

**File:** `src/pages/About.tsx` + `en.json` `about.*` keys:

Change stats from asserting to aspirational:
- "10,000+" -> "10,000+" with label "Aspiring to 10,000+ moorings"
- "50,000" -> "50,000 happy sailors" (target)
- "10+" -> "10+ countries" (Croatia, Greece, Italy, France, Spain, Turkey, Albania, Malta, Cyprus, Slovenia)
- "EUR2M+" -> "EUR2M savings"

Update `hero.subtitle` to mention aspiration and list countries.

---

## 13. Founder Rebranding -- M. Bosic

**File:** `src/pages/About.tsx` line 26:

- Change name from "Michael M. Boson" to "M. Bosic"
- Change avatar to a different businessman photo (50+ years old): use Unsplash photo of mature businessman
- Change bio: "Nautičar sa 15 godina iskustva na Mediteranu. Dugogodišnji CEO u turističkoj industriji. Vizija: demokratizirati pristup vezova svim nautičarima."
- Add English bio translation

**File:** `src/pages/Blog.tsx` line 24: Change "Michael Boson" author to "M. Bosic"

---

## 14. Complete hr.json Translations for ALL Remaining Body Text

Add full Croatian body text translations for every key that currently falls back to English, including:
- All `privacy.*` body text keys
- All `sailing.*` section content keys  
- All `marina.*` form and feature keys (already done)
- All `terms.*` body text (already done)
- All `cookies.*` keys (already done)
- Blog post titles/excerpts (keep in English as content)

---

## 15. Propagate Key Changes to All 14 Non-English Locale Files

After finalizing en.json and hr.json, add/update the same keys in:
de.json, it.json, fr.json, es.json, el.json, tr.json, hu.json, cs.json, sk.json, pl.json, sl.json, sq.json, mt.json

Priority sections to translate in all languages:
- `privacy.*` body text
- `sailing.*` content
- `marina.*` content  
- Updated `terms.provider3` (0-20%)
- Updated `affiliate.minPayout` (Stripe)
- Updated `homePricing.basicFeature2` (10 total)
- Updated `support.faq.safetyA1` (no refunds)
- Updated `terms.disputeText` (Czech jurisdiction)
- Updated `about.*` (aspirational stats, new founder)

---

## Files Summary

### Modified Files (~30+):
1. `src/pages/Privacy.tsx` -- Full i18n conversion
2. `src/pages/SailingManual.tsx` -- Full i18n conversion
3. `src/pages/MarinaPartnership.tsx` -- Wire up existing t() keys
4. `src/pages/BecomeProvider.tsx` -- Wire remaining hardcoded text + discount 0-20%
5. `src/pages/Blog.tsx` -- Active category buttons, more posts, rename author
6. `src/pages/About.tsx` -- New founder name/photo/bio, aspirational stats
7. `src/pages/Affiliate.tsx` -- Stripe payouts
8. `src/pages/Terms.tsx` -- Czech jurisdiction, 0-20% discount, no refunds
9. `src/pages/GDPR.tsx` -- Czech DPA (UOOU)
10. `src/pages/Support.tsx` -- Czech HQ
11. `src/components/Footer.tsx` -- Czech phone first, Prague address first
12. `src/components/AIChatWidget.tsx` -- 10 total questions limit
13. `src/components/HeroSection.tsx` -- Updated subtitle with marinas
14-28. All 15 `src/i18n/locales/*.json` files -- Complete translations + updates
