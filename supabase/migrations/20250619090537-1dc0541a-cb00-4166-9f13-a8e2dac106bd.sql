
-- Fix permissions and improve booking validation functions

-- Grant proper permissions for booking validation functions
GRANT EXECUTE ON FUNCTION public.check_booking_conflict(UUID, UUID, TIMESTAMPTZ, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_booking_within_working_hours(UUID, TIMESTAMPTZ, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_booking_within_business_hours(UUID, TIMESTAMPTZ, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_booking_validation(UUID, UUID, UUID, TIMESTAMPTZ, UUID, TEXT) TO authenticated;

-- Improve the working hours validation function with better error handling and logging
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
    -- Log the start of validation
    PERFORM log_booking_validation(
        NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
        'Starting working hours validation'
    );

    -- If no staff member is assigned, we can't check working hours - allow booking
    IF p_staff_id IS NULL THEN
        PERFORM log_booking_validation(
            NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
            'No staff assigned - allowing booking'
        );
        RETURN TRUE;
    END IF;

    -- Get staff member's working hours
    SELECT working_hours INTO v_working_hours FROM public.staff_members WHERE id = p_staff_id;

    -- If no working hours are defined for the staff, they can be booked anytime
    IF v_working_hours IS NULL THEN
        PERFORM log_booking_validation(
            NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
            'No working hours defined - allowing booking'
        );
        RETURN TRUE;
    END IF;

    -- Get service duration to calculate booking end time
    SELECT duration INTO v_service_duration FROM public.services WHERE id = p_service_id;
    
    -- If service has no duration, we cannot check - be permissive
    IF v_service_duration IS NULL OR v_service_duration <= 0 THEN
        PERFORM log_booking_validation(
            NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
            format('Service has no valid duration (%s) - allowing booking', v_service_duration)
        );
        RETURN TRUE;
    END IF;

    -- Calculate booking end time
    v_booking_end_time := p_booking_time + (v_service_duration * INTERVAL '1 minute');

    -- Get the day of the week - normalize to lowercase and trim spaces
    v_booking_day := lower(trim(to_char(p_booking_time, 'day')));

    PERFORM log_booking_validation(
        NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
        format('Checking day: %s, working_hours: %s', v_booking_day, v_working_hours::text)
    );

    -- Get the configuration for that day from the JSONB
    v_day_config := v_working_hours -> v_booking_day;
    
    -- If no config for the day, it's a non-working day
    IF v_day_config IS NULL OR v_day_config = 'null'::jsonb THEN
        PERFORM log_booking_validation(
            NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
            format('No config for day %s - rejecting booking', v_booking_day)
        );
        RETURN FALSE;
    END IF;

    -- Check if the day is enabled for work
    v_day_enabled := (v_day_config ->> 'enabled')::BOOLEAN;
    IF v_day_enabled IS NULL OR v_day_enabled = FALSE THEN
        PERFORM log_booking_validation(
            NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
            format('Day %s is not enabled (%s) - rejecting booking', v_booking_day, v_day_enabled)
        );
        RETURN FALSE;
    END IF;
    
    -- Get working hours for the day
    v_work_start_time := (v_day_config ->> 'start')::TIME;
    v_work_end_time := (v_day_config ->> 'end')::TIME;
    
    -- If start or end times are missing, cannot validate - be permissive
    IF v_work_start_time IS NULL OR v_work_end_time IS NULL THEN
        PERFORM log_booking_validation(
            NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
            format('Missing start/end times (start: %s, end: %s) - allowing booking', v_work_start_time, v_work_end_time)
        );
        RETURN TRUE;
    END IF;

    -- Get time parts of booking start and end
    v_booking_start_time := p_booking_time::TIME;
    v_booking_end_time_as_time := v_booking_end_time::TIME;

    PERFORM log_booking_validation(
        NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
        format('Comparing times - booking: %s-%s, work: %s-%s', 
               v_booking_start_time, v_booking_end_time_as_time, 
               v_work_start_time, v_work_end_time)
    );

    -- Handle bookings that span across midnight
    IF date(p_booking_time) <> date(v_booking_end_time) AND v_booking_end_time_as_time <> '00:00:00' THEN
        PERFORM log_booking_validation(
            NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
            'Booking spans multiple days - rejecting'
        );
        RETURN FALSE;
    END IF;

    -- A booking ending at '00:00:00' is considered to be at the very end of the previous day
    IF v_booking_end_time_as_time = '00:00:00' THEN
        IF v_booking_start_time >= v_work_start_time AND (v_work_end_time = '00:00:00' OR v_work_end_time = '23:59:59') THEN
            PERFORM log_booking_validation(
                NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
                'Midnight end time - allowing booking'
            );
            RETURN TRUE;
        ELSE
            PERFORM log_booking_validation(
                NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
                'Midnight end time - rejecting booking'
            );
            RETURN FALSE;
        END IF;
    END IF;

    -- Check if the booking time is within the working hours
    IF v_booking_start_time >= v_work_start_time AND v_booking_end_time_as_time <= v_work_end_time THEN
        PERFORM log_booking_validation(
            NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
            'Booking within working hours - allowing'
        );
        RETURN TRUE;
    END IF;

    PERFORM log_booking_validation(
        NULL, p_staff_id, NULL, p_booking_time, p_service_id, 
        'Booking outside working hours - rejecting'
    );
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve the business hours validation function with better error handling and logging
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
    -- Log the start of validation
    PERFORM log_booking_validation(
        NULL, NULL, p_profile_id, p_booking_time, p_service_id, 
        'Starting business hours validation'
    );

    -- Get business operating hours from profile
    SELECT business_operating_hours INTO v_business_hours 
    FROM public.profiles 
    WHERE id = p_profile_id;

    -- If no business hours are defined, allow booking (business operates 24/7)
    IF v_business_hours IS NULL THEN
        PERFORM log_booking_validation(
            NULL, NULL, p_profile_id, p_booking_time, p_service_id, 
            'No business hours defined - allowing booking'
        );
        RETURN TRUE;
    END IF;

    -- Get service duration to calculate booking end time
    SELECT duration INTO v_service_duration FROM public.services WHERE id = p_service_id;
    
    -- If service has no duration, we cannot check - be permissive
    IF v_service_duration IS NULL OR v_service_duration <= 0 THEN
        PERFORM log_booking_validation(
            NULL, NULL, p_profile_id, p_booking_time, p_service_id, 
            format('Service has no valid duration (%s) - allowing booking', v_service_duration)
        );
        RETURN TRUE;
    END IF;

    -- Calculate booking end time
    v_booking_end_time := p_booking_time + (v_service_duration * INTERVAL '1 minute');

    -- Get the day of the week - normalize to lowercase and trim spaces
    v_booking_day := lower(trim(to_char(p_booking_time, 'day')));

    PERFORM log_booking_validation(
        NULL, NULL, p_profile_id, p_booking_time, p_service_id, 
        format('Checking business day: %s, business_hours: %s', v_booking_day, v_business_hours::text)
    );

    -- Get the configuration for that day from the JSONB
    v_day_config := v_business_hours -> v_booking_day;
    
    -- If no config for the day, it's a non-operating day
    IF v_day_config IS NULL OR v_day_config = 'null'::jsonb THEN
        PERFORM log_booking_validation(
            NULL, NULL, p_profile_id, p_booking_time, p_service_id, 
            format('No business config for day %s - rejecting booking', v_booking_day)
        );
        RETURN FALSE;
    END IF;

    -- Check if the day is enabled for business
    v_day_enabled := (v_day_config ->> 'enabled')::BOOLEAN;
    IF v_day_enabled IS NULL OR v_day_enabled = FALSE THEN
        PERFORM log_booking_validation(
            NULL, NULL, p_profile_id, p_booking_time, p_service_id, 
            format('Business day %s is not enabled (%s) - rejecting booking', v_booking_day, v_day_enabled)
        );
        RETURN FALSE;
    END IF;
    
    -- Get business hours for the day
    v_business_start_time := (v_day_config ->> 'start')::TIME;
    v_business_end_time := (v_day_config ->> 'end')::TIME;
    
    -- If start or end times are missing, cannot validate - be permissive
    IF v_business_start_time IS NULL OR v_business_end_time IS NULL THEN
        PERFORM log_booking_validation(
            NULL, NULL, p_profile_id, p_booking_time, p_service_id, 
            format('Missing business start/end times (start: %s, end: %s) - allowing booking', v_business_start_time, v_business_end_time)
        );
        RETURN TRUE;
    END IF;

    -- Get time parts of booking start and end
    v_booking_start_time := p_booking_time::TIME;
    v_booking_end_time_as_time := v_booking_end_time::TIME;

    PERFORM log_booking_validation(
        NULL, NULL, p_profile_id, p_booking_time, p_service_id, 
        format('Comparing business times - booking: %s-%s, business: %s-%s', 
               v_booking_start_time, v_booking_end_time_as_time, 
               v_business_start_time, v_business_end_time)
    );

    -- Handle bookings that span across midnight
    IF date(p_booking_time) <> date(v_booking_end_time) AND v_booking_end_time_as_time <> '00:00:00' THEN
        PERFORM log_booking_validation(
            NULL, NULL, p_profile_id, p_booking_time, p_service_id, 
            'Business booking spans multiple days - rejecting'
        );
        RETURN FALSE;
    END IF;

    -- A booking ending at '00:00:00' is considered to be at the very end of the previous day
    IF v_booking_end_time_as_time = '00:00:00' THEN
        IF v_booking_start_time >= v_business_start_time AND (v_business_end_time = '00:00:00' OR v_business_end_time = '23:59:59') THEN
            PERFORM log_booking_validation(
                NULL, NULL, p_profile_id, p_booking_time, p_service_id, 
                'Business midnight end time - allowing booking'
            );
            RETURN TRUE;
        ELSE
            PERFORM log_booking_validation(
                NULL, NULL, p_profile_id, p_booking_time, p_service_id, 
                'Business midnight end time - rejecting booking'
            );
            RETURN FALSE;
        END IF;
    END IF;

    -- Check if the booking time is within the business hours
    IF v_booking_start_time >= v_business_start_time AND v_booking_end_time_as_time <= v_business_end_time THEN
        PERFORM log_booking_validation(
            NULL, NULL, p_profile_id, p_booking_time, p_service_id, 
            'Booking within business hours - allowing'
        );
        RETURN TRUE;
    END IF;

    PERFORM log_booking_validation(
        NULL, NULL, p_profile_id, p_booking_time, p_service_id, 
        'Booking outside business hours - rejecting'
    );
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve the conflict checking function with better logging
CREATE OR REPLACE FUNCTION public.check_booking_conflict(
    p_booking_id UUID,
    p_staff_id UUID,
    p_booking_time TIMESTAMPTZ,
    p_service_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_new_booking_end_time TIMESTAMPTZ;
    v_service_duration INT;
    v_conflict_exists BOOLEAN;
    v_conflict_count INT;
BEGIN
    -- Log the start of conflict checking
    PERFORM log_booking_validation(
        p_booking_id, p_staff_id, NULL, p_booking_time, p_service_id, 
        'Starting conflict validation'
    );

    -- A staff member must be assigned to check for conflicts
    IF p_staff_id IS NULL THEN
        PERFORM log_booking_validation(
            p_booking_id, p_staff_id, NULL, p_booking_time, p_service_id, 
            'No staff assigned - no conflict possible'
        );
        RETURN FALSE;
    END IF;

    -- Get the duration of the service for the new/updated booking
    SELECT duration INTO v_service_duration
    FROM public.services
    WHERE id = p_service_id;

    -- If service has no duration, we cannot check for conflicts
    IF v_service_duration IS NULL OR v_service_duration <= 0 THEN
        PERFORM log_booking_validation(
            p_booking_id, p_staff_id, NULL, p_booking_time, p_service_id, 
            format('Service has no valid duration (%s) - no conflict possible', v_service_duration)
        );
        RETURN FALSE;
    END IF;

    -- Calculate the end time of the new booking
    v_new_booking_end_time := p_booking_time + (v_service_duration * INTERVAL '1 minute');

    -- Check for any overlapping scheduled bookings for the same staff member
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.bookings b
    JOIN public.services s ON b.service_id = s.id
    WHERE b.staff_id = p_staff_id
      AND b.id <> COALESCE(p_booking_id, '00000000-0000-0000-0000-000000000000'::UUID) -- Handle NULL booking_id for new bookings
      AND b.status = 'scheduled'
      AND s.duration IS NOT NULL AND s.duration > 0
      AND (p_booking_time, v_new_booking_end_time) OVERLAPS (b.booking_time, b.booking_time + (s.duration * INTERVAL '1 minute'));

    v_conflict_exists := v_conflict_count > 0;

    PERFORM log_booking_validation(
        p_booking_id, p_staff_id, NULL, p_booking_time, p_service_id, 
        format('Conflict check result: %s conflicts found, end_time=%s', 
               v_conflict_count, v_new_booking_end_time)
    );

    RETURN v_conflict_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the main validation trigger to provide better error context
CREATE OR REPLACE FUNCTION public.validate_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check for conflicts if the booking is 'scheduled'
    IF NEW.status = 'scheduled' THEN
        PERFORM log_booking_validation(
            NEW.id, NEW.staff_id, NEW.profile_id, NEW.booking_time, NEW.service_id, 
            'Starting full booking validation for scheduled booking'
        );

        -- Check for overlapping bookings with other scheduled bookings
        IF public.check_booking_conflict(NEW.id, NEW.staff_id, NEW.booking_time, NEW.service_id) THEN
            PERFORM log_booking_validation(
                NEW.id, NEW.staff_id, NEW.profile_id, NEW.booking_time, NEW.service_id, 
                'VALIDATION FAILED: booking conflict detected'
            );
            RAISE EXCEPTION 'booking_conflict';
        END IF;

        -- Check if the booking is within the staff member's working hours
        IF NOT public.check_booking_within_working_hours(NEW.staff_id, NEW.booking_time, NEW.service_id) THEN
            PERFORM log_booking_validation(
                NEW.id, NEW.staff_id, NEW.profile_id, NEW.booking_time, NEW.service_id, 
                'VALIDATION FAILED: booking outside staff working hours'
            );
            RAISE EXCEPTION 'booking_outside_working_hours';
        END IF;

        -- Check if the booking is within the business operating hours
        IF NOT public.check_booking_within_business_hours(NEW.profile_id, NEW.booking_time, NEW.service_id) THEN
            PERFORM log_booking_validation(
                NEW.id, NEW.staff_id, NEW.profile_id, NEW.booking_time, NEW.service_id, 
                'VALIDATION FAILED: booking outside business hours'
            );
            RAISE EXCEPTION 'booking_outside_business_hours';
        END IF;

        PERFORM log_booking_validation(
            NEW.id, NEW.staff_id, NEW.profile_id, NEW.booking_time, NEW.service_id, 
            'VALIDATION PASSED: booking is valid'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
