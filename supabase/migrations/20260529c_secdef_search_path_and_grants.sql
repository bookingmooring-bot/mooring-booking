-- Security hardening E2 (2026-05-29, pass 2)
-- Addresses advisor findings:
--   * "Function Search Path Mutable" (SECURITY DEFINER funcs without a pinned
--     search_path are vulnerable to search_path hijacking)
--   * "Public/Signed-In Can Execute SECURITY DEFINER Function" (reduce the
--     EXECUTE surface to only the roles that actually call each function)
--
-- Caller audit (frontend src/ + supabase/functions/ai-captain + mcp-server):
--   - get_available_moorings / is_admin  -> left public (guest Explore + RLS)
--   - server-only (only the ai-captain edge fn, which uses the SERVICE_ROLE
--     key, or cron calls these): revoke anon+authenticated, keep service_role
--   - client-called user/admin RPCs: revoke anon, keep authenticated (each
--     already scopes by auth.uid() or an inline admin check)

-- 1. Pin search_path on every SECURITY DEFINER function in public that lacks it.
DO $sp$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
      AND (p.proconfig IS NULL
           OR NOT EXISTS (SELECT 1 FROM unnest(p.proconfig) c WHERE c LIKE 'search_path=%'))
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', r.sig);
  END LOOP;
END
$sp$;

-- 2. Server-only functions: revoke from anon+authenticated, grant service_role.
DO $lock$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'check_and_log_ai_call', 'persist_chat_pair', 'get_or_create_conversation',
        'kb_search', 'search_concierge_moorings', 'nearby_active_moorings',
        'enroll_inactive_users_winback'
      )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM public, anon, authenticated', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
  END LOOP;
END
$lock$;

-- 3. Client-called user/admin RPCs: drop anon, keep authenticated.
DO $client$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'admin_get_provider_stats', 'admin_get_all_users', 'admin_get_fb_leads', 'delete_conversation',
        'get_conversation_messages', 'list_conversations', 'get_my_ai_preferences',
        'upsert_my_ai_preferences', 'rate_ai_response', 'publish_provider_profile',
        'increment_ai_questions'
      )
  LOOP
    -- revoke from public too: anon is a member of PUBLIC, so revoking only
    -- "anon" leaves the implicit PUBLIC grant in place and anon keeps access.
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM public, anon', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', r.sig);
  END LOOP;
END
$client$;
