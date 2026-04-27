-- Atomic persistence for AI Captain user+assistant message pair.
-- Replaces the edge function's two separate REST round-trips (ensureConversationId
-- + insert ai_chat_messages) which were failing silently. SECURITY DEFINER so
-- service_role can call it; trigger on ai_chat_messages handles title and counters.

create or replace function public.persist_chat_pair(
    p_user_id uuid,
    p_conversation_id uuid,
    p_user_content text,
    p_assistant_content text,
    p_intent text,
    p_confidence numeric,
    p_assistant_metadata jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_conv_id uuid;
begin
    if p_user_id is null then
        raise exception 'persist_chat_pair: user id required';
    end if;

    if p_conversation_id is not null then
        select id into v_conv_id
        from public.ai_conversations
        where id = p_conversation_id and user_id = p_user_id;

        if v_conv_id is null then
            insert into public.ai_conversations (id, user_id)
            values (p_conversation_id, p_user_id)
            on conflict (id) do nothing
            returning id into v_conv_id;
        end if;
    end if;

    if v_conv_id is null then
        insert into public.ai_conversations (user_id)
        values (p_user_id)
        returning id into v_conv_id;
    end if;

    insert into public.ai_chat_messages
        (conversation_id, user_id, role, content, metadata)
    values
        (v_conv_id, p_user_id, 'user', p_user_content, '{}'::jsonb);

    insert into public.ai_chat_messages
        (conversation_id, user_id, role, content, intent, confidence, metadata)
    values
        (v_conv_id, p_user_id, 'assistant',
         p_assistant_content,
         nullif(p_intent, ''),
         p_confidence,
         coalesce(p_assistant_metadata, '{}'::jsonb));

    return v_conv_id;
end;
$$;

grant execute on function public.persist_chat_pair(uuid, uuid, text, text, text, numeric, jsonb)
    to service_role;
