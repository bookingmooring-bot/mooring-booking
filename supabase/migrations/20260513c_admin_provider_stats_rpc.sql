-- H5 fix: Replace N+1 client-side query pattern with single server-side aggregation
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
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Only admins can call this function
REVOKE EXECUTE ON FUNCTION public.admin_get_provider_stats() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_provider_stats() TO authenticated;
