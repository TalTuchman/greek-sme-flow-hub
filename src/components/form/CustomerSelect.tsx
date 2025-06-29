
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type Customer = Tables<'customers'>;

export const CustomerSelect = () => {
    const { control } = useFormContext();
    const { t } = useTranslation();

    const { data: customers, isLoading } = useQuery<Customer[]>({
        queryKey: ['customers'],
        queryFn: async () => {
            const { data, error } = await supabase.from('customers').select('*');
            if (error) throw error;
            return data;
        },
    });

    return (
        <FormField
            control={control}
            name="customer_id"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('bookings.form_customer')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('bookings.form_select_customer')} />
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
    );
};
