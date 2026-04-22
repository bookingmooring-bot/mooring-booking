-- FAZA 3 — Dynamic MAYDAY: rescue_authorities table
-- Each row = one country's Maritime Rescue Coordination Centre (MRCC) contact.
-- Edge function resolves caller's lat/lng -> country_code -> row, and injects
-- the accurate MRCC phone into the system prompt + response (replacing the
-- previously hardcoded HR fallback).

create table if not exists public.rescue_authorities (
    id uuid primary key default gen_random_uuid(),
    country_code text not null unique,
    country_name text not null,
    mrcc_phone text not null,
    mrcc_alt_phone text,
    vhf_emergency_channel integer not null default 16,
    coast_guard_name text,
    coast_guard_url text,
    updated_at timestamptz not null default now()
);

create index if not exists idx_rescue_authorities_country_code
    on public.rescue_authorities (country_code);

alter table public.rescue_authorities enable row level security;

-- Read-only for everyone (authenticated or anon). No writes from client.
drop policy if exists "rescue_authorities readable by all" on public.rescue_authorities;
create policy "rescue_authorities readable by all"
    on public.rescue_authorities
    for select
    using (true);

-- touch updated_at on update
create or replace function public.touch_rescue_authorities()
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

drop trigger if exists trg_touch_rescue_authorities on public.rescue_authorities;
create trigger trg_touch_rescue_authorities
    before update on public.rescue_authorities
    for each row
    execute function public.touch_rescue_authorities();

-- Seed: Mediterranean + Atlantic + key European MRCC numbers.
-- Phones are canonical published MRCC numbers; VHF Ch 16 is global emergency.
insert into public.rescue_authorities
    (country_code, country_name, mrcc_phone, mrcc_alt_phone, vhf_emergency_channel, coast_guard_name, coast_guard_url)
values
    ('HR', 'Croatia',         '+385 1 195',              '+385 21 195',  16, 'MRCC Rijeka',                      'https://www.mppi.hr'),
    ('IT', 'Italy',            '+39 06 5908 4409',       '1530',          16, 'Guardia Costiera — IMRCC Rome',    'https://www.guardiacostiera.gov.it'),
    ('GR', 'Greece',           '+30 210 4112500',        '108',           16, 'Hellenic Coast Guard — JRCC Piraeus','https://www.hcg.gr'),
    ('FR', 'France',           '+33 4 94 61 16 16',      '196',           16, 'CROSS Méditerranée (La Garde)',    'https://www.premar-mediterranee.gouv.fr'),
    ('ES', 'Spain',            '+34 900 202 202',        '+34 917 559 132',16,'Salvamento Marítimo',              'https://www.salvamentomaritimo.es'),
    ('SI', 'Slovenia',         '+386 5 6632 100',        '+386 1 5800 600',16,'Uprava RS za pomorstvo (URSP)',    'https://www.up.gov.si'),
    ('MT', 'Malta',            '+356 2123 8797',         '+356 2182 4218',16,'RCC Malta — Armed Forces of Malta', 'https://afm.gov.mt'),
    ('CY', 'Cyprus',           '+357 2530 5050',         '1441',          16, 'JRCC Larnaca',                     'https://www.cjrcc.gov.cy'),
    ('TR', 'Turkey',           '+90 312 231 1351',       '158',           16, 'MRCC Ankara — Turkish Coast Guard','https://www.sgk.tsk.tr'),
    ('AL', 'Albania',          '+355 4 222 4770',        '125',           16, 'MRCC Durrës',                      null),
    ('ME', 'Montenegro',       '+382 30 313 240',        '129',           16, 'MRCC Bar',                         null),
    ('TN', 'Tunisia',          '+216 71 341 015',        '+216 71 341 016',16,'MRCC Tunis — Garde Maritime',      null),
    ('EG', 'Egypt',            '+20 3 480 1126',         '+20 3 480 1016',16, 'MRCC Alexandria',                  null),
    ('MA', 'Morocco',          '+212 537 76 74 08',      '+212 522 30 40 40',16,'MRCC Rabat',                     null),
    ('PT', 'Portugal',         '+351 214 401 919',       '214',           16, 'MRCC Lisboa — Marinha',            'https://www.marinha.pt'),
    ('GB', 'United Kingdom',   '+44 23 9255 2100',       '999',           16, 'HM Coastguard — JRCC Fareham',     'https://www.gov.uk/government/organisations/maritime-and-coastguard-agency'),
    ('US', 'United States',    '+1 202 372 2100',        '+1 757 398 6390',16,'US Coast Guard — NCC Washington',  'https://www.uscg.mil'),
    ('DE', 'Germany',          '+49 421 536 870',        '124 124',       16, 'MRCC Bremen — DGzRS',              'https://seenotretter.de'),
    ('NL', 'Netherlands',      '+31 900 0111',           '+31 223 542 300',16,'Kustwacht Nederland — JRCC Den Helder','https://kustwacht.nl'),
    ('BE', 'Belgium',          '+32 59 70 11 00',        '+32 59 55 66 99',16,'MRCC Oostende',                    'https://maritiemeinfo.be')
on conflict (country_code) do update set
    country_name = excluded.country_name,
    mrcc_phone = excluded.mrcc_phone,
    mrcc_alt_phone = excluded.mrcc_alt_phone,
    vhf_emergency_channel = excluded.vhf_emergency_channel,
    coast_guard_name = excluded.coast_guard_name,
    coast_guard_url = excluded.coast_guard_url,
    updated_at = now();
