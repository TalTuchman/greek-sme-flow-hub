
import * as React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Tables } from "@/integrations/supabase/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { type Control } from "react-hook-form";
import { type StaffFormValues } from "@/lib/schemas/staffSchema";

type Service = Tables<'services'>;

interface StaffServicesSelectorProps {
    control: Control<StaffFormValues>;
    services: Service[] | undefined;
    isLoadingServices: boolean;
    isLoadingStaffServices: boolean;
    hasStaffMember: boolean;
}

export const StaffServicesSelector = ({ control, services, isLoadingServices, isLoadingStaffServices, hasStaffMember }: StaffServicesSelectorProps) => {
    const { t } = useTranslation();

    return (
        <FormField
            control={control}
            name="service_ids"
            render={() => (
                <FormItem>
                    <FormLabel>{t('staff.services')}</FormLabel>
                    <FormDescription>{t('staff.services_desc')}</FormDescription>
                    {(isLoadingServices || (hasStaffMember && isLoadingStaffServices)) ? (
                        <Skeleton className="h-24 w-full" />
                    ) : (
                        <div className="space-y-2 rounded-md border p-2">
                            {services?.map((service) => (
                                <FormField
                                    key={service.id}
                                    control={control}
                                    name="service_ids"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 rounded-md hover:bg-muted/50">
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
                            ))}
                        </div>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
