-- [C1] Fix IDOR: Enforce vessel ownership on bookings INSERT
-- Attacker could set vessel_id to another user's vessel in bulk booking.
-- Drop the old permissive INSERT policy and replace with ownership check.

DROP POLICY IF EXISTS "Auth users create bookings" ON public.bookings;

CREATE POLICY "Auth users create own bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      vessel_id IS NULL
      OR vessel_id IN (
        SELECT id FROM public.user_vessel_profiles WHERE user_id = auth.uid()
      )
    )
  );
