
-- Revoke direct execution permissions from public roles for security functions.
-- This prevents them from being called directly via the API, while allowing triggers to use them.
REVOKE EXECUTE ON FUNCTION public.check_booking_conflict(UUID, UUID, TIMESTAMPTZ, UUID) FROM public;
REVOKE EXECUTE ON FUNCTION public.check_booking_within_working_hours(UUID, TIMESTAMPTZ, UUID) FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;

-- Also revoke from authenticated role just in case
REVOKE EXECUTE ON FUNCTION public.check_booking_conflict(UUID, UUID, TIMESTAMPTZ, UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.check_booking_within_working_hours(UUID, TIMESTAMPTZ, UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

