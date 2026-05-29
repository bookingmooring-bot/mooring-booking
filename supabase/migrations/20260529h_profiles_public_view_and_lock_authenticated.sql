-- Security fix (2026-05-29, pass 2): stop authenticated users from reading
-- every other user's email/phone/PII on public.profiles.
--
-- Audit of all cross-user profile reads (frontend src/):
--   - provider contact (provider pages, booking emails, mooring owner)  -> role='provider'
--   - admin tooling (useAdmin, useAffiliateAdmin)                       -> is_admin()
--   - own profile (useProfile, settings)                               -> auth.uid()=id
--   - review author NAME on mooring pages (useReviews, shown to anyone) -> the ONLY
--     cross-user read of a non-provider (guest) profile. It needs only full_name.
--
-- So we lock authenticated reads to self + providers + admin, and serve review
-- author names through a minimal public projection that exposes NO PII.

-- Public projection: name + avatar only. Intentionally a (security-definer) view
-- so it can resolve any user's display name for reviews while the base table read
-- is locked down. Exposes zero sensitive columns.
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT id, full_name, avatar_url FROM public.profiles;

-- A simple view is auto-updatable and (being security-definer) its writes run as
-- the owner, bypassing RLS. Default privileges grant anon/authenticated write, so
-- strip everything and grant read only — otherwise anon could mutate profiles
-- through the view.
REVOKE ALL ON public.public_profiles FROM anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Lock base profiles authenticated SELECT: own row OR provider (public contact)
-- OR admin. anon stays provider-only (set in 20260529f/g).
DROP POLICY IF EXISTS "profiles_authenticated_read" ON public.profiles;
CREATE POLICY "profiles_authenticated_read" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = id
    OR role = 'provider'
    OR (select public.is_admin())
  );
