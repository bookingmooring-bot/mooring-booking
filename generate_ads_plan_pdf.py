"""
Mooring Booking — Ads Plan PDF (Updated: 02.04–10.05.2026)
Budget: EUR 1.200 + EUR 200 reserve | 10 countries | 5 km coastal
"""
from fpdf import FPDF
from datetime import datetime
import os

LOGO = 'D:/Desktop/Aplikacije1/Mooring Booking/public/logo.jpg'
OUT  = 'C:/Users/User/Downloads/MooringBooking_Ads_Plan_April2026.pdf'

NAVY   = (15, 90, 140)
NAVYD  = (8, 55, 90)
GOLD   = (180, 140, 30)
WHITE  = (255, 255, 255)
LIGHT  = (230, 243, 255)
GRAY   = (100, 100, 100)
LGRAY  = (245, 247, 250)
GREEN  = (0, 130, 60)
RED    = (180, 30, 30)

def safe(s):
    if not s: return ''
    for a, b in [('š','s'),('č','c'),('ć','c'),('ž','z'),('đ','d'),
                 ('Š','S'),('Č','C'),('Ć','C'),('Ž','Z'),('Đ','D'),
                 ('ä','a'),('ö','o'),('ü','u'),('→','->'),('€','EUR'),
                 ('─','─'),('═','='),('│','|'),('┌','+'),('┐','+'),
                 ('└','+'),('┘','+'),('├','+'),('┤','+'),('┬','+'),
                 ('┴','+'),('┼','+'),('•','-'),('✅','[OK]'),('⚠️','[!]'),
                 ('\u2500','-'),('\u2502','|'),('\u250c','+'),('\u2510','+'),
                 ('\u2014','-'),('\u2013','-'),('\u2019',"'"),('\u2018',"'"),
                 ('\u201c','"'),('\u201d','"'),('\u2026','...'),]:
        s = s.replace(a, b)
    return s.encode('latin-1', errors='replace').decode('latin-1')

class PDF(FPDF):
    def __init__(self):
        super().__init__()
        self.current_section = ''

    def header(self):
        if self.page_no() == 1:
            return
        self.set_fill_color(*NAVYD)
        self.rect(0, 0, 210, 14, 'F')
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(*WHITE)
        self.set_xy(10, 3)
        self.cell(100, 8, 'Mooring Booking  |  Ads Plan  |  02.04 - 10.05.2026')
        self.set_xy(110, 3)
        self.cell(90, 8, safe(self.current_section), align='R')
        self.set_text_color(0,0,0)
        self.ln(16)

    def footer(self):
        self.set_y(-13)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*GRAY)
        self.cell(0, 8, safe(f'Stranica {self.page_no()} / {{nb}}   |   Mooring Booking d.o.o.   |   mooring-booking.com   |   {datetime.now().strftime("%d.%m.%Y")}'), align='C')
        self.set_text_color(0,0,0)

def h1(pdf, txt, color=NAVY):
    pdf.set_font('Helvetica','B',20)
    pdf.set_text_color(*color)
    pdf.cell(0, 12, safe(txt), ln=True)
    pdf.set_text_color(0,0,0)

def h2(pdf, txt, color=NAVY):
    pdf.set_font('Helvetica','B',13)
    pdf.set_text_color(*color)
    y = pdf.get_y()
    pdf.set_fill_color(*GOLD)
    pdf.rect(10, y+1, 4, 9, 'F')
    pdf.set_xy(17, y)
    pdf.cell(0, 11, safe(txt), ln=True)
    pdf.set_text_color(0,0,0)
    pdf.ln(1)

def body(pdf, txt, size=10, color=(40,40,40)):
    pdf.set_font('Helvetica','',size)
    pdf.set_text_color(*color)
    pdf.multi_cell(0, 6, safe(txt))
    pdf.set_text_color(0,0,0)

def divider(pdf, color=GOLD):
    pdf.set_fill_color(*color)
    pdf.rect(10, pdf.get_y(), 190, 1, 'F')
    pdf.ln(4)

def stat_card(pdf, x, y, w, h, title, value, sub='', bg=LIGHT, fg=NAVY):
    pdf.set_fill_color(*bg)
    pdf.rect(x, y, w, h, 'F')
    pdf.set_fill_color(*fg)
    pdf.rect(x, y, 3, h, 'F')
    pdf.set_xy(x+5, y+2)
    pdf.set_font('Helvetica','',7)
    pdf.set_text_color(*GRAY)
    pdf.cell(w-8, 5, safe(title.upper()))
    pdf.set_xy(x+5, y+8)
    pdf.set_font('Helvetica','B',16)
    pdf.set_text_color(*fg)
    pdf.cell(w-8, 9, safe(str(value)))
    if sub:
        pdf.set_xy(x+5, y+18)
        pdf.set_font('Helvetica','',7)
        pdf.set_text_color(*GRAY)
        pdf.cell(w-8, 5, safe(sub))
    pdf.set_text_color(0,0,0)

def row(pdf, cells, widths, bg=(255,255,255), bold_first=False, height=7):
    pdf.set_fill_color(*bg)
    for i,(txt,w) in enumerate(zip(cells, widths)):
        pdf.set_font('Helvetica','B' if (bold_first and i==0) else '',8)
        pdf.set_fill_color(*bg)
        pdf.cell(w, height, safe(str(txt)), fill=True, border=0)
    pdf.ln()

def table_header(pdf, cells, widths, bg=NAVY):
    pdf.set_fill_color(*bg)
    pdf.set_text_color(*WHITE)
    pdf.set_font('Helvetica','B',8)
    for txt,w in zip(cells, widths):
        pdf.cell(w, 8, safe(txt), fill=True)
    pdf.ln()
    pdf.set_text_color(0,0,0)

# ────────────────────────────────────────────────────────────
pdf = PDF()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=16)

# ╔══════════════════════════════════════════════════════════╗
# ║  NASLOVNA STRANICA                                       ║
# ╚══════════════════════════════════════════════════════════╝
pdf.add_page()

pdf.set_fill_color(*NAVYD)
pdf.rect(0, 0, 210, 297, 'F')

pdf.set_fill_color(*GOLD)
pdf.rect(0, 0, 210, 6, 'F')
pdf.rect(0, 291, 210, 6, 'F')

if os.path.exists(LOGO):
    from PIL import Image as PILImage
    logo = PILImage.open(LOGO)
    logo_w = 55
    pdf.image(LOGO, x=210//2 - logo_w//2, y=35, w=logo_w)

pdf.set_xy(0, 100)
pdf.set_font('Helvetica','B',36)
pdf.set_text_color(*WHITE)
pdf.cell(210, 16, 'ADVERTISING PLAN', align='C', ln=True)

pdf.set_font('Helvetica','B',22)
pdf.set_text_color(*GOLD)
pdf.cell(210, 12, 'Meta Ads  |  02.04. - 10.05.2026.', align='C', ln=True)

pdf.ln(6)
pdf.set_font('Helvetica','',12)
pdf.set_text_color(180, 210, 240)
pdf.cell(210, 8, 'Mediterranean Expansion  |  Coastal Targeting 5 km', align='C', ln=True)

pdf.ln(6)
pdf.set_fill_color(*GOLD)
pdf.rect(55, pdf.get_y(), 100, 1.5, 'F')
pdf.ln(12)

# Key numbers box
pdf.set_fill_color(20, 70, 115)
pdf.rect(25, pdf.get_y(), 160, 55, 'F')
pdf.set_fill_color(*GOLD)
pdf.rect(25, pdf.get_y(), 3, 55, 'F')

y_box = pdf.get_y() + 5
stats = [
    ('EUR 1.200', 'Bazni budzet'),
    ('10', 'Zemalja'),
    ('5 km', 'od obale'),
    ('39 dana', '02.04 - 10.05'),
]
for i,(val,lbl) in enumerate(stats):
    x = 33 + i*38
    pdf.set_xy(x, y_box)
    pdf.set_font('Helvetica','B',15)
    pdf.set_text_color(*GOLD)
    pdf.cell(36, 10, val, align='C')
    pdf.set_xy(x, y_box+11)
    pdf.set_font('Helvetica','',7)
    pdf.set_text_color(180,210,240)
    pdf.cell(36, 6, lbl, align='C')

pdf.ln(65)
pdf.set_font('Helvetica','',10)
pdf.set_text_color(150,190,230)
pdf.cell(210, 7, safe(f'Pripremio: Mooring Booking tim  |  {datetime.now().strftime("%d.%m.%Y")}'), align='C', ln=True)
pdf.cell(210, 7, 'Za internu upotrebu i prezentaciju partnerima', align='C', ln=True)

# ╔══════════════════════════════════════════════════════════╗
# ║  1. REZULTATI DO SADA                                    ║
# ╚══════════════════════════════════════════════════════════╝
pdf.add_page()
pdf.current_section = '1. Rezultati do sada'
pdf.ln(2)

h1(pdf, '1. Rezultati dosad  (12.03 - 31.03.2026.)')
body(pdf, 'Prva faza kampanja pokazala je izvanredne rezultate koji su osnova za ekspanziju.', color=GRAY)
pdf.ln(4)

y0 = pdf.get_y()
stat_card(pdf, 10,  y0, 43, 28, 'Ukupno leadova',     '70',        'iz Meta forme',        bg=LIGHT,           fg=NAVY)
stat_card(pdf, 56,  y0, 43, 28, 'Registrirali se',    '42',        '60% konverzija',       bg=(210,240,215),   fg=GREEN)
stat_card(pdf, 102, y0, 43, 28, 'Cost per lead',      '$3.83',     'odlicno za novu app',  bg=(255,248,220),   fg=(160,100,0))
stat_card(pdf, 148, y0, 52, 28, 'Ukupno potroseno',   '$363',      '20 dana, 2 kampanje',  bg=LIGHT,           fg=NAVY)
pdf.ln(34)

y0 = pdf.get_y()
stat_card(pdf, 10,  y0, 43, 28, 'CTR Leads kampanji', '3.05%',     'prosjek ind. 1%',      bg=LIGHT, fg=NAVY)
stat_card(pdf, 56,  y0, 43, 28, 'Reach',              '51k',       '2 kampanje ukupno',    bg=LIGHT, fg=NAVY)
stat_card(pdf, 102, y0, 43, 28, 'Drzava #1',          'Crna Gora', '34% svih leadova',     bg=LIGHT, fg=NAVY)
stat_card(pdf, 148, y0, 52, 28, 'Balance na accountu', 'EUR 1.735','dostupno za April',    bg=(210,240,215), fg=GREEN)
pdf.ln(36)

divider(pdf)
h2(pdf, 'Konverzijski lijevak')
pdf.ln(2)

funnel = [
    ('Meta Lead Form popunjena',     70,  100.0, NAVY),
    ('Registrirali se u aplikaciji', 42,   60.0, GREEN),
    ('Dodali mooring listing',        0,    0.0, RED),
]
for label, val, pct, color in funnel:
    bar_w = max(3, int(pct * 1.55))
    y_now = pdf.get_y()
    pdf.set_fill_color(*color)
    pdf.rect(10, y_now+1, bar_w, 7, 'F')
    pdf.set_font('Helvetica','',8.5)
    pdf.set_xy(168, y_now)
    pdf.set_text_color(*color)
    pdf.cell(40, 9, safe(f'{label}: {val}  ({pct}%)'))
    pdf.set_text_color(0,0,0)
    pdf.ln(11)

pdf.ln(3)
pdf.set_fill_color(255, 240, 200)
pdf.rect(10, pdf.get_y(), 190, 14, 'F')
pdf.set_xy(13, pdf.get_y()+2)
pdf.set_font('Helvetica','B',9)
pdf.set_text_color(140, 80, 0)
pdf.cell(0, 5, safe('Kljucni uvid: Nitko od registriranih providera nije jos dodao mooring listing.'))
pdf.set_xy(13, pdf.get_y()+5)
pdf.set_font('Helvetica','',8)
pdf.cell(0, 5, safe('Prioritet: onboarding follow-up email sekvenca + poboljsanje UX za dodavanje listinga.'))
pdf.set_text_color(0,0,0)
pdf.ln(20)

divider(pdf)
h2(pdf, 'Geografska raspodijela leadova (Faza 1)')
pdf.ln(2)

countries_results = [('Crna Gora', 25, 35.7), ('Hrvatska', 22, 31.4), ('SAD/Ostalo', 6, 8.6), ('Nepoznato', 17, 24.3)]
w_cols = [70, 60, 60]
table_header(pdf, ['Drzava', 'Broj leadova', '% od ukupnog'], w_cols)
for i,(country, cnt, pct) in enumerate(countries_results):
    bg = LGRAY if i%2==0 else WHITE
    row(pdf, [country, cnt, f'{pct}%'], w_cols, bg=bg)

# ╔══════════════════════════════════════════════════════════╗
# ║  2. PLAN EKSPANZIJE — 10 ZEMALJA                         ║
# ╚══════════════════════════════════════════════════════════╝
pdf.add_page()
pdf.current_section = '2. Plan ekspanzije'
pdf.ln(2)

h1(pdf, '2. Plan ekspanzije — 10 mediteranskih zemalja')
body(pdf, safe('Na osnovu analize prve faze, sirimo se na priobalna podrucja 10 mediteranskih zemalja. Targetiranje: iskljucivo 5 km od obalne crte. Crna Gora je izostavljena iz ove kampanje.'), color=GRAY)
pdf.ln(4)

h2(pdf, safe('Odabrana trzista (10 zemalja)'))
pdf.ln(2)

markets = [
    ('Hrvatska + Italija',           'HR, IT', 'Jadransko more — zajednicki plovidbeni prostor, najveci broj plovila. Svi priobalni gradovi.', '+++++'),
    ('Grcka',                        'GR',     'Otocna kultura jedrenja, island hopping, Atena/Pirej, Krf, Rodos, Kreta — visoka potraznja.', '++++'),
    ('Spanija + Francuska + Turska', 'ES,FR,TR','Mediteranska elita, duga plovidbena sezona. Barcelna, Marseille, Bodrum, Antalya.', '+++'),
    ('Malta',                        'MT',     'Mali otok, cijeli island = priobalan. Valletta, Sliema, Marsaxlokk.', '+++'),
    ('Portugal',                     'PT',     'Atlantska obala — Algarve, Lisbon coast, Cascais, Portimao, Lagos, Faro.', '+++'),
    ('Slovenija*',                   'SI',     'SAMO: Koper, Izola, Portooz — ne cijela zemlja. Jeftini ads.', '++'),
    ('Albanija*',                    'AL',     'SAMO: Durres/Drac + jug prema Grckoj. Vlorae, Sarande. Ne cijela zemlja.', '++'),
    ('Kipar*',                       'CY',     'SAMO obala: Limassol, Larnaca, Paphos, Ayia Napa. Ne unutrasnjost.', '++'),
]

w_m = [48, 16, 100, 26]
table_header(pdf, ['Trziste', 'Kod', 'Priobalne lokacije', 'Prioritet'], w_m)
for i, (mkt, code, reason, prio) in enumerate(markets):
    bg = LGRAY if i%2==0 else WHITE
    row(pdf, [mkt, code, reason, prio], w_m, bg=bg, height=9)
    pdf.ln(1)

pdf.ln(2)
pdf.set_fill_color(255, 240, 200)
pdf.rect(10, pdf.get_y(), 190, 12, 'F')
pdf.set_xy(13, pdf.get_y()+2)
pdf.set_font('Helvetica','B',8)
pdf.set_text_color(140, 80, 0)
pdf.cell(0, 4, safe('* SI, AL, CY: iskljucivo priobalni gradovi - NE targetirati unutrasnjost ovih zemalja!'), ln=True)
pdf.set_xy(13, pdf.get_y())
pdf.set_font('Helvetica','',8)
pdf.cell(0, 4, safe('Crna Gora (ME) je ISKLJUCENA iz ove kampanje.'))
pdf.set_text_color(0,0,0)
pdf.ln(16)

divider(pdf)
h2(pdf, safe('Priobalno targetiranje — 5 km od obalne crte'))
body(pdf, safe('Kljucna inovacija: targetiranje je strogo ograniceno na 5 km od obalne crte (prethodno 20 km). Ovo osigurava da reklame vide iskljucivo operatori marina, vlasnici vezova i plovila koji zive ili rade neposredno uz more.'), color=GRAY)
pdf.ln(3)

coastal = [
    ('Hrvatska',       'Svi obalni gradovi', 'Split, Dubrovnik, Rijeka, Zadar, Sibenik, Pula, Rovinj, Hvar, Korcula, Makarska, Trogir...'),
    ('Italija',        'Svi obalni gradovi', 'Genova, Ancona, Bari, Napulj, Palermo, Trst, Brindisi, Taranto, Livorno, Venezia...'),
    ('Grcka',          'Svi otoci + obala',  'Atena/Pirej, Krf, Rodos, Heraklion, Chania, Thessaloniki, Patras, Zakynthos...'),
    ('Malta + Kipar',  'Cijeli otok / obala','MT: Valletta, Sliema. CY: Limassol, Larnaca, Paphos (ne unutrasnjost)'),
    ('Portugal',       'Algarve + Lisabon',  'Cascais, Portimao, Lagos, Faro, Tavira, Sesimbra, Peniche, Viana do Castelo'),
    ('SI + AL',        'SAMO priobalni',     'SI: Koper, Izola, Portooz. AL: Durres, Vlorae, Sarande — ne ostatak zemlje'),
]

w_c = [38, 38, 114]
table_header(pdf, ['Trziste', 'Pokrivenost', 'Kljucni gradovi (5km radius)'], w_c)
for i,(mkt, cnt, cities) in enumerate(coastal):
    bg = LGRAY if i%2==0 else WHITE
    pdf.set_fill_color(*bg)
    pdf.set_font('Helvetica','B',8)
    pdf.cell(w_c[0], 8, safe(mkt), fill=True)
    pdf.set_fill_color(*GOLD)
    pdf.set_font('Helvetica','B',8)
    pdf.set_text_color(*NAVYD)
    pdf.cell(w_c[1], 8, safe(cnt), fill=True, align='C')
    pdf.set_text_color(0,0,0)
    pdf.set_fill_color(*bg)
    pdf.set_font('Helvetica','',7.5)
    pdf.cell(w_c[2], 8, safe(cities), fill=True)
    pdf.ln()

# ╔══════════════════════════════════════════════════════════╗
# ║  3. BUDZET I KAMPANJE                                    ║
# ╚══════════════════════════════════════════════════════════╝
pdf.add_page()
pdf.current_section = '3. Budzet i kampanje'
pdf.ln(2)

h1(pdf, safe('3. Budzet i kampanje'))
body(pdf, safe('Ukupni budzet: EUR 1.200 (bazni) + EUR 200 rezerva = max EUR 1.400. Kampanja traje 39 dana (02.04. - 10.05.2026.). Prosjecni dnevni spend: ~EUR 30,77/dan od baznog budzeta.'), color=GRAY)
pdf.ln(5)

campaigns_data = [
    ('Leads - HR + IT',              'HR, IT',        'EUR 195', '~EUR 5,00/dan', 16.3, NAVY),
    ('Leads - Greece',               'GR',            'EUR 195', '~EUR 5,00/dan', 16.3, (30,120,180)),
    ('Leads - ES+FR+TR',             'ES, FR, TR',    'EUR 195', '~EUR 5,00/dan', 16.3, (50,150,200)),
    ('Leads - MT+PT',                'MT, PT',        'EUR 97',  '~EUR 2,49/dan',  8.1, (80,160,100)),
    ('Leads - SI+AL+CY',             'SI, AL, CY',    'EUR 97',  '~EUR 2,49/dan',  8.1, GOLD),
    ('Marina Manager B2B',           'HR+GR+IT+ES+FR','EUR 146', '~EUR 3,75/dan', 12.2, (90,40,120)),
    ('Retargeting',                  'Sve drzave',    'EUR 97',  '~EUR 2,49/dan',  8.1, (140,40,40)),
    ('Rezerva (scaling)',             '—',             'EUR 195', 'Po potrebi',    16.3, (60,60,60)),
]

h2(pdf, safe('Raspodjela budzeta'))
pdf.ln(2)
total_w = 140
for camp, countries, budget, daily, pct, color in campaigns_data:
    bar_w = max(3, int(pct * total_w / 100))
    y_now = pdf.get_y()
    pdf.set_fill_color(*color)
    pdf.rect(10, y_now, bar_w, 9, 'F')
    pdf.set_xy(10+bar_w+3, y_now+1)
    pdf.set_font('Helvetica','B',8)
    pdf.set_text_color(*NAVYD)
    pdf.cell(0, 4, safe(f'{camp}  |  {budget}  ({pct}%)'), ln=True)
    pdf.set_xy(10+bar_w+3, pdf.get_y())
    pdf.set_font('Helvetica','',7)
    pdf.set_text_color(*GRAY)
    pdf.cell(0, 4, safe(f'Drzave: {countries}  |  {daily}'), ln=True)
    pdf.set_text_color(0,0,0)
    pdf.ln(2)

pdf.ln(2)
pdf.set_fill_color(*NAVYD)
pdf.rect(10, pdf.get_y(), 170, 14, 'F')
pdf.set_xy(13, pdf.get_y()+2)
pdf.set_font('Helvetica','B',11)
pdf.set_text_color(*WHITE)
pdf.cell(80, 5, 'BAZNI BUDZET:')
pdf.set_font('Helvetica','B',14)
pdf.set_text_color(*GOLD)
pdf.cell(0, 5, 'EUR 1.200  +  EUR 200 rezerva  =  max EUR 1.400', ln=True)
pdf.set_text_color(0,0,0)
pdf.ln(18)

divider(pdf)
h2(pdf, 'Detalji kampanja')
pdf.ln(2)

w_t = [50, 28, 22, 28, 22, 40]
table_header(pdf, ['Naziv kampanje', 'Drzave', 'Budzet', 'Daily budget', '% od tot.', 'Targeting'], w_t)
for i,(camp, countries, budget, daily, pct, color) in enumerate(campaigns_data):
    bg = LGRAY if i%2==0 else WHITE
    row(pdf, [camp, countries, budget, daily, f'{pct}%', '5km od obale'], w_t, bg=bg, height=8)

pdf.ln(6)
divider(pdf)
h2(pdf, 'Nota o SI+AL+CY i novim trzistima')
pdf.ln(2)
pdf.set_fill_color(*LGRAY)
pdf.rect(10, pdf.get_y(), 190, 26, 'F')
pdf.set_xy(13, pdf.get_y()+3)
pdf.set_font('Helvetica','B',9)
pdf.set_text_color(*NAVYD)
pdf.cell(0, 5, safe('Slovenija, Albanija i Kipar = iskljucivo priobalni gradovi, NE cijela zemlja'), ln=True)
pdf.set_xy(13, pdf.get_y()+1)
pdf.set_font('Helvetica','',8.5)
pdf.set_text_color(*GRAY)
pdf.multi_cell(184, 5, safe('SI: samo Koper, Izola, Portooz. AL: samo Durres i jug prema Grckoj. CY: samo obalna mjesta (ne unutrasnjost).\nMalta i Portugal su nova trzista s kombiniranim budzetom EUR 97. Ako pokazu dobre rezultate u T1 (02-09.04.), povecati iz rezerve.'))
pdf.set_text_color(0,0,0)
pdf.ln(6)

# ╔══════════════════════════════════════════════════════════╗
# ║  4. KREATIVNI MATERIJALI                                 ║
# ╚══════════════════════════════════════════════════════════╝
pdf.add_page()
pdf.current_section = '4. Kreativni materijali'
pdf.ln(2)

h1(pdf, '4. Kreativni materijali')
body(pdf, safe('Svi oglasi su iskljucivo na engleskom jeziku. Kreativni materijali moraju prikazivati marine (prazne i pune) — NE pojedinacne vezove, bove ili privatne molove. Visual: drone shot marina, brodovi koji pristaju, sunce, profesionalni nauticki ugodaj.'), color=GRAY)
pdf.ln(3)

# Creative requirement box
pdf.set_fill_color(255, 240, 200)
pdf.rect(10, pdf.get_y(), 190, 14, 'F')
pdf.set_fill_color(*GOLD)
pdf.rect(10, pdf.get_y(), 4, 14, 'F')
pdf.set_xy(17, pdf.get_y()+2)
pdf.set_font('Helvetica','B',9)
pdf.set_text_color(140, 80, 0)
pdf.cell(0, 5, safe('OBAVEZNO: Kreativni prikaz marina (praznih i punih) - nikad pojedinacnih vezova.'), ln=True)
pdf.set_xy(17, pdf.get_y())
pdf.set_font('Helvetica','',8)
pdf.cell(0, 5, 'Jezik: iskljucivo engleski. Facebook/Instagram omjer: 70% Facebook / 30% Instagram.')
pdf.set_text_color(0,0,0)
pdf.ln(18)

divider(pdf)
h2(pdf, 'Novi ad textualni kreativni — 4 anglea, 12 varijacija')
pdf.ln(2)

ads = [
    ('ANGLE 1: Marina Revenue Growth  (P1 + P2)',
     [
         ('A1 — Fill Your Berths',
          '"Fill Your Berths This Season"  |  "Free. 10 Countries. 15% Only."',
          'Running a marina? Your empty berths are costing you money every day they sit unused. Mooring Booking connects Mediterranean marinas with sailors from 10 countries. Free listing. 15% per confirmed booking.',
          'Learn More',
          'Aerial drone: marina 50% capacity, empty berths visible, morning calm'),
         ('A2 — Boost Revenue',
          '"Boost Your Marina\'s Revenue"  |  "Free listing. 0 upfront cost."',
          'What if every empty berth generated revenue automatically? Digital booking, automated confirmations, real-time calendar, zero subscription fees. Only 15% commission.',
          'Sign Up',
          'Split: half-empty marina at dawn vs. same marina fully booked'),
         ('A3 — Season 2026',
          '"Ready for Season 2026?"  |  "Free marina listing. Start now."',
          'The 2026 Mediterranean sailing season starts April 2nd. Is your marina ready? Visibility to sailors from 10 countries. Custom pricing. Free to list.',
          'Sign Up',
          'Full marina peak season, boats arriving, summer morning light'),
     ]),
    ('ANGLE 2: Digital Booking System  (P2)',
     [
         ('B1 — No More Phone',
          '"Digital Bookings for Your Marina"  |  "Free setup. No subscription."',
          'Still taking marina reservations by phone and email? Mooring Booking gives your marina a professional digital booking system. Free. Guests book online 24/7.',
          'Sign Up',
          'Left: person with notepad on phone. Right: tablet with clean booking dashboard at marina'),
         ('B2 — No WhatsApp',
          '"No More Manual Reservations"  |  "10-min setup. Pay as you earn."',
          'Your marina deserves better than a WhatsApp group for reservations. Set up in 10 minutes. Online calendar, instant notifications, sailor reviews.',
          'Sign Up',
          'Marina dock, boat arriving, "New booking confirmed" notification on phone'),
         ('B3 — 24/7 Bookings',
          '"Your Marina Books While You Sleep"  |  "24/7 bookings. Zero admin."',
          '3 a.m. inquiry from a French sailor — do you lose the booking? With Mooring Booking, your marina is bookable 24/7. Automated confirmations. Only 15% per booking.',
          'Learn More',
          'Night shot: lit marina, calm water. Text overlay: "Booking confirmed: July 14, Berth 7"'),
     ]),
    ('ANGLE 3: First-Mover / FOMO  (sve publike)',
     [
         ('C1 — Be First',
          '"Be First on Mooring Booking"  |  "Priority spot. Free listing."',
          'Mooring Booking just launched. We\'re building our first 500 marinas. Early providers get priority placement. Free to join. 10 countries. Season starts April 2nd.',
          'Sign Up',
          'Bird\'s-eye view full Mediterranean marina — "Now open across 10 countries" overlay'),
         ('C2 — New Platform',
          '"New Platform. First Providers Win."  |  "Season starts Apr 2. Join free."',
          'New platform. First season. The marinas that list first get seen first by sailors from Croatia, Italy, Greece, Malta, Portugal and 5 more countries.',
          'Sign Up',
          'Mediterranean coastline map, "Now available" markers at key ports'),
         ('C3 — April 2nd',
          '"Season Opens April 2nd. Ready?"  |  "List free. Be found first."',
          'The 2026 sailing season is weeks away. Sailors are already searching for berths in Croatia, Greece, Italy, Malta, Portugal. Is your marina listed yet?',
          'Sign Up',
          'Aerial marina shot, sailboats entering port, "Season 2026" urgency overlay'),
     ]),
    ('ANGLE 4: Zero Risk / Free Listing  (P3 + P4)',
     [
         ('D1 — Zero Cost',
          '"Earn With Zero Upfront Cost"  |  "Free listing. 15% per booking."',
          'Earn from your dock, buoy field, or pier with zero upfront cost. Free to list. 15% only when a booking is confirmed. No risk.',
          'Sign Up',
          'Aerial buoy field or small marina at sunrise, mix of occupied and empty spots'),
         ('D2 — Math is Simple',
          '"Zero Fees Until You Earn"  |  "Free to list. Pay 15% only."',
          'No subscription. No setup fee. No risk. Without listing: 0 EUR. With Mooring Booking: EUR 4,250+ per season (your 85% cut). Free to list.',
          'Sign Up',
          'Side-by-side: empty dock (EUR 0) vs. full marina with boats (EUR 5,000+)'),
         ('D3 — Full Control',
          '"Full Control. Zero Risk. Free."  |  "You set rules. We bring guests."',
          'Free to register. You set availability, prices and rules. You approve or decline bookings. 15% only when paid. Cancel anytime. No lock-in.',
          'Learn More',
          'Marina manager reviewing tablet at dock, boats in background, relaxed professional'),
     ]),
]

for angle_title, variations in ads:
    if pdf.get_y() > 230:
        pdf.add_page()
        pdf.ln(5)

    # Angle header
    pdf.set_fill_color(*NAVY)
    pdf.rect(10, pdf.get_y(), 190, 9, 'F')
    pdf.set_xy(13, pdf.get_y()+1)
    pdf.set_font('Helvetica','B',9)
    pdf.set_text_color(*GOLD)
    pdf.cell(0, 7, safe(angle_title), ln=True)
    pdf.set_text_color(0,0,0)
    pdf.ln(2)

    for var_name, headline_desc, primary, cta, visual in variations:
        if pdf.get_y() > 240:
            pdf.add_page()
            pdf.ln(5)

        y_now = pdf.get_y()
        pdf.set_fill_color(*LGRAY)
        pdf.rect(10, y_now, 190, 36, 'F')
        pdf.set_fill_color(*GOLD)
        pdf.rect(10, y_now, 3, 36, 'F')

        pdf.set_xy(16, y_now+2)
        pdf.set_font('Helvetica','B',9)
        pdf.set_text_color(*NAVYD)
        pdf.cell(100, 5, safe(var_name), ln=False)
        pdf.set_font('Helvetica','B',8)
        pdf.set_text_color(0,140,60)
        pdf.cell(0, 5, safe(f'CTA: {cta}'), ln=True)

        pdf.set_xy(16, pdf.get_y()+1)
        pdf.set_font('Helvetica','B',7.5)
        pdf.set_text_color(*NAVY)
        pdf.multi_cell(182, 4, safe(f'Headline / Desc: {headline_desc}'))

        pdf.set_xy(16, pdf.get_y()+1)
        pdf.set_font('Helvetica','',7.5)
        pdf.set_text_color(40,40,40)
        pdf.multi_cell(182, 4, safe(primary[:200]))

        pdf.set_xy(16, pdf.get_y()+1)
        pdf.set_font('Helvetica','I',7)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(182, 4, safe(f'Visual: {visual}'))
        pdf.set_text_color(0,0,0)
        pdf.ln(4)

    pdf.ln(3)

# ╔══════════════════════════════════════════════════════════╗
# ║  5. TARGETING I PUBLIKA                                  ║
# ╚══════════════════════════════════════════════════════════╝
pdf.add_page()
pdf.current_section = '5. Targeting i publika'
pdf.ln(2)

h1(pdf, '5. Targeting i ciljana publika')
pdf.ln(3)

h2(pdf, 'Ciljni segmenti — redosljed prioriteta')
pdf.ln(2)

audiences = [
    ('P1 — Operatori velikih marina',    'Uprave marina, direktori. Poruka: povecajte prihod, digitalni booking, medjunarodni doseg.',         NAVY),
    ('P2 — Operatori malih marina',      'Vlasnici manjih marinskih kompleksa. Poruka: zamijeni telefonske rezervacije digitalnim sustavom.',   (30,120,180)),
    ('P3 — Vlasnici plutaca/bova',       'Komercijalni operateri polja bova. Poruka: dosegni vise jedriticara, upravljaj iz jednog dashboarda.', GOLD),
    ('P4 — Vlasnici plovila uz obalu',   'Vlasnici privatnih molova/keja koji mogu legalno iznajmljivati. Poruka: pasivni prihod od prostora.',  GREEN),
]

for title, desc, color in audiences:
    y_now = pdf.get_y()
    pdf.set_fill_color(*color)
    pdf.rect(10, y_now, 4, 16, 'F')
    pdf.set_fill_color(*LGRAY)
    pdf.rect(14, y_now, 186, 16, 'F')
    pdf.set_xy(18, y_now+2)
    pdf.set_font('Helvetica','B',9)
    pdf.set_text_color(*NAVYD)
    pdf.cell(0, 5, safe(title), ln=True)
    pdf.set_xy(18, pdf.get_y())
    pdf.set_font('Helvetica','',8)
    pdf.set_text_color(*GRAY)
    pdf.cell(0, 5, safe(desc), ln=True)
    pdf.set_text_color(0,0,0)
    pdf.ln(2)

pdf.ln(4)
divider(pdf)
h2(pdf, 'Targeting parametri')
pdf.ln(2)

params = [
    ('Starosna dob',        '20 - 63 godine',            'Prosireno s 25-65. Pokriva mlade marina menadzere i starije vlasnike.'),
    ('Lokacija',            'Priobalno, 5 km od mora',   'Striktno 5 km coastal radius — ne 20 km kao ranije.'),
    ('FB / Instagram',      '70% Facebook / 30% IG',     'Facebook dominira B2B. Instagram za vizualne kreative marina.'),
    ('Placement',           'Feed, Stories, Reels',       'Sve plasmane. FB Feed prioritet za B2B (P1+P2). IG Reels za vizuale.'),
    ('Jezik oglasa',        'Iskljucivo engleski',        'Nauticki segment razumije engleski na cijelom Mediteranu.'),
    ('Bid strategija',      'Lowest Cost Without Cap',    'Meta optimizira prema najnizoj cijeni po konverziji.'),
    ('Optimization goal',   'Conversions / Lead Gen',     'CompleteRegistration na /become-provider ili Meta Lead Form.'),
    ('Spol',                'Primarno muski',             'Marina operateri su pretezno muski — dozvoliti iznimke.'),
]

w_p = [52, 50, 88]
table_header(pdf, ['Parametar', 'Vrijednost', 'Obrazlozenje'], w_p)
for i,(param, val, note) in enumerate(params):
    bg = LGRAY if i%2==0 else WHITE
    row(pdf, [param, val, note], w_p, bg=bg, height=8)

pdf.ln(6)
divider(pdf)
h2(pdf, 'Lead forma — Pitanje 1 (u dogovoru s Draganom)')
pdf.ln(2)
body(pdf, safe('Finalna formulacija prvog pitanja ceka dogovor. Dvije opcije:'), color=GRAY)
pdf.ln(3)

lead_opts = [
    ('Opcija A', '"Are you a marina owner or operator?"', '"DA" ili "NE"', 'Direktno kvalificira B2B pubbliku (P1+P2)'),
    ('Opcija B', '"Would you like more berth bookings this season?"', '"Da" ili "Ne"', 'Sira publika, vece volumen, nizi CPL'),
]

for opt, question, answers, goal in lead_opts:
    y_now = pdf.get_y()
    pdf.set_fill_color(*LIGHT)
    pdf.rect(10, y_now, 190, 15, 'F')
    pdf.set_xy(13, y_now+2)
    pdf.set_font('Helvetica','B',9)
    pdf.set_text_color(*NAVYD)
    pdf.cell(22, 5, safe(opt))
    pdf.set_font('Helvetica','B',9)
    pdf.set_text_color(*NAVY)
    pdf.cell(90, 5, safe(question))
    pdf.set_font('Helvetica','',8)
    pdf.set_text_color(*GRAY)
    pdf.cell(35, 5, safe(answers))
    pdf.set_font('Helvetica','I',8)
    pdf.set_text_color(*GREEN)
    pdf.cell(0, 5, safe(goal), ln=True)
    pdf.set_text_color(0,0,0)
    pdf.ln(3)

pdf.ln(2)
questions_rest = [
    ('2. "Type of facility"', '"Marina / Buoy field / Private dock"', 'Segmentira prema tipu imovine'),
    ('3. Kontakt podaci',     'Name, Email, Phone, City',             'Direktan kontakt za onboarding'),
]
w_qq = [55, 70, 65]
table_header(pdf, ['Pitanje', 'Opcije', 'Cilj'], w_qq)
for q, opts, goal in questions_rest:
    row(pdf, [q, opts, goal], w_qq, bg=LGRAY, height=9)

# ╔══════════════════════════════════════════════════════════╗
# ║  6. PROJEKCIJE — 02.04 – 10.05.2026.                     ║
# ╚══════════════════════════════════════════════════════════╝
pdf.add_page()
pdf.current_section = '6. Projekcije i KPI'
pdf.ln(2)

h1(pdf, '6. Projekcije — 02.04. - 10.05.2026. (39 dana)')
body(pdf, safe('Projekcije su bazirane na realnim rezultatima prve faze (HR: CPL $3.83, CTR 3.05%) i prilagodene za sirenje na 10 trzista. Nova trzista mogu imati visi CPL — pratimo tjedno i optimiziramo.'), color=GRAY)
pdf.ln(5)

h2(pdf, safe('Projekcije po kampanji (cijela kampanja 39 dana)'))
pdf.ln(2)

projections = [
    ('HR + IT',        195, 3.50,  56,  34),
    ('Greece GR',      195, 4.00,  49,  29),
    ('ES+FR+TR',       195, 4.50,  43,  26),
    ('MT + PT',         97, 4.00,  24,  14),
    ('SI+AL+CY',        97, 5.00,  19,  12),
    ('Marina B2B',     146, 6.00,  24,  14),
    ('Retargeting',     97,  3.0,  32,  19),
]

w_pr = [42, 22, 28, 26, 30, 42]
table_header(pdf, ['Kampanja', 'Budzet', 'Ciljni CPL', 'Leadovi/39d', 'Registracije', 'Napomena'], w_pr)

total_leads = 0
total_reg   = 0
for i,(camp, budget, cpl, leads, reg) in enumerate(projections):
    total_leads += leads
    total_reg   += reg
    bg = LGRAY if i%2==0 else WHITE
    row(pdf, [camp, f'EUR {budget}', f'EUR {cpl}', f'~{leads}', f'~{reg}', '60% conv. rate'], w_pr, bg=bg, height=9)

pdf.set_fill_color(*NAVYD)
pdf.set_text_color(*WHITE)
pdf.set_font('Helvetica','B',9)
totals_row = ['UKUPNO 39 dana', 'EUR 1.022', '~EUR 4.10', f'~{total_leads}', f'~{total_reg}', '+ EUR 200 rezerva']
for txt,w in zip(totals_row, w_pr):
    pdf.cell(w, 9, safe(txt), fill=True)
pdf.ln()
pdf.set_text_color(0,0,0)

pdf.ln(5)

# Scenario boxes
pdf.set_fill_color(*LGRAY)
pdf.rect(10, pdf.get_y(), 190, 45, 'F')
pdf.set_xy(13, pdf.get_y()+3)
pdf.set_font('Helvetica','B',10)
pdf.set_text_color(*NAVYD)
pdf.cell(0, 6, 'Scenariji za cijelu kampanju (02.04. - 10.05.2026.)', ln=True)
pdf.ln(2)

scenarios = [
    ('Konzervativno', 'EUR 1.200', '300.000',  '3.000',  '60',   '36',  RED),
    ('Realisticno',   'EUR 1.200', '400.000',  '6.000',  '240',  '144', NAVY),
    ('Optimisticno',  'EUR 1.400', '700.000',  '14.000', '840',  '504', GREEN),
]
w_sc = [30, 22, 25, 22, 22, 22, 47]
table_header(pdf, ['Scenarij', 'Spend', 'Impressions', 'Clicks', 'Leads', 'Signupi', 'CPA'], w_sc)
for i,(scen, spend, imp, clicks, leads, signups, color) in enumerate(scenarios):
    bg = LGRAY if i%2==0 else WHITE
    pdf.set_fill_color(*bg)
    pdf.set_font('Helvetica','B',8)
    pdf.set_text_color(*color)
    pdf.cell(w_sc[0], 8, safe(scen), fill=True)
    pdf.set_text_color(0,0,0)
    pdf.set_font('Helvetica','',8)
    pdf.cell(w_sc[1], 8, safe(spend), fill=True)
    pdf.cell(w_sc[2], 8, safe(imp), fill=True)
    pdf.cell(w_sc[3], 8, safe(clicks), fill=True)
    pdf.cell(w_sc[4], 8, safe(leads), fill=True)
    pdf.cell(w_sc[5], 8, safe(signups), fill=True)
    cpa_val = int(int(spend.replace('EUR ','').replace('.','').replace(',','')) / max(1, int(signups)))
    pdf.cell(w_sc[6], 8, safe(f'EUR {cpa_val} / signup'), fill=True)
    pdf.ln()

pdf.ln(10)
divider(pdf)
h2(pdf, 'Kljucni KPI-jevi za pracenje')
pdf.ln(2)

kpis = [
    ('CPM',                     '< EUR 3 (HR/GR)  < EUR 1 (AL)',   'Cilj za jeftina trzista. Pratiti tjedno.'),
    ('CTR',                     '> 1.5%',                           'Nas faza-1 result: 3.05%. Min. 1.5% na novim trzistima.'),
    ('CPC (link click)',        '< EUR 0.30',                        'Kljucna metrika za efikasnost targetiranja.'),
    ('CPA (provider signup)',   '< EUR 5',                           'Realistican scenarij. Ako > EUR 10 — pauzirati ad set.'),
    ('Lead -> Registracija',    '> 50%',                             'Faza 1: 60%. Zadrzati min. 50% na novim trzistima.'),
    ('Frequency',               '< 3.5',                            'Rotirati kreative svake 10-14 dana.'),
    ('Signupi 02.04-10.05.',    '150 - 300+',                       'Target za 39 dana kampanje.'),
]

w_k = [55, 45, 90]
table_header(pdf, ['KPI', 'Target', 'Obrazlozenje'], w_k)
for i,(kpi, target, note) in enumerate(kpis):
    bg = LGRAY if i%2==0 else WHITE
    pdf.set_fill_color(*bg)
    pdf.set_font('Helvetica','B',8)
    pdf.cell(w_k[0], 8, safe(kpi), fill=True)
    pdf.set_text_color(0, 140, 60)
    pdf.cell(w_k[1], 8, safe(target), fill=True, align='C')
    pdf.set_text_color(0,0,0)
    pdf.set_font('Helvetica','',7.5)
    pdf.cell(w_k[2], 8, safe(note), fill=True)
    pdf.ln()

# ╔══════════════════════════════════════════════════════════╗
# ║  7. AKCIJSKI PLAN                                        ║
# ╚══════════════════════════════════════════════════════════╝
pdf.add_page()
pdf.current_section = '7. Akcijski plan'
pdf.ln(2)

h1(pdf, '7. Akcijski plan — 02.04. - 10.05.2026.')
pdf.ln(3)

h2(pdf, 'Timeline kampanje')
pdf.ln(2)

steps = [
    ('Odmah (do 01.04.)',
     'Setup i provjera',
     [
         'Potvrditi targeting svih priobalnih mjesta i gradova, 5 km od obale',
         'SI targetirati SAMO: Koper, Izola, Portooz — ne ostatak Slovenija',
         'AL targetirati SAMO: Durres + jug (Vlorae, Sarande) — ne cijela Albanija',
         'CY targetirati SAMO obalu: Limassol, Larnaca, Paphos — ne unutrasnjost',
         'Uploadati sve kreative — slike marina (ne vezovi!), engleski tekst',
         'Finalizirati lead formu pitanje 1 (opcija A ili B — Dragan dogovor)',
         'Postaviti UTM parametre i Meta Pixel conversion tracking',
     ]),
    ('Tjedan 1 — Eksperimentalna faza (02. - 09.04.)',
     'Launch i pracenje',
     [
         'LAUNCH 02.04.: Pokrenuti sve kampanje s baznim budzet raspodjelom',
         'NE DIRATI prvih 5-7 dana — Meta learning phase treba podatke',
         'Pratiti dnevni spend — alert ako koji ad set trosne vise od plana',
         'Pratiti da nema policy violations (marina content je siguran)',
         '08.04.: prvi pregled — sve kampanje troše normalno, nema grešaka',
     ]),
    ('10. - 16. travnja — Prva optimizacija',
     'Analiza i cutovi',
     [
         'Analiza: koji market, koji kreativ, koji angle daje najjeftiniji CPA?',
         'Ugasiti ad setove s CPA > EUR 15 (pauzirati, ne brisati)',
         'Skalirati pobjednike: +20% budžeta na top-2 ad seta',
         'Uvesti retargeting kampanju za LP posjetioce koji nisu završili',
         'Pokrenuti follow-up email sekvcu za sve vec registrirane providere',
     ]),
    ('17. - 30. travnja — Skaliranje',
     'Ekspanzija s rezervom',
     [
         'Dodijeliti EUR 195 rezerve na dokazane pobjednicke kombinacije',
         'Kreirati Lookalike Audience od prvih 50+ registrovanih providera',
         'Uvesti novi kreativ set (rotacija svakih 10-14 dana za anti-fatigue)',
         'Ako MT ili PT pokazuju odlicne rezultate — povecati im budzet',
         'Analiza: koji angle (Revenue / Digital / FOMO / ZeroRisk) pobjeduje?',
     ]),
    ('01. - 10. svibnja — Finalna faza',
     'Maksimalni push i zaključak',
     [
         'Maksimalni budzet na dokazane pobjednicke ad setove',
         'Sve rezerve aktivirati na top performers',
         '10.05.: Zaustaviti sve kampanje. Financijski obracun.',
         'Pripremiti finalni report: CPA, ukupni signupi, best markets, best creatives',
         'Preporuka za Fazu 2 kampanje (Maj - Juli 2026.)',
     ]),
]

for phase, title, actions in steps:
    y_now = pdf.get_y()
    if y_now > 245:
        pdf.add_page()
        pdf.ln(5)
    pdf.set_fill_color(*NAVY)
    pdf.rect(10, pdf.get_y(), 190, 8, 'F')
    pdf.set_xy(13, pdf.get_y()+1)
    pdf.set_font('Helvetica','B',9)
    pdf.set_text_color(*WHITE)
    pdf.cell(72, 6, safe(phase))
    pdf.set_font('Helvetica','B',9)
    pdf.set_text_color(*GOLD)
    pdf.cell(0, 6, safe(title), ln=True)
    pdf.set_text_color(0,0,0)

    pdf.set_fill_color(*LGRAY)
    for action in actions:
        y_a = pdf.get_y()
        pdf.set_fill_color(*LGRAY)
        pdf.rect(10, y_a, 190, 7, 'F')
        pdf.set_fill_color(*GOLD)
        pdf.rect(10, y_a, 4, 7, 'F')
        pdf.set_xy(18, y_a+1)
        pdf.set_font('Helvetica','',8)
        pdf.set_text_color(40,40,40)
        pdf.cell(0, 5, safe(f'  {action}'), ln=True)
        pdf.set_text_color(0,0,0)
    pdf.ln(5)

# ╔══════════════════════════════════════════════════════════╗
# ║  ZAKLJUCAK                                               ║
# ╚══════════════════════════════════════════════════════════╝
pdf.add_page()
pdf.current_section = 'Zakljucak'
pdf.ln(2)

h1(pdf, 'Zakljucak i odobrenje')
pdf.ln(3)
body(pdf, safe('Sve kampanje su postavljene i cekaju aktivaciju 02.04.2026. Molimo potvrdite plan ili navedite izmjene.'), color=GRAY)
pdf.ln(5)

pdf.set_fill_color(*NAVYD)
pdf.rect(10, pdf.get_y(), 190, 80, 'F')
pdf.set_xy(13, pdf.get_y()+5)
pdf.set_font('Helvetica','B',13)
pdf.set_text_color(*GOLD)
pdf.cell(0, 8, 'Plan u jednoj recenici:', ln=True)
pdf.set_xy(13, pdf.get_y()+2)
pdf.set_font('Helvetica','B',11)
pdf.set_text_color(*WHITE)
pdf.multi_cell(184, 7, safe('Sirimo se na 10 mediteranskih zemalja s priobalnim targetiranjem (5 km od obale), iskljucivo engleskim ad kreativima koji prikazuju marine, uz bazni budzet EUR 1.200 + EUR 200 rezerva i ciljanih 150-300 novih provider registracija u 39 dana (02.04. - 10.05.2026.).'))
pdf.set_text_color(0,0,0)
pdf.ln(42)

divider(pdf)
h2(pdf, 'Odobrenje plana')
pdf.ln(4)

approval_items = [
    'Budzet EUR 1.200 bazni + EUR 200 rezerva (max EUR 1.400) je odobren',
    'Targeting: priobalna podrucja 10 zemalja, 5 km od obalne crte',
    'SI, AL i CY: iskljucivo specificni priobalni gradovi (ne cijela zemlja)',
    'Svi kreativni prikazuju marine (prazne i pune) — nije pojedinacnih vezova',
    'Jezik oglasa: iskljucivo engleski u svim kreativima',
    'Facebook / Instagram omjer: 70% Facebook / 30% Instagram',
    'Starosna dob targeting: 20 - 63 godine',
    'Lead forma pitanje 1 finalizirati s Draganom (Opcija A ili B)',
    'Kampanje se aktiviraju 02.04.2026. i zaustavljaju 10.05.2026.',
]

for item in approval_items:
    y_check = pdf.get_y()
    pdf.set_draw_color(*NAVY)
    pdf.rect(13, y_check+1, 7, 7)
    pdf.set_xy(24, y_check)
    pdf.set_font('Helvetica','',9.5)
    pdf.set_text_color(40,40,40)
    pdf.cell(0, 9, safe(f'  {item}'), ln=True)
    pdf.set_text_color(0,0,0)

pdf.ln(10)
pdf.set_fill_color(*LGRAY)
pdf.rect(10, pdf.get_y(), 190, 35, 'F')
pdf.set_xy(15, pdf.get_y()+5)
pdf.set_font('Helvetica','B',9)
pdf.set_text_color(*NAVYD)
pdf.cell(85, 5, 'Odobrio/la:', ln=False)
pdf.cell(85, 5, 'Datum odobrenja:', ln=True)
pdf.ln(2)
pdf.set_fill_color(*NAVYD)
pdf.rect(15, pdf.get_y(), 80, 0.5, 'F')
pdf.rect(105, pdf.get_y(), 80, 0.5, 'F')
pdf.ln(8)
pdf.set_xy(15, pdf.get_y())
pdf.set_font('Helvetica','',8)
pdf.set_text_color(*GRAY)
pdf.cell(85, 5, 'Potpis i pectat')
pdf.cell(85, 5, 'DD.MM.YYYY.')
pdf.set_text_color(0,0,0)

# ────────────────────────────────────────────────────────────
pdf.output(OUT)
print(f'PDF saved: {OUT}')
