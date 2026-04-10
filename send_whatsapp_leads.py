import requests
import time
import json
import sys
import io
from datetime import datetime

# Fix Windows encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Config
PAGE_ACCESS_TOKEN = "EAAWVZAaTfakYBRONEfUIGfVJ2ccdaP9nz29ZBNDkpVkZCRleCjdgj33e1HpZBnJdB3DcqG224QiFlq8mBs4fpZCh3w6LPAZBHFilqLJ5J9JKZANkHM0ni6LVp9yODKVVuKCxxoZAFqpd9SzIsVwgOBU5XlgI4pa6O8ww7LMQJTh3BB9i0Vyro9qX6AkhDKqxiRAImKQJ6oplmg8mb13cyFda"
WA_ACCESS_TOKEN = "EAAWVZAaTfakYBRMKZBzNQ0ZBxzeYb9UchhM96nzK71lVPeSPXhhD6JQWo1bEt4p9PLdk0jAYGsgWuKd10HxpbuCXgr5lnBTVjRqjMshJ5bwl15pZBTTbUFMpn4DA0fw2tusK6jp07ZCfiK09p8LZBu6tLCVHLgtMVLbL0AIwbVDuhishdoXbsV1ZA1uZBTZAZC9rFJJmZC2XGx3MzHWJz3W"
PHONE_NUMBER_ID = "1088057531050094"
LEAD_FORM_ID = "26456934887271221"
TEMPLATE_NAME = "provider_onboarding"
TEMPLATE_LANGUAGE = "hr"

DELAY_BETWEEN_MESSAGES = 1  # sekunda

# TEST MODE - postavi na True da saljes samo na TEST_NUMBER
TEST_MODE = True
TEST_NUMBER = "381614437767"  # tvoj broj za testiranje


def get_all_leads():
    """Dohvata sve leadove s Facebook lead forme."""
    leads = []
    url = f"https://graph.facebook.com/v19.0/{LEAD_FORM_ID}/leads"
    params = {
        "fields": "id,field_data,created_time",
        "limit": 100,
        "access_token": PAGE_ACCESS_TOKEN,
    }

    while url:
        resp = requests.get(url, params=params)
        data = resp.json()

        if "error" in data:
            print(f"Greska pri dohvatanju leadova: {data['error']['message']}")
            break

        leads.extend(data.get("data", []))

        # Paginacija
        next_cursor = data.get("paging", {}).get("cursors", {}).get("after")
        if next_cursor and len(data.get("data", [])) == 100:
            params = {"access_token": PAGE_ACCESS_TOKEN, "after": next_cursor, "limit": 100,
                      "fields": "id,field_data,created_time"}
        else:
            break

    return leads


def extract_phone(lead):
    """Izvlaci broj telefona iz lead podataka."""
    for field in lead.get("field_data", []):
        if field["name"] == "phone_number":
            phone = field["values"][0]
            # Preskoci test leadove
            if "<test lead" in phone:
                return None
            # Normalizuj broj (dodaj + ako nema)
            phone = phone.strip().replace(" ", "").replace("-", "")
            if not phone.startswith("+"):
                phone = "+" + phone
            return phone
    return None


def extract_name(lead):
    """Izvlaci ime iz lead podataka."""
    for field in lead.get("field_data", []):
        if field["name"] == "full_name":
            name = field["values"][0]
            if "<test lead" in name:
                return None
            return name
    return "Korisnik"


def send_whatsapp(phone, name):
    """Salje WhatsApp template poruku."""
    url = f"https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WA_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    # Ukloni + za WhatsApp API
    to = phone.lstrip("+")

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "template",
        "template": {
            "name": TEMPLATE_NAME,
            "language": {"code": TEMPLATE_LANGUAGE},
        },
    }

    resp = requests.post(url, headers=headers, json=payload)
    return resp.json()


def main():
    print(f"\n{'='*50}")
    print(f"WhatsApp Bulk Send - Mooring Booking")
    print(f"Pocetak: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}\n")

    # Dohvati leadove
    print("Dohvatam leadove s Facebooka...")
    leads = get_all_leads()
    print(f"Ukupno leadova: {len(leads)}\n")

    results = {"sent": [], "failed": [], "skipped": []}

    for i, lead in enumerate(leads, 1):
        phone = extract_phone(lead)
        name = extract_name(lead)

        # U test modu salji samo na test broj
        if TEST_MODE:
            if i > 1:
                print(f"[TEST MODE] Preskacemo ostale {len(leads)-1} leadova.")
                break
            phone = TEST_NUMBER
            print(f"[TEST MODE] Koristimo test broj: {phone}")

        if not phone or not name:
            print(f"[{i}/{len(leads)}] PRESKOCEN (test lead ili nema broja)")
            results["skipped"].append(lead.get("id"))
            continue

        print(f"[{i}/{len(leads)}] Saljem: {name} ({phone})...", end=" ")
        result = send_whatsapp(phone, name)

        if "messages" in result:
            print("OK POSLANO")
            results["sent"].append({"name": name, "phone": phone})
        else:
            error_msg = result.get("error", {}).get("message", "Nepoznata greska")
            print(f"GRESKA: {error_msg}")
            results["failed"].append({"name": name, "phone": phone, "error": error_msg})

        time.sleep(DELAY_BETWEEN_MESSAGES)

    # Rezultati
    print(f"\n{'='*50}")
    print(f"REZULTATI:")
    print(f"  Poslano:    {len(results['sent'])}")
    print(f"  Greska:     {len(results['failed'])}")
    print(f"  Preskoceno: {len(results['skipped'])}")
    print(f"{'='*50}")

    if results["failed"]:
        print("\nNeuspjesni:")
        for f in results["failed"]:
            print(f"  - {f['name']} ({f['phone']}): {f['error']}")

    # Snimi log
    log_file = f"whatsapp_send_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(log_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\nLog snimljen: {log_file}")


if __name__ == "__main__":
    main()
