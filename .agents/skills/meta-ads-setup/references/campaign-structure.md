# Meta Ads Campaign Structure — Mooring Booking Week 1

*Last updated: 2026-04-01*
*Campaign: Provider acquisition — Mediterranean coastal targeting*

## Campaign IDs

| Group | Campaign ID |
|-------|-------------|
| HR + IT | 120245134110810750 |
| GR | 120245134111330750 |
| SI + AL + CY | 120245134112410750 |
| ES + FR + TR (new) | 120245136881830750 |

## Adset IDs (used in setup_hook_ads.py)

| Key | Adset ID | Countries | Budget |
|-----|----------|-----------|--------|
| hr_it | 120245136883010750 | Croatia + Italy Adriatic | €200/mo |
| gr | 120245136884040750 | Greece | €160/mo |
| es_fr_tr | 120245136885110750 | Spain + France + Turkey | €200/mo |
| si_al_cy | 120245136885850750 | Slovenia + Albania + Cyprus | €140/mo |

**Total budget: €700/mo base + €200 reserve = max €900/mo**

## Per-Country Targeting Details

### SET 1 — Croatia (hr_it adset)
- Full coastal strip, 5km from coastline
- Dalmatian coast priority: Split, Dubrovnik, Zadar, Sibenik, Trogir
- Istria: Pula, Rovinj, Porec
- Kvarner: Rijeka, Opatija, Crikvenica, Mali Losinj

### SET 2a — Italy Adriatic (hr_it adset — same group as Croatia)
- Trieste, Venezia, Ancona, Bari, Brindisi
- Strictly 5km from Adriatic coastline
- No inland cities (not all of Venice region — just coastal strip)

### SET 2b — Italy Mediterranean (separate targeting consideration)
> NOTE: Currently grouped into hr_it adset. If splitting in future:
- Genova, Napoli, Palermo/Sicilia, Cagliari/Sardegna
- Tyrrhenian and Mediterranean coast, strictly 5km

### SET 3 — Greece (gr adset)
- All island coasts (Corfu, Lefkada, Kefalonia, Zakynthos, Crete, Rhodes, Mykonos, Santorini)
- Coastal mainland: Thessaloniki coast, Patras, Volos
- Athens: ONLY Piraeus + coastal 5km (NOT all of Athens metro)
- Kavala (northern Aegean coast)
- Strictly 5km from coastline

### SET 4 — Spain + France + Portugal (es_fr_tr adset)
- Spain: Costa Brava, Costa Dorada, Costa Blanca, Costa del Sol, Balearic Islands
- France: Cote d'Azur (Nice, Cannes, Antibes, Marseille, Toulon), Corsica
- Portugal: Cascais, Setubal, Algarve (grouped with ES+FR)
- Strictly 5km from Mediterranean/Atlantic coastline

### SET 4 — Turkey (es_fr_tr adset — stays with ES+FR+PT)
- Bodrum, Marmaris, Antalya, Fethiye, Gocek, Kusadasi
- Turkish Aegean and Mediterranean coast only
- Strictly 5km
- Confirmed 02.04.2026: Turkey stays in ES+FR group, not moved to SI+AL+CY

### SET 5 — Slovenia + Albania + Montenegro + Cyprus (si_al_cy adset)
- Slovenia: ONLY Koper, Izola, Portoroz
- Albania: Durres/Drac + Tirana district, Vlore, Saranda, south toward Greece
- Montenegro: Kotor, Tivat, Budva, Bar, Herceg Novi — Adriatic coast 5km only
- Cyprus: Limassol, Larnaca, Paphos, Ayia Napa — all coastal towns
- Malta: Entire island (small = ok to include all)

## Targeting Parameters (all adsets)

- Age: 20–63
- Gender: All (predominantly male decision-makers, but include all)
- Location: 5km radius from coastline (strict — not city centers unless coastal)
- Language: English only
- Platform split: 70% Facebook / 30% Instagram
- Placement: Feed (primary), Stories (secondary)

## EXCLUDED Countries

- Montenegro — not in this campaign
- Bosnia & Herzegovina — not targeted

## Campaign Period

- Start: 02.04.2026
- End: 10.05.2026
- T1 experimental phase: 02–09.04.2026
- Budget scale decision: After T1 based on performance
