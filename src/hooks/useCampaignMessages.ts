
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import type { Tables } from "@/integrations/supabase/types";

type CampaignMessage = Tables<'campaign_messages'>;
type MessageResponse = Tables<'message_responses'>;
type BookingModificationRequest = Tables<'booking_modification_requests'>;

export const useCampaignMessages = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getCampaignMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    const { data, error } = await supabase
      .from("campaign_messages")
      .select(`
        *,
        campaigns:campaign_id (*),
        bookings:booking_id (*),
        customers:customer_id (*)
      `)
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  const getMessageResponses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    const { data, error } = await supabase
      .from("message_responses")
      .select(`
        *,
        campaign_messages:campaign_message_id (
          *,
          campaigns:campaign_id (*),
          bookings:booking_id (*),
          customers:customer_id (*)
        )
      `)
      .order("responded_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  const getModificationRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    const { data, error } = await supabase
      .from("booking_modification_requests")
      .select(`
        *,
        bookings:original_booking_id (*),
        message_responses:message_response_id (*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  const processCampaignMessages = async () => {
    const { error } = await supabase.functions.invoke('process-campaign-messages');
    if (error) throw error;
  };

  const { data: campaignMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ['campaign-messages'],
    queryFn: getCampaignMessages
  });

  const { data: messageResponses, isLoading: responsesLoading } = useQuery({
    queryKey: ['message-responses'],
    queryFn: getMessageResponses
  });

  const { data: modificationRequests, isLoading: modificationsLoading } = useQuery({
    queryKey: ['modification-requests'],
    queryFn: getModificationRequests
  });

  const processMessagesMutation = useMutation({
    mutationFn: processCampaignMessages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-messages'] });
      toast({
        title: "Campaign Messages Processed",
        description: "Campaign messages have been processed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approveModificationMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('booking_modification_requests')
        .update({ 
          status: 'approved',
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modification-requests'] });
      toast({
        title: "Request Approved",
        description: "The modification request has been approved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectModificationMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('booking_modification_requests')
        .update({ 
          status: 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modification-requests'] });
      toast({
        title: "Request Rejected",
        description: "The modification request has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    campaignMessages,
    messageResponses,
    modificationRequests,
    isLoading: messagesLoading || responsesLoading || modificationsLoading,
    processMessages: processMessagesMutation.mutate,
    approveModification: approveModificationMutation.mutate,
    rejectModification: rejectModificationMutation.mutate,
    isProcessing: processMessagesMutation.isPending,
  };
};
