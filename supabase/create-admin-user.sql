INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at, is_sso_user, is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '8cde439d-d52c-49a9-98e8-74da827c827b',
  'authenticated',
  'authenticated',
  'nadeerysin@gmail.com',
  crypt('Change@me123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Nader","role":"admin"}',
  false, now(), now(), false, false
);

