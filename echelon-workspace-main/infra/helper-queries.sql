-- ** HELPER QUERIES **

-- Get user department
SELECT
  u.id as user_id,
  u.email,
  d.id as department_id,
  d.name as department_name
  FROM auth.users u
  LEFT JOIN public.department d ON u.department_id = d.id;

-- Get user role
SELECT
  u.id as user_id,
  u.email,
  r.id as role_id,
  r.name as role_name
  FROM auth.users u
  LEFT JOIN public.role r ON u.role_access_id = r.id;

-- Get user permissions
SELECT
  u.id as user_id,
  u.email,
  r.id as role_id,
  r.name as role_name,
  rp.permission
  FROM auth.users u
  LEFT JOIN public.role r ON u.role_access_id = r.id
  LEFT JOIN public.role_permissions rp ON r.id = rp.role_id;

-- Get role permissions
SELECT
  r.id as role_id,
  r.name as role_name,
  rp.permission
  FROM public.role r
  LEFT JOIN public.role_permissions rp ON r.id = rp.role_id;

-- RLS row limit example
CREATE POLICY "Allow authorized select access" 
  ON public.role_permissions 
  FOR SELECT
  TO authenticated 
  using ( 
        (SELECT authorize('role.permission.get')) -- check user has permission
    AND (role_id = ( -- get all permissions for user role
          SELECT u.role_access_id
            FROM auth.users u
            WHERE u.id = 
              (SELECT (auth.jwt() ->> 'user_id')::uuid AS uuid) -- get role id by user id
          )
        )
  );