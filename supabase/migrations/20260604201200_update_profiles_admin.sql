-- Alter profiles table to add gender, date of birth, and role
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';

-- Update the handle_new_user function to populate the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, gender, date_of_birth, role)
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    new.raw_user_meta_data->>'gender',
    CASE 
      WHEN new.raw_user_meta_data->>'date_of_birth' IS NOT NULL THEN (new.raw_user_meta_data->>'date_of_birth')::date 
      ELSE NULL 
    END,
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    gender = COALESCE(profiles.gender, EXCLUDED.gender),
    date_of_birth = COALESCE(profiles.date_of_birth, EXCLUDED.date_of_birth);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable admin policies on products table
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (public.is_admin(auth.uid()));
