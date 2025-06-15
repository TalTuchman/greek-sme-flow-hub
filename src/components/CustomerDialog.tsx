
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type Customer = Tables<'customers'>;

interface CustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export const CustomerDialog = ({ isOpen, onClose, customer }: CustomerDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  
  const isEditMode = customer !== null;

  useEffect(() => {
    if (isOpen) {
        if (customer) {
            setFullName(customer.full_name);
            setEmail(customer.email || "");
            setPhone(customer.phone || "");
            setNotes(customer.notes || "");
            setGender(customer.gender || null);
        } else {
            setFullName("");
            setEmail("");
            setPhone("");
            setNotes("");
            setGender(null);
        }
    }
  }, [customer, isOpen]);

  const mutation = useMutation({
    mutationFn: async (customerData: TablesInsert<'customers'> | TablesUpdate<'customers'>) => {
        if (isEditMode) {
            const { error } = await supabase.from('customers').update(customerData).eq('id', customer.id);
            if (error) throw error;
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");
            const insertData = { ...customerData, profile_id: user.id };
            const { error } = await supabase.from('customers').insert(insertData as TablesInsert<'customers'>);
            if (error) throw error;
        }
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        toast({ title: isEditMode ? t('customers.toast_update_success') : t('customers.toast_create_success') });
        onClose();
    },
    onError: (error) => {
        toast({ title: isEditMode ? t('customers.toast_error_update_title') : t('customers.toast_error_title'), description: error.message, variant: "destructive" });
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
          gender: gender || null,
          updated_at: new Date().toISOString()
      };
    } else {
      customerData = {
          full_name: fullName,
          email,
          phone,
          notes,
          gender: gender || null,
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
          <DialogTitle>{isEditMode ? t('customers.edit_customer') : t('customers.add_new_customer')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('customers.edit_description') : t('customers.add_description')}
          </DialogDescription>
        </DialogHeader>
        <form id="customer-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fullName" className="text-right">{t('customers.full_name')}</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">{t('customers.email')}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">{t('customers.phone')}</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">{t('customers.gender')}</Label>
              <Select value={gender || ""} onValueChange={(value) => setGender(value === "" ? null : value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('customers.select_gender')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Man">{t('customers.man')}</SelectItem>
                  <SelectItem value="Woman">{t('customers.woman')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">{t('customers.notes')}</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3" />
            </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="customer-form" disabled={mutation.isPending}>
            {mutation.isPending ? t('customers.saving') : t('customers.save_changes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
