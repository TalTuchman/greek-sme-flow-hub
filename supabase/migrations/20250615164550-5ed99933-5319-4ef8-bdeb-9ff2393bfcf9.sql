
-- Create the staff_members table
CREATE TABLE public.staff_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  working_hours JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  CONSTRAINT staff_members_profile_id_email_key UNIQUE (profile_id, email)
);

-- Add comments for clarity
COMMENT ON TABLE public.staff_members IS 'Stores information about staff members for a business.';
COMMENT ON COLUMN public.staff_members.working_hours IS 'JSON object defining working hours, e.g., {"monday": {"start": "09:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]}}.';

-- Set up Row Level Security (RLS) for staff_members
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage their own staff"
  ON public.staff_members
  FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Create the staff_services linking table
CREATE TABLE public.staff_services (
  staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- Add comments for clarity
COMMENT ON TABLE public.staff_services IS 'Links staff members to the services they can provide.';

-- Set up Row Level Security (RLS) for staff_services
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can link staff to their own services"
  ON public.staff_services
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.id = staff_id AND sm.profile_id = auth.uid()
    ) AND EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.profile_id = auth.uid()
    )
  );

-- Add staff_id to bookings table
ALTER TABLE public.bookings
ADD COLUMN staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.bookings.staff_id IS 'The staff member assigned to this booking.';

