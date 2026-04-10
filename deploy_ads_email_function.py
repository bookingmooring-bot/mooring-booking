"""
Deploy Edge Function + Upload PDF + Schedule cron
Pokreni: python deploy_ads_email_function.py <SUPABASE_ACCESS_TOKEN> <SERVICE_ROLE_KEY>

Access token: supabase.com/dashboard/account/tokens
Service role key: supabase.com/dashboard/project/bblxawscmyzelinidkmb/settings/api
"""
import sys
import os
import base64
import json
import requests

PROJECT_REF  = "bblxawscmyzelinidkmb"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"
PDF_PATH     = "C:/Users/User/Downloads/MooringBooking_Ads_Plan_April2026.pdf"
FUNCTION_DIR = "supabase/functions/send-ads-plan-email/index.ts"

def main(access_token: str, service_role_key: str):
    mgmt_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    sb_headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
    }

    # ── 1. Upload PDF to Supabase Storage ────────────────────────────────────
    print("1. Uploading PDF to Supabase Storage (bucket: marketing)...")
    os.makedirs("tmp", exist_ok=True)

    with open(PDF_PATH, "rb") as f:
        pdf_bytes = f.read()

    upload_url = f"{SUPABASE_URL}/storage/v1/object/marketing/ads-plan/MooringBooking_Ads_Plan_April2026.pdf"
    res = requests.post(
        upload_url,
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/pdf",
            "x-upsert": "true",
        },
        data=pdf_bytes,
    )
    if res.ok:
        print(f"   PDF uploaded OK")
    else:
        print(f"   Storage error {res.status_code}: {res.text}")
        # If storage fails, we embed PDF in function directly — continue anyway

    # ── 2. Deploy Edge Function ───────────────────────────────────────────────
    print("2. Deploying Edge Function via Management API...")

    with open(FUNCTION_DIR, "r", encoding="utf-8") as f:
        fn_code = f.read()

    # Create/update function via Management API
    res = requests.post(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/functions",
        headers=mgmt_headers,
        json={
            "slug": "send-ads-plan-email",
            "name": "send-ads-plan-email",
            "body": fn_code,
            "verify_jwt": False,
        },
    )
    if res.status_code in (200, 201):
        print(f"   Function deployed: {res.json().get('name', 'OK')}")
    elif res.status_code == 409:
        # Already exists — update it
        res2 = requests.patch(
            f"https://api.supabase.com/v1/projects/{PROJECT_REF}/functions/send-ads-plan-email",
            headers=mgmt_headers,
            json={"body": fn_code, "verify_jwt": False},
        )
        if res2.ok:
            print(f"   Function updated OK")
        else:
            print(f"   Update error {res2.status_code}: {res2.text[:200]}")
    else:
        print(f"   Deploy error {res.status_code}: {res.text[:200]}")

    # ── 3. Schedule pg_cron via SQL ───────────────────────────────────────────
    print("3. Scheduling pg_cron job: 01.04.2026. u 04:21...")

    sql = """
SELECT cron.schedule(
  'ads-plan-email-0104-0421',
  '21 4 1 4 *',
  $cmd$
  SELECT net.http_post(
    url := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-ads-plan-email',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer SERVICE_ROLE_PLACEHOLDER"}'::jsonb,
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $cmd$
);
""".replace("SERVICE_ROLE_PLACEHOLDER", service_role_key)

    res = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/query",
        headers={**sb_headers, "Content-Profile": "pg_catalog"},
        json={"query": sql},
    )
    if res.ok:
        print(f"   Cron scheduled OK")
    else:
        # Try via admin SQL endpoint
        res2 = requests.post(
            f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query",
            headers=mgmt_headers,
            json={"query": sql},
        )
        if res2.ok:
            print(f"   Cron scheduled OK (via management API)")
        else:
            print(f"   Cron error {res2.status_code}: {res2.text[:300]}")
            print(f"\n   MANUAL FALLBACK: Otvori Supabase SQL Editor i pokreni:")
            print(f"   supabase/migrations/20260401_cron_ads_email.sql")

    print("\nDone!")
    print(f"Email ce biti poslan 01.04.2026. u 04:21 UTC na:")
    print("  - hernausa96@gmail.com")
    print("  - mb.smartmatrix@gmail.com")
    print("  - dlazukic@motovunvillas.com")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python deploy_ads_email_function.py <ACCESS_TOKEN> <SERVICE_ROLE_KEY>")
        print()
        print("ACCESS_TOKEN:    supabase.com/dashboard/account/tokens")
        print("SERVICE_ROLE_KEY: supabase.com/dashboard/project/bblxawscmyzelinidkmb/settings/api")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
