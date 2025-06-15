
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

type StaffMember = Tables<'staff_members'>;

interface StaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staffMember: StaffMember | null;
}

export const StaffDialog = ({ isOpen, onClose, staffMember }: StaffDialogProps) => {
  const isMobile = useIsMobile();
  const title = staffMember ? "Edit Staff Member" : "Add New Staff Member";

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
              <Button variant="outline">Cancel</Button>
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
