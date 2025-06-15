
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
import { CampaignForm } from "./CampaignForm";

type Campaign = Tables<'campaigns'>;

interface CampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

export const CampaignDialog = ({ isOpen, onClose, campaign }: CampaignDialogProps) => {
  const isMobile = useIsMobile();
  const title = campaign ? "Edit Campaign" : "Add New Campaign";

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <CampaignForm campaign={campaign} onClose={onClose} />
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <CampaignForm campaign={campaign} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
