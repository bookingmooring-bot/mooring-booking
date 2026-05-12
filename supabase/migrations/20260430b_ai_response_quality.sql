-- FAZA 7 — AI response quality monitoring
-- One row per AI Captain reply, plus a daily aggregate view the admin
-- dashboard reads from. Users rate their own messages thumbs-up/down via a
-- dedicated endpoint that updates `user_rating` on the existing row.

create table if not exists public.ai_response_quality (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    conversation_id uuid,                            -- groups messages in one chat turn (client-generated uuid)
    intent text,
    confidence numeric(4,3),                         -- 0..1
    user_rating smallint check (user_rating in (-1, 0, 1)) default 0,
    flags text[] default '{}',
    language text,
    latency_ms integer,
    tokens_used integer,
    paywall boolean default false,
    emergency boolean default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_ai_response_quality_created_at on public.ai_response_quality (created_at desc);
create index if not exists idx_ai_response_quality_intent     on public.ai_response_quality (intent);
create index if not exists idx_ai_response_quality_user       on public.ai_response_quality (user_id, created_at desc);
create index if not exists idx_ai_response_quality_rating     on public.ai_response_quality (user_rating) where user_rating <> 0;
create index if not exists idx_ai_response_quality_conv       on public.ai_response_quality (conversation_id);

alter table public.ai_response_quality enable row level security;

-- Users read their own rows (for "you rated this") and admins read everything.
drop policy if exists "ai_response_quality self-read" on public.ai_response_quality;
create policy "ai_response_quality self-read"
    on public.ai_response_quality
    for select
    using (
        auth.uid() = user_id
        or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );

-- No client writes — everything goes through the feedback RPC / service role.

-- Daily aggregate for the admin dashboard.
-- Recharts reads from this view; joining raw rows would be slow past 100k.
create or replace view public.ai_quality_daily as
select
    date_trunc('day', created_at)                                         as day,
    count(*)                                                              as total_calls,
    count(*) filter (where confidence < 0.5)                              as low_confidence_calls,
    count(*) filter (where array_length(flags, 1) > 0)                    as flagged_calls,
    count(*) filter (where user_rating = 1)                               as thumbs_up,
    count(*) filter (where user_rating = -1)                              as thumbs_down,
    count(*) filter (where paywall)                                       as paywall_hits,
    count(*) filter (where emergency)                                     as emergency_calls,
    round(avg(confidence)::numeric, 3)                                    as avg_confidence,
    round(avg(latency_ms)::numeric, 1)                                    as avg_latency_ms,
    jsonb_object_agg(intent, intent_count)                                as intent_breakdown
from (
    select
        created_at,
        confidence,
        flags,
        user_rating,
        paywall,
        emergency,
        latency_ms,
        intent,
        count(*) over (partition by date_trunc('day', created_at), intent) as intent_count
    from public.ai_response_quality
    where created_at > now() - interval '60 days'
) t
group by date_trunc('day', created_at)
order by day desc;

grant select on public.ai_quality_daily to authenticated;

-- Feedback RPC — updates user_rating on an existing quality row.
-- Only the user who owns the row can rate it.
create or replace function public.rate_ai_response(
    p_quality_id uuid,
    p_rating smallint
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_rating not in (-1, 0, 1) then
        raise exception 'rating must be -1, 0, or 1';
    end if;

    update public.ai_response_quality
    set user_rating = p_rating
    where id = p_quality_id and user_id = auth.uid();

    return found;
end;
$$;

grant execute on function public.rate_ai_response(uuid, smallint) to authenticated;

-- ─── ai_conversations RLS fix (plan FAZA 7) ──────────────────────────────
-- The table was created in an earlier migration without a working INSERT
-- policy, so direct client writes fail and the table sits empty. Add the
-- minimal self-owner policies so clients (or the edge function via user JWT)
-- can persist conversation transcripts for replay.
alter table public.ai_conversations enable row level security;

drop policy if exists "ai_conversations self-read" on public.ai_conversations;
create policy "ai_conversations self-read"
    on public.ai_conversations
    for select
    using (auth.uid() = user_id);

drop policy if exists "ai_conversations self-insert" on public.ai_conversations;
create policy "ai_conversations self-insert"
    on public.ai_conversations
    for insert
    with check (auth.uid() = user_id);

drop policy if exists "ai_conversations self-update" on public.ai_conversations;
create policy "ai_conversations self-update"
    on public.ai_conversations
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
