INSERT INTO public.department (name)
VALUES 
    ('Admin Group'),
    ('Marketing Team'),
    ('HR Team');

-- Insert new roles
INSERT INTO public.role (name)
VALUES
    ('Super Admin'),
    ('Admin'),
    ('Developer'),
    ('Human Manager');

-- Assign permissions to roles
INSERT INTO public.role_permissions (role_id, permission)
VALUES  
    ((SELECT id FROM public.role WHERE name = 'Human Manager'), 'worker.update'),
    ((SELECT id FROM public.role WHERE name = 'Human Manager'), 'worker.knowledge_base.update');
