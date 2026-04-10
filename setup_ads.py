"""
Mooring Booking — Complete Meta Ads Setup
=========================================
Kampanje:
  1. Leads: HR + IT    →  €200/mj  (~€6.67/day)
  2. Leads: Greece     →  €150/mj  (~€5/day)
  3. Traffic: ES+FR+TR →  €150/mj  (~€5/day)
  4. Leads: SI+AL+CY   →  €100/mj  (~€3.33/day)
Ukupno: €600/mj (€100 rezerva)

Kreativni:
  - Reel7Walkthrough.mp4      (9:16 vertical)
  - Reel8WalkthroughLandscape.mp4  (16:9 landscape)
  - Banner sqaure 1080x1080
  - Banner vertical 1080x1920
  - Banner landscape 1200x628
"""

import urllib.request, urllib.parse, json, os, time
import requests
from PIL import Image, ImageDraw, ImageFont
import io, mimetypes

# ─── CONFIG ─────────────────────────────────────────────────────────────────
TOKEN   = 'EAAWVZAaTfakYBRNqy6sCKDEDMc2S5dNYNIgb7pVtWr5wOc4dj9aHOT0GoPgZAkMaxWh1EHfsEB3OD7Tkx7BigxGlqFArBgUn3wwtd8tS0QhZBJgg91RfqmcDByffERVGLM0UpItk1td0tcf48X1Ri469FYmPfL9AB3ZBwnmCizVIz28UToVwC2PAy37eVaPdDbkZALZBQ4lX2W90yh'
ACCOUNT = 'act_3100835596778287'
PAGE_ID = '1019158577946111'
IG_ID   = '17841443429754877'
API     = 'https://graph.facebook.com/v18.0'
VAPI    = 'https://graph-video.facebook.com/v18.0'

LOGO_PATH = 'D:/Desktop/Aplikacije1/Mooring Booking/public/logo.jpg'
VIDEO1    = 'D:/Desktop/Aplikacije1/Mooring Booking/Reel7Walkthrough.mp4'
VIDEO2    = 'D:/Desktop/Aplikacije1/Mooring Booking/Reel8WalkthroughLandscape.mp4'

LANDING_URL = 'https://mooring-booking.com/become-provider'

# ─── COLORS ─────────────────────────────────────────────────────────────────
NAVY    = (15, 90, 140)
NAVYDARK= (8, 55, 90)
WHITE   = (255, 255, 255)
GOLD    = (212, 175, 55)
LIGHT   = (230, 243, 255)

results = {}

# ─── HELPERS ────────────────────────────────────────────────────────────────
def api_post(endpoint, data, files=None):
    data['access_token'] = TOKEN
    url = f'{API}/{endpoint}'
    try:
        if files:
            r = requests.post(url, data=data, files=files)
        else:
            r = requests.post(url, data=data)
        if r.status_code == 200:
            return r.json()
        else:
            print(f'  ERROR {r.status_code}: {r.text[:300]}')
            return None
    except Exception as e:
        print(f'  EXCEPTION: {e}')
        return None

def api_post_video(account_id, fname, fdata):
    boundary = b'----VideoBoundary'
    body = b''
    for k, v in {'access_token': TOKEN}.items():
        body += b'--' + boundary + b'\r\n'
        body += f'Content-Disposition: form-data; name="{k}"\r\n\r\n'.encode()
        body += str(v).encode() + b'\r\n'
    body += b'--' + boundary + b'\r\n'
    body += f'Content-Disposition: form-data; name="source"; filename="{fname}"\r\n'.encode()
    body += b'Content-Type: video/mp4\r\n\r\n'
    body += fdata + b'\r\n'
    body += b'--' + boundary + b'--\r\n'
    req = urllib.request.Request(
        f'{VAPI}/{account_id}/advideos',
        data=body,
        headers={'Content-Type': f'multipart/form-data; boundary={boundary.decode()}'},
        method='POST'
    )
    try:
        res = urllib.request.urlopen(req, timeout=300)
        return json.loads(res.read())
    except urllib.error.HTTPError as e:
        print(f'  VIDEO ERROR {e.code}: {e.read().decode()[:300]}')
        return None

def step(msg):
    print(f'\n{"─"*60}')
    print(f'  {msg}')
    print(f'{"─"*60}')

# ─── STEP 1: CREATE BANNERS ──────────────────────────────────────────────────
step('1. Kreiranje banner slika')

logo_img = Image.open(LOGO_PATH).convert('RGBA')

def add_logo(draw_img, logo, x, y, max_w=220):
    ratio = max_w / logo.width
    new_h = int(logo.height * ratio)
    logo_r = logo.resize((max_w, new_h), Image.LANCZOS)
    draw_img.paste(logo_r, (x, y), logo_r if logo_r.mode == 'RGBA' else None)
    return new_h

def banner_square():
    """1080x1080 — Feed"""
    img = Image.new('RGB', (1080, 1080), NAVYDARK)
    draw = ImageDraw.Draw(img)

    # Top gradient bar
    for i in range(200):
        alpha = int(255 * (1 - i/200))
        draw.line([(0, i), (1080, i)], fill=tuple(int(c * alpha/255 + NAVYDARK[j] * (1-alpha/255)) for j, c in enumerate(NAVY)))

    # Gold accent line
    draw.rectangle([0, 195, 1080, 202], fill=GOLD)

    # Logo top center
    logo_w = 280
    logo_ratio = logo_w / logo_img.width
    logo_h = int(logo_img.height * logo_ratio)
    logo_r = logo_img.resize((logo_w, logo_h), Image.LANCZOS)
    img.paste(logo_r, (1080//2 - logo_w//2, 30), logo_r if logo_r.mode == 'RGBA' else None)

    # Main headline
    try:
        font_big = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 78)
        font_med = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 46)
        font_sm  = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 36)
        font_cta = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 44)
    except:
        font_big = font_med = font_sm = font_cta = ImageFont.load_default()

    # "Earn money" headline
    draw.text((540, 280), "Earn money", font=font_big, fill=GOLD, anchor='mm')
    draw.text((540, 375), "from your mooring", font=font_big, fill=WHITE, anchor='mm')

    # Subtext
    draw.text((540, 490), "List your berth. Sailors book online.", font=font_med, fill=LIGHT, anchor='mm')
    draw.text((540, 555), "No commission on first 3 bookings.", font=font_sm, fill=(180, 210, 240), anchor='mm')

    # Divider
    draw.rectangle([140, 620, 940, 624], fill=GOLD)

    # Stats row
    stats = [("€0", "setup fee"), ("24/7", "bookings"), ("100%", "free to list")]
    for i, (val, lbl) in enumerate(stats):
        x = 200 + i * 340
        draw.text((x, 670), val, font=font_big, fill=GOLD, anchor='mm')
        draw.text((x, 740), lbl, font=font_sm, fill=WHITE, anchor='mm')

    # CTA button
    draw.rounded_rectangle([290, 820, 790, 910], radius=20, fill=GOLD)
    draw.text((540, 865), "List Your Mooring", font=font_cta, fill=NAVYDARK, anchor='mm')

    # URL
    draw.text((540, 960), "mooring-booking.com", font=font_sm, fill=(150, 200, 240), anchor='mm')

    path = 'D:/Desktop/Aplikacije1/Mooring Booking/banner_square.png'
    img.save(path, quality=95)
    print(f'  Saved: banner_square.png')
    return path

def banner_vertical():
    """1080x1920 — Stories/Reels"""
    img = Image.new('RGB', (1080, 1920), NAVYDARK)
    draw = ImageDraw.Draw(img)

    try:
        font_xl  = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 90)
        font_big = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 72)
        font_med = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 50)
        font_sm  = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 40)
        font_cta = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 54)
    except:
        font_xl = font_big = font_med = font_sm = font_cta = ImageFont.load_default()

    # Gold top bar
    draw.rectangle([0, 0, 1080, 8], fill=GOLD)

    # Logo
    logo_w = 320
    logo_ratio = logo_w / logo_img.width
    logo_h = int(logo_img.height * logo_ratio)
    logo_r = logo_img.resize((logo_w, logo_h), Image.LANCZOS)
    img.paste(logo_r, (1080//2 - logo_w//2, 80), logo_r if logo_r.mode == 'RGBA' else None)

    # Headline
    draw.text((540, 420), "Got a mooring?", font=font_xl, fill=GOLD, anchor='mm')
    draw.text((540, 530), "Make it work for you.", font=font_big, fill=WHITE, anchor='mm')

    # Divider
    draw.rectangle([200, 620, 880, 626], fill=GOLD)

    # Steps
    steps = [
        ("01", "List your berth for free"),
        ("02", "Sailors find & book it"),
        ("03", "You earn — we handle payments"),
    ]
    y = 680
    for num, txt in steps:
        draw.text((130, y), num, font=font_big, fill=GOLD, anchor='lm')
        draw.text((230, y), txt, font=font_med, fill=WHITE, anchor='lm')
        y += 130

    # Stats
    draw.rectangle([80, 1100, 1000, 1400], fill=(20, 60, 100))
    draw.rounded_rectangle([80, 1100, 1000, 1400], radius=24, fill=(20, 60, 100))
    stats = [("70+", "providers"), ("Adriatic", "coverage"), ("€0", "to start")]
    for i, (val, lbl) in enumerate(stats):
        x = 220 + i * 290
        draw.text((x, 1200), val, font=font_big, fill=GOLD, anchor='mm')
        draw.text((x, 1300), lbl, font=font_sm, fill=WHITE, anchor='mm')

    # CTA
    draw.rounded_rectangle([140, 1500, 940, 1630], radius=30, fill=GOLD)
    draw.text((540, 1565), "Start Earning Today", font=font_cta, fill=NAVYDARK, anchor='mm')

    # URL
    draw.text((540, 1720), "mooring-booking.com", font=font_med, fill=(150, 200, 240), anchor='mm')

    # Gold bottom bar
    draw.rectangle([0, 1912, 1080, 1920], fill=GOLD)

    path = 'D:/Desktop/Aplikacije1/Mooring Booking/banner_vertical.png'
    img.save(path, quality=95)
    print(f'  Saved: banner_vertical.png')
    return path

def banner_landscape():
    """1200x628 — Traffic / Link ads"""
    img = Image.new('RGB', (1200, 628), NAVYDARK)
    draw = ImageDraw.Draw(img)

    try:
        font_big = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 64)
        font_med = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 36)
        font_sm  = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 28)
        font_cta = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 38)
    except:
        font_big = font_med = font_sm = font_cta = ImageFont.load_default()

    # Left navy panel
    draw.rectangle([0, 0, 500, 628], fill=NAVY)
    draw.rectangle([498, 0, 502, 628], fill=GOLD)

    # Logo left
    logo_w = 200
    logo_ratio = logo_w / logo_img.width
    logo_h = int(logo_img.height * logo_ratio)
    logo_r = logo_img.resize((logo_w, logo_h), Image.LANCZOS)
    img.paste(logo_r, (150, 40), logo_r if logo_r.mode == 'RGBA' else None)

    draw.text((250, 200), "List Your", font=font_big, fill=GOLD, anchor='mm')
    draw.text((250, 280), "Mooring", font=font_big, fill=WHITE, anchor='mm')
    draw.text((250, 360), "Earn while away", font=font_med, fill=LIGHT, anchor='mm')

    # Right panel
    draw.text((850, 120), "Your berth earns.", font=font_big, fill=WHITE, anchor='mm')
    draw.text((850, 200), "You relax.", font=font_big, fill=GOLD, anchor='mm')

    # Mini stats
    draw.text((720, 310), "Free listing", font=font_sm, fill=LIGHT, anchor='lm')
    draw.text((720, 360), "Instant payouts", font=font_sm, fill=LIGHT, anchor='lm')
    draw.text((720, 410), "70+ providers on Adriatic", font=font_sm, fill=LIGHT, anchor='lm')

    # CTA
    draw.rounded_rectangle([660, 470, 1040, 560], radius=16, fill=GOLD)
    draw.text((850, 515), "Join Free", font=font_cta, fill=NAVYDARK, anchor='mm')

    path = 'D:/Desktop/Aplikacije1/Mooring Booking/banner_landscape.png'
    img.save(path, quality=95)
    print(f'  Saved: banner_landscape.png')
    return path

sq_path  = banner_square()
vert_path = banner_vertical()
land_path = banner_landscape()
print('  Banneri kreirani.')

# ─── STEP 2: UPLOAD IMAGES TO META ──────────────────────────────────────────
step('2. Upload slika na Meta')

img_hashes = {}
for label, path in [('square', sq_path), ('vertical', vert_path), ('landscape', land_path)]:
    fname = os.path.basename(path)
    with open(path, 'rb') as f:
        fdata = f.read()
    res = api_post(f'{ACCOUNT}/adimages', {}, files={
        fname: (fname, fdata, 'image/png')
    })
    if res and 'images' in res:
        img_data = list(res['images'].values())[0]
        h = img_data.get('hash') or img_data.get('image_hash')
        img_hashes[label] = h
        print(f'  {label}: hash={h}')
    else:
        print(f'  {label} upload failed: {res}')

print('  Image hashes:', img_hashes)

# ─── STEP 3: UPLOAD VIDEOS ──────────────────────────────────────────────────
step('3. Upload videa na Meta (ovo traje ~2-3 min)')

video_ids = {}
for label, path in [('reel7_vertical', VIDEO1), ('reel8_landscape', VIDEO2)]:
    print(f'  Uploading {label} ({os.path.getsize(path)//1024//1024}MB)...')
    with open(path, 'rb') as f:
        fdata = f.read()
    fname = os.path.basename(path)
    res = api_post_video(ACCOUNT, fname, fdata)
    if res and 'id' in res:
        video_ids[label] = res['id']
        print(f'  {label}: video_id={res["id"]}')
    else:
        print(f'  {label} upload failed: {res}')

print('  Video IDs:', video_ids)

# ─── STEP 4: CREATE AD CREATIVES ─────────────────────────────────────────────
step('4. Kreiranje ad kreativa')

def make_creative(name, video_id=None, img_hash=None, title='', body='', cta='SIGN_UP'):
    spec = {}
    if video_id:
        spec = {
            'video_data': json.dumps({
                'video_id': video_id,
                'call_to_action': {'type': cta, 'value': {'link': LANDING_URL}},
                'title': title,
                'message': body,
            })
        }
        data = {
            'name': name,
            'object_story_spec': json.dumps({
                'page_id': PAGE_ID,
                'video_data': {
                    'video_id': video_id,
                    'call_to_action': {'type': cta, 'value': {'link': LANDING_URL}},
                    'title': title,
                    'message': body,
                }
            }),
        }
    elif img_hash:
        data = {
            'name': name,
            'object_story_spec': json.dumps({
                'page_id': PAGE_ID,
                'link_data': {
                    'image_hash': img_hash,
                    'link': LANDING_URL,
                    'message': body,
                    'name': title,
                    'call_to_action': {'type': cta, 'value': {'link': LANDING_URL}},
                }
            }),
        }
    else:
        return None

    res = api_post(f'{ACCOUNT}/adcreatives', data)
    if res and 'id' in res:
        print(f'  Creative "{name}": id={res["id"]}')
        return res['id']
    else:
        print(f'  Creative "{name}" failed: {res}')
        return None

creatives = {}

# Video creatives
if video_ids.get('reel7_vertical'):
    creatives['reel7_leads'] = make_creative(
        'Reel7 Vertical - Leads',
        video_id=video_ids['reel7_vertical'],
        title='Earn from your mooring',
        body='List your berth for free. Sailors book online. You get paid. No commission on first 3 bookings.',
        cta='SIGN_UP'
    )

if video_ids.get('reel8_landscape'):
    creatives['reel8_traffic'] = make_creative(
        'Reel8 Landscape - Traffic',
        video_id=video_ids['reel8_landscape'],
        title='Your mooring earns while you\'re away',
        body='Join 70+ providers on Adriatic. List for free at mooring-booking.com',
        cta='LEARN_MORE'
    )

# Banner creatives
if img_hashes.get('square'):
    creatives['banner_square_leads'] = make_creative(
        'Banner Square - Leads',
        img_hash=img_hashes['square'],
        title='Earn money from your mooring',
        body='List your berth for free. Sailors find and book it online. Join 70+ providers on the Adriatic.',
        cta='SIGN_UP'
    )

if img_hashes.get('vertical'):
    creatives['banner_vertical_leads'] = make_creative(
        'Banner Vertical - Leads',
        img_hash=img_hashes['vertical'],
        title='Got a mooring? Make it work for you.',
        body='Free listing. Instant payouts. No commission on first 3 bookings.',
        cta='SIGN_UP'
    )

if img_hashes.get('landscape'):
    creatives['banner_landscape_traffic'] = make_creative(
        'Banner Landscape - Traffic',
        img_hash=img_hashes['landscape'],
        title='Your berth earns. You relax.',
        body='List your mooring for free. Join mooring-booking.com',
        cta='LEARN_MORE'
    )

print('  Kreativni:', {k: v for k, v in creatives.items() if v})

# ─── STEP 5: CREATE CAMPAIGNS ────────────────────────────────────────────────
step('5. Kreiranje kampanja (PAUSED)')

def create_campaign(name, objective, daily_cents):
    res = api_post(f'{ACCOUNT}/campaigns', {
        'name': name,
        'objective': objective,
        'status': 'PAUSED',
        'daily_budget': daily_cents,
        'special_ad_categories': '[]',
        'bid_strategy': 'LOWEST_COST_WITHOUT_CAP',
    })
    if res and 'id' in res:
        print(f'  Campaign "{name}": id={res["id"]}')
        return res['id']
    print(f'  Campaign failed: {res}')
    return None

campaigns = {}
campaigns['hr_it_leads']   = create_campaign('Leads - HR + IT',           'OUTCOME_LEADS',   667)
campaigns['gr_leads']      = create_campaign('Leads - Greece',             'OUTCOME_LEADS',   500)
campaigns['es_fr_tr_traf'] = create_campaign('Traffic - ES + FR + TR',    'OUTCOME_TRAFFIC', 500)
campaigns['si_al_cy_leads']= create_campaign('Leads - SI + AL + CY',      'OUTCOME_LEADS',   333)

print('  Campaigns:', campaigns)

# ─── STEP 6: CREATE AD SETS ──────────────────────────────────────────────────
step('6. Kreiranje ad setova')

def create_adset(name, campaign_id, countries, optimization, billing, daily_cents, objective):
    targeting = {
        'geo_locations': {
            'countries': countries,
            'location_types': ['home', 'recent']
        },
        'age_min': 25,
        'age_max': 65,
        'brand_safety_content_filter_levels': ['FACEBOOK_STANDARD'],
        'targeting_optimization': 'none',
    }

    data = {
        'name': name,
        'campaign_id': campaign_id,
        'daily_budget': daily_cents,
        'billing_event': billing,
        'optimization_goal': optimization,
        'targeting': json.dumps(targeting),
        'status': 'PAUSED',
        'configured_status': 'PAUSED',
        'is_dynamic_creative': 'false',
        'recurring_budget_semantics': 'false',
        'use_new_app_click': 'false',
        'destination_type': 'WEBSITE' if objective == 'OUTCOME_TRAFFIC' else 'UNDEFINED',
        'attribution_spec': json.dumps([{'event_type': 'CLICK_THROUGH', 'window_days': 7}]),
    }

    if objective == 'OUTCOME_LEADS':
        data['optimization_goal'] = 'LEAD_GENERATION'
        data['promoted_object'] = json.dumps({'page_id': PAGE_ID})

    res = api_post(f'{ACCOUNT}/adsets', data)
    if res and 'id' in res:
        print(f'  AdSet "{name}": id={res["id"]}')
        return res['id']
    print(f'  AdSet failed: {res}')
    return None

adsets = {}
if campaigns.get('hr_it_leads'):
    adsets['hr_it'] = create_adset(
        'HR + IT - 25-65', campaigns['hr_it_leads'],
        ['HR', 'IT'], 'LEAD_GENERATION', 'IMPRESSIONS', 667, 'OUTCOME_LEADS'
    )
if campaigns.get('gr_leads'):
    adsets['gr'] = create_adset(
        'Greece - 25-65', campaigns['gr_leads'],
        ['GR'], 'LEAD_GENERATION', 'IMPRESSIONS', 500, 'OUTCOME_LEADS'
    )
if campaigns.get('es_fr_tr_traf'):
    adsets['es_fr_tr'] = create_adset(
        'ES + FR + TR - 25-65', campaigns['es_fr_tr_traf'],
        ['ES', 'FR', 'TR'], 'LINK_CLICKS', 'IMPRESSIONS', 500, 'OUTCOME_TRAFFIC'
    )
if campaigns.get('si_al_cy_leads'):
    adsets['si_al_cy'] = create_adset(
        'SI + AL + CY - 25-65', campaigns['si_al_cy_leads'],
        ['SI', 'AL', 'CY'], 'LEAD_GENERATION', 'IMPRESSIONS', 333, 'OUTCOME_LEADS'
    )

print('  AdSets:', adsets)

# ─── STEP 7: CREATE ADS ──────────────────────────────────────────────────────
step('7. Kreiranje oglasa')

def create_ad(name, adset_id, creative_id):
    res = api_post(f'{ACCOUNT}/ads', {
        'name': name,
        'adset_id': adset_id,
        'creative': json.dumps({'creative_id': creative_id}),
        'status': 'PAUSED',
    })
    if res and 'id' in res:
        print(f'  Ad "{name}": id={res["id"]}')
        return res['id']
    print(f'  Ad failed: {res}')
    return None

ads = {}

# HR+IT: video reel7 + banner square
if adsets.get('hr_it'):
    if creatives.get('reel7_leads'):
        ads['hr_it_video'] = create_ad('HR+IT - Reel7 Vertical', adsets['hr_it'], creatives['reel7_leads'])
    if creatives.get('banner_square_leads'):
        ads['hr_it_banner'] = create_ad('HR+IT - Banner Square', adsets['hr_it'], creatives['banner_square_leads'])

# Greece: reel7 + banner vertical
if adsets.get('gr'):
    if creatives.get('reel7_leads'):
        ads['gr_video'] = create_ad('GR - Reel7 Vertical', adsets['gr'], creatives['reel7_leads'])
    if creatives.get('banner_vertical_leads'):
        ads['gr_banner'] = create_ad('GR - Banner Vertical', adsets['gr'], creatives['banner_vertical_leads'])

# Traffic: reel8 + landscape banner
if adsets.get('es_fr_tr'):
    if creatives.get('reel8_traffic'):
        ads['es_fr_tr_video'] = create_ad('ES+FR+TR - Reel8 Landscape', adsets['es_fr_tr'], creatives['reel8_traffic'])
    if creatives.get('banner_landscape_traffic'):
        ads['es_fr_tr_banner'] = create_ad('ES+FR+TR - Landscape Banner', adsets['es_fr_tr'], creatives['banner_landscape_traffic'])

# SI+AL+CY: reel7 + banner square
if adsets.get('si_al_cy'):
    if creatives.get('reel7_leads'):
        ads['si_al_cy_video'] = create_ad('SI+AL+CY - Reel7', adsets['si_al_cy'], creatives['reel7_leads'])
    if creatives.get('banner_square_leads'):
        ads['si_al_cy_banner'] = create_ad('SI+AL+CY - Banner', adsets['si_al_cy'], creatives['banner_square_leads'])

# ─── SUMMARY ─────────────────────────────────────────────────────────────────
step('GOTOVO — Sažetak')
print(f'  Kampanje:   {sum(1 for v in campaigns.values() if v)}/4')
print(f'  Ad setovi:  {sum(1 for v in adsets.values() if v)}/4')
print(f'  Kreativni:  {sum(1 for v in creatives.values() if v)}')
print(f'  Oglasi:     {sum(1 for v in ads.values() if v)}')
print()
print('  Sve kampanje su PAUSED — provjeri u Ads Manageru pa aktiviraj!')
print()
print('  Kampanje:')
for k, v in campaigns.items():
    print(f'    {k}: {v}')
print('  Kreativni:')
for k, v in creatives.items():
    print(f'    {k}: {v}')

# Save results to JSON
with open('D:/Desktop/Aplikacije1/Mooring Booking/ads_setup_result.json', 'w') as f:
    json.dump({
        'campaigns': campaigns,
        'adsets': adsets,
        'creatives': creatives,
        'ads': ads,
        'video_ids': video_ids,
        'img_hashes': img_hashes,
    }, f, indent=2)
print()
print('  Rezultati snimljeni u: ads_setup_result.json')
