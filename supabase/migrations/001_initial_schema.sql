-- =============================================================
-- Pillway — Initial Database Schema
-- Run this in the Supabase SQL Editor (project dashboard → SQL Editor)
-- =============================================================


-- -------------------------------------------------------------
-- PROFILES
-- Mirrors auth.users so application code can JOIN on a public
-- table without touching the protected auth schema.
-- A trigger (added at the bottom) auto-populates this table
-- whenever a user signs up via Supabase Auth.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  email      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security so users can only touch their own profile.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: each user may read their own profile row.
CREATE POLICY "profiles: users can select own row"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: each user may update their own profile row.
CREATE POLICY "profiles: users can update own row"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);


-- -------------------------------------------------------------
-- PHARMACIES
-- Stores pharmacy locations sourced from the Google Places API.
-- Deduplicated by place_id so the same pharmacy is never inserted
-- twice even if multiple users select it.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pharmacies (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT        NOT NULL,
  formatted_address TEXT        NOT NULL,
  lat               DOUBLE PRECISION NOT NULL,
  lng               DOUBLE PRECISION NOT NULL,
  place_id          TEXT        UNIQUE NOT NULL,  -- Google Places place_id for upsert deduplication
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;

-- Policy: any authenticated user may browse pharmacies.
CREATE POLICY "pharmacies: authenticated users can select"
  ON public.pharmacies
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: only the service_role (backend) may insert or update pharmacy rows.
-- The Express backend uses the service_role key, so this policy is never
-- triggered by browser code.
CREATE POLICY "pharmacies: service_role can insert"
  ON public.pharmacies
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "pharmacies: service_role can update"
  ON public.pharmacies
  FOR UPDATE
  TO service_role
  USING (true);


-- -------------------------------------------------------------
-- BOOKINGS
-- Records each prescription transfer / service request made by
-- a user.  Linked to both a profile and a pharmacy.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pharmacy_id          UUID        NOT NULL REFERENCES public.pharmacies(id),
  service_type         TEXT        NOT NULL,
  additional_services  TEXT[],                -- PostgreSQL native array; e.g. {'Blister Pack','Delivery'}
  prescription_notes   TEXT,
  status               TEXT        NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: users may only read their own bookings.
CREATE POLICY "bookings: users can select own rows"
  ON public.bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users may only insert bookings where they are the owner.
-- The backend sets user_id to the authenticated caller's UUID.
CREATE POLICY "bookings: users can insert own rows"
  ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- =============================================================
-- TRIGGER: auto-create a profiles row on new user sign-up
-- This mirrors the auth.users record into public.profiles so
-- application code never needs to query the protected auth schema.
-- =============================================================
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
  ON CONFLICT (id) DO NOTHING;  -- idempotent: safe to re-run migrations
  RETURN NEW;
END;
$$;

-- Attach the trigger to auth.users so it fires after every INSERT
-- (i.e., every new sign-up or admin-created user).
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
