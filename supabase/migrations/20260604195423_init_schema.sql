-- Create products table
CREATE TABLE public.products (
  id text PRIMARY KEY,
  category text NOT NULL,
  sub_category text,
  gender text NOT NULL,
  sizes jsonb,
  image text NOT NULL,
  accent_glow text,
  accent_color text,
  ar_name text NOT NULL,
  ar_collection text,
  ar_short_desc text,
  ar_desc text,
  ar_spec_left text,
  ar_spec_right text,
  ar_price text,
  ar_mood text,
  en_name text NOT NULL,
  en_collection text,
  en_short_desc text,
  en_desc text,
  en_spec_left text,
  en_spec_right text,
  en_price text,
  en_mood text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access for products
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  product_id text REFERENCES public.products(id),
  size text,
  status text DEFAULT 'pending',
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert orders, and view their own orders
CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Create profiles table (Optional, for extending auth users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone_number text,
  address text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
