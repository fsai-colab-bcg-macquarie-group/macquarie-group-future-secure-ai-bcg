create or replace function public.authorize(
  requested_permission public.permission
)
returns boolean as $$
declare
  bind_permissions int;
  user_role_id uuid;
begin

  SELECT (auth.jwt() ->> 'user_role_id')::uuid INTO user_role_id;

  IF user_role_id IS NULL THEN
    return false;
  END IF;

  select count(*)
  into bind_permissions
  from public.role_permissions rp
  where rp.permission = requested_permission
    and r.role_id = user_role_id;

  return bind_permissions > 0;
end;
$$ language plpgsql stable security definer set search_path = '';