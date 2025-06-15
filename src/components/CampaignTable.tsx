
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "./ui/use-toast";

type Campaign = Tables<'campaigns'>;

interface CampaignTableProps {
  onEdit: (campaign: Campaign) => void;
}

const triggerTypeLabels: Record<string, string> = {
    specific_datetime: "Specific Time",
    before_booking: "Before Booking",
    after_booking: "After Booking",
    after_last_booking: "After Last Booking"
};

export const CampaignTable = ({ onEdit }: CampaignTableProps) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
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
            toast({ title: "Campaign Deleted" });
        },
        onError: (error) => {
            toast({ title: "Error deleting campaign", description: error.message, variant: "destructive" });
        }
    });

    if (isLoading) return <div>Loading campaigns...</div>;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {campaigns?.map((campaign) => (
                    <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>
                            <Badge variant={campaign.is_active ? "default" : "secondary"}>
                                {campaign.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </TableCell>
                        <TableCell>{triggerTypeLabels[campaign.trigger_type] || campaign.trigger_type}</TableCell>
                        <TableCell className="uppercase">{campaign.communication_method}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onSelect={() => onEdit(campaign)}>Edit</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => deleteMutation.mutate(campaign.id)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
