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

            // Client-side booking conflict validation has been removed.
            // This is now handled securely by a database trigger.

            if (booking) { // Update
                const bookingUpdate: TablesUpdate<'bookings'> = { ...values, updated_at: new Date().toISOString() };
                const { error } = await supabase.from('bookings').update(bookingUpdate).eq('id', booking.id);
                if (error) throw error;
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
                const { error } = await supabase.from('bookings').insert(bookingInsert);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast({
                title: booking ? t("bookings.toast_update_success_title") : t("bookings.toast_create_success_title"),
                description: t("bookings.toast_success_description"),
            });
            onClose();
        },
        onError: (error) => {
            const description = error.message.includes('booking_conflict')
                ? t("bookings.conflict_error")
                : error.message.includes('booking_outside_working_hours')
                ? t("bookings.outside_working_hours_error", "The booking is outside of the staff member's working hours.")
                : error.message;
            
            toast({
                title: t("bookings.toast_error_title"),
                description,
                variant: "destructive",
            });
        },
    });
};
