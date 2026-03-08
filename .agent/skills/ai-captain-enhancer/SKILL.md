---
name: ai-captain-enhancer
description: >
  Improves the AI Captain (Supabase Edge Function ai-captain) — better system prompt,
  richer nautical context, stronger response quality, smarter error handling, and
  improved weather data parsing. Use this skill whenever the user wants to:
  — Make the AI Captain smarter, more detailed, or more helpful without switching models
  — Improve the system prompt / persona / PRAVILA (rules) inside the edge function
  — Add new response categories, topics, or knowledge areas to the AI Captain
  — Improve how weather or wave data is presented to Gemini
  — Fix vague, short, or unhelpful AI Captain responses
  — Tune temperature, maxOutputTokens, topP or other generation parameters
  — Add structured output formatting or response templates to the edge function
  — Improve multi-turn conversation handling (history mapping)
  — Add safety guardrails, specific COLREGS/nautical rules, or route planning logic
  — Improve Croatian ↔ English bilingual handling
  Trigger on: "poboljšaj kapetana", "učini kapetana pametnjim", "kapetan daje kratke odgovore",
  "improve ai captain", "better captain responses", "enhance captain prompt",
  "unaprijedi kapetana", "dodaj kapetanu znanje o", "kapetan ne zna", "system prompt kapetana",
  "poboljšaj prompt", "kapetan odgovara previše kratko", "dodaj tematiku", "proširi kapetana".
  Do NOT change the Gemini model name — always preserve whatever model the existing
  code uses (auto-discovery via getAvailableFlashModels is already in place).
---

# AI Captain Enhancer

You are a **senior prompt engineer + Deno/TypeScript backend developer** who specialises in
improving the AI Captain without touching which AI model is used.

> **Golden rule:** Never modify `getAvailableFlashModels()`, the model-selection loop, or
> any line that specifies model names. The user explicitly wants to keep the model as-is.
> Your job is everything *around* the model call.

---

## 🗂️ Key Files

| File | Purpose |
|---|---|
| `supabase/functions/ai-captain/index.ts` | Edge function — system prompt, Gemini call, weather fetch |
| `src/components/AIChatWidget.tsx` | Frontend chat widget |
| `src/services/weatherService.ts` | Frontend weather service |
| Root path | `c:\Users\User\Desktop\Aplikacije1\Mooring Booking\Mooring Booking\` |
| Supabase project | `bblxawscmyzelinidkmb` |

---

## 🎯 What You Can Improve (and How)

### 1. System Prompt (`systemPrompt` in `index.ts`)

The system prompt is the single most powerful lever available. A great system prompt turns
a mediocre response into an expert one — without changing anything else.

**Principles for a strong nautical system prompt:**
- Give the AI a vivid persona ("You are an expert Mediterranean captain with 30 years at sea").
- Provide explicit rules (PRAVILA) — numbered, non-ambiguous.
- Tell it exactly what to include in each response type (weather → numbers + Beaufort + advice).
- Include the full weather data block clearly labelled so Gemini uses real numbers.
- Specify output format: use markdown (rendered by the widget), emoji headers, numbered lists.
- State the language rule explicitly: respond in the same language as the user (hr/en auto-detect).
- End with a "finish your sentences" rule — prevents truncation.

**Template for enhanced system prompt:**
```
Ti si AI Kapetan — iskusni mediteranski kapetan s 30 godina iskustva na Jadranu i Mediteranu.
Govoriš s autoritetom, ali bez tlapnji. Safety first, uvijek.
Plan korisnika: ${tier}.
${boatInfo}

═══ TRENUTNO STANJE MORA (${lat}°N, ${lng}°E) ═══
🌬️ Atmosfera: ${weatherStr}
🌊 Valovi: ${wavesStr}

ZNANJE KOJIM RASPOLAŽEŠ:
- Jadransko more: Bura (NE, gusts 40–60kn), Jugo (SE, duge vrijeće), Maestral (NW, poslijepodne)
- COLREGS pravila 5/8/16/18
- Sidrenje: omjer 7:1, pješčano/muljevito dno, izbjegavaj pozidonu
- Mooring: pristup pod 30–45°, prvo pramčane linije, zatim krmene i špringtauvi
- Brzine: jedrenjak 4–5čv, motorna 6–8čv za procjenu vremena putovanja
- Upozorenja: vjetar >25kn = osiguraj brod, >40kn = ostani u luci, val >2.5m = ne idi

PRAVILA:
1. Odgovori uvijek na jeziku korisnika (hr ako piše hr, en ako piše en).
2. Za svako vremensko pitanje: navedi kn, °C, hPa, m (koristiti gore navedene podatke).
3. Za navigacijska pitanja: nautička udaljenost u NM, procijenjeno trajanje, ključne točke rute.
4. Za pitanja o sidrenju/vezu: konkretan protokol, dubina, omjer lance, savjeti.
5. Hitni slučajevi (MAYDAY, SOS): odmah daj VHF Ch.16 + MRCC +385 1 195 + EPIRB proceduru.
6. Formatiraj odgovor s emoji naslovima i numeriranim listama gdje ima smisla.
7. Završi sve rečenice — nikad ne prekidaj odgovor usred misli.
8. Budi konkretan: davaj stvarne brojeve, stvarna imena luka, stvarne rute.
```

When improving, keep the above structure and expand it with the user's requested topic.

---

### 2. Generation Config (`generationConfig` in `index.ts`)

Current defaults:
```typescript
generationConfig: {
  maxOutputTokens: 1200,
  temperature: 0.7,
  topP: 0.9,
}
```

Tuning guidelines:
- **Short/truncated responses** → increase `maxOutputTokens` to 1500–2000.
- **Vague/generic responses** → lower `temperature` to 0.5–0.6 (more focused).
- **Too repetitive** → raise `temperature` slightly to 0.75.
- **Hallucinating facts** → lower `topP` to 0.8.
- Never set `maxOutputTokens` below 800.

---

### 3. Weather Data Presentation

Gemini responds better when weather context is clear and labelled. Improve parsing if needed:

```typescript
// Enhanced weather string example
`🌬️ Vjetar: ${windKn.toFixed(1)} čv (dolazi iz ${dir}°, udari ${gustKn.toFixed(1)} čv) — Beaufort ${bf}
🌡️ Temperatura: ${(tempK - 273.15).toFixed(1)}°C | Rosište: ${(dewK - 273.15).toFixed(1)}°C
📊 Tlak: ${(pressurePa / 100).toFixed(0)} hPa
🌊 Visina valova: ${waveH.toFixed(1)} m | Swell: ${swellH.toFixed(1)} m`
```

Add Beaufort scale conversion directly in `index.ts` so Gemini always sees the Beaufort label:
```typescript
function msToBeaufort(ms: number): number {
  if (ms < 0.3) return 0;
  if (ms < 1.6) return 1;
  if (ms < 3.4) return 2;
  if (ms < 5.5) return 3;
  if (ms < 8.0) return 4;
  if (ms < 10.8) return 5;
  if (ms < 13.9) return 6;
  if (ms < 17.2) return 7;
  if (ms < 20.8) return 8;
  if (ms < 24.5) return 9;
  if (ms < 28.5) return 10;
  if (ms < 32.7) return 11;
  return 12;
}
```

---

### 4. Conversation History Handling

Current mapping in `index.ts`:
```typescript
const history = (messages as Array<{ role: string; content: string }>)
  .filter(m => !m.isWelcome)
  .map(m => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
```

Rules for Gemini history:
- First message must have `role: "user"`.
- Roles must alternate: user → model → user → model …
- If the filtered history starts with a model message, drop it.
- The last message must always be `role: "user"` (it's the current question).

Improved version to add if context issues are reported:
```typescript
const rawHistory = (messages as Array<{ role: string; content: string; isWelcome?: boolean }>)
  .filter(m => !m.isWelcome)
  .map(m => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

// Ensure first message is user
const startsOk = rawHistory.findIndex(m => m.role === "user");
const history = rawHistory.slice(startsOk >= 0 ? startsOk : 0);
```

---

### 5. New Response Topics to Add to the System Prompt

When the user asks to extend the AI Captain's knowledge, add these to the `ZNANJE` section:

| Topic | What to add |
|---|---|
| Tidal currents | "Jadran: mikroplimarstvo ≤0.5m. Struje 0.5–2 čv uz kanale. Provjeri admiralitetsku kartu." |
| Night sailing | "Noćna plovidba: navigacijska svjetla obavezna. Straže po 2–3h. Smanji brzinu." |
| Fuel planning | "Potrošnja: ~15–25L/h pri 7–8čv za plovilo 10–14m. Uvijek 20% rezerve." |
| Customs/borders | "Ulazak u EU: Q žuta zastava dok carina ne obradi. Prijava pri prvom pristajanju." |
| Charter regulations | "Charter Croatia: licenca brod + skipperska potvrda; VHF radio dozvola obavezna." |

---

## 🔧 Workflow for Making Improvements

1. **Read** the current `index.ts` to understand what's already there.
2. **Identify** the exact section to improve (system prompt, generationConfig, weather parsing, history).
3. **Edit** only the targeted section — leave model selection untouched.
4. **Deploy** the updated function:
   ```
   mcp_supabase-mcp-server_deploy_edge_function
   project_id: bblxawscmyzelinidkmb
   name: ai-captain
   verify_jwt: false
   ```
5. **Test** with a quick PowerShell call (read ANON_KEY from `.env` first):
   ```powershell
   $ANON_KEY = (Get-Content "c:\Users\User\Desktop\Aplikacije1\Mooring Booking\Mooring Booking\.env" |
     Where-Object { $_ -match "VITE_SUPABASE_ANON_KEY" }) -replace ".*=",""

   $body = @{
     messages = @(@{ role = "user"; content = "Kakvo je more i mogu li isploviti?" })
     location = @{ lat = 43.5; lng = 16.4 }
     userProfile = @{ tier = "premium"; boatLength = 12 }
   } | ConvertTo-Json -Depth 5

   $r = Invoke-RestMethod `
     -Uri "https://bblxawscmyzelinidkmb.supabase.co/functions/v1/ai-captain" `
     -Method POST `
     -Headers @{ "Authorization" = "Bearer $ANON_KEY"; "Content-Type" = "application/json" } `
     -Body $body

   Write-Host $r.reply
   ```
6. **Evaluate** the response — check length, includes weather numbers, gives concrete advice.
7. **Iterate** if needed (repeat from step 3).

---

## ✅ Quality Checklist (assess every improved response)

- [ ] Reply is >150 characters
- [ ] Contains concrete numbers (kn, °C, hPa, m, NM, hours)
- [ ] Does NOT start with `⚓` error prefix
- [ ] Does NOT truncate mid-sentence
- [ ] Responds in user's language (hr for Croatian input, en for English)
- [ ] Gives actionable advice, not just weather parroting
- [ ] Includes a Beaufort label if wind is mentioned
- [ ] Safety warnings present when conditions are marginal/dangerous

---

## 📚 Reference Skills

- **Full app architecture + debugging:** `.agent/skills/fixingbugskil/SKILL.md`
- **End-to-end testing + self-healing:** `.agent/skills/ai-captain-tester/SKILL.md`
- **Nautical knowledge + weather APIs:** `.agent/skills/mariner-ai-agent/SKILL.md`
- **Windy API params:** `.agent/skills/windy-weather-forecast/references/windy-parameters.md`
