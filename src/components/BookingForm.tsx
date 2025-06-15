import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
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

type Booking = Tables<'bookings'>;
type Customer = Tables<'customers'>;
type Service = Tables<'services'>;

interface BookingFormProps {
  booking: Booking | null;
  onClose: () => void;
}

export const BookingForm = ({ booking, onClose }: BookingFormProps) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: customers } = useQuery<Customer[]>({
        queryKey: ['customers'],
        queryFn: async () => {
            const { data, error } = await supabase.from('customers').select('*');
            if (error) throw error;
            return data;
        },
    });

    const { data: services } = useQuery<Service[]>({
        queryKey: ['services'],
        queryFn: async () => {
            const { data, error } = await supabase.from('services').select('*');
            if (error) throw error;
            return data;
        },
    });

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            customer_id: booking?.customer_id || "",
            service_id: booking?.service_id || "",
            booking_time: booking?.booking_time ? format(new Date(booking.booking_time), "yyyy-MM-dd'T'HH:mm") : "",
            status: booking?.status || "scheduled",
            notes: booking?.notes || "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: BookingFormValues) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            if (booking) { // Update
                const bookingUpdate: TablesUpdate<'bookings'> = { ...values, updated_at: new Date().toISOString() };
                const { error } = await supabase.from('bookings').update(bookingUpdate).eq('id', booking.id);
                if (error) throw error;
            } else { // Insert
                const bookingInsert: TablesInsert<'bookings'> = {
                    customer_id: values.customer_id,
                    service_id: values.service_id,
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
                title: booking ? "Booking Updated" : "Booking Created",
                description: "The booking has been saved successfully.",
            });
            onClose();
        },
        onError: (error) => {
            toast({
                title: "Error",
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
            booking_time: booking?.booking_time ? format(new Date(booking.booking_time), "yyyy-MM-dd'T'HH:mm") : "",
            status: booking?.status || "scheduled",
            notes: booking?.notes || "",
        });
    }, [booking, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 p-4 sm:p-0">
                <FormField
                    control={form.control}
                    name="customer_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Customer</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a customer" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {customers?.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="service_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Service</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a service" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {services?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="booking_time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Booking Date and Time</FormLabel>
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
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Any notes for the booking..." {...field} value={field.value ?? ''}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="sm:hidden" /> 
                <div className="hidden sm:flex sm:justify-end sm:gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Saving..." : "Save Booking"}
                    </Button>
                </div>
                <Button type="submit" className="sm:hidden" disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving..." : "Save Booking"}
                </Button>
            </form>
        </Form>
    );
};
