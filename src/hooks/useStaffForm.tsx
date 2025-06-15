
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { staffSchema, type StaffFormValues } from "@/lib/schemas/staffSchema";
import { type WorkingHours } from "@/components/WorkingHoursSelector";
import { useTranslation } from "react-i18next";

type StaffMember = Tables<'staff_members'>;
type Service = Tables<'services'>;

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const defaultWorkingHours = days.reduce((acc, day) => {
    acc[day as keyof WorkingHours] = { 
        enabled: !['saturday', 'sunday'].includes(day), 
        start: '09:00', 
        end: '17:00' 
    };
    return acc;
}, {} as WorkingHours);

export const useStaffForm = (staffMember: StaffMember | null, onClose: () => void) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { t } = useTranslation();

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
                title: staffMember ? t('staff.toast_update_success_title') : t('staff.toast_create_success_title'),
                description: t('staff.toast_success_desc', { name: form.getValues("full_name") }),
            });
            onClose();
        },
        onError: (error) => {
            toast({
                title: t('staff.toast_error_title'),
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const onSubmit = (values: StaffFormValues) => {
        mutation.mutate(values);
    };

    return {
        form,
        onSubmit,
        mutation,
        services,
        isLoadingServices,
        isLoadingStaffServices
    };
}
