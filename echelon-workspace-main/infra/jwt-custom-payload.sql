create or replace function public.jwt_custom_payload(event jsonb)
returns jsonb
language plpgsql
stable
as $$
  declare
    claims jsonb;
    user_role_id uuid;
  begin
    -- Fetch the user role in the user_roles table
    select role_access_id into user_role_id from auth.users where id = (event->>'user_id')::uuid;

    claims := event->'claims';

    if user_role_id is not null then
      -- Set the claim
      claims := jsonb_set(claims, '{user_role_id}', to_jsonb(user_role_id));
    else
      claims := jsonb_set(claims, '{user_role_id}', 'null');
    end if;

    claims := jsonb_set(claims, '{user_id}', to_jsonb(event->>'user_id'));

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified or original event
    return event;
  end;
$$;

grant usage on schema public to supabase_auth_admin;

grant execute
  on function public.jwt_custom_payload
  to supabase_auth_admin;

revoke execute
  on function public.jwt_custom_payload
  from authenticated, anon, public;