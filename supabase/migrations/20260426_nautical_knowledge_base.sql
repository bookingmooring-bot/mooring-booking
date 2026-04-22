-- FAZA 1: RAG knowledge base za AI Kapetana (pgvector + kb_search RPC)
-- Enables pgvector, creates nautical_kb table, GIST/IVFFlat index, RPC.

create extension if not exists vector with schema extensions;

create table if not exists public.nautical_kb (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  content text not null,
  lang text not null default 'hr',
  source_type text not null check (source_type in ('pilot_book','colregs','windy','mayday','diagnostics','platform','anchoring','wind','fuel','electrical','sails','emergency')),
  source_url text,
  embedding extensions.vector(768),
  updated_at timestamptz not null default now()
);

create index if not exists nautical_kb_embedding_ivfflat
  on public.nautical_kb
  using ivfflat (embedding extensions.vector_cosine_ops)
  with (lists = 10);

create index if not exists nautical_kb_topic_idx on public.nautical_kb (topic);
create index if not exists nautical_kb_lang_idx on public.nautical_kb (lang);
create index if not exists nautical_kb_source_type_idx on public.nautical_kb (source_type);

-- RPC: top-k semantic search by cosine similarity
create or replace function public.kb_search(
  query_embedding extensions.vector(768),
  k integer default 5,
  lang_filter text default null
)
returns table (
  id uuid,
  topic text,
  content text,
  lang text,
  source_type text,
  source_url text,
  similarity double precision
)
language sql
stable
security definer
set search_path = public, extensions
as $fn$
  select
    kb.id,
    kb.topic,
    kb.content,
    kb.lang,
    kb.source_type,
    kb.source_url,
    (1 - (kb.embedding <=> query_embedding))::double precision as similarity
  from public.nautical_kb kb
  where kb.embedding is not null
    and (lang_filter is null or kb.lang = lang_filter)
  order by kb.embedding <=> query_embedding
  limit greatest(k, 1);
$fn$;

grant execute on function public.kb_search(extensions.vector, integer, text)
  to anon, authenticated, service_role;

-- RLS: read-only for all; only service_role can write
alter table public.nautical_kb enable row level security;

drop policy if exists "kb_public_read" on public.nautical_kb;
create policy "kb_public_read" on public.nautical_kb
  for select using (true);

-- Service-role writes implicitly bypass RLS.
