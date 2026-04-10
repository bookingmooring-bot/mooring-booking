---
name: meta-ads-dashboard
description: "When the user wants to view, analyze, or manage their Meta (Facebook/Instagram) ad campaigns, ad sets, ads, or performance insights via the meta-ads MCP server. Also use when the user wants to: generate a leads PDF report, generate a conversion report, generate an ads plan PDF for clients, set up new campaigns, upload creatives/videos, or do coastal geo-targeting. Use when the user says 'pokaži mi reklame', 'koje reklame imam', 'Facebook ads', 'Meta kampanje', 'potrošnja oglasa', 'performanse reklama', 'leads kampanja', 'CTR', 'CPC', 'ad insights', 'pauziraj kampanju', 'napravi kampanju', 'izvuci leadove', 'napravi pdf reklame', 'plan za klijente', 'konverzija leadova', or anything related to viewing, managing, or reporting on Meta ads."
metadata:
  version: 1.2.0
---

# Meta Ads Dashboard

You are a Meta Ads analyst with direct access to the Meta Marketing API through MCP tools. Your job is to pull live data, present it clearly, and help the user understand and optimize their campaigns.

## IMPORTANT: Known API Limitations (avoid trial and error)

| What NOT to do | Why | What to do instead |
|---|---|---|
| `fields: ["leads"]` | Invalid field → API error | Read `lead` from `actions` array |
| `date_preset: "lifetime"` | Not a valid preset → API error | Use `time_range: { since, until }` for full history |
| Skip `ToolSearch` for tools | Tools need schema before calling | Always `ToolSearch` first if not loaded |

**Valid `date_preset` values:** `today`, `yesterday`, `this_week`, `last_week`, `this_month`, `last_month`, `this_quarter`, `last_quarter`, `this_year`, `last_year`

---

## Setup Requirements

This skill requires the `meta-ads` MCP server to be running. It is configured at:
- Config: `C:\Users\User\.claude\settings.json`
- Wrapper: `C:\Users\User\meta-ads-mcp-start.js`
- Token: stored in wrapper script as `META_ACCESS_TOKEN`
- App ID: `1571638673893958`

If MCP tools are not available, tell the user to restart VSCode and check that the server is connected.

---

## QUICK START — Skip Step 1 & 2, go directly to performance

**Known accounts (no need to call `get_ad_accounts` unless checking new accounts):**

| Account ID | Name | Status | Currency |
|---|---|---|---|
| `act_3100835596778287` | **mooringbooking** | Active (1) | EUR |
| `act_1011818009302201` | FSD system | Unsettled (3) | EUR |
| `act_459002950579996` | Photo ads | Active (1) | USD |
| `act_204028847499805` | Andrej Hernaus | Unsettled (3) | USD |
| `act_2828269313898038` | (unnamed) | Closed (101) | USD |

Account status codes: `1` = Active, `2` = Disabled, `3` = Unsettled, `101` = Closed by Meta

**Known active campaigns (mooringbooking):**

| Campaign ID | Name | Objective | Started |
|---|---|---|---|
| `120244102126290750` | New Leads Campaign | OUTCOME_LEADS | 2026-03-12 |
| `120243987414000750` | Trafik kampanja Hrvatska | OUTCOME_TRAFFIC | 2026-03-11 |

---

## Step 1: Get Ad Accounts (only if needed)

```
Tool: mcp__meta-ads__get_ad_accounts
Params: (none)
```

---

## Step 2: List Campaigns (only if checking for new campaigns)

```
Tool: mcp__meta-ads__list_campaigns
Params:
  account_id: "act_3100835596778287"
  status: "ACTIVE"   ← optional filter
  limit: 25
```

---

## Step 3: Get Performance Insights — PREFERRED METHOD

Use `get_campaign_performance` for campaign-level data. It returns pre-computed averages.

```
Tool: mcp__meta-ads__get_campaign_performance
Params:
  object_id: "120244102126290750"     ← campaign ID
  level: "campaign"                   ← account | campaign | adset | ad
  time_range:
    since: "2026-03-12"               ← campaign start date
    until: "2026-03-31"               ← today's date
  fields:
    - campaign_name
    - impressions
    - clicks
    - spend
    - cpc
    - ctr
    - reach
    - frequency
    - actions
    - cost_per_action_type
```

**For this_month or specific presets**, use `date_preset` instead of `time_range`:

```
Tool: mcp__meta-ads__get_campaign_performance
Params:
  object_id: "120244102126290750"
  level: "campaign"
  date_preset: "this_month"
  fields: [same as above]
```

**Never use `date_preset: "lifetime"` — it causes API error. Use `time_range` with the campaign start date instead.**

---

## Step 3b: Alternative — get_insights (account-level or ad-level)

Use `get_insights` when you need data at account level or want raw insights:

```
Tool: mcp__meta-ads__get_insights
Params:
  object_id: "act_3100835596778287"
  level: "account" | "campaign" | "adset" | "ad"
  date_preset: "this_month"
  fields: ["impressions", "clicks", "spend", "ctr", "cpc", "actions"]
```

---

## Reading the `actions` Array

The `actions` array contains all conversion events. Extract these key types:

| action_type | Meaning |
|---|---|
| `lead` | Form submissions (leads) — **use this, not a `leads` field** |
| `onsite_conversion.lead_grouped` | Same as lead, grouped |
| `link_click` | Outbound link clicks |
| `landing_page_view` | Actual page loads after click |
| `page_engagement` | Total Facebook/Instagram interactions |
| `video_view` | Video starts (3+ seconds) |
| `post_reaction` | Likes, loves, etc. |
| `offsite_conversion.custom.1391568842722266` | Custom conversion (mooringbooking) |

To get cost-per-lead, read `cost_per_action_type` where `action_type == "lead"`.

---

## Step 4: List Ad Sets

```
Tool: mcp__meta-ads__list_ad_sets
Params:
  campaign_id: "120244102126290750"
  limit: 25
```

---

## Step 5: List Ads

```
Tool: mcp__meta-ads__list_ads
Params:
  campaign_id: "120244102126290750"
  limit: 25
```

---

## PDF Reports — Ready-to-Run Scripts

Three Python scripts exist for generating PDF reports. Run with `python -X utf8 <script>`.

### 1. Leads Report PDF
**Script:** `D:/Desktop/Aplikacije1/Mooring Booking/generate_leads_pdf.py`
**Output:** `C:/Users/User/Downloads/Mooring_Leads_Report_2026-03.pdf`
**What it does:** Reads the two lead CSVs from Downloads, merges 70 unique leads, generates:
- Page 1: Summary stats (leads count, ima vez/nema vez, tip veza bar charts, country bar charts)
- Page 2+: Full table of all 70 leads with name, email, phone, city/country, vez status (colour coded), tip veza, date, platform

**CSV sources (UTF-16, tab-delimited):**
```
C:/Users/User/Downloads/New Leads Ad_Leads_2026-03-12_2026-03-31.csv
C:/Users/User/Downloads/New Leads Ad - Copy_Leads_2026-03-12_2026-03-31.csv
```

---

### 2. Conversion Report PDF (Leads vs. Database)
**Script:** `D:/Desktop/Aplikacije1/Mooring Booking/generate_conversion_pdf.py`
**Output:** `C:/Users/User/Downloads/Mooring_Conversion_Report_2026-03.pdf`
**What it does:** Cross-references lead CSV emails with Supabase profiles table, generates:
- Page 1: Funnel (70 leads → 42 registered 60% → 0 listings), stat boxes, role breakdown
- Page 2: Registered leads table (42 people who signed up, with registration date + mooring count)
- Page 3: Unregistered leads table (28 people — follow-up candidates)
- Page 4: Organic signups (2 people who registered without going through lead form)

**Test accounts excluded from analysis:**
```python
TEST_EMAILS = {
    'hernausa96@gmail.com', 'dlazukic@gmail.com', 'mb.smartmatrix@gmail.com',
    'bookingmooring@gmail.com', 'hermark0m@gmail.com', 'bosicmiodrag@gmail.com'
}
```

**Key finding:** Traffic campaign brought 0 registrations. All 42 registrations came through Lead form.

---

### 3. Ads Plan PDF (za klijente / za odobrenje)
**Script:** `D:/Desktop/Aplikacije1/Mooring Booking/generate_ads_plan_pdf.py`
**Output:** `C:/Users/User/Downloads/MooringBooking_Ads_Plan_April2026.pdf`
**What it does:** 8-page professional plan PDF for client approval, contains:
- Page 1: Cover page (navy, logo, key numbers)
- Page 2: Results to date (funnel, stat cards, country breakdown)
- Page 3: Expansion plan (why only Leads, market selection, coastal targeting)
- Page 4: Budget & campaigns (visual bar chart, campaign table, 20% SI/AL/CY rule)
- Page 5: Creative assets (2 videos + 3 banners, A/B test plan)
- Page 6: Targeting & audience (who we target, parameters, lead form questions)
- Page 7: Projections & KPIs (monthly per campaign, 3-month outlook)
- Page 8: Approval page (checkboxes + signature line)

**When to regenerate:** When campaign setup changes, budget changes, or before any client meeting.

---

## Campaign Setup Scripts

### Full Campaign Setup (April 2026 expansion)
**Script:** `D:/Desktop/Aplikacije1/Mooring Booking/setup_ads_update.py`
**What it does:**
- Pauses old Traffic campaign
- Updates budgets on existing HR/IT, GR, SI/AL/CY campaigns
- Creates new Leads campaign for ES+FR+TR
- Creates ad sets with coastal city radius targeting (20km from coast)
- Creates ads with Reel7/Reel8 videos + banners

**Known campaign IDs (April 2026):**
```
Leads HR+IT:    120245134110810750  (EUR 667 cents/day = ~EUR 200/mj)
Leads Greece:   120245134111330750  (EUR 533 cents/day = ~EUR 160/mj)
Leads ES+FR+TR: 120245136881830750  (EUR 667 cents/day = ~EUR 200/mj)
Leads SI+AL+CY: 120245134112410750  (EUR 467 cents/day = ~EUR 140/mj = 20%)
```

**Known creative IDs:**
```
Reel7 Vertical (Leads):    2503504760103222   (video_id: 3941818485949506)
Reel8 Landscape (Traffic): 35787866020812542  (video_id: 2428338991017829)
Banner Square 1080x1080:   1479826723934428   (hash: 871de74acdaf22c6f0c5f5d836462669)
Banner Vertical 1080x1920: 961890826182810    (hash: 7cfb5a3743cae7c6303052065713fe70)
Banner Landscape 1200x628: 1507964127618384   (hash: 76fda3f5b679554a24debda0acf63f12)
```

---

## Campaign Setup — API Rules (avoid errors)

| What fails | Why | Fix |
|---|---|---|
| Budget on BOTH campaign AND ad set | "Can't Set Ad Set and Campaign Budget" | Set budget ONLY on campaign (CBO) OR only on ad set — not both |
| `attribution_spec` on lead gen ad sets | Invalid attribution window | Remove `attribution_spec` entirely from ad set |
| Video creative without thumbnail | "Your ad needs a video thumbnail" | Add `image_hash` to `video_data` in `object_story_spec` |
| Campaign objective can't be changed | API error | Pause old campaign, create NEW campaign with correct objective |
| Ad set budget when campaign has budget | API error | Remove `daily_budget` from ad set call |

### Correct video creative structure:
```python
spec = {
    'page_id': PAGE_ID,
    'video_data': {
        'video_id': video_id,
        'image_hash': img_hash,   # ← REQUIRED thumbnail
        'title': title,
        'message': body,
        'call_to_action': {'type': 'SIGN_UP', 'value': {'link': LANDING_URL}},
    }
}
```

### Correct ad set structure (no budget, no attribution):
```python
data = {
    'name': name,
    'campaign_id': campaign_id,
    # NO daily_budget here (set on campaign level)
    'billing_event': 'IMPRESSIONS',
    'optimization_goal': 'LEAD_GENERATION',
    'targeting': json.dumps(targeting),
    'status': 'PAUSED',
    'promoted_object': json.dumps({'page_id': PAGE_ID}),  # required for leads
    # NO attribution_spec
}
```

### Coastal targeting (custom_locations with radius):
```python
'geo_locations': {
    'custom_locations': [
        {'latitude': 43.508133, 'longitude': 16.440193, 'radius': 20, 'distance_unit': 'kilometer'},
        # ... more cities
    ],
    'location_types': ['home', 'recent'],
}
```

---

## Budget Strategy (April 2026)

Total: **EUR 700/month**

| Campaign | Countries | Budget/mj | % | Daily (cents) |
|---|---|---|---|---|
| Leads HR + IT | HR, IT | EUR 200 | 28.6% | 667 |
| Leads Greece | GR | EUR 160 | 22.9% | 533 |
| Leads ES+FR+TR | ES, FR, TR | EUR 200 | 28.6% | 667 |
| Leads SI+AL+CY | SI, AL, CY | EUR 140 | **20%** | 467 |

**Rule:** SI+AL+CY always = 20% of total budget (smallest markets).
**Rule:** All campaigns = OUTCOME_LEADS only (Traffic campaigns do not convert to registrations).
**Rule:** Targeting age 25-65, coastal cities 20km radius, English language creatives.

---

## Mooring Booking — Active Campaigns (Last updated: 2026-03-31)

### Phase 1 (March 2026 — Croatia only)

| Campaign | ID | Status | Performance |
|---|---|---|---|
| New Leads Campaign | `120244102126290750` | ACTIVE | 70 leads, $268 spent, CPL $3.83, CTR 3.05% |
| Trafik kampanja Hrvatska | `120243987414000750` | PAUSED | 2.043 clicks, $95 spent, 1.301 LPV, 0 registrations |

**Key insight:** Traffic campaign brought 0 registrations. Paused. Only Lead campaigns going forward.

### Phase 2 (April 2026 — Mediterranean expansion, all PAUSED awaiting activation)

| Campaign | ID | Countries | Budget |
|---|---|---|---|
| Leads - HR + IT | `120245134110810750` | HR, IT | EUR 667/day |
| Leads - Greece | `120245134111330750` | GR | EUR 533/day |
| Leads - ES + FR + TR | `120245136881830750` | ES, FR, TR | EUR 667/day |
| Leads - SI + AL + CY | `120245134112410750` | SI, AL, CY | EUR 467/day (20%) |

---

## How to Present Data

Always format as a comparison table with totals:

```
| Metrika            | New Leads      | Trafik HR      | UKUPNO    |
|--------------------|----------------|----------------|-----------|
| Impressions        | 72.537         | 91.074         | 163.611   |
| Reach              | 19.205         | 31.515         | —         |
| Klikovi            | 2.215          | 2.043          | 4.258     |
| Potrošeno          | $268.15        | $94.90         | $363.05   |
| CTR                | 3.05%          | 2.24%          | —         |
| CPC                | $0.12          | $0.05          | —         |
| Leads              | 70             | —              | 70        |
| CPL                | $3.83          | —              | —         |
| Landing pg views   | 66             | 1.301          | 1.367     |
```

---

## Campaign Management Tools

### Pause / Resume

```
Tool: mcp__meta-ads__pause_campaign
Params:
  campaign_id: "..."

Tool: mcp__meta-ads__resume_campaign
Params:
  campaign_id: "..."
```

### Update budget

```
Tool: mcp__meta-ads__update_campaign
Params:
  campaign_id: "..."
  daily_budget: 1000   ← in cents (€10.00 = 1000)
  status: "ACTIVE" | "PAUSED"
```

### Compare campaigns side-by-side

```
Tool: mcp__meta-ads__compare_performance
Params:
  object_ids: ["120244102126290750", "120243987414000750"]
  level: "campaign"
  date_preset: "this_month"
  metrics: ["impressions", "clicks", "spend", "ctr", "cpc"]
```

---

## Token Management

The access token is stored in `C:\Users\User\meta-ads-mcp-start.js`.

```
Tool: mcp__meta-ads__validate_token   ← check if token is still valid
Tool: mcp__meta-ads__get_token_info   ← see expiry and permissions
```

Facebook access tokens expire. If auth errors occur, generate a new long-lived token and update the wrapper script.

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `leads is not valid for fields param` | `leads` can't be a direct field | Read `lead` from `actions` array |
| `lifetime is not a valid date_preset` | `lifetime` is not supported | Use `time_range: { since, until }` |
| `Meta access token is required` | ENV not set | Check wrapper script, restart VSCode |
| `No running MCP servers` | Server not started | Restart VSCode completely |
| `(#200) Requires ads_management permission` | Token missing scope | Re-authenticate with full scopes |

---

## Supabase — Conversion Tracking

**URL:** `https://bblxawscmyzelinidkmb.supabase.co`
**Key tables:** `profiles`, `moorings`, `fb_leads` (currently empty — not synced yet)

Cross-reference leads with database:
```python
import urllib.request, json
BASE = 'https://bblxawscmyzelinidkmb.supabase.co/rest/v1'
KEY  = '<anon key from .env>'
headers = {'apikey': KEY, 'Authorization': f'Bearer {KEY}'}
# GET profiles: /profiles?select=id,email,role,created_at&limit=200
# GET moorings: /moorings?select=owner_id,name,status&limit=200
```

Match lead emails (from CSV) against profile emails to find who registered.
Exclude test accounts: hernausa96@gmail.com, dlazukic@gmail.com, mb.smartmatrix@gmail.com, bookingmooring@gmail.com, hermark0m@gmail.com

**Current stats (31.03.2026):** 50 profiles total, 42 from leads (60% conversion), 0 mooring listings added.

---

## Related Skills

- **ad-creative**: For writing and iterating on ad copy
- **paid-ads**: For campaign strategy and targeting
- **ab-test-setup**: For structuring A/B tests on creatives
