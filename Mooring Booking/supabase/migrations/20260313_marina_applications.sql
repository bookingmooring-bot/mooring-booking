-- Marina Partnership Applications Table
-- Run this in Supabase SQL Editor

create table if not exists public.marina_applications (
  id               uuid primary key default gen_random_uuid(),
  marina_name      text not null,
  location         text not null,
  contact_name     text not null,
  email            text not null,
  phone            text not null,
  number_of_berths integer not null,
  current_system   text,
  website          text,
  white_label      text,
  message          text,
  status           text not null default 'pending',
  submitted_at     timestamptz not null default now(),
  reviewed_at      timestamptz,
  user_id          uuid references auth.users(id)
);

alter table public.marina_applications enable row level security;

-- Anyone (including anonymous) can insert a new application
create policy "insert marina applications"
  on public.marina_applications
  for insert
  with check (true);

-- Only admins can read all applications
create policy "admin read marina applications"
  on public.marina_applications
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only admins can update (approve/reject)
create policy "admin update marina applications"
  on public.marina_applications
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
