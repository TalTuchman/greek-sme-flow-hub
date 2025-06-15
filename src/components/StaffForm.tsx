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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { staffSchema, type StaffFormValues } from "@/lib/schemas/staffSchema";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkingHoursSelector, type WorkingHours } from "./WorkingHoursSelector";

type StaffMember = Tables<'staff_members'>;
type Service = Tables<'services'>;

interface StaffFormProps {
  staffMember: StaffMember | null;
  onClose: () => void;
}

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const defaultWorkingHours = days.reduce((acc, day) => {
    acc[day as keyof WorkingHours] = { 
        enabled: !['saturday', 'sunday'].includes(day), 
        start: '09:00', 
        end: '17:00' 
    };
    return acc;
}, {} as WorkingHours);

export const StaffForm = ({ staffMember, onClose }: StaffFormProps) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const getServices = async () => {
        const { data, error } = await supabase.from('services').select('*');
        if (error) throw error;
        return data;
    };

    const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({
        queryKey: ['services'],
        queryFn: getServices
    });
    
    const getStaffServices = async (staffId: string) => {
        const { data, error } = await supabase.from('staff_services').select('service_id').eq('staff_id', staffId);
        if (error) throw error;
        return data.map(item => item.service_id);
    }
    
    const { data: initialServiceIds, isLoading: isLoadingStaffServices } = useQuery<string[]>({
        queryKey: ['staff_services', staffMember?.id],
        queryFn: () => getStaffServices(staffMember!.id),
        enabled: !!staffMember,
    });

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            full_name: "",
            email: "",
            phone: "",
            service_ids: [],
            working_hours: defaultWorkingHours,
        },
    });
    
    React.useEffect(() => {
        if (staffMember) {
            form.reset({
                full_name: staffMember.full_name || "",
                email: staffMember.email || "",
                phone: staffMember.phone || "",
                service_ids: initialServiceIds || [],
                working_hours: (staffMember.working_hours as WorkingHours) || defaultWorkingHours,
            });
        } else {
            form.reset({
                full_name: "",
                email: "",
                phone: "",
                service_ids: [],
                working_hours: defaultWorkingHours,
            });
        }
    }, [staffMember, initialServiceIds, form]);

    const mutation = useMutation({
        mutationFn: async (values: StaffFormValues) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            let staffId = staffMember?.id;

            const workingHours = values.working_hours;

            if (staffMember) { // Update
                const staffUpdate: TablesUpdate<'staff_members'> = { 
                    full_name: values.full_name,
                    email: values.email,
                    phone: values.phone,
                    working_hours: workingHours,
                    updated_at: new Date().toISOString() 
                };
                const { error } = await supabase.from('staff_members').update(staffUpdate).eq('id', staffMember.id);
                if (error) throw error;
            } else { // Insert
                const staffInsert: TablesInsert<'staff_members'> = {
                    profile_id: user.id,
                    full_name: values.full_name,
                    email: values.email,
                    phone: values.phone,
                    working_hours: workingHours,
                };
                const { data, error } = await supabase.from('staff_members').insert(staffInsert).select().single();
                if (error) throw error;
                staffId = data.id;
            }

            if (!staffId) throw new Error("Staff ID not found.");

            // Handle services
            await supabase.from('staff_services').delete().eq('staff_id', staffId);

            if (values.service_ids && values.service_ids.length > 0) {
                const staffServicesInsert: TablesInsert<'staff_services'>[] = values.service_ids.map(service_id => ({
                    staff_id: staffId!,
                    service_id,
                }));
                const { error: servicesError } = await supabase.from('staff_services').insert(staffServicesInsert);
                if (servicesError) throw servicesError;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff_members'] });
            queryClient.invalidateQueries({ queryKey: ['staff_services'] });
            toast({
                title: staffMember ? "Staff Member Updated" : "Staff Member Created",
                description: `The staff member "${form.getValues("full_name")}" has been saved successfully.`,
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

    function onSubmit(values: StaffFormValues) {
        mutation.mutate(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 p-4 sm:p-0">
                <FormField control={form.control} name="full_name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="e.g. John Doe" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="e.g. john.doe@example.com" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input placeholder="e.g. 555-123-4567" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField
                    control={form.control}
                    name="service_ids"
                    render={() => (
                        <FormItem>
                            <FormLabel>Services</FormLabel>
                            <FormDescription>Select the services this staff member can provide.</FormDescription>
                            {(isLoadingServices || (staffMember && isLoadingStaffServices)) ? (
                                <Skeleton className="h-24 w-full" />
                            ) : (
                                services?.map((service) => (
                                    <FormField
                                        key={service.id}
                                        control={form.control}
                                        name="service_ids"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(service.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), service.id])
                                                                : field.onChange(field.value?.filter((value) => value !== service.id));
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">{service.name}</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField control={form.control} name="working_hours" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Working Hours</FormLabel>
                        <FormControl>
                            <WorkingHoursSelector value={field.value ?? null} onChange={field.onChange} />
                        </FormControl>
                        <FormDescription>Set the working hours for this staff member.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                
                <div className="sm:hidden" />
                <div className="hidden sm:flex sm:justify-end sm:gap-2">
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save"}</Button>
                </div>
                <Button type="submit" className="sm:hidden" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save"}</Button>
            </form>
        </Form>
    );
};
