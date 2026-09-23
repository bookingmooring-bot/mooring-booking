-- Guard profiles.role against client-side changes.
--
-- Bug (2026-09-23): publishing a mooring ran `role = 'provider'` (client update in
-- useProviderForm + publish_provider_profile RPC) and silently demoted an admin.
-- The same open column also let any signed-in user set their own role to 'admin'.
--
-- Rule: from a user JWT the only allowed change is 'user' -> 'provider' on your own
-- row; an admin may change other people's roles; service_role / SQL console (no JWT)
-- may do anything. Any other attempt keeps the old role instead of failing, so the
-- existing client updates (phone, address…) still go through.

create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_jwt_role text := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '');
  v_uid uuid := auth.uid();
begin
  -- service_role or direct SQL (no JWT) → trusted
  if v_jwt_role = 'service_role' or v_jwt_role = '' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.role is null or new.role not in ('user', 'provider') then
      new.role := 'user';
    end if;
    return new;
  end if;

  if new.role is not distinct from old.role then
    return new;
  end if;

  -- admin editing someone else's profile
  if v_uid is not null and v_uid <> old.id and public.is_admin() then
    return new;
  end if;

  -- self-service upgrade user → provider
  if v_uid = old.id and old.role = 'user' and new.role = 'provider' then
    return new;
  end if;

  new.role := old.role;
  return new;
end;
$$;

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role
  before insert or update of role on public.profiles
  for each row execute function public.guard_profile_role();
