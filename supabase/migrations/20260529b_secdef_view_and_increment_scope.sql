-- Security fixes E1 (2026-05-29, pass 2)
--
-- NOTE on admin RPCs: a live audit confirmed admin_get_all_users and
-- admin_get_fb_leads already enforce admin access inside the query body
-- (WHERE EXISTS (SELECT 1 FROM profiles adm WHERE adm.id = auth.uid()
-- AND adm.role = 'admin')), so a non-admin gets an empty result, not a leak.
-- They are NOT rewritten here; only their anon EXECUTE grant is dropped in the
-- companion grants migration. Only admin_get_provider_stats was genuinely
-- unguarded and was fixed in 20260529_security_fixes_admin_rpc_email_logs.sql.

-- 1. ai_quality_daily: the view is owned by postgres and ran with definer
--    rights, so any anon/authenticated caller could read aggregates over EVERY
--    user's ai_response_quality rows, bypassing that table's RLS
--    ("self-read OR admin"). Switch to security_invoker so the caller's RLS
--    applies: admins still see everything (admin dashboard keeps working),
--    regular users see only their own rows, anon sees nothing.
ALTER VIEW public.ai_quality_daily SET (security_invoker = on);
REVOKE ALL ON public.ai_quality_daily FROM anon;

-- 2. increment_ai_questions trusted its user_id argument, so any authenticated
--    user could inflate another user's AI question counter (grief them into the
--    paywall). Scope to auth.uid() instead. Signature is kept so the existing
--    client call (useProfile.ts) needs no change; the argument is now ignored.
CREATE OR REPLACE FUNCTION public.increment_ai_questions(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE profiles
  SET ai_questions_used = ai_questions_used + 1,
      updated_at = now()
  WHERE id = auth.uid();
END;
$function$;
