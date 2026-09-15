-- Snimak ŽIVE baze bblxawscmyzelinidkmb (15.09.2026): objekti koji postoje na serveru, a nisu bili ni u jednoj migraciji repoa.
-- Idempotentno: CREATE OR REPLACE / DROP TRIGGER IF EXISTS / cron.schedule (upsert po imenu). Ako se primeni na server, ne menja ništa.

-- ===== FUNKCIJE (21) =====

-- enroll_provider_onboarding
CREATE OR REPLACE FUNCTION public.enroll_provider_onboarding()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  provider_email TEXT;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Only when status changes from pending to active (admin approval)
  IF OLD.status = 'pending' AND NEW.status = 'active' AND NEW.owner_id IS NOT NULL THEN
    SELECT email INTO provider_email FROM profiles WHERE id = NEW.owner_id;

    IF provider_email IS NOT NULL THEN
      INSERT INTO email_sequences (user_id, email, sequence_type, step, scheduled_for, status)
      VALUES
        (NEW.owner_id, provider_email, 'provider_onboarding', 1, today_date + 1,        'pending'),
        (NEW.owner_id, provider_email, 'provider_onboarding', 2, today_date + 5,        'pending'),
        (NEW.owner_id, provider_email, 'provider_onboarding', 3, today_date + 14,       'pending')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;

-- get_provider_earnings
CREATE OR REPLACE FUNCTION public.get_provider_earnings(p_provider_id uuid)
 RETURNS TABLE(mooring_id uuid, mooring_name text, location text, country text, total_bookings bigint, total_nights bigint, gross_revenue numeric, total_commission numeric, net_earnings numeric, avg_nights_per_booking numeric)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT
    b.mooring_id,
    m.name,
    m.location,
    m.country,
    COUNT(b.id),
    SUM(b.nights),
    SUM(b.total_price),
    SUM(b.commission_amount),
    SUM(b.total_price - b.commission_amount),
    ROUND(AVG(b.nights), 1)
  FROM bookings b
  JOIN moorings m ON m.id = b.mooring_id
  WHERE b.provider_id = p_provider_id
    AND b.booking_status != 'cancelled'
  GROUP BY b.mooring_id, m.name, m.location, m.country
  ORDER BY SUM(b.total_price - b.commission_amount) DESC;
$function$
;

-- get_provider_spending
CREATE OR REPLACE FUNCTION public.get_provider_spending(p_provider_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total_spent        numeric;
  v_monthly_recurring  numeric;
  v_yearly_recurring   numeric;
  v_by_addon           jsonb;
  v_by_mooring         jsonb;
  v_recent_costs       jsonb;
  v_now4today_surcharge numeric;
BEGIN
  -- Total spent (all records)
  SELECT COALESCE(SUM(amount), 0)
    INTO v_total_spent
    FROM provider_addon_costs
   WHERE provider_id = p_provider_id;

  -- Monthly recurring: sum of currently active monthly add-ons
  -- "currently active" = mooring still has the flag set to true
  SELECT COALESCE(SUM(pac.amount), 0)
    INTO v_monthly_recurring
    FROM provider_addon_costs pac
    JOIN moorings m ON m.id = pac.mooring_id
   WHERE pac.provider_id = p_provider_id
     AND pac.billing_cycle = 'monthly'
     AND (
       (pac.addon_type = 'marketing_tools'  AND m.marketing_tools = true)  OR
       (pac.addon_type = 'premium_listing'  AND m.is_premium_listing = true)
     );

  -- Yearly recurring: currently active yearly add-ons
  SELECT COALESCE(SUM(pac.amount), 0)
    INTO v_yearly_recurring
    FROM provider_addon_costs pac
    JOIN moorings m ON m.id = pac.mooring_id
   WHERE pac.provider_id = p_provider_id
     AND pac.billing_cycle = 'yearly'
     AND pac.addon_type = 'insurance'
     AND m.insurance_mediation = true;

  -- Now4Today surcharge cost (20% of gross booking revenue from now4today bookings)
  SELECT COALESCE(SUM(b.total_price * 0.20), 0)
    INTO v_now4today_surcharge
    FROM bookings b
    JOIN moorings m ON m.id = b.mooring_id
   WHERE b.provider_id = p_provider_id
     AND b.booking_status != 'cancelled'
     AND m.is_now4today = true;

  -- Breakdown by addon_type
  SELECT jsonb_agg(row_to_json(a))
    INTO v_by_addon
    FROM (
      SELECT
        addon_type,
        COUNT(*) AS activation_count,
        SUM(amount) AS total_amount,
        billing_cycle
      FROM provider_addon_costs
      WHERE provider_id = p_provider_id
      GROUP BY addon_type, billing_cycle
      ORDER BY total_amount DESC
    ) a;

  -- Breakdown by mooring
  SELECT jsonb_agg(row_to_json(b))
    INTO v_by_mooring
    FROM (
      SELECT
        pac.mooring_id,
        m.name AS mooring_name,
        m.location,
        COUNT(pac.id) AS addon_count,
        SUM(pac.amount) AS total_cost
      FROM provider_addon_costs pac
      JOIN moorings m ON m.id = pac.mooring_id
      WHERE pac.provider_id = p_provider_id
      GROUP BY pac.mooring_id, m.name, m.location
      ORDER BY total_cost DESC
    ) b;

  -- Recent 20 cost records
  SELECT jsonb_agg(row_to_json(c))
    INTO v_recent_costs
    FROM (
      SELECT
        pac.id,
        pac.addon_type,
        pac.amount,
        pac.billing_cycle,
        pac.activated_at,
        pac.notes,
        m.name AS mooring_name,
        m.location
      FROM provider_addon_costs pac
      JOIN moorings m ON m.id = pac.mooring_id
      WHERE pac.provider_id = p_provider_id
      ORDER BY pac.activated_at DESC
      LIMIT 20
    ) c;

  RETURN jsonb_build_object(
    'total_spent',           v_total_spent,
    'monthly_recurring',     v_monthly_recurring,
    'yearly_recurring',      v_yearly_recurring,
    'now4today_surcharge',   v_now4today_surcharge,
    'twelve_month_projection', (v_monthly_recurring * 12) + v_yearly_recurring,
    'by_addon',              COALESCE(v_by_addon, '[]'::jsonb),
    'by_mooring',            COALESCE(v_by_mooring, '[]'::jsonb),
    'recent_costs',          COALESCE(v_recent_costs, '[]'::jsonb)
  );
END;
$function$
;

-- handle_mooring_addon_activated
CREATE OR REPLACE FUNCTION public.handle_mooring_addon_activated()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Marketing Tools: false → true
  IF (OLD.marketing_tools = false OR OLD.marketing_tools IS NULL)
     AND NEW.marketing_tools = true THEN
    INSERT INTO provider_addon_costs(provider_id, mooring_id, addon_type, amount, billing_cycle, notes)
    VALUES (NEW.owner_id, NEW.id, 'marketing_tools', 5.00, 'monthly', 'Auto: Marketing Tools activated');
  END IF;

  -- Premium Listing: false → true
  IF (OLD.is_premium_listing = false OR OLD.is_premium_listing IS NULL)
     AND NEW.is_premium_listing = true THEN
    INSERT INTO provider_addon_costs(provider_id, mooring_id, addon_type, amount, billing_cycle, notes)
    VALUES (NEW.owner_id, NEW.id, 'premium_listing', 9.99, 'monthly', 'Auto: Premium Listing activated');
  END IF;

  -- Insurance: false → true
  IF (OLD.insurance_mediation = false OR OLD.insurance_mediation IS NULL)
     AND NEW.insurance_mediation = true THEN
    INSERT INTO provider_addon_costs(provider_id, mooring_id, addon_type, amount, billing_cycle, notes)
    VALUES (NEW.owner_id, NEW.id, 'insurance', 9.99, 'yearly', 'Auto: Mooring Insurance activated');
  END IF;

  -- Now4Today: false → true
  IF (OLD.is_now4today = false OR OLD.is_now4today IS NULL)
     AND NEW.is_now4today = true THEN
    INSERT INTO provider_addon_costs(provider_id, mooring_id, addon_type, amount, billing_cycle, notes)
    VALUES (NEW.owner_id, NEW.id, 'now4today', 0.00, 'per_booking', 'Auto: Now4Today feature activated');
  END IF;

  RETURN NEW;
END;
$function$
;

-- handle_mooring_status_email
CREATE OR REPLACE FUNCTION public.handle_mooring_status_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  provider_profile RECORD;
  payload JSONB;
BEGIN
  -- Check if status actually changed
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  -- Only trigger for approved or rejected
  IF NEW.status != 'approved' AND NEW.status != 'rejected' THEN
    RETURN NEW;
  END IF;

  -- Get provider details
  SELECT * INTO provider_profile FROM public.profiles WHERE id = NEW.provider_id;
  
  payload := jsonb_build_object(
    'mooring', row_to_json(NEW),
    'provider', row_to_json(provider_profile)
  );

  PERFORM net.http_post(
    url := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-mooring-status',
    body := payload
  );
  
  RETURN NEW;
END;
$function$
;

-- handle_new_booking
CREATE OR REPLACE FUNCTION public.handle_new_booking()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.commission_amount := NEW.total_price * NEW.commission_rate;
  NEW.confirmation_code := 'MB-' || upper(substring(md5(random()::text) from 1 for 8));
  NEW.provider_id := (SELECT owner_id FROM public.moorings WHERE id = NEW.mooring_id);
  RETURN NEW;
END;
$function$
;

-- handle_new_booking_emails
CREATE OR REPLACE FUNCTION public.handle_new_booking_emails()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  mooring_record RECORD;
  provider_profile RECORD;
  payload JSONB;
BEGIN
  -- Get mooring details
  SELECT * INTO mooring_record FROM public.moorings WHERE id = NEW.mooring_id;
  
  -- Get provider profile details (moorings table uses owner_id, not provider_id)
  SELECT * INTO provider_profile FROM public.profiles WHERE id = mooring_record.owner_id;
  
  -- Build the JSON payload to send to Edge Function
  payload := jsonb_build_object(
    'booking', row_to_json(NEW),
    'mooring', row_to_json(mooring_record),
    'provider', row_to_json(provider_profile),
    'guest_email', NEW.guest_email,
    'guest_name', NEW.guest_name
  );

  PERFORM net.http_post(
    url := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-booking-emails',
    body := payload
  );
  
  RETURN NEW;
END;
$function$
;

-- handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'source' = 'facebook_lead_ad' THEN 'provider'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$function$
;

-- handle_new_user_lead
CREATE OR REPLACE FUNCTION public.handle_new_user_lead()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create lead if one doesn't exist for this email
  INSERT INTO public.fb_leads (full_name, email, status, has_mooring)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    'registered',
    false
  )
  ON CONFLICT (email) WHERE email IS NOT NULL DO NOTHING;
  
  RETURN NEW;
END;
$function$
;

-- handle_new_user_welcome
CREATE OR REPLACE FUNCTION public.handle_new_user_welcome()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM net.http_post(
    url := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-welcome-email',
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
END;
$function$
;

-- notify_admin_large_booking
CREATE OR REPLACE FUNCTION public.notify_admin_large_booking()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  mooring_name_val TEXT;
BEGIN
  IF NEW.total_price > 500 THEN
    SELECT name INTO mooring_name_val FROM moorings WHERE id = NEW.mooring_id;
    PERFORM net.http_post(
      url     := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body    := jsonb_build_object(
        'alert_type',   'large_booking',
        'booking_id',   NEW.id,
        'mooring_name', COALESCE(mooring_name_val, 'Nepoznat vez'),
        'guest_name',   NEW.guest_name,
        'check_in',     NEW.check_in,
        'check_out',    NEW.check_out,
        'total_price',  NEW.total_price
      )
    );
  END IF;
  RETURN NEW;
END;
$function$
;

-- notify_admin_new_affiliate
CREATE OR REPLACE FUNCTION public.notify_admin_new_affiliate()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'pending' THEN
    PERFORM net.http_post(
      url     := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body    := jsonb_build_object(
        'alert_type',    'new_affiliate',
        'affiliate_id',  NEW.id,
        'user_id',       NEW.user_id::text,
        'referral_code', NEW.referral_code
      )
    );
  END IF;
  RETURN NEW;
END;
$function$
;

-- notify_admin_new_mooring
CREATE OR REPLACE FUNCTION public.notify_admin_new_mooring()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'pending' THEN
    PERFORM net.http_post(
      url     := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body    := jsonb_build_object(
        'alert_type',   'new_provider',
        'mooring_id',   NEW.id,
        'mooring_name', NEW.name,
        'location',     NEW.location,
        'provider_id',  NEW.owner_id
      )
    );
  END IF;
  RETURN NEW;
END;
$function$
;

-- notify_admin_new_user
CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM net.http_post(
    url     := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := jsonb_build_object(
      'alert_type', 'new_user',
      'user_id',    NEW.id::text,
      'user_email', NEW.email,
      'user_name',  COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nepoznato')
    )
  );
  RETURN NEW;
END;
$function$
;

-- notify_booking_status_change
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.booking_status IS DISTINCT FROM OLD.booking_status THEN
    PERFORM net.http_post(
      url := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/on-booking-status-change',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'booking_id',        NEW.id,
        'old_status',        OLD.booking_status,
        'new_status',        NEW.booking_status,
        'guest_email',       NEW.guest_email,
        'guest_name',        NEW.guest_name,
        'check_in',          NEW.check_in,
        'check_out',         NEW.check_out,
        'total_price',       NEW.total_price,
        'confirmation_code', NEW.confirmation_code
      )::jsonb
    );
  END IF;
  RETURN NEW;
END;
$function$
;

-- notify_provider_mooring_approved
CREATE OR REPLACE FUNCTION public.notify_provider_mooring_approved()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'active' THEN
    PERFORM net.http_post(
      url := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-mooring-approved',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'mooring_id', NEW.id::text,
        'mooring_name', NEW.name,
        'location', NEW.location,
        'owner_id', NEW.owner_id::text
      )::jsonb
    );
  END IF;
  RETURN NEW;
END;
$function$
;

-- set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

-- update_fb_leads_updated_at
CREATE OR REPLACE FUNCTION public.update_fb_leads_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

-- update_guest_rating
CREATE OR REPLACE FUNCTION public.update_guest_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles
  SET
    guest_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.user_ratings
      WHERE reviewed_user_id = NEW.reviewed_user_id
    ),
    guest_rating_count = (
      SELECT COUNT(*)
      FROM public.user_ratings
      WHERE reviewed_user_id = NEW.reviewed_user_id
    )
  WHERE id = NEW.reviewed_user_id;
  RETURN NEW;
END;
$function$
;

-- update_mooring_rating
CREATE OR REPLACE FUNCTION public.update_mooring_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.moorings
  SET 
    rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE mooring_id = NEW.mooring_id),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE mooring_id = NEW.mooring_id),
    updated_at = NOW()
  WHERE id = NEW.mooring_id;
  RETURN NEW;
END;
$function$
;

-- update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

-- ===== OKIDAČI (21) =====

DROP TRIGGER IF EXISTS on_affiliate_insert_notify_admin ON public.affiliate_members;
CREATE TRIGGER on_affiliate_insert_notify_admin AFTER INSERT ON public.affiliate_members FOR EACH ROW EXECUTE FUNCTION notify_admin_new_affiliate();

DROP TRIGGER IF EXISTS booking_status_change_trigger ON public.bookings;
CREATE TRIGGER booking_status_change_trigger AFTER UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION notify_booking_status_change();

DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;
CREATE TRIGGER on_booking_created BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION handle_new_booking();

DROP TRIGGER IF EXISTS on_booking_created_emails ON public.bookings;
CREATE TRIGGER on_booking_created_emails AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION handle_new_booking_emails();

DROP TRIGGER IF EXISTS on_large_booking_notify_admin ON public.bookings;
CREATE TRIGGER on_large_booking_notify_admin AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION notify_admin_large_booking();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS fb_leads_updated_at ON public.fb_leads;
CREATE TRIGGER fb_leads_updated_at BEFORE UPDATE ON public.fb_leads FOR EACH ROW EXECUTE FUNCTION update_fb_leads_updated_at();

DROP TRIGGER IF EXISTS on_mooring_approved ON public.moorings;
CREATE TRIGGER on_mooring_approved AFTER UPDATE ON public.moorings FOR EACH ROW EXECUTE FUNCTION notify_provider_mooring_approved();

DROP TRIGGER IF EXISTS on_mooring_approved_enroll_provider ON public.moorings;
CREATE TRIGGER on_mooring_approved_enroll_provider AFTER UPDATE OF status ON public.moorings FOR EACH ROW EXECUTE FUNCTION enroll_provider_onboarding();

DROP TRIGGER IF EXISTS on_mooring_insert_notify_admin ON public.moorings;
CREATE TRIGGER on_mooring_insert_notify_admin AFTER INSERT ON public.moorings FOR EACH ROW EXECUTE FUNCTION notify_admin_new_mooring();

DROP TRIGGER IF EXISTS on_mooring_status_change ON public.moorings;
CREATE TRIGGER on_mooring_status_change AFTER UPDATE ON public.moorings FOR EACH ROW EXECUTE FUNCTION handle_mooring_status_email();

DROP TRIGGER IF EXISTS trg_mooring_addon_activated ON public.moorings;
CREATE TRIGGER trg_mooring_addon_activated AFTER UPDATE ON public.moorings FOR EACH ROW EXECUTE FUNCTION handle_mooring_addon_activated();

DROP TRIGGER IF EXISTS update_moorings_updated_at ON public.moorings;
CREATE TRIGGER update_moorings_updated_at BEFORE UPDATE ON public.moorings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS on_profile_created_welcome ON public.profiles;
CREATE TRIGGER on_profile_created_welcome AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_new_user_welcome();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS provider_onboarding_updated_at ON public.provider_onboarding;
CREATE TRIGGER provider_onboarding_updated_at BEFORE UPDATE ON public.provider_onboarding FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_mooring_rating();

DROP TRIGGER IF EXISTS on_user_rating_inserted ON public.user_ratings;
CREATE TRIGGER on_user_rating_inserted AFTER INSERT ON public.user_ratings FOR EACH ROW EXECUTE FUNCTION update_guest_rating();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_lead ON auth.users;
CREATE TRIGGER on_auth_user_created_lead AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user_lead();

DROP TRIGGER IF EXISTS on_auth_user_created_notify_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_notify_admin AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION notify_admin_new_user();

-- ===== CRON (2) =====

SELECT cron.schedule('job-admin-daily-report', '0 7 * * *', $cron$SELECT net.http_post(
      url     := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body    := '{"alert_type": "daily_report"}'::jsonb
    );$cron$);


SELECT cron.schedule('job-winback-enroll', '0 6 * * 0', $cron$SELECT enroll_inactive_users_winback();$cron$);

