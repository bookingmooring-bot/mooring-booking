---
name: ai-captain-tester
description: >
  End-to-end tester and self-healer for the AI Captain feature of the Mooring Booking app.
  Use this skill whenever the user wants to test, validate, or debug the AI Captain — not just
  by asking chat questions, but also by making REAL backend HTTP calls to the Supabase Edge Function
  and verifying the full chain (weather API → Gemini → response). Keeps fixing issues until all
  checks pass.
  Trigger on: "testiraj ai kapetana", "test ai captain", "provjeri kapetana", "radi li kapetan",
  "debug kapetana", "kapetan ne odgovara", "test edge function", "provjeri backend kapetana",
  "ai captain broken", "fix ai captain", "test and fix captain", or any request to validate
  the AI captain end-to-end. Always use this skill if the user wants automated or backend-level
  testing of the AI Captain, not just a UI-level chat test.
---

# AI Captain Tester — End-to-End Validation & Self-Healing Skill

You are a **senior QA + backend engineer** who validates the full AI Captain pipeline and fixes
whatever is broken. You do NOT just ask the chat widget questions — you make **real HTTP calls**
to the backend, inspect responses, and iterate until every check passes.

---

## 🎯 Goal

Run a complete test suite against the AI Captain system:
1. **Conversational tests** — check the chat widget works from the frontend perspective
2. **Backend / Edge Function tests** — call the Supabase Edge Function directly via `curl` or
   `fetch` and verify every layer: Windy weather, wave data, Gemini response
3. **Auto-fix** — if any test fails, identify the root cause and fix it, then re-run until green

---

## 🏗️ System Architecture (what you are testing)

| Component | Location |
|---|---|
| Edge Function entrypoint | `supabase/functions/ai-captain/index.ts` |
| Gemini model | `gemini-2.0-flash` via `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent` |
| Weather API (primary) | `https://api.windy.com/api/point-forecast/v2` (model: `iconEu`) |
| Wave API | same endpoint, model: `gfsWave` |
| Frontend chat widget | `src/components/AIChatWidget.tsx` |
| Weather service | `src/services/weatherService.ts` |
| Supabase project | `bblxawscmyzelinidkmb` |
| Edge Function URL | `https://bblxawscmyzelinidkmb.supabase.co/functions/v1/ai-captain` |
| Root path | `c:\Users\User\Desktop\Aplikacije1\Mooring Booking\Mooring Booking\` |

**Key secrets (read from `.env` or Supabase secrets):**
```
VITE_SUPABASE_ANON_KEY   — needed as Authorization header for Edge Function calls
GEMINI_API_KEY           — set as Supabase secret (not in .env)
WINDY_API_KEY            — set as Supabase secret (also hardcoded fallback in index.ts)
```

---

## 🧪 Full Test Suite — Run in Order

### TEST 1 — Edge Function Reachability

Make a raw HTTP call and verify the function responds (not 404/502):

```powershell
# Read anon key from .env first
$ANON_KEY = (Get-Content "c:\Users\User\Desktop\Aplikacije1\Mooring Booking\Mooring Booking\.env" |
  Where-Object { $_ -match "VITE_SUPABASE_ANON_KEY" }) -replace ".*=",""

$body = @{
  messages = @(@{ role = "user"; content = "Kakvo je more danas?" })
  location = @{ lat = 43.5; lng = 16.4 }
  userProfile = @{ tier = "basic" }
} | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod `
  -Uri "https://bblxawscmyzelinidkmb.supabase.co/functions/v1/ai-captain" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $ANON_KEY"; "Content-Type" = "application/json" } `
  -Body $body

Write-Host "STATUS: OK"
Write-Host "REPLY: $($response.reply)"
```

**Pass criteria:**
- HTTP 200 response
- `.reply` field exists and is non-empty
- `.reply` does NOT start with `⚓ AI Kapetan nije konfiguriran`
- `.reply` does NOT start with `⚓ Interna greška`

---

### TEST 2 — Weather Data Inclusion

The reply must contain actual weather numbers (not just a generic answer):

**Pass criteria:** The reply contains at least one of:
- A number followed by `kn` or `čv` (wind knots)
- A number followed by `°C` (temperature)
- A number followed by `hPa` (pressure)
- A number followed by `m` (wave height)

If the Windy API returns "nedostupan" but Gemini still answered, that is a **partial pass** —
note it and check Windy API key validity.

---

### TEST 3 — Gemini Quality Check

Send a specific nautical question and verify the response quality:

```powershell
$body = @{
  messages = @(
    @{ role = "user"; content = "Imam katamaran 12m. Mogu li danas izaći iz Splita prema Hvaru? Bura je 3 Bf." }
  )
  location = @{ lat = 43.508; lng = 16.439 }
  userProfile = @{ tier = "premium"; boatName = "Test Vessel"; boatLength = 12 }
} | ConvertTo-Json -Depth 5
```

**Pass criteria:**
- Reply length > 100 characters
- Contains actionable advice (numbers, directions, or "savjet"/"advice")
- Does NOT contain `⚓` error prefix
- Does NOT truncate mid-sentence (no reply ending with `,` or incomplete word)

---

### TEST 4 — Conversation History Test

Send a 2-message history to verify context is maintained:

```powershell
$body = @{
  messages = @(
    @{ role = "user"; content = "Kakvo je stanje mora?" }
    @{ role = "assistant"; content = "More je mirno, vjetar 10 čv." }
    @{ role = "user"; content = "Je li sigurno sidro baciti?" }
  )
  location = @{ lat = 43.5; lng = 16.4 }
  userProfile = @{ tier = "basic" }
} | ConvertTo-Json -Depth 5
```

**Pass criteria:**
- Reply references anchoring (sidro, anchor, scope, dubina, lancima)
- No error prefix

---

### TEST 5 — Error Resilience

Send a malformed request with missing fields:

```powershell
$body = '{"messages": []}' 
# Empty message history — function should still return a valid (possibly default) reply
```

**Pass criteria:**
- HTTP 200 (function never crashes with 5xx)
- Returns a JSON object with a `.reply` key

---

## 🔍 Diagnosing Failures

When a test fails, follow this diagnosis tree:

### If TEST 1 fails (function not reachable / 5xx):
1. Check if the function is deployed: look at `supabase/functions/ai-captain/index.ts` — is it valid Deno TypeScript?
2. Check for syntax errors, import issues, or missing `Deno.serve()`
3. Re-deploy: read the edge function source and use `mcp_supabase-mcp-server_deploy_edge_function`
4. Check Supabase logs: use `mcp_supabase-mcp-server_get_logs` with `service: "edge-function"`

### If reply contains `nije konfiguriran` (missing GEMINI_API_KEY):
1. The `GEMINI_API_KEY` Supabase secret is not set
2. Read the `.env` file to see if `GEMINI_API_KEY` exists there
3. If it exists in `.env`, it needs to be set as a Supabase Edge Function secret
4. Fix: deploy the function with the key set, or instruct the user to add it via Supabase dashboard

### If reply contains weather "nedostupan":
1. Windy API key is invalid or rate-limited
2. Read `WINDY_API_KEY` from `.env` — if it's a different key than in `index.ts`, update the secret
3. Test the Windy API directly:
   ```powershell
   $windyBody = @{ lat=43.5; lon=16.4; model="iconEu"; parameters=@("wind","temp"); levels=@("surface"); key="YOUR_KEY" } | ConvertTo-Json
   Invoke-RestMethod -Uri "https://api.windy.com/api/point-forecast/v2" -Method POST -ContentType "application/json" -Body $windyBody
   ```
4. If Windy API itself fails, update the edge function to use a working fallback

### If TEST 3 fails (bad Gemini response, truncated, or wrong language):
1. Read `supabase/functions/ai-captain/index.ts` — check `maxOutputTokens` (should be 800+)
2. Check `generationConfig` — temperature too high causes erratic output
3. Check system prompt — it must include the weather data and correct `PRAVILA`
4. Fix the edge function and redeploy

### If TEST 4 fails (context not maintained):
1. Check how `messages` are mapped to Gemini `history` in `index.ts`
2. The `.filter(m => !m.isWelcome)` must preserve all non-welcome messages
3. Role mapping must be: `"user"` → `"user"`, anything else → `"model"`

---

## 🔧 Auto-Fix Protocol

After every test failure, follow this loop **without stopping**:

```
1. Identify which test failed and why (from response content + logs)
2. Locate the source of the problem (edge function, API key, frontend, etc.)
3. Apply the minimal fix:
   - If edge function code: edit index.ts → redeploy via mcp_supabase-mcp-server_deploy_edge_function
   - If API key: instruct the user clearly (can't set secrets programmatically)
   - If frontend: edit AIChatWidget.tsx
4. Wait 5–10 seconds for deployment to propagate
5. Re-run the failed test
6. If still failing, dig deeper (read logs, check Gemini API docs)
7. Repeat until ALL tests pass
```

**Never declare success until ALL 5 tests pass.**

---

## 📋 Test Report Format

After running all tests, produce a clear report:

```
## AI Captain Test Report — [timestamp]

| Test | Status | Notes |
|------|--------|-------|
| TEST 1 — Reachability | ✅ PASS / ❌ FAIL | [details] |
| TEST 2 — Weather Data | ✅ PASS / ⚠️ PARTIAL / ❌ FAIL | [details] |
| TEST 3 — Quality Check | ✅ PASS / ❌ FAIL | [details] |
| TEST 4 — Context/History | ✅ PASS / ❌ FAIL | [details] |
| TEST 5 — Error Resilience | ✅ PASS / ❌ FAIL | [details] |

### Overall: X/5 tests passed

### Issues found:
- [issue description]

### Fixes applied:
- [what was changed and why]

### Remaining action needed:
- [anything the user must do manually, e.g. set Supabase secret]
```

---

## 🛠️ Useful MCP Tools for This Skill

| Task | Tool to use |
|---|---|
| Read edge function source | `mcp_supabase-mcp-server_get_edge_function` |
| Deploy fixed edge function | `mcp_supabase-mcp-server_deploy_edge_function` (project_id: `bblxawscmyzelinidkmb`) |
| Read edge function logs | `mcp_supabase-mcp-server_get_logs` (service: `edge-function`) |
| Read DB data (if needed) | `mcp_supabase-mcp-server_execute_sql` |
| Make HTTP call to test | Use `run_command` with PowerShell `Invoke-RestMethod` |

---

## 📚 Reference Files

Read these for deeper context when fixing issues:
- **Edge function:** `supabase/functions/ai-captain/index.ts`
- **Frontend widget:** `src/components/AIChatWidget.tsx`
- **Weather service:** `src/services/weatherService.ts`
- **App architecture:** `.agent/skills/fixingbugskil/SKILL.md`
- **Mariner knowledge:** `.agent/skills/mariner-ai-agent/SKILL.md`
