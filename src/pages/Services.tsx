
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ServiceTable } from "@/components/ServiceTable";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ServiceDialog } from "@/components/ServiceDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

type Service = Tables<'services'>;

const ServicesPage = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const { t } = useTranslation();

    const getServices = async () => {
        const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    };

    const { data: services, isLoading, error } = useQuery<Service[]>({
        queryKey: ['services'],
        queryFn: getServices
    });

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setIsDialogOpen(true);
    };
    
    const handleAddNew = () => {
        setEditingService(null);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">{t('services.title')}</h1>
                    <p className="text-muted-foreground">{t('services.description')}</p>
                </div>
                <Button onClick={handleAddNew} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('services.add_service')}
                </Button>
            </div>
            
            {isLoading && <Skeleton className="h-96 w-full rounded-md border" />}
            {error && <div className="text-red-500 rounded-md border p-4">{t('services.toast_error_title')}: {error.message}</div>}
            {services && <ServiceTable services={services} onEdit={handleEdit} />}

            <ServiceDialog 
                isOpen={isDialogOpen} 
                onClose={handleDialogClose}
                service={editingService}
            />
        </DashboardLayout>
    );
};

export default ServicesPage;
