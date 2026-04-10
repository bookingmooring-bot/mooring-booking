"""Final step — fix video creatives + create ad sets + ads"""
import requests, json

TOKEN   = 'EAAWVZAaTfakYBRNqy6sCKDEDMc2S5dNYNIgb7pVtWr5wOc4dj9aHOT0GoPgZAkMaxWh1EHfsEB3OD7Tkx7BigxGlqFArBgUn3wwtd8tS0QhZBJgg91RfqmcDByffERVGLM0UpItk1td0tcf48X1Ri469FYmPfL9AB3ZBwnmCizVIz28UToVwC2PAy37eVaPdDbkZALZBQ4lX2W90yh'
ACCOUNT = 'act_3100835596778287'
PAGE_ID = '1019158577946111'
API     = 'https://graph.facebook.com/v18.0'
LANDING = 'https://mooring-booking.com/become-provider'

# Already created
VIDEO_IDS = {'reel7': '3941818485949506', 'reel8': '2428338991017829'}
IMG_HASHES = {
    'square':    '871de74acdaf22c6f0c5f5d836462669',
    'vertical':  '7cfb5a3743cae7c6303052065713fe70',
    'landscape': '76fda3f5b679554a24debda0acf63f12',
}
CAMPAIGNS = {
    'hr_it':    '120245134110810750',
    'gr':       '120245134111330750',
    'es_fr_tr': '120245134111910750',
    'si_al_cy': '120245134112410750',
}
BANNER_CREATIVES = {
    'square':    '1479826723934428',
    'vertical':  '961890826182810',
    'landscape': '1507964127618384',
}

def post(ep, data):
    data['access_token'] = TOKEN
    r = requests.post(f'{API}/{ep}', data=data)
    if r.status_code == 200:
        return r.json()
    print(f'  ERR {r.status_code}: {r.text[:350]}')
    return None

def sep(msg):
    print(f'\n{"="*55}\n  {msg}\n{"="*55}')

# ── 1: Video creatives with thumbnail ───────────────────────
sep('1. Video kreativni s thumbnailom')

def video_creative(name, vid_id, thumb_hash, title, body, cta):
    spec = {
        'page_id': PAGE_ID,
        'video_data': {
            'video_id': vid_id,
            'image_hash': thumb_hash,
            'title': title,
            'message': body,
            'call_to_action': {'type': cta, 'value': {'link': LANDING}},
        }
    }
    res = post(f'{ACCOUNT}/adcreatives', {
        'name': name,
        'object_story_spec': json.dumps(spec),
    })
    if res and 'id' in res:
        print(f'  OK  "{name}": {res["id"]}')
        return res['id']
    print(f'  FAIL "{name}"')
    return None

video_creatives = {}
video_creatives['reel7_leads'] = video_creative(
    'Reel7 Vertical - Leads',
    VIDEO_IDS['reel7'], IMG_HASHES['square'],
    'Earn money from your mooring',
    'List your berth for free. Sailors book online. You get paid. No commission on first 3 bookings.',
    'SIGN_UP'
)
video_creatives['reel8_traffic'] = video_creative(
    'Reel8 Landscape - Traffic',
    VIDEO_IDS['reel8'], IMG_HASHES['landscape'],
    "Your mooring earns while you're away",
    'Join 70+ providers on Adriatic. List for free at mooring-booking.com',
    'LEARN_MORE'
)
print('  Video kreativni:', video_creatives)

# ── 2: Ad sets (no attribution_spec) ────────────────────────
sep('2. Ad setovi')

def adset(name, campaign_id, countries, opt_goal, daily_cents=None, is_leads=True):
    targeting = json.dumps({
        'geo_locations': {'countries': countries, 'location_types': ['home', 'recent']},
        'age_min': 25, 'age_max': 65,
        'brand_safety_content_filter_levels': ['FACEBOOK_STANDARD'],
        'targeting_optimization': 'none',
    })
    data = {
        'name': name,
        'campaign_id': campaign_id,
        'billing_event': 'IMPRESSIONS',
        'optimization_goal': opt_goal,
        'targeting': targeting,
        'status': 'PAUSED',
    }
    if is_leads:
        data['promoted_object'] = json.dumps({'page_id': PAGE_ID})
    res = post(f'{ACCOUNT}/adsets', data)
    if res and 'id' in res:
        print(f'  OK  "{name}": {res["id"]}')
        return res['id']
    print(f'  FAIL "{name}"')
    return None

adsets = {}
adsets['hr_it']    = adset('HR + IT - 25-65',     CAMPAIGNS['hr_it'],    ['HR','IT'],       'LEAD_GENERATION', 667)
adsets['gr']       = adset('Greece - 25-65',       CAMPAIGNS['gr'],       ['GR'],            'LEAD_GENERATION', 500)
adsets['es_fr_tr'] = adset('ES+FR+TR - 25-65',    CAMPAIGNS['es_fr_tr'], ['ES','FR','TR'],  'LINK_CLICKS',     500, is_leads=False)
adsets['si_al_cy'] = adset('SI+AL+CY - 25-65',    CAMPAIGNS['si_al_cy'], ['SI','AL','CY'],  'LEAD_GENERATION', 333)
print('  AdSets:', adsets)

# ── 3: Create ads ────────────────────────────────────────────
sep('3. Kreiranje oglasa')

def ad(name, adset_id, creative_id):
    if not adset_id or not creative_id:
        return None
    res = post(f'{ACCOUNT}/ads', {
        'name': name,
        'adset_id': adset_id,
        'creative': json.dumps({'creative_id': creative_id}),
        'status': 'PAUSED',
    })
    if res and 'id' in res:
        print(f'  OK  "{name}": {res["id"]}')
        return res['id']
    print(f'  FAIL "{name}"')
    return None

ads = {}

# HR+IT: reel7 + banner square
ads['hr_it_v'] = ad('HR+IT - Reel7 Vertical',  adsets.get('hr_it'), video_creatives.get('reel7_leads'))
ads['hr_it_b'] = ad('HR+IT - Banner Square',    adsets.get('hr_it'), BANNER_CREATIVES['square'])

# Greece: reel7 + banner vertical
ads['gr_v'] = ad('GR - Reel7 Vertical',   adsets.get('gr'), video_creatives.get('reel7_leads'))
ads['gr_b'] = ad('GR - Banner Vertical',  adsets.get('gr'), BANNER_CREATIVES['vertical'])

# Traffic: reel8 + landscape
ads['traf_v'] = ad('ES+FR+TR - Reel8 Landscape',  adsets.get('es_fr_tr'), video_creatives.get('reel8_traffic'))
ads['traf_b'] = ad('ES+FR+TR - Landscape Banner',  adsets.get('es_fr_tr'), BANNER_CREATIVES['landscape'])

# SI+AL+CY: reel7 + banner square
ads['si_v'] = ad('SI+AL+CY - Reel7',    adsets.get('si_al_cy'), video_creatives.get('reel7_leads'))
ads['si_b'] = ad('SI+AL+CY - Banner',   adsets.get('si_al_cy'), BANNER_CREATIVES['square'])

# ── SUMMARY ──────────────────────────────────────────────────
sep('GOTOVO - Sve kreirano')

ok_ads = sum(1 for v in ads.values() if v)
ok_sets = sum(1 for v in adsets.values() if v)
ok_vc = sum(1 for v in video_creatives.values() if v)

print(f'  Video kreativni: {ok_vc}/2')
print(f'  Ad setovi:       {ok_sets}/4')
print(f'  Oglasi:          {ok_ads}/8')
print()
print('  Kampanje (PAUSED):')
print(f'    Leads HR+IT    : {CAMPAIGNS["hr_it"]}   budget €667 centi/dan')
print(f'    Leads Greece   : {CAMPAIGNS["gr"]}   budget €500 centi/dan')
print(f'    Traffic ES+FR+TR: {CAMPAIGNS["es_fr_tr"]}   budget €500 centi/dan')
print(f'    Leads SI+AL+CY : {CAMPAIGNS["si_al_cy"]}   budget €333 centi/dan')
print()
print('  Kreativni (5 total):')
print(f'    Reel7 Vertical - Leads:    {video_creatives.get("reel7_leads", "FAIL")}')
print(f'    Reel8 Landscape - Traffic: {video_creatives.get("reel8_traffic", "FAIL")}')
for k, v in BANNER_CREATIVES.items():
    print(f'    Banner {k}: {v}')
print()
print('  Provjeri u Ads Manageru i aktiviraj kampanje!')

with open('D:/Desktop/Aplikacije1/Mooring Booking/ads_setup_result.json', 'w') as f:
    json.dump({
        'campaigns': CAMPAIGNS, 'adsets': adsets,
        'video_creatives': video_creatives,
        'banner_creatives': BANNER_CREATIVES,
        'ads': ads,
    }, f, indent=2)
print('  Rezultati: ads_setup_result.json')
