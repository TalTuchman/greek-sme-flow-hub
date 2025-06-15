
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { serviceSchema, type ServiceFormValues } from "@/lib/schemas/serviceSchema";

type Service = Tables<'services'>;

interface ServiceFormProps {
  service: Service | null;
  onClose: () => void;
}

export const ServiceForm = ({ service, onClose }: ServiceFormProps) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: service?.name || "",
            description: service?.description || "",
            price: service?.price || null,
            duration: service?.duration || null,
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: ServiceFormValues) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            if (service) { // Update
                const serviceUpdate: TablesUpdate<'services'> = { ...values, updated_at: new Date().toISOString() };
                const { error } = await supabase.from('services').update(serviceUpdate).eq('id', service.id);
                if (error) throw error;
            } else { // Insert
                const serviceInsert: TablesInsert<'services'> = {
                    profile_id: user.id,
                    name: values.name,
                    description: values.description ?? null,
                    price: values.price ?? null,
                    duration: values.duration ?? null,
                };
                const { error } = await supabase.from('services').insert(serviceInsert);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast({
                title: service ? "Service Updated" : "Service Created",
                description: `The service "${form.getValues("name")}" has been saved successfully.`,
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

    function onSubmit(values: ServiceFormValues) {
        mutation.mutate(values);
    }
    
    React.useEffect(() => {
        if (service) {
            form.reset({
                name: service.name || "",
                description: service.description || "",
                price: service.price || null,
                duration: service.duration || null,
            });
        } else {
            form.reset({
                name: "",
                description: "",
                price: null,
                duration: null,
            });
        }
    }, [service, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 p-4 sm:p-0">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Haircut" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g. Standard men's haircut" {...field} value={field.value ?? ''}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="e.g. 25.00" {...field} value={field.value ?? ''}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g. 30" {...field} value={field.value ?? ''}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="sm:hidden" /> 
                <div className="hidden sm:flex sm:justify-end sm:gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Saving..." : "Save Service"}
                    </Button>
                </div>
                <Button type="submit" className="sm:hidden" disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving..." : "Save Service"}
                </Button>
            </form>
        </Form>
    );
};
