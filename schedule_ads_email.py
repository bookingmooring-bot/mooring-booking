"""
1. Upload PDF u Supabase Storage (bucket: marketing)
2. Deploy Edge Function send-ads-plan-email
3. Zakazati via Supabase pg_cron na 01.04.2026. u 04:21
"""
import os
import requests

SUPABASE_URL     = "https://bblxawscmyzelinidkmb.supabase.co"
SUPABASE_SERVICE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHhhd3NjbXl6ZWxpbmlka21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTcwNDY3OSwiZXhwIjoyMDg3MjgwNjc5fQ.placeholder"
PDF_PATH         = "C:/Users/User/Downloads/MooringBooking_Ads_Plan_April2026.pdf"
STORAGE_BUCKET   = "marketing"
STORAGE_PATH     = "ads-plan/MooringBooking_Ads_Plan_April2026.pdf"

HEADERS = {
    "apikey": SUPABASE_SERVICE,
    "Authorization": f"Bearer {SUPABASE_SERVICE}",
}

def upload_pdf():
    print("1. Upload PDF u Supabase Storage...")
    with open(PDF_PATH, "rb") as f:
        pdf_bytes = f.read()

    url = f"{SUPABASE_URL}/storage/v1/object/{STORAGE_BUCKET}/{STORAGE_PATH}"
    res = requests.post(
        url,
        headers={**HEADERS, "Content-Type": "application/pdf", "x-upsert": "true"},
        data=pdf_bytes,
    )
    if res.ok:
        print(f"   PDF uploaded: {res.json()}")
    else:
        print(f"   Upload error {res.status_code}: {res.text}")
        return False
    return True

def schedule_cron():
    print("2. Kreiranje pg_cron job via Supabase SQL...")
    # pg_cron: 21 4 1 4 * = 04:21 on April 1st
    sql = """
SELECT cron.schedule(
  'send-ads-plan-email-0104',
  '21 4 1 4 *',
  $$
    SELECT net.http_post(
      url := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-ads-plan-email',
      headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '", "Content-Type": "application/json"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
"""
    res = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"query": sql},
    )
    print(f"   Cron response {res.status_code}: {res.text[:200]}")

if __name__ == "__main__":
    upload_pdf()
    schedule_cron()
    print("\nDone. Provjeri Supabase Dashboard > Edge Functions > send-ads-plan-email")
    print("Scheduled: 01.04.2026. u 04:21 (pg_cron: '21 4 1 4 *')")
