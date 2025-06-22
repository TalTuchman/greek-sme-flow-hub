
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Send } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Tables } from "@/integrations/supabase/types";

type Campaign = Tables<'campaigns'>;
type Customer = Tables<'customers'>;

const sendCampaignSchema = z.object({
  target_type: z.enum(["single_customer", "all_customers"]),
  customer_id: z.string().optional(),
  send_immediately: z.boolean().default(true),
  scheduled_date: z.date().optional(),
  scheduled_time: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.target_type === "single_customer" && !data.customer_id) {
    return false;
  }
  if (!data.send_immediately && (!data.scheduled_date || !data.scheduled_time)) {
    return false;
  }
  return true;
}, {
  message: "Please complete all required fields",
});

type SendCampaignFormValues = z.infer<typeof sendCampaignSchema>;

interface SendCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

export const SendCampaignDialog = ({ isOpen, onClose, campaign }: SendCampaignDialogProps) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SendCampaignFormValues>({
    resolver: zodResolver(sendCampaignSchema),
    defaultValues: {
      target_type: "all_customers",
      send_immediately: true,
    },
  });

  const getCustomers = async () => {
    const { data, error } = await supabase.from('customers').select('*').order('full_name');
    if (error) throw error;
    return data;
  };

  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: getCustomers
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (values: SendCampaignFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !campaign) throw new Error("User not authenticated or campaign not found");

      let scheduledSendTime = null;
      if (!values.send_immediately && values.scheduled_date && values.scheduled_time) {
        const [hours, minutes] = values.scheduled_time.split(':');
        const scheduledDate = new Date(values.scheduled_date);
        scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        scheduledSendTime = scheduledDate.toISOString();
      }

      const { error } = await supabase.from('manual_campaign_sends').insert({
        profile_id: user.id,
        campaign_id: campaign.id,
        target_type: values.target_type,
        customer_id: values.target_type === "single_customer" ? values.customer_id : null,
        send_immediately: values.send_immediately,
        scheduled_send_time: scheduledSendTime,
        notes: values.notes,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Campaign Send Scheduled",
        description: form.getValues("send_immediately") 
          ? "The campaign will be processed shortly." 
          : "The campaign has been scheduled successfully.",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: SendCampaignFormValues) => {
    sendCampaignMutation.mutate(values);
  };

  const DialogContent_Component = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 sm:p-0">
        <FormField
          control={form.control}
          name="target_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Send To</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all_customers">All Customers</SelectItem>
                  <SelectItem value="single_customer">Specific Customer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("target_type") === "single_customer" && (
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="send_immediately"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Send Immediately</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Send the campaign right away
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!form.watch("send_immediately") && (
          <>
            <FormField
              control={form.control}
              name="scheduled_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Schedule Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Add any notes about this send..."
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={sendCampaignMutation.isPending}>
            <Send className="mr-2 h-4 w-4" />
            {sendCampaignMutation.isPending 
              ? "Scheduling..." 
              : form.watch("send_immediately") 
                ? "Send Now" 
                : "Schedule Send"
            }
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Send {campaign?.name}</DrawerTitle>
          </DrawerHeader>
          {DialogContent_Component}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send {campaign?.name}</DialogTitle>
        </DialogHeader>
        {DialogContent_Component}
      </DialogContent>
    </Dialog>
  );
};
