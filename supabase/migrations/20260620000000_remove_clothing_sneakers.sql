-- Remove clothing/sneakers remnants from the products table.
-- Run in: Supabase Dashboard → SQL Editor → New query

-- 1. Drop colour columns (only used for clothing/sneakers, always NULL for perfumes)
ALTER TABLE public.products
  DROP COLUMN IF EXISTS ar_color,
  DROP COLUMN IF EXISTS en_color;

-- 2. Enforce perfumes-only category
ALTER TABLE public.products
  ADD CONSTRAINT products_category_perfumes_only
  CHECK (category = 'perfumes');
