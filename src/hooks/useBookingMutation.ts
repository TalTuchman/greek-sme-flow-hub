
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

            // Custom validation for staff member availability
            if (values.staff_id) {
                // 1. Get service duration for the new booking to calculate end time
                const { data: serviceData, error: serviceError } = await supabase
                    .from('services')
                    .select('duration')
                    .eq('id', values.service_id)
                    .single();

                if (serviceError) {
                    console.error("Error fetching service duration:", serviceError);
                    throw new Error("Could not check for booking conflicts: unable to fetch service details.");
                }

                // Only check for conflicts if the service has a duration
                if (serviceData && typeof serviceData.duration === 'number') {
                    const newBookingStartTime = new Date(values.booking_time);
                    const newBookingEndTime = new Date(newBookingStartTime.getTime() + serviceData.duration * 60 * 1000);
                    
                    // 2. Fetch potentially conflicting bookings for the selected staff member
                    let conflictQuery = supabase
                        .from('bookings')
                        .select('id, booking_time, services(duration)')
                        .eq('staff_id', values.staff_id)
                        .neq('status', 'cancelled');

                    // If updating an existing booking, exclude it from the conflict check
                    if (booking) {
                        conflictQuery = conflictQuery.neq('id', booking.id);
                    }

                    const { data: existingBookings, error: existingBookingsError } = await conflictQuery;

                    if (existingBookingsError) {
                        console.error("Error fetching existing bookings for conflict check:", existingBookingsError);
                        throw new Error("Could not check for booking conflicts due to a database error.");
                    }

                    // 3. Check for overlaps
                    if (existingBookings) {
                        for (const existing of existingBookings as any[]) {
                            if (existing.services && typeof existing.services.duration === 'number') {
                                const existingStartTime = new Date(existing.booking_time);
                                const existingEndTime = new Date(existingStartTime.getTime() + existing.services.duration * 60 * 1000);
                                
                                // Overlap condition: (StartA < EndB) and (EndA > StartB)
                                if (newBookingStartTime < existingEndTime && newBookingEndTime > existingStartTime) {
                                    throw new Error(t("bookings.conflict_error"));
                                }
                            }
                        }
                    }
                }
            }


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
            toast({
                title: t("bookings.toast_error_title"),
                description: error.message,
                variant: "destructive",
            });
        },
    });
};
