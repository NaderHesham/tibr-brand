-- Allow users to insert their own profile row
-- (Needed for upsert from server-side API when trigger hasn't run yet)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
