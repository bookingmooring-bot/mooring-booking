-- Performance E3 (2026-05-29, pass 2)
-- Addresses advisor findings:
--   * "Unindexed foreign keys" (6) — joins/cascades scan the child table
--   * "Auth RLS Initialization Plan" (56) — auth.uid()/auth.role()/auth.jwt()
--     called per-row instead of once; wrap in a scalar subquery so the planner
--     evaluates them a single time (initplan).

-- 1. Foreign-key indexes for hot join/filter columns.
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id        ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_commissions_booking_id      ON public.commissions(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_user_id     ON public.email_sequences(user_id);
CREATE INDEX IF NOT EXISTS idx_fb_leads_user_id            ON public.fb_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_marina_applications_user_id ON public.marina_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id             ON public.reviews(user_id);

-- 2. Wrap unwrapped auth.*() calls in RLS policy expressions.
--    Re-runnable: once wrapped, a policy's text contains "select auth." and is
--    excluded by the filter. The collapse regexp guards against double-wrapping
--    when only one of USING / WITH CHECK was previously unwrapped.
DO $rls$
DECLARE r record;
BEGIN
  FOR r IN
    WITH w AS (
      SELECT schemaname, tablename, policyname, qual, with_check,
        regexp_replace(
          replace(replace(replace(coalesce(qual,''),
            'auth.uid()','(select auth.uid())'),
            'auth.role()','(select auth.role())'),
            'auth.jwt()','(select auth.jwt())'),
          '\(select \(select auth\.(uid|role|jwt)\(\)\)\)','(select auth.\1())','g') AS q2,
        regexp_replace(
          replace(replace(replace(coalesce(with_check,''),
            'auth.uid()','(select auth.uid())'),
            'auth.role()','(select auth.role())'),
            'auth.jwt()','(select auth.jwt())'),
          '\(select \(select auth\.(uid|role|jwt)\(\)\)\)','(select auth.\1())','g') AS c2
      FROM pg_policies
      WHERE schemaname = 'public'
        AND (
          (qual ~ 'auth\.(uid|role|jwt)\(\)' AND qual !~ 'select auth\.')
          OR (with_check ~ 'auth\.(uid|role|jwt)\(\)' AND with_check !~ 'select auth\.')
        )
    )
    SELECT format('ALTER POLICY %I ON %I.%I%s%s;',
      policyname, schemaname, tablename,
      CASE WHEN qual IS NOT NULL THEN ' USING ('||q2||')' ELSE '' END,
      CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK ('||c2||')' ELSE '' END
    ) AS stmt
    FROM w
  LOOP
    EXECUTE r.stmt;
  END LOOP;
END
$rls$;
