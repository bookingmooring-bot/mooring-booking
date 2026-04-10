"""
Create new campaigns + adsets for ES+FR+TR+PT and SI+AL+ME+CY+MT,
then add the 14 missing ads (PAUSED).
"""
import requests, json, time

TOKEN   = 'EAAWVZAaTfakYBRNqy6sCKDEDMc2S5dNYNIgb7pVtWr5wOc4dj9aHOT0GoPgZAkMaxWh1EHfsEB3OD7Tkx7BigxGlqFArBgUn3wwtd8tS0QhZBJgg91RfqmcDByffERVGLM0UpItk1td0tcf48X1Ri469FYmPfL9AB3ZBwnmCizVIz28UToVwC2PAy37eVaPdDbkZALZBQ4lX2W90yh'
ACCOUNT = 'act_3100835596778287'
API     = 'https://graph.facebook.com/v21.0'

def post(ep, data):
    data['access_token'] = TOKEN
    r = requests.post(f'{API}/{ep}', data=data)
    if r.status_code == 200:
        return r.json()
    print(f'  ERR {r.status_code}: {r.text[:400]}')
    return None

def sep(msg):
    print(f'\n{"="*60}\n  {msg}\n{"="*60}')

# Load existing results (creatives are already created)
with open('hook_ads_result.json') as f:
    existing = json.load(f)

CREATIVES = existing['creatives']

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

MISSING = {
    'es_fr_tr': [a['id'] for a in ADS_META],          # all 10
    'si_al_cy': ['AD-07', 'AD-08', 'AD-09', 'AD-10'], # 4
}

# ── STEP 1: Create campaigns ───────────────────────────────────────────────────
sep('STEP 1: Create new campaigns')

campaign_ids = {}

for name, countries_label in [
    ('es_fr_tr', 'Marina Providers -- ES FR TR PT'),
    ('si_al_cy', 'Marina Providers -- SI AL ME CY MT'),
]:
    res = post(f'{ACCOUNT}/campaigns', {
        'name': f'Hook Ads -- {countries_label}',
        'objective': 'OUTCOME_LEADS',
        'status': 'PAUSED',
        'special_ad_categories': '[]',
        'is_adset_budget_sharing_enabled': 'false',
    })
    if res and 'id' in res:
        campaign_ids[name] = res['id']
        print(f'  {name}: campaign {res["id"]} created (PAUSED)')
    else:
        print(f'  {name}: campaign FAILED')
    time.sleep(1)

if len(campaign_ids) < 2:
    print('\nFailed to create campaigns. Stopping.')
    exit(1)

# ── STEP 2: Create adsets ──────────────────────────────────────────────────────
sep('STEP 2: Create adsets')

ADSET_CONFIG = {
    'es_fr_tr': {
        'label': 'ES+FR+TR+PT -- Hook Ads',
        'countries': ['ES', 'FR', 'TR', 'PT'],
        'daily_budget': 650,   # EUR 6.50/day ~ EUR 200/mo
    },
    'si_al_cy': {
        'label': 'SI+AL+ME+CY+MT -- Hook Ads',
        'countries': ['SI', 'AL', 'ME', 'CY', 'MT'],
        'daily_budget': 450,   # EUR 4.50/day ~ EUR 140/mo
    },
}

adset_ids = {}

for name, cfg in ADSET_CONFIG.items():
    targeting = json.dumps({
        'age_min': 20,
        'age_max': 63,
        'geo_locations': {
            'countries': cfg['countries'],
        },
        'targeting_automation': {
            'advantage_audience': 0,
        },
    })

    res = post(f'{ACCOUNT}/adsets', {
        'name': cfg['label'],
        'campaign_id': campaign_ids[name],
        'optimization_goal': 'LEAD_GENERATION',
        'billing_event': 'IMPRESSIONS',
        'bid_strategy': 'LOWEST_COST_WITHOUT_CAP',
        'daily_budget': cfg['daily_budget'],
        'targeting': targeting,
        'promoted_object': json.dumps({'page_id': '1019158577946111'}),
        'status': 'PAUSED',
    })

    if res and 'id' in res:
        adset_ids[name] = res['id']
        print(f'  {name}: adset {res["id"]} created (PAUSED)')
        print(f'    Countries: {cfg["countries"]}')
        print(f'    NOTE: Refine to 5km coastal in Ads Manager after review')
    else:
        print(f'  {name}: adset FAILED')
    time.sleep(1)

if len(adset_ids) < 2:
    print('\nFailed to create adsets. Stopping.')
    exit(1)

# ── STEP 3: Create the 14 missing ads ─────────────────────────────────────────
sep('STEP 3: Create missing ads')

new_ads = {'es_fr_tr': [], 'si_al_cy': []}

for adset_name, adset_id in adset_ids.items():
    print(f'\n  Adset: {adset_name} ({adset_id})')
    missing_ids = MISSING[adset_name]

    for ad_meta in ADS_META:
        if ad_meta['id'] not in missing_ids:
            continue

        creative_id = CREATIVES[ad_meta['id']]
        res = post(f'{ACCOUNT}/ads', {
            'name': f'{ad_meta["id"]}_{adset_name}_{ad_meta["headline"][:25]}',
            'adset_id': adset_id,
            'creative': json.dumps({'creative_id': creative_id}),
            'status': 'PAUSED',
        })

        if res and 'id' in res:
            new_ads[adset_name].append({'ad_id': res['id'], 'creative': ad_meta['id']})
            print(f'    {ad_meta["id"]} -> ad {res["id"]} (PAUSED)')
        else:
            print(f'    {ad_meta["id"]}: FAILED')
        time.sleep(0.3)

# ── STEP 4: Update hook_ads_result.json ────────────────────────────────────────
sep('STEP 4: Update results')

for adset_name, ads in new_ads.items():
    existing['ads'][adset_name].extend(ads)

existing['campaigns_new'] = campaign_ids
existing['adsets_new'] = adset_ids
existing['total_ads_created'] = sum(len(v) for v in existing['ads'].values())

with open('hook_ads_result.json', 'w') as f:
    json.dump(existing, f, indent=2)

total = existing['total_ads_created']
print(f'\nTotal ads: {total}/40')
print(f'New campaigns: {campaign_ids}')
print(f'New adsets:    {adset_ids}')
print('\nNEXT STEP: In Meta Ads Manager, refine targeting on new adsets')
print('  to 5km coastal cities (currently set to full country).')
print('  Then review all 40 ads before activating.')
