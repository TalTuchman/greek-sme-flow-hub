
-- CLEANUP: Drop all existing RLS policies to prevent conflicts.
-- We will recreate them with consistent naming and logic.

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile." ON public.profiles;

-- Customers
DROP POLICY IF EXISTS "Users can manage their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can manage their own customers." ON public.customers;
DROP POLICY IF EXISTS "Business owners can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Business owners can insert their own customers" ON public.customers;
DROP POLICY IF EXISTS "Business owners can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Business owners can delete their own customers" ON public.customers;

-- Services
DROP POLICY IF EXISTS "Users can manage their own services" ON public.services;
DROP POLICY IF EXISTS "Users can manage their own services." ON public.services;
DROP POLICY IF EXISTS "Business owners can view their own services" ON public.services;
DROP POLICY IF EXISTS "Business owners can insert their own services" ON public.services;
DROP POLICY IF EXISTS "Business owners can update their own services" ON public.services;
DROP POLICY IF EXISTS "Business owners can delete their own services" ON public.services;

-- Staff Members
DROP POLICY IF EXISTS "Business owners can manage their own staff" ON public.staff_members;
DROP POLICY IF EXISTS "Users can manage their own staff members." ON public.staff_members;

-- Bookings
DROP POLICY IF EXISTS "Users can manage their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can manage their own bookings." ON public.bookings;

-- Campaigns
DROP POLICY IF EXISTS "Users can manage their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can manage their own campaigns." ON public.campaigns;

-- Staff Services
DROP POLICY IF EXISTS "Business owners can link staff to their own services" ON public.staff_services;
DROP POLICY IF EXISTS "Users can manage their staff services." ON public.staff_services;
DROP POLICY IF EXISTS "Users can view staff_services for their staff." ON public.staff_services;
DROP POLICY IF EXISTS "Users can insert staff_services for their staff and services." ON public.staff_services;
DROP POLICY IF EXISTS "Users can delete staff_services for their staff." ON public.staff_services;

-- RE-IMPLEMENTATION: Create a unified set of RLS policies.

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile." ON public.profiles
  FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- CUSTOMERS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own customers." ON public.customers
  FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- SERVICES
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own services." ON public.services
  FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- STAFF_MEMBERS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own staff members." ON public.staff_members
  FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- BOOKINGS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own bookings." ON public.bookings
  FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- CAMPAIGNS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own campaigns." ON public.campaigns
  FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- STAFF_SERVICES
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their staff services." ON public.staff_services
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.id = staff_services.staff_id AND sm.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.id = staff_services.staff_id AND sm.profile_id = auth.uid()
    ) AND EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = staff_services.service_id AND s.profile_id = auth.uid()
    )
  );
