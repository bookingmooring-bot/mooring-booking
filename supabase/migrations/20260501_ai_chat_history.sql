-- AI Captain chat history — per-user conversation persistence
-- Authenticated users only. Anonymous chats remain ephemeral.

-- ── ai_conversations ─────────────────────────────────────────────────────────
-- The table already exists from an earlier migration (RLS was patched in
-- 20260431). Ensure the columns we rely on are present.
create table if not exists public.ai_conversations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

alter table public.ai_conversations
    add column if not exists title text,
    add column if not exists last_message_at timestamptz not null default now(),
    add column if not exists archived boolean not null default false,
    add column if not exists message_count integer not null default 0;

create index if not exists idx_ai_conversations_user_recent
    on public.ai_conversations (user_id, last_message_at desc)
    where archived = false;

-- ── ai_chat_messages ─────────────────────────────────────────────────────────
create table if not exists public.ai_chat_messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    intent text,
    confidence numeric(4,3),
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_ai_chat_messages_conv_time
    on public.ai_chat_messages (conversation_id, created_at);
create index if not exists idx_ai_chat_messages_user_time
    on public.ai_chat_messages (user_id, created_at desc);

alter table public.ai_chat_messages enable row level security;

drop policy if exists "ai_chat_messages self-read" on public.ai_chat_messages;
create policy "ai_chat_messages self-read"
    on public.ai_chat_messages
    for select
    using (auth.uid() = user_id);

drop policy if exists "ai_chat_messages self-insert" on public.ai_chat_messages;
create policy "ai_chat_messages self-insert"
    on public.ai_chat_messages
    for insert
    with check (auth.uid() = user_id);

drop policy if exists "ai_chat_messages self-delete" on public.ai_chat_messages;
create policy "ai_chat_messages self-delete"
    on public.ai_chat_messages
    for delete
    using (auth.uid() = user_id);

-- ── Trigger: keep conversation in sync with messages ────────────────────────
create or replace function public.ai_chat_messages_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_title text;
begin
    if tg_op = 'INSERT' then
        if new.role = 'user' then
            v_title := trim(substring(new.content from 1 for 60));
            update public.ai_conversations
            set last_message_at = new.created_at,
                message_count   = message_count + 1,
                title           = coalesce(nullif(title, ''), v_title)
            where id = new.conversation_id;
        else
            update public.ai_conversations
            set last_message_at = new.created_at,
                message_count   = message_count + 1
            where id = new.conversation_id;
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists ai_chat_messages_after_insert on public.ai_chat_messages;
create trigger ai_chat_messages_after_insert
    after insert on public.ai_chat_messages
    for each row
    execute function public.ai_chat_messages_after_insert();

-- ── RPC: get_or_create_conversation ─────────────────────────────────────────
-- Idempotent. Client passes a UUID it generated (or null for fresh).
-- Returns the conversation id it should use.
create or replace function public.get_or_create_conversation(
    p_conversation_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user uuid := auth.uid();
    v_id uuid;
begin
    if v_user is null then
        raise exception 'not authenticated';
    end if;

    if p_conversation_id is not null then
        select id into v_id
        from public.ai_conversations
        where id = p_conversation_id and user_id = v_user;

        if v_id is not null then
            return v_id;
        end if;

        insert into public.ai_conversations (id, user_id)
        values (p_conversation_id, v_user)
        on conflict (id) do nothing
        returning id into v_id;

        if v_id is not null then
            return v_id;
        end if;
    end if;

    insert into public.ai_conversations (user_id)
    values (v_user)
    returning id into v_id;

    return v_id;
end;
$$;

grant execute on function public.get_or_create_conversation(uuid) to authenticated;

-- ── RPC: list_conversations ──────────────────────────────────────────────────
create or replace function public.list_conversations(
    p_limit integer default 30
)
returns table (
    id uuid,
    title text,
    last_message_at timestamptz,
    message_count integer,
    created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
    select id, title, last_message_at, message_count, created_at
    from public.ai_conversations
    where user_id = auth.uid()
      and archived = false
    order by last_message_at desc
    limit greatest(1, least(p_limit, 200));
$$;

grant execute on function public.list_conversations(integer) to authenticated;

-- ── RPC: get_conversation_messages ──────────────────────────────────────────
create or replace function public.get_conversation_messages(
    p_conversation_id uuid
)
returns table (
    id uuid,
    role text,
    content text,
    intent text,
    confidence numeric,
    metadata jsonb,
    created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
    select m.id, m.role, m.content, m.intent, m.confidence, m.metadata, m.created_at
    from public.ai_chat_messages m
    join public.ai_conversations c on c.id = m.conversation_id
    where m.conversation_id = p_conversation_id
      and c.user_id = auth.uid()
    order by m.created_at asc;
$$;

grant execute on function public.get_conversation_messages(uuid) to authenticated;

-- ── RPC: delete_conversation ────────────────────────────────────────────────
create or replace function public.delete_conversation(
    p_conversation_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_deleted integer;
begin
    delete from public.ai_conversations
    where id = p_conversation_id and user_id = auth.uid();
    get diagnostics v_deleted = row_count;
    return v_deleted > 0;
end;
$$;

grant execute on function public.delete_conversation(uuid) to authenticated;
