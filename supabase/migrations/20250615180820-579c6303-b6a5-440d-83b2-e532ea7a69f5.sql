
-- Drop redundant RLS policies for the 'customers' table
DROP POLICY IF EXISTS "Business owners can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Business owners can insert their own customers" ON public.customers;
DROP POLICY IF EXISTS "Business owners can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Business owners can delete their own customers" ON public.customers;

-- Drop redundant RLS policies for the 'services' table
DROP POLICY IF EXISTS "Business owners can view their own services" ON public.services;
DROP POLICY IF EXISTS "Business owners can insert their own services" ON public.services;
DROP POLICY IF EXISTS "Business owners can update their own services" ON public.services;
DROP POLICY IF EXISTS "Business owners can delete their own services" ON public.services;
