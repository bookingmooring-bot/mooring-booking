import csv
from fpdf import FPDF
from collections import Counter
from datetime import datetime

# Load all leads
all_rows = []
seen = set()
for fname in [
    'C:/Users/User/Downloads/New Leads Ad_Leads_2026-03-12_2026-03-31.csv',
    'C:/Users/User/Downloads/New Leads Ad - Copy_Leads_2026-03-12_2026-03-31.csv'
]:
    with open(fname, encoding='utf-16') as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            if row['id'] not in seen:
                seen.add(row['id'])
                all_rows.append(row)

all_rows.sort(key=lambda r: r['created_time'])

def fmt_phone(p):
    return p.replace('p:+', '+').replace('p:', '').strip() if p else '-'

def fmt_date(d):
    try:
        return datetime.fromisoformat(d).strftime('%d.%m.%Y %H:%M')
    except:
        return d

def fmt_country(c):
    m = {
        'HR': 'Hrvatska', 'ME': 'Crna Gora', 'Montenegro': 'Crna Gora',
        'US': 'SAD', 'SA': 'Saudijska Arabija', 'IE': 'Irska', 'ZM': 'Zambija', '': 'Nepoznato'
    }
    return m.get(c, c)

def fmt_vez(v):
    return {'da': 'DA', 'ne': 'NE', '': '-'}.get(v, v)

def fmt_tip(t):
    # Normalize: strip special chars for comparison
    clean = t.encode('ascii', 'ignore').decode().strip().lower()
    if 'marina' in clean or 'marini' in clean or 'vez_u' in clean:
        return 'Vez u marini'
    if 'bova' in clean:
        return 'Bova'
    if 'sidr' in clean:
        return 'Sidriste'
    if not t.strip():
        return '-'
    return clean

def ascii_safe(s):
    """Replace non-latin chars for PDF rendering."""
    replacements = {
        'š': 's', 'č': 'c', 'ć': 'c', 'ž': 'z', 'đ': 'd',
        'Š': 'S', 'Č': 'C', 'Ć': 'C', 'Ž': 'Z', 'Đ': 'D',
        'ä': 'a', 'ö': 'o', 'ü': 'u', 'Ä': 'A', 'Ö': 'O', 'Ü': 'U',
    }
    for src, dst in replacements.items():
        s = s.replace(src, dst)
    return s.encode('latin-1', errors='replace').decode('latin-1')

# Stats
total = len(all_rows)
ima_vez = Counter(r['imate_li_vez?'] for r in all_rows)
tip_veza = Counter(r['tip_veza'] for r in all_rows)
zemlja = Counter(fmt_country(r['country']) for r in all_rows)
platform_c = Counter(r['platform'] for r in all_rows)

class PDF(FPDF):
    def header(self):
        self.set_fill_color(15, 90, 140)
        self.rect(0, 0, 210, 20, 'F')
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(255, 255, 255)
        self.set_xy(0, 5)
        self.cell(0, 10, 'Mooring Booking  -  Lead Report', align='C')
        self.set_text_color(0, 0, 0)
        self.ln(22)

    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f'Stranica {self.page_no()} / {{nb}}   |   Generisano: {datetime.now().strftime("%d.%m.%Y")}', align='C')
        self.set_text_color(0, 0, 0)

pdf = PDF()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=18)

# ─────────────────────────────────────────
# PAGE 1: SUMMARY
# ─────────────────────────────────────────
pdf.add_page()

pdf.set_font('Helvetica', 'B', 22)
pdf.set_text_color(15, 90, 140)
pdf.cell(0, 12, 'Pregled leadova', ln=True)
pdf.set_text_color(0, 0, 0)
pdf.set_font('Helvetica', '', 10)
pdf.set_text_color(100, 100, 100)
pdf.cell(0, 6, 'New Leads Campaign  |  12.03.2026. - 31.03.2026.', ln=True)
pdf.set_text_color(0, 0, 0)
pdf.ln(5)

# Total leads big box
pdf.set_fill_color(15, 90, 140)
pdf.set_text_color(255, 255, 255)
pdf.set_font('Helvetica', 'B', 36)
pdf.cell(50, 18, str(total), fill=True, align='C')
pdf.set_font('Helvetica', '', 13)
pdf.set_text_color(50, 50, 50)
pdf.cell(10, 18, '')
pdf.cell(80, 18, 'ukupno leadova prikupljeno')
pdf.set_text_color(0, 0, 0)
pdf.ln(24)

# Stat boxes
def stat_box(x, y, w, h, title, value, bg=(230, 243, 255), fg=(15, 90, 140)):
    pdf.set_xy(x, y)
    pdf.set_fill_color(*bg)
    pdf.rect(x, y, w, h, 'F')
    pdf.set_xy(x + 3, y + 2)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(90, 90, 90)
    pdf.cell(w - 6, 5, title)
    pdf.set_xy(x + 3, y + 8)
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(*fg)
    pdf.cell(w - 6, 8, str(value))
    pdf.set_text_color(0, 0, 0)

y0 = pdf.get_y()
stat_box(10,  y0, 42, 22, 'IMA VEZ', ima_vez.get('da', 0), bg=(210, 240, 215), fg=(0, 120, 50))
stat_box(55,  y0, 42, 22, 'NEMA VEZ', ima_vez.get('ne', 0), bg=(255, 220, 220), fg=(180, 0, 0))
stat_box(100, y0, 42, 22, 'NIJE ODGOVORENO', ima_vez.get('', 0), bg=(240, 240, 240), fg=(80, 80, 80))
stat_box(145, y0, 27, 22, 'FACEBOOK', platform_c.get('fb', 0))
stat_box(175, y0, 27, 22, 'INSTAGRAM', platform_c.get('ig', 0))
pdf.ln(30)

# Tip veza
pdf.set_font('Helvetica', 'B', 12)
pdf.set_text_color(15, 90, 140)
pdf.cell(0, 8, 'Tip veza', ln=True)
pdf.set_text_color(0, 0, 0)

bar_colors = [(15, 90, 140), (30, 160, 200), (100, 200, 220), (180, 220, 240)]
bar_total = sum(tip_veza.values()) or 1

sorted_tips = sorted(tip_veza.items(), key=lambda x: -x[1])
for i, (k, cnt) in enumerate(sorted_tips):
    label = fmt_tip(k) if k else 'Nije odgovoreno'
    bar_w = max(2, int((cnt / bar_total) * 130))
    y_now = pdf.get_y()
    pdf.set_fill_color(*bar_colors[i % len(bar_colors)])
    pdf.rect(10, y_now + 1, bar_w, 6, 'F')
    pdf.set_font('Helvetica', '', 9)
    pdf.set_xy(145, y_now)
    pct = round(cnt / total * 100)
    pdf.cell(0, 8, ascii_safe(f'{label}: {cnt}  ({pct}%)'))
    pdf.ln(10)

pdf.ln(4)

# Countries
pdf.set_font('Helvetica', 'B', 12)
pdf.set_text_color(15, 90, 140)
pdf.cell(0, 8, 'Drzave', ln=True)
pdf.set_text_color(0, 0, 0)

for country, cnt in sorted(zemlja.items(), key=lambda x: -x[1]):
    bar_w = max(2, int((cnt / total) * 130))
    y_now = pdf.get_y()
    pdf.set_fill_color(15, 90, 140)
    pdf.rect(10, y_now + 1, bar_w, 6, 'F')
    pdf.set_font('Helvetica', '', 9)
    pdf.set_xy(145, y_now)
    pct = round(cnt / total * 100)
    pdf.cell(0, 8, ascii_safe(f'{country}: {cnt}  ({pct}%)'))
    pdf.ln(10)

# ─────────────────────────────────────────
# PAGE 2+: LEAD TABLE
# ─────────────────────────────────────────
pdf.add_page()
pdf.set_font('Helvetica', 'B', 16)
pdf.set_text_color(15, 90, 140)
pdf.cell(0, 10, 'Svi leadovi', ln=True)
pdf.set_text_color(0, 0, 0)
pdf.ln(2)

col_w = [8, 44, 52, 34, 28, 16]
headers = ['#', 'Ime i prezime', 'Email', 'Telefon', 'Grad / Zemlja', 'Vez']

def draw_header():
    pdf.set_fill_color(15, 90, 140)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font('Helvetica', 'B', 8)
    for i, h in enumerate(headers):
        pdf.cell(col_w[i], 7, h, fill=True, align='C' if i in (0, 5) else 'L')
    pdf.ln()
    pdf.set_text_color(0, 0, 0)

draw_header()

for idx, r in enumerate(all_rows, 1):
    phone = fmt_phone(r.get('phone_number', ''))
    city = r.get('city', '').strip()
    country = fmt_country(r.get('country', ''))
    loc = f'{city} / {country}' if city else country
    vez = fmt_vez(r.get('imate_li_vez?', ''))
    tip = fmt_tip(r.get('tip_veza', ''))
    name = r.get('full_name', '').strip()
    email = r.get('email', '').strip()
    plat = r.get('platform', '').upper()
    date_str = fmt_date(r.get('created_time', ''))

    bg = (245, 250, 255) if idx % 2 == 0 else (255, 255, 255)

    # Check if we need a new page (leave room for 2 lines)
    if pdf.get_y() > 265:
        pdf.add_page()
        draw_header()

    pdf.set_fill_color(*bg)
    pdf.set_font('Helvetica', '', 7.5)

    pdf.cell(col_w[0], 7, str(idx), fill=True, align='C')
    pdf.set_font('Helvetica', 'B', 7.5)
    pdf.cell(col_w[1], 7, ascii_safe(name[:28]), fill=True)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.cell(col_w[2], 7, ascii_safe(email[:32]), fill=True)
    pdf.cell(col_w[3], 7, ascii_safe(phone[:22]), fill=True)
    pdf.cell(col_w[4], 7, ascii_safe(loc[:24]), fill=True)

    if vez == 'DA':
        pdf.set_fill_color(200, 240, 210)
        pdf.set_text_color(0, 120, 50)
    elif vez == 'NE':
        pdf.set_fill_color(255, 220, 220)
        pdf.set_text_color(180, 0, 0)
    else:
        pdf.set_fill_color(235, 235, 235)
        pdf.set_text_color(100, 100, 100)

    pdf.set_font('Helvetica', 'B', 7.5)
    pdf.cell(col_w[5], 7, vez, fill=True, align='C')
    pdf.set_text_color(0, 0, 0)
    pdf.ln()

    # Sub-row: tip veza + date + platform
    pdf.set_fill_color(*bg)
    pdf.set_font('Helvetica', 'I', 6.5)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(col_w[0], 5, '', fill=True)
    info = ascii_safe(f'  Tip: {tip}   |   {date_str}   |   {plat}')
    pdf.cell(sum(col_w[1:]), 5, info, fill=True)
    pdf.set_text_color(0, 0, 0)
    pdf.ln()

output_path = 'C:/Users/User/Downloads/Mooring_Leads_Report_2026-03.pdf'
pdf.output(output_path)
print(f'PDF saved: {output_path}  ({total} leads)')
