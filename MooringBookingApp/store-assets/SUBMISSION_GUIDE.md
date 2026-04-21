# 🚀 App Store & Play Store — Submission Guide

## Preduvjeti

### Expo / EAS
- [x] `eas-cli` instaliran globalno (`npm install -g eas-cli`)
- [x] `eas.json` konfiguriran (development / preview / production profili)
- [x] `app.json` konfiguriran (bundleIdentifier, package, splash, icons)

### Apple (iOS)
- [ ] Apple Developer račun (~99$/god) → https://developer.apple.com
- [ ] App Store Connect aplikacija kreirana → https://appstoreconnect.apple.com
- [ ] Provisioning profile i certifikat (EAS to radi automatski)

### Google (Android)
- [ ] Google Play Console račun (25$ jednokratno) → https://play.google.com/console
- [ ] Service account JSON za automatski upload → vidi: https://expo.dev/docs/submit/android

---

## Korak 1 — Login u Expo

```powershell
eas login
```
Upiši Expo (expo.dev) email i lozinku. Ako nemaš račun, registruj se besplatno.

---

## Korak 2 — Poveži projekt s Expo

```powershell
cd MooringBookingApp
eas init
```
Ovo kreira `extra.eas.projectId` u `app.json`.

---

## Korak 3 — Development Build (testiranje)

### iOS Simulator
```powershell
eas build --profile development --platform ios
```

### Android APK (za testiranje na uređaju)
```powershell
eas build --profile preview --platform android
```

---

## Korak 4 — Production Build

### iOS (.ipa za App Store)
```powershell
eas build --profile production --platform ios
```

### Android (.aab za Play Store)
```powershell
eas build --profile production --platform android
```

> EAS Build radi u cloudu — ne treba ti Mac za iOS build!

---

## Korak 5 — Submit na Store

### iOS → App Store Connect
```powershell
eas submit --profile production --platform ios
```
Trebat ćeš:
- `appleId` (tvoj Apple developer email)
- `ascAppId` (App ID iz App Store Connect)
- `appleTeamId` (iz developer.apple.com → Membership)

Ažuriraj `eas.json` → `submit.production.ios` s ovim podacima.

### Android → Google Play Internal Testing
```powershell
eas submit --profile production --platform android
```
Trebat ćeš:
- Google Play Service Account JSON (`google-play-service-account.json`)
- Upute: https://expo.dev/docs/submit/android#creating-a-google-service-account

---

## Korak 6 — App Store Metadata

### Screenshots — potrebne veličine
| Uređaj | Dimenzija | Obavezno |
|--------|-----------|----------|
| iPhone 6.9" (iPhone 16 Pro Max) | 1320×2868 | ✅ |
| iPhone 6.7" (iPhone 15 Pro Max) | 1290×2796 | ✅ |
| iPhone 5.5" (iPhone 8 Plus) | 1242×2208 | ✅ |
| iPad Pro 13" | 2064×2752 | Ako podržava tablet |

### Generiranje screenshotova
Koristi iOS Simulator ili fizički uređaj:
```powershell
eas build --profile development --platform ios
# Pokreni na simulatoru, napravi screenshotove ručno
```

---

## Korak 7 — App Store Connect Popunjavanje

1. Idi na https://appstoreconnect.apple.com
2. Klikni "+" → nova aplikacija
3. Kopiraj tekst iz `store-assets/app-store-description-en.md`
4. Upload screenshotove
5. Postavi Privacy Policy URL: `https://mooring-booking.com/privacy`
6. Postavi Support URL: `https://mooring-booking.com/support`
7. Cijena: **Besplatno** (Free)
8. Kategorija: Travel

---

## Korak 8 — Google Play Console Popunjavanje

1. Idi na https://play.google.com/console
2. Kreiraj novu aplikaciju
3. Popuni "Store listing" (kopiraj iz eng. opisa)
4. Upload ikone (512×512 px) → koristi `assets/icon.png`
5. Upload feature graphic (1024×500 px)
6. Kategorija: Travel & Local
7. Cijena: Free

---

## Vremenska procjena

| Korak | Trajanje |
|-------|----------|
| Expo login + init | 5 min |
| EAS Production Build (iOS) | 15-25 min (cloud) |
| EAS Production Build (Android) | 10-15 min (cloud) |
| App Store Connect metadata | 30-45 min |
| Apple review | 1-3 dana |
| Google Play review | 1-7 dana |

---

## Napomene

- **Bundle ID**: `com.mooringbooking.app` (iOS) — mora biti jedinstven
- **Package**: `com.mooringbooking.app` (Android)
- EAS Build ne zahtijeva Mac ili Xcode lokalno

---

## Korisni Linkovi

- EAS Build: https://expo.dev/docs/build/introduction
- EAS Submit: https://expo.dev/docs/submit/introduction
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Policy: https://play.google.com/about/developer-content-policy/
