-- Security fixes (2026-05-29)
-- 1) admin_get_provider_stats() was GRANTed to authenticated while being
--    SECURITY DEFINER with NO admin check in its body, so any logged-in user
--    could read every provider's email/phone/stripe_account_id/revenue.
--    Add an is_admin() guard inside the function body.
-- 2) email_logs had no RLS. In Supabase a public-schema table without RLS is
--    readable via the anon key, leaking recipient email addresses.

-- 1. Admin RPC: enforce admin role inside the function
CREATE OR REPLACE FUNCTION public.admin_get_provider_stats()
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role text,
  subscription_tier text,
  provider_tier text,
  commission_rate numeric,
  stripe_account_id text,
  stripe_onboarding_complete boolean,
  created_at timestamptz,
  mooring_count bigint,
  total_bookings bigint,
  total_revenue numeric,
  total_commission numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'unauthorized: admin role required';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.email,
    p.phone,
    p.avatar_url,
    p.role,
    p.subscription_tier,
    p.provider_tier,
    p.commission_rate,
    p.stripe_account_id,
    p.stripe_onboarding_complete,
    p.created_at,
    COALESCE(m.cnt, 0) AS mooring_count,
    COALESCE(b.cnt, 0) AS total_bookings,
    COALESCE(b.revenue, 0) AS total_revenue,
    COALESCE(b.commission, 0) AS total_commission
  FROM profiles p
  LEFT JOIN LATERAL (
    SELECT count(*) AS cnt
    FROM moorings
    WHERE moorings.owner_id = p.id
  ) m ON true
  LEFT JOIN LATERAL (
    SELECT
      count(*) AS cnt,
      COALESCE(sum(total_price), 0) AS revenue,
      COALESCE(sum(commission_amount), 0) AS commission
    FROM bookings
    WHERE bookings.provider_id = p.id
      AND bookings.payment_status = 'paid'
  ) b ON true
  WHERE p.role = 'provider'
  ORDER BY p.created_at DESC;
END;
$$;

-- 2. email_logs: enable RLS, admin-only read, service-role writes.
--    Guarded so it is a no-op if the table has not been created yet (the
--    cron migration that creates it may not be applied in every environment).
DO $guard$
BEGIN
  IF to_regclass('public.email_logs') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Admins read email logs" ON public.email_logs';
    EXECUTE 'CREATE POLICY "Admins read email logs" ON public.email_logs FOR SELECT USING (public.is_admin())';
    EXECUTE 'DROP POLICY IF EXISTS "Service role manages email logs" ON public.email_logs';
    EXECUTE 'CREATE POLICY "Service role manages email logs" ON public.email_logs FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')';
  END IF;
END
$guard$;
