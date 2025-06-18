
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
import type { Tables } from "@/integrations/supabase/types";
import { bookingSchema, type BookingFormValues } from "@/lib/schemas/bookingSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CustomerSelect } from "./form/CustomerSelect";
import { ServiceSelect } from "./form/ServiceSelect";
import { StaffSelect } from "./form/StaffSelect";
import { useTranslation } from "react-i18next";
import { useBookingMutation } from "@/hooks/useBookingMutation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

type Booking = Tables<'bookings'>;

interface BookingFormProps {
  booking: Booking | null;
  onClose: () => void;
}

export const BookingForm = ({ booking, onClose }: BookingFormProps) => {
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

    const mutation = useBookingMutation(booking, onClose);

    function onSubmit(values: BookingFormValues) {
        console.log('Form submitted with values:', values);
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

    const selectedStatus = form.watch("status");
    const selectedStaffId = form.watch("staff_id");

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 p-4 sm:p-0">
                {selectedStatus === "scheduled" && (
                    <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertDescription>
                            {t('bookings.scheduling_info', 'Scheduled bookings will be validated against staff working hours, business operating hours, and existing bookings to prevent conflicts.')}
                        </AlertDescription>
                    </Alert>
                )}

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
                            {selectedStaffId && selectedStatus === "scheduled" && (
                                <p className="text-sm text-muted-foreground">
                                    {t('bookings.datetime_hint', 'Please ensure the selected time is within the staff member\'s working hours and your business operating hours.')}
                                </p>
                            )}
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
