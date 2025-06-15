
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type Service = Tables<'services'>;

export const ServiceSelect = () => {
    const { control } = useFormContext();
    const { t } = useTranslation();

    const { data: services, isLoading } = useQuery<Service[]>({
        queryKey: ['services'],
        queryFn: async () => {
            const { data, error } = await supabase.from('services').select('*');
            if (error) throw error;
            return data;
        },
    });

    return (
        <FormField
            control={control}
            name="service_id"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('bookings.form_service')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('bookings.form_select_service')} />
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
    );
};
