-- FAZA 2: Persistent vessel memory for AI Captain
-- One user can own multiple vessels (multi-boat households / charter fleets).
-- AI Captain reads default vessel on every call so user doesn't re-type draft / beam / MMSI.

create table if not exists public.user_vessel_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  boat_type text check (boat_type in ('sailboat','motorboat','rib','catamaran','yacht','other')),
  length_m numeric(5,2),
  beam_m numeric(5,2),
  draft_m numeric(5,2),
  mmsi text,
  call_sign text,
  insurance_expiry date,
  engine_make text,
  engine_model text,
  engine_hours integer,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_vessel_profiles_user_idx
  on public.user_vessel_profiles (user_id);

-- Only one default per user
create unique index if not exists user_vessel_profiles_one_default_per_user
  on public.user_vessel_profiles (user_id)
  where is_default = true;

-- Touch updated_at on UPDATE
create or replace function public.user_vessel_profiles_touch()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at := now();
  return new;
end;
$fn$;

drop trigger if exists user_vessel_profiles_touch_trg on public.user_vessel_profiles;
create trigger user_vessel_profiles_touch_trg
  before update on public.user_vessel_profiles
  for each row execute function public.user_vessel_profiles_touch();

-- RLS: owner full access
alter table public.user_vessel_profiles enable row level security;

drop policy if exists "vessel_profiles_owner_select" on public.user_vessel_profiles;
create policy "vessel_profiles_owner_select" on public.user_vessel_profiles
  for select using (auth.uid() = user_id);

drop policy if exists "vessel_profiles_owner_insert" on public.user_vessel_profiles;
create policy "vessel_profiles_owner_insert" on public.user_vessel_profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "vessel_profiles_owner_update" on public.user_vessel_profiles;
create policy "vessel_profiles_owner_update" on public.user_vessel_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "vessel_profiles_owner_delete" on public.user_vessel_profiles;
create policy "vessel_profiles_owner_delete" on public.user_vessel_profiles
  for delete using (auth.uid() = user_id);

-- One-shot backfill: copy profiles.boat_name / boat_length to a default vessel row
-- for users who already set them but have 0 vessel rows.
insert into public.user_vessel_profiles (user_id, name, length_m, is_default)
select p.id, p.boat_name, p.boat_length, true
from public.profiles p
where p.boat_name is not null
  and not exists (
    select 1 from public.user_vessel_profiles v where v.user_id = p.id
  );
