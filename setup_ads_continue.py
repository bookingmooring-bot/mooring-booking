"""Continue from Step 2 — videos already uploaded, banners already created"""
import requests, json, os

TOKEN   = 'EAAWVZAaTfakYBRNqy6sCKDEDMc2S5dNYNIgb7pVtWr5wOc4dj9aHOT0GoPgZAkMaxWh1EHfsEB3OD7Tkx7BigxGlqFArBgUn3wwtd8tS0QhZBJgg91RfqmcDByffERVGLM0UpItk1td0tcf48X1Ri469FYmPfL9AB3ZBwnmCizVIz28UToVwC2PAy37eVaPdDbkZALZBQ4lX2W90yh'
ACCOUNT = 'act_3100835596778287'
PAGE_ID = '1019158577946111'
API     = 'https://graph.facebook.com/v18.0'
LANDING = 'https://mooring-booking.com/become-provider'

VIDEO_IDS = {
    'reel7_vertical':  '3941818485949506',
    'reel8_landscape': '2428338991017829',
}
BANNERS = {
    'square':    'D:/Desktop/Aplikacije1/Mooring Booking/banner_square.png',
    'vertical':  'D:/Desktop/Aplikacije1/Mooring Booking/banner_vertical.png',
    'landscape': 'D:/Desktop/Aplikacije1/Mooring Booking/banner_landscape.png',
}

def post(endpoint, data, files=None):
    data['access_token'] = TOKEN
    url = f'{API}/{endpoint}'
    r = requests.post(url, data=data, files=files) if files else requests.post(url, data=data)
    if r.status_code == 200:
        return r.json()
    print(f'  ERROR {r.status_code}: {r.text[:400]}')
    return None

def sep(msg):
    print(f'\n{"="*55}\n  {msg}\n{"="*55}')

# ── STEP 2: Upload banner images ────────────────────────────────
sep('2. Upload banner slika na Meta')
img_hashes = {}
for label, path in BANNERS.items():
    fname = os.path.basename(path)
    with open(path, 'rb') as f:
        fdata = f.read()
    res = post(f'{ACCOUNT}/adimages', {}, files={fname: (fname, fdata, 'image/png')})
    if res and 'images' in res:
        img_data = list(res['images'].values())[0]
        h = img_data.get('hash') or img_data.get('image_hash')
        img_hashes[label] = h
        print(f'  {label}: hash={h}')
    else:
        print(f'  {label} failed: {res}')
print('  img_hashes:', img_hashes)

# ── STEP 3: Create ad creatives ─────────────────────────────────
sep('3. Kreiranje ad kreativa')

def creative(name, video_id=None, img_hash=None, title='', body='', cta='SIGN_UP'):
    if video_id:
        spec = {
            'page_id': PAGE_ID,
            'video_data': {
                'video_id': video_id,
                'title': title,
                'message': body,
                'call_to_action': {'type': cta, 'value': {'link': LANDING}},
            }
        }
    elif img_hash:
        spec = {
            'page_id': PAGE_ID,
            'link_data': {
                'image_hash': img_hash,
                'link': LANDING,
                'name': title,
                'message': body,
                'call_to_action': {'type': cta, 'value': {'link': LANDING}},
            }
        }
    else:
        return None
    res = post(f'{ACCOUNT}/adcreatives', {
        'name': name,
        'object_story_spec': json.dumps(spec),
    })
    if res and 'id' in res:
        print(f'  OK  "{name}": {res["id"]}')
        return res['id']
    print(f'  FAIL "{name}"')
    return None

creatives = {}

creatives['reel7_leads'] = creative(
    'Reel7 Vertical - Leads',
    video_id=VIDEO_IDS['reel7_vertical'],
    title='Earn money from your mooring',
    body='List your berth for free. Sailors book online. You get paid. No commission on first 3 bookings.',
    cta='SIGN_UP'
)
creatives['reel8_traffic'] = creative(
    'Reel8 Landscape - Traffic',
    video_id=VIDEO_IDS['reel8_landscape'],
    title="Your mooring earns while you're away",
    body='Join 70+ providers on Adriatic. List for free at mooring-booking.com',
    cta='LEARN_MORE'
)
if img_hashes.get('square'):
    creatives['banner_square'] = creative(
        'Banner Square 1080x1080 - Leads',
        img_hash=img_hashes['square'],
        title='Earn money from your mooring',
        body='List your berth for free. Sailors find and book it online. Join 70+ providers on the Adriatic.',
        cta='SIGN_UP'
    )
if img_hashes.get('vertical'):
    creatives['banner_vertical'] = creative(
        'Banner Vertical 1080x1920 - Leads',
        img_hash=img_hashes['vertical'],
        title='Got a mooring? Make it work for you.',
        body='Free listing. Instant payouts. No commission on first 3 bookings.',
        cta='SIGN_UP'
    )
if img_hashes.get('landscape'):
    creatives['banner_landscape'] = creative(
        'Banner Landscape 1200x628 - Traffic',
        img_hash=img_hashes['landscape'],
        title='Your berth earns. You relax.',
        body='List your mooring for free. Join mooring-booking.com',
        cta='LEARN_MORE'
    )
print('  Kreativni:', {k: v for k,v in creatives.items() if v})

# ── STEP 4: Create campaigns ────────────────────────────────────
sep('4. Kreiranje kampanja (PAUSED)')

def campaign(name, objective, daily_cents):
    res = post(f'{ACCOUNT}/campaigns', {
        'name': name,
        'objective': objective,
        'status': 'PAUSED',
        'daily_budget': daily_cents,
        'special_ad_categories': json.dumps([]),
        'bid_strategy': 'LOWEST_COST_WITHOUT_CAP',
    })
    if res and 'id' in res:
        print(f'  OK  "{name}": {res["id"]}')
        return res['id']
    print(f'  FAIL "{name}": {res}')
    return None

campaigns = {}
campaigns['hr_it']    = campaign('Leads - HR + IT',        'OUTCOME_LEADS',   667)
campaigns['gr']       = campaign('Leads - Greece',          'OUTCOME_LEADS',   500)
campaigns['es_fr_tr'] = campaign('Traffic - ES + FR + TR', 'OUTCOME_TRAFFIC', 500)
campaigns['si_al_cy'] = campaign('Leads - SI + AL + CY',   'OUTCOME_LEADS',   333)
print('  Campaigns:', campaigns)

# ── STEP 5: Create ad sets ──────────────────────────────────────
sep('5. Kreiranje ad setova')

def adset(name, campaign_id, countries, opt_goal, daily_cents, is_leads=True):
    targeting = json.dumps({
        'geo_locations': {'countries': countries, 'location_types': ['home', 'recent']},
        'age_min': 25, 'age_max': 65,
        'brand_safety_content_filter_levels': ['FACEBOOK_STANDARD'],
        'targeting_optimization': 'none',
    })
    data = {
        'name': name,
        'campaign_id': campaign_id,
        'daily_budget': daily_cents,
        'billing_event': 'IMPRESSIONS',
        'optimization_goal': opt_goal,
        'targeting': targeting,
        'status': 'PAUSED',
        'configured_status': 'PAUSED',
        'is_dynamic_creative': 'false',
        'recurring_budget_semantics': 'false',
        'use_new_app_click': 'false',
        'destination_type': 'UNDEFINED' if is_leads else 'WEBSITE',
        'attribution_spec': json.dumps([{'event_type': 'CLICK_THROUGH', 'window_days': 7}]),
    }
    if is_leads:
        data['promoted_object'] = json.dumps({'page_id': PAGE_ID})
    res = post(f'{ACCOUNT}/adsets', data)
    if res and 'id' in res:
        print(f'  OK  "{name}": {res["id"]}')
        return res['id']
    print(f'  FAIL "{name}": {res}')
    return None

adsets = {}
if campaigns.get('hr_it'):
    adsets['hr_it'] = adset('HR + IT - 25-65', campaigns['hr_it'], ['HR','IT'], 'LEAD_GENERATION', 667)
if campaigns.get('gr'):
    adsets['gr'] = adset('Greece - 25-65', campaigns['gr'], ['GR'], 'LEAD_GENERATION', 500)
if campaigns.get('es_fr_tr'):
    adsets['es_fr_tr'] = adset('ES + FR + TR - 25-65', campaigns['es_fr_tr'], ['ES','FR','TR'], 'LINK_CLICKS', 500, is_leads=False)
if campaigns.get('si_al_cy'):
    adsets['si_al_cy'] = adset('SI + AL + CY - 25-65', campaigns['si_al_cy'], ['SI','AL','CY'], 'LEAD_GENERATION', 333)
print('  AdSets:', adsets)

# ── STEP 6: Create ads ──────────────────────────────────────────
sep('6. Kreiranje oglasa')

def ad(name, adset_id, creative_id):
    res = post(f'{ACCOUNT}/ads', {
        'name': name,
        'adset_id': adset_id,
        'creative': json.dumps({'creative_id': creative_id}),
        'status': 'PAUSED',
    })
    if res and 'id' in res:
        print(f'  OK  "{name}": {res["id"]}')
        return res['id']
    print(f'  FAIL "{name}": {res}')
    return None

ads = {}
if adsets.get('hr_it'):
    if creatives.get('reel7_leads'):
        ads['hr_it_v'] = ad('HR+IT - Reel7 Vertical', adsets['hr_it'], creatives['reel7_leads'])
    if creatives.get('banner_square'):
        ads['hr_it_b'] = ad('HR+IT - Banner Square', adsets['hr_it'], creatives['banner_square'])

if adsets.get('gr'):
    if creatives.get('reel7_leads'):
        ads['gr_v'] = ad('GR - Reel7 Vertical', adsets['gr'], creatives['reel7_leads'])
    if creatives.get('banner_vertical'):
        ads['gr_b'] = ad('GR - Banner Vertical', adsets['gr'], creatives['banner_vertical'])

if adsets.get('es_fr_tr'):
    if creatives.get('reel8_traffic'):
        ads['traf_v'] = ad('ES+FR+TR - Reel8 Landscape', adsets['es_fr_tr'], creatives['reel8_traffic'])
    if creatives.get('banner_landscape'):
        ads['traf_b'] = ad('ES+FR+TR - Landscape Banner', adsets['es_fr_tr'], creatives['banner_landscape'])

if adsets.get('si_al_cy'):
    if creatives.get('reel7_leads'):
        ads['si_v'] = ad('SI+AL+CY - Reel7', adsets['si_al_cy'], creatives['reel7_leads'])
    if creatives.get('banner_square'):
        ads['si_b'] = ad('SI+AL+CY - Banner', adsets['si_al_cy'], creatives['banner_square'])

# ── SUMMARY ──────────────────────────────────────────────────────
sep('GOTOVO')
print(f'  Kampanje:  {sum(1 for v in campaigns.values() if v)}/4')
print(f'  Ad setovi: {sum(1 for v in adsets.values() if v)}/4')
print(f'  Kreativni: {sum(1 for v in creatives.values() if v)}/5')
print(f'  Oglasi:    {sum(1 for v in ads.values() if v)}/8')
print()
print('  Sve je PAUSED — provjeri u Ads Manageru i aktiviraj!')
print()
print('  Budget plan (sve PAUSED):')
print('    HR+IT  Leads: €200/mj | Greece Leads: €150/mj')
print('    ES+FR+TR Traffic: €150/mj | SI+AL+CY Leads: €100/mj')
print('    UKUPNO: €600/mj (€100 rezerva)')

with open('D:/Desktop/Aplikacije1/Mooring Booking/ads_setup_result.json', 'w') as f:
    json.dump({'campaigns': campaigns, 'adsets': adsets,
               'creatives': creatives, 'ads': ads,
               'video_ids': VIDEO_IDS, 'img_hashes': img_hashes}, f, indent=2)
print('\n  Rezultati: ads_setup_result.json')
