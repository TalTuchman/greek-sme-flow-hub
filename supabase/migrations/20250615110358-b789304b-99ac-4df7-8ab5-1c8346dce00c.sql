
-- Create a table for customers
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Add an index on profile_id for faster lookups
CREATE INDEX ON public.customers (profile_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policy: Business owners can view their own customers.
CREATE POLICY "Business owners can view their own customers"
  ON public.customers
  FOR SELECT
  USING (profile_id = auth.uid());

-- Policy: Business owners can insert their own customers.
CREATE POLICY "Business owners can insert their own customers"
  ON public.customers
  FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Policy: Business owners can update their own customers.
CREATE POLICY "Business owners can update their own customers"
  ON public.customers
  FOR UPDATE
  USING (profile_id = auth.uid());

-- Policy: Business owners can delete their own customers.
CREATE POLICY "Business owners can delete their own customers"
  ON public.customers
  FOR DELETE
  USING (profile_id = auth.uid());
