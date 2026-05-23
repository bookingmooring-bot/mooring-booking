import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const N8N_API_KEY = Deno.env.get('N8N_API_KEY') || '';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function error(msg: string, status = 400) {
  return json({ error: msg }, status);
}

// Auth: requires N8N_API_KEY in x-api-key header OR service role key in Authorization
function authenticate(req: Request): boolean {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey && N8N_API_KEY && apiKey === N8N_API_KEY) return true;

  const auth = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (auth === Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) return true;

  return false;
}

// ─── Tool Handlers ───────────────────────────────────────────

async function searchMoorings(params: Record<string, unknown>) {
  let query = supabase
    .from('moorings')
    .select('id, name, location, country, lat, lng, price_per_night, max_boat_length, amenities, contact_email, contact_phone, rating, review_count, image_urls')
    .eq('mooring_layer', 'concierge')
    .eq('status', 'active');

  if (params.country) query = query.ilike('country', `%${params.country}%`);
  if (params.location) {
    query = query.or(
      `name.ilike.%${params.location}%,location.ilike.%${params.location}%,country.ilike.%${params.location}%`
    );
  }
  if (params.minBoatLength) query = query.gte('max_boat_length', params.minBoatLength);
  if (params.maxPricePerNight) query = query.lte('price_per_night', params.maxPricePerNight);
  query = query.limit(Number(params.limit) || 10);

  const { data: moorings, error: err } = await query;
  if (err) throw new Error(err.message);

  if (!moorings?.length) return { moorings: [], count: 0 };

  // Filter by date availability
  if (params.checkIn && params.checkOut) {
    const ids = moorings.map((m: { id: string }) => m.id);

    const { data: conflicting } = await supabase
      .from('bookings')
      .select('mooring_id')
      .in('mooring_id', ids)
      .neq('booking_status', 'cancelled')
      .lt('check_in', params.checkOut as string)
      .gt('check_out', params.checkIn as string);

    const conflictIds = new Set((conflicting || []).map((b: { mooring_id: string }) => b.mooring_id));

    const { data: blocked } = await supabase
      .from('mooring_availability')
      .select('mooring_id')
      .in('mooring_id', ids)
      .gte('date', params.checkIn as string)
      .lt('date', params.checkOut as string)
      .eq('available', false);

    const blockedIds = new Set((blocked || []).map((a: { mooring_id: string }) => a.mooring_id));

    const available = moorings.filter((m: { id: string }) => !conflictIds.has(m.id) && !blockedIds.has(m.id));
    return { moorings: available, count: available.length };
  }

  return { moorings, count: moorings.length };
}

async function getMooringDetails(params: Record<string, unknown>) {
  if (!params.mooringId) throw new Error('mooringId required');

  const { data, error: err } = await supabase
    .from('moorings')
    .select('*')
    .eq('id', params.mooringId)
    .single();

  if (err || !data) throw new Error(`Mooring not found: ${params.mooringId}`);
  return data;
}

async function createConciergeRequest(params: Record<string, unknown>) {
  if (!params.mooringId || !params.userId || !params.checkIn || !params.checkOut || !params.guestName || !params.guestEmail) {
    throw new Error('Required: mooringId, userId, checkIn, checkOut, guestName, guestEmail');
  }

  // Validate user exists
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', params.userId)
    .single();

  if (profileErr || !profile) throw new Error(`User not found: ${params.userId}`);

  // Calculate service fee if not provided
  let serviceFeeAmount = params.serviceFeeAmount as number;
  if (!serviceFeeAmount) {
    const { data: mooring } = await supabase
      .from('moorings')
      .select('price_per_night')
      .eq('id', params.mooringId)
      .single();

    const nights = Math.ceil(
      (new Date(params.checkOut as string).getTime() - new Date(params.checkIn as string).getTime()) /
      (1000 * 60 * 60 * 24)
    );
    serviceFeeAmount = (mooring?.price_per_night || 50) * nights;
  }

  // Call existing edge function
  const resp = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/create-concierge-authorization`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        userId: params.userId,
        mooringId: params.mooringId,
        serviceFeeAmount,
        bookingData: {
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          guestName: params.guestName,
          guestEmail: params.guestEmail,
          guestPhone: params.guestPhone || null,
          boatName: params.boatName || null,
          boatLength: params.boatLength || null,
          specialRequests: params.specialRequests || null,
        },
      }),
    }
  );

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(err.error || resp.statusText);
  }

  const result = await resp.json();
  return {
    bookingId: result.bookingId,
    authorizationId: result.authorizationId,
    expiresAt: result.expiresAt,
  };
}

async function checkBookingStatus(params: Record<string, unknown>) {
  if (!params.bookingId) throw new Error('bookingId required');

  const { data, error: err } = await supabase
    .from('bookings')
    .select('id, concierge_status, concierge_expires_at, booking_status, payment_status, booking_type, created_at, mooring_id, guest_name, guest_email, quoted_price, guest_response_expires_at')
    .eq('id', params.bookingId)
    .in('booking_type', ['concierge', 'now4today'])
    .single();

  if (err || !data) throw new Error(`Booking not found: ${params.bookingId}`);

  const isExpired = data.concierge_expires_at
    ? new Date(data.concierge_expires_at) < new Date()
    : false;

  return {
    ...data,
    isExpired,
    isPending: data.concierge_status === 'pending_marina' && !isExpired,
    isResolved: ['confirmed', 'declined', 'expired'].includes(data.concierge_status),
  };
}

async function listConciergeBookings(params: Record<string, unknown>) {
  let query = supabase
    .from('bookings')
    .select('id, mooring_id, user_id, guest_name, guest_email, check_in, check_out, concierge_status, booking_status, payment_status, concierge_expires_at, special_requests, created_at, quoted_price, guest_response_expires_at, booking_type, moorings(name, location, country, contact_email)')
    .in('booking_type', ['concierge', 'now4today'])
    .order('created_at', { ascending: false });

  if (params.conciergeStatus) query = query.eq('concierge_status', params.conciergeStatus as string);
  if (params.userId) query = query.eq('user_id', params.userId as string);
  if (params.mooringId) query = query.eq('mooring_id', params.mooringId as string);
  if (params.createdAfter) query = query.gte('created_at', params.createdAfter as string);
  if (params.createdBefore) query = query.lte('created_at', params.createdBefore as string);

  query = query.limit(Number(params.limit) || 20);

  const { data, error: err } = await query;
  if (err) throw new Error(err.message);

  return { bookings: data || [], count: (data || []).length };
}

async function cancelConciergeRequest(params: Record<string, unknown>) {
  if (!params.bookingId) throw new Error('bookingId required');

  // Verify still pending
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('id, concierge_status, booking_type')
    .eq('id', params.bookingId)
    .in('booking_type', ['concierge', 'now4today'])
    .single();

  if (fetchErr || !booking) throw new Error(`Booking not found: ${params.bookingId}`);
  if (booking.concierge_status !== 'pending_marina') {
    throw new Error(`Already resolved: ${booking.concierge_status}`);
  }

  const resp = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/concierge-respond`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ bookingId: params.bookingId, action: 'decline' }),
    }
  );

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(err.error || resp.statusText);
  }

  return { bookingId: params.bookingId, status: 'cancelled' };
}

async function getBookingHistory(params: Record<string, unknown>) {
  if (!params.userId && !params.guestEmail) {
    throw new Error('Either userId or guestEmail required');
  }

  let query = supabase
    .from('bookings')
    .select('id, mooring_id, check_in, check_out, booking_type, booking_status, payment_status, concierge_status, total_price, guest_name, guest_email, created_at, moorings(name, location, country)')
    .order('created_at', { ascending: false })
    .limit(Number(params.limit) || 20);

  if (params.userId) query = query.eq('user_id', params.userId as string);
  else if (params.guestEmail) query = query.eq('guest_email', params.guestEmail as string);

  const { data, error: err } = await query;
  if (err) throw new Error(err.message);

  return { bookings: data || [], count: (data || []).length };
}

async function submitProviderQuote(params: Record<string, unknown>) {
  if (!params.bookingId) throw new Error('bookingId required');
  if (!params.price && params.action !== 'decline') throw new Error('price required (or action: "decline")');

  const resp = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/provider-quote-respond`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        bookingId: params.bookingId,
        price: params.price ? Number(params.price) : undefined,
        action: params.action || 'quote',
      }),
    }
  );

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(err.error || resp.statusText);
  }

  const result = await resp.json();
  return {
    bookingId: params.bookingId,
    action: params.action || 'quote',
    quotedPrice: params.price || null,
    ...result,
  };
}

// ─── Router ──────────────────────────────────────────────────

const HANDLERS: Record<string, (p: Record<string, unknown>) => Promise<unknown>> = {
  search_moorings: searchMoorings,
  get_mooring_details: getMooringDetails,
  create_concierge_request: createConciergeRequest,
  check_booking_status: checkBookingStatus,
  list_concierge_bookings: listConciergeBookings,
  cancel_concierge_request: cancelConciergeRequest,
  get_booking_history: getBookingHistory,
  submit_provider_quote: submitProviderQuote,
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-api-key, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') return error('POST only', 405);
  if (!authenticate(req)) return error('Unauthorized', 401);

  try {
    const { action, params } = await req.json();

    if (!action || !HANDLERS[action]) {
      return json({
        error: `Unknown action: ${action}`,
        available_actions: Object.keys(HANDLERS),
      }, 400);
    }

    const result = await HANDLERS[action](params || {});
    return json({ success: true, action, data: result });
  } catch (err) {
    console.error('n8n-concierge-api error:', err);
    return json({ success: false, error: String(err) }, 500);
  }
});
