ALTER TABLE public.department ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role ENABLE ROW LEVEL SECURITY;


-- *** USER POLICIES ***
CREATE POLICY "Allow authorized delete access" 
  ON auth.users
  FOR DELETE
  TO authenticated 
  using ( 
    (SELECT authorize('user.delete')) 
  );
  
CREATE POLICY "Allow authorized select access" 
  ON auth.users 
  FOR SELECT
  TO authenticated 
  using ( 
    (SELECT authorize('user.get')) 
  );

CREATE POLICY "Allow authorized update access" 
  ON auth.users
  FOR UPDATE
  TO authenticated 
  using ( 
    (SELECT authorize('user.update')) 
  );

CREATE POLICY "Allow authorized insert access" 
  ON auth.users
  FOR INSERT
  TO authenticated 
  with check ( 
    (SELECT authorize('user.create')) 
  );



-- *** DEPARTMENT POLICIES ***
CREATE POLICY "Allow authorized delete access" 
  ON public.department 
  FOR DELETE
  TO authenticated 
  using ( 
    (SELECT authorize('department.delete')) 
  );

CREATE POLICY "Allow authorized select access" 
  ON public.department 
  FOR SELECT
  TO authenticated 
  using ( 
    (SELECT authorize('department.get')) 
  );

CREATE POLICY "Allow authorized update access" 
  ON public.department 
  FOR UPDATE
  TO authenticated 
  using ( 
    (SELECT authorize('department.update')) 
  );

CREATE POLICY "Allow authorized insert access" 
  ON public.department 
  FOR INSERT
  TO authenticated 
  with check ( 
    (SELECT authorize('department.create')) 
  );



-- *** ROLE PERMISSIONS POLICIES ***
CREATE POLICY "Allow authorized delete access" 
  ON public.role_permissions 
  FOR DELETE
  TO authenticated 
  using ( 
    (SELECT authorize('role.permission.delete')) 
  );

CREATE POLICY "Allow authorized select access" 
  ON public.role_permissions 
  FOR SELECT
  TO authenticated 
  using ( 
    (SELECT authorize('role.permission.get')) 
  );

CREATE POLICY "Allow authorized update access" 
  ON public.role_permissions 
  FOR UPDATE
  TO authenticated 
  using ( 
    (SELECT authorize('role.permission.update')) 
  );

CREATE POLICY "Allow authorized insert access" 
  ON public.role_permissions 
  FOR INSERT
  TO authenticated 
  with check ( 
    (SELECT authorize('role.permission.create')) 
  );



-- *** ROLE POLICIES ***
CREATE POLICY "Allow authorized delete access" 
  ON public.role 
  FOR DELETE
  TO authenticated 
  using ( 
    (SELECT authorize('role.delete')) 
  );

CREATE POLICY "Allow authorized select access" 
  ON public.role 
  FOR SELECT
  TO authenticated 
  using ( 
    (SELECT authorize('role.get')) 
  );

CREATE POLICY "Allow authorized update access" 
  ON public.role 
  FOR UPDATE
  TO authenticated 
  using ( 
    (SELECT authorize('role.update')) 
  );

CREATE POLICY "Allow authorized insert access" 
  ON public.role 
  FOR INSERT
  TO authenticated 
  with check ( 
    (SELECT authorize('role.create')) 
  );


-- *** RLS ROW LIMIT EXAMPLE ***
-- CREATE POLICY "Allow authorized select access" 
--   ON public.role_permissions 
--   FOR SELECT
--   TO authenticated 
--   using ( 
--         (SELECT authorize('role.permission.get')) -- check user has permission
--     AND (role_id = ( -- get all permissions for user role
--           SELECT u.role_access_id
--             FROM auth.users u
--             WHERE u.id = 
--               (SELECT (auth.jwt() ->> 'user_id')::uuid AS uuid) -- get role id by user id
--           )
--         )
--   );
