
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
import { MoreHorizontal, Edit, Trash } from "lucide-react";
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
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCard, MobileCardRow, MobileCardActions } from "@/components/ui/mobile-card";

type Service = Tables<'services'>;

interface ServiceTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
}

export const ServiceTable = ({ services, onEdit }: ServiceTableProps) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { t } = useTranslation();
    const isMobile = useIsMobile();

    const deleteMutation = useMutation({
        mutationFn: async (serviceId: string) => {
            const { error } = await supabase.from('services').delete().eq('id', serviceId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast({
                title: t('services.toast_delete_success'),
                description: t('services.toast_delete_desc'),
            });
        },
        onError: (error) => {
            toast({
                title: t('services.toast_delete_error_title'),
                description: error.message,
                variant: "destructive",
            });
        },
    });

  if (services.length === 0) {
    return (
        <Card className="p-8 text-center">
            <h3 className="text-xl font-semibold">{t('services.no_services_found')}</h3>
            <p className="text-muted-foreground">{t('services.no_services_desc')}</p>
        </Card>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        {services.map((service) => (
          <MobileCard key={service.id}>
            <MobileCardRow 
              label={t('services.table_name')} 
              value={service.name} 
            />
            <MobileCardRow 
              label={t('services.table_description')} 
              value={service.description || 'N/A'} 
            />
            <MobileCardRow 
              label={t('services.table_price')} 
              value={service.price ? `$${Number(service.price).toFixed(2)}` : 'N/A'} 
            />
            <MobileCardRow 
              label={t('services.table_duration')} 
              value={service.duration ? `${service.duration} min` : 'N/A'} 
            />
            <MobileCardActions>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(service)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                {t('services.edit_service')}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={deleteMutation.isPending}
                    className="flex-1"
                  >
                    <Trash className="h-4 w-4 mr-2 text-destructive" />
                    {t('services.delete_button')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('services.delete_dialog_title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('services.delete_dialog_desc', { serviceName: service.name })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('services.cancel')}</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteMutation.mutate(service.id)} 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? 'Deleting...' : t('services.delete_button')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </MobileCardActions>
          </MobileCard>
        ))}
      </div>
    );
  }

  return (
    <Card>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t('services.table_name')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('services.table_description')}</TableHead>
                    <TableHead className="text-right">{t('services.table_price')}</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">{t('services.table_duration')}</TableHead>
                    <TableHead>
                        <span className="sr-only">{t('services.table_actions')}</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {services.map((service) => (
                    <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground hidden md:table-cell">{service.description}</TableCell>
                        <TableCell className="text-right">{service.price ? `$${Number(service.price).toFixed(2)}` : '-'}</TableCell>
                        <TableCell className="text-right hidden sm:table-cell">{service.duration || '-'}</TableCell>
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
                                        <DropdownMenuItem onClick={() => onEdit(service)}>{t('services.edit_service')}</DropdownMenuItem>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50">{t('services.delete_button')}</DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('services.delete_dialog_title')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('services.delete_dialog_desc', { serviceName: service.name })}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('services.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteMutation.mutate(service.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            {t('services.delete_button')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Card>
  );
};
