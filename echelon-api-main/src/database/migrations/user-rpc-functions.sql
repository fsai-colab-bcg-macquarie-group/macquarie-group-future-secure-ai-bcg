-- User RPC Functions for the User Repository

-- Function to get user profile data
CREATE OR REPLACE FUNCTION auth_layer.get_user_profile(user_id_param UUID)
RETURNS SETOF JSONB
SECURITY DEFINER
SET search_path = auth_layer
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object(
    'user_id', up.user_id,
    'first_name', up.first_name,
    'last_name', up.last_name,
    'user_case_team_id', up.user_case_team_id,
    'use_case_team_name', d.name,
    'use_case_team', up.use_case_team,
    'access_id', up.access_id
  )
  FROM auth_layer.user_profile up
  LEFT JOIN auth_layer.use_case_team d ON up.user_case_team_id = d.id
  WHERE up.user_id = user_id_param;
END;
$$;

-- Function to get user auth data
CREATE OR REPLACE FUNCTION auth.get_user_auth_data(user_id_param UUID)
RETURNS SETOF JSONB
SECURITY DEFINER
SET search_path = auth
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object(
    'email', u.email,
    'is_sso_user', u.is_sso_user,
    'deleted_at', u.deleted_at,
    'banned_until', u.banned_until,
    'email_confirmed_at', u.email_confirmed_at
  )
  FROM auth.users u
  WHERE u.id = user_id_param;
END;
$$;

-- Function to verify if a non-SSO user exists with the given email
CREATE OR REPLACE FUNCTION auth.verify_email_no_sso(email_param TEXT)
RETURNS SETOF JSONB
SECURITY DEFINER
SET search_path = auth
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object('id', u.id)
  FROM auth.users u
  WHERE u.email = email_param
  AND u.is_sso_user = false;
END;
$$;

-- Function to verify if any user exists with the given email
CREATE OR REPLACE FUNCTION auth.verify_email(email_param TEXT)
RETURNS SETOF JSONB
SECURITY DEFINER
SET search_path = auth
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object('id', u.id)
  FROM auth.users u
  WHERE u.email = email_param;
END;
$$;

-- Function to insert confirmation email for SSO users
CREATE OR REPLACE FUNCTION auth_layer.insert_confirmation_email_sso(
  user_id_param UUID,
  email_expiraded_at_param TIMESTAMPTZ
)
RETURNS SETOF JSONB
SECURITY DEFINER
SET search_path = auth_layer
LANGUAGE plpgsql
AS $$
DECLARE
  inserted_record RECORD;
BEGIN
  INSERT INTO auth_layer.confirmation_email_sso (user_id, email_expiraded_at)
  VALUES (user_id_param, email_expiraded_at_param)
  RETURNING id, email_expiraded_at INTO inserted_record;
  
  RETURN QUERY
  SELECT jsonb_build_object(
    'id', inserted_record.id,
    'email_expiraded_at', inserted_record.email_expiraded_at
  );
END;
$$;

-- Function to insert user profile data
CREATE OR REPLACE FUNCTION auth_layer.insert_user_profile(
  user_id_param UUID,
  first_name_param TEXT,
  last_name_param TEXT,
  user_case_team_id_param UUID,
  access_id_param UUID
)
RETURNS VOID
SECURITY DEFINER
SET search_path = auth_layer
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO auth_layer.user_profile (
    user_id,
    first_name,
    last_name,
    user_case_team_id,
    access_id
  )
  VALUES (
    user_id_param,
    first_name_param,
    last_name_param,
    user_case_team_id_param,
    access_id_param
  );
END;
$$;

-- Function to delete a user by email
CREATE OR REPLACE FUNCTION auth.delete_user_by_email(email_param TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = auth
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM auth.users
  WHERE email = email_param;
END;
$$;

-- Function to update a user
CREATE OR REPLACE FUNCTION auth.update_user(
  user_id_param UUID,
  user_data JSONB
)
RETURNS SETOF JSONB
SECURITY DEFINER
SET search_path = auth
LANGUAGE plpgsql
AS $$
DECLARE
  updated_record RECORD;
BEGIN
  UPDATE auth.users
  SET 
    email = COALESCE(user_data->>'email', email),
    is_sso_user = COALESCE((user_data->>'is_sso_user')::boolean, is_sso_user),
    banned_until = COALESCE((user_data->>'banned_until')::timestamptz, banned_until),
    deleted_at = COALESCE((user_data->>'deleted_at')::timestamptz, deleted_at)
  WHERE id = user_id_param
  RETURNING id, email INTO updated_record;
  
  RETURN QUERY
  SELECT jsonb_build_object(
    'id', updated_record.id,
    'email', updated_record.email
  );
END;
$$; 