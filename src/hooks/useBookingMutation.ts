
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { type BookingFormValues } from "@/lib/schemas/bookingSchema";
import { useTranslation } from "react-i18next";

type Booking = Tables<'bookings'>;

export const useBookingMutation = (booking: Booking | null, onClose: () => void) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (values: BookingFormValues) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            console.log('Submitting booking:', {
                customer_id: values.customer_id,
                service_id: values.service_id,
                staff_id: values.staff_id,
                booking_time: values.booking_time,
                status: values.status,
                profile_id: user.id
            });

            if (booking) { // Update
                const bookingUpdate: TablesUpdate<'bookings'> = { 
                    ...values, 
                    updated_at: new Date().toISOString() 
                };
                console.log('Updating booking with ID:', booking.id);
                const { error } = await supabase.from('bookings').update(bookingUpdate).eq('id', booking.id);
                if (error) {
                    console.error('Booking update error:', error);
                    throw error;
                }
            } else { // Insert
                const bookingInsert: TablesInsert<'bookings'> = {
                    customer_id: values.customer_id,
                    service_id: values.service_id,
                    staff_id: values.staff_id,
                    booking_time: values.booking_time,
                    status: values.status,
                    notes: values.notes,
                    profile_id: user.id,
                };
                console.log('Creating new booking:', bookingInsert);
                const { error } = await supabase.from('bookings').insert(bookingInsert);
                if (error) {
                    console.error('Booking creation error:', error);
                    throw error;
                }
            }
        },
        onSuccess: () => {
            console.log('Booking operation successful');
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast({
                title: booking ? t("bookings.toast_update_success_title") : t("bookings.toast_create_success_title"),
                description: t("bookings.toast_success_description"),
            });
            onClose();
        },
        onError: (error) => {
            console.error('Booking mutation error:', error);
            
            let description = error.message;
            let title = t("bookings.toast_error_title");

            // Handle specific booking validation errors with detailed messages
            if (error.message.includes('booking_conflict')) {
                title = t("bookings.conflict_error_title", "Booking Conflict");
                description = t("bookings.conflict_error", "This time slot conflicts with another scheduled booking for the same staff member. Please choose a different time.");
            } else if (error.message.includes('booking_outside_working_hours')) {
                title = t("bookings.working_hours_error_title", "Outside Working Hours");
                description = t("bookings.outside_working_hours_error", "The booking is outside of the staff member's working hours. Please check the staff schedule and choose a time when they are available.");
            } else if (error.message.includes('booking_outside_business_hours')) {
                title = t("bookings.business_hours_error_title", "Outside Business Hours");
                description = t("bookings.outside_business_hours_error", "The booking is outside of your business operating hours. Please choose a time when your business is open.");
            } else if (error.message.includes('permission denied')) {
                title = t("bookings.permission_error_title", "Permission Error");
                description = t("bookings.permission_error", "There was a permission issue while validating the booking. Please try again or contact support.");
            }
            
            toast({
                title,
                description,
                variant: "destructive",
            });
        },
    });
};
