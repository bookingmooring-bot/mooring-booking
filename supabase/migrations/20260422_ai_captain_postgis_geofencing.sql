-- Geofenced mooring search for AI Captain (Verified Partner first, Premium next, distance, rating)
-- 1) Enable PostGIS
create extension if not exists postgis with schema extensions;

-- 2) Add geography column to moorings
alter table public.moorings
  add column if not exists geog extensions.geography(Point, 4326);

-- 3) Backfill existing rows
update public.moorings
set geog = extensions.ST_SetSRID(extensions.ST_MakePoint(lng, lat), 4326)::extensions.geography
where geog is null and lat is not null and lng is not null;

-- 4) Trigger keeps geog in sync with lat/lng changes
create or replace function public.moorings_sync_geog()
returns trigger
language plpgsql
as $fn$
begin
  if new.lat is not null and new.lng is not null then
    new.geog := extensions.ST_SetSRID(extensions.ST_MakePoint(new.lng, new.lat), 4326)::extensions.geography;
  else
    new.geog := null;
  end if;
  return new;
end;
$fn$;

drop trigger if exists moorings_sync_geog_trg on public.moorings;
create trigger moorings_sync_geog_trg
  before insert or update of lat, lng on public.moorings
  for each row execute function public.moorings_sync_geog();

-- 5) GiST spatial index
create index if not exists moorings_geog_gix
  on public.moorings using gist (geog);

-- 6) RPC: geofenced, prioritized mooring search
create or replace function public.nearby_active_moorings(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision default 150,
  min_boat_length numeric default null
)
returns table (
  id uuid,
  name text,
  location text,
  country text,
  country_flag text,
  lat double precision,
  lng double precision,
  price_per_night numeric,
  max_boat_length numeric,
  max_draft numeric,
  amenities text[],
  wind_protection text,
  is_last_minute boolean,
  is_now4today boolean,
  is_verified_partner boolean,
  is_premium_listing boolean,
  winter_storage boolean,
  mooring_units integer,
  rating numeric,
  review_count integer,
  distance_km double precision
)
language sql
stable
security definer
set search_path = public, extensions
as $fn$
  select
    m.id, m.name, m.location, m.country, m.country_flag,
    m.lat, m.lng, m.price_per_night, m.max_boat_length, m.max_draft,
    m.amenities, m.wind_protection, m.is_last_minute, m.is_now4today,
    m.is_verified_partner, m.is_premium_listing, m.winter_storage,
    m.mooring_units, m.rating, m.review_count,
    (extensions.ST_Distance(
      m.geog,
      extensions.ST_SetSRID(extensions.ST_MakePoint(user_lng, user_lat), 4326)::extensions.geography
    ) / 1000.0)::double precision as distance_km
  from public.moorings m
  where m.status = 'active'
    and m.geog is not null
    and extensions.ST_DWithin(
      m.geog,
      extensions.ST_SetSRID(extensions.ST_MakePoint(user_lng, user_lat), 4326)::extensions.geography,
      radius_km * 1000.0
    )
    and (min_boat_length is null or m.max_boat_length is null or m.max_boat_length >= min_boat_length)
  order by
    m.is_verified_partner desc nulls last,
    m.is_premium_listing desc nulls last,
    distance_km asc,
    m.rating desc nulls last
  limit 50;
$fn$;

grant execute on function public.nearby_active_moorings(double precision, double precision, double precision, numeric)
  to anon, authenticated, service_role;
