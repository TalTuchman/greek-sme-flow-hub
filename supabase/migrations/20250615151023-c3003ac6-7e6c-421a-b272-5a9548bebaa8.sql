
-- Enable RLS and add policies for the 'services' table
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own services"
  ON public.services
  FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Enable RLS and add policies for the 'customers' table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own customers"
  ON public.customers
  FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Create an ENUM type for booking statuses
CREATE TYPE public.booking_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- Create the bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  booking_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Add comments to columns
COMMENT ON COLUMN public.bookings.status IS 'The status of the booking: scheduled, completed, or cancelled';

-- Add RLS policies for the 'bookings' table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bookings"
  ON public.bookings
  FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);
