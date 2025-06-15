
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { campaignFormSchema, type CampaignFormValues } from "@/lib/schemas/campaignSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "./ui/switch";

type Campaign = Tables<'campaigns'>;

interface CampaignFormProps {
  campaign: Campaign | null;
  onClose: () => void;
}

export const CampaignForm = ({ campaign, onClose }: CampaignFormProps) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const form = useForm<CampaignFormValues>({
        resolver: zodResolver(campaignFormSchema),
        defaultValues: {
            name: campaign?.name || "",
            communication_method: campaign?.communication_method || "sms",
            message: campaign?.message || "",
            is_active: campaign?.is_active ?? true,
            trigger_type: campaign?.trigger_type || "specific_datetime",
            specific_datetime_value: campaign && campaign.trigger_type === 'specific_datetime' && campaign.trigger_config && typeof campaign.trigger_config === 'object' && 'datetime' in campaign.trigger_config ? new Date((campaign.trigger_config as any).datetime as string).toISOString().substring(0, 16) : "",
            relative_days_value: campaign && campaign.trigger_type !== 'specific_datetime' && campaign.trigger_config && typeof campaign.trigger_config === 'object' && 'days' in campaign.trigger_config ? (campaign.trigger_config as any).days as number : undefined,
            send_time: campaign?.send_time || "",
        },
    });
    
    const triggerType = form.watch("trigger_type");

    const mutation = useMutation({
        mutationFn: async (values: CampaignFormValues) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            let trigger_config = {};
            if (values.trigger_type === 'specific_datetime') {
                trigger_config = { datetime: new Date(values.specific_datetime_value!).toISOString() };
            } else {
                trigger_config = { days: values.relative_days_value };
            }

            const campaignData = {
                profile_id: user.id,
                name: values.name,
                communication_method: values.communication_method,
                message: values.message,
                is_active: values.is_active,
                trigger_type: values.trigger_type,
                trigger_config,
                send_time: values.send_time || null,
            };

            if (campaign) { // Update
                const campaignUpdate: TablesUpdate<'campaigns'> = { ...campaignData, updated_at: new Date().toISOString() };
                const { error } = await supabase.from('campaigns').update(campaignUpdate).eq('id', campaign.id);
                if (error) throw error;
            } else { // Insert
                const campaignInsert: TablesInsert<'campaigns'> = campaignData;
                const { error } = await supabase.from('campaigns').insert(campaignInsert);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast({
                title: campaign ? "Campaign Updated" : "Campaign Created",
                description: "The campaign has been saved successfully.",
            });
            onClose();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    function onSubmit(values: CampaignFormValues) {
        mutation.mutate(values);
    }
    
    React.useEffect(() => {
        form.reset({
            name: campaign?.name || "",
            communication_method: campaign?.communication_method || "sms",
            message: campaign?.message || "",
            is_active: campaign?.is_active ?? true,
            trigger_type: campaign?.trigger_type || "specific_datetime",
            specific_datetime_value: campaign && campaign.trigger_type === 'specific_datetime' && campaign.trigger_config && typeof campaign.trigger_config === 'object' && 'datetime' in campaign.trigger_config ? new Date((campaign.trigger_config as any).datetime as string).toISOString().substring(0, 16) : "",
            relative_days_value: campaign && campaign.trigger_type !== 'specific_datetime' && campaign.trigger_config && typeof campaign.trigger_config === 'object' && 'days' in campaign.trigger_config ? (campaign.trigger_config as any).days as number : undefined,
            send_time: campaign?.send_time || "",
        });
    }, [campaign, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 p-4 sm:p-0">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Campaign Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Birthday Promo" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="trigger_type" render={({ field }) => (
                    <FormItem>
                        <FormLabel>When to send?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a trigger" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="specific_datetime">Specific date and time</SelectItem>
                                <SelectItem value="before_booking">Days before a booking</SelectItem>
                                <SelectItem value="after_booking">Days after a booking</SelectItem>
                                <SelectItem value="after_last_booking">Days after customer's last booking</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />

                {triggerType === 'specific_datetime' && (
                    <FormField control={form.control} name="specific_datetime_value" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date and Time</FormLabel>
                            <FormControl><Input type="datetime-local" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                )}

                {['before_booking', 'after_booking', 'after_last_booking'].includes(triggerType) && (
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="relative_days_value" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Days</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g., 3" {...field} onChange={event => field.onChange(+event.target.value)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="send_time" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time of day</FormLabel>
                                <FormControl><Input type="time" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                )}
                
                <FormField control={form.control} name="communication_method" render={({ field }) => (
                     <FormItem>
                        <FormLabel>How to send?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a method" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="sms">SMS</SelectItem>
                                <SelectItem value="viber">Viber</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl><Textarea placeholder="Enter your campaign message here..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                
                <FormField control={form.control} name="is_active" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Activate Campaign</FormLabel>
                            <FormDescription>
                                When active, this campaign will send messages automatically.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )} />

                <div className="sm:hidden" /> 
                <div className="hidden sm:flex sm:justify-end sm:gap-2">
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Saving..." : "Save Campaign"}
                    </Button>
                </div>
                <Button type="submit" className="sm:hidden" disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving..." : "Save Campaign"}
                </Button>
            </form>
        </Form>
    );
};
