---
name: marketing-ad-video
description: When the user wants to create video ad scripts, reel scripts, or ad creative for their marketing campaigns using NotebookLM as a knowledge source. Also use when the user mentions 'video reklama,' 'reel skripta,' 'ad video,' 'napravi video za reklamu,' 'video script,' 'marketing video,' 'Facebook reel,' 'Instagram reel script,' 'video ad creative,' 'napravi mi reklamu,' 'video za oglas,' or 'NotebookLM video.' Use this whenever someone wants to generate video ad content grounded in their actual marketing strategy documents. For static ad copy only, see ad-creative. For content strategy planning, see content-strategy.
---

# Marketing Ad Video Skill

Creates source-grounded video ad scripts and accompanying ad copy by combining your marketing strategy documents with NotebookLM's AI capabilities. All generated content is based exclusively on YOUR marketing materials — no hallucinations.

## When to Use

- Creating video/reel scripts for Facebook, Instagram, YouTube
- Generating ad creative packages (video script + ad copy + CTA)
- Producing localized ad content for different Mediterranean markets
- Building video ad variations for A/B testing

## Prerequisites

- NotebookLM MCP must be authenticated (`get_health` → `authenticated: true`)
- A NotebookLM notebook must exist with marketing materials uploaded
- Marketing context files must exist in `.agents/` directory

## Core Workflow

### Step 1: Load Marketing Context

Read the project's marketing foundation files:

```
Files to read:
1. .agents/product-marketing-context.md  — Product, audience, positioning, brand voice
2. .agents/paid-ads-social-strategy.md   — Ad copy, video scripts, targeting, angles
```

Extract key elements:
- **Product one-liner** and value proposition
- **Target audience** for the requested market
- **Brand voice** and tone guidelines
- **Existing ad angles** (Zarada, Nova App, Zero Risk, English)
- **Existing video scripts** as reference templates

### Step 2: Gather Requirements from User

Ask the user (batch all questions in one message):

1. **Target market**: Which country/language? (HR, GR, TR, EN, etc.)
2. **Platform**: Reels (15-30s), Stories (15s), In-Feed (30-60s), YouTube Pre-Roll (6-15s)?
3. **Ad angle**: Zarada/Earnings, Nova App/Launch, Zero Risk, or custom?
4. **Notebook URL or ID**: Which NotebookLM notebook has the marketing materials?
   - If none exists yet → guide user to create one and upload materials (see Step 2b)
5. **Special requirements**: Any specific messaging, offers, or visual ideas?

### Step 2b: Create NotebookLM Notebook (if needed)

If the user doesn't have a notebook yet:

1. Tell user to go to [notebooklm.google.com](https://notebooklm.google.com)
2. Create new notebook → Upload these files as sources:
   - `product-marketing-context.md`
   - `paid-ads-social-strategy.md`
   - Any additional brand guidelines, competitor analysis, etc.
3. Share the notebook: Share → "Anyone with the link" → Copy link
4. Add to library via MCP:
   ```
   Use MCP tool: add_notebook
   - url: [user's notebook URL]
   - name: "Mooring Booking Marketing"
   - description: "Complete marketing strategy, ad copy, video scripts, product positioning for Mooring Booking Mediterranean mooring marketplace"
   - topics: ["marketing strategy", "ad creative", "video scripts", "Mediterranean", "mooring booking"]
   ```

### Step 3: Feed Content to NotebookLM via MCP

Use the NotebookLM MCP to query the notebook with a comprehensive prompt.

**Build the query based on user's requirements:**

```
Use MCP tool: ask_question

question: "Based on the marketing materials in this notebook, create a [FORMAT] video ad script for [MARKET/LANGUAGE]. 

Requirements:
- Duration: [DURATION] seconds
- Ad angle: [ANGLE - e.g., earning potential, new app launch, zero risk]
- Target audience: [FROM CONTEXT - e.g., private mooring owners in Croatia]
- Brand voice: [FROM CONTEXT - warm, trustworthy, Mediterranean]
- Platform: [PLATFORM - Instagram Reels, Facebook, YouTube]

Please provide:
1. A second-by-second script table with columns: Timestamp | Visual | Voiceover/Text | On-screen overlay
2. A strong hook for the first 3 seconds
3. Clear CTA at the end
4. Key emotional triggers to use

Base everything ONLY on the documents provided. Do not invent statistics or testimonials not in the source materials."

notebook_id: [ID from library] OR notebook_url: [URL]
```

### Step 4: Generate Accompanying Ad Copy

Send a follow-up query to NotebookLM:

```
Use MCP tool: ask_question

question: "Based on the marketing materials, create the complete Meta Ads copy package to accompany this video ad for [MARKET]:

1. Primary Text (125 chars optimal, 250 max) — the main ad copy
2. Headline (27 chars optimal, 40 max) — shown below the video
3. Description (27 chars optimal) — secondary text
4. CTA Button recommendation (Sign Up, Learn More, etc.)

Create 3 variations:
- Variation A: Pain-focused (problem → solution)
- Variation B: Benefit-focused (earnings, opportunity)  
- Variation C: FOMO/Launch (be first, new platform)

Language: [TARGET LANGUAGE]
Keep all claims grounded in the source documents."

notebook_id: [same as above]
```

### Step 5: Generate Localized Versions (if requested)

If user wants multiple languages, send additional queries:

```
Use MCP tool: ask_question

question: "Translate and culturally adapt this video script for [NEW MARKET]:
[paste the script from Step 3]

Rules:
- Don't just translate — adapt cultural references
- Use local currency conventions
- Adjust emotional triggers for local culture  
- Keep the same structure and timing"

notebook_id: [same]
```

### Step 6: Format Final Output

Combine all NotebookLM responses into a clean deliverable:

#### Video Script Format:

```markdown
# 🎥 Video Ad Script: [Title]

**Format:** [Reel/Story/In-Feed/Pre-Roll]
**Duration:** [X] seconds
**Market:** [Country/Language]
**Angle:** [Zarada/Launch/Zero Risk]

## Script

| Sekunda | Vizual | Tekst/Voice | Overlay |
|---------|--------|-------------|---------|
| 0-3     | [Hook visual] | [Hook text] | [Text overlay] |
| 3-8     | [Scene] | [Narration] | [Key stat] |
| ...     | ...    | ...         | ...     |

## Prateći Ad Copy

### Varijacija A (Pain → Solution)
- **Primary Text:** ...
- **Headline:** ... (XX chars)
- **Description:** ... (XX chars)
- **CTA:** Sign Up

### Varijacija B (Benefit)
- **Primary Text:** ...
- **Headline:** ...
- **Description:** ...
- **CTA:** Sign Up

### Varijacija C (FOMO/Launch)
- **Primary Text:** ...
- **Headline:** ...
- **Description:** ...
- **CTA:** Learn More

## Vizualni elementi (sugestije)
- [Suggested stock footage / imagery]
- [Color palette notes]
- [Text overlay style]

## Specifikacije
- **Aspect Ratio:** [9:16 za Reels/Stories, 1:1 za Feed, 16:9 za YouTube]
- **Max file size:** 4GB
- **Preporučena rezolucija:** 1080x1920 (vertical) / 1080x1080 (square)
```

### Step 7: Offer Next Steps

After delivering the script, offer:
- "Želiš li verziju za drugu zemlju/jezik?"
- "Želiš li A/B test varijacije za isti market?"
- "Želiš li duži format (60s) ili kraći (15s Stories)?"
- "Želiš li da generiram sliku za thumbnail koristeći generate_image?"

## Video Format Reference

| Format | Trajanje | Aspect Ratio | Hook timing | Platforma |
|--------|----------|-------------|-------------|-----------|
| Reels | 15-30s | 9:16 | Prvih 1-3s | Instagram, Facebook |
| Stories | 15s max | 9:16 | Prvih 1-2s | Instagram, Facebook |
| In-Feed | 30-60s | 1:1 ili 4:5 | Prvih 3s | Facebook, Instagram |
| Pre-Roll | 6-15s | 16:9 | Prvih 2s (skip) | YouTube |

## NotebookLM Query Best Practices

1. **Budi specifičan**: Uključi tržište, jezik, angle, trajanje u svaki query
2. **Citiraj izvore**: Traži od NotebookLM-a da bazira sve na uploadovanim dokumentima
3. **Follow-up pitanja**: Ako prvi odgovor nije dovoljno detaljan, pitaj ponovo sa više konteksta
4. **Kombinuj odgovore**: Spoji više query odgovora u jedan koherentan output
5. **Nemoj izmišljati**: Sve statistike, testimonijali i claims moraju biti iz izvornih dokumenata

## Guardrails

- ❌ **NE koristi fake testimonijale** u reklamama — Meta može zabraniti account
- ❌ **NE izmišljaj statistike** — koristi samo podatke iz marketing dokumenata
- ❌ **NE generiši video** — ovaj skill pravi SKRIPTE, ne same videe
- ✅ **DO** predloži vizualne elemente i stock footage
- ✅ **DO** naglasi da je UGC stil bolji za Meta (veći CTR)
- ✅ **DO** uključi character count za svaki headline/description

## Integration with Other Skills

- **ad-creative** → Za bulk generisanje statičnih ad varijacija
- **social-content** → Za organski content calendar koji prati video reklame
- **paid-ads** → Za kampanjsku strukturu i targeting uz ove kreative
- **copywriting** → Za landing page copy koji dočekuje traffic iz ovih reklama
- **analytics-tracking** → Za postavljanje tracking-a na video ad kampanje
