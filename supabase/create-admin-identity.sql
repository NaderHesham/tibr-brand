INSERT INTO auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '8cde439d-d52c-49a9-98e8-74da827c827b',
  'nadeerysin@gmail.com',
  '8cde439d-d52c-49a9-98e8-74da827c827b',
  '{"sub":"8cde439d-d52c-49a9-98e8-74da827c827b","email":"nadeerysin@gmail.com"}',
  'email',
  now(), now(), now()
);
