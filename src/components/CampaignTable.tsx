
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Send } from "lucide-react";
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
import { SendCampaignDialog } from "./SendCampaignDialog";
import * as React from "react";

type Campaign = Tables<'campaigns'>;

interface CampaignTableProps {
  onEdit: (campaign: Campaign) => void;
}

const triggerTypeLabels: Record<string, string> = {
    specific_datetime: "campaigns.trigger_specific_datetime",
    before_booking: "campaigns.trigger_before_booking",
    after_booking: "campaigns.trigger_after_booking",
    after_last_booking: "campaigns.trigger_after_last_booking"
};

export const CampaignTable = ({ onEdit }: CampaignTableProps) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const [sendDialogOpen, setSendDialogOpen] = React.useState(false);
    const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign | null>(null);
    
    const { data: campaigns, isLoading } = useQuery<Campaign[]>({
        queryKey: ['campaigns'],
        queryFn: async () => {
            const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('campaigns').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast({ title: t('campaigns.toast_delete_success') });
        },
        onError: (error) => {
            toast({ title: t('bookings.toast_error_title'), description: error.message, variant: "destructive" });
        }
    });

    const handleSendCampaign = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setSendDialogOpen(true);
    };

    const handleCloseSendDialog = () => {
        setSendDialogOpen(false);
        setSelectedCampaign(null);
    };

    if (isLoading) return <div>{t('services.loading')}</div>;

    if (isMobile) {
        return (
            <>
                <div className="space-y-3">
                    {campaigns?.map((campaign) => (
                        <MobileCard key={campaign.id}>
                            <MobileCardRow 
                                label={t('campaigns.table_name')} 
                                value={campaign.name} 
                            />
                            <MobileCardRow 
                                label={t('campaigns.table_status')} 
                                value={
                                    <Badge variant={campaign.is_active ? "default" : "secondary"}>
                                        {campaign.is_active ? t('campaigns.status_active') : t('campaigns.status_inactive')}
                                    </Badge>
                                } 
                            />
                            <MobileCardRow 
                                label={t('campaigns.table_trigger')} 
                                value={t(triggerTypeLabels[campaign.trigger_type] || campaign.trigger_type)} 
                            />
                            <MobileCardRow 
                                label={t('campaigns.table_method')} 
                                value={<span className="uppercase">{campaign.communication_method}</span>} 
                            />
                            <MobileCardActions>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleSendCampaign(campaign)}
                                    className="flex-1"
                                >
                                    <Send className="mr-1 h-3 w-3" />
                                    Send
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => onEdit(campaign)}
                                    className="flex-1"
                                >
                                    {t('campaigns.edit_campaign')}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => deleteMutation.mutate(campaign.id)}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1"
                                >
                                    {t('services.delete_button')}
                                </Button>
                            </MobileCardActions>
                        </MobileCard>
                    ))}
                </div>
                <SendCampaignDialog
                    isOpen={sendDialogOpen}
                    onClose={handleCloseSendDialog}
                    campaign={selectedCampaign}
                />
            </>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('campaigns.table_name')}</TableHead>
                        <TableHead>{t('campaigns.table_status')}</TableHead>
                        <TableHead>{t('campaigns.table_trigger')}</TableHead>
                        <TableHead>{t('campaigns.table_method')}</TableHead>
                        <TableHead><span className="sr-only">{t('campaigns.table_actions')}</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {campaigns?.map((campaign) => (
                        <TableRow key={campaign.id}>
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell>
                                <Badge variant={campaign.is_active ? "default" : "secondary"}>
                                    {campaign.is_active ? t('campaigns.status_active') : t('campaigns.status_inactive')}
                                </Badge>
                            </TableCell>
                            <TableCell>{t(triggerTypeLabels[campaign.trigger_type] || campaign.trigger_type)}</TableCell>
                            <TableCell className="uppercase">{campaign.communication_method}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSendCampaign(campaign)}
                                    >
                                        <Send className="mr-1 h-3 w-3" />
                                        Send
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>{t('campaigns.table_actions')}</DropdownMenuLabel>
                                            <DropdownMenuItem onSelect={() => onEdit(campaign)}>{t('campaigns.edit_campaign')}</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => deleteMutation.mutate(campaign.id)}>{t('services.delete_button')}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <SendCampaignDialog
                isOpen={sendDialogOpen}
                onClose={handleCloseSendDialog}
                campaign={selectedCampaign}
            />
        </>
    );
};
