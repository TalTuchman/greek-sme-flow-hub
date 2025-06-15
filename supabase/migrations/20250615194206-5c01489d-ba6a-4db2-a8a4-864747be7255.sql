
-- Function to check if a booking is within a staff member's working hours.
-- It returns TRUE if the booking is valid, otherwise FALSE.
-- This function is SECURITY DEFINER to bypass RLS for data access.
CREATE OR REPLACE FUNCTION public.check_booking_within_working_hours(
    p_staff_id UUID,
    p_booking_time TIMESTAMPTZ,
    p_service_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_working_hours JSONB;
    v_service_duration INT;
    v_booking_day TEXT;
    v_day_config JSONB;
    v_day_enabled BOOLEAN;
    v_work_start_time TIME;
    v_work_end_time TIME;
    v_booking_start_time TIME;
    v_booking_end_time TIMESTAMPTZ;
    v_booking_end_time_as_time TIME;
BEGIN
    -- If no staff member is assigned, we can't check working hours.
    -- Consider this valid.
    IF p_staff_id IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Get staff member's working hours.
    SELECT working_hours INTO v_working_hours FROM public.staff_members WHERE id = p_staff_id;

    -- If no working hours are defined for the staff, they can be booked anytime.
    IF v_working_hours IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Get service duration to calculate booking end time.
    SELECT duration INTO v_service_duration FROM public.services WHERE id = p_service_id;
    
    -- If service has no duration, we cannot check. Let's be permissive.
    IF v_service_duration IS NULL OR v_service_duration <= 0 THEN
        RETURN TRUE;
    END IF;

    -- Calculate booking end time.
    v_booking_end_time := p_booking_time + (v_service_duration * INTERVAL '1 minute');

    -- Get the day of the week (e.g., 'monday').
    v_booking_day := trim(lower(to_char(p_booking_time, 'day')));

    -- Get the configuration for that day from the JSONB.
    v_day_config := v_working_hours -> v_booking_day;
    
    -- If no config for the day, it's a non-working day.
    IF v_day_config IS NULL OR v_day_config = 'null'::jsonb THEN
        RETURN FALSE;
    END IF;

    -- Check if the day is enabled for work.
    v_day_enabled := (v_day_config ->> 'enabled')::BOOLEAN;
    IF v_day_enabled IS NULL OR v_day_enabled = FALSE THEN
        RETURN FALSE;
    END IF;
    
    -- Get working hours for the day.
    v_work_start_time := (v_day_config ->> 'start')::TIME;
    v_work_end_time := (v_day_config ->> 'end')::TIME;
    
    -- If start or end times are missing, cannot validate.
    IF v_work_start_time IS NULL OR v_work_end_time IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Get time parts of booking start and end.
    v_booking_start_time := p_booking_time::TIME;
    v_booking_end_time_as_time := v_booking_end_time::TIME;

    -- Handle bookings that span across midnight. This simple model assumes working hours are within a single day.
    -- This check prevents bookings that end on a different day than they start, unless it ends exactly at midnight.
    IF date(p_booking_time) <> date(v_booking_end_time) AND v_booking_end_time_as_time <> '00:00:00' THEN
        RETURN FALSE;
    END IF;

    -- A booking ending at '00:00:00' is considered to be at the very end of the previous day.
    -- If the work end time is '00:00', we treat it as the end of the day.
    IF v_booking_end_time_as_time = '00:00:00' THEN
      RETURN v_booking_start_time >= v_work_start_time AND (v_work_end_time = '00:00:00' OR v_work_end_time = '23:59:59');
    END IF;

    -- Check if the booking time is within the working hours.
    IF v_booking_start_time >= v_work_start_time AND v_booking_end_time_as_time <= v_work_end_time THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Update the trigger function to include the working hours check.
CREATE OR REPLACE FUNCTION public.validate_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check for conflicts if the booking is 'scheduled'.
    IF NEW.status = 'scheduled' THEN
        -- Check for overlapping bookings with other scheduled bookings.
        IF public.check_booking_conflict(NEW.id, NEW.staff_id, NEW.booking_time, NEW.service_id) THEN
            RAISE EXCEPTION 'booking_conflict';
        END IF;

        -- Check if the booking is within the staff member's working hours.
        IF NOT public.check_booking_within_working_hours(NEW.staff_id, NEW.booking_time, NEW.service_id) THEN
            RAISE EXCEPTION 'booking_outside_working_hours';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
