-- Create the sindico account
-- This script creates the default sindico user with the credentials specified

-- First, we need to insert into auth.users (this would normally be done via Supabase Auth)
-- For now, let's create a profile entry that can be used once the auth user is created

-- Insert sindico profile (will be linked when auth user is created)
INSERT INTO profiles (
  id,
  username,
  full_name,
  user_type,
  phone,
  block,
  apartment
) VALUES (
  gen_random_uuid(),
  'sindica',
  'Patricia - Síndica',
  'sindico',
  NULL,
  NULL,
  NULL
) ON CONFLICT (username) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  user_type = EXCLUDED.user_type;

-- Note: The actual auth user creation needs to be done through the Supabase dashboard
-- or using the signUp function in the app with the credentials:
-- Username: sindica
-- Password: patricia
