
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useMobile } from "@/hooks/use-mobile";

type Service = Tables<'services'>;

const serviceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number.").optional().nullable(),
  duration: z.coerce.number().min(0, "Duration must be a positive integer.").int().optional().nullable(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

export const ServiceDialog = ({ isOpen, onClose, service }: ServiceDialogProps) => {
  const isMobile = useMobile();

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{service ? "Edit Service" : "Add New Service"}</DrawerTitle>
          </DrawerHeader>
          <ServiceForm service={service} onClose={onClose} />
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Add New Service"}</DialogTitle>
        </DialogHeader>
        <ServiceForm service={service} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};


const ServiceForm = ({ service, onClose }: { service: Service | null, onClose: () => void }) => {
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
                const serviceInsert: TablesInsert<'services'> = { ...values, profile_id: user.id };
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
    
    // Reset form when service changes
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
