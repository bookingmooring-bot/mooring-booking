import csv, json, urllib.request
from fpdf import FPDF
from collections import Counter
from datetime import datetime

# ─── SUPABASE ────────────────────────────────────────────
BASE = 'https://bblxawscmyzelinidkmb.supabase.co/rest/v1'
KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHhhd3NjbXl6ZWxpbmlka21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MDQ2NzksImV4cCI6MjA4NzI4MDY3OX0.be7RrEhVEutbQDJqT1pl_OICFmFdkNRq3jFRCItecNQ'
HDRS = {'apikey': KEY, 'Authorization': f'Bearer {KEY}'}

def fetch(path):
    req = urllib.request.Request(f'{BASE}/{path}', headers=HDRS)
    return json.loads(urllib.request.urlopen(req).read())

profiles = fetch('profiles?select=*&limit=200&order=created_at.desc')
moorings  = fetch('moorings?select=owner_id,name,status,created_at,mooring_units,country&limit=200')

# ─── LEADS CSV ───────────────────────────────────────────
all_leads = []
seen = set()
for fname in [
    'C:/Users/User/Downloads/New Leads Ad_Leads_2026-03-12_2026-03-31.csv',
    'C:/Users/User/Downloads/New Leads Ad - Copy_Leads_2026-03-12_2026-03-31.csv'
]:
    with open(fname, encoding='utf-16') as f:
        for row in csv.DictReader(f, delimiter='\t'):
            if row['id'] not in seen:
                seen.add(row['id'])
                all_leads.append(row)
all_leads.sort(key=lambda r: r['created_time'])

# ─── TEST ACCOUNTS (exclude from analysis) ───────────────
TEST_EMAILS = {
    'hernausa96@gmail.com', 'dlazukic@gmail.com', 'mb.smartmatrix@gmail.com',
    'bookingmooring@gmail.com', 'hermark0m@gmail.com', 'bosicmiodrag@gmail.com',
    'dlazukic@motovunvillas.com'
}

real_profiles = [p for p in profiles if p['email'] not in TEST_EMAILS]
profile_by_email = {p['email'].lower(): p for p in real_profiles}
moorings_by_owner = {}
for m in moorings:
    moorings_by_owner.setdefault(m['owner_id'], []).append(m)

# ─── CROSS-REFERENCE ─────────────────────────────────────
lead_email_set = {r['email'].lower().strip() for r in all_leads}

registered = []      # lead who also has a profile
not_registered = []  # lead with no profile

for lead in all_leads:
    em = lead['email'].lower().strip()
    profile = profile_by_email.get(em)
    lead['_profile'] = profile
    lead['_moorings'] = moorings_by_owner.get(profile['id'], []) if profile else []
    if profile:
        registered.append(lead)
    else:
        not_registered.append(lead)

# Profiles that registered but are NOT in leads (organic / direct signups)
organic = [p for p in real_profiles if p['email'].lower() not in lead_email_set]

total_leads   = len(all_leads)
total_reg     = len(registered)
total_unreg   = len(not_registered)
total_organic = len(organic)
total_with_mooring = sum(1 for l in registered if l['_moorings'])

conv_rate = round(total_reg / total_leads * 100, 1) if total_leads else 0

# ─── HELPERS ─────────────────────────────────────────────
def safe(s):
    if not s:
        return '-'
    r = {'š':'s','č':'c','ć':'c','ž':'z','đ':'d','Š':'S','Č':'C','Ć':'C','Ž':'Z','Đ':'D',
         'ä':'a','ö':'o','ü':'u','Ä':'A','Ö':'O','Ü':'U','Ñ':'N','ñ':'n',
         '\u041c':' ','\u0438':' ','\u043b':' ','\u043e':' ','\u0448':' ',}
    for k,v in r.items():
        s = s.replace(k, v)
    return s.encode('latin-1', errors='replace').decode('latin-1')

def fmt_dt(d):
    try:
        return datetime.fromisoformat(d.replace('Z','+00:00')).strftime('%d.%m.%Y')
    except:
        return str(d)[:10] if d else '-'

def fmt_phone(p):
    return (p or '').replace('p:+','+').replace('p:','').strip() or '-'

# ─── PDF ─────────────────────────────────────────────────
class PDF(FPDF):
    def header(self):
        self.set_fill_color(15, 90, 140)
        self.rect(0, 0, 210, 20, 'F')
        self.set_font('Helvetica', 'B', 13)
        self.set_text_color(255, 255, 255)
        self.set_xy(0, 5)
        self.cell(0, 10, 'Mooring Booking  -  Conversion Report', align='C')
        self.set_text_color(0, 0, 0)
        self.ln(22)

    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f'Stranica {self.page_no()} / {{nb}}   |   {datetime.now().strftime("%d.%m.%Y")}', align='C')
        self.set_text_color(0, 0, 0)

pdf = PDF()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=18)

# ═══════════════════════════════════════
# PAGE 1 — SUMMARY
# ═══════════════════════════════════════
pdf.add_page()

pdf.set_font('Helvetica', 'B', 22)
pdf.set_text_color(15, 90, 140)
pdf.cell(0, 12, 'Konverzija leadova', ln=True)
pdf.set_font('Helvetica', '', 10)
pdf.set_text_color(100, 100, 100)
pdf.cell(0, 6, 'Poredenje: Meta Lead Ads  vs  Supabase baza  |  12.03. - 31.03.2026.', ln=True)
pdf.set_text_color(0, 0, 0)
pdf.ln(6)

# Funnel boxes
def box(x, y, w, h, label, val, sub='', bg=(230,243,255), fg=(15,90,140)):
    pdf.set_fill_color(*bg)
    pdf.rect(x, y, w, h, 'F')
    pdf.set_xy(x+3, y+2)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(90, 90, 90)
    pdf.cell(w-6, 5, label)
    pdf.set_xy(x+3, y+8)
    pdf.set_font('Helvetica', 'B', 18)
    pdf.set_text_color(*fg)
    pdf.cell(w-6, 10, str(val))
    if sub:
        pdf.set_xy(x+3, y+19)
        pdf.set_font('Helvetica', '', 7)
        pdf.set_text_color(100,100,100)
        pdf.cell(w-6, 5, sub)
    pdf.set_text_color(0,0,0)

y0 = pdf.get_y()
box(10,  y0, 38, 28, 'LEADOVI (Meta)', total_leads, 'iz reklame')
box(51,  y0, 38, 28, 'REGISTROVANI', total_reg, f'{conv_rate}% konverzija', bg=(210,240,215), fg=(0,120,50))
box(92,  y0, 38, 28, 'NIJE SE PRIJAVIO', total_unreg, 'jos uvijek', bg=(255,220,220), fg=(180,0,0))
box(133, y0, 38, 28, 'DODALI MOORING', total_with_mooring, 'listing u bazi', bg=(255,240,200), fg=(160,100,0))
box(174, y0, 28, 28, 'ORGANSKI', total_organic, 'direktno')
pdf.ln(36)

# Funnel arrow visualization
pdf.set_font('Helvetica', 'B', 10)
pdf.set_text_color(15,90,140)
pdf.cell(0, 7, 'Funnel pregled', ln=True)
pdf.set_text_color(0,0,0)

steps = [
    ('Leadovi iz reklame', total_leads, 100.0, (15,90,140)),
    ('Registrirali se u appu', total_reg, conv_rate, (0,130,60)),
    ('Dodali mooring listing', total_with_mooring, round(total_with_mooring/total_leads*100,1) if total_leads else 0, (180,120,0)),
]
for label, val, pct, color in steps:
    bar_w = max(3, int(pct * 1.4))
    y_now = pdf.get_y()
    pdf.set_fill_color(*color)
    pdf.rect(10, y_now+1, bar_w, 7, 'F')
    pdf.set_font('Helvetica', '', 9)
    pdf.set_xy(155, y_now)
    pdf.cell(0, 9, safe(f'{label}: {val}  ({pct}%)'))
    pdf.ln(11)

pdf.ln(4)

# Role breakdown of registered leads
pdf.set_font('Helvetica', 'B', 10)
pdf.set_text_color(15,90,140)
pdf.cell(0, 7, 'Rola u aplikaciji (registrovani leadovi)', ln=True)
pdf.set_text_color(0,0,0)
role_c = Counter(l['_profile']['role'] for l in registered if l['_profile'])
role_colors = {'provider':(15,90,140), 'user':(100,180,220), 'admin':(200,200,200)}
for role, cnt in role_c.most_common():
    pct = round(cnt/total_reg*100) if total_reg else 0
    bar_w = max(3, int(pct * 1.4))
    y_now = pdf.get_y()
    pdf.set_fill_color(*role_colors.get(role, (150,150,150)))
    pdf.rect(10, y_now+1, bar_w, 6, 'F')
    pdf.set_font('Helvetica', '', 9)
    pdf.set_xy(155, y_now)
    pdf.cell(0, 8, f'{role}: {cnt}  ({pct}%)')
    pdf.ln(9)

pdf.ln(4)

# Organic signups note
if organic:
    pdf.set_fill_color(240, 248, 255)
    pdf.rect(10, pdf.get_y(), 190, 14, 'F')
    pdf.set_xy(13, pdf.get_y()+2)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(15,90,140)
    pdf.cell(0, 5, f'Organski registrovani (bez reklame): {total_organic} korisnika')
    pdf.set_xy(13, pdf.get_y()+5)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(60,60,60)
    pdf.cell(0, 5, safe('Prijavili se direktno, nisu prosli kroz Meta lead form'))
    pdf.set_text_color(0,0,0)
    pdf.ln(18)

# ═══════════════════════════════════════
# PAGE 2 — REGISTERED LEADS TABLE
# ═══════════════════════════════════════
pdf.add_page()
pdf.set_font('Helvetica', 'B', 15)
pdf.set_text_color(15,90,140)
pdf.cell(0, 10, safe(f'Registrovani leadovi  ({total_reg})'), ln=True)
pdf.set_text_color(0,0,0)
pdf.ln(2)

col_w2 = [7, 40, 46, 22, 18, 20, 28]
heads2 = ['#', 'Ime', 'Email', 'Telefon', 'Rola', 'Lead datum', 'Mooring']

def draw_hdr2():
    pdf.set_fill_color(15,90,140)
    pdf.set_text_color(255,255,255)
    pdf.set_font('Helvetica','B',7.5)
    for i,h in enumerate(heads2):
        pdf.cell(col_w2[i], 7, h, fill=True, align='C' if i in (0,4,5,6) else 'L')
    pdf.ln()
    pdf.set_text_color(0,0,0)

draw_hdr2()

for idx, lead in enumerate(registered, 1):
    p = lead['_profile']
    ms = lead['_moorings']
    bg = (245,250,255) if idx % 2 == 0 else (255,255,255)

    if pdf.get_y() > 265:
        pdf.add_page()
        draw_hdr2()

    phone = fmt_phone(lead.get('phone_number',''))
    lead_date = fmt_dt(lead.get('created_time',''))
    reg_date = fmt_dt(p.get('created_at',''))
    role = p.get('role','')
    mooring_info = f'{len(ms)} listing' if ms else 'Nema'

    pdf.set_fill_color(*bg)
    pdf.set_font('Helvetica','',7.5)
    pdf.cell(col_w2[0], 7, str(idx), fill=True, align='C')
    pdf.set_font('Helvetica','B',7.5)
    pdf.cell(col_w2[1], 7, safe((p.get('full_name') or lead.get('full_name',''))[:22]), fill=True)
    pdf.set_font('Helvetica','',7.5)
    pdf.cell(col_w2[2], 7, safe((p.get('email') or '')[:30]), fill=True)
    pdf.cell(col_w2[3], 7, safe(phone[:16]), fill=True)

    # Role colored
    if role == 'provider':
        pdf.set_fill_color(210,240,215); pdf.set_text_color(0,120,50)
    elif role == 'admin':
        pdf.set_fill_color(220,220,220); pdf.set_text_color(80,80,80)
    else:
        pdf.set_fill_color(*bg); pdf.set_text_color(0,0,0)
    pdf.set_font('Helvetica','B',7.5)
    pdf.cell(col_w2[4], 7, role, fill=True, align='C')
    pdf.set_text_color(0,0,0)

    pdf.set_fill_color(*bg)
    pdf.set_font('Helvetica','',7.5)
    pdf.cell(col_w2[5], 7, lead_date, fill=True, align='C')

    # Mooring colored
    if ms:
        pdf.set_fill_color(255,240,200); pdf.set_text_color(160,100,0)
        pdf.set_font('Helvetica','B',7.5)
    else:
        pdf.set_fill_color(245,245,245); pdf.set_text_color(150,150,150)
        pdf.set_font('Helvetica','',7.5)
    pdf.cell(col_w2[6], 7, safe(mooring_info), fill=True, align='C')
    pdf.set_text_color(0,0,0)
    pdf.ln()

    # Sub-row: registration date
    pdf.set_fill_color(*bg)
    pdf.set_font('Helvetica','I',6.5)
    pdf.set_text_color(100,100,100)
    pdf.cell(col_w2[0], 5, '', fill=True)
    pdf.cell(sum(col_w2[1:]), 5, safe(f'  Registrovan: {reg_date}'), fill=True)
    pdf.set_text_color(0,0,0)
    pdf.ln()

# ═══════════════════════════════════════
# PAGE 3 — UNREGISTERED LEADS TABLE
# ═══════════════════════════════════════
pdf.add_page()
pdf.set_font('Helvetica','B',15)
pdf.set_text_color(180,0,0)
pdf.cell(0, 10, safe(f'Nisu se registrovali  ({total_unreg})  - potencijal za follow-up'), ln=True)
pdf.set_text_color(0,0,0)
pdf.ln(2)

col_w3 = [7, 42, 50, 28, 24, 30]
heads3 = ['#', 'Ime', 'Email', 'Telefon', 'Drzava', 'Datum leada']

def draw_hdr3():
    pdf.set_fill_color(180,30,30)
    pdf.set_text_color(255,255,255)
    pdf.set_font('Helvetica','B',7.5)
    for i,h in enumerate(heads3):
        pdf.cell(col_w3[i], 7, h, fill=True, align='C' if i == 0 else 'L')
    pdf.ln()
    pdf.set_text_color(0,0,0)

draw_hdr3()

country_map = {'HR':'Hrvatska','ME':'Crna Gora','Montenegro':'Crna Gora','US':'SAD','IE':'Irska','ZM':'Zambija','SA':'Saudijska Arabija','':'Nepoznato'}

for idx, lead in enumerate(not_registered, 1):
    bg = (255,248,248) if idx % 2 == 0 else (255,255,255)
    if pdf.get_y() > 265:
        pdf.add_page()
        draw_hdr3()

    country = country_map.get(lead.get('country',''), lead.get('country',''))
    phone = fmt_phone(lead.get('phone_number',''))
    lead_date = fmt_dt(lead.get('created_time',''))

    pdf.set_fill_color(*bg)
    pdf.set_font('Helvetica','',7.5)
    pdf.cell(col_w3[0], 7, str(idx), fill=True, align='C')
    pdf.set_font('Helvetica','B',7.5)
    pdf.cell(col_w3[1], 7, safe(lead.get('full_name','')[:25]), fill=True)
    pdf.set_font('Helvetica','',7.5)
    pdf.cell(col_w3[2], 7, safe(lead.get('email','')[:33]), fill=True)
    pdf.cell(col_w3[3], 7, safe(phone[:18]), fill=True)
    pdf.cell(col_w3[4], 7, safe(country[:18]), fill=True)
    pdf.cell(col_w3[5], 7, lead_date, fill=True)
    pdf.ln()

    # Sub-row: tip veza
    tip_raw = lead.get('tip_veza','')
    tip_map = {'vez_u_marini':'Vez u marini','bova':'Bova','':'Nije odgovoreno'}
    tip = tip_map.get(tip_raw, 'Sidriste' if 'sidr' in tip_raw.lower() else tip_raw or 'Nije odgovoreno')
    ima = lead.get('imate_li_vez?','')
    ima_str = 'Ima vez' if ima=='da' else ('Nema vez' if ima=='ne' else 'Nije odgovoreno')

    pdf.set_fill_color(*bg)
    pdf.set_font('Helvetica','I',6.5)
    pdf.set_text_color(100,100,100)
    pdf.cell(col_w3[0], 5, '', fill=True)
    pdf.cell(sum(col_w3[1:]), 5, safe(f'  {ima_str}  |  Tip: {tip}'), fill=True)
    pdf.set_text_color(0,0,0)
    pdf.ln()

# ═══════════════════════════════════════
# PAGE 4 — ORGANIC SIGNUPS
# ═══════════════════════════════════════
if organic:
    pdf.add_page()
    pdf.set_font('Helvetica','B',15)
    pdf.set_text_color(15,90,140)
    pdf.cell(0, 10, safe(f'Organski registrovani  ({total_organic})'), ln=True)
    pdf.set_font('Helvetica','',9)
    pdf.set_text_color(80,80,80)
    pdf.cell(0, 6, safe('Korisnici koji su se registrovali direktno (ne kroz Meta reklamu)'), ln=True)
    pdf.set_text_color(0,0,0)
    pdf.ln(2)

    col_wo = [7, 44, 52, 28, 20, 30]
    heads_o = ['#', 'Ime', 'Email', 'Telefon', 'Rola', 'Registrovan']

    pdf.set_fill_color(60,130,180)
    pdf.set_text_color(255,255,255)
    pdf.set_font('Helvetica','B',7.5)
    for i,h in enumerate(heads_o):
        pdf.cell(col_wo[i], 7, h, fill=True)
    pdf.ln()
    pdf.set_text_color(0,0,0)

    for idx, p in enumerate(sorted(organic, key=lambda x: x['created_at'], reverse=True), 1):
        bg = (245,250,255) if idx % 2 == 0 else (255,255,255)
        if pdf.get_y() > 268:
            pdf.add_page()

        pdf.set_fill_color(*bg)
        pdf.set_font('Helvetica','',7.5)
        pdf.cell(col_wo[0], 7, str(idx), fill=True, align='C')
        pdf.set_font('Helvetica','B',7.5)
        pdf.cell(col_wo[1], 7, safe((p.get('full_name') or '')[:26]), fill=True)
        pdf.set_font('Helvetica','',7.5)
        pdf.cell(col_wo[2], 7, safe((p.get('email') or '')[:33]), fill=True)
        pdf.cell(col_wo[3], 7, safe((p.get('phone') or '-')[:18]), fill=True)
        pdf.cell(col_wo[4], 7, safe(p.get('role','')[:10]), fill=True)
        pdf.cell(col_wo[5], 7, fmt_dt(p.get('created_at','')), fill=True)
        pdf.ln()

out = 'C:/Users/User/Downloads/Mooring_Conversion_Report_2026-03.pdf'
pdf.output(out)
print(f'PDF saved: {out}')
print(f'Leads: {total_leads} | Registered: {total_reg} ({conv_rate}%) | With mooring: {total_with_mooring} | Not registered: {total_unreg} | Organic: {total_organic}')
