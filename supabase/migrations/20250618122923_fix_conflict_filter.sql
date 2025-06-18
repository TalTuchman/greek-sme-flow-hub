-- +goose Up
CREATE OR REPLACE FUNCTION public.check_booking_conflict(
    p_booking_id   uuid,
    p_staff_id     uuid,
    p_booking_time timestamptz,
    p_service_id   uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_booking_end_time  timestamptz;
    v_service_duration      int;
    v_conflict_exists       boolean;
BEGIN
    /* ---------- basic guards ---------- */
    IF p_staff_id IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT duration
    INTO   v_service_duration
    FROM   public.services
    WHERE  id = p_service_id;

    IF v_service_duration IS NULL OR v_service_duration <= 0 THEN
        RETURN FALSE;
    END IF;

    v_new_booking_end_time :=
        p_booking_time + (v_service_duration * INTERVAL '1 minute');

    /* ---------- profile-aware, edge-exclusive overlap ---------- */
    SELECT EXISTS (
        SELECT 1
        FROM   public.bookings  b
        JOIN   public.services s ON s.id = b.service_id
        WHERE  b.staff_id    = p_staff_id
          AND  b.id         <> p_booking_id
          AND  b.status      = 'scheduled'
          -- isolate to the same business
          AND  b.profile_id  = (
                 SELECT profile_id
                 FROM   public.staff_members
                 WHERE  id = p_staff_id
               )
          -- allow back-to-back: strict "<" and ">"
          AND  p_booking_time         < b.booking_time
                                         + (s.duration * INTERVAL '1 minute')
          AND  v_new_booking_end_time > b.booking_time
    ) INTO v_conflict_exists;

    RETURN v_conflict_exists;
END;
$$;

-- +goose Down
/* optional: re-create the old definition if you ever need a rollback */
