"""
Mooring Booking — Create Meta Instant Form + Lead Ads
=====================================================
1. Kreira novu Meta Instant Form (Lead Gen Form)
2. Kreira nove ad creative sa leadgen_data (instant form)
3. Dodaje nove adsove u sve 4 Hook Ads adsetove

Koristi postojece image hasheve iz hook_ads_result.json
"""
import requests, json, time

# ── CONFIG ────────────────────────────────────────────────────────────────────
TOKEN   = 'EAAWVZAaTfakYBRNqy6sCKDEDMc2S5dNYNIgb7pVtWr5wOc4dj9aHOT0GoPgZAkMaxWh1EHfsEB3OD7Tkx7BigxGlqFArBgUn3wwtd8tS0QhZBJgg91RfqmcDByffERVGLM0UpItk1td0tcf48X1Ri469FYmPfL9AB3ZBwnmCizVIz28UToVwC2PAy37eVaPdDbkZALZBQ4lX2W90yh'
ACCOUNT = 'act_3100835596778287'
PAGE_ID = '1019158577946111'
API     = 'https://graph.facebook.com/v21.0'

# Hook Ads adsetovi (iz hook_ads_result.json - novi adsetovi)
ADSETS = {
    'hr_it':    '120245234037430750',
    'gr':       '120245234038520750',
    'es_fr_tr': '120245201253060750',
    'si_al_cy': '120245201255650750',
}

# Ucitaj postojece image hasheve
with open('hook_ads_result.json') as f:
    hook_result = json.load(f)
IMAGE_HASHES = hook_result['image_hashes']

# ── COPY VARIJANTE ────────────────────────────────────────────────────────────
V1 = (
    "We are launching a revolution in boating: sailors now ask AI Captain for a complete voyage plan "
    "-- and AI Captain recommends the best available berths. "
    "Register your marina free at mooring-booking.com and let AI Captain send boaters straight to you."
)
V2 = (
    "AI Captain is revolutionizing how Mediterranean sailors find berths. "
    "They ask their AI assistant for a full voyage plan and get instant smart recommendations through AI search. "
    "Join mooring-booking.com 100% free, list your berths in minutes. "
    "Pay only 15% on confirmed bookings -- no subscription, no upfront cost, zero risk. "
    "Register your marina right now and start getting boaters this season -- before spots fill up."
)
V3 = (
    "The AI Captain revolution is here: sailors will ask their AI assistant for complete voyage plans "
    "and discover berths through powerful AI search. "
    "Marinas that register first get priority placement and maximum visibility to thousands of boaters. "
    "Early positions are extremely limited. "
    "Don't let competitors steal your spots -- register your marina for free at mooring-booking.com immediately."
)

# ── 10 ADOVA ─────────────────────────────────────────────────────────────────
ADS = [
    {
        'id': 'AD-01',
        'hook': 'AI Captain saves your marina! Brings boaters, fills berths and boosts your revenue.',
        'body': V1,
        'cta_text': 'Register your berths for free in the mooring-booking database now and be the first recommended by AI Captain.',
        'headline': 'Fill Your Berths This Season',
        'desc': 'Free listing. Be first. 15% only.',
    },
    {
        'id': 'AD-02',
        'hook': 'Empty berths killing your revenue? AI Captain saves them -- brings boaters and increases earnings.',
        'body': V1,
        'cta_text': 'Fill the form in 60 seconds and register for free. Let AI Captain send boaters straight to you.',
        'headline': 'Empty Berths = Lost Revenue',
        'desc': 'Free. Fill form in 60 seconds.',
    },
    {
        'id': 'AD-03',
        'hook': 'Is your marina sinking into emptiness? AI Captain is the savior: boaters arrive, revenue grows.',
        'body': V1,
        'cta_text': 'Join the revolution today -- register your berths for free in mooring-booking and secure higher revenue this season.',
        'headline': 'Join the Revolution Today',
        'desc': 'Free listing. Join the revolution.',
    },
    {
        'id': 'AD-04',
        'hook': 'Your mooring fields, anchorages and docks standing empty? AI Captain saves everything -- brings boaters and increases your income.',
        'body': V2,
        'cta_text': "Don't let the competition be faster -- fill the form and register all berths for free now.",
        'headline': 'Earn With Zero Upfront Cost',
        'desc': 'Free listing. 15% per booking.',
    },
    {
        'id': 'AD-05',
        'hook': 'Concession paid, but berths empty? AI Captain saves your business -- brings boaters directly to you.',
        'body': V2,
        'cta_text': 'Do it for free today -- register your berths in the mooring-booking database and let AI Captain work for you.',
        'headline': 'Zero Risk. Register Free Today.',
        'desc': 'Free to list. Pay 15% only.',
    },
    {
        'id': 'AD-06',
        'hook': 'Boats pass by while you lose money? AI Captain saves your docks and berths -- brings boaters and fills the cash register.',
        'body': V1,
        'cta_text': "Don't miss this opportunity -- register your berths for free right now and become visible.",
        'headline': 'Register Free -- Become Visible',
        'desc': 'Free listing. Become visible now.',
    },
    {
        'id': 'AD-07',
        'hook': 'AI Captain -- the best friend of your nautical business! Saves mooring fields and anchorages, brings boaters and raises revenue.',
        'body': V3,
        'cta_text': 'Join the revolution for free -- fill the form and register your berths in mooring-booking now.',
        'headline': 'Join the Revolution for Free',
        'desc': 'Free. Priority for first movers.',
    },
    {
        'id': 'AD-08',
        'hook': "Marina owners -- it's time for rescue. AI Captain brings boaters and turns empty docks into higher revenue.",
        'body': V3,
        'cta_text': "Don't wait for next season -- register your berths for free in the database and start earning more this year.",
        'headline': "Don't Wait for Next Season",
        'desc': 'Free listing. Start earning now.',
    },
    {
        'id': 'AD-09',
        'hook': 'Your berths invisible? Losing the season? AI Captain saves everything -- boaters arrive, revenue explodes.',
        'body': V2,
        'cta_text': 'Be first -- fill the form in 30 seconds and register them for free in mooring-booking.',
        'headline': 'Invisible to Sailors? Not Anymore.',
        'desc': 'You keep 85%. Free to list.',
    },
    {
        'id': 'AD-10',
        'hook': 'Full marina or season bankruptcy? AI Captain saves marinas and berth owners -- brings boaters and increases revenue!',
        'body': V3,
        'cta_text': 'Choose a full marina -- register all your berths for free in the mooring-booking database right now.',
        'headline': 'Choose: Full Marina or Empty Season',
        'desc': 'Season starts Apr 2. Join free.',
    },
]

# ── HELPERS ───────────────────────────────────────────────────────────────────
def post(ep, data):
    data['access_token'] = TOKEN
    url = f'{API}/{ep}'
    try:
        r = requests.post(url, data=data)
        if r.status_code == 200:
            return r.json()
        print(f'  ERR {r.status_code}: {r.text[:500]}')
        return None
    except Exception as e:
        print(f'  EXCEPTION: {e}')
        return None

def sep(msg):
    print(f'\n{"="*60}\n  {msg}\n{"="*60}')

# ── STEP 1: Instant Form vec kreirana ──────────────────────────────────────────
# Form ID: 983498541004318 (Marina Provider Registration Form)
FORM_ID = '983498541004318'
sep('STEP 1: Using existing Lead Form')
print(f'  Lead Form ID: {FORM_ID}')

# ── STEP 2: Kreiraj nove ad creative sa instant formom ─────────────────────────
sep('STEP 2: Create ad creatives with Instant Form')
creatives = {}

for ad in ADS:
    ad_id = ad['id']
    if ad_id not in IMAGE_HASHES:
        print(f'  SKIP {ad_id} - no image hash in hook_ads_result.json')
        continue

    primary_text = f"{ad['hook']}\n\n{ad['body']}\n\n{ad['cta_text']}"

    spec = json.dumps({
        'page_id': PAGE_ID,
        'link_data': {
            'image_hash': IMAGE_HASHES[ad_id],
            'link': 'https://mooring-booking.com/become-provider',
            'message': primary_text,
            'name': ad['headline'],
            'description': ad['desc'],
            'call_to_action': {
                'type': 'SIGN_UP',
                'value': {
                    'lead_gen_form_id': FORM_ID,
                },
            },
        },
    })

    res = post(f'{ACCOUNT}/adcreatives', {
        'name': f'LeadForm_{ad_id}_{ad["headline"][:30]}',
        'object_story_spec': spec,
    })

    if res and 'id' in res:
        creatives[ad_id] = res['id']
        print(f'  {ad_id}: creative {res["id"]} OK')
    else:
        print(f'  {ad_id}: FAILED FAILED')
    time.sleep(0.5)

print(f'\nCreated {len(creatives)}/10 creatives')

if len(creatives) == 0:
    print('No creatives created. Aborting.')
    exit(1)

# ── STEP 3: Kreiraj adsove u sva 4 adseta ─────────────────────────────────────
sep('STEP 3: Create ads in all 4 adsets')
created_ads = {}
total = 0

for adset_name, adset_id in ADSETS.items():
    print(f'\n  Adset: {adset_name} ({adset_id})')
    created_ads[adset_name] = []

    for ad in ADS:
        ad_id = ad['id']
        if ad_id not in creatives:
            print(f'    SKIP {ad_id} - no creative')
            continue

        res = post(f'{ACCOUNT}/ads', {
            'name': f'LF_{ad_id}_{adset_name}_{ad["headline"][:20]}',
            'adset_id': adset_id,
            'creative': json.dumps({'creative_id': creatives[ad_id]}),
            'status': 'ACTIVE',
        })

        if res and 'id' in res:
            created_ads[adset_name].append({'ad_id': res['id'], 'creative': ad_id})
            total += 1
            print(f'    {ad_id} -> ad {res["id"]} OK ACTIVE')
        else:
            print(f'    {ad_id}: FAILED FAILED')
        time.sleep(0.3)

# ── SAVE RESULTS ─────────────────────────────────────────────────────────────
sep('RESULTS')
results = {
    'lead_form_id': FORM_ID,
    'creatives': creatives,
    'ads': created_ads,
    'total_ads_created': total,
}
with open('instant_form_ads_result.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f'\nLead Form ID: {FORM_ID}')
print(f'Total ads created: {total} (10 creatives x 4 adsets = 40 expected)')
print(f'Status: ACTIVE')
print('Results saved: instant_form_ads_result.json')
