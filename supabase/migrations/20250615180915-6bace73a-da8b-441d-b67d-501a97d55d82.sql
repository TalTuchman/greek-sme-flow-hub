
-- Drop existing trigger and functions if they exist to allow for recreation.
DROP TRIGGER IF EXISTS before_booking_insert_update ON public.bookings;
DROP FUNCTION IF EXISTS public.validate_booking_conflict();
DROP FUNCTION IF EXISTS public.check_booking_conflict(UUID, UUID, TIMESTAMPTZ, UUID);

-- Function to check for an overlapping booking for a given staff member.
-- It returns TRUE if a conflict is found, otherwise FALSE.
-- This function is SECURITY DEFINER to bypass RLS for conflict checking across all relevant bookings.
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
BEGIN
    -- A staff member must be assigned to check for conflicts.
    IF p_staff_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Get the duration of the service for the new/updated booking.
    SELECT duration INTO v_service_duration
    FROM public.services
    WHERE id = p_service_id;

    -- If service has no duration, we cannot check for conflicts.
    IF v_service_duration IS NULL OR v_service_duration <= 0 THEN
        RETURN FALSE;
    END IF;

    -- Calculate the end time of the new booking.
    v_new_booking_end_time := p_booking_time + (v_service_duration * INTERVAL '1 minute');

    -- Check for any overlapping scheduled bookings for the same staff member.
    SELECT EXISTS (
        SELECT 1
        FROM public.bookings b
        JOIN public.services s ON b.service_id = s.id
        WHERE b.staff_id = p_staff_id
          AND b.id <> p_booking_id -- Exclude the current booking if it's an update.
          AND b.status = 'scheduled'
          AND s.duration IS NOT NULL AND s.duration > 0
          AND (p_booking_time, v_new_booking_end_time) OVERLAPS (b.booking_time, b.booking_time + (s.duration * INTERVAL '1 minute'))
    ) INTO v_conflict_exists;

    RETURN v_conflict_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function that runs before a booking is inserted or updated.
-- It calls check_booking_conflict to validate the booking time.
CREATE OR REPLACE FUNCTION public.validate_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check for conflicts if the booking is 'scheduled'.
    IF NEW.status = 'scheduled' THEN
        -- The check is performed on insert, or on update.
        IF public.check_booking_conflict(NEW.id, NEW.staff_id, NEW.booking_time, NEW.service_id) THEN
            RAISE EXCEPTION 'booking_conflict';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that executes the validate_booking_conflict function before each row insert or update on the bookings table.
CREATE TRIGGER before_booking_insert_update
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.validate_booking_conflict();
