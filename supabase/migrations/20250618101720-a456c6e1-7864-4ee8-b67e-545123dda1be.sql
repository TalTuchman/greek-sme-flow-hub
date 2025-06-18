
-- Create table to track sent campaign messages
CREATE TABLE IF NOT EXISTS public.campaign_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_content TEXT NOT NULL,
  communication_method public.communication_method NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  response_token VARCHAR(255) UNIQUE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create table to store client responses
CREATE TABLE IF NOT EXISTS public.message_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_message_id UUID NOT NULL REFERENCES public.campaign_messages(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  response_type TEXT NOT NULL CHECK (response_type IN ('approve', 'cancel', 'modify')),
  responded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  client_ip TEXT,
  user_agent TEXT
);

-- Create table for booking modification requests
CREATE TABLE IF NOT EXISTS public.booking_modification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  message_response_id UUID NOT NULL REFERENCES public.message_responses(id) ON DELETE CASCADE,
  requested_booking_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Add response token to bookings table for secure response handling
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS response_token VARCHAR(255) UNIQUE;

-- Add SMS/Viber configuration to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sms_provider_config JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS viber_config JSONB;

-- Create function to generate secure response tokens using hex encoding
CREATE OR REPLACE FUNCTION public.generate_response_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Create trigger function to automatically generate response tokens for new bookings
CREATE OR REPLACE FUNCTION public.set_booking_response_token()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.response_token IS NULL THEN
    NEW.response_token = public.generate_response_token();
  END IF;
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS booking_response_token_trigger ON public.bookings;

CREATE TRIGGER booking_response_token_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_booking_response_token();

-- Update existing bookings to have response tokens
UPDATE public.bookings SET response_token = public.generate_response_token() WHERE response_token IS NULL;

-- Add RLS policies for campaign_messages
ALTER TABLE public.campaign_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own campaign messages" ON public.campaign_messages;
CREATE POLICY "Users can manage their own campaign messages"
  ON public.campaign_messages
  FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Add RLS policies for message_responses
ALTER TABLE public.message_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view responses to their campaign messages" ON public.message_responses;
CREATE POLICY "Users can view responses to their campaign messages"
  ON public.message_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_messages cm 
      WHERE cm.id = message_responses.campaign_message_id 
      AND cm.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Allow public insert for client responses" ON public.message_responses;
CREATE POLICY "Allow public insert for client responses"
  ON public.message_responses
  FOR INSERT
  WITH CHECK (true);

-- Add RLS policies for booking_modification_requests
ALTER TABLE public.booking_modification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own booking modification requests" ON public.booking_modification_requests;
CREATE POLICY "Users can manage their own booking modification requests"
  ON public.booking_modification_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = booking_modification_requests.original_booking_id 
      AND b.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Allow public insert for modification requests" ON public.booking_modification_requests;
CREATE POLICY "Allow public insert for modification requests"
  ON public.booking_modification_requests
  FOR INSERT
  WITH CHECK (true);
