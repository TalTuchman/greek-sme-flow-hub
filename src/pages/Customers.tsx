
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

type Customer = Tables<'customers'>;

const CustomersPage = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Customers</h1>
                    <p className="text-muted-foreground">Manage your customer database.</p>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Customer
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
