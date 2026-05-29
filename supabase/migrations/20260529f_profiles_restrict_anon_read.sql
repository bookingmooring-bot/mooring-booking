-- Security fix (2026-05-29, pass 2): restrict anonymous reads of profiles.
--
-- Finding: "Public profiles readable" used USING (true) for role public, and
-- anon holds table SELECT, so an unauthenticated visitor could read EVERY
-- user's email / phone / stripe_account_id / stripe_customer_id via PostgREST
-- (GET /rest/v1/profiles?select=email,phone). profiles holds PII for all users,
-- the vast majority of whom are guests/customers, not providers.
--
-- Public provider pages (/:slug -> ProviderProfile, anon-accessible) legitimately
-- show a provider's full_name/phone/email, so anon must still read PROVIDER rows.
-- Fix: anon may read only role='provider' rows; authenticated keeps full read
-- (unchanged, to avoid breaking logged-in flows that read other users' profiles,
-- e.g. a provider viewing a guest's booking).
--
-- RESIDUAL (intentionally NOT done here):
--  * A provider row's stripe_account_id is still anon-readable. True column-level
--    hiding needs revoking the table-wide SELECT and re-granting each allowed
--    column (a column-only REVOKE is a no-op while the table grant stands), which
--    is fragile; the frontend already selects explicit non-stripe columns
--    (useProviderBySlug). Low severity: it is a Stripe Connect account id, not a key.
--  * Tightening the authenticated read to self + provider + admin + needed joins
--    needs per-flow testing (booking guest details, review author names).

-- Replace the single public USING(true) SELECT policy with role-split policies.
DROP POLICY IF EXISTS "Public profiles readable" ON public.profiles;

CREATE POLICY "profiles_anon_provider_read" ON public.profiles
  FOR SELECT TO anon
  USING (role = 'provider');

CREATE POLICY "profiles_authenticated_read" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);
