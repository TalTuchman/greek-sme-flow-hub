
-- Fix permissions for booking validation functions
GRANT EXECUTE ON FUNCTION public.check_booking_conflict(UUID, UUID, TIMESTAMPTZ, UUID) TO authenticator;
GRANT EXECUTE ON FUNCTION public.check_booking_within_working_hours(UUID, TIMESTAMPTZ, UUID) TO authenticator;

-- Create function to check if booking is within business operating hours
CREATE OR REPLACE FUNCTION public.check_booking_within_business_hours(
    p_profile_id UUID,
    p_booking_time TIMESTAMPTZ,
    p_service_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_business_hours JSONB;
    v_service_duration INT;
    v_booking_day TEXT;
    v_day_config JSONB;
    v_day_enabled BOOLEAN;
    v_business_start_time TIME;
    v_business_end_time TIME;
    v_booking_start_time TIME;
    v_booking_end_time TIMESTAMPTZ;
    v_booking_end_time_as_time TIME;
BEGIN
    -- Get business operating hours from profile
    SELECT business_operating_hours INTO v_business_hours 
    FROM public.profiles 
    WHERE id = p_profile_id;

    -- If no business hours are defined, allow booking (business operates 24/7)
    IF v_business_hours IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Get service duration to calculate booking end time
    SELECT duration INTO v_service_duration FROM public.services WHERE id = p_service_id;
    
    -- If service has no duration, we cannot check. Let's be permissive.
    IF v_service_duration IS NULL OR v_service_duration <= 0 THEN
        RETURN TRUE;
    END IF;

    -- Calculate booking end time
    v_booking_end_time := p_booking_time + (v_service_duration * INTERVAL '1 minute');

    -- Get the day of the week (e.g., 'monday')
    v_booking_day := trim(lower(to_char(p_booking_time, 'day')));

    -- Get the configuration for that day from the JSONB
    v_day_config := v_business_hours -> v_booking_day;
    
    -- If no config for the day, it's a non-operating day
    IF v_day_config IS NULL OR v_day_config = 'null'::jsonb THEN
        RETURN FALSE;
    END IF;

    -- Check if the day is enabled for business
    v_day_enabled := (v_day_config ->> 'enabled')::BOOLEAN;
    IF v_day_enabled IS NULL OR v_day_enabled = FALSE THEN
        RETURN FALSE;
    END IF;
    
    -- Get business hours for the day
    v_business_start_time := (v_day_config ->> 'start')::TIME;
    v_business_end_time := (v_day_config ->> 'end')::TIME;
    
    -- If start or end times are missing, cannot validate
    IF v_business_start_time IS NULL OR v_business_end_time IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Get time parts of booking start and end
    v_booking_start_time := p_booking_time::TIME;
    v_booking_end_time_as_time := v_booking_end_time::TIME;

    -- Handle bookings that span across midnight
    IF date(p_booking_time) <> date(v_booking_end_time) AND v_booking_end_time_as_time <> '00:00:00' THEN
        RETURN FALSE;
    END IF;

    -- A booking ending at '00:00:00' is considered to be at the very end of the previous day
    IF v_booking_end_time_as_time = '00:00:00' THEN
      RETURN v_booking_start_time >= v_business_start_time AND (v_business_end_time = '00:00:00' OR v_business_end_time = '23:59:59');
    END IF;

    -- Check if the booking time is within the business hours
    IF v_booking_start_time >= v_business_start_time AND v_booking_end_time_as_time <= v_business_end_time THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticator
GRANT EXECUTE ON FUNCTION public.check_booking_within_business_hours(UUID, TIMESTAMPTZ, UUID) TO authenticator;

-- Update the validation trigger function to include business hours check
CREATE OR REPLACE FUNCTION public.validate_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check for conflicts if the booking is 'scheduled'
    IF NEW.status = 'scheduled' THEN
        -- Check for overlapping bookings with other scheduled bookings
        IF public.check_booking_conflict(NEW.id, NEW.staff_id, NEW.booking_time, NEW.service_id) THEN
            RAISE EXCEPTION 'booking_conflict';
        END IF;

        -- Check if the booking is within the staff member's working hours
        IF NOT public.check_booking_within_working_hours(NEW.staff_id, NEW.booking_time, NEW.service_id) THEN
            RAISE EXCEPTION 'booking_outside_working_hours';
        END IF;

        -- Check if the booking is within the business operating hours
        IF NOT public.check_booking_within_business_hours(NEW.profile_id, NEW.booking_time, NEW.service_id) THEN
            RAISE EXCEPTION 'booking_outside_business_hours';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add logging function for debugging booking validation
CREATE OR REPLACE FUNCTION public.log_booking_validation(
    p_booking_id UUID,
    p_staff_id UUID,
    p_profile_id UUID,
    p_booking_time TIMESTAMPTZ,
    p_service_id UUID,
    p_message TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Log validation details for debugging
    RAISE LOG 'Booking validation - ID: %, Staff: %, Profile: %, Time: %, Service: %, Message: %', 
        p_booking_id, p_staff_id, p_profile_id, p_booking_time, p_service_id, p_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_booking_validation(UUID, UUID, UUID, TIMESTAMPTZ, UUID, TEXT) TO authenticator;
