
-- Update the user creation function to add default campaigns for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Create a profile for the new user
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');

  -- Insert "Arrive to booking reminder" campaign
  INSERT INTO public.campaigns (profile_id, name, trigger_type, trigger_config, send_time, communication_method, message, is_active)
  VALUES (
    new.id,
    'Arrive to booking reminder',
    'before_booking',
    '{"days": 1}',
    '18:00:00',
    'sms',
    'Hi {customer_name}, just a friendly reminder about your upcoming appointment for {service_name} tomorrow at {booking_time}. We look forward to seeing you! Regards, {business_name}.',
    true
  );

  -- Insert "Make a booking reminder" campaign
  INSERT INTO public.campaigns (profile_id, name, trigger_type, trigger_config, send_time, communication_method, message, is_active)
  VALUES (
    new.id,
    'Make a booking reminder',
    'after_booking',
    '{"days": 21}',
    '18:00:00',
    'sms',
    'Hi {customer_name}, it''s been 21 days since your last {service_name} appointment. Ready for your next one? Book now! Regards, {business_name}.',
    true
  );

  RETURN new;
END;
$function$;

-- Insert default campaigns for existing users if they don't already have them by name

-- Insert "Arrive to booking reminder" for existing users
INSERT INTO public.campaigns (profile_id, name, trigger_type, trigger_config, send_time, communication_method, message, is_active)
SELECT p.id,
       'Arrive to booking reminder',
       'before_booking',
       '{"days": 1}',
       '18:00:00',
       'sms',
       'Hi {customer_name}, just a friendly reminder about your upcoming appointment for {service_name} tomorrow at {booking_time}. We look forward to seeing you! Regards, {business_name}.',
       true
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.campaigns c WHERE c.profile_id = p.id AND c.name = 'Arrive to booking reminder'
);

-- Insert "Make a booking reminder" for existing users
INSERT INTO public.campaigns (profile_id, name, trigger_type, trigger_config, send_time, communication_method, message, is_active)
SELECT p.id,
       'Make a booking reminder',
       'after_booking',
       '{"days": 21}',
       '18:00:00',
       'sms',
       'Hi {customer_name}, it''s been 21 days since your last {service_name} appointment. Ready for your next one? Book now! Regards, {business_name}.',
       true
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.campaigns c WHERE c.profile_id = p.id AND c.name = 'Make a booking reminder'
);
