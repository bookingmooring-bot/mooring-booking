"""
Update kampanja prema prioritetima:
- Sve kampanje = Leads (ne Traffic)
- SI+AL+CY = 20% budzeta (€140/mj)
- Priobalno targetiranje — specificni gradovi uz obalu
- Budzetski raspored: HR+IT €200 | GR €160 | ES+FR+TR €200 | SI+AL+CY €140

Priobalni gradovi po drzavi:
- HR: Split, Dubrovnik, Zadar, Rijeka (cijela zemlja je priobalna)
- IT: Bari, Ancona, Trieste, Genova, Napoli, Palermo, Cagliari
- GR: Atina/Pirej, Thessaloniki, Patras, Heraklion, Corfu
- ES: Barcelona, Valencia, Malaga, Alicante, Palma de Mallorca
- FR: Marseille, Nice, Toulon, Montpellier
- TR: Izmir, Antalya, Bodrum, Marmaris, Istanbul
- SI: Koper, Piran (cijela obala je mala)
- AL: Durres, Vlore, Sarande
- CY: Limassol, Larnaca, Paphos
"""
import requests, json

TOKEN   = 'EAAWVZAaTfakYBRNqy6sCKDEDMc2S5dNYNIgb7pVtWr5wOc4dj9aHOT0GoPgZAkMaxWh1EHfsEB3OD7Tkx7BigxGlqFArBgUn3wwtd8tS0QhZBJgg91RfqmcDByffERVGLM0UpItk1td0tcf48X1Ri469FYmPfL9AB3ZBwnmCizVIz28UToVwC2PAy37eVaPdDbkZALZBQ4lX2W90yh'
ACCOUNT = 'act_3100835596778287'
PAGE_ID = '1019158577946111'
API     = 'https://graph.facebook.com/v18.0'
LANDING = 'https://mooring-booking.com/become-provider'

# Kreirani kreativni
CREATIVES = {
    'reel7':    '2503504760103222',
    'reel8':    '35787866020812542',
    'square':   '1479826723934428',
    'vertical': '961890826182810',
    'landscape':'1507964127618384',
}

# Stare kampanje (pauzirati)
OLD_TRAFFIC_CAMPAIGN = '120245134111910750'

# Budzeti (daily u cent EUR):
# €700/mj total
# SI+AL+CY: 20% = €140/mj = €4.67/day = 467 centi
# HR+IT: €200/mj = €6.67/day = 667 centi
# GR: €160/mj = €5.33/day = 533 centi
# ES+FR+TR: €200/mj = €6.67/day = 667 centi
BUDGETS = {
    'hr_it':    667,   # €200/mj
    'gr':       533,   # €160/mj
    'es_fr_tr': 667,   # €200/mj (nova Leads kampanja)
    'si_al_cy': 467,   # €140/mj = 20%
}

def post(ep, data, method='POST'):
    data['access_token'] = TOKEN
    r = requests.post(f'{API}/{ep}', data=data)
    if r.status_code == 200:
        return r.json()
    print(f'  ERR {r.status_code}: {r.text[:350]}')
    return None

def sep(msg):
    print(f'\n{"="*55}\n  {msg}\n{"="*55}')

# ── 1: Pauziraj staru Traffic kampanju ──────────────────────
sep('1. Pauziranje stare Traffic kampanje')
res = post(OLD_TRAFFIC_CAMPAIGN, {'status': 'PAUSED'})
print(f'  Traffic kampanja pauzirana: {res}')

# ── 2: Azuriraj budzetne na postojecim kampanjama ────────────
sep('2. Azuriranje budzeta na postojecim kampanjama')
existing = {
    'hr_it':    '120245134110810750',
    'gr':       '120245134111330750',
    'si_al_cy': '120245134112410750',
}
for key, cid in existing.items():
    res = post(cid, {'daily_budget': BUDGETS[key]})
    print(f'  {key} budzet -> {BUDGETS[key]} centi/dan: {res}')

# ── 3: Nova Leads kampanja za ES+FR+TR ──────────────────────
sep('3. Nova Leads kampanja: ES + FR + TR')
res = post(f'{ACCOUNT}/campaigns', {
    'name': 'Leads - ES + FR + TR',
    'objective': 'OUTCOME_LEADS',
    'status': 'PAUSED',
    'daily_budget': BUDGETS['es_fr_tr'],
    'special_ad_categories': json.dumps([]),
    'bid_strategy': 'LOWEST_COST_WITHOUT_CAP',
})
es_campaign_id = None
if res and 'id' in res:
    es_campaign_id = res['id']
    print(f'  OK Leads ES+FR+TR: {es_campaign_id}')
else:
    print(f'  FAIL: {res}')

# ── 4: Ad setovi s priobalnim targetiranjem ─────────────────
sep('4. Ad setovi — priobalni gradovi (radius targeting)')

# Priobalni targeting po drzavi — latitude/longitude + radius 20km od centra obalnih gradova
# Meta API: custom_locations s lat/lng + radius
# Alternativa: countries (Meta ce optimizirati prema relevantnosti)

# Za priobalne drzave (HR, SI, AL, CY) — koristimo cijelu drzavu jer su sve priobalne
# Za vece drzave (IT, GR, ES, FR, TR) — targetiramo samo priobalne regije

def coastal_targeting(countries, coastal_cities_latlng=None):
    """
    Targeting za priobalne oblasti.
    coastal_cities_latlng: lista [(lat, lng, radius_km, city_name), ...]
    """
    if coastal_cities_latlng:
        return {
            'custom_locations': [
                {
                    'latitude': lat,
                    'longitude': lng,
                    'radius': radius,
                    'distance_unit': 'kilometer'
                }
                for lat, lng, radius, _ in coastal_cities_latlng
            ],
            'location_types': ['home', 'recent'],
        }
    else:
        return {
            'countries': countries,
            'location_types': ['home', 'recent'],
        }

# Priobalni gradovi koordinate
COASTAL_CITIES = {
    'HR': [
        (43.508133, 16.440193, 20, 'Split'),
        (42.650661, 18.094424, 20, 'Dubrovnik'),
        (44.119722, 15.231944, 20, 'Zadar'),
        (45.327063, 14.442176, 20, 'Rijeka'),
        (43.735556, 15.888889, 20, 'Sibenik'),
    ],
    'IT': [
        (41.117143, 16.871871, 20, 'Bari'),
        (43.616578, 13.516667, 20, 'Ancona'),
        (45.649526, 13.776818, 20, 'Trieste'),
        (44.411690, 8.932590, 20, 'Genova'),
        (40.853294, 14.268322, 20, 'Napoli'),
        (38.115688, 13.361267, 20, 'Palermo'),
        (39.223841, 9.121661, 20, 'Cagliari'),
        (44.058648, 12.565665, 20, 'Rimini'),
    ],
    'GR': [
        (37.977624, 23.715491, 25, 'Athens-Piraeus'),
        (40.640063, 22.944419, 20, 'Thessaloniki'),
        (38.246639, 21.734573, 20, 'Patras'),
        (35.338318, 25.144332, 20, 'Heraklion'),
        (39.624083, 19.921750, 20, 'Corfu'),
        (37.439638, 25.371553, 20, 'Mykonos'),
        (36.393154, 25.461509, 20, 'Santorini'),
    ],
    'ES': [
        (41.388777, 2.159019, 20, 'Barcelona'),
        (39.469906, -0.376288, 20, 'Valencia'),
        (36.721261, -4.421266, 20, 'Malaga'),
        (38.384891, -0.513806, 20, 'Alicante'),
        (39.569600, 2.650160, 20, 'Palma de Mallorca'),
        (36.527557, -6.289021, 20, 'Cadiz'),
    ],
    'FR': [
        (43.296482, 5.381119, 20, 'Marseille'),
        (43.710173, 7.261953, 20, 'Nice'),
        (43.124228, 5.928000, 20, 'Toulon'),
        (43.604652, 1.444209, 15, 'Montpellier-coast'),
    ],
    'TR': [
        (38.423734, 27.142826, 20, 'Izmir'),
        (36.886204, 30.704044, 20, 'Antalya'),
        (37.037983, 27.430197, 20, 'Bodrum'),
        (36.854877, 28.283497, 20, 'Marmaris'),
        (36.590000, 31.991000, 20, 'Alanya'),
    ],
}

def make_adset(name, campaign_id, countries, opt_goal, is_leads=True, cities=None):
    if cities:
        geo = coastal_targeting(countries, cities)
    else:
        geo = {'countries': countries, 'location_types': ['home', 'recent']}

    targeting = json.dumps({
        'geo_locations': geo,
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
    print(f'  FAIL "{name}": {res}')
    return None

# Kombinovani priobalni gradovi za vece drzave
HR_IT_CITIES = COASTAL_CITIES['HR'] + COASTAL_CITIES['IT']
GR_CITIES = COASTAL_CITIES['GR']
ES_FR_TR_CITIES = COASTAL_CITIES['ES'] + COASTAL_CITIES['FR'] + COASTAL_CITIES['TR']

adsets = {}

# HR+IT: priobalni gradovi
adsets['hr_it'] = make_adset(
    'HR+IT - Priobalno 25-65', existing['hr_it'],
    ['HR', 'IT'], 'LEAD_GENERATION',
    cities=HR_IT_CITIES
)

# Greece: priobalni gradovi
adsets['gr'] = make_adset(
    'GR - Priobalno 25-65', existing['gr'],
    ['GR'], 'LEAD_GENERATION',
    cities=GR_CITIES
)

# ES+FR+TR: nova kampanja, Leads, priobalni
if es_campaign_id:
    adsets['es_fr_tr'] = make_adset(
        'ES+FR+TR - Priobalno 25-65', es_campaign_id,
        ['ES', 'FR', 'TR'], 'LEAD_GENERATION',
        cities=ES_FR_TR_CITIES
    )

# SI+AL+CY: male priobalne drzave - country targeting dovoljan
adsets['si_al_cy'] = make_adset(
    'SI+AL+CY - Priobalno 25-65', existing['si_al_cy'],
    ['SI', 'AL', 'CY'], 'LEAD_GENERATION'
)

print('  Ad setovi:', adsets)

# ── 5: Oglasi za novu ES+FR+TR kampanju ────────────────────
sep('5. Oglasi za novu ES+FR+TR Leads kampanju')

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

new_ads = {}
if adsets.get('es_fr_tr'):
    new_ads['es_reel7'] = ad('ES+FR+TR - Reel7 Vertical', adsets['es_fr_tr'], CREATIVES['reel7'])
    new_ads['es_banner'] = ad('ES+FR+TR - Banner Square', adsets['es_fr_tr'], CREATIVES['square'])

print('  Novi oglasi:', new_ads)

# ── SUMMARY ──────────────────────────────────────────────────
sep('GOTOVO — Finalni setup')

print()
print('  BUDZETNI PLAN (€700/mj):')
print('  ┌─────────────────────────────────────────────────────┐')
print('  │ Kampanja           │ Tipe  │ Budget/mj │ % budzeta  │')
print('  ├─────────────────────────────────────────────────────┤')
print('  │ Leads HR + IT      │ Leads │ €200      │ 28.6%      │')
print('  │ Leads Greece       │ Leads │ €160      │ 22.9%      │')
print('  │ Leads ES+FR+TR     │ Leads │ €200      │ 28.6%      │')
print('  │ Leads SI+AL+CY     │ Leads │ €140      │ 20.0% ← 20%│')
print('  ├─────────────────────────────────────────────────────┤')
print('  │ UKUPNO             │       │ €700      │ 100%       │')
print('  └─────────────────────────────────────────────────────┘')
print()
print('  TARGETING: priobalni gradovi, max 20km od obale')
print(f'  HR+IT: {len(HR_IT_CITIES)} obalnih gradova')
print(f'  GR:    {len(GR_CITIES)} obalnih gradova')
print(f'  ES+FR+TR: {len(ES_FR_TR_CITIES)} obalnih gradova')
print('  SI+AL+CY: cijela drzava (sve priobalne)')
print()
print('  Sve PAUSED — aktiviraj u Ads Manageru!')

with open('D:/Desktop/Aplikacije1/Mooring Booking/ads_final_config.json', 'w') as f:
    json.dump({
        'campaigns': {**existing, 'es_fr_tr_new': es_campaign_id},
        'adsets': adsets,
        'creatives': CREATIVES,
        'budget_plan': {
            'hr_it': '€200/mj', 'gr': '€160/mj',
            'es_fr_tr': '€200/mj', 'si_al_cy': '€140/mj (20%)',
            'total': '€700/mj'
        },
        'coastal_cities_count': {
            'hr_it': len(HR_IT_CITIES),
            'gr': len(GR_CITIES),
            'es_fr_tr': len(ES_FR_TR_CITIES),
        }
    }, f, indent=2)
print('  Config: ads_final_config.json')
