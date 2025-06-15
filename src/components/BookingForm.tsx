import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { bookingSchema, type BookingFormValues } from "@/lib/schemas/bookingSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CustomerSelect } from "./form/CustomerSelect";
import { ServiceSelect } from "./form/ServiceSelect";
import { StaffSelect } from "./form/StaffSelect";
import { useTranslation } from "react-i18next";

type Booking = Tables<'bookings'>;

interface BookingFormProps {
  booking: Booking | null;
  onClose: () => void;
}

export const BookingForm = ({ booking, onClose }: BookingFormProps) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { t } = useTranslation();

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            customer_id: booking?.customer_id || "",
            service_id: booking?.service_id || "",
            staff_id: booking?.staff_id ?? null,
            booking_time: booking?.booking_time ? format(new Date(booking.booking_time), "yyyy-MM-dd'T'HH:mm") : "",
            status: booking?.status || "scheduled",
            notes: booking?.notes || "",
        },
    });

    const mutation = useMutation({
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

    function onSubmit(values: BookingFormValues) {
        mutation.mutate(values);
    }
    
    React.useEffect(() => {
        form.reset({
            customer_id: booking?.customer_id || "",
            service_id: booking?.service_id || "",
            staff_id: booking?.staff_id ?? null,
            booking_time: booking?.booking_time ? format(new Date(booking.booking_time), "yyyy-MM-dd'T'HH:mm") : "",
            status: booking?.status || "scheduled",
            notes: booking?.notes || "",
        });
    }, [booking, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 p-4 sm:p-0">
                <CustomerSelect />
                <ServiceSelect />
                <StaffSelect />
                <FormField
                    control={form.control}
                    name="booking_time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('bookings.form_datetime')}</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('bookings.form_status')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('bookings.form_select_status')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="scheduled">{t('bookings.status_scheduled')}</SelectItem>
                                    <SelectItem value="completed">{t('bookings.status_completed')}</SelectItem>
                                    <SelectItem value="cancelled">{t('bookings.status_cancelled')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('bookings.form_notes')}</FormLabel>
                            <FormControl>
                                <Textarea placeholder={t('bookings.form_notes_placeholder')} {...field} value={field.value ?? ''}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="sm:hidden" /> 
                <div className="hidden sm:flex sm:justify-end sm:gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">{t('bookings.cancel')}</Button>
                    </DialogClose>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? t('bookings.saving_booking') : t('bookings.save_booking')}
                    </Button>
                </div>
                <Button type="submit" className="sm:hidden" disabled={mutation.isPending}>
                    {mutation.isPending ? t('bookings.saving_booking') : t('bookings.save_booking')}
                </Button>
            </form>
        </Form>
    );
};
