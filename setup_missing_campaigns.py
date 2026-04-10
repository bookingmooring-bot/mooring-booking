"""
Create HR+IT and GR campaigns + adsets + 10 ads each, all ACTIVE.
ES+FR+TR and SI+AL+CY are already active.
"""
import requests, json, time

TOKEN   = 'EAAWVZAaTfakYBRNqy6sCKDEDMc2S5dNYNIgb7pVtWr5wOc4dj9aHOT0GoPgZAkMaxWh1EHfsEB3OD7Tkx7BigxGlqFArBgUn3wwtd8tS0QhZBJgg91RfqmcDByffERVGLM0UpItk1td0tcf48X1Ri469FYmPfL9AB3ZBwnmCizVIz28UToVwC2PAy37eVaPdDbkZALZBQ4lX2W90yh'
ACCOUNT = 'act_3100835596778287'
PAGE_ID = '1019158577946111'
API     = 'https://graph.facebook.com/v21.0'

def post(ep, data):
    data['access_token'] = TOKEN
    r = requests.post(f'{API}/{ep}', data=data)
    if r.status_code == 200:
        return r.json()
    print(f'  ERR {r.status_code}: {r.text[:300]}')
    return None

def sep(msg):
    print(f'\n{"="*60}\n  {msg}\n{"="*60}')

with open('hook_ads_result.json') as f:
    existing = json.load(f)

CREATIVES = existing['creatives']

ADS_META = [
    ('AD-01', 'Fill Your Berths This Season'),
    ('AD-02', 'Empty Berths = Lost Revenue'),
    ('AD-03', 'Join the Revolution Today'),
    ('AD-04', 'Earn With Zero Upfront Cost'),
    ('AD-05', 'Zero Risk. Register Free Today.'),
    ('AD-06', 'Register Free -- Become Visible'),
    ('AD-07', 'Join the Revolution for Free'),
    ('AD-08', "Don't Wait for Next Season"),
    ('AD-09', 'Invisible to Sailors? Not Anymore.'),
    ('AD-10', 'Choose: Full Marina or Empty Season'),
]

CAMPAIGNS = {
    'hr_it': {
        'name': 'Hook Ads -- Marina Providers -- HR IT',
        'adset_name': 'HR+IT -- Hook Ads',
        'countries': ['HR', 'IT'],
        'daily_budget': 650,  # ~EUR 200/mo
    },
    'gr': {
        'name': 'Hook Ads -- Marina Providers -- GR',
        'adset_name': 'GR -- Hook Ads',
        'countries': ['GR'],
        'daily_budget': 520,  # ~EUR 160/mo
    },
}

new_campaign_ids = {}
new_adset_ids = {}

# ── STEP 1: Campaigns ─────────────────────────────────────────────────────────
sep('STEP 1: Create campaigns')
for key, cfg in CAMPAIGNS.items():
    res = post(f'{ACCOUNT}/campaigns', {
        'name': cfg['name'],
        'objective': 'OUTCOME_LEADS',
        'status': 'ACTIVE',
        'special_ad_categories': '[]',
        'is_adset_budget_sharing_enabled': 'false',
    })
    if res and 'id' in res:
        new_campaign_ids[key] = res['id']
        print(f'  {key}: campaign {res["id"]} ACTIVE')
    else:
        print(f'  {key}: FAILED')
    time.sleep(1)

# ── STEP 2: Adsets ────────────────────────────────────────────────────────────
sep('STEP 2: Create adsets')
for key, cfg in CAMPAIGNS.items():
    if key not in new_campaign_ids:
        continue
    targeting = json.dumps({
        'age_min': 20,
        'age_max': 63,
        'geo_locations': {'countries': cfg['countries']},
        'targeting_automation': {'advantage_audience': 0},
    })
    res = post(f'{ACCOUNT}/adsets', {
        'name': cfg['adset_name'],
        'campaign_id': new_campaign_ids[key],
        'optimization_goal': 'LEAD_GENERATION',
        'billing_event': 'IMPRESSIONS',
        'bid_strategy': 'LOWEST_COST_WITHOUT_CAP',
        'daily_budget': cfg['daily_budget'],
        'targeting': targeting,
        'promoted_object': json.dumps({'page_id': PAGE_ID}),
        'status': 'ACTIVE',
    })
    if res and 'id' in res:
        new_adset_ids[key] = res['id']
        print(f'  {key}: adset {res["id"]} ACTIVE ({cfg["countries"]})')
        print(f'    NOTE: Refine to 5km coastal targeting in Ads Manager')
    else:
        print(f'  {key}: FAILED')
    time.sleep(1)

# ── STEP 3: Ads ───────────────────────────────────────────────────────────────
sep('STEP 3: Create ads (ACTIVE)')
new_ads = {k: [] for k in CAMPAIGNS}

for key, adset_id in new_adset_ids.items():
    print(f'\n  Adset: {key} ({adset_id})')
    for ad_id, headline in ADS_META:
        res = post(f'{ACCOUNT}/ads', {
            'name': f'{ad_id}_{key}_{headline[:25]}',
            'adset_id': adset_id,
            'creative': json.dumps({'creative_id': CREATIVES[ad_id]}),
            'status': 'ACTIVE',
        })
        if res and 'id' in res:
            new_ads[key].append({'ad_id': res['id'], 'creative': ad_id})
            print(f'    {ad_id} -> {res["id"]} (ACTIVE)')
        else:
            print(f'    {ad_id}: FAILED')
        time.sleep(0.3)

# ── STEP 4: Save ──────────────────────────────────────────────────────────────
sep('STEP 4: Save results')
for key, ads in new_ads.items():
    if key not in existing['ads']:
        existing['ads'][key] = []
    existing['ads'][key].extend(ads)

if 'campaigns_new' not in existing:
    existing['campaigns_new'] = {}
if 'adsets_new' not in existing:
    existing['adsets_new'] = {}

existing['campaigns_new'].update(new_campaign_ids)
existing['adsets_new'].update(new_adset_ids)
existing['total_ads_created'] = sum(len(v) for v in existing['ads'].values())

with open('hook_ads_result.json', 'w') as f:
    json.dump(existing, f, indent=2)

print(f'\nTotal ads: {existing["total_ads_created"]}')
print(f'New campaigns: {new_campaign_ids}')
print(f'New adsets:    {new_adset_ids}')
print('\nSve 4 kampanje su sada ACTIVE.')
print('Idi u Ads Manager i postavi coastal 5km targeting na HR+IT i GR adsetove.')
