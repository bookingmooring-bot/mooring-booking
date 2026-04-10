"""
Mooring Booking — Week 1 Hook Creatives PDF
10 ad visuals with full copy: 5 headlines, primary text, description, CTA, target audience
"""
from fpdf import FPDF
import os

IMG_DIR = 'D:/Desktop/Aplikacije1/Mooring Booking/ad-visuals-week1-hooks'
OUT     = 'C:/Users/User/Downloads/MooringBooking_Week1_Creatives.pdf'

NAVY  = (15, 90, 140)
NAVYD = (8, 55, 90)
GOLD  = (180, 140, 30)
WHITE = (255, 255, 255)
LIGHT = (230, 243, 255)
GRAY  = (100, 100, 100)
LGRAY = (245, 247, 250)
GREEN = (0, 130, 60)
RED   = (180, 30, 30)
WARN  = (200, 100, 0)

def safe(s):
    if not s: return ''
    for a, b in [
        ('š','s'),('č','c'),('ć','c'),('ž','z'),('đ','d'),
        ('Š','S'),('Č','C'),('Ć','C'),('Ž','Z'),('Đ','D'),
        ('✅','[OK]'),('❌','[X]'),('📈','[+]'),('💻','[PC]'),
        ('⚓','[anchor]'),('🚀','[>]'),('💡','[*]'),('📣','[!]'),
        ('→','->'),('€','EUR'),('\u2014','-'),('\u2013','-'),
        ('\u2019',"'"),('\u2018',"'"),('\u201c','"'),('\u201d','"'),
        ('\u2026','...'),('\u2022','-'),('\u00b7','.'),
    ]:
        s = s.replace(a, b)
    return s.encode('latin-1', errors='replace').decode('latin-1')

ADS = [
    {
        'id': 'AD-01',
        'file': 'ad-01-ai-captain-saves-marina.png',
        'hook': 'AI Captain saves your marina!',
        'subhook': 'Brings boaters, fills berths & boosts your revenue',
        'angle': 'Revenue Growth — Large & Small Marina Operators (P1, P2)',
        'headlines': [
            'Fill Your Berths This Season',
            'Boost Your Marina\'s Revenue',
            'AI Captain Fills Empty Berths',
            'Stop Losing Money to Empty Docks',
            'Digital Bookings. More Revenue.',
        ],
        'primary_text': (
            "Running a marina? Your empty berths are costing you money every day they sit unused.\n\n"
            "Mooring Booking connects Mediterranean marinas with sailors from 10 countries — and it's free to join.\n\n"
            "[OK] Free listing — no subscription, no upfront cost\n"
            "[OK] Set your own prices and available capacity\n"
            "[OK] Digital booking system, 24/7 visibility\n"
            "[OK] Only 15% commission per confirmed booking\n\n"
            "Increase your berth occupancy this season.\n"
            "-> Register your marina now."
        ),
        'description': 'Free. 10 Countries. 15% Only.',
        'cta': 'Sign Up',
        'target': 'P1 + P2 | Age 20-63 | Coastal 5km | Interests: marina management, sailing, nautical business',
        'note': 'Best for: HR, GR, IT priority markets. Test against A2 (revenue angle).',
    },
    {
        'id': 'AD-02',
        'file': 'ad-02-empty-berths-revenue.png',
        'hook': 'Empty berths killing your revenue?',
        'subhook': 'AI Captain saves them — brings boaters & increases earnings',
        'angle': 'Revenue Pain Hook — Marina Operators (P1, P2)',
        'headlines': [
            'Empty Berths = Lost Revenue',
            'Fill Your Berths — Earn More',
            'No More Empty Docks This Season',
            'Turn Empty Berths Into Income',
            'Your Berths Can Earn EUR 5,000+',
        ],
        'primary_text': (
            "What if every empty berth in your marina generated revenue — automatically?\n\n"
            "Mooring Booking is the new digital platform built for marina operators across the Mediterranean.\n\n"
            "[+] More bookings. Less admin.\n"
            "[OK] International sailors discover your marina\n"
            "[OK] Automated booking confirmations\n"
            "[OK] Real-time availability calendar\n"
            "[OK] Zero subscription fees — 15% commission only\n\n"
            "-> List your marina free today."
        ),
        'description': 'Free listing. 0 upfront cost.',
        'cta': 'Start Now',
        'target': 'P1 + P2 | Age 20-63 | Coastal 5km | Interests: marina management, boating facility, harbour',
        'note': 'Strong pain hook — expected high CTR. Test with split image visual (empty vs full).',
    },
    {
        'id': 'AD-03',
        'file': 'ad-03-sinking-emptiness.png',
        'hook': 'Is your marina sinking into emptiness?',
        'subhook': 'AI Captain is the SAVIOR — Boaters arrive. Revenue grows.',
        'angle': 'Dramatic Urgency — Season 2026 Launch (P1, P2)',
        'headlines': [
            'Ready for Season 2026?',
            'Season Opens April 2nd. Ready?',
            'Marinas Are Joining. Are You?',
            'Don\'t Let the Season Pass Empty',
            'The Mediterranean\'s New Booking Platform',
        ],
        'primary_text': (
            "The 2026 Mediterranean sailing season starts April 2nd. Is your marina ready?\n\n"
            "Marina operators on Mooring Booking get:\n"
            "[OK] Visibility to sailors from 10 countries\n"
            "[OK] Digital booking — no phone/email chaos\n"
            "[OK] Custom pricing per berth and date\n"
            "[OK] Free to list — only 15% on confirmed bookings\n\n"
            "Don't leave berths empty when sailors are actively searching.\n"
            "-> Register your marina before the season starts."
        ),
        'description': 'Free marina listing. Start now.',
        'cta': 'Register Now',
        'target': 'P1 + P2 | Age 20-63 | Coastal 5km | Season urgency — April 2nd launch',
        'note': 'Time-sensitive hook — most effective Apr 1-10 (launch week). Pause after Apr 15.',
    },
    {
        'id': 'AD-04',
        'file': 'ad-04-mooring-fields-empty.png',
        'hook': 'Your mooring fields, anchorages & docks standing empty?',
        'subhook': 'AI Captain saves everything — brings boaters & increases your income',
        'angle': 'Zero Risk — Buoy Fields & Dock Owners (P3, P4)',
        'headlines': [
            'Earn With Zero Upfront Cost',
            'List Your Mooring Field Free',
            'Your Dock. Booked This Season.',
            'Turn Idle Moorings Into Income',
            'Buoy Fields Earn EUR 5,000+ / Season',
        ],
        'primary_text': (
            "What if you could earn from your dock, buoy field, or pier — with zero upfront cost?\n\n"
            "Mooring Booking is free to list. You only pay 15% when a booking is confirmed.\n\n"
            "There is literally no risk.\n\n"
            "[OK] List in 10 minutes\n"
            "[OK] Set your own prices and rules\n"
            "[OK] Sailors from 10 countries find you\n"
            "[OK] Only pay when you earn\n\n"
            "Your facility earns nothing sitting empty.\n"
            "-> List it free today."
        ),
        'description': 'Free listing. 15% per booking.',
        'cta': 'Fill the Form',
        'target': 'P3 + P4 | Age 20-63 | Coastal 5km | Interests: mooring field, buoy rental, sea concession, waterfront property',
        'note': 'Specific to mooring field / dock operators. Run as separate ad set from P1/P2.',
    },
    {
        'id': 'AD-05',
        'file': 'ad-05-concession-paid.png',
        'hook': 'Concession paid, but berths empty?',
        'subhook': 'AI Captain saves your business — Brings boaters directly to you',
        'angle': 'Concession Pain Hook — Licensed Operators (P3)',
        'headlines': [
            'Concession Cost Killing You?',
            'Earn Back Your Concession Cost',
            'Zero Risk. Register Free Today.',
            'Fill Your Concession — Earn More',
            'Sailors Are Looking for You Now',
        ],
        'primary_text': (
            "No subscription. No setup fee. No risk.\n\n"
            "Mooring Booking lets marina operators, buoy field owners, and private dock holders "
            "list for free — and only charges 15% when you earn.\n\n"
            "The math is simple:\n"
            "[X] Without listing: EUR 0\n"
            "[OK] With Mooring Booking: EUR 4,250+ per season (your 85% cut)\n\n"
            "Free to list. Only pay when you earn.\n"
            "-> Register now."
        ),
        'description': 'Free to list. Pay 15% only.',
        'cta': 'Do It Now — It\'s Free',
        'target': 'P3 | Age 25-60 | Coastal 5km | Interests: commercial maritime, sea concession, mooring operator',
        'note': 'Very specific pain for concession holders — high relevance, lower audience size. Good for HR/GR.',
    },
    {
        'id': 'AD-06',
        'file': 'ad-06-boats-pass-by.png',
        'hook': 'Boats pass by while you lose money?',
        'subhook': 'AI Captain fills your docks & berths — Brings boaters. Fills the cash register.',
        'angle': 'FOMO — First-Mover / All Segments (P1-P4)',
        'headlines': [
            'Stop Watching Boats Sail Past',
            'Be First on Mooring Booking',
            'New Platform. First Providers Win.',
            'Don\'t Miss the 2026 Season',
            'Sailors Are Booking Now. Are You Listed?',
        ],
        'primary_text': (
            "Mooring Booking just launched — and we're building our first 500 marinas across the Mediterranean.\n\n"
            "Early providers get priority placement in search results and maximum visibility "
            "to sailors browsing the platform.\n\n"
            "[>] Free to join. No subscription ever.\n"
            "[OK] Set your own prices and availability\n"
            "[OK] Reach sailors from 10 countries in one platform\n"
            "[OK] First providers get the best positions\n\n"
            "This window won't stay open long.\n"
            "-> Register your marina now — before your competitor does."
        ),
        'description': 'Priority spot. Free listing.',
        'cta': 'Register Free Right Now',
        'target': 'P1-P4 | Age 20-63 | Coastal 5km | All segments — FOMO / early-adopter angle',
        'note': 'Broad test ad — run across all markets to find best performing segment.',
    },
    {
        'id': 'AD-07',
        'file': 'ad-07-best-friend-business.png',
        'hook': 'AI Captain — Best friend of your nautical business!',
        'subhook': 'Saves mooring fields & anchorages. Brings boaters. Raises revenue.',
        'angle': 'Aspirational / Digital System — Small Marina Operators (P2)',
        'headlines': [
            'Digital Bookings for Your Marina',
            'No More Manual Reservations',
            'Your Marina\'s New Best Ally',
            'Mooring Booking — Built for You',
            '10-Min Setup. Pay as You Earn.',
        ],
        'primary_text': (
            "Still taking marina reservations by phone and email?\n\n"
            "Mooring Booking gives your marina a professional digital booking system — for free.\n\n"
            "[PC] Guests book online, 24/7\n"
            "[OK] Automated confirmation emails\n"
            "[OK] Real-time berth availability calendar\n"
            "[OK] Payments handled for you\n"
            "[OK] No monthly subscription — 15% per booking only\n\n"
            "Stop managing bookings manually.\n"
            "-> Set up your marina in 10 minutes."
        ),
        'description': 'Free setup. No subscription.',
        'cta': 'Fill the Form Now',
        'target': 'P2 | Age 30-60 | Coastal 5km | Interests: small marina, boating facility, marina operator',
        'note': 'Works best for small/mid marinas that still use phone/WhatsApp for reservations.',
    },
    {
        'id': 'AD-08',
        'file': 'ad-08-marina-owners-rescue.png',
        'hook': 'Marina owners — it\'s time for rescue',
        'subhook': 'AI Captain brings boaters & turns empty docks into higher revenue',
        'angle': 'Emotional / 24/7 Booking — Marina Operators (P1, P2)',
        'headlines': [
            'Don\'t Wait for Next Season',
            'Start Earning THIS Season',
            'Your Marina Books While You Sleep',
            'List Free. Be Found First.',
            '24/7 Bookings. Zero Admin.',
        ],
        'primary_text': (
            "3 a.m. inquiry from a French sailor. Do you respond now — or lose the booking?\n\n"
            "With Mooring Booking, you never miss a reservation again.\n\n"
            "[anchor] Your marina is bookable 24/7 — even when you sleep\n"
            "[OK] Automated confirmations sent instantly\n"
            "[OK] Sailors pay online — no cash, no chasing\n"
            "[OK] Free to list. 15% commission per booking.\n\n"
            "-> Automate your marina reservations now."
        ),
        'description': '24/7 bookings. Zero admin.',
        'cta': 'Register Free',
        'target': 'P1 + P2 | Age 30-63 | Coastal 5km | Interests: marina management, harbour management',
        'note': 'Strong night/24h hook — emotional angle. Good for retargeting visitors who didn\'t convert.',
    },
    {
        'id': 'AD-09',
        'file': 'ad-09-berths-invisible.png',
        'hook': 'Your berths INVISIBLE? Losing the season?',
        'subhook': 'BEFORE/AFTER — AI Captain: Boaters arrive. Revenue EXPLODES.',
        'angle': 'Before/After Transformation — All Segments (P1-P4)',
        'headlines': [
            'Before: Empty. After: Fully Booked.',
            'Invisible to Sailors? Not Anymore.',
            'From Zero Bookings to Full Season',
            '10 Countries. 1 Platform. Free.',
            'List Now — Get Seen Immediately',
        ],
        'primary_text': (
            "Skeptical about listing your marina online?\n\n"
            "Here's the deal:\n"
            "[*] Free to register — no credit card needed\n"
            "[*] You set your availability, prices, and rules\n"
            "[*] You approve or decline any booking\n"
            "[*] 15% commission only when a booking pays out\n"
            "[*] Cancel anytime — no lock-in\n\n"
            "Mooring Booking is built for marina operators, buoy fields, and coastal dock owners "
            "who want international reach — without the risk.\n\n"
            "-> Try it free. No strings attached."
        ),
        'description': 'You set rules. We bring guests.',
        'cta': 'Register Free Now',
        'target': 'P1-P4 | Age 30-63 | Coastal 5km | Objection-handling / skeptic segment',
        'note': 'Before/after format performs very well on Facebook Feed. Test as carousel too.',
    },
    {
        'id': 'AD-10',
        'file': 'ad-10-full-marina-bankruptcy.png',
        'hook': 'Full marina or season BANKRUPTCY?',
        'subhook': 'AI Captain saves marinas & berth owners — Brings boaters. Increases revenue!',
        'angle': 'Extreme FOMO / Fear — Large Marina Operators (P1)',
        'headlines': [
            'Choose: Full Marina or Empty Season',
            'Season 2026 — Are You Listed?',
            'New Platform. First Providers Win.',
            'Season Starts Apr 2. Join Free.',
            'Mediterranean\'s First Mooring Marketplace',
        ],
        'primary_text': (
            "New platform. First season. Limited early spots.\n\n"
            "Mooring Booking is the Mediterranean's new booking marketplace for marinas and mooring operators.\n\n"
            "The marinas that list first get seen first — by sailors from Croatia, Italy, Greece, "
            "Malta, Portugal, and 5 more countries.\n\n"
            "[OK] Free listing — always\n"
            "[OK] 10 countries, 15 languages\n"
            "[OK] Season starts April 2nd\n"
            "[OK] Only 15% when you earn\n\n"
            "-> Claim your spot before the season opens."
        ),
        'description': 'Season starts Apr 2. Join free.',
        'cta': 'Register All Berths Free',
        'target': 'P1 | Age 30-63 | Coastal 5km | Interests: marina management, port management, nautical business',
        'note': 'Bold fear hook — best for broad cold audience. Monitor carefully; pause if CTR < 0.8%.',
    },
]


class PDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_fill_color(*NAVYD)
        self.rect(0, 0, 210, 12, 'F')
        self.set_font('Helvetica', 'B', 7)
        self.set_text_color(*WHITE)
        self.set_xy(10, 2)
        self.cell(130, 8, 'Mooring Booking  |  Week 1 Hook Creatives  |  Campaign: 02.04 - 10.05.2026')
        self.set_xy(140, 2)
        self.cell(60, 8, f'Page {self.page_no()}', align='R')
        self.set_text_color(0, 0, 0)

    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', '', 7)
        self.set_text_color(*GRAY)
        self.cell(0, 8, safe('mooring-booking.com  |  Confidential — Internal Use Only'), align='C')
        self.set_text_color(0, 0, 0)


def cover_page(pdf):
    pdf.add_page()
    # background
    pdf.set_fill_color(*NAVYD)
    pdf.rect(0, 0, 210, 297, 'F')

    # title block
    pdf.set_xy(0, 60)
    pdf.set_font('Helvetica', 'B', 32)
    pdf.set_text_color(*WHITE)
    pdf.cell(210, 14, 'MOORING BOOKING', align='C', ln=True)

    pdf.set_font('Helvetica', 'B', 18)
    pdf.set_text_color(*GOLD)
    pdf.cell(210, 10, 'Week 1 Hook Creatives', align='C', ln=True)

    pdf.set_font('Helvetica', '', 13)
    pdf.set_text_color(*WHITE)
    pdf.cell(210, 8, 'Campaign: 02.04 - 10.05.2026', align='C', ln=True)
    pdf.cell(210, 8, '10 Ad Visuals  |  5 Headlines Each  |  Full Ad Copy', align='C', ln=True)

    # divider
    pdf.set_draw_color(*GOLD)
    pdf.set_line_width(0.8)
    pdf.line(30, 115, 180, 115)

    # stats box
    pdf.set_xy(30, 125)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(*GOLD)
    pdf.cell(150, 8, 'Campaign Overview', align='C', ln=True)

    stats = [
        ('Total Budget', 'EUR 1,200 base + EUR 200 reserve'),
        ('Duration', '39 days (02 Apr - 10 May 2026)'),
        ('Markets', '10 Mediterranean countries'),
        ('Targeting', '5 km from coastline  |  Age 20-63'),
        ('Platform', 'Meta Ads: 70% Facebook / 30% Instagram'),
        ('Goal', '150-300 provider signups'),
        ('Ad Language', 'English only'),
        ('Landing Page', '/become-provider'),
    ]
    for label, value in stats:
        pdf.set_x(30)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*GOLD)
        pdf.cell(55, 7, safe(label + ':'))
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(*WHITE)
        pdf.cell(95, 7, safe(value), ln=True)

    # angles box
    pdf.set_xy(30, 210)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(*GOLD)
    pdf.cell(150, 8, 'Creative Angles Used', align='C', ln=True)

    angles = [
        'A — Revenue Growth (Fill berths, more bookings)',
        'B — Digital Booking System (No more manual)',
        'C — First-Mover / FOMO (Join first, win first)',
        'D — Zero Risk / Free Listing (No upfront cost)',
    ]
    for a in angles:
        pdf.set_x(40)
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(*WHITE)
        pdf.cell(130, 6, safe(a), ln=True)

    pdf.set_text_color(0, 0, 0)


def ad_page(pdf, ad):
    pdf.add_page()
    y = 14  # after header

    # === Top ID + hook bar ===
    pdf.set_fill_color(*NAVYD)
    pdf.rect(0, y, 210, 14, 'F')
    pdf.set_xy(8, y + 1)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(*GOLD)
    pdf.cell(20, 12, safe(ad['id']))
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(*WHITE)
    pdf.cell(170, 12, safe(ad['hook']), ln=True)
    pdf.set_text_color(0, 0, 0)
    y += 16

    # === Angle tag ===
    pdf.set_fill_color(*LIGHT)
    pdf.rect(8, y, 194, 7, 'F')
    pdf.set_xy(10, y + 0.5)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(*NAVY)
    pdf.cell(190, 6, safe('Angle: ' + ad['angle']))
    pdf.set_text_color(0, 0, 0)
    y += 9

    # === Image + right column ===
    img_path = os.path.join(IMG_DIR, ad['file'])
    img_w = 78
    img_h = 78
    img_x = 8
    img_y = y

    if os.path.exists(img_path):
        pdf.image(img_path, x=img_x, y=img_y, w=img_w, h=img_h)
    else:
        pdf.set_fill_color(*LGRAY)
        pdf.rect(img_x, img_y, img_w, img_h, 'F')
        pdf.set_xy(img_x, img_y + 35)
        pdf.set_font('Helvetica', 'I', 8)
        pdf.set_text_color(*GRAY)
        pdf.cell(img_w, 8, '[Image not found]', align='C')
        pdf.set_text_color(0, 0, 0)

    # --- RIGHT SIDE: 5 Headlines ---
    rx = img_x + img_w + 6
    rw = 210 - rx - 8
    ry = img_y

    pdf.set_fill_color(*NAVY)
    pdf.rect(rx, ry, rw, 8, 'F')
    pdf.set_xy(rx + 2, ry + 1)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*WHITE)
    pdf.cell(rw - 4, 6, '5 HEADLINE OPTIONS (Meta Ads)')
    pdf.set_text_color(0, 0, 0)
    ry += 9

    for i, h in enumerate(ad['headlines'], 1):
        # alternating row
        if i % 2 == 0:
            pdf.set_fill_color(*LGRAY)
            pdf.rect(rx, ry, rw, 10, 'F')
        pdf.set_xy(rx + 2, ry + 1)
        pdf.set_font('Helvetica', 'B', 8)
        pdf.set_text_color(*NAVY)
        pdf.cell(8, 8, f'H{i}:')
        pdf.set_font('Helvetica', '', 8)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(rw - 12, 8, safe(h))
        # char count
        pdf.set_font('Helvetica', 'I', 7)
        pdf.set_text_color(*GRAY)
        pdf.cell(0, 8, f'({len(h)} ch)', ln=True)
        pdf.set_text_color(0, 0, 0)
        ry += 10

    # CTA + Description in right column
    ry += 2
    pdf.set_fill_color(*GREEN)
    pdf.rect(rx, ry, rw, 8, 'F')
    pdf.set_xy(rx + 2, ry + 1)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*WHITE)
    pdf.cell(20, 6, 'CTA:')
    pdf.set_font('Helvetica', '', 8)
    pdf.cell(rw - 24, 6, safe(ad['cta']))
    pdf.set_text_color(0, 0, 0)
    ry += 9

    pdf.set_fill_color(*LGRAY)
    pdf.rect(rx, ry, rw, 8, 'F')
    pdf.set_xy(rx + 2, ry + 1)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*NAVY)
    pdf.cell(24, 6, 'Description:')
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(rw - 28, 6, safe(ad['description']))
    pdf.set_text_color(0, 0, 0)
    ry += 9

    y = img_y + img_h + 4

    # === Primary Text ===
    pdf.set_fill_color(*NAVY)
    pdf.rect(8, y, 194, 7, 'F')
    pdf.set_xy(10, y + 1)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*WHITE)
    pdf.cell(190, 5, 'PRIMARY TEXT (Facebook / Instagram)')
    pdf.set_text_color(0, 0, 0)
    y += 8

    pdf.set_fill_color(*LGRAY)
    # measure height
    lines_needed = len(ad['primary_text'].split('\n'))
    box_h = max(lines_needed * 4.5 + 4, 40)
    pdf.rect(8, y, 194, box_h, 'F')
    pdf.set_xy(10, y + 2)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(0, 0, 0)
    for line in ad['primary_text'].split('\n'):
        pdf.set_x(10)
        pdf.cell(190, 4.5, safe(line), ln=True)
    y += box_h + 3

    # === Target + Note ===
    # Two columns
    col_w = 94
    col_gap = 6

    # Target
    pdf.set_fill_color(*NAVYD)
    pdf.rect(8, y, col_w, 7, 'F')
    pdf.set_xy(10, y + 1)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*WHITE)
    pdf.cell(col_w - 4, 5, 'TARGET AUDIENCE')
    pdf.set_text_color(0, 0, 0)

    # Note
    pdf.set_fill_color(*WARN)
    pdf.rect(8 + col_w + col_gap, y, col_w, 7, 'F')
    pdf.set_xy(8 + col_w + col_gap + 2, y + 1)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*WHITE)
    pdf.cell(col_w - 4, 5, 'OPTIMIZATION NOTE')
    pdf.set_text_color(0, 0, 0)
    y += 8

    # Target content
    pdf.set_fill_color(*LIGHT)
    target_lines = []
    for part in ad['target'].split('|'):
        target_lines.append(part.strip())
    th = max(len(target_lines) * 5 + 4, 18)
    pdf.rect(8, y, col_w, th, 'F')
    pdf.set_xy(10, y + 2)
    pdf.set_font('Helvetica', '', 7.5)
    for tl in target_lines:
        pdf.set_x(10)
        pdf.cell(col_w - 4, 5, safe(tl), ln=True)

    # Note content
    pdf.set_fill_color(255, 245, 220)
    pdf.rect(8 + col_w + col_gap, y, col_w, th, 'F')
    pdf.set_xy(8 + col_w + col_gap + 2, y + 2)
    pdf.set_font('Helvetica', 'I', 7.5)
    pdf.set_text_color(80, 40, 0)
    # wrap note text manually
    note = ad.get('note', '')
    words = note.split(' ')
    line_buf = ''
    for w in words:
        test = (line_buf + ' ' + w).strip()
        if len(test) > 52:
            pdf.set_x(8 + col_w + col_gap + 2)
            pdf.cell(col_w - 4, 5, safe(line_buf), ln=True)
            line_buf = w
        else:
            line_buf = test
    if line_buf:
        pdf.set_x(8 + col_w + col_gap + 2)
        pdf.cell(col_w - 4, 5, safe(line_buf), ln=True)
    pdf.set_text_color(0, 0, 0)


def summary_page(pdf):
    pdf.add_page()
    y = 14

    pdf.set_fill_color(*NAVYD)
    pdf.rect(0, y, 210, 12, 'F')
    pdf.set_xy(8, y + 2)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(*WHITE)
    pdf.cell(194, 8, safe('SUMMARY -- All 10 Creatives At a Glance'))
    pdf.set_text_color(0, 0, 0)
    y += 15

    # Table header
    cols = [14, 52, 52, 28, 46]
    headers = ['ID', 'Hook / Visual Headline', 'Recommended Headline', 'CTA', 'Target']
    pdf.set_fill_color(*NAVY)
    pdf.rect(8, y, 194, 8, 'F')
    pdf.set_xy(8, y + 1)
    pdf.set_font('Helvetica', 'B', 7)
    pdf.set_text_color(*WHITE)
    x = 10
    for i, h in enumerate(headers):
        pdf.set_xy(x, y + 1)
        pdf.cell(cols[i], 6, h)
        x += cols[i]
    pdf.set_text_color(0, 0, 0)
    y += 9

    for idx, ad in enumerate(ADS):
        if idx % 2 == 0:
            pdf.set_fill_color(*LGRAY)
        else:
            pdf.set_fill_color(*WHITE)
        pdf.rect(8, y, 194, 10, 'F')

        x = 10
        # ID
        pdf.set_xy(x, y + 1)
        pdf.set_font('Helvetica', 'B', 7)
        pdf.set_text_color(*NAVY)
        pdf.cell(cols[0], 8, safe(ad['id']))
        x += cols[0]

        # Hook
        pdf.set_xy(x, y + 1)
        pdf.set_font('Helvetica', '', 7)
        pdf.set_text_color(0, 0, 0)
        hook_short = ad['hook'][:55] + '...' if len(ad['hook']) > 55 else ad['hook']
        pdf.cell(cols[1], 8, safe(hook_short))
        x += cols[1]

        # Best headline (H1)
        pdf.set_xy(x, y + 1)
        pdf.set_font('Helvetica', 'B', 7)
        pdf.set_text_color(*GREEN)
        h1 = ad['headlines'][0]
        pdf.cell(cols[2], 8, safe(h1))
        x += cols[2]

        # CTA
        pdf.set_xy(x, y + 1)
        pdf.set_font('Helvetica', '', 7)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(cols[3], 8, safe(ad['cta'][:22]))
        x += cols[3]

        # Target (short)
        pdf.set_xy(x, y + 1)
        pdf.set_font('Helvetica', 'I', 6.5)
        pdf.set_text_color(*GRAY)
        tgt_short = ad['target'].split('|')[0].strip()
        pdf.cell(cols[4], 8, safe(tgt_short))

        pdf.set_text_color(0, 0, 0)
        y += 11

    y += 8

    # Recommendations box
    pdf.set_fill_color(*LIGHT)
    pdf.rect(8, y, 194, 8, 'F')
    pdf.set_xy(10, y + 1)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(*NAVY)
    pdf.cell(190, 6, 'STRATEGIC RECOMMENDATIONS')
    pdf.set_text_color(0, 0, 0)
    y += 9

    recs = [
        '[!] AI Captain framing: In primary text, clarify that AI Captain brings sailors TO your marina — so marina owners understand the direct benefit.',
        '[OK] Best performers to test first: AD-02 (empty berths pain), AD-06 (FOMO), AD-09 (before/after) — these formats historically have highest CTR on Facebook.',
        '[!] Add "Free listing + 15% only" as text overlay to at least 3 visuals — this is your #1 objection handler and should be on the creative itself.',
        '[OK] AD-03 time-sensitive hook (April 2nd) — run only Apr 1-10, then swap for a non-date creative.',
        '[!] AD-10 (BANKRUPTCY) — monitor carefully. If CTR < 0.8% after 3 days, pause and replace with AD-06 or AD-02.',
        '[OK] After 7 days (09.04): compare CPA by creative. Kill anything > EUR 15 CPA. Double budget on winner.',
    ]
    pdf.set_fill_color(*LGRAY)
    box_h = len(recs) * 9 + 4
    pdf.rect(8, y, 194, box_h, 'F')
    pdf.set_xy(10, y + 2)
    for r in recs:
        pdf.set_x(10)
        pdf.set_font('Helvetica', '', 8)
        pdf.set_text_color(0, 0, 0)
        pdf.multi_cell(190, 7, safe(r))
    y += box_h + 6

    # Budget reminder
    pdf.set_fill_color(*NAVYD)
    pdf.rect(8, y, 194, 7, 'F')
    pdf.set_xy(10, y + 1)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*GOLD)
    pdf.cell(190, 5, safe('Budget: EUR 1,200 base + EUR 200 reserve  |  Target CPA: < EUR 5  |  Target CTR: > 1.5%  |  Goal: 150-300 signups'))
    pdf.set_text_color(0, 0, 0)


def main():
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=14)
    pdf.set_margins(0, 0, 0)

    cover_page(pdf)
    for ad in ADS:
        ad_page(pdf, ad)
    summary_page(pdf)

    pdf.output(OUT)
    print(f'PDF saved: {OUT}')
    print(f'Pages: {pdf.page}')


if __name__ == '__main__':
    main()
