-- Migration: simplify products table schema
-- Run once in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. Add new columns
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS quantity     INTEGER       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ar_color     TEXT,
  ADD COLUMN IF NOT EXISTS en_color     TEXT,
  ADD COLUMN IF NOT EXISTS review_avg   NUMERIC(3,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER       DEFAULT 0;

-- 2. Ensure price columns are numeric (they may have been stored as text)
ALTER TABLE products
  ALTER COLUMN ar_price TYPE NUMERIC USING (
    REGEXP_REPLACE(
      REGEXP_REPLACE(ar_price::TEXT, '[٠-٩]',
        CHR(48 + (ASCII(SUBSTRING(ar_price::TEXT, 1, 1)) - 1632)), 'g'),
      '[^0-9.]', '', 'g')::NUMERIC
  ),
  ALTER COLUMN en_price TYPE NUMERIC USING (
    REGEXP_REPLACE(en_price::TEXT, '[^0-9.]', '', 'g')::NUMERIC
  );

-- 3. Drop removed columns
ALTER TABLE products
  DROP COLUMN IF EXISTS gender,
  DROP COLUMN IF EXISTS sub_category,
  DROP COLUMN IF EXISTS accent_glow,
  DROP COLUMN IF EXISTS accent_color,
  DROP COLUMN IF EXISTS ar_collection,
  DROP COLUMN IF EXISTS en_collection,
  DROP COLUMN IF EXISTS ar_short_desc,
  DROP COLUMN IF EXISTS en_short_desc,
  DROP COLUMN IF EXISTS ar_spec_left,
  DROP COLUMN IF EXISTS ar_spec_right,
  DROP COLUMN IF EXISTS ar_mood,
  DROP COLUMN IF EXISTS en_spec_left,
  DROP COLUMN IF EXISTS en_spec_right,
  DROP COLUMN IF EXISTS en_mood,
  DROP COLUMN IF EXISTS ar_alt,
  DROP COLUMN IF EXISTS en_alt,
  DROP COLUMN IF EXISTS s1l,
  DROP COLUMN IF EXISTS s2l,
  DROP COLUMN IF EXISTS ar_s1,
  DROP COLUMN IF EXISTS en_s1,
  DROP COLUMN IF EXISTS ar_s2,
  DROP COLUMN IF EXISTS en_s2;
