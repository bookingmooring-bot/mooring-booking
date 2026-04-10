"""
Mooring Booking -- Full Client Campaign PDF
Complete Meta Ads strategy, targeting, creatives, copy, projections.
"""
from fpdf import FPDF
import os

IMG_DIR = 'D:/Desktop/Aplikacije1/Mooring Booking/ad-visuals-week1-hooks'
LOGO    = 'D:/Desktop/Aplikacije1/Mooring Booking/public/logo.jpg'
OUT     = 'C:/Users/User/Downloads/MooringBooking_MetaAds_Campaign_2026.pdf'

# Colors
NAVY   = (15, 90, 140)
NAVYD  = (8, 55, 90)
NAVYL  = (30, 110, 170)
GOLD   = (180, 140, 30)
GOLDD  = (140, 105, 15)
WHITE  = (255, 255, 255)
LIGHT  = (230, 243, 255)
LGRAY  = (245, 247, 250)
GRAY   = (110, 110, 110)
GREEN  = (0, 140, 65)
GREENL = (220, 245, 230)
RED    = (185, 35, 35)
WARN   = (195, 95, 0)
WARNL  = (255, 243, 220)
BLACK  = (20, 20, 20)

def s(t):
    """Safe latin-1 encode"""
    if not t: return ''
    rep = [
        ('\u2014','-'),('\u2013','-'),('\u2019',"'"),('\u2018',"'"),
        ('\u201c','"'),('\u201d','"'),('\u2026','...'),('\u2022','-'),
        ('✅',''),('❌',''),('📈',''),('💻',''),('⚓',''),('🚀',''),
        ('💡',''),('📣',''),('→','->'),('🇭🇷',''),('🇮🇹',''),
        ('🇬🇷',''),('🇪🇸',''),('🇫🇷',''),('🇵🇹',''),('🇸🇮',''),
        ('🇦🇱',''),('🇨🇾',''),('🇹🇷',''),('🇲🇹',''),('🇲🇪',''),
        ('š','s'),('č','c'),('ć','c'),('ž','z'),('đ','d'),
        ('Š','S'),('Č','C'),('Ć','C'),('Ž','Z'),('Đ','D'),
        ('ä','a'),('ö','o'),('ü','u'),('Ü','U'),('ş','s'),('ğ','g'),('İ','I'),('ı','i'),
        ('€','EUR'),
    ]
    for a, b in rep:
        t = t.replace(a, b)
    return t.encode('latin-1', errors='replace').decode('latin-1')


class PDF(FPDF):
    def header(self):
        if self.page_no() <= 1:
            return
        self.set_fill_color(*NAVYD)
        self.rect(0, 0, 210, 11, 'F')
        self.set_font('Helvetica', 'B', 7)
        self.set_text_color(*GOLD)
        self.set_xy(8, 1.5)
        self.cell(100, 8, 'MOORING BOOKING  |  Meta Ads Campaign  |  02 Apr - 10 May 2026')
        self.set_font('Helvetica', '', 7)
        self.set_text_color(*WHITE)
        self.set_xy(140, 1.5)
        self.cell(60, 8, f'Page {self.page_no()}', align='R')
        self.set_text_color(*BLACK)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-11)
        self.set_font('Helvetica', '', 6.5)
        self.set_text_color(*GRAY)
        self.cell(0, 8, s('mooring-booking.com  |  Confidential -- For Client Review Only'), align='C')
        self.set_text_color(*BLACK)

    def hline(self, y, color=None, lw=0.3):
        c = color or LIGHT
        self.set_draw_color(*c)
        self.set_line_width(lw)
        self.line(8, y, 202, y)
        self.set_draw_color(0,0,0)

    def section_header(self, y, title, sub='', color=None):
        c = color or NAVY
        self.set_fill_color(*c)
        self.rect(0, y, 210, 10, 'F')
        self.set_xy(8, y + 1)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*WHITE)
        self.cell(140, 8, s(title))
        if sub:
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(*GOLD)
            self.cell(50, 8, s(sub), align='R')
        self.set_text_color(*BLACK)
        return y + 12

    def kv(self, x, y, w, label, value, lc=None, vc=None, bh=7):
        lcolor = lc or NAVY
        vcolor = vc or BLACK
        self.set_xy(x, y)
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(*lcolor)
        self.cell(w * 0.42, bh, s(label + ':'))
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*vcolor)
        self.cell(w * 0.58, bh, s(value))
        self.set_text_color(*BLACK)


# ── COVER PAGE ─────────────────────────────────────────────────────────────────
def cover(pdf):
    pdf.add_page()
    # Full navy background
    pdf.set_fill_color(*NAVYD)
    pdf.rect(0, 0, 210, 297, 'F')

    # Gold top bar
    pdf.set_fill_color(*GOLD)
    pdf.rect(0, 0, 210, 4, 'F')

    # Logo area
    if os.path.exists(LOGO):
        pdf.image(LOGO, x=85, y=18, w=40)

    # Title
    pdf.set_xy(0, 65)
    pdf.set_font('Helvetica', 'B', 36)
    pdf.set_text_color(*WHITE)
    pdf.cell(210, 16, 'MOORING BOOKING', align='C', ln=True)

    pdf.set_font('Helvetica', '', 16)
    pdf.set_text_color(*GOLD)
    pdf.cell(210, 9, 'Mediterranean Marina & Mooring Platform', align='C', ln=True)

    # Divider
    pdf.set_draw_color(*GOLD)
    pdf.set_line_width(0.6)
    pdf.line(45, 96, 165, 96)

    # Subtitle
    pdf.set_xy(0, 100)
    pdf.set_font('Helvetica', 'B', 20)
    pdf.set_text_color(*WHITE)
    pdf.cell(210, 12, 'META ADS CAMPAIGN PLAN', align='C', ln=True)

    pdf.set_font('Helvetica', '', 12)
    pdf.set_text_color(180, 210, 240)
    pdf.cell(210, 8, s('Paid Social Strategy -- Provider Acquisition'), align='C', ln=True)

    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(*GOLD)
    pdf.cell(210, 8, '02 April  -  10 May 2026', align='C', ln=True)

    # Stats boxes
    stats = [
        ('EUR 1,400', 'Total Budget'),
        ('39 Days', 'Campaign Duration'),
        ('10 Countries', 'Mediterranean Markets'),
        ('150-300+', 'Target Signups'),
    ]
    bw = 40
    gap = 5
    total_w = len(stats) * bw + (len(stats)-1) * gap
    sx = (210 - total_w) / 2

    for i, (val, lab) in enumerate(stats):
        bx = sx + i * (bw + gap)
        pdf.set_fill_color(*NAVYL)
        pdf.rect(bx, 138, bw, 22, 'F')
        pdf.set_draw_color(*GOLD)
        pdf.set_line_width(0.4)
        pdf.rect(bx, 138, bw, 22, 'D')
        pdf.set_xy(bx, 140)
        pdf.set_font('Helvetica', 'B', 13)
        pdf.set_text_color(*GOLD)
        pdf.cell(bw, 8, s(val), align='C', ln=True)
        pdf.set_xy(bx, 148)
        pdf.set_font('Helvetica', '', 7)
        pdf.set_text_color(*WHITE)
        pdf.cell(bw, 6, s(lab), align='C')

    # Contents
    pdf.set_xy(35, 175)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(*GOLD)
    pdf.cell(140, 7, 'DOCUMENT CONTENTS', align='C', ln=True)

    contents = [
        '1. Campaign Overview & Strategy',
        '2. Target Markets & Ad Set Structure',
        '3. Location Targeting (5km Coastal)',
        '4. Ad Creatives -- 10 Hook Visuals',
        '5. Ad Copy -- All Angles & Variations',
        '6. Performance Projections & KPIs',
        '7. Campaign Timeline & Optimization',
        '8. Pre-Launch Checklist',
    ]
    for line in contents:
        pdf.set_x(55)
        pdf.set_font('Helvetica', '', 8.5)
        pdf.set_text_color(180, 210, 240)
        pdf.cell(100, 6.5, s(line), ln=True)

    # Bottom
    pdf.set_xy(0, 270)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(*GRAY)
    pdf.cell(210, 7, 'Prepared for client review  |  mooring-booking.com  |  April 2026', align='C')

    pdf.set_text_color(*BLACK)
    pdf.set_draw_color(0,0,0)


# ── PAGE 2: CAMPAIGN OVERVIEW ──────────────────────────────────────────────────
def page_overview(pdf):
    pdf.add_page()
    y = 13

    y = pdf.section_header(y, '1. CAMPAIGN OVERVIEW', 'Meta Ads -- Provider Acquisition')

    # Two columns
    col = 94
    gap = 8
    lx = 8
    rx = lx + col + gap

    # Left -- campaign details
    pdf.set_fill_color(*LGRAY)
    pdf.rect(lx, y, col, 68, 'F')
    pdf.set_xy(lx + 2, y + 2)
    pdf.set_font('Helvetica', 'B', 8.5)
    pdf.set_text_color(*NAVY)
    pdf.cell(col - 4, 7, 'CAMPAIGN PARAMETERS')
    pdf.set_text_color(*BLACK)

    params = [
        ('Objective', 'Provider signups (/become-provider)'),
        ('Platform', 'Meta Ads (Facebook + Instagram)'),
        ('Launch date', '02 April 2026'),
        ('End date', '10 May 2026'),
        ('Duration', '39 days'),
        ('Base budget', 'EUR 1,200'),
        ('Reserve', 'EUR 200 (scale winners in T3-T4)'),
        ('Max total', 'EUR 1,400'),
        ('Daily avg spend', 'EUR 35 / day'),
        ('FB / IG split', '70% Facebook  /  30% Instagram'),
        ('Language', 'English (all ads)'),
        ('Creative', 'Marina visuals -- full and empty berths'),
    ]
    cy = y + 10
    for lbl, val in params:
        pdf.set_xy(lx + 3, cy)
        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(*NAVY)
        pdf.cell(38, 4.8, s(lbl + ':'))
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(*BLACK)
        pdf.cell(col - 44, 4.8, s(val))
        cy += 5

    # Right -- why Meta
    pdf.set_fill_color(*LIGHT)
    pdf.rect(rx, y, col, 68, 'F')
    pdf.set_xy(rx + 2, y + 2)
    pdf.set_font('Helvetica', 'B', 8.5)
    pdf.set_text_color(*NAVY)
    pdf.cell(col - 4, 7, 'WHY META ADS?')
    pdf.set_text_color(*BLACK)

    reasons = [
        ('Demand generation', 'Marina operators don\'t search "list my marina" -- we must interrupt their feed'),
        ('Visual product', 'Marina images = high engagement, strong social proof'),
        ('Coastal targeting', '5km radius from coastline = surgical precision audience'),
        ('Lower CPM', 'Mediterranean CPM EUR 1-5 vs Google EUR 3-10+'),
        ('B2B community', 'Marina owners, sailing clubs active on Facebook'),
        ('Mobile-first', '80%+ of Meta traffic is mobile -- fast LP critical'),
    ]
    ry = y + 10
    for title, desc in reasons:
        pdf.set_xy(rx + 3, ry)
        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(*NAVYD)
        pdf.cell(col - 6, 5, s(title))
        ry += 5
        pdf.set_xy(rx + 3, ry)
        pdf.set_font('Helvetica', '', 7)
        pdf.set_text_color(*GRAY)
        pdf.cell(col - 6, 4.5, s(desc))
        ry += 5.5

    y += 72

    # Strategy one-liner
    pdf.set_fill_color(*NAVYD)
    pdf.rect(8, y, 194, 12, 'F')
    pdf.set_xy(10, y + 2)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(*GOLD)
    pdf.cell(190, 8, s('STRATEGY: Run Meta Ads in coastal zones (5km) across 10 Mediterranean countries -- message: "List your marina free, earn more this season."'))
    pdf.set_text_color(*BLACK)
    y += 15

    # Target segments
    y = pdf.section_header(y, 'TARGET SEGMENTS -- Provider Acquisition Priority')

    segs = [
        ('P1', 'Large Marina Operators', 'Marina management boards, directors', 'Revenue growth, digital tools, international reach', NAVY),
        ('P2', 'Small Marina Operators', 'Owners of smaller marina complexes', 'Easy digital booking, zero upfront cost, grow occupancy', NAVYL),
        ('P3', 'Buoy / Mooring Field Operators', 'Licensed commercial mooring/buoy field operators', 'Reach more sailors, manage from one dashboard', GREEN),
        ('P4', 'Coastal Dock Owners', 'Owners of private dock, quay, or pier (legal rental)', 'Monetize idle dock space, passive season income', GOLDD),
    ]

    col4 = 46
    for i, (pri, seg, who, msg, col) in enumerate(segs):
        bx = 8 + i * (col4 + 2)
        pdf.set_fill_color(*col)
        pdf.rect(bx, y, col4, 8, 'F')
        pdf.set_xy(bx, y + 1)
        pdf.set_font('Helvetica', 'B', 8)
        pdf.set_text_color(*WHITE)
        pdf.cell(col4, 6, s(f'{pri} -- {seg}'), align='C')
        pdf.set_text_color(*BLACK)

        pdf.set_fill_color(*LGRAY)
        pdf.rect(bx, y + 8, col4, 28, 'F')
        pdf.set_xy(bx + 1, y + 10)
        pdf.set_font('Helvetica', 'B', 6.5)
        pdf.set_text_color(*NAVY)
        pdf.multi_cell(col4 - 2, 4.5, s('Who: ' + who))
        pdf.set_xy(bx + 1, y + 23)
        pdf.set_font('Helvetica', 'I', 6.5)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(col4 - 2, 4.5, s('Message: ' + msg))
        pdf.set_text_color(*BLACK)

    y += 40

    # Targeting parameters box
    y = pdf.section_header(y, 'TARGETING PARAMETERS')

    tp = [
        ('Location radius', 'STRICT 5km from coastline only -- not city centres, not 20km'),
        ('Age', '20 - 63'),
        ('Gender', 'Primarily male (marina operators predominantly male)'),
        ('Interests', 'Marina management, Harbour management, Nautical business, Sailing, Boating, Marina operator'),
        ('Ad language', 'English only -- works across all 10 target countries for nautical audience'),
        ('Excluded', 'Montenegro (ME) -- not in this campaign'),
    ]
    tcy = y
    for i, (lbl, val) in enumerate(tp):
        bg = LGRAY if i % 2 == 0 else WHITE
        pdf.set_fill_color(*bg)
        pdf.rect(8, tcy, 194, 7, 'F')
        pdf.set_xy(10, tcy + 1)
        pdf.set_font('Helvetica', 'B', 8)
        pdf.set_text_color(*NAVY)
        pdf.cell(50, 5, s(lbl + ':'))
        pdf.set_font('Helvetica', '', 8)
        pdf.set_text_color(*BLACK)
        pdf.cell(140, 5, s(val))
        tcy += 7

    y = tcy + 4

    # Objections handled
    y = pdf.section_header(y, 'KEY OBJECTIONS & HOW ADS ADDRESS THEM')

    objs = [
        ('"15% commission is too high"', 'Ads lead with "earn EUR 5,000+ season" -- you keep 85% of a mooring earning EUR 0 today'),
        ('"I don\'t trust strangers"', 'Reviews, boat profiles, you approve every booking -- platform handles trust'),
        ('"I don\'t have time"', '"10 minutes to list" + "automated confirmations" -- less than 5 min/week admin'),
        ('"Nobody will find my mooring"', '15 languages, 10 countries, Google ranking, QR codes -- international reach'),
    ]
    for i, (obj, ans) in enumerate(objs):
        bg = LGRAY if i % 2 == 0 else WHITE
        pdf.set_fill_color(*bg)
        pdf.rect(8, y, 194, 8, 'F')
        pdf.set_xy(10, y + 1)
        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(*RED)
        pdf.cell(68, 6, s(obj))
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(*BLACK)
        pdf.cell(122, 6, s('-> ' + ans))
        y += 8


# ── PAGE 3: TARGET MARKETS & BUDGET ───────────────────────────────────────────
def page_markets(pdf):
    pdf.add_page()
    y = 13

    y = pdf.section_header(y, '2. TARGET MARKETS & AD SET STRUCTURE', '10 Mediterranean Countries')

    # Ad set table
    headers = ['Ad Set', 'Countries', 'Budget', 'Daily', 'Est. CPM', 'Focus']
    widths  = [16, 52, 18, 14, 18, 70]

    pdf.set_fill_color(*NAVY)
    pdf.rect(8, y, 194, 8, 'F')
    hx = 10
    for h, w in zip(headers, widths):
        pdf.set_xy(hx, y + 1)
        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(*WHITE)
        pdf.cell(w, 6, s(h))
        hx += w
    pdf.set_text_color(*BLACK)
    y += 9

    rows = [
        ('SET 1',  'HR - Croatia',                        'EUR 195', 'EUR 5.00', 'EUR 1-3',   'Full Adriatic coast -- primary market, cheapest CPM, strong sailing culture'),
        ('SET 2a', 'IT - Italy (Adriatic)',                'EUR 90',  'EUR 2.31', 'EUR 3-5',   'Trieste, Venezia, Ancona, Bari, Brindisi -- Adriatic coast only'),
        ('SET 2b', 'IT - Italy (Mediterranean)',           'EUR 105', 'EUR 2.69', 'EUR 3-6',   'Genova, Napoli, Palermo+Sicily, Cagliari+Sardinia, Tyrrenian coast'),
        ('SET 3',  'GR - Greece',                         'EUR 195', 'EUR 5.00', 'EUR 2-5',   'All islands + coastal 5km; Athens = ONLY Piraeus/coast, not full city'),
        ('SET 4',  'ES + FR + PT',                        'EUR 195', 'EUR 5.00', 'EUR 4-7',   'Mediterranean elite: Balearics, Cote d\'Azur, Algarve'),
        ('SET 5',  'SI + AL + CY + TR + MT',              'EUR 195', 'EUR 5.00', 'EUR 0.5-4', 'Cheap coastal markets; strict 5km only; Turkey moved here from SET 4'),
        ('RETARG', 'All countries',                       'EUR 97',  'EUR 2.49', '-',         'Visitors to /become-provider who didn\'t complete registration'),
        ('B2B',    'HR + IT + GR (P1 priority)',          'EUR 146', 'EUR 3.75', 'EUR 4-8',   'Marina Manager targeting: management, harbour, nautical business interests'),
        ('RESERVE','Best performing set (T3-T4)',         'EUR 195', '-',        '-',         'Not spent evenly -- held for scaling the winning market/creative in week 3-4'),
    ]

    for i, row in enumerate(rows):
        bg = LGRAY if i % 2 == 0 else WHITE
        pdf.set_fill_color(*bg)
        rh = 9 if i not in [0, 4, 5, 8] else 9
        pdf.rect(8, y, 194, rh, 'F')
        rx2 = 10
        for j, (val, w) in enumerate(zip(row, widths)):
            pdf.set_xy(rx2, y + 1)
            if j == 0:
                pdf.set_font('Helvetica', 'B', 7.5)
                pdf.set_text_color(*NAVY)
            elif j == 2:
                pdf.set_font('Helvetica', 'B', 7.5)
                pdf.set_text_color(*GREEN)
            else:
                pdf.set_font('Helvetica', '', 7.5)
                pdf.set_text_color(*BLACK)
            pdf.cell(w, 7, s(val))
            rx2 += w
        pdf.set_text_color(*BLACK)
        y += rh

    # Total row
    pdf.set_fill_color(*NAVYD)
    pdf.rect(8, y, 194, 9, 'F')
    pdf.set_xy(10, y + 1)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*WHITE)
    pdf.cell(widths[0] + widths[1], 7, 'TOTAL')
    pdf.set_text_color(*GOLD)
    pdf.cell(widths[2], 7, 'EUR 1,413')
    pdf.set_font('Helvetica', 'I', 7.5)
    pdf.set_text_color(*WHITE)
    pdf.cell(160, 7, s('  Reduce SET 2b by EUR 13 to stay within EUR 1,400 max'))
    pdf.set_text_color(*BLACK)
    y += 12

    # Country detail
    y = pdf.section_header(y, '3. LOCATION TARGETING -- 5km Coastal Detail', 'All targeting: strict 5km from coastline')

    country_data = [
        ('SET 1', 'HR', 'Croatia', NAVY,
         'Full Adriatic coast: Split, Dubrovnik, Rijeka, Zadar, Sibenik, Pula, Rovinj, Hvar, Korcula, Omis, Makarska, Trogir, Primosten, Biograd + all coastal towns 5km'),
        ('SET 2a','IT', 'Italy -- Adriatic', NAVYL,
         'Trieste, Venezia Mestre, Ravenna, Ancona, Pescara, Bari, Brindisi, Taranto + all Adriatic coastal towns 5km'),
        ('SET 2b','IT', 'Italy -- Mediterranean', NAVYL,
         'Genova, La Spezia, Livorno, Civitavecchia, Naples, Salerno, Reggio Calabria, Messina  |  SICILY: Palermo, Catania, Siracusa, Trapani  |  SARDINIA: Cagliari, Olbia, Alghero, Sassari coast'),
        ('SET 3', 'GR', 'Greece', (0,120,60),
         'Coast: Thessaloniki, Kavala, Patras, Corinth coast  |  Athens: ONLY Piraeus/Phaleron 5km -- NOT full city  |  ISLANDS: Corfu, Rhodes, Crete (Heraklion/Chania/Rethymno), Zakynthos, Kefalonia, Lesbos, Chios, Samos, Mykonos, Santorini + all islands'),
        ('SET 4', 'ES', 'Spain', (150,0,0),
         'Barcelona coast, Valencia, Alicante, Palma de Mallorca, Malaga, Almeria, Tarragona  |  ISLANDS: Ibiza, Formentera, Menorca'),
        ('SET 4', 'FR', 'France', (0,0,150),
         'Marseille, Toulon, Nice, Cannes, Antibes, Perpignan coast + full Cote d\'Azur 5km'),
        ('SET 4', 'PT', 'Portugal (grouped w/ ES+FR)', WARN,
         'Algarve: Portimao, Faro, Lagos, Tavira  |  Lisbon coast: Cascais, Sesimbra, Setubal  |  Not a priority -- grouped with ES+FR, no separate budget'),
        ('SET 5', 'SI', 'Slovenia', (0,100,50),
         'ONLY 3 cities: Koper, Izola, Portoróz -- not the whole country'),
        ('SET 5', 'AL', 'Albania', (100,50,0),
         'Durres/Drac + Tirana district (includes Durres coastal area), Vlora, Saranda + south towards Greece -- coastal only'),
        ('SET 5', 'CY', 'Cyprus', (0,100,100),
         'COAST ONLY: Limassol, Larnaca, Paphos, Ayia Napa -- NOT the interior'),
        ('SET 5', 'TR', 'Turkey (moved from SET 4)', (150,50,0),
         'Bodrum, Marmaris, Antalya, Fethiye, Gocek, Kusadasi, Cesme, Izmir coast -- Moved from Spain/France group'),
        ('SET 5', 'MT', 'Malta', (80,0,80),
         'Full island: Valletta, Sliema, St. Julian\'s, Marsaxlokk, Birgu (entire island = coastal)'),
    ]

    for setid, code, name, col, locs in country_data:
        rh = 11
        pdf.set_fill_color(*LGRAY)
        pdf.rect(8, y, 194, rh, 'F')
        # Set ID badge
        pdf.set_fill_color(*col)
        pdf.rect(8, y, 14, rh, 'F')
        pdf.set_xy(8, y + 2)
        pdf.set_font('Helvetica', 'B', 6)
        pdf.set_text_color(*WHITE)
        pdf.cell(14, 7, s(setid), align='C')
        # Country code
        pdf.set_xy(23, y + 1.5)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*col)
        pdf.cell(10, 8, s(code))
        # Country name
        pdf.set_xy(33, y + 1.5)
        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(*NAVYD)
        pdf.cell(35, 5, s(name))
        # Locations
        pdf.set_xy(33, y + 6)
        pdf.set_font('Helvetica', '', 6.5)
        pdf.set_text_color(*GRAY)
        pdf.cell(167, 4.5, s(locs[:130] + ('...' if len(locs) > 130 else '')))
        pdf.set_text_color(*BLACK)
        y += rh + 1

    # Warning
    y += 2
    pdf.set_fill_color(*WARNL)
    pdf.rect(8, y, 194, 11, 'F')
    pdf.set_draw_color(*WARN)
    pdf.set_line_width(0.5)
    pdf.rect(8, y, 194, 11, 'D')
    pdf.set_xy(10, y + 2)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*WARN)
    pdf.cell(20, 7, s('NOTE:'))
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(*BLACK)
    pdf.cell(170, 7, s('Montenegro (ME) is EXCLUDED. SI, AL, CY: coastal cities only -- do NOT target the whole country. Athens: ONLY Piraeus 5km, not the full city.'))
    pdf.set_draw_color(0,0,0)



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
    {
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
            "AI Captain saves your marina! Brings boaters, fills berths and boosts your revenue.\n\n"
            + _V1 + "\n\n"
            "Register your berths for free in the mooring-booking database now "
            "and be the first recommended by AI Captain."
        ),
        'desc': 'Free listing. Be first. 15% only.',
        'cta':  'Register Free Now',
        'target': 'P1 + P2 | Age 20-63 | Coastal 5km | Marina management, nautical business',
        'note': 'Priority test ad. Run all markets Week 1. Var 1.',
    },
    {
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
            "Empty berths killing your revenue? AI Captain saves them -- brings boaters and increases earnings.\n\n"
            + _V1 + "\n\n"
            "Fill the form in 60 seconds and register for free. "
            "Let AI Captain send boaters straight to you."
        ),
        'desc': 'Free. Fill form in 60 seconds.',
        'cta':  'Fill the Form -- 60 Seconds',
        'target': 'P1 + P2 | Age 20-63 | Coastal 5km | Revenue/business interests',
        'note': 'STRONGEST pain hook -- expected highest CTR. Run all markets first. Var 1.',
    },
    {
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
            "Is your marina sinking into emptiness? AI Captain is the savior: boaters arrive, revenue grows.\n\n"
            + _V1 + "\n\n"
            "Join the revolution today -- register your berths for free in mooring-booking "
            "and secure higher revenue this season."
        ),
        'desc': 'Free listing. Join the revolution.',
        'cta':  'Join the Revolution Free',
        'target': 'P1 + P2 | Age 20-63 | Coastal 5km | Season urgency',
        'note': 'TIME-SENSITIVE: Most effective Apr 1-10 only. Swap after Apr 15. Var 1.',
    },
    {
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
            "AI Captain saves everything -- brings boaters and increases your income.\n\n"
            + _V2 + "\n\n"
            "Don't let the competition be faster -- fill the form and register all berths for free now."
        ),
        'desc': 'Free listing. 15% per booking.',
        'cta':  'Fill Form -- Register Free Now',
        'target': 'P3 + P4 | Age 20-63 | Coastal 5km | Mooring field, buoy rental, sea concession',
        'note': 'Run as SEPARATE ad set from P1/P2. HR + GR first. Var 2.',
    },
    {
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
            "Concession paid, but berths empty? AI Captain saves your business -- brings boaters directly to you.\n\n"
            + _V2 + "\n\n"
            "Do it for free today -- register your berths in the mooring-booking database "
            "and let AI Captain work for you."
        ),
        'desc': 'Free to list. Pay 15% only.',
        'cta':  'Do It Free Today',
        'target': 'P3 | Age 25-60 | Coastal 5km | Commercial maritime, sea concession operator',
        'note': 'Very specific to concession holders -- high relevance, smaller audience. HR + GR. Var 2.',
    },
    {
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
            "AI Captain saves your docks and berths -- brings boaters and fills the cash register.\n\n"
            + _V1 + "\n\n"
            "Don't miss this opportunity -- register your berths for free right now and become visible."
        ),
        'desc': 'Free listing. Become visible now.',
        'cta':  'Register Free Right Now',
        'target': 'P1-P4 | Age 20-63 | All markets | Broad FOMO test',
        'note': 'Broad audience test -- identifies best-converting market. Var 1.',
    },
    {
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
            "Saves mooring fields and anchorages, brings boaters and raises revenue.\n\n"
            + _V3 + "\n\n"
            "Join the revolution for free -- fill the form and register your berths in mooring-booking now."
        ),
        'desc': 'Free. Priority for first movers.',
        'cta':  'Fill the Form Now',
        'target': 'P2 | Age 30-60 | Coastal 5km | Small marina, boating facility operator',
        'note': 'First-mover angle. Good for IT + ES + FR markets. Var 3.',
    },
    {
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
            "AI Captain brings boaters and turns empty docks into higher revenue.\n\n"
            + _V3 + "\n\n"
            "Don't wait for next season -- register your berths for free in the database "
            "and start earning more this year."
        ),
        'desc': 'Free listing. Start earning now.',
        'cta':  'Register Free -- Start Earning',
        'target': 'P1 + P2 | Age 30-63 | Coastal 5km | Marina management, harbour management',
        'note': 'Rescue/urgency hook. Excellent for RETARGETING non-converters. Var 3.',
    },
    {
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
            "AI Captain saves everything -- boaters arrive, revenue explodes.\n\n"
            + _V2 + "\n\n"
            "Be first -- fill the form in 30 seconds and register them for free in mooring-booking."
        ),
        'desc': 'You keep 85%. Free to list.',
        'cta':  'Fill Form in 30 Seconds',
        'target': 'P1-P4 | Age 30-63 | All markets | Objection-handling segment',
        'note': 'Before/after format -- high FB Feed performance. Var 2 highlights 15% commission clearly.',
    },
    {
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
            "AI Captain saves marinas and berth owners -- brings boaters and increases revenue!\n\n"
            + _V3 + "\n\n"
            "Choose a full marina -- register all your berths for free in the mooring-booking database right now."
        ),
        'desc': 'Season starts Apr 2. Join free.',
        'cta':  'Register All Berths Free',
        'target': 'P1 | Age 30-63 | HR + IT + GR priority | Large marina, port management',
        'note': 'Bold fear hook. Monitor: if CTR < 0.8% after 3 days, pause -- replace with AD-02. Var 3.',
    },
]

def page_creative(pdf, ad, num):
    pdf.add_page()
    y = 13

    # Header bar
    pdf.set_fill_color(*NAVYD)
    pdf.rect(0, y, 210, 12, 'F')
    pdf.set_xy(8, y + 1.5)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(*GOLD)
    pdf.cell(18, 9, s(ad['id']))
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(*WHITE)
    pdf.cell(140, 9, s(ad['hook']))
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(*GOLD)
    pdf.cell(40, 9, s(f'Creative {num}/10'), align='R')
    pdf.set_text_color(*BLACK)
    y += 14

    # Angle tag
    pdf.set_fill_color(*LIGHT)
    pdf.rect(8, y, 194, 7, 'F')
    pdf.set_xy(10, y + 1)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(*NAVY)
    pdf.cell(190, 5, s(ad['angle']))
    pdf.set_text_color(*BLACK)
    y += 8

    # IMAGE (left) + HEADLINES (right)
    IW = 80
    IH = 80
    IX = 8
    IY = y

    img_path = os.path.join(IMG_DIR, ad['file'])
    if os.path.exists(img_path):
        pdf.image(img_path, x=IX, y=IY, w=IW, h=IH)
    else:
        pdf.set_fill_color(*LGRAY)
        pdf.rect(IX, IY, IW, IH, 'F')
        pdf.set_xy(IX, IY + 36)
        pdf.set_font('Helvetica', 'I', 8)
        pdf.set_text_color(*GRAY)
        pdf.cell(IW, 6, '[Visual not found]', align='C')
        pdf.set_text_color(*BLACK)

    # RIGHT COLUMN
    RX = IX + IW + 6
    RW = 210 - RX - 8
    ry = IY

    # 5 headlines block
    pdf.set_fill_color(*NAVYD)
    pdf.rect(RX, ry, RW, 8, 'F')
    pdf.set_xy(RX + 2, ry + 1)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*WHITE)
    pdf.cell(RW - 4, 6, '5 HEADLINE OPTIONS  (Meta Ads -- max 40 chars)')
    pdf.set_text_color(*BLACK)
    ry += 9

    for i, h in enumerate(ad['headlines'], 1):
        bg = LGRAY if i % 2 == 1 else WHITE
        pdf.set_fill_color(*bg)
        pdf.rect(RX, ry, RW, 9, 'F')
        pdf.set_xy(RX + 2, ry + 1)
        pdf.set_font('Helvetica', 'B', 8)
        pdf.set_text_color(*NAVY)
        pdf.cell(9, 7, s(f'H{i}:'))
        pdf.set_font('Helvetica', '', 8)
        pdf.set_text_color(*BLACK)
        pdf.cell(RW - 24, 7, s(h))
        pdf.set_font('Helvetica', 'I', 7)
        pdf.set_text_color(*GRAY)
        pdf.cell(12, 7, s(f'({len(h)}c)'), align='R')
        pdf.set_text_color(*BLACK)
        ry += 9

    ry += 3

    # CTA
    pdf.set_fill_color(*GREEN)
    pdf.rect(RX, ry, RW, 8, 'F')
    pdf.set_xy(RX + 2, ry + 1)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*WHITE)
    pdf.cell(16, 6, 'CTA:')
    pdf.set_font('Helvetica', 'B', 8)
    pdf.cell(RW - 20, 6, s(ad['cta']))
    pdf.set_text_color(*BLACK)
    ry += 9

    # Description
    pdf.set_fill_color(*LIGHT)
    pdf.rect(RX, ry, RW, 8, 'F')
    pdf.set_xy(RX + 2, ry + 1)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*NAVY)
    pdf.cell(24, 6, 'Description:')
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(*BLACK)
    pdf.cell(RW - 28, 6, s(ad['desc']))

    y = IY + IH + 5

    # PRIMARY TEXT
    pdf.set_fill_color(*NAVYD)
    pdf.rect(8, y, 194, 8, 'F')
    pdf.set_xy(10, y + 1)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(*WHITE)
    pdf.cell(140, 6, 'PRIMARY TEXT -- Ready to paste into Meta Ads Manager')
    pdf.set_text_color(*BLACK)
    y += 9

    lines = ad['primary'].split('\n')
    line_h = 4.5
    box_h = max(len(lines) * line_h + 5, 38)
    pdf.set_fill_color(*LGRAY)
    pdf.rect(8, y, 194, box_h, 'F')
    pdf.set_xy(10, y + 2.5)
    for line in lines:
        if not line.strip():
            pdf.set_xy(10, pdf.get_y() + 1.5)
            continue
        pdf.set_x(10)
        if line.startswith('Running') or line.startswith('What if') or line.startswith('Still') or \
           line.startswith('3 a.m') or line.startswith('Skeptical') or line.startswith('Mooring Booking') or \
           line.startswith('New platform') or line.startswith('No subscription') or \
           line.startswith('What if you') or line.startswith('The 2026') or \
           line.startswith('Your marina') or line.startswith('Boats pass'):
            pdf.set_font('Helvetica', 'B', 7.5)
            pdf.set_text_color(*NAVYD)
        elif line.startswith('Free') or line.startswith('Set ') or line.startswith('Digital') or \
             line.startswith('Only ') or line.startswith('List in') or line.startswith('Sailors from') or \
             line.startswith('More bookings') or line.startswith('International') or \
             line.startswith('Automated') or line.startswith('Real-time') or \
             line.startswith('Zero') or line.startswith('Without') or line.startswith('With Mooring') or \
             line.startswith('Guests book') or line.startswith('Payments') or \
             line.startswith('No monthly') or line.startswith('First providers') or \
             line.startswith('Reach sailors') or line.startswith('Your marina is') or \
             line.startswith('Cancel') or line.startswith('You approve') or \
             line.startswith('15%') or line.startswith('10 countries') or \
             line.startswith('Season starts') or line.startswith('The marinas'):
            pdf.set_font('Helvetica', '', 7.5)
            pdf.set_text_color(*GREEN)
        else:
            pdf.set_font('Helvetica', '', 7.5)
            pdf.set_text_color(*BLACK)
        pdf.cell(190, line_h, s(line), ln=True)
    pdf.set_text_color(*BLACK)
    y += box_h + 3

    # Target + Note (two columns)
    CW = 95
    # Target
    pdf.set_fill_color(*NAVY)
    pdf.rect(8, y, CW, 7, 'F')
    pdf.set_xy(10, y + 1)
    pdf.set_font('Helvetica', 'B', 7.5)
    pdf.set_text_color(*WHITE)
    pdf.cell(CW - 4, 5, 'TARGET AUDIENCE & PLACEMENT')
    # Note
    pdf.set_fill_color(*WARN)
    pdf.rect(8 + CW + 4, y, CW, 7, 'F')
    pdf.set_xy(10 + CW + 4, y + 1)
    pdf.set_font('Helvetica', 'B', 7.5)
    pdf.set_text_color(*WHITE)
    pdf.cell(CW - 4, 5, 'OPTIMIZATION NOTE')
    pdf.set_text_color(*BLACK)
    y += 8

    th = 16
    pdf.set_fill_color(*LIGHT)
    pdf.rect(8, y, CW, th, 'F')
    pdf.set_xy(10, y + 2)
    for part in ad['target'].split('|'):
        pdf.set_x(10)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(*NAVY)
        pdf.cell(CW - 4, 5, s(part.strip()), ln=True)

    pdf.set_fill_color(*WARNL)
    pdf.rect(8 + CW + 4, y, CW, th, 'F')
    pdf.set_xy(12 + CW + 4, y + 2)
    pdf.set_font('Helvetica', 'I', 7.5)
    pdf.set_text_color(100, 50, 0)
    note = ad.get('note', '')
    words = note.split()
    buf = ''
    for w in words:
        test = (buf + ' ' + w).strip()
        if len(test) > 55:
            pdf.set_x(12 + CW + 4)
            pdf.cell(CW - 8, 5, s(buf), ln=True)
            buf = w
        else:
            buf = test
    if buf:
        pdf.set_x(12 + CW + 4)
        pdf.cell(CW - 8, 5, s(buf), ln=True)
    pdf.set_text_color(*BLACK)


# ── PAGE: COPY ANGLES OVERVIEW ────────────────────────────────────────────────
def page_copy_angles(pdf):
    pdf.add_page()
    y = 13

    y = pdf.section_header(y, '5. AD COPY -- Angles & Variations', '4 Angles  x  3 Variations = 12 Ready-to-Use Copy Sets')

    # Explanation box
    pdf.set_fill_color(*LIGHT)
    pdf.rect(8, y, 194, 14, 'F')
    pdf.set_xy(10, y + 2)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(*NAVY)
    pdf.cell(190, 6, 'HOW TO USE: Each visual creative (AD-01 to AD-10) is PAIRED with a copy variation (A1-D3).')
    pdf.set_xy(10, y + 8)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(*GRAY)
    pdf.cell(190, 5, s('Example: AD-02 visual (empty berths) + Copy A1 (Revenue Growth) = 1 complete Facebook ad ready to publish.'))
    pdf.set_text_color(*BLACK)
    y += 17

    angles = [
        ('A', 'Revenue Growth', 'P1 + P2', NAVY, [
            ('A1','Fill Your Berths This Season','Running a marina? Your empty berths are costing you money every day they sit unused...','Learn More'),
            ('A2','Boost Your Marina\'s Revenue','What if every empty berth in your marina generated revenue -- automatically?...','Sign Up'),
            ('A3','Ready for Season 2026?','The 2026 Mediterranean sailing season starts April 2nd. Is your marina ready?...','Sign Up'),
        ]),
        ('B', 'Digital Booking System', 'P2', NAVYL, [
            ('B1','Digital Bookings for Your Marina','Still taking marina reservations by phone and email? Mooring Booking gives your marina a professional digital booking system -- for free...','Sign Up'),
            ('B2','No More Manual Reservations','Your marina deserves better than a WhatsApp group for reservations...','Sign Up'),
            ('B3','Your Marina Books While You Sleep','3 a.m. inquiry from a French sailor. Do you respond now -- or lose the booking?...','Learn More'),
        ]),
        ('C', 'First-Mover / FOMO', 'P1-P4', GREEN, [
            ('C1','Be First on Mooring Booking','Mooring Booking just launched -- and we\'re building our first 500 marinas across the Mediterranean...','Sign Up'),
            ('C2','New Platform. First Providers Win.','New platform. First season. Limited early spots. The marinas that list first get seen first...','Sign Up'),
            ('C3','Season Opens April 2nd. Ready?','The 2026 Mediterranean sailing season is weeks away. Is your marina listed yet?...','Sign Up'),
        ]),
        ('D', 'Zero Risk / Free Listing', 'P3 + P4', GOLDD, [
            ('D1','Earn With Zero Upfront Cost','What if you could earn from your dock, buoy field, or pier -- with zero upfront cost?...','Sign Up'),
            ('D2','Zero Fees Until You Earn','No subscription. No setup fee. No risk. Only charges 15% when you earn...','Sign Up'),
            ('D3','Full Control. Zero Risk. Free.','Skeptical about listing your marina online? Free to register, you approve every booking, 15% only when paid out...','Learn More'),
        ]),
    ]

    for angle_id, angle_name, target, col, versions in angles:
        # Angle header
        pdf.set_fill_color(*col)
        pdf.rect(8, y, 194, 9, 'F')
        pdf.set_xy(10, y + 1)
        pdf.set_font('Helvetica', 'B', 9.5)
        pdf.set_text_color(*WHITE)
        pdf.cell(15, 7, s(f'ANGLE {angle_id}:'))
        pdf.set_font('Helvetica', 'B', 9.5)
        pdf.cell(80, 7, s(angle_name))
        pdf.set_font('Helvetica', 'I', 8)
        pdf.set_text_color(*GOLD if col != GOLDD else WHITE)
        pdf.cell(95, 7, s(f'Primary target: {target}'), align='R')
        pdf.set_text_color(*BLACK)
        y += 10

        # 3 versions
        vw = (194 - 4) / 3
        for vi, (vid, headline, preview, cta_btn) in enumerate(versions):
            vx = 8 + vi * (vw + 2)
            bg = LGRAY if vi % 2 == 0 else WHITE
            pdf.set_fill_color(*bg)
            pdf.rect(vx, y, vw, 28, 'F')

            # Version ID
            pdf.set_fill_color(*col)
            pdf.rect(vx, y, vw, 7, 'F')
            pdf.set_xy(vx + 2, y + 1)
            pdf.set_font('Helvetica', 'B', 8.5)
            pdf.set_text_color(*WHITE)
            pdf.cell(vw - 4, 5, s(f'Version {vid}'))
            pdf.set_text_color(*BLACK)

            # Headline
            pdf.set_xy(vx + 2, y + 8)
            pdf.set_font('Helvetica', 'B', 7.5)
            pdf.set_text_color(*NAVYD)
            pdf.cell(vw - 4, 5, s(headline[:42]))

            # Preview
            pdf.set_xy(vx + 2, y + 14)
            pdf.set_font('Helvetica', 'I', 6.5)
            pdf.set_text_color(*GRAY)
            preview_lines = [preview[i:i+42] for i in range(0, min(len(preview),84), 42)]
            for pl in preview_lines[:2]:
                pdf.set_x(vx + 2)
                pdf.cell(vw - 4, 4.5, s(pl), ln=True)

            # CTA
            pdf.set_xy(vx + 2, y + 23)
            pdf.set_fill_color(*GREEN)
            pdf.rect(vx + 2, y + 23, vw - 4, 5, 'F')
            pdf.set_font('Helvetica', 'B', 6.5)
            pdf.set_text_color(*WHITE)
            pdf.cell(vw - 4, 5, s(f'CTA: {cta_btn}'), align='C')
            pdf.set_text_color(*BLACK)

        y += 31

    y += 3

    # Pairing guide
    y = pdf.section_header(y, 'RECOMMENDED CREATIVE + COPY PAIRINGS', 'Start with these 5 combinations in Week 1')

    pairings = [
        ('AD-02 + A1', 'Empty berths + Revenue Growth', 'Strongest pain hook + revenue angle. Expected highest CTR. Run ALL markets.', '★★★★★'),
        ('AD-06 + C1', 'Boats pass by + First-Mover FOMO', 'Broad audience test. Will identify best-converting market quickly.', '★★★★☆'),
        ('AD-09 + D3', 'Before/After + Zero Risk', 'Facebook Feed format. Skeptic segment. Best for retargeting.', '★★★★☆'),
        ('AD-01 + A2', 'AI Captain + Boost Revenue', 'Confidence/authority angle. Good for P1 (large marina managers).', '★★★☆☆'),
        ('AD-07 + B1', 'Best friend + Digital Bookings', 'Digital system angle. Best for P2 (small marinas still on WhatsApp).', '★★★☆☆'),
    ]

    for i, (pair, combo, why, stars) in enumerate(pairings):
        bg = LGRAY if i % 2 == 0 else WHITE
        pdf.set_fill_color(*bg)
        pdf.rect(8, y, 194, 8, 'F')
        pdf.set_xy(10, y + 1)
        pdf.set_font('Helvetica', 'B', 8)
        pdf.set_text_color(*NAVY)
        pdf.cell(28, 6, s(pair))
        pdf.set_font('Helvetica', 'B', 8)
        pdf.set_text_color(*NAVYD)
        pdf.cell(45, 6, s(combo))
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(*BLACK)
        pdf.cell(110, 6, s(why))
        pdf.set_font('Helvetica', 'B', 8)
        pdf.set_text_color(*GOLDD)
        pdf.cell(10, 6, s(stars))
        pdf.set_text_color(*BLACK)
        y += 8


# ── PAGE: PROJECTIONS ──────────────────────────────────────────────────────────
def page_projections(pdf):
    pdf.add_page()
    y = 13

    y = pdf.section_header(y, '6. PERFORMANCE PROJECTIONS', '02 Apr - 10 May 2026  |  39 days')

    # Projection table
    headers = ['Metric', 'Conservative', 'Realistic', 'Optimistic']
    widths  = [55, 45, 45, 45]

    pdf.set_fill_color(*NAVY)
    pdf.rect(8, y, 194, 8, 'F')
    px = 10
    for h, w in zip(headers, widths):
        pdf.set_xy(px, y + 1)
        pdf.set_font('Helvetica', 'B', 8)
        pdf.set_text_color(*WHITE)
        pdf.cell(w, 6, s(h))
        px += w
    pdf.set_text_color(*BLACK)
    y += 9

    rows = [
        ('Total Budget',           'EUR 1,200',   'EUR 1,200',    'EUR 1,400 (+ reserve)'),
        ('Avg CPM',                'EUR 4.00',    'EUR 3.00',     'EUR 2.00'),
        ('Impressions',            '300,000',     '400,000',      '700,000'),
        ('CTR (link click)',        '1.0%',        '1.5%',         '2.0%'),
        ('Link Clicks',            '3,000',       '6,000',        '14,000'),
        ('CPC',                    'EUR 0.40',    'EUR 0.20',     'EUR 0.10'),
        ('Landing Page CVR',       '2%',          '4%',           '6%'),
        ('Provider Signups',       '60',          '240',          '840'),
        ('CPA (per signup)',        'EUR 20',      'EUR 5',        'EUR 1.67'),
    ]

    highlight_rows = {'Provider Signups', 'CPA (per signup)'}

    for i, row in enumerate(rows):
        is_hl = row[0] in highlight_rows
        bg = LIGHT if is_hl else (LGRAY if i % 2 == 0 else WHITE)
        pdf.set_fill_color(*bg)
        pdf.rect(8, y, 194, 8, 'F')
        rx2 = 10
        for j, (val, w) in enumerate(zip(row, widths)):
            pdf.set_xy(rx2, y + 1)
            if j == 0:
                pdf.set_font('Helvetica', 'B' if is_hl else '', 8)
                pdf.set_text_color(*NAVY)
            elif j == 2:  # realistic
                pdf.set_font('Helvetica', 'B', 8)
                pdf.set_text_color(*GREEN if is_hl else BLACK)
            else:
                pdf.set_font('Helvetica', '', 8)
                pdf.set_text_color(*GRAY)
            pdf.cell(w, 6, s(val))
            rx2 += w
        pdf.set_text_color(*BLACK)
        y += 8

    y += 4

    # KPI Targets
    y = pdf.section_header(y, 'KPI TARGETS -- Decision Rules', color=GREEN)

    kpis = [
        ('Target CPA', '< EUR 5 per provider signup (realistic scenario)'),
        ('CTR target', '> 1.5% link click-through rate'),
        ('CPM target', '< EUR 3 (HR/GR)   |   < EUR 1 (AL/SI coastal)'),
        ('CPC target', '< EUR 0.30 per link click'),
        ('Signups goal', '150 - 300+ signups in 39 days'),
        ('PAUSE rule', 'If CPA > EUR 15 after 7 days on any ad set -- pause and reallocate budget'),
        ('SCALE rule', 'If CPA < EUR 5 -- increase budget 20% every 3-4 days until CPA rises'),
    ]
    for i, (lbl, val) in enumerate(kpis):
        bg = GREENL if i % 2 == 0 else WHITE
        pdf.set_fill_color(*bg)
        pdf.rect(8, y, 194, 7, 'F')
        pdf.set_xy(10, y + 1)
        pdf.set_font('Helvetica', 'B', 8)
        pdf.set_text_color(*GREEN)
        pdf.cell(40, 5, s(lbl + ':'))
        pdf.set_font('Helvetica', '', 8)
        pdf.set_text_color(*BLACK)
        pdf.cell(150, 5, s(val))
        y += 7

    y += 6

    # Timeline
    y = pdf.section_header(y, '7. CAMPAIGN TIMELINE & OPTIMIZATION SCHEDULE')

    phases = [
        ('T1', '02 - 09 Apr', 'LAUNCH WEEK -- Experimental Phase',
         NAVY,
         [
             '02 Apr (Wed): LAUNCH -- all campaigns live with minimum budgets',
             '03-07 Apr: DO NOT TOUCH -- Meta learning phase (needs 3-5 days data)',
             '08 Apr (Sun): First check -- any campaigns spending abnormally?',
             '09 Apr (Mon): Review data. No decisions yet -- just monitor.',
         ]),
        ('T2', '10 - 16 Apr', 'ANALYSIS -- Kill Losers, Scale Winners',
         GREEN,
         [
             '10 Apr: Full Week 1 analysis -- which market, which creative, which angle?',
             'PAUSE: Any ad set with CPA > EUR 15 or CTR < 0.5%',
             'SCALE: Increase budget 20% on best CPA performers',
             '14 Apr: Launch retargeting campaign for /become-provider visitors',
         ]),
        ('T3', '17 - 30 Apr', 'SCALING -- Reserve Budget Deployed',
         WARN,
         [
             '17 Apr: Deploy EUR 195 reserve budget into proven winning market/creative',
             '20-25 Apr: Further scaling -- double down on best performing combination',
             '28 Apr: Mid-campaign report -- total signups, CPA by market, creative fatigue check',
             'Refresh creatives if ad frequency > 3x per user',
         ]),
        ('T4', '01 - 10 May', 'FINAL PUSH -- Max Budget on Proven Combos',
         RED,
         [
             '01 May: Maximum budget on top 2-3 ad sets only',
             '05 May: Final check -- any last-minute creative swap needed?',
             '10 May: CAMPAIGN END -- full report: total signups, CPA, best market, best creative',
             'Post-campaign: Lookalike audience ready for next campaign phase',
         ]),
    ]

    for ph_id, dates, title, col, items in phases:
        # Phase header
        pdf.set_fill_color(*col)
        pdf.rect(8, y, 194, 9, 'F')
        pdf.set_xy(10, y + 1.5)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*WHITE)
        pdf.cell(14, 6, s(ph_id))
        pdf.set_font('Helvetica', 'B', 9)
        pdf.cell(30, 6, s(dates))
        pdf.set_font('Helvetica', 'B', 9)
        pdf.cell(140, 6, s(title))
        pdf.set_text_color(*BLACK)
        y += 10

        for item in items:
            pdf.set_fill_color(*LGRAY)
            pdf.rect(8, y, 194, 6.5, 'F')
            pdf.set_xy(14, y + 1)
            pdf.set_font('Helvetica', '', 7.5)
            pdf.set_text_color(*BLACK)
            pdf.cell(186, 4.5, s('- ' + item))
            y += 6.5
        y += 3


# ── PAGE: SETUP CHECKLIST ─────────────────────────────────────────────────────
def page_checklist(pdf):
    pdf.add_page()
    y = 13

    y = pdf.section_header(y, '8. PRE-LAUNCH CHECKLIST', 'Complete before 02 April 2026')

    sections = [
        ('Meta Ads Setup', [
            ('Facebook Business Manager account active and verified', False),
            ('Facebook Page "Mooring Booking" published and verified', False),
            ('Instagram Business account connected to FB Page', False),
            ('Meta Pixel installed on mooringbooking.com', False),
            ('Custom Conversion event: "CompleteRegistration" on /become-provider thank-you', False),
            ('Custom Audience: website visitors (last 30 days) created', False),
            ('Ad creatives uploaded to Meta Ads Manager (all 10 images)', False),
            ('UTM parameters defined per campaign and ad set', False),
            ('Targeting confirmed: 5km coastal, age 20-63, English language', False),
        ]),
        ('Targeting Review', [
            ('SET 1 HR: Full Adriatic coast confirmed, 5km radius', False),
            ('SET 2a IT-Adriatic: Trieste-Bari corridor, 5km only', False),
            ('SET 2b IT-Mediterranean: Genova, Naples, Sicily, Sardinia -- 5km only', False),
            ('SET 3 GR: Athens = ONLY Piraeus 5km; all islands added', False),
            ('SET 4 ES+FR+PT: Coastal 5km; Balearics, Cote d\'Azur included', False),
            ('SET 5 SI: ONLY Koper, Izola, Portoróz', False),
            ('SET 5 AL: Durres, Tirana district, Vlore, Saranda -- coastal only', False),
            ('SET 5 CY: Limassol, Larnaca, Paphos, Ayia Napa -- no interior', False),
            ('SET 5 TR: Bodrum, Marmaris, Antalya, Fethiye, Kusadasi -- coastal only', False),
            ('Montenegro (ME) EXCLUDED from all targeting sets', False),
        ]),
        ('Landing Page & Tracking', [
            ('/become-provider page working on mobile (80%+ Meta traffic is mobile)', False),
            ('Page load speed < 3 seconds on mobile', False),
            ('Meta Pixel script verified on /become-provider page', False),
            ('Facebook domain verification completed', False),
            ('Google Analytics 4 active and tracking', False),
            ('Conversion tracking tested end-to-end', False),
            ('Lead form question finalized (Option A or B -- confirm with Dragan)', False),
        ]),
        ('Creative & Copy', [
            ('All 10 ad visuals reviewed and approved', False),
            ('Primary text copy for each ad finalized (use versions from this document)', False),
            ('Headlines selected from 5 options per ad', False),
            ('CTAs and descriptions confirmed for each ad', False),
            ('All ads English-only confirmed', False),
        ]),
    ]

    for sect_title, items in sections:
        pdf.set_fill_color(*NAVYD)
        pdf.rect(8, y, 194, 8, 'F')
        pdf.set_xy(10, y + 1)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*WHITE)
        pdf.cell(190, 6, s(sect_title))
        pdf.set_text_color(*BLACK)
        y += 9

        for i, (item, done) in enumerate(items):
            bg = LGRAY if i % 2 == 0 else WHITE
            pdf.set_fill_color(*bg)
            pdf.rect(8, y, 194, 7, 'F')
            # Checkbox
            pdf.set_fill_color(*WHITE)
            pdf.rect(11, y + 1.5, 4, 4, 'F')
            pdf.set_draw_color(*GRAY)
            pdf.set_line_width(0.3)
            pdf.rect(11, y + 1.5, 4, 4, 'D')
            pdf.set_draw_color(0,0,0)
            pdf.set_xy(17, y + 1)
            pdf.set_font('Helvetica', '', 8)
            pdf.set_text_color(*BLACK)
            pdf.cell(183, 5, s(item))
            y += 7

        y += 4

    # Next steps box
    y = pdf.section_header(y, 'NEXT STEPS -- What We Need From You', color=GREEN)

    steps = [
        ('1', 'REVIEW this document', 'Confirm ad creatives, copy, targeting, and budget are approved'),
        ('2', 'CONFIRM lead form question', 'Option A: "Are you a marina owner?" OR Option B: "Want more berth bookings?" -- decide with Dragan'),
        ('3', 'APPROVE budget', 'EUR 1,200 base + EUR 200 reserve = max EUR 1,400 for 39-day campaign'),
        ('4', 'ACCESS Meta Business Manager', 'Provide access or confirm account is ready for ad setup'),
        ('5', 'CONFIRM landing page', 'Verify /become-provider is live, fast on mobile, Pixel installed'),
        ('6', 'SIGN OFF & LAUNCH', 'Once all above confirmed, campaign goes live 02 April 2026'),
    ]

    for num, action, detail in steps:
        pdf.set_fill_color(*GREENL)
        pdf.rect(8, y, 194, 10, 'F')
        pdf.set_fill_color(*GREEN)
        pdf.rect(8, y, 12, 10, 'F')
        pdf.set_xy(8, y + 1.5)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*WHITE)
        pdf.cell(12, 7, s(num), align='C')
        pdf.set_xy(22, y + 1.5)
        pdf.set_font('Helvetica', 'B', 8.5)
        pdf.set_text_color(*GREEN)
        pdf.cell(45, 7, s(action))
        pdf.set_font('Helvetica', '', 8)
        pdf.set_text_color(*BLACK)
        pdf.cell(135, 7, s(detail))
        y += 11

    # Final note
    y += 4
    pdf.set_fill_color(*NAVYD)
    pdf.rect(8, y, 194, 12, 'F')
    pdf.set_xy(10, y + 2)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(*GOLD)
    pdf.cell(190, 5, s('GOAL: 150-300 mooring provider signups in 39 days  |  Target CPA: < EUR 5  |  Budget: max EUR 1,400'), align='C')
    pdf.set_xy(10, y + 7)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(*WHITE)
    pdf.cell(190, 4.5, s('Mediterranean: HR + IT + GR + ES + FR + PT + SI + AL + CY + TR + MT  |  5km coastal targeting  |  English ads  |  Facebook 70% + Instagram 30%'), align='C')
    pdf.set_text_color(*BLACK)


# ── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=13)
    pdf.set_margins(0, 0, 0)

    print('Building PDF...')
    cover(pdf)
    print('  Cover done')

    page_overview(pdf)
    print('  Overview done')

    page_markets(pdf)
    print('  Markets & targeting done')

    print('  Building creatives...')
    pdf.add_page()
    y2 = 13
    y2 = pdf.section_header(y2, '4. AD CREATIVES -- Week 1 Hook Visuals', '10 creatives  |  5 headlines each  |  Full copy included')
    pdf.set_fill_color(*LGRAY)
    pdf.rect(8, y2, 194, 14, 'F')
    pdf.set_xy(10, y2 + 2)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(*NAVY)
    pdf.cell(190, 6, s('All 10 creatives follow on the next pages. Each page contains: visual, 5 headlines, primary text, CTA, target audience.'))
    pdf.set_xy(10, y2 + 8)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(*GRAY)
    pdf.cell(190, 5, s('Creative rules: All visuals show marinas (full and empty) -- NOT individual moorings or buoys. All ads in English only.'))
    pdf.set_text_color(*BLACK)

    for i, ad in enumerate(ADS, 1):
        page_creative(pdf, ad, i)
        print(f'    AD-{i:02d} done')

    page_copy_angles(pdf)
    print('  Copy angles done')

    page_projections(pdf)
    print('  Projections & timeline done')

    page_checklist(pdf)
    print('  Checklist done')

    pdf.output(OUT)
    print(f'\nPDF saved: {OUT}')
    print(f'Total pages: {pdf.page}')


if __name__ == '__main__':
    main()
