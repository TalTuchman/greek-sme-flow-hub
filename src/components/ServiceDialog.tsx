
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
import { ServiceForm } from "./ServiceForm";

type Service = Tables<'services'>;

interface ServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

export const ServiceDialog = ({ isOpen, onClose, service }: ServiceDialogProps) => {
  const isMobile = useIsMobile();

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
