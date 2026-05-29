-- Security hardening (2026-05-29, pass 2): real column-level privacy for anon
-- on public.profiles.
--
-- A column-only REVOKE is a no-op while a table-wide SELECT grant stands, so to
-- actually hide columns from anon we drop the table grant and re-grant SELECT on
-- only the non-sensitive columns. Combined with the row policy
-- (profiles_anon_provider_read => anon sees role='provider' rows only), anon can
-- read a provider's public-facing columns but NOT:
--   stripe_account_id, stripe_customer_id  (payment identifiers)
--   last_known_lat, last_known_lng         (provider device location)
--   expo_push_token                        (push token)
-- These are never read by any anon code path. Authenticated keeps full access
-- (unchanged) so logged-in flows and own-profile reads are unaffected.

REVOKE SELECT ON public.profiles FROM anon;

GRANT SELECT (
  id, full_name, email, phone, avatar_url, role,
  subscription_tier, subscription_expires_at, ai_questions_used,
  preferred_language, created_at, updated_at, address, whatsapp,
  provider_consent_at, boat_name, boat_length, guest_rating, guest_rating_count,
  stripe_onboarding_complete, storm_alerts_enabled, storm_wind_threshold_kn,
  storm_wave_threshold_m, provider_tier, white_label_berth_tier,
  white_label_subscription_id, white_label_activated_at, commission_rate,
  provider_slug
) ON public.profiles TO anon;
