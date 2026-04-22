-- FAZA 6 — Intent-aware rate limiting for AI Captain
-- Replaces the profiles.ai_questions_used counter with a dedicated table that
-- supports:
--   - Monthly rolling windows (one row per user per month)
--   - Atomic check-and-increment (no TOCTOU race between two concurrent calls)
--   - EMERGENCY bypass (distress calls always go through, still logged)
--   - Premium tier bypass (unlimited, still logged for analytics)
-- The old profiles.ai_questions_used stays in place for 1 release cycle to
-- keep the old paywall UI working until the frontend migrates to the
-- `remaining` field in the edge-function response.

create table if not exists public.ai_rate_limits (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    window_start timestamptz not null,
    count integer not null default 0,
    last_intent text,
    emergency_count integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, window_start)
);

create index if not exists idx_ai_rate_limits_user_window
    on public.ai_rate_limits (user_id, window_start desc);

alter table public.ai_rate_limits enable row level security;

-- Users can read their own rows (for dashboard / "X questions left" UI).
drop policy if exists "ai_rate_limits self-read" on public.ai_rate_limits;
create policy "ai_rate_limits self-read"
    on public.ai_rate_limits
    for select
    using (auth.uid() = user_id);

-- No client writes. All mutations go through the RPC below (security definer).
-- Service role inside the edge function bypasses RLS anyway.

create or replace function public.touch_ai_rate_limits()
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

drop trigger if exists trg_touch_ai_rate_limits on public.ai_rate_limits;
create trigger trg_touch_ai_rate_limits
    before update on public.ai_rate_limits
    for each row
    execute function public.touch_ai_rate_limits();

-- Atomic check-and-log RPC. The edge function calls this once per Gemini call
-- with the resolved intent. Returns the allow/deny decision plus metadata for
-- the frontend paywall UI.
--
-- Monthly budget for basic users: AI_BASIC_LIMIT_MONTHLY.
-- EMERGENCY intent (MAYDAY, SOS, sinking, man overboard) ALWAYS bypasses the
-- quota — safety is non-negotiable.
create or replace function public.check_and_log_ai_call(
    p_user_id uuid,
    p_intent text,
    p_is_premium boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_window_start timestamptz := date_trunc('month', now());
    v_window_end   timestamptz := (date_trunc('month', now()) + interval '1 month');
    v_max_count    integer := 10;   -- basic tier monthly budget
    v_count        integer;
    v_is_emergency boolean := (p_intent = 'EMERGENCY');
begin
    -- Ensure row exists for this month
    insert into public.ai_rate_limits (user_id, window_start, count, last_intent)
    values (p_user_id, v_window_start, 0, p_intent)
    on conflict (user_id, window_start) do nothing;

    -- EMERGENCY: bypass quota entirely, bump the emergency counter separately,
    -- don't consume from the monthly budget.
    if v_is_emergency then
        update public.ai_rate_limits
        set emergency_count = emergency_count + 1,
            last_intent = p_intent
        where user_id = p_user_id and window_start = v_window_start;

        select count into v_count from public.ai_rate_limits
        where user_id = p_user_id and window_start = v_window_start;

        return jsonb_build_object(
            'allowed',   true,
            'remaining', case when p_is_premium then -1 else greatest(v_max_count - coalesce(v_count, 0), 0) end,
            'reset_at',  v_window_end,
            'reason',    'emergency_bypass'
        );
    end if;

    -- Premium: unlimited, still log
    if p_is_premium then
        update public.ai_rate_limits
        set count = count + 1,
            last_intent = p_intent
        where user_id = p_user_id and window_start = v_window_start
        returning count into v_count;

        return jsonb_build_object(
            'allowed',   true,
            'remaining', -1,
            'reset_at',  v_window_end,
            'reason',    'premium_unlimited'
        );
    end if;

    -- Basic tier: atomic "increment only if under limit"
    update public.ai_rate_limits
    set count = count + 1,
        last_intent = p_intent
    where user_id = p_user_id
      and window_start = v_window_start
      and count < v_max_count
    returning count into v_count;

    if v_count is not null then
        return jsonb_build_object(
            'allowed',   true,
            'remaining', v_max_count - v_count,
            'reset_at',  v_window_end,
            'reason',    'ok'
        );
    end if;

    -- Over quota — read current count for the reply, don't increment
    select count into v_count from public.ai_rate_limits
    where user_id = p_user_id and window_start = v_window_start;

    return jsonb_build_object(
        'allowed',   false,
        'remaining', 0,
        'reset_at',  v_window_end,
        'reason',    'quota_exceeded',
        'used',      coalesce(v_count, v_max_count)
    );
end;
$$;

grant execute on function public.check_and_log_ai_call(uuid, text, boolean) to authenticated, service_role;
