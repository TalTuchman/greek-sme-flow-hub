
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
import type { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { StaffForm } from "./StaffForm";
import { useTranslation } from "react-i18next";

type StaffMember = Tables<'staff_members'>;

interface StaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staffMember: StaffMember | null;
}

export const StaffDialog = ({ isOpen, onClose, staffMember }: StaffDialogProps) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const title = staffMember ? t('staff.edit_staff') : t('staff.add_new_staff');

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <StaffForm staffMember={staffMember} onClose={onClose} />
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">{t('staff.cancel')}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <StaffForm staffMember={staffMember} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
