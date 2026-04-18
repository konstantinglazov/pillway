-- =============================================================
-- Pillway — Security Layer (RLS policies + auth trigger)
-- Run this in the Supabase SQL Editor AFTER prisma db push has
-- created the tables.  Safe to re-run (uses IF NOT EXISTS /
-- CREATE OR REPLACE throughout).
-- =============================================================

-- -------------------------------------------------------------
-- Enable Row Level Security on all three tables
-- (prisma db push creates tables but does not enable RLS)
-- -------------------------------------------------------------
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings   ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- PROFILES policies
-- -------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles'
    AND policyname = 'profiles: users can select own row'
  ) THEN
    CREATE POLICY "profiles: users can select own row"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles'
    AND policyname = 'profiles: users can update own row'
  ) THEN
    CREATE POLICY "profiles: users can update own row"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

-- -------------------------------------------------------------
-- PHARMACIES policies
-- -------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pharmacies'
    AND policyname = 'pharmacies: authenticated users can select'
  ) THEN
    CREATE POLICY "pharmacies: authenticated users can select"
      ON public.pharmacies FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pharmacies'
    AND policyname = 'pharmacies: service_role can insert'
  ) THEN
    CREATE POLICY "pharmacies: service_role can insert"
      ON public.pharmacies FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pharmacies'
    AND policyname = 'pharmacies: service_role can update'
  ) THEN
    CREATE POLICY "pharmacies: service_role can update"
      ON public.pharmacies FOR UPDATE
      TO service_role
      USING (true);
  END IF;
END $$;

-- -------------------------------------------------------------
-- BOOKINGS policies
-- -------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings'
    AND policyname = 'bookings: users can select own rows'
  ) THEN
    CREATE POLICY "bookings: users can select own rows"
      ON public.bookings FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings'
    AND policyname = 'bookings: users can insert own rows'
  ) THEN
    CREATE POLICY "bookings: users can insert own rows"
      ON public.bookings FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- -------------------------------------------------------------
-- AUTH TRIGGER
-- Auto-creates a public.profiles row whenever a user signs up
-- via Supabase Auth.  Without this, booking inserts fail with a
-- FK violation because user_id references profiles.id.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger so this file is idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
