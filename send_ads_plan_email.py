"""
Šalje Ads Plan PDF na hernausa96@gmail.com via Resend API
FROM: noreply@mooring-booking.com
"""
import base64
import json
import requests as _requests

RESEND_API_KEY = "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe"
TO             = ["hernausa96@gmail.com", "mb.smartmatrix@gmail.com", "dlazukic@motovunvillas.com"]
FROM           = "Mooring Booking <noreply@mooring-booking.com>"
SUBJECT        = "Ads Plan — 02.04–10.05.2026 | Marina Manager B2B & Retargeting Analysis"
PDF_PATH       = "C:/Users/User/Downloads/MooringBooking_Ads_Plan_April2026.pdf"

HTML = """
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#1a1a2e;background:#f8fafc;padding:0;">

<!-- Header -->
<div style="background:#08375a;padding:32px 40px 24px;">
  <div style="font-size:22px;font-weight:bold;color:#fff;letter-spacing:1px;">
    ⚓ Mooring Booking
  </div>
  <div style="color:#b4c8e1;font-size:13px;margin-top:4px;">Advertising Plan · 02.04 – 10.05.2026</div>
</div>

<!-- Gold bar -->
<div style="background:#b48c1e;height:4px;"></div>

<!-- Body -->
<div style="background:#fff;padding:32px 40px;">

  <h2 style="color:#08375a;margin-top:0;font-size:20px;">Ads Plan — Analiza kampanja</h2>
  <p style="color:#444;line-height:1.7;font-size:15px;">
    U prilogu se nalazi ažurirani PDF plan Meta Ads kampanje za period
    <strong>02.04.&nbsp;–&nbsp;10.05.2026.</strong>
    U nastavku je sažetak moje preporuke u vezi dvije kampanje koje si postavio kao pitanje.
  </p>

  <!-- Divider -->
  <div style="border-top:2px solid #e2e8f0;margin:24px 0;"></div>

  <!-- Question box -->
  <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:6px;margin-bottom:24px;">
    <strong style="color:#92400e;font-size:14px;">Pitanje koje si postavio:</strong>
    <p style="color:#78350f;margin:8px 0 0;font-size:14px;line-height:1.6;">
      Marina Manager B2B (EUR 146) i Retargeting (EUR 97) — da li ostaju u planu ili ih uklanjamo?
      Odakle dolazi tih EUR 243?
    </p>
  </div>

  <!-- Answer: Both are within EUR 1.200 -->
  <h3 style="color:#08375a;font-size:16px;margin-bottom:8px;">Odgovor: Obje kampanje su unutar EUR 1.200 — nisu extra</h3>
  <p style="color:#444;line-height:1.7;font-size:14px;">
    EUR 1.200 je od pocetka pokrivao i retargeting i marina manager kampanju
    (u originalnom planu: Retargeting EUR 100 + Marina Manager EUR 150 = EUR 250).
    U azuriranoj verziji, te iznose su smanjeni na EUR 97 + EUR 146 = EUR 243.
    Matematika ukupnog budzeta je ispravna:
  </p>

  <!-- Budget table -->
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0;">
    <tr style="background:#08375a;color:#fff;">
      <td style="padding:9px 12px;font-weight:bold;">Kampanja</td>
      <td style="padding:9px 12px;font-weight:bold;text-align:right;">Budzet</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:8px 12px;">HR + IT (Coastal 5km)</td>
      <td style="padding:8px 12px;text-align:right;">EUR 195</td>
    </tr>
    <tr style="background:#fff;">
      <td style="padding:8px 12px;">Greece (GR)</td>
      <td style="padding:8px 12px;text-align:right;">EUR 195</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:8px 12px;">ES + FR + TR</td>
      <td style="padding:8px 12px;text-align:right;">EUR 195</td>
    </tr>
    <tr style="background:#fff;">
      <td style="padding:8px 12px;">MT + PT</td>
      <td style="padding:8px 12px;text-align:right;">EUR 97</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:8px 12px;">SI + AL + CY (samo priobalno)</td>
      <td style="padding:8px 12px;text-align:right;">EUR 97</td>
    </tr>
    <tr style="background:#fffbeb;border-left:3px solid #f59e0b;">
      <td style="padding:8px 12px;font-weight:bold;color:#92400e;">Marina Manager B2B ← pitanje</td>
      <td style="padding:8px 12px;text-align:right;font-weight:bold;color:#92400e;">EUR 146</td>
    </tr>
    <tr style="background:#fffbeb;border-left:3px solid #f59e0b;">
      <td style="padding:8px 12px;font-weight:bold;color:#92400e;">Retargeting ← pitanje</td>
      <td style="padding:8px 12px;text-align:right;font-weight:bold;color:#92400e;">EUR 97</td>
    </tr>
    <tr style="background:#f0f9ff;">
      <td style="padding:8px 12px;font-style:italic;color:#555;">Rezerva (scaling pobjednika)</td>
      <td style="padding:8px 12px;text-align:right;color:#555;font-style:italic;">EUR 178</td>
    </tr>
    <tr style="background:#08375a;color:#fff;">
      <td style="padding:10px 12px;font-weight:bold;">UKUPNO (base)</td>
      <td style="padding:10px 12px;text-align:right;font-weight:bold;font-size:15px;">EUR 1.200 ✓</td>
    </tr>
    <tr style="background:#e0f2fe;">
      <td style="padding:8px 12px;color:#0369a1;">+ Eksterna rezerva (Dragan odobrio)</td>
      <td style="padding:8px 12px;text-align:right;color:#0369a1;">EUR 200</td>
    </tr>
    <tr style="background:#dbeafe;">
      <td style="padding:9px 12px;font-weight:bold;color:#1d4ed8;">MAX TOTAL</td>
      <td style="padding:9px 12px;text-align:right;font-weight:bold;color:#1d4ed8;">EUR 1.400 ✓</td>
    </tr>
  </table>

  <div style="border-top:2px solid #e2e8f0;margin:24px 0;"></div>

  <!-- Retargeting recommendation -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr>
      <td style="width:48%;vertical-align:top;padding-right:12px;">
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;">
          <div style="font-weight:bold;color:#166534;font-size:14px;margin-bottom:8px;">
            ✅ Retargeting — ZADRZATI
          </div>
          <p style="color:#166534;font-size:13px;line-height:1.6;margin:0;">
            Bez retargetinga, svaki posjetilac /become-provider koji nije registrovao = izgubljeni novac.
            Faza 1 je pokazala klikove bez konverzija. EUR 97 / 39 dana = EUR 2,49/dan.
            Najjeftiniji EUR u cijelom planu — konvertuje ljude koji su vec zainteresovani.
          </p>
        </div>
      </td>
      <td style="width:48%;vertical-align:top;padding-left:12px;">
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;">
          <div style="font-weight:bold;color:#166534;font-size:14px;margin-bottom:8px;">
            ✅ Marina Manager B2B — ZADRZATI
          </div>
          <p style="color:#166534;font-size:13px;line-height:1.6;margin:0;">
            P1 publika (uprave marina) reaguje razlicito od P3/P4 vlasnika bova.
            Ako ih mijesamo u isti ad set, Meta optimizira prema jeftinijoj konverziji i P1 nikad ne vidi oglas.
            Marina = stotine vezova = najvrjedniji provajder.
          </p>
        </div>
      </td>
    </tr>
  </table>

  <div style="border-top:2px solid #e2e8f0;margin:24px 0;"></div>

  <!-- Option B: Remove both -->
  <h3 style="color:#08375a;font-size:16px;margin-bottom:8px;">Opcija B — Ako ipak zelimo ukloniti obje kampanje</h3>
  <p style="color:#444;line-height:1.7;font-size:14px;">
    Preraspodjela EUR 243 na 5 core kampanja (proporcionalno):
  </p>

  <table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0;">
    <tr style="background:#08375a;color:#fff;">
      <td style="padding:8px 12px;font-weight:bold;">Kampanja</td>
      <td style="padding:8px 12px;font-weight:bold;text-align:right;">Trenutno</td>
      <td style="padding:8px 12px;font-weight:bold;text-align:right;">+ Redistrib.</td>
      <td style="padding:8px 12px;font-weight:bold;text-align:right;">NOVO</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:7px 12px;">HR + IT</td>
      <td style="padding:7px 12px;text-align:right;">EUR 195</td>
      <td style="padding:7px 12px;text-align:right;color:#16a34a;">+EUR 67</td>
      <td style="padding:7px 12px;text-align:right;font-weight:bold;">EUR 262</td>
    </tr>
    <tr style="background:#fff;">
      <td style="padding:7px 12px;">Greece</td>
      <td style="padding:7px 12px;text-align:right;">EUR 195</td>
      <td style="padding:7px 12px;text-align:right;color:#16a34a;">+EUR 62</td>
      <td style="padding:7px 12px;text-align:right;font-weight:bold;">EUR 257</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:7px 12px;">ES + FR + TR</td>
      <td style="padding:7px 12px;text-align:right;">EUR 195</td>
      <td style="padding:7px 12px;text-align:right;color:#16a34a;">+EUR 57</td>
      <td style="padding:7px 12px;text-align:right;font-weight:bold;">EUR 252</td>
    </tr>
    <tr style="background:#fff;">
      <td style="padding:7px 12px;">MT + PT</td>
      <td style="padding:7px 12px;text-align:right;">EUR 97</td>
      <td style="padding:7px 12px;text-align:right;color:#16a34a;">+EUR 29</td>
      <td style="padding:7px 12px;text-align:right;font-weight:bold;">EUR 126</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:7px 12px;">SI + AL + CY</td>
      <td style="padding:7px 12px;text-align:right;">EUR 97</td>
      <td style="padding:7px 12px;text-align:right;color:#16a34a;">+EUR 28</td>
      <td style="padding:7px 12px;text-align:right;font-weight:bold;">EUR 125</td>
    </tr>
    <tr style="background:#fef9c3;">
      <td style="padding:7px 12px;color:#854d0e;font-style:italic;">Retargeting</td>
      <td style="padding:7px 12px;text-align:right;color:#854d0e;">EUR 97</td>
      <td style="padding:7px 12px;text-align:right;color:#dc2626;">UKLONJEN</td>
      <td style="padding:7px 12px;text-align:right;color:#dc2626;font-weight:bold;">EUR 0</td>
    </tr>
    <tr style="background:#fef9c3;">
      <td style="padding:7px 12px;color:#854d0e;font-style:italic;">Marina Manager B2B</td>
      <td style="padding:7px 12px;text-align:right;color:#854d0e;">EUR 146</td>
      <td style="padding:7px 12px;text-align:right;color:#dc2626;">UKLONJEN</td>
      <td style="padding:7px 12px;text-align:right;color:#dc2626;font-weight:bold;">EUR 0</td>
    </tr>
    <tr style="background:#08375a;color:#fff;">
      <td style="padding:9px 12px;font-weight:bold;" colspan="2">UKUPNO aktivnih</td>
      <td style="padding:9px 12px;text-align:right;font-weight:bold;" colspan="2">EUR 1.022 aktiv. + EUR 178 rezerva = EUR 1.200 ✓</td>
    </tr>
  </table>

  <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 18px;border-radius:6px;margin-top:8px;">
    <strong style="color:#991b1b;font-size:13px;">Upozorenje kod uklanjanja:</strong>
    <p style="color:#7f1d1d;font-size:13px;margin:6px 0 0;line-height:1.6;">
      Bez Retargetinga — gubimo sve klikove koji nisu konvertovali. Ako ikako moguce, zadrzati bar Retargeting (EUR 97 = EUR 2,49/dan).
    </p>
  </div>

  <div style="border-top:2px solid #e2e8f0;margin:28px 0 16px;"></div>

  <!-- CTA -->
  <p style="color:#444;font-size:14px;line-height:1.7;">
    Kompletan ažurirani plan je u prilogu kao PDF (9 stranica).<br>
    Sve izmjene (budzet, targetiranje, kreativni, projekcije) su inkorporirane.<br><br>
    <strong>Molim te da potvrdiš — zadrzavamo obje kampanje ili uklanjamo?</strong><br>
    Kampanje se aktiviraju <strong>02.04.2026.</strong>
  </p>

  <div style="text-align:center;margin-top:28px;">
    <a href="https://mooring-booking.com/admin"
       style="background:#08375a;color:#fff;padding:13px 32px;text-decoration:none;border-radius:7px;font-weight:bold;font-size:14px;display:inline-block;">
      Otvori Admin Panel
    </a>
  </div>

</div>

<!-- Footer -->
<div style="background:#08375a;padding:18px 40px;text-align:center;">
  <p style="color:#b4c8e1;font-size:12px;margin:0;">
    Mooring Booking d.o.o. · mooring-booking.com<br>
    Ova poruka je poslana automatski — molim ne odgovaraj na ovaj email.
  </p>
</div>

</body>
</html>
"""

def send():
    # Read and encode PDF
    with open(PDF_PATH, "rb") as f:
        pdf_b64 = base64.b64encode(f.read()).decode("utf-8")

    payload = {
        "from": FROM,
        "to": [TO],
        "subject": SUBJECT,
        "html": HTML,
        "attachments": [
            {
                "filename": "MooringBooking_Ads_Plan_April2026.pdf",
                "content": pdf_b64,
                "content_type": "application/pdf",
            }
        ],
    }

    res = _requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )

    if res.ok:
        body = res.json()
        print(f"Email sent! ID: {body.get('id')}")
        print(f"   To:      {TO}")
        print(f"   From:    {FROM}")
        print(f"   Subject: {SUBJECT}")
        print(f"   PDF:     {PDF_PATH}")
        # Log to file so we can confirm it ran
        with open("C:/Users/User/Downloads/ads_email_sent.log", "a") as log:
            import datetime
            log.write(f"{datetime.datetime.now()} | SENT | ID={body.get('id')} | To={TO}\n")
    else:
        print(f"Resend error {res.status_code}: {res.text}")
        with open("C:/Users/User/Downloads/ads_email_sent.log", "a") as log:
            import datetime
            log.write(f"{datetime.datetime.now()} | ERROR | {res.status_code} | {res.text}\n")

if __name__ == "__main__":
    send()
