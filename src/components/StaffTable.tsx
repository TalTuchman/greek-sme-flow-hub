
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "./ui/use-toast";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCard, MobileCardRow, MobileCardActions } from "@/components/ui/mobile-card";
import { StaffWorkingHoursDisplay } from "./StaffWorkingHoursDisplay";

type StaffMember = Tables<'staff_members'>;

interface StaffTableProps {
  staffMembers: StaffMember[];
  onEdit: (staff: StaffMember) => void;
}

export const StaffTable = ({ staffMembers, onEdit }: StaffTableProps) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('staff_members').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff_members'] });
            toast({ title: t('staff.toast_delete_success') });
        },
        onError: (error) => {
            toast({ title: t('staff.toast_error_title'), description: error.message, variant: "destructive" });
        }
    });

    if (isMobile) {
        return (
            <div className="space-y-3">
                {staffMembers.map((staff) => (
                    <MobileCard key={staff.id}>
                        <MobileCardRow 
                            label={t('staff.full_name')} 
                            value={
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full border"
                                        style={{ backgroundColor: staff.color || '#3B82F6' }}
                                    />
                                    {staff.full_name}
                                </div>
                            } 
                        />
                        <MobileCardRow label={t('staff.email')} value={staff.email || 'N/A'} />
                        <MobileCardRow label={t('staff.phone')} value={staff.phone || 'N/A'} />
                        <MobileCardRow 
                            label={t('staff.working_hours')} 
                            value={<StaffWorkingHoursDisplay workingHours={staff.working_hours} />} 
                        />
                        <MobileCardActions>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => onEdit(staff)}
                                className="flex-1"
                            >
                                {t('staff.edit_staff')}
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => deleteMutation.mutate(staff.id)}
                                disabled={deleteMutation.isPending}
                                className="flex-1"
                            >
                                {t('staff.delete_staff')}
                            </Button>
                        </MobileCardActions>
                    </MobileCard>
                ))}
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t('staff.full_name')}</TableHead>
                    <TableHead>{t('staff.email')}</TableHead>
                    <TableHead>{t('staff.phone')}</TableHead>
                    <TableHead>{t('staff.working_hours')}</TableHead>
                    <TableHead><span className="sr-only">{t('staff.actions')}</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full border"
                                    style={{ backgroundColor: staff.color || '#3B82F6' }}
                                />
                                {staff.full_name}
                            </div>
                        </TableCell>
                        <TableCell>{staff.email || 'N/A'}</TableCell>
                        <TableCell>{staff.phone || 'N/A'}</TableCell>
                        <TableCell>
                            <StaffWorkingHoursDisplay workingHours={staff.working_hours} />
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>{t('staff.actions')}</DropdownMenuLabel>
                                    <DropdownMenuItem onSelect={() => onEdit(staff)}>{t('staff.edit_staff')}</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => deleteMutation.mutate(staff.id)}>{t('staff.delete_staff')}</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
