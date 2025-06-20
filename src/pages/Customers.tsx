
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CustomerTable } from "@/components/CustomerTable";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CustomerDialog } from "@/components/CustomerDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

type Customer = Tables<'customers'>;

const CustomersPage = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const { t } = useTranslation();

    const getCustomers = async () => {
        const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    };

    const { data: customers, isLoading, error } = useQuery<Customer[]>({
        queryKey: ['customers'],
        queryFn: getCustomers
    });

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsDialogOpen(true);
    };
    
    const handleAddNew = () => {
        setEditingCustomer(null);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingCustomer(null);
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">{t('customers.title')}</h1>
                    <p className="text-muted-foreground">{t('customers.description')}</p>
                </div>
                <Button onClick={handleAddNew} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('customers.add_customer')}
                </Button>
            </div>
            
            {isLoading && <Skeleton className="h-96 w-full rounded-md border" />}
            {error && <div className="text-red-500 rounded-md border p-4">Error: {error.message}</div>}
            {customers && <CustomerTable customers={customers} onEdit={handleEdit} />}

            <CustomerDialog 
                isOpen={isDialogOpen} 
                onClose={handleDialogClose}
                customer={editingCustomer}
            />
        </DashboardLayout>
    );
};

export default CustomersPage;
