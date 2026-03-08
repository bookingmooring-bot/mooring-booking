# SQL View / RPC Alternative

Use this approach **only if** the provider has many bookings (hundreds+) and client-side aggregation is slow.

## Option A — PostgreSQL View

```sql
-- Migration name: provider_earnings_view
CREATE OR REPLACE VIEW provider_earnings_by_mooring AS
SELECT
  b.provider_id,
  b.mooring_id,
  m.name                                        AS mooring_name,
  m.location,
  m.country,
  COUNT(b.id)                                   AS total_bookings,
  SUM(b.nights)                                 AS total_nights,
  SUM(b.total_price)                            AS gross_revenue,
  SUM(b.commission_amount)                      AS total_commission,
  SUM(b.total_price - b.commission_amount)      AS net_earnings,
  ROUND(AVG(b.nights), 1)                       AS avg_nights_per_booking
FROM bookings b
JOIN moorings m ON m.id = b.mooring_id
WHERE b.booking_status != 'cancelled'
GROUP BY b.provider_id, b.mooring_id, m.name, m.location, m.country;
```

Add RLS on the view:
```sql
ALTER VIEW provider_earnings_by_mooring OWNER TO authenticated;

-- The view inherits bookings RLS so providers can only see their own rows.
-- But add a safety check:
CREATE POLICY "provider_earnings_own_rows"
ON provider_earnings_by_mooring FOR SELECT
USING (provider_id = auth.uid());
```

> Note: Supabase views don't always support RLS directly. If it doesn't work, use the RPC approach below.

---

## Option B — Supabase RPC Function (Recommended)

RPC functions run with `SECURITY DEFINER` or `SECURITY INVOKER` and support proper RLS.

```sql
-- Migration name: get_provider_earnings_rpc
CREATE OR REPLACE FUNCTION get_provider_earnings(p_provider_id uuid)
RETURNS TABLE (
  mooring_id uuid,
  mooring_name text,
  location text,
  country text,
  total_bookings bigint,
  total_nights bigint,
  gross_revenue numeric,
  total_commission numeric,
  net_earnings numeric,
  avg_nights_per_booking numeric
)
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
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
$$;
```

### Usage in Hook

Replace the client-side aggregation in `useProviderEarnings` with:

```typescript
const { data, error } = await supabase
  .rpc('get_provider_earnings', { p_provider_id: user.id });

if (error) throw new Error(error.message);
// data is already the MooringEarning[] array
```

---

## When to Use RPC vs. Client-Side

| Scenario | Recommendation |
|----------|---------------|
| Provider has < 200 bookings | Client-side (hook) — simpler, no migration |
| Provider has 200–1000 bookings | Client-side is fine, consider RPC if UI feels slow |
| Provider has 1000+ bookings | Use RPC function |
| Need complex date-range filters in SQL | Use RPC |
| Need occupancy joined in same query | Use RPC |

---

## Apply Migration

Use the MCP tool:
```
mcp_supabase-mcp-server_apply_migration(
  project_id: "bblxawscmyzelinidkmb",
  name: "get_provider_earnings_rpc",
  query: <sql above>
)
```
