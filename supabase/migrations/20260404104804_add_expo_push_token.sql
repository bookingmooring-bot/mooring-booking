-- dodajemo expo token
alter table public.profiles add column if not exists expo_push_token text;
