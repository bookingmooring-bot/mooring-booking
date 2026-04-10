"""
Fix: Unarchive es_fr_tr and si_al_cy adsets, then create missing 14 ads.

Missing:
  es_fr_tr  -> all 10 ads (AD-01 to AD-10)
  si_al_cy  -> AD-07, AD-08, AD-09, AD-10
"""
import requests, json, time

TOKEN   = 'EAAWVZAaTfakYBRNqy6sCKDEDMc2S5dNYNIgb7pVtWr5wOc4dj9aHOT0GoPgZAkMaxWh1EHfsEB3OD7Tkx7BigxGlqFArBgUn3wwtd8tS0QhZBJgg91RfqmcDByffERVGLM0UpItk1td0tcf48X1Ri469FYmPfL9AB3ZBwnmCizVIz28UToVwC2PAy37eVaPdDbkZALZBQ4lX2W90yh'
ACCOUNT = 'act_3100835596778287'
API     = 'https://graph.facebook.com/v21.0'

ADSETS_TO_FIX = {
    'es_fr_tr': '120245136885110750',
    'si_al_cy': '120245136885850750',
}

# Creative IDs from hook_ads_result.json
with open('hook_ads_result.json') as f:
    existing = json.load(f)

CREATIVES = existing['creatives']

# Ad definitions (id + headline for naming)
ADS_META = [
    {'id': 'AD-01', 'headline': 'Fill Your Berths This Season'},
    {'id': 'AD-02', 'headline': 'Empty Berths = Lost Revenue'},
    {'id': 'AD-03', 'headline': 'Join the Revolution Today'},
    {'id': 'AD-04', 'headline': 'Earn With Zero Upfront Cost'},
    {'id': 'AD-05', 'headline': 'Zero Risk. Register Free Today.'},
    {'id': 'AD-06', 'headline': 'Register Free -- Become Visible'},
    {'id': 'AD-07', 'headline': 'Join the Revolution for Free'},
    {'id': 'AD-08', 'headline': "Don't Wait for Next Season"},
    {'id': 'AD-09', 'headline': 'Invisible to Sailors? Not Anymore.'},
    {'id': 'AD-10', 'headline': 'Choose: Full Marina or Empty Season'},
]

# Which ads are missing per adset
MISSING = {
    'es_fr_tr': [a['id'] for a in ADS_META],           # all 10
    'si_al_cy': ['AD-07', 'AD-08', 'AD-09', 'AD-10'],  # 4
}

def sep(msg):
    print(f'\n{"="*60}\n  {msg}\n{"="*60}')

# ── STEP 1: Unarchive adsets ───────────────────────────────────────────────────
sep('STEP 1: Unarchive adsets')
for name, adset_id in ADSETS_TO_FIX.items():
    r = requests.post(
        f'{API}/{adset_id}',
        data={'status': 'PAUSED', 'access_token': TOKEN}
    )
    if r.status_code == 200 and r.json().get('success'):
        print(f'  {name} ({adset_id}): unarchived -> PAUSED')
    else:
        print(f'  {name} ({adset_id}): {r.status_code} {r.text[:300]}')
    time.sleep(1)

# ── STEP 2: Create missing ads ─────────────────────────────────────────────────
sep('STEP 2: Create missing ads')
new_ads = {'es_fr_tr': [], 'si_al_cy': []}

for adset_name, adset_id in ADSETS_TO_FIX.items():
    print(f'\n  Adset: {adset_name} ({adset_id})')
    missing_ids = MISSING[adset_name]
    for ad_meta in ADS_META:
        if ad_meta['id'] not in missing_ids:
            continue
        creative_id = CREATIVES[ad_meta['id']]
        r = requests.post(
            f'{API}/{ACCOUNT}/ads',
            data={
                'name': f'{ad_meta["id"]}_{adset_name}_{ad_meta["headline"][:25]}',
                'adset_id': adset_id,
                'creative': json.dumps({'creative_id': creative_id}),
                'status': 'PAUSED',
                'access_token': TOKEN,
            }
        )
        res = r.json()
        if r.status_code == 200 and 'id' in res:
            new_ads[adset_name].append({'ad_id': res['id'], 'creative': ad_meta['id']})
            print(f'    {ad_meta["id"]} -> ad {res["id"]} (PAUSED)')
        else:
            print(f'    {ad_meta["id"]}: FAILED {r.status_code} {r.text[:200]}')
        time.sleep(0.3)

# ── STEP 3: Update hook_ads_result.json ────────────────────────────────────────
sep('STEP 3: Update hook_ads_result.json')
for adset_name, ads in new_ads.items():
    existing['ads'][adset_name].extend(ads)

existing['total_ads_created'] = sum(len(v) for v in existing['ads'].values())

with open('hook_ads_result.json', 'w') as f:
    json.dump(existing, f, indent=2)

total = existing['total_ads_created']
print(f'\nTotal ads now: {total}/40')
print('Results updated: hook_ads_result.json')
