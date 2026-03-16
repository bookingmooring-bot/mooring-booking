# 🔄 n8n Workflows za Mooring Booking

## Sadržaj

Ovaj folder sadrži dva n8n workflow-a za automatizaciju Facebook Lead Ads:

### 1. `fb-lead-to-supabase.json` — Glavni Workflow
Hvata nove leadove iz Facebook Lead Ads i procesira ih.

```
Facebook Lead Ad → Pripremi Podatke → Edge Function → Provjera → Slack Notifikacija
```

**Šta radi automatski:**
- ✅ Hvata novi lead iz Facebook Lead Ad forme
- ✅ Normalizira podatke (ime, email, telefon, grad)
- ✅ Kreira korisnika u Supabase Auth (role: provider)
- ✅ Sprema lead u `fb_leads` tabelu
- ✅ Šalje welcome email s linkom za registraciju
- ✅ Zakazuje 3 follow-up emaila
- ✅ Slack notifikacija (opcionalno)

### 2. `followup-email-sequence.json` — Follow-up Workflow
Šalje zakazane follow-up emailove.

```
Svaki Sat → Provjeri Pending → Pošalji Email → Označi Poslano
```

**Šta radi automatski:**
- ✅ Svaki sat provjerava pending emailove u `email_sequences` tabeli
- ✅ Šalje pravi template za svaki step:
  - Step 1 (+24h): "Završite registraciju"
  - Step 2 (+72h): "Provideri zarađuju €5.000+"
  - Step 3 (+7 dana): "Zadnja prilika — sezona počinje!"
- ✅ Preskače ako se user već registrirao
- ✅ Ažurira status na "sent"

---

## 🛠️ Kako Importovati u n8n

### Korak 1: Otvorite n8n
- Cloud: https://app.n8n.cloud
- Self-hosted: http://localhost:5678

### Korak 2: Import Workflow
1. Kliknite **"+ Add workflow"** (ili Ctrl+K → "Import")
2. Kliknite **"Import from File"**
3. Izaberite `fb-lead-to-supabase.json`
4. Ponovite za `followup-email-sequence.json`

### Korak 3: Podesite Credentials

Trebate 3 seta credentials:

#### A) Facebook Lead Ads OAuth2
1. U n8n: **Settings → Credentials → + Add Credential**
2. Izaberite: **Facebook Lead Ads OAuth2 API**
3. Treba vam:
   - Facebook App ID
   - Facebook App Secret
   - Pristup "leads_retrieval" i "pages_manage_ads" permissijama
4. OAuth2 flow: spojit ćete svoj Facebook account

#### B) Supabase Service Role Key (za Follow-up workflow)
1. **Settings → Credentials → + Add Credential**
2. Izaberite: **Header Auth**
3. Postavite:
   - **Name:** `Supabase Service Role Key`
   - **Header Name:** `apikey`
   - **Header Value:** Vaš Supabase Service Role Key
   
   Nađite ga u: Supabase Dashboard → Settings → API → `service_role` key

#### C) FB Lead Webhook Secret (za sigurnost)
1. **Settings → Credentials → + Add Credential**
2. Izaberite: **Header Auth**
3. Postavite:
   - **Name:** `FB Lead Webhook Secret`
   - **Header Name:** `x-webhook-secret`
   - **Header Value:** Generirajte tajni string (npr. `openssl rand -hex 32`)
   
4. **VAŽNO:** Isti secret trebate postaviti kao Supabase secret:
   ```bash
   supabase secrets set FB_LEAD_WEBHOOK_SECRET=vaš-tajni-string
   ```

### Korak 4: Povežite Credentials s Workflow Node-ovima

U svakom workflow-u, kliknite na node-ove koji imaju ⚠️ i izaberite odgovarajući credential.

### Korak 5: Konfigurirajte Facebook Lead Form

U "Facebook Lead Ads Trigger" node-u:
1. Izaberite svoju **Facebook Page**
2. Izaberite svoj **Lead Form**

### Korak 6: Aktivirajte Workflow-e
1. Kliknite **"Active"** toggle na oba workflow-a
2. Gotovo! 🎉

---

## 🧪 Kako Testirati

### Test 1: Ručni test Edge Function
```powershell
$body = @{
    full_name = "Test User"
    email = "test@example.com"
    phone = "+385911234567"
    city = "Split"
    country = "Croatia"
    has_mooring = $true
    mooring_type = "buoy"
    fb_lead_id = "test_123"
    fb_campaign_name = "Test Campaign"
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
    -Uri "https://bblxawscmyzelinidkmb.supabase.co/functions/v1/process-fb-lead" `
    -ContentType "application/json" `
    -Body $body
```

### Test 2: Facebook Lead Ads Testing Tool
1. Facebook Ads Manager → Your Form → "Testing Tool"
2. Submit test lead
3. Provjeri n8n Executions log

---

## 📊 Supabase Edge Functions

| Funkcija | URL | Svrha |
|----------|-----|-------|
| `process-fb-lead` | `https://bblxawscmyzelinidkmb.supabase.co/functions/v1/process-fb-lead` | Procesira novi lead |
| `send-followup-email` | `https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-followup-email` | Šalje follow-up email |

## 🔑 Supabase Secrets (Potrebni)

```bash
# Email servis
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx

# Webhook sigurnost
supabase secrets set FB_LEAD_WEBHOOK_SECRET=your-secret-here
```

## 📧 Email Servis — Resend

1. Registracija: https://resend.com (besplatno do 100 emailova/dan)
2. Dodaj domenu: mooringbooking.com
3. Verificiraj DNS zapise
4. Kopiraj API Key → dodaj kao Supabase secret
