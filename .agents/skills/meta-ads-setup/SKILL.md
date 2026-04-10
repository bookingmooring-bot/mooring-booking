---
name: meta-ads-setup
description: Use when someone wants to upload hook ads to Meta, create ad creatives via Graph API, set up Meta Ads campaigns, run the hook ads script, manage adsets, or deploy ads to Facebook/Instagram for Mooring Booking.
disable-model-invocation: true
argument-hint: [upload-images | create-creatives | create-ads | full-run | status]
---

## What This Skill Does

Manages the Meta Ads setup pipeline for Mooring Booking's Week 1 Hook campaign:
1. Uploads 10 hook PNG images to Meta Ad Account
2. Creates 10 ad creatives (hook + body variant + CTA)
3. Creates 40 ads (10 creatives x 4 adsets) in **PAUSED** status
4. Saves all IDs to `hook_ads_result.json`

**Key rule: Always create ads as PAUSED. Never activate without explicit user confirmation.**

---

## Context Files to Load First

Before any action, read:
- `ads_final_config.json` — campaign IDs, adset IDs, existing creative IDs, budget plan
- `setup_hook_ads.py` — the main upload/create script
- `references/campaign-structure.md` — adset targeting details, country mapping
- `references/copy-variants.md` — approved V1/V2/V3 body copy variants and which ad uses which

If `hook_ads_result.json` exists — read it first. It means images/creatives/ads were already uploaded. **Do not re-upload or duplicate.**

---

## Steps

### Step 0: Check for existing results
1. Check if `hook_ads_result.json` exists.
   - If it exists: read it and report status (how many images uploaded, creatives created, ads created). Ask user what they want to do — re-run only failed items, activate paused ads, or view status.
   - If it does not exist: proceed to Step 1.

### Step 1: Verify token
1. The Meta access token is hardcoded in `setup_hook_ads.py` at line 14 (`TOKEN = ...`).
2. Tokens expire every ~60 days. Before running, confirm with the user: "Is the Meta access token still valid? Last used: [check git log or ask user]."
3. If token is expired: user must regenerate at developers.facebook.com → Tools → Graph API Explorer → Generate User Access Token → extend to long-lived token.
4. Do NOT modify the token in the script unless the user provides a new one explicitly.

### Step 2: Verify image files
1. Check that all 10 PNG files exist in `D:/Desktop/Aplikacije1/Mooring Booking/ad-visuals-week1-hooks/`:
   - ad-01-ai-captain-saves-marina.png
   - ad-02-empty-berths-revenue.png
   - ad-03-sinking-emptiness.png
   - ad-04-mooring-fields-empty.png
   - ad-05-concession-paid.png
   - ad-06-boats-pass-by.png
   - ad-07-best-friend-business.png
   - ad-08-marina-owners-rescue.png
   - ad-09-berths-invisible.png
   - ad-10-full-marina-bankruptcy.png
2. If any files are missing: report which ones and stop. Do not run the script with missing images.

### Step 3: Run the script
```
cd "D:/Desktop/Aplikacije1/Mooring Booking"
python setup_hook_ads.py
```

Monitor output for:
- `uploaded -> hash [hash]` — image upload success
- `creative [id] OK` — creative created
- `ad [id] (PAUSED)` — ad created in paused status
- `ERR 400` / `FAILED` — errors to report

### Step 4: Report results
After the script completes:
1. Read `hook_ads_result.json`
2. Report:
   - Images uploaded: X/10
   - Creatives created: X/10
   - Ads created: X/40 (10 per adset × 4 adsets)
   - Any failures with error details
3. Remind user: **All ads are PAUSED. Review in Meta Ads Manager before activating.**

### Step 5 (optional): Activate ads
Only if the user explicitly says "activate" or "enable":
1. Confirm which adsets or specific ads to activate
2. Use Meta API: `POST /{ad-id}?status=ACTIVE&access_token={token}`
3. Confirm activation with the user before sending any API call

---

## Adset Structure

See `references/campaign-structure.md` for full details.

| Key | Adset ID | Countries |
|-----|----------|-----------|
| hr_it | 120245136883010750 | Croatia + Italy (Adriatic) |
| gr | 120245136884040750 | Greece |
| es_fr_tr | 120245136885110750 | Spain + France + Turkey |
| si_al_cy | 120245136885850750 | Slovenia + Albania + Cyprus |

---

## Copy Variant Mapping

See `references/copy-variants.md` for full text.

| Variant | Ads | Angle |
|---------|-----|-------|
| V1 | AD-01, 02, 03, 06 | AI Captain journey |
| V2 | AD-04, 05, 09 | Free + 15% + AI search |
| V3 | AD-07, 08, 10 | First-mover FOMO + AI search |

---

## Notes & Guardrails

- **Token expiry**: Meta user tokens expire after ~60 days. Long-lived tokens after ~90 days. Always verify before running.
- **No duplicates**: If `hook_ads_result.json` exists with successful results, don't re-run — it creates duplicate ads and wastes budget.
- **PAUSED by default**: The script creates all ads as PAUSED. Never change status to ACTIVE in the script without user approval.
- **Account ID**: `act_3100835596778287` — hardcoded in script. Do not change.
- **Page ID**: `1019158577946111` — Mooring Booking Facebook Page.
- **API version**: v21.0. If Meta deprecates this version, update `API = 'https://graph.facebook.com/v21.0'` in the script.
- **Landing page**: All ads point to `https://mooring-booking.com/become-provider`
- **Image format**: PNG only. If client delivers JPG, rename extension — Meta accepts both.
- **Budget**: Do not modify campaign budgets via script. Budget changes must go through Meta Ads Manager.
