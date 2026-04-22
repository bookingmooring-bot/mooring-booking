-- FAZA 5 — Nautical vocabulary glossary
-- Stores canonical translations of nautical terms used across AI Captain
-- responses. HR and EN are authoritative (platform's primary languages).
-- IT / DE / FR columns are nullable; fill in during FAZA 5B.

create table if not exists public.nautical_terms (
    term_key text primary key,
    en text not null,
    hr text not null,
    it text,
    de text,
    fr text,
    notes text,
    updated_at timestamptz not null default now()
);

alter table public.nautical_terms enable row level security;

drop policy if exists "nautical_terms readable by all" on public.nautical_terms;
create policy "nautical_terms readable by all"
    on public.nautical_terms
    for select
    using (true);

create or replace function public.touch_nautical_terms()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists trg_touch_nautical_terms on public.nautical_terms;
create trigger trg_touch_nautical_terms
    before update on public.nautical_terms
    for each row
    execute function public.touch_nautical_terms();

-- Seed ~50 core terms (units, winds, maneuvers, boat parts, safety)
insert into public.nautical_terms (term_key, en, hr, it, de, fr, notes) values
    -- Units
    ('unit_knot',           'knot (kn)',          'čvor (čv)',         'nodo (kn)',        'Knoten (kn)',        'nœud (kn)',        'speed over water'),
    ('unit_nm',             'nautical mile (NM)', 'nautička milja (NM)','miglio nautico (NM)','Seemeile (sm)',   'mille nautique (NM)','1852m'),
    ('unit_beaufort',       'Beaufort (Bft)',     'Beaufort (Bft)',    'Beaufort (Bft)',   'Beaufort (Bft)',     'Beaufort (Bft)',   'wind-force scale 0-12'),
    ('unit_fathom',         'fathom',             'hvat',              'braccio',          'Faden',              'brasse',           '1.83m — chart depth'),
    -- Mediterranean winds (proper nouns; keep recognizable)
    ('wind_bura',           'Bura',               'Bura',              'Bora',             'Bora',               'Bora',             'cold gusty NE Adriatic katabatic'),
    ('wind_jugo',           'Jugo (Sirocco)',     'Jugo',              'Scirocco',         'Schirokko',          'Sirocco',          'warm humid SE; builds seas'),
    ('wind_maestral',       'Maestral',           'Maestral',          'Maestrale',        'Maestral',           'Mistral',          'NW thermal breeze, fair-weather'),
    ('wind_tramontana',     'Tramontana',         'Tramontana',        'Tramontana',       'Tramontana',         'Tramontane',       'cold N wind'),
    ('wind_levant',         'Levanter (Levant)',  'Levant',            'Levante',          'Levante',            'Levant',           'E wind, Gibraltar area'),
    -- Motion & direction
    ('dir_heading',         'heading',            'kurs (smjer)',      'rotta',            'Kurs',               'cap',              null),
    ('dir_bearing',         'bearing',            'azimut',            'rilevamento',      'Peilung',            'relèvement',       null),
    ('dir_cog',             'COG (course over ground)','smjer kretanja (COG)','rotta sul fondo (COG)','Kurs über Grund (KüG)','route-fond (COG)',null),
    ('dir_sog',             'SOG (speed over ground)','brzina po dnu (SOG)','velocità sul fondo (SOG)','Geschwindigkeit über Grund (GüG)','vitesse-fond (SOG)',null),
    ('dir_windward',        'windward (to weather)','privjetrina',     'sopravvento',      'Luv',                'au vent',          null),
    ('dir_leeward',         'leeward',            'zavjetrina',        'sottovento',       'Lee',                'sous le vent',     null),
    -- Sea state
    ('sea_swell',           'swell',              'more (mrtvo more)', 'onda lunga',       'Dünung',             'houle',            'long-period wave'),
    ('sea_waves',           'waves',              'valovi',            'onde',             'Wellen',             'vagues',           'wind-driven'),
    ('sea_chop',            'chop',               'šum mora',          'mare corto',       'kurze See',          'clapot',           'short steep waves'),
    -- Boat parts & geometry
    ('boat_draft',          'draft',              'gaz',               'pescaggio',        'Tiefgang',           'tirant d''eau',    'critical for mooring'),
    ('boat_beam',           'beam',               'širina broda',      'baglio',           'Breite',             'largeur',          'widest point'),
    ('boat_loa',            'LOA (length over all)','duljina (LOA)',   'lunghezza fuori tutto','Länge über alles','longueur hors-tout',null),
    ('boat_bow',            'bow',                'pramac',            'prua',             'Bug',                'proue',            null),
    ('boat_stern',          'stern',              'krma',              'poppa',            'Heck',               'poupe',            null),
    ('boat_port',           'port (side)',        'lijevi bok',        'babordo',          'Backbord',           'bâbord',           'red light'),
    ('boat_starboard',      'starboard',          'desni bok',         'tribordo',         'Steuerbord',         'tribord',          'green light'),
    ('boat_keel',           'keel',               'kobilica',          'chiglia',          'Kiel',               'quille',           null),
    ('boat_rudder',         'rudder',             'kormilo',           'timone',           'Ruder',              'gouvernail',       null),
    ('boat_mast',           'mast',               'jarbol',            'albero',           'Mast',               'mât',              null),
    -- Maneuvers
    ('man_anchor',          'anchor',             'sidro',             'ancora',           'Anker',              'ancre',            null),
    ('man_moor_stern',      'stern-to mooring',   'sterno',            'ormeggio di poppa','Heck-anlegen',       'amarrage par l''arrière','classic Med'),
    ('man_moor_alongside',  'alongside mooring',  'uz gat',            'ormeggio di fianco','längsseits anlegen','amarrage en long',null),
    ('man_moor_bow',        'bow-to mooring',     'pramcem uz gat',    'ormeggio di prua', 'Bug-anlegen',        'amarrage par l''avant',null),
    ('man_raft_up',         'raft up',            'zaboraviti sidro',  'raffica',          'im Päckchen liegen', 'amarrage en raft',null),
    ('man_tack',            'tack',               'kros',              'virare di bordo',  'wenden',             'virer de bord',    'sailing'),
    ('man_gybe',            'gybe',               'okretanje na prug',  'strambata',       'halsen',             'empannage',        'sailing'),
    -- Lines & equipment
    ('line_bowline',        'bowline',            'ribarski uzao',     'gassa d''amante',  'Palstek',            'nœud de chaise',   'king of knots'),
    ('line_cleat_hitch',    'cleat hitch',        'čvor na bitvi',     'nodo alla galloccia','Belegklampe-Schlag','tour mort sur taquet',null),
    ('line_fender',         'fender',             'bokobran',          'parabordo',        'Fender',             'pare-battage',     null),
    ('line_painter',        'painter',            'pramčana uzica',    'barbetta',         'Fangleine',          'bosse',            'dinghy line'),
    -- Safety / emergency
    ('safety_epirb',        'EPIRB (406 MHz)',    'EPIRB (406 MHz)',   'EPIRB (406 MHz)',  'EPIRB (406 MHz)',    'EPIRB (406 MHz)',  'distress beacon'),
    ('safety_mayday',       'MAYDAY',             'MAYDAY',            'MAYDAY',           'MAYDAY',             'MAYDAY',           'grave-and-imminent'),
    ('safety_panpan',       'PAN-PAN',            'PAN-PAN',           'PAN-PAN',          'PAN-PAN',            'PAN-PAN',          'urgency'),
    ('safety_securite',     'SECURITÉ',           'SECURITÉ',          'SECURITÉ',         'SECURITÉ',           'SECURITÉ',         'safety message'),
    ('safety_vhf16',        'VHF Channel 16',     'VHF kanal 16',      'VHF canale 16',    'UKW Kanal 16',       'VHF canal 16',     'international distress'),
    ('safety_lifevest',     'life jacket (PFD)',  'prsluk za spašavanje','giubbotto di salvataggio','Rettungsweste','gilet de sauvetage',null),
    ('safety_flares',       'flares',             'rakete za uzbunu',  'razzi di soccorso','Signalraketen',      'fusées de détresse',null),
    -- Weather phenomena
    ('wx_gust',             'gust',               'udar vjetra',       'raffica',          'Bö',                 'rafale',           null),
    ('wx_squall',           'squall',             'iznenadni pljusak', 'groppo',           'Bö (Schauer)',       'grain',            'sudden wind+rain'),
    ('wx_thunderstorm',     'thunderstorm',       'grmljavinska oluja','temporale',        'Gewitter',           'orage',            null),
    ('wx_fog',              'fog',                'magla',             'nebbia',           'Nebel',              'brouillard',       null)
on conflict (term_key) do update set
    en = excluded.en,
    hr = excluded.hr,
    it = coalesce(excluded.it, public.nautical_terms.it),
    de = coalesce(excluded.de, public.nautical_terms.de),
    fr = coalesce(excluded.fr, public.nautical_terms.fr),
    notes = coalesce(excluded.notes, public.nautical_terms.notes),
    updated_at = now();
