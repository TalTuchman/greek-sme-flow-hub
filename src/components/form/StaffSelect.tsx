
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type StaffMember = Tables<'staff_members'>;

export const StaffSelect = () => {
    const { control } = useFormContext();
    const { t } = useTranslation();

    const { data: staffMembers, isLoading } = useQuery<StaffMember[]>({
        queryKey: ['staff_members'],
        queryFn: async () => {
            const { data, error } = await supabase.from('staff_members').select('*');
            if (error) throw error;
            return data;
        },
    });

    return (
        <FormField
            control={control}
            name="staff_id"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('bookings.form_staff')}</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === 'none' ? null : value)} value={field.value ?? 'none'} disabled={isLoading}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('bookings.form_select_staff')} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                             <SelectItem value="none">{t('bookings.form_staff_none')}</SelectItem>
                            {staffMembers?.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
