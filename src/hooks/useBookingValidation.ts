
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type StaffMember = Tables<'staff_members'>;
type Service = Tables<'services'>;
type Profile = Tables<'profiles'>;

interface BookingValidationParams {
  staffId: string | null;
  serviceId: string;
  bookingTime: string;
  enabled?: boolean;
}

export const useBookingValidation = ({
  staffId,
  serviceId,
  bookingTime,
  enabled = true
}: BookingValidationParams) => {
  return useQuery({
    queryKey: ['booking-validation', staffId, serviceId, bookingTime],
    queryFn: async () => {
      if (!staffId || !serviceId || !bookingTime) {
        return { 
          isValid: false, 
          errors: ['Missing required fields'],
          warnings: [] // Always provide warnings as an empty array
        };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get staff member details
      const { data: staff } = await supabase
        .from('staff_members')
        .select('*')
        .eq('id', staffId)
        .single();

      // Get service details
      const { data: service } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      // Get profile details
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Check for existing bookings at the same time
      const bookingDateTime = new Date(bookingTime);
      const endTime = new Date(bookingDateTime.getTime() + (service?.duration || 0) * 60000);

      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('staff_id', staffId)
        .eq('status', 'scheduled')
        .gte('booking_time', bookingDateTime.toISOString())
        .lt('booking_time', endTime.toISOString());

      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate staff working hours
      if (staff?.working_hours) {
        const dayName = bookingDateTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const workingHours = staff.working_hours as any;
        const dayConfig = workingHours[dayName];
        
        if (!dayConfig?.enabled) {
          errors.push(`Staff member is not available on ${dayName}s`);
        } else if (dayConfig.start && dayConfig.end) {
          const bookingTime = bookingDateTime.toTimeString().slice(0, 5);
          const endTime = new Date(bookingDateTime.getTime() + (service?.duration || 0) * 60000).toTimeString().slice(0, 5);
          
          if (bookingTime < dayConfig.start || endTime > dayConfig.end) {
            errors.push(`Booking time (${bookingTime}-${endTime}) is outside staff working hours (${dayConfig.start}-${dayConfig.end})`);
          }
        }
      }

      // Validate business hours
      if (profile?.business_operating_hours) {
        const dayName = bookingDateTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const businessHours = profile.business_operating_hours as any;
        const dayConfig = businessHours[dayName];
        
        if (!dayConfig?.enabled) {
          errors.push(`Business is closed on ${dayName}s`);
        } else if (dayConfig.start && dayConfig.end) {
          const bookingTime = bookingDateTime.toTimeString().slice(0, 5);
          const endTime = new Date(bookingDateTime.getTime() + (service?.duration || 0) * 60000).toTimeString().slice(0, 5);
          
          if (bookingTime < dayConfig.start || endTime > dayConfig.end) {
            errors.push(`Booking time (${bookingTime}-${endTime}) is outside business hours (${dayConfig.start}-${dayConfig.end})`);
          }
        }
      }

      // Check for conflicts
      if (existingBookings && existingBookings.length > 0) {
        errors.push('Staff member already has a booking scheduled at this time');
      }

      // Add warnings for edge cases
      if (!staff?.working_hours) {
        warnings.push('No working hours set for this staff member');
      }
      
      if (!profile?.business_operating_hours) {
        warnings.push('No business operating hours configured');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings, // Always provide warnings as an array
        staff,
        service,
        profile
      };
    },
    enabled: enabled && !!staffId && !!serviceId && !!bookingTime,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });
};
