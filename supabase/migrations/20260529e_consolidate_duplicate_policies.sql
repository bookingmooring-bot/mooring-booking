-- Performance E3 part 3 (2026-05-29, pass 2)
-- Advisor "Multiple Permissive Policies": when two PERMISSIVE policies cover the
-- same (table, command, role), Postgres evaluates BOTH per row and OR's them.
-- Collapsing them into one policy (OR of the predicates) is semantically
-- identical and cheaper. All groups below are TO public.

-- == affiliate_members: three redundant pairs (predicates identical) ==
DROP POLICY IF EXISTS "Admins can manage all affiliates" ON public.affiliate_members;   -- == affiliate_members_admin_all
DROP POLICY IF EXISTS "Affiliates can read own record"   ON public.affiliate_members;   -- == affiliate_members_self_select
DROP POLICY IF EXISTS "Users can apply to become affiliate" ON public.affiliate_members; -- == affiliate_members_self_insert

-- == ai_conversations: three redundant pairs ==
DROP POLICY IF EXISTS "Users can view own conversations"   ON public.ai_conversations;   -- == ai_conversations self-read
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.ai_conversations;   -- == ai_conversations self-insert
DROP POLICY IF EXISTS "Users can update own conversations" ON public.ai_conversations;   -- subset of ai_conversations self-update

-- == profiles SELECT: "Public profiles readable" USING (true) already subsumes
--    the admin-only policy, so the admin policy is pure redundancy. ==
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- == profiles UPDATE: real OR-merge of admin + self ==
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile"       ON public.profiles;
CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
  FOR UPDATE
  USING (public.is_admin() OR (select auth.uid()) = id)
  WITH CHECK (public.is_admin() OR (select auth.uid()) = id);

-- == provider_onboarding SELECT: real OR-merge of admin + self ==
DROP POLICY IF EXISTS provider_onboarding_admin_read ON public.provider_onboarding;
DROP POLICY IF EXISTS provider_onboarding_own_read   ON public.provider_onboarding;
CREATE POLICY provider_onboarding_select ON public.provider_onboarding
  FOR SELECT
  USING (
    (EXISTS (SELECT 1 FROM public.profiles
             WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'))
    OR ((select auth.uid()) = user_id)
  );
