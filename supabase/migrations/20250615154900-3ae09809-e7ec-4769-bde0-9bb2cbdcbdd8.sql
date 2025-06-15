
-- Create ENUM type for campaign trigger types
CREATE TYPE public.campaign_trigger_type AS ENUM (
  'specific_datetime',
  'before_booking',
  'after_booking',
  'after_last_booking'
);

-- Create ENUM type for communication methods
CREATE TYPE public.communication_method AS ENUM (
  'sms',
  'viber'
);

-- Create the campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type public.campaign_trigger_type NOT NULL,
  trigger_config JSONB NOT NULL,
  send_time TIME, -- Time of day for relative triggers
  communication_method public.communication_method NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Add comments to columns
COMMENT ON TABLE public.campaigns IS 'Stores communication procedures for marketing campaigns.';
COMMENT ON COLUMN public.campaigns.trigger_config IS 'JSON object with trigger details, e.g., {"days": 3} or {"datetime": "YYYY-MM-DDTHH:mm:ssZ"}.';

-- Add RLS policies for the 'campaigns' table
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own campaigns"
  ON public.campaigns
  FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);
