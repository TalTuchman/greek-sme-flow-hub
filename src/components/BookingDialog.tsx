
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
import { BookingForm } from "./BookingForm";
import { useTranslation } from "react-i18next";

type Booking = Tables<'bookings'>;

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const BookingDialog = ({ isOpen, onClose, booking }: BookingDialogProps) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const title = booking ? t('bookings.edit_booking') : t('bookings.add_new_booking');

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <BookingForm booking={booking} onClose={onClose} />
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">{t('bookings.cancel')}</Button>
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
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <BookingForm booking={booking} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
