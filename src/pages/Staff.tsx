
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import * as React from "react";
import { StaffTable } from "@/components/StaffTable";
import { StaffDialog } from "@/components/StaffDialog";
import { useTranslation } from "react-i18next";

type StaffMember = Tables<'staff_members'>;

const StaffPage = () => {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingStaff, setEditingStaff] = React.useState<StaffMember | null>(null);
    const { t } = useTranslation();

    const getStaff = async () => {
        const { data, error } = await supabase.from('staff_members').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    };

    const { data: staffMembers, isLoading, error } = useQuery<StaffMember[]>({
        queryKey: ['staff_members'],
        queryFn: getStaff
    });

    const handleEdit = (staff: StaffMember) => {
        setEditingStaff(staff);
        setIsDialogOpen(true);
    };
    
    const handleAddNew = () => {
        setEditingStaff(null);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingStaff(null);
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">{t('staff.title')}</h1>
                    <p className="text-muted-foreground">{t('staff.description')}</p>
                </div>
                <Button onClick={handleAddNew} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('staff.add_staff')}
                </Button>
            </div>
            
            {isLoading && <Skeleton className="h-96 w-full rounded-md border" />}
            {error && <div className="text-red-500 rounded-md border p-4">Error: {error.message}</div>}
            {staffMembers && <StaffTable staffMembers={staffMembers} onEdit={handleEdit} />}

            <StaffDialog 
                isOpen={isDialogOpen} 
                onClose={handleDialogClose}
                staffMember={editingStaff}
            />
        </DashboardLayout>
    );
};

export default StaffPage;
