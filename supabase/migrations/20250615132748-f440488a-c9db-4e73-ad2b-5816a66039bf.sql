
-- Create a table for services
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2),
  duration INTEGER, -- duration in minutes
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Add an index on profile_id for faster lookups
CREATE INDEX ON public.services (profile_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policy: Business owners can view their own services.
CREATE POLICY "Business owners can view their own services"
  ON public.services
  FOR SELECT
  USING (profile_id = auth.uid());

-- Policy: Business owners can insert their own services.
CREATE POLICY "Business owners can insert their own services"
  ON public.services
  FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Policy: Business owners can update their own services.
CREATE POLICY "Business owners can update their own services"
  ON public.services
  FOR UPDATE
  USING (profile_id = auth.uid());

-- Policy: Business owners can delete their own services.
CREATE POLICY "Business owners can delete their own services"
  ON public.services
  FOR DELETE
  USING (profile_id = auth.uid());
