# Mooring Booking — Aplikacijski Brain 🧠

Ovaj dokument služi kao arhitektonski i strateški centar projekta. Definiše tech stack, bazu podataka, implementirane funkcionalnosti, i precizira mapu puta za ono što sledi.

---

## 🏗️ Tehnološki Stack

- **Frontend:** React 18, Vite, TypeScript
- **Stilizacija:** Tailwind CSS, shadcn/ui
- **Routing:** React Router DOM (Single Page Application - SPA)
- **Komunikacija sa serverom:** `@tanstack/react-query`
- **Backend (BaaS):** Supabase (PostgreSQL baza, Autentifikacija, Storage, Edge Funkcije)
- **Mape:** Leaflet (`react-leaflet`)
- **Lokalizacija:** `i18next` (Podrška za 15 jezika)

---

## 🗄️ Struktura Podataka (Supabase PostgreSQL)

Aplikacija se oslanja na 6 glavnih tabela koje su uvezane relacijama i podvrgnute striktnom Row Level Security (RLS) pravilima:

1. **`profiles`**
   - Proširenje za sistemsku `auth.users` tabelu.
   - Čuva metapodatke: `full_name`, ulogu (`user`, `provider`, `admin`), `subscription_tier`, korišćena AI pitanja, sliku profila, `boat_name`, `boat_length`.
   - *Automatizacija:* Triger se pali na sign-up i automatski instancira prazan profil.

2. **`moorings`**
   - Centralni objekat sistema: vezovi za čamce.
   - Čuva GPS (`lat`, `lng`), kategorizaciju (`country`, `location`), wind protection, cenu, i status.
   - Trenutno populisan sa startnih **110 mediteranskih vezova** preko seed skripte.

3. **`mooring_availability`**
   - Kalendar sistem. Mapira dostupnosti po danima. Provajder ovde može specificirati custom cene i markirati datume kad je vez nedostupan.
   - Kompozitni key na `(mooring_id, date)`.

4. **`bookings`**
   - Čuva informacije o rezervaciji čamca, check-in, check-out, informaciji o gostu, status plaćanja, popust za `is_now4today`.
   - *Automatizacija:* Generiše unikatan `confirmation_code` i izračunava 15% provizije za platformu preko trigera pre unosa.

5. **`reviews`**
   - Ocene vezova od 1-5 sa tekstom komentara.
   - *Automatizacija:* Kad se recenzija doda, triger se aktivira da bi automatski ažurirao prosečnu ocenu u samoj `moorings` tabeli.

6. **`commissions`**
   - Zapiše proviziju provajderima, prati koji su dugovi neisplaćeni.

---

## ✅ Šta je DO SADA URAĐENO (Faza 1 & Faza 2A)

### Backend Setup (Supabase)
- [x] Podizanje novog Supabase projekta (`eu-central-1`).
- [x] Kreiranje celokupne SQL šeme (svih 6 tabela, indexi i foregin keys).
- [x] RLS polise postavljene (Vlasnici kontrolišu svoje vezove, svi vide odobrene vezove, itd).
- [x] Seed skripta implementirana (svih 110 ranije hardkodiranih unosa upisano u pravu SQL bazu!).
- [x] Kreirana i osigurana klijent-side `supabase.ts` konfiguracija.
- [x] Supabase Security Advisories otklonjeni (Function Search Params popravljeni).
- [x] Dodata `increment_ai_questions` RPC funkcija.
- [x] Proširena `profiles` tabela sa `address`, `whatsapp`, `provider_consent_at` kolonama.
- [x] Dodate `marketing_tools` i `insurance_mediation` kolone u `moorings` tabelu.
- [x] Kreirana `publish_provider_profile` RPC funkcija (atomični INSERT veza + dostupnosti + upgrade profila na provider).
- [x] Kreiran `mooring-images` Storage buket (public) sa RLS polisama za upload/view/delete.
- [x] Profil proširen sa `boat_name` i `boat_length` zbog Booking Autofill sistema.

### Context & Hook Arhitektura (Frontend)
- [x] `AuthContext.tsx` — Povezan na Supabase autentifikaciju (Email/Password, Google OAuth, Apple OAuth).
- [x] `useMoorings.ts` (React Query) — Očitava `moorings` direktno sa bekenda (sa sigurnosnim automatskim `fallback`-om).
- [x] `useBookings.ts` — Mutacije za push (Create) booking-a na server.
- [x] `useProfile.ts` — Čitanje i ažuriranje profila korisnika.
- [x] `subscription.ts` — Prebačeno sa localStorage na Supabase profile-based funkcije (`isSubscriptionActive`, `hasAIQuestionsRemaining`).

### Modifikacije korisničkih interfejsa
- [x] **`Auth.tsx`** prebačen na live Supabase Autentifikaciju.
- [x] **`Explore.tsx`** zakačen na live `useMoorings` udicu.
- [x] **`BookingModal.tsx`** zakačen na bazu (čuva booking-e).
- [x] **`AIChatWidget.tsx`** — Migriran sa localStorage na Supabase baza-backed counter (`ai_questions_used`).
- [x] **`UserPricing.tsx`** — Dodat prikaz trenutnog plana ("Current Plan" badge) i zabrana duplih pretplata.

---

## 🚀 Faza 2: Šta JOŠ TREBA DA SE ODRADI (Sledeći Koraci)

### Faza 2B — Provider Flow (`BecomeProvider.tsx` & Booking interakcija)
- [x] Zakačiti `BecomeProvider.tsx` ogromnu formu na Supabase. Kada se popuni, insertuje red u `moorings` sa `status="pending"`, ubacuje korisnika u `provider` ulogu.
- [x] Proširiti `moorings` tabelu sa dodatnim kolonama (winter storage, popusti, now4today cene) — većina već postojala, dodate `marketing_tools` i `insurance_mediation`.
- [x] Ubaciti uploading slika u **Supabase Storage** za Mooring photos (sa preview i remove UI).
- [x] Oživeti *Kalendar dostupnosti*. Povezati `MonthlyCalendar.tsx` sa `mooring_availability` preko RPC funkcije.
- [x] Štititi `/become-provider` rutu auth guard-om (`ProtectedRoute.tsx` — štiti i `/admin`).
- [ ] **STRIPE** — Plaćanje za Premium Add-Ons (Marketing Tools, Premium Listing, Insurance) — odloženo za Fazu 2D.

### Faza 2C — Administrator & Dashboard Kontrola
- [x] Prebaciti **`Admin.tsx`** na `useAdmin.ts` i real-time izvlačenje podataka o zaradi po osnovi `commissions` tabele, pružaocima usluga i ukupnom broju vezova/rezervacija.
- [x] Administrator ima kontrolni centar da pregleda, odobri ili odbije `pending` vezove.
- [x] Administrator može označiti isplatu provizije (`commissions`) kao plaćenu (`mark_paid`).

### ⏩ PRESKOČENO ZA SADA (Skipped for now)
- Faza 2D — Plaćanje (Stripe)

### 📧 Faza 2E — Email Automatizacije (Supabase Edge Functions + Resend)
Pošto je Supabase sada na Pro planu, implementiramo potpuno automatizovane email tokove pomoću **Database Webhooks** (trigera) i **Edge Funkcija**:
- [ ] **Welcome Email:** Slanje poruke dobrodošlice prilikom kreiranja novog profila.
- [ ] **Potvrda rezervacije (Gost):** Email sa informacijama o rezervaciji (`confirmation_code`, datumi, lokacija) koji se šalje nakon uspešnog kreiranja u `bookings` tabeli.
- [ ] **Nova rezervacija (Provajder):** Obaveštenje vlasniku veza da ima novog gosta na svom vezu.
- [ ] **Status veza (Provajder):** Email notifikacija kada administrator odobri (`approved`) ili odbije (`rejected`) vez koji je bio na čekanju.
- [ ] **Check-in Podsetnik (Cron Job):** Scheduled funkcija (Supabase Cron) koja proverava rezervacije koje kreću za 24h i šalje podsetnik i korisna uputstva.
- [ ] **Zahtev za Recenziju (Post-checkout):** Email koji se šalje dan nakon `check_out` datuma sa molbom da korisnik ostavi ocenu za vez.

### 🎯 Faza 3 — User Dashboard (ZAVRŠENO)
- [x] Svaki prijavljeni korisnik (User/Provider/Admin) ima svoj lični Dashboard (`Dashboard.tsx`).
- [x] Pametan redirect nakon Login-a (usmerava sa `/` i `/auth` na `/dashboard`).
- [x] Prikaz personalizovanih podataka preko uloga:
  - **User**: Istorija rezervacija (My Trips) i Settings deo.
  - **Provider**: Sve iz User-a + kalendar prihoda, zahtevi za rezervaciju na njihovim vezovima (Provider Dashboard), brzi link za "Add New Mooring".
  - **Admin**: Link ka glavnom (odvojenom) `/admin` panelu.
- [x] **Settings Tab**: Korisnici i Provajderi mogu menjati lične informacije (`full_name`, `phone`) i detalje broda (`boat_name`, `boat_length`).
- [x] **Smart Booking Autofill**: `BookingModal.tsx` očitava profil logovanog korisnika i automatski popunjava podatke za brod (Name, Length) i gosta (Email, Phone, Name) kako korisnik ne bi morao ponovo da ih kuca.

### 🛠️ Faza 4 — Napredno Upravljanje Vezovima (Provider Management)
Ova faza omogućava provajderima potpunu kontrolu nad njihovim portfolijem vezova, podižući sistem sa *1-vlasnik = 1-vez* na profesionalniji nivo *1-vlasnik = VIŠE-vezova*.

- [ ] **My Moorings (Dashboard Sekcija)**: Provajder na svom dashboard-u vidi listu svih svojih vezova uz jasan indikator statusa (`approved`, `pending`, `rejected`).
- [ ] **Dodavanje višestrukih vezova**: Provajder preko "Add New Mooring" dugmeta može obaviti registraciju dodatnog veza (uz slike, lokaciju...). Svi novi vezovi automatski dobijaju `status="pending"` do administrativne provere.
- [ ] **Izmena postojećih vezova**: Provajder može uređivati metapodatke, opis, slike i generalnu cenu postojećeg veza. Nakon značajnih izmena, status veza bi trebao ponovo otići u `pending` radi provere protiv prevara.
  - *Cenovni imunitet*: Zbog načina upisa, cene u postojećim rezervacijama (`bookings`) su fiksne; tako promena bazične cene na vezu ne utiče na korisnike koji su već zakazali svoj termin po staroj tarifi.
- [ ] **Selekcija i Kalendar (Mooring-specific)**: U svom kalendaru dostupnosti, provajder iz padajućeg menija bira tačno koji vez trenutno uređuje (postavljanje blokada, zauzetosti i dnevnih prilagođenih cena se odnosi samo na izabrani vez).
- [ ] **Brisanje/Deaktivacija**: Mogućnost privremene ili trajne deaktivacije veza koji više nije u upotrebi.

---

## 💡 Arhitektonske Napomene & Preporuke

- **State Sync**: React Query je optimalno kalibrisan, pa izbegavaj ponovno pisanje standardnog Redux/Context state-a za podatke — osloni se na TanStack Query i `staleTime` da ubrzaš interfejse (kao što je to trenutno odrađeno).
- **HardKoded VS Baza**: `src/data/moorings.ts` se **više ne koristi kao fallback** za rendering stranica `Explore.tsx` i `PopularMoorings.tsx` jer su hardkodirani ID-jevi (`hr-1`, `gr-2` itd.) bacali greške pri Supabase backend validaciji koja striktno ocekkuje `uuid` format (`invalid input syntax for type uuid`). Loaderi (`Loader2` komponenta) su postavljeni da spreče prazne prelaze dok se stvarni validni podaci iz Supabase ne učitaju. Glavni izvor je Supabase projekt: `bblxawscmyzelinidkmb`.
- **Rute i Privatnost**: U `App.tsx` sada treba početi štititi administrativne `/admin` i provajderske `/become-provider` rute tako da zahtevaju prijavu (`useAuth().user` check) pre nego sto renderuju ekran.

*(Ovaj dokument kontinuirano osvežavajmo u dogovoru svake sledeće sesije!)*
