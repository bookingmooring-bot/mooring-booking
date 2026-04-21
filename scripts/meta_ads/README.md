# Meta Ads Automation — Mooring Booking Provider Launch

Creates 4 Lead Generation campaigns (IT, GR, ES, FR) in one run. All ads created with **status=PAUSED**, so you can review previews in Ads Manager before activating.

## What gets created per country

- 1× Campaign (objective: OUTCOME_LEADS)
- 1× Ad Set (daily budget, targeting, destination=ON_AD)
- 1× Lead Form (7 localized questions, privacy policy, thank-you page)
- 1× Video creative (ProviderAd_*.mp4, financial-hook angle)
- 1× Image creative (ad_*_1.png, simplicity angle)
- 2× Ads (one per creative)

Total: 4 campaigns, 4 ad sets, 4 lead forms, 8 creatives, 8 ads.

## Prerequisites

Before running, verify:

1. **Ad Account** has a billing method (card/PayPal) configured in Business Manager
2. **Privacy policy** is reachable: `curl -I https://mooring-booking.com/privacy` returns 200
3. **Meta Pixel** is installed on mooring-booking.com (for Lead event tracking)
4. **User access token** has scopes: `ads_management`, `pages_manage_ads`, `leads_retrieval`
   - Get from https://developers.facebook.com/tools/explorer/
   - Select MooringAps app → Get User Token → add scopes → Generate
5. **Assets folder** exists: `C:\Users\Korisnik\Desktop\mooringbooking\ads reklama\` with 4 MP4s + 8 PNGs

## Setup

```bash
cd scripts/meta_ads

# Install deps (once)
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your real token, ad account ID, page ID
```

## Run

### 1. Dry-run (no API calls — prints what would be created)

```bash
# All 4 countries
python create_campaigns.py --dry-run

# Only Italy (recommended first)
python create_campaigns.py --dry-run --countries IT
```

Check `output/run_*_dry.json` for full payload preview.

### 2. Live — single country (safety test)

```bash
python create_campaigns.py --countries IT
```

After this completes, open Meta Ads Manager:
- Campaign `MR-Provider-IT-2026` should exist, status **Paused**
- Open the Ad Set — verify budget €5.83/day, targeting Italy, age 30-65
- Open each Ad — preview in Feed/Reels/Stories
- Open the Lead Form via Forms Library — verify Italian questions

If all looks good, proceed to step 3.

### 3. Live — remaining countries

```bash
python create_campaigns.py --countries GR,ES,FR
```

### 4. Activate manually in Ads Manager

Flip status Paused → Active **one country at a time**:
1. IT first (day 0)
2. GR + ES next day (after IT receives impressions)
3. FR 1-2 days after that

## Test lead submission

After activating, submit a test lead from the Ad Preview in Ads Manager.
Meta webhook will hit `fb-leadgen-webhook` → `process-fb-lead`. Verify:

```sql
SELECT fb_campaign_name, email, status, user_id IS NOT NULL as has_user,
       magic_link_token IS NOT NULL as has_magic_link, invite_email_sent
FROM fb_leads
WHERE created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;
```

Expected: 1 row, status='invited', has_user=true, has_magic_link=true, invite_email_sent=true.

## Troubleshooting

- **"Access validation failed"** — token expired or missing scopes. Regenerate from Graph API Explorer.
- **"Image/Video asset not found"** — check `ASSETS_DIR` path in `.env` (forward slashes on Windows).
- **"Invalid parameter" on lead form** — privacy policy URL not reachable; curl it first.
- **"Ad creative with invalid URL"** — SITE_URL in config.py must be a valid https URL.
- **Campaigns not appearing in Ads Manager** — check `output/run_*.json` for actual IDs, then search by that campaign_id in Ads Manager.

## Files

| File | Purpose |
|---|---|
| `create_campaigns.py` | Orchestrator — CLI entry point |
| `api_client.py` | SDK wrappers |
| `config.py` | Campaign configuration + copy deck |
| `requirements.txt` | Python dependencies |
| `.env.example` | Template for credentials |
| `output/` | Run summaries (gitignored) |
