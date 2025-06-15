
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/integrations/supabase/types";
import { WorkingHoursSelector } from "./WorkingHoursSelector";
import { useTranslation } from "react-i18next";
import { useStaffForm } from "@/hooks/useStaffForm.tsx";
import { StaffServicesSelector } from "./StaffServicesSelector";

type StaffMember = Tables<'staff_members'>;

interface StaffFormProps {
  staffMember: StaffMember | null;
  onClose: () => void;
}

export const StaffForm = ({ staffMember, onClose }: StaffFormProps) => {
    const { t } = useTranslation();
    const { 
        form, 
        onSubmit, 
        mutation, 
        services, 
        isLoadingServices, 
        isLoadingStaffServices 
    } = useStaffForm(staffMember, onClose);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 p-4 sm:p-0">
                <FormField control={form.control} name="full_name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('staff.full_name')}</FormLabel>
                        <FormControl><Input placeholder={t('staff.full_name_placeholder')} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('staff.email')}</FormLabel>
                        <FormControl><Input type="email" placeholder={t('staff.email_placeholder')} {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('staff.phone')}</FormLabel>
                        <FormControl><Input placeholder={t('staff.phone_placeholder')} {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <StaffServicesSelector 
                    control={form.control}
                    services={services}
                    isLoadingServices={isLoadingServices}
                    isLoadingStaffServices={isLoadingStaffServices}
                    hasStaffMember={!!staffMember}
                />

                <FormField control={form.control} name="working_hours" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('staff.working_hours')}</FormLabel>
                        <FormControl>
                            <WorkingHoursSelector value={field.value ?? null} onChange={field.onChange} />
                        </FormControl>
                        <FormDescription>{t('staff.working_hours_desc')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                
                <div className="sm:hidden" />
                <div className="hidden sm:flex sm:justify-end sm:gap-2">
                    <DialogClose asChild><Button type="button" variant="outline">{t('staff.cancel')}</Button></DialogClose>
                    <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? t('staff.saving') : t('staff.save')}</Button>
                </div>
                <Button type="submit" className="sm:hidden" disabled={mutation.isPending}>{mutation.isPending ? t('staff.saving') : t('staff.save')}</Button>
            </form>
        </Form>
    );
};
