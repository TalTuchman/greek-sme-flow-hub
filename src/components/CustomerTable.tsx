
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";
import { Edit, Trash } from "lucide-react";
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
} from "@/components/ui/alert-dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

type Customer = Tables<'customers'>;

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
}

export const CustomerTable = ({ customers, onEdit }: CustomerTableProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', customerId);
      if (error) throw error;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        toast({ title: t('customers.toast_delete_success') });
    },
    onError: (error) => {
        toast({ title: t('customers.toast_delete_error_title'), description: error.message, variant: "destructive" });
    }
  });

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('customers.table_full_name')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('customers.table_email')}</TableHead>
            <TableHead className="hidden sm:table-cell">{t('customers.table_phone')}</TableHead>
            <TableHead className="text-right">{t('customers.table_actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                    {t('customers.no_customers')}
                </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.full_name}</TableCell>
                <TableCell className="hidden md:table-cell">{customer.email || 'N/A'}</TableCell>
                <TableCell className="hidden sm:table-cell">{customer.phone || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(customer)} className="mr-2">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={deleteCustomerMutation.isPending}>
                          <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>{t('customers.delete_dialog_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('customers.delete_dialog_desc')}
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>{t('customers.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteCustomerMutation.mutate(customer.id)} disabled={deleteCustomerMutation.isPending}>
                            {deleteCustomerMutation.isPending ? t('customers.deleting') : t('customers.delete')}
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
