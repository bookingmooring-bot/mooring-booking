"""Update the ADS list in generate_client_pdf.py with client's copy + 3 body variants."""

VAR1 = (
    "We are launching a revolution in boating: sailors now ask AI Captain for a complete voyage plan "
    "-- and AI Captain recommends the best available berths. "
    "Register your marina free at mooring-booking.com and let AI Captain send boaters straight to you."
)
VAR2 = (
    "Mooring Booking connects your marina with sailors from 10 Mediterranean countries "
    "-- completely free to join. "
    "List your berths in 10 minutes. Pay only 15% when a booking is confirmed. "
    "No subscription, no risk, no upfront cost."
)
VAR3 = (
    "We just launched across 10 Mediterranean countries. "
    "The marinas that register first get priority placement when sailors search for berths. "
    "Early spots are limited -- register free now before your competitor does."
)

NEW_ADS_BLOCK = f"""
# -- PAGES 4-13: AD CREATIVES --
# Body variants (client approved, 01 Apr 2026):
#   VAR1 = AI Captain journey  -> AD-01, 02, 03, 06
#   VAR2 = Free + 15% commission -> AD-04, 05, 09
#   VAR3 = First-mover FOMO    -> AD-07, 08, 10

_V1 = (
    "We are launching a revolution in boating: sailors now ask AI Captain for a complete voyage plan "
    "-- and AI Captain recommends the best available berths. "
    "Register your marina free at mooring-booking.com and let AI Captain send boaters straight to you."
)
_V2 = (
    "Mooring Booking connects your marina with sailors from 10 Mediterranean countries "
    "-- completely free to join. "
    "List your berths in 10 minutes. Pay only 15% when a booking is confirmed. "
    "No subscription, no risk, no upfront cost."
)
_V3 = (
    "We just launched across 10 Mediterranean countries. "
    "The marinas that register first get priority placement when sailors search for berths. "
    "Early spots are limited -- register free now before your competitor does."
)

ADS = [
    {{
        'id': 'AD-01',  'file': 'ad-01-ai-captain-saves-marina.png',
        'hook':    'AI Captain saves your marina!',
        'subhook': 'Brings boaters, fills berths and boosts your revenue.',
        'angle':   'Body Variant 1 (AI Captain journey) | Target: P1 + P2',
        'headlines': [
            'Fill Your Berths This Season',
            'Boost Your Marina Revenue',
            'AI Captain Fills Empty Berths',
            'Stop Losing Money to Empty Docks',
            'Be First Recommended by AI Captain',
        ],
        'primary': (
            "AI Captain saves your marina! Brings boaters, fills berths and boosts your revenue.\\n\\n"
            + _V1 + "\\n\\n"
            "Register your berths for free in the mooring-booking database now "
            "and be the first recommended by AI Captain."
        ),
        'desc': 'Free listing. Be first. 15% only.',
        'cta':  'Register Free Now',
        'target': 'P1 + P2 | Age 20-63 | Coastal 5km | Marina management, nautical business',
        'note': 'Priority test ad. Run all markets Week 1. Var 1.',
    }},
    {{
        'id': 'AD-02',  'file': 'ad-02-empty-berths-revenue.png',
        'hook':    'Empty berths killing your revenue?',
        'subhook': 'AI Captain saves them -- brings boaters and increases earnings.',
        'angle':   'Body Variant 1 (AI Captain journey) | Target: P1 + P2',
        'headlines': [
            'Empty Berths = Lost Revenue',
            'Fill Your Berths -- Earn More',
            'No More Empty Docks This Season',
            'Turn Empty Berths Into Income',
            'Your Berths Can Earn EUR 5,000+',
        ],
        'primary': (
            "Empty berths killing your revenue? AI Captain saves them -- brings boaters and increases earnings.\\n\\n"
            + _V1 + "\\n\\n"
            "Fill the form in 60 seconds and register for free. "
            "Let AI Captain send boaters straight to you."
        ),
        'desc': 'Free. Fill form in 60 seconds.',
        'cta':  'Fill the Form -- 60 Seconds',
        'target': 'P1 + P2 | Age 20-63 | Coastal 5km | Revenue/business interests',
        'note': 'STRONGEST pain hook -- expected highest CTR. Run all markets first. Var 1.',
    }},
    {{
        'id': 'AD-03',  'file': 'ad-03-sinking-emptiness.png',
        'hook':    'Is your marina sinking into emptiness?',
        'subhook': 'AI Captain is the savior: boaters arrive, revenue grows.',
        'angle':   'Body Variant 1 (AI Captain journey) | Target: P1 + P2',
        'headlines': [
            'Join the Revolution Today',
            'Season Opens April 2nd. Ready?',
            'AI Captain Is Your Savior',
            "Don't Let the Season Pass Empty",
            'Secure Higher Revenue This Season',
        ],
        'primary': (
            "Is your marina sinking into emptiness? AI Captain is the savior: boaters arrive, revenue grows.\\n\\n"
            + _V1 + "\\n\\n"
            "Join the revolution today -- register your berths for free in mooring-booking "
            "and secure higher revenue this season."
        ),
        'desc': 'Free listing. Join the revolution.',
        'cta':  'Join the Revolution Free',
        'target': 'P1 + P2 | Age 20-63 | Coastal 5km | Season urgency',
        'note': 'TIME-SENSITIVE: Most effective Apr 1-10 only. Swap after Apr 15. Var 1.',
    }},
    {{
        'id': 'AD-04',  'file': 'ad-04-mooring-fields-empty.png',
        'hook':    'Your mooring fields, anchorages and docks standing empty?',
        'subhook': 'AI Captain saves everything -- brings boaters and increases your income.',
        'angle':   'Body Variant 2 (Free + 15% commission) | Target: P3 + P4',
        'headlines': [
            'Earn With Zero Upfront Cost',
            'List Your Mooring Field Free',
            'Your Dock. Booked This Season.',
            'Pay Only 15% When You Earn',
            'Buoy Fields Earn EUR 5,000+ / Season',
        ],
        'primary': (
            "Your mooring fields, anchorages and docks standing empty? "
            "AI Captain saves everything -- brings boaters and increases your income.\\n\\n"
            + _V2 + "\\n\\n"
            "Don't let the competition be faster -- fill the form and register all berths for free now."
        ),
        'desc': 'Free listing. 15% per booking.',
        'cta':  'Fill Form -- Register Free Now',
        'target': 'P3 + P4 | Age 20-63 | Coastal 5km | Mooring field, buoy rental, sea concession',
        'note': 'Run as SEPARATE ad set from P1/P2. HR + GR first. Var 2.',
    }},
    {{
        'id': 'AD-05',  'file': 'ad-05-concession-paid.png',
        'hook':    'Concession paid, but berths empty?',
        'subhook': 'AI Captain saves your business -- brings boaters directly to you.',
        'angle':   'Body Variant 2 (Free + 15% commission) | Target: P3',
        'headlines': [
            'Concession Cost Killing You?',
            'Earn Back Your Concession Cost',
            'Zero Risk. Register Free Today.',
            'Fill Your Concession -- Earn More',
            'Pay Only 15% When Booked',
        ],
        'primary': (
            "Concession paid, but berths empty? AI Captain saves your business -- brings boaters directly to you.\\n\\n"
            + _V2 + "\\n\\n"
            "Do it for free today -- register your berths in the mooring-booking database "
            "and let AI Captain work for you."
        ),
        'desc': 'Free to list. Pay 15% only.',
        'cta':  'Do It Free Today',
        'target': 'P3 | Age 25-60 | Coastal 5km | Commercial maritime, sea concession operator',
        'note': 'Very specific to concession holders -- high relevance, smaller audience. HR + GR. Var 2.',
    }},
    {{
        'id': 'AD-06',  'file': 'ad-06-boats-pass-by.png',
        'hook':    'Boats pass by while you lose money?',
        'subhook': 'AI Captain saves your docks and berths -- brings boaters and fills the cash register.',
        'angle':   'Body Variant 1 (AI Captain journey) | Target: P1-P4 broad',
        'headlines': [
            'Stop Watching Boats Sail Past',
            'Become Visible to Sailors Now',
            'AI Captain Sends Boaters to You',
            "Don't Miss the 2026 Season",
            'Register Free -- Become Visible',
        ],
        'primary': (
            "Boats pass by while you lose money? "
            "AI Captain saves your docks and berths -- brings boaters and fills the cash register.\\n\\n"
            + _V1 + "\\n\\n"
            "Don't miss this opportunity -- register your berths for free right now and become visible."
        ),
        'desc': 'Free listing. Become visible now.',
        'cta':  'Register Free Right Now',
        'target': 'P1-P4 | Age 20-63 | All markets | Broad FOMO test',
        'note': 'Broad audience test -- identifies best-converting market. Var 1.',
    }},
    {{
        'id': 'AD-07',  'file': 'ad-07-best-friend-business.png',
        'hook':    'AI Captain -- the best friend of your nautical business!',
        'subhook': 'Saves mooring fields and anchorages, brings boaters and raises revenue.',
        'angle':   'Body Variant 3 (First-mover FOMO) | Target: P2',
        'headlines': [
            'Join the Revolution for Free',
            'First Registered = Best Positioned',
            "Your Marina's New Best Ally",
            '10 Countries. 1 Platform. Free.',
            'Register Before Your Competitor Does',
        ],
        'primary': (
            "AI Captain -- the best friend of your nautical business! "
            "Saves mooring fields and anchorages, brings boaters and raises revenue.\\n\\n"
            + _V3 + "\\n\\n"
            "Join the revolution for free -- fill the form and register your berths in mooring-booking now."
        ),
        'desc': 'Free. Priority for first movers.',
        'cta':  'Fill the Form Now',
        'target': 'P2 | Age 30-60 | Coastal 5km | Small marina, boating facility operator',
        'note': 'First-mover angle. Good for IT + ES + FR markets. Var 3.',
    }},
    {{
        'id': 'AD-08',  'file': 'ad-08-marina-owners-rescue.png',
        'hook':    "Marina owners -- it's time for rescue.",
        'subhook': 'AI Captain brings boaters and turns empty docks into higher revenue.',
        'angle':   'Body Variant 3 (First-mover FOMO) | Target: P1 + P2',
        'headlines': [
            "Don't Wait for Next Season",
            'Start Earning THIS Season',
            'Register First. Get Found First.',
            'Priority Placement -- Free Listing',
            'Early Spots Are Limited',
        ],
        'primary': (
            "Marina owners -- it's time for rescue. "
            "AI Captain brings boaters and turns empty docks into higher revenue.\\n\\n"
            + _V3 + "\\n\\n"
            "Don't wait for next season -- register your berths for free in the database "
            "and start earning more this year."
        ),
        'desc': 'Free listing. Start earning now.',
        'cta':  'Register Free -- Start Earning',
        'target': 'P1 + P2 | Age 30-63 | Coastal 5km | Marina management, harbour management',
        'note': 'Rescue/urgency hook. Excellent for RETARGETING non-converters. Var 3.',
    }},
    {{
        'id': 'AD-09',  'file': 'ad-09-berths-invisible.png',
        'hook':    'Your berths invisible? Losing the season?',
        'subhook': 'AI Captain saves everything -- boaters arrive, revenue explodes.',
        'angle':   'Body Variant 2 (Free + 15% commission) | Target: P1-P4',
        'headlines': [
            'Invisible to Sailors? Not Anymore.',
            'Before: Empty. After: Fully Booked.',
            'From Zero Bookings to Full Season',
            '15% Commission -- You Keep 85%',
            'Fill the Form in 30 Seconds',
        ],
        'primary': (
            "Your berths invisible? Losing the season? "
            "AI Captain saves everything -- boaters arrive, revenue explodes.\\n\\n"
            + _V2 + "\\n\\n"
            "Be first -- fill the form in 30 seconds and register them for free in mooring-booking."
        ),
        'desc': 'You keep 85%. Free to list.',
        'cta':  'Fill Form in 30 Seconds',
        'target': 'P1-P4 | Age 30-63 | All markets | Objection-handling segment',
        'note': 'Before/after format -- high FB Feed performance. Var 2 highlights 15% commission clearly.',
    }},
    {{
        'id': 'AD-10',  'file': 'ad-10-full-marina-bankruptcy.png',
        'hook':    'Full marina or season bankruptcy?',
        'subhook': 'AI Captain saves marinas and berth owners -- brings boaters and increases revenue!',
        'angle':   'Body Variant 3 (First-mover FOMO) | Target: P1',
        'headlines': [
            'Choose: Full Marina or Empty Season',
            'Season 2026 -- Are You Listed?',
            'First Registered. Best Positioned.',
            'Early Spots Are Limited -- Act Now',
            "Mediterranean's First Mooring Platform",
        ],
        'primary': (
            "Full marina or season bankruptcy? "
            "AI Captain saves marinas and berth owners -- brings boaters and increases revenue!\\n\\n"
            + _V3 + "\\n\\n"
            "Choose a full marina -- register all your berths for free in the mooring-booking database right now."
        ),
        'desc': 'Season starts Apr 2. Join free.',
        'cta':  'Register All Berths Free',
        'target': 'P1 | Age 30-63 | HR + IT + GR priority | Large marina, port management',
        'note': 'Bold fear hook. Monitor: if CTR < 0.8% after 3 days, pause -- replace with AD-02. Var 3.',
    }},
]
"""

with open('generate_client_pdf.py', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.index('# \u2500\u2500 PAGES 4-13: AD CREATIVES')
end = content.index('\ndef page_creative')
new_content = content[:start] + NEW_ADS_BLOCK + content[end:]

with open('generate_client_pdf.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f'Updated. Total lines: {new_content.count(chr(10))}')
