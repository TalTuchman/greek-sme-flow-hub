
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Customer = Tables<'customers'>;

interface CustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export const CustomerDialog = ({ isOpen, onClose, customer }: CustomerDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  
  const isEditMode = customer !== null;

  useEffect(() => {
    if (isOpen) {
        if (customer) {
            setFullName(customer.full_name);
            setEmail(customer.email || "");
            setPhone(customer.phone || "");
            setNotes(customer.notes || "");
        } else {
            setFullName("");
            setEmail("");
            setPhone("");
            setNotes("");
        }
    }
  }, [customer, isOpen]);

  const mutation = useMutation({
    mutationFn: async (customerData: TablesInsert<'customers'> | TablesUpdate<'customers'>) => {
        if (isEditMode) {
            const { error } = await supabase.from('customers').update(customerData).eq('id', customer.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('customers').insert(customerData as TablesInsert<'customers'>);
            if (error) throw error;
        }
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        toast({ title: `Customer ${isEditMode ? 'updated' : 'added'} successfully!` });
        onClose();
    },
    onError: (error) => {
        toast({ title: `Error ${isEditMode ? 'updating' : 'adding'} customer`, description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let customerData;
    if (isEditMode) {
      customerData = {
          full_name: fullName,
          email,
          phone,
          notes,
          updated_at: new Date().toISOString()
      };
    } else {
      customerData = {
          full_name: fullName,
          email,
          phone,
          notes
      };
    }
    
    mutation.mutate(customerData);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details for this customer." : "Fill in the details for the new customer."}
          </DialogDescription>
        </DialogHeader>
        <form id="customer-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fullName" className="text-right">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3" />
            </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="customer-form" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
