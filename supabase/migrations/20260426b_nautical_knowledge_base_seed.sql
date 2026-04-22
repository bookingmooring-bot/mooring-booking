-- FAZA 1b: Seed nautical_kb with ~30 curated chunks (embeddings populated by edge function on first use)
-- All content is in Croatian for the base corpus; multi-language chunks can be added later.

insert into public.nautical_kb (topic, content, lang, source_type) values
-- Wind
('Bura — jadranski NE vjetar',
 'Bura je suh, hladan vjetar iz NE kvadranta koji puše s kopna prema moru, najjači u zimskim mjesecima (listopad – travanj). Udari mogu premašiti 60 čvorova u područjima Velebita (Senj, Maslenica) i Kvarneru. Znakovi dolaska: čisto nebo s kapom oblaka iznad Velebita, nagli pad tlaka. Taktika: osiguraj brod u zaštićenoj uvali s JUG ili JZ ekspozicijom, duple priveze, dodatne gume. Nemoj isploviti ako je prognoza >25 čv.',
 'hr', 'wind'),
('Jugo — jadranski SE vjetar',
 'Jugo je topao, vlažan vjetar iz SE kvadranta koji donosi dug zalaz, duboke valove (swell) i kišu. Puše dulje od Bure (2–5 dana), jačina 20–40 čv, povremeno do 50. Udari rastu postupno pa imaš više vremena za sklanjanje. Taktika: potraži luku zaštićenu sa SE smjera — južne strane otoka nisu dobre, preferiraj sjeverne uvale otoka Hvar, Brač, Korčula ili unutar kanala.',
 'hr', 'wind'),
('Maestral — termički NW vjetar',
 'Maestral je lagani poslijepodnevni termički vjetar iz NW kvadranta, 10–18 čv, tipičan za ljeto od 11–12h do zalaska sunca. Ugodan za jedrenje, predvidljiv. Nije opasan ali može zakomplicirati ulazak u luke s NW ekspozicijom (pristup s vjetrom u krmu).',
 'hr', 'wind'),
('Tramontana — sjeverni vjetar',
 'Tramontana je sjeverni vjetar (N/NNW), češći u sjevernom Jadranu. Hladan, suh, jačina 15–30 čv. Može se kombinirati s Burom i dati jake udare kroz kanale (Kvarnerić, Velebitski kanal).',
 'hr', 'wind'),

-- COLREGS
('COLREGS Pravilo 5 — Stalna straža',
 'Pravilo 5 (Look-out): svaki brod je dužan u svakom trenutku održavati pravilnu vidnu i slušnu stražu, kao i straža svim raspoloživim sredstvima primjerenim postojećim okolnostima i uvjetima, kako bi u potpunosti ocijenili situaciju i rizik sudara.',
 'hr', 'colregs'),
('COLREGS Pravilo 8 — Akcija za izbjegavanje sudara',
 'Pravilo 8: svaka radnja za izbjegavanje sudara mora biti pozitivna, izvedena pravodobno i uz primjereno održavanje dobre prakse pomoraca. Ako ima dovoljno vremena, treba izbjegavati uzastopne male promjene smjera ili brzine.',
 'hr', 'colregs'),
('COLREGS Pravilo 16 — Brod koji se mora skloniti',
 'Pravilo 16: brod koji se mora skloniti drugom brodu, mora, koliko god je to moguće, poduzeti radnju pravovremeno i učinkovito kako bi se sklonio na sigurnu udaljenost.',
 'hr', 'colregs'),
('COLREGS Pravilo 18 — Odgovornost među brodovima',
 'Pravilo 18: brod na mehanički pogon koji je u plovidbi mora se skloniti: (i) brodu koji nije sposoban manevrirati, (ii) brodu ograničene sposobnosti manevriranja, (iii) brodu koji se bavi ribolovom, (iv) jedrilici. Jedrilica se mora skloniti brodu koji nije sposoban manevrirati i brodu koji se bavi ribolovom.',
 'hr', 'colregs'),

-- Anchoring
('Sidrenje — omjer lanca',
 'Preporučeni omjer sidrenja je 5:1 u dobrim uvjetima, 7:1 pri vjetru 20+ čv, 10:1 u oluji. Omjer se računa od sidra do pramca broda (dubina + nadvodni dio). Primjer: za dubinu 8m s pramcem 1.5m iznad vode, treba otpustiti barem 5×9.5 = 47.5m lanca pri 5:1.',
 'hr', 'anchoring'),
('Sidrenje — podloga i izbjegavanje Posidonie',
 'Najbolja podloga je pješčano ili muljevito dno (stabilno držanje). Izbjegavaj Posidoniju (morska livada) — zaštićena je EU regulativom i sidro ne drži u njoj. Također izbjegavaj stjenovito i kamenito dno (sidro se može zaglaviti ili izgubiti). Na Navionics/NV karti Posidonia je označena zelenom šrafurom.',
 'hr', 'anchoring'),
('Sidrenje — prilaz i spuštanje sidra',
 'Prilaz uvali: smanji brzinu na 1–2 čv, postavi pramac u vjetar. Spuštanje: pusti sidro da padne pod nadzorom vinča (ne bacati!), natrag lagano otpuštaj lanac dok brod drifta unatrag. Kad je sav lanac u vodi, napni (reverse 1500 rpm 10s) da sidro uhvati. Provjeri GPS anchor alarm.',
 'hr', 'anchoring'),

-- Berthing / Mooring
('Privez u Marina — prilaz krmom',
 'Standardni Mediteranski privez: brod pristupi krmom, pramac se veže na mrtvi sidreni blok (mooring line — murring). Prilaz pod 30–45° prema vezu, smanji brzinu 15m prije veza, reverse prema mjestu. Prvo špag na kolca (vezaš pramčane linije), zatim krmeni špringtauvi. Crew mora imati dva štapa s kukom spremna.',
 'hr', 'platform'),
('Privez — sigurnost pri bočnom vjetru',
 'Pri bočnom vjetru >15 čv, prilaz pod manjim kutom (20°) s vjetrom u pramac. Koristi bočno potiskivanje (thruster) ako ga brod ima. Drži visoku brzinu (2 čv) do zadnjeg trenutka kako bi imao upravljivost. Nikad ne napuštaj kormilo.',
 'hr', 'platform'),

-- Diagnostics — engine
('Motor ne pali — Diesel inboard',
 'Provjeri: 1) punjenje baterije (mora biti 12.6V+ na stanju mirovanja), 2) osigurače u kutiji motora, 3) slavinu goriva (je li otvorena), 4) primarni filter goriva (voda u filtru?), 5) sekundarni filter, 6) odzračivanje sustava goriva ako je pražnjen tank ili zamijenjen filtar. Ako starter samo klikne, najvjerojatnije je baterija prazna ili su stezaljke korodirale.',
 'hr', 'diagnostics'),
('Pregrijavanje motora — akcija i uzroci',
 'ODMAH ugasi motor ako alarm temperature zvoni ili kazaljka ulazi u crveno. Provjeri: 1) pijavar (tell-tale) ima li vode — ako ne, impeller morske pumpe je propao, 2) rešetku morske pumpe (možda je začepljena vrećicom ili algama), 3) zamrznuti sustav (u zimi). Nastavak vožnje s pregrijanim motorom = dizanje glave motora i račun od nekoliko tisuća eura.',
 'hr', 'diagnostics'),
('Impeller morske pumpe — preventiva',
 'Impeller je gumena krila u morskoj pumpi koji cirkuliraju rashladnu vodu kroz izmjenjivač. Propast je najčešći uzrok pregrijavanja. Zamijeniti svake 200 sati ili 2 sezone, koji god prije. Uvijek imaj rezervni impeller + O-ring brtva na brodu. Zamjena: izvadi poklopac pumpe (4 vijka), povuci stari impeller, provjeri jesu li sva krila cijela (ostatci su u izmjenjivaču — izvaditi).',
 'hr', 'diagnostics'),
('Boja dima iz ispuha — dijagnoza',
 'Bijeli dim = voda u komori izgaranja (propuštanje glave motora, ozbiljan kvar, UGASI odmah). Plavi dim = gori motorno ulje (pretjerano podmazivanje, istrošeni klipni prstenovi, servis). Crni dim = bogata mješavina goriva ili začepljen filter zraka (pogledaj filter, očisti). Sivi/laki plavi dim pri paljenju = normalno kod hladnog diesela.',
 'hr', 'diagnostics'),
('Vanjski motor — ne pali',
 'Provjeri: 1) kill-switch (crvena traka, je li uključena?), 2) primer pumpica goriva (pritisni 5× dok ne postane tvrda), 3) slavinu goriva otvorena, 4) svjećice (stare = grubo paljenje), 5) stara benzina (>3 mjeseca) može raditi probleme, 6) baterija 12V+. Za Yamaha/Mercury provjeri flash kod na tahometru.',
 'hr', 'diagnostics'),
('Kavitacija vanjskog motora',
 'Kavitacija = visoki obrtaji bez potiska. Uzroci: 1) propeller sklizne na gumi (zamjenski pin/guma), 2) pogrešan trim (previše prema gore), 3) oštećena lopatica vijka, 4) preopterećen brod (preveliko opterećenje na krmu). Spusti trim, smanji plin, provjeri vijak u luci.',
 'hr', 'diagnostics'),

-- Electrical
('Alternator ne puni bateriju',
 'Napon pri 1500 rpm mora biti 13.8–14.4V (mjeri na bateriji). Ako je <13V motor radi ali alternator ne puni. Provjeri: 1) remen (popuštenje, pukotine), 2) priključke na alternatoru (korozija), 3) osigurač punjenja (često 80A u kutiji), 4) dioda (neispravna = testira mehaničar). Bez punjenja baterija će se prazniti za nekoliko sati pa ugasi sve nebitne potrošače.',
 'hr', 'electrical'),
('Sidreni vinč ne radi',
 'Provjeri: 1) glavni osigurač vinča (60–150A, kod baterije), 2) termička zaštita (čeka 10 min nakon preopterećenja), 3) napon baterije pod opterećenjem (treba biti >11V), 4) spojevi na motoru vinča (korozija), 5) manual override (kvačilo isključeno?). Hitno: iskopi kvačilo i ručno spusti sidro s debelim rukavicama.',
 'hr', 'electrical'),
('Pumpa pilji (bilge pump) ne aktivira se',
 'Ako pumpa ne radi automatski: float switch (plovak) se zaribao. Testiraj ručnim prekidačem — ako radi ručno, plovak je problem. Ako ni ručno ne radi: osigurač, kabel ili motor pumpe. Ako pumpa radi ali ne crpi: začepljeno usisno crijevo ili povratni ventil (check valve). Voda naglo ulazi? Zatvori najbliži seacock i traži izvor.',
 'hr', 'electrical'),

-- Sails
('Roler (furler) zaglavio',
 'Ne sili elektromotor furlera — spališ ga. Popusti škotu jedra, vrati smjer broda tako da vjetar ne drži jedro napeto, ručno okreni dobos furlera. Ako se ne može: spusti flok u cijelosti, popravak u luci. Uzrok: prekriven konop na dobosu, uvrnuta linija, slomljen ležaj.',
 'hr', 'sails'),
('Halyard zaglavio u jarbolu',
 'Jedrilica s zaglavljenim štagom (halyard): 1) popusti škotu, 2) provjeri nije li se zaglavio na sheave (kotačić na vrhu jarbola) — povuci s više strana, 3) McLube lubrikant na tračnicu. Ako treba idenje na jarbol — uvijek s drugom osobom, sigurnosni pojas i back-up štap.',
 'hr', 'sails'),

-- Fuel
('Potrošnja goriva — procjena',
 'Motorna jahta 10–14m pri krstarećoj brzini (7–8 čv): 15–25 L/h. Gliser 7–9m pri glisiranju (25+ čv): 40–80 L/h. RIB 5–6m s motorom 150 KS: 25–40 L/h pri 25 čv. Uvijek planiraj 20% rezerve. Za dugu plovidbu izračunaj: potrebne milje ÷ brzina × L/h + 20%.',
 'hr', 'fuel'),
('Benzinske pumpe u luci — praksa',
 'Uvijek provjeriti radno vrijeme pumpe (često zatvorene noću i nedjeljom popodne). Petkom popodne i subotom ujutro su najgore gužve zbog chartera — planiraj tankanje u srijedu-četvrtak ako je moguće. Kod vjetra >15 čv pristup pumpi može biti opasan (čekanje u redu s malom manevarskom sposobnosti). Nikad ne puni gorivo dok motor radi ili dok netko puši.',
 'hr', 'fuel'),

-- MAYDAY / Emergency
('MAYDAY protokol — VHF poziv',
 'Pri tonjenju, požaru ili teškoj ozljedi izgovori 3× "MAYDAY" na VHF kanalu 16. Format: MAYDAY MAYDAY MAYDAY, ovo je [ime broda], [MMSI], pozicija [GPS koordinate], priroda nevolje [tonem / gorim / povrijeđen], broj osoba [n], [opis broda: tip, boja], OVER. Čekaj potvrdu MRCC. Budi uz radio.',
 'hr', 'emergency'),
('Osoba u moru (MOB)',
 'POSTUPAK: 1) odmah vikni "Čovjek u moru!" 2) baci MOB booy (lifesling) u smjeru osobe 3) pritisni MOB gumb na GPS-u za oznaku pozicije 4) spusti jedra ili neutralizuj motor 5) okreni brod po Williamsonu (60° lijevo, pa 180° desno dok se vratiš na kontrakurs) 6) priđi s podvjetrine, baci konop, povuci osobu u brod preko krme s izvučenom stepenicom.',
 'hr', 'emergency'),
('EPIRB aktivacija',
 'EPIRB (Emergency Position Indicating Radio Beacon) aktivira se automatski pri potonuću ili ručno. Pošalji signal na 406 MHz satelitu s GPS pozicijom. MRCC dobiva poziciju u 5–15 min. UKLJUČI kad je život u opasnosti i ne može se komunicirati preko VHF-a. Registracija EPIRB-a na nacionalnoj lučkoj kapetaniji je obavezna.',
 'hr', 'emergency'),

-- Pilotage
('Vremenske granice za plovidbu',
 'Vjetar 0–15 čv = ugodno. 15–25 čv = pazi, zatvaraj jedra po potrebi. 25–35 čv = samo iskusni, skloni se u luku. >35 čv = ostani u luci, dupli priveze. Val >2.5m (swell) = ne idi ako nemaš iskustvo, ciklično ljuljanje čini navigaciju opasnom. Vidljivost <1 NM = oprez, koristi radar i AIS.',
 'hr', 'pilot_book'),
('Ruta Split–Hvar planiranje',
 'Udaljenost Split ACI Marina → Hvar (centar) ≈ 22 NM. Pri krstarećoj brzini 7 čv = ~3 sata. Ruta: izlazak iz Splitske luke prema JZ, zaobiđi Čiovo, kroz Splitski kanal, prolaz kraj Šolte (ili kroz Splitska vrata), pristup Hvaru sa sjeverne strane. Alternativa: Pakleni otoci (Palmižana) 2 NM od Hvara. Pri Juzima skloni se u Jelsu (istočniji, zaštićeniji).',
 'hr', 'pilot_book')
on conflict do nothing;
