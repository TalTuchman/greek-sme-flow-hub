
-- Add color column to staff_members table
ALTER TABLE public.staff_members 
ADD COLUMN color VARCHAR(7) DEFAULT '#3B82F6';

-- Update existing staff members with different default colors using a simpler approach
WITH staff_with_colors AS (
  SELECT id, 
    CASE (ROW_NUMBER() OVER (ORDER BY created_at) - 1) % 8
      WHEN 0 THEN '#3B82F6' -- blue
      WHEN 1 THEN '#EF4444' -- red
      WHEN 2 THEN '#10B981' -- green
      WHEN 3 THEN '#F59E0B' -- yellow
      WHEN 4 THEN '#8B5CF6' -- purple
      WHEN 5 THEN '#F97316' -- orange
      WHEN 6 THEN '#06B6D4' -- cyan
      WHEN 7 THEN '#84CC16' -- lime
    END as new_color
  FROM public.staff_members
)
UPDATE public.staff_members 
SET color = staff_with_colors.new_color
FROM staff_with_colors
WHERE staff_members.id = staff_with_colors.id;

-- Create manual_campaign_sends table for tracking manual campaign triggers
CREATE TABLE public.manual_campaign_sends (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('single_customer', 'all_customers')),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    send_immediately BOOLEAN NOT NULL DEFAULT true,
    scheduled_send_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    notes TEXT
);

-- Add comments for clarity
COMMENT ON TABLE public.manual_campaign_sends IS 'Tracks manual campaign send requests initiated by business owners.';
COMMENT ON COLUMN public.manual_campaign_sends.target_type IS 'Whether to send to a single customer or all customers.';
COMMENT ON COLUMN public.manual_campaign_sends.send_immediately IS 'Whether to send immediately or schedule for later.';

-- Set up Row Level Security (RLS) for manual_campaign_sends
ALTER TABLE public.manual_campaign_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage their own manual campaign sends"
    ON public.manual_campaign_sends
    FOR ALL
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

-- Add index for better performance
CREATE INDEX idx_manual_campaign_sends_profile_status ON public.manual_campaign_sends(profile_id, status);
CREATE INDEX idx_manual_campaign_sends_scheduled_time ON public.manual_campaign_sends(scheduled_send_time) WHERE send_immediately = false;
