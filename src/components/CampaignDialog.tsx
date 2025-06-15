
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
import { useTranslation } from "react-i18next";

type Campaign = Tables<'campaigns'>;

interface CampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

export const CampaignDialog = ({ isOpen, onClose, campaign }: CampaignDialogProps) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const title = campaign ? t('campaigns.edit_campaign') : t('campaigns.add_new_campaign');

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
              <Button variant="outline">{t('campaigns.cancel')}</Button>
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
