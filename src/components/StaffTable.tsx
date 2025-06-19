
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

type StaffMember = Tables<'staff_members'>;

interface StaffTableProps {
  staffMembers: StaffMember[];
  onEdit: (staffMember: StaffMember) => void;
}

export const StaffTable = ({ staffMembers, onEdit }: StaffTableProps) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const deleteMutation = useMutation({
        mutationFn: async (staffId: string) => {
            const { error } = await supabase.from('staff_members').delete().eq('id', staffId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff_members'] });
            toast({
                title: t('staff_table.staff_deleted'),
                description: t('staff_table.staff_deleted_desc'),
            });
        },
        onError: (error) => {
            toast({
                title: t('staff_table.delete_error'),
                description: error.message,
                variant: "destructive",
            });
        },
    });

  if (staffMembers.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-xl font-semibold">{t('staff_table.no_staff')}</h3>
            <p className="text-muted-foreground">{t('staff_table.no_staff_desc')}</p>
        </div>
    );
  }

  return (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t('staff_table.name')}</TableHead>
                    <TableHead>{t('staff_table.email')}</TableHead>
                    <TableHead>{t('staff_table.phone')}</TableHead>
                    <TableHead>
                        <span className="sr-only">{t('staff_table.actions')}</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                        <TableCell className="font-medium">{staff.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{staff.email || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{staff.phone || '-'}</TableCell>
                        <TableCell className="text-right">
                            <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(staff)}>{t('staff_table.edit')}</DropdownMenuItem>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50">{t('staff_table.delete')}</DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('staff_table.delete_confirm_title')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('staff_table.delete_confirm_desc', { name: staff.full_name })}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('staff_table.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteMutation.mutate(staff.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            {t('staff_table.delete')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );
};
