-- AI Captain per-user preferences (FAZA 9)
-- One row per user. Captured once on first chat open, reused forever.

create table if not exists public.ai_captain_preferences (
    user_id uuid primary key references auth.users(id) on delete cascade,
    answer_style text not null check (answer_style in ('bullets', 'balanced', 'detailed')),
    experience_level text not null check (experience_level in ('beginner', 'intermediate', 'advanced', 'professional')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.ai_captain_preferences enable row level security;

drop policy if exists "ai_captain_preferences self-read" on public.ai_captain_preferences;
create policy "ai_captain_preferences self-read"
    on public.ai_captain_preferences
    for select
    using (auth.uid() = user_id);

drop policy if exists "ai_captain_preferences self-write" on public.ai_captain_preferences;
create policy "ai_captain_preferences self-write"
    on public.ai_captain_preferences
    for insert
    with check (auth.uid() = user_id);

drop policy if exists "ai_captain_preferences self-update" on public.ai_captain_preferences;
create policy "ai_captain_preferences self-update"
    on public.ai_captain_preferences
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- RPCs — thin wrappers so both clients and the edge function can fetch/save.
create or replace function public.get_my_ai_preferences()
returns table (
    answer_style text,
    experience_level text,
    created_at timestamptz,
    updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
    select answer_style, experience_level, created_at, updated_at
    from public.ai_captain_preferences
    where user_id = auth.uid();
$$;

grant execute on function public.get_my_ai_preferences() to authenticated;

create or replace function public.upsert_my_ai_preferences(
    p_answer_style text,
    p_experience_level text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user uuid := auth.uid();
begin
    if v_user is null then
        raise exception 'not authenticated';
    end if;
    if p_answer_style not in ('bullets', 'balanced', 'detailed') then
        raise exception 'invalid answer_style';
    end if;
    if p_experience_level not in ('beginner', 'intermediate', 'advanced', 'professional') then
        raise exception 'invalid experience_level';
    end if;

    insert into public.ai_captain_preferences (user_id, answer_style, experience_level)
    values (v_user, p_answer_style, p_experience_level)
    on conflict (user_id) do update
        set answer_style = excluded.answer_style,
            experience_level = excluded.experience_level,
            updated_at = now();
end;
$$;

grant execute on function public.upsert_my_ai_preferences(text, text) to authenticated;
