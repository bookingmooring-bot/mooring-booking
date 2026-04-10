"""
Mooring Booking — Upload 10 Hook Image Ads to Meta Ads
=======================================================
Dodaje 10 hook kreativa u sve 4 postojece adsetove.
Svaki ad = hook slika + finalni copy (3 varijante) + CTA.

VAR1 (AI Captain journey): AD-01, 02, 03, 06
VAR2 (Free + 15% + AI search): AD-04, 05, 09
VAR3 (First-mover FOMO): AD-07, 08, 10
"""
import requests, json, os, time

# ── CONFIG ────────────────────────────────────────────────────────────────────
TOKEN   = 'EAAWVZAaTfakYBRNqy6sCKDEDMc2S5dNYNIgb7pVtWr5wOc4dj9aHOT0GoPgZAkMaxWh1EHfsEB3OD7Tkx7BigxGlqFArBgUn3wwtd8tS0QhZBJgg91RfqmcDByffERVGLM0UpItk1td0tcf48X1Ri469FYmPfL9AB3ZBwnmCizVIz28UToVwC2PAy37eVaPdDbkZALZBQ4lX2W90yh'
ACCOUNT = 'act_3100835596778287'
PAGE_ID = '1019158577946111'
API     = 'https://graph.facebook.com/v21.0'
LANDING = 'https://mooring-booking.com/become-provider'
IMG_DIR = 'D:/Desktop/Aplikacije1/Mooring Booking/ad-visuals-week1-hooks'

# Postojeci adsetovi (sve 4 grupe)
ADSETS = {
    'hr_it':    '120245136883010750',
    'gr':       '120245136884040750',
    'es_fr_tr': '120245136885110750',
    'si_al_cy': '120245136885850750',
}

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
        'id': 'AD-01', 'file': 'ad-01-ai-captain-saves-marina.png',
        'hook': 'AI Captain saves your marina! Brings boaters, fills berths and boosts your revenue.',
        'body': V1,
        'cta_text': 'Register your berths for free in the mooring-booking database now and be the first recommended by AI Captain.',
        'headline': 'Fill Your Berths This Season',
        'desc': 'Free listing. Be first. 15% only.',
        'cta_type': 'SIGN_UP',
    },
    {
        'id': 'AD-02', 'file': 'ad-02-empty-berths-revenue.png',
        'hook': 'Empty berths killing your revenue? AI Captain saves them -- brings boaters and increases earnings.',
        'body': V1,
        'cta_text': 'Fill the form in 60 seconds and register for free. Let AI Captain send boaters straight to you.',
        'headline': 'Empty Berths = Lost Revenue',
        'desc': 'Free. Fill form in 60 seconds.',
        'cta_type': 'SIGN_UP',
    },
    {
        'id': 'AD-03', 'file': 'ad-03-sinking-emptiness.png',
        'hook': 'Is your marina sinking into emptiness? AI Captain is the savior: boaters arrive, revenue grows.',
        'body': V1,
        'cta_text': 'Join the revolution today -- register your berths for free in mooring-booking and secure higher revenue this season.',
        'headline': 'Join the Revolution Today',
        'desc': 'Free listing. Join the revolution.',
        'cta_type': 'SIGN_UP',
    },
    {
        'id': 'AD-04', 'file': 'ad-04-mooring-fields-empty.png',
        'hook': 'Your mooring fields, anchorages and docks standing empty? AI Captain saves everything -- brings boaters and increases your income.',
        'body': V2,
        'cta_text': "Don't let the competition be faster -- fill the form and register all berths for free now.",
        'headline': 'Earn With Zero Upfront Cost',
        'desc': 'Free listing. 15% per booking.',
        'cta_type': 'SIGN_UP',
    },
    {
        'id': 'AD-05', 'file': 'ad-05-concession-paid.png',
        'hook': 'Concession paid, but berths empty? AI Captain saves your business -- brings boaters directly to you.',
        'body': V2,
        'cta_text': 'Do it for free today -- register your berths in the mooring-booking database and let AI Captain work for you.',
        'headline': 'Zero Risk. Register Free Today.',
        'desc': 'Free to list. Pay 15% only.',
        'cta_type': 'SIGN_UP',
    },
    {
        'id': 'AD-06', 'file': 'ad-06-boats-pass-by.png',
        'hook': 'Boats pass by while you lose money? AI Captain saves your docks and berths -- brings boaters and fills the cash register.',
        'body': V1,
        'cta_text': "Don't miss this opportunity -- register your berths for free right now and become visible.",
        'headline': 'Register Free -- Become Visible',
        'desc': 'Free listing. Become visible now.',
        'cta_type': 'SIGN_UP',
    },
    {
        'id': 'AD-07', 'file': 'ad-07-best-friend-business.png',
        'hook': 'AI Captain -- the best friend of your nautical business! Saves mooring fields and anchorages, brings boaters and raises revenue.',
        'body': V3,
        'cta_text': 'Join the revolution for free -- fill the form and register your berths in mooring-booking now.',
        'headline': 'Join the Revolution for Free',
        'desc': 'Free. Priority for first movers.',
        'cta_type': 'SIGN_UP',
    },
    {
        'id': 'AD-08', 'file': 'ad-08-marina-owners-rescue.png',
        'hook': "Marina owners -- it's time for rescue. AI Captain brings boaters and turns empty docks into higher revenue.",
        'body': V3,
        'cta_text': "Don't wait for next season -- register your berths for free in the database and start earning more this year.",
        'headline': "Don't Wait for Next Season",
        'desc': 'Free listing. Start earning now.',
        'cta_type': 'SIGN_UP',
    },
    {
        'id': 'AD-09', 'file': 'ad-09-berths-invisible.png',
        'hook': 'Your berths invisible? Losing the season? AI Captain saves everything -- boaters arrive, revenue explodes.',
        'body': V2,
        'cta_text': 'Be first -- fill the form in 30 seconds and register them for free in mooring-booking.',
        'headline': 'Invisible to Sailors? Not Anymore.',
        'desc': 'You keep 85%. Free to list.',
        'cta_type': 'SIGN_UP',
    },
    {
        'id': 'AD-10', 'file': 'ad-10-full-marina-bankruptcy.png',
        'hook': 'Full marina or season bankruptcy? AI Captain saves marinas and berth owners -- brings boaters and increases revenue!',
        'body': V3,
        'cta_text': 'Choose a full marina -- register all your berths for free in the mooring-booking database right now.',
        'headline': 'Choose: Full Marina or Empty Season',
        'desc': 'Season starts Apr 2. Join free.',
        'cta_type': 'SIGN_UP',
    },
]

# ── HELPERS ───────────────────────────────────────────────────────────────────
def post(ep, data, files=None):
    data['access_token'] = TOKEN
    url = f'{API}/{ep}'
    try:
        if files:
            r = requests.post(url, data=data, files=files)
        else:
            r = requests.post(url, data=data)
        if r.status_code == 200:
            return r.json()
        print(f'  ERR {r.status_code}: {r.text[:400]}')
        return None
    except Exception as e:
        print(f'  EXCEPTION: {e}')
        return None

def sep(msg):
    print(f'\n{"="*60}\n  {msg}\n{"="*60}')

# ── STEP 1: Upload images ─────────────────────────────────────────────────────
sep('STEP 1: Upload hook images to Meta')
image_hashes = {}

for ad in ADS:
    img_path = os.path.join(IMG_DIR, ad['file'])
    if not os.path.exists(img_path):
        print(f'  MISSING: {img_path}')
        continue
    with open(img_path, 'rb') as f:
        res = post(f'{ACCOUNT}/adimages', {'filename': ad['file']}, files={'file': (ad['file'], f, 'image/png')})
    if res and 'images' in res:
        h = list(res['images'].values())[0]['hash']
        image_hashes[ad['id']] = h
        print(f'  {ad["id"]}: uploaded -> hash {h}')
    elif res and 'images' in str(res):
        print(f'  {ad["id"]}: response -> {res}')
    else:
        print(f'  {ad["id"]}: FAILED')
    time.sleep(0.5)

print(f'\nUploaded {len(image_hashes)}/10 images')

# ── STEP 2: Create ad creatives ───────────────────────────────────────────────
sep('STEP 2: Create ad creatives')
creatives = {}

for ad in ADS:
    if ad['id'] not in image_hashes:
        print(f'  SKIP {ad["id"]} - no image hash')
        continue

    primary_text = f"{ad['hook']}\n\n{ad['body']}\n\n{ad['cta_text']}"

    spec = json.dumps({
        'page_id': PAGE_ID,
        'link_data': {
            'image_hash': image_hashes[ad['id']],
            'link': LANDING,
            'message': primary_text,
            'name': ad['headline'],
            'description': ad['desc'],
            'call_to_action': {
                'type': ad['cta_type'],
                'value': {'link': LANDING}
            },
        }
    })

    res = post(f'{ACCOUNT}/adcreatives', {
        'name': f'Hook_{ad["id"]}_{ad["headline"][:30]}',
        'object_story_spec': spec,
    })

    if res and 'id' in res:
        creatives[ad['id']] = res['id']
        print(f'  {ad["id"]}: creative {res["id"]} OK')
    else:
        print(f'  {ad["id"]}: creative FAILED')
    time.sleep(0.5)

print(f'\nCreated {len(creatives)}/10 creatives')

# ── STEP 3: Create ads in all 4 adsets ───────────────────────────────────────
sep('STEP 3: Create ads in all 4 adsets')
created_ads = {}

for adset_name, adset_id in ADSETS.items():
    print(f'\n  Adset: {adset_name} ({adset_id})')
    created_ads[adset_name] = []

    for ad in ADS:
        if ad['id'] not in creatives:
            print(f'    SKIP {ad["id"]} - no creative')
            continue

        res = post(f'{ACCOUNT}/ads', {
            'name': f'{ad["id"]}_{adset_name}_{ad["headline"][:25]}',
            'adset_id': adset_id,
            'creative': json.dumps({'creative_id': creatives[ad['id']]}),
            'status': 'PAUSED',  # PAUSED da pregledas prije aktiviranja
        })

        if res and 'id' in res:
            created_ads[adset_name].append({'ad_id': res['id'], 'creative': ad['id']})
            print(f'    {ad["id"]} -> ad {res["id"]} (PAUSED)')
        else:
            print(f'    {ad["id"]}: FAILED')
        time.sleep(0.3)

# ── SAVE RESULTS ─────────────────────────────────────────────────────────────
sep('RESULTS')
results = {
    'image_hashes': image_hashes,
    'creatives': creatives,
    'ads': created_ads,
    'total_ads_created': sum(len(v) for v in created_ads.values()),
}
with open('hook_ads_result.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f'\nTotal ads created: {results["total_ads_created"]} (10 creatives x 4 adsets = 40 expected)')
print('Status: PAUSED -- pregledaj u Meta Ads Manager pa aktiviraj rucno')
print('Results saved: hook_ads_result.json')
