
import * as React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BookingTable } from "@/components/BookingTable";
import { BookingCalendar } from "@/components/BookingCalendar";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Table } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingDialog } from "@/components/BookingDialog";
import { BookingStatusFilter } from "@/components/BookingStatusFilter";
import type { Tables, Database } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type Booking = Tables<'bookings'>;
type BookingStatus = Database["public"]["Enums"]["booking_status"];

const BookingsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | "all">("scheduled");
  const { t } = useTranslation();

  const handleOpenDialog = (booking: Booking | null = null) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedBooking(null);
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('bookings.title')}</h1>
          <p className="text-muted-foreground">{t('bookings.description')}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <BookingStatusFilter value={statusFilter} onChange={setStatusFilter} />
          <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t('bookings.add_booking')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Table
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="mt-4">
          <BookingCalendar onEdit={handleOpenDialog} statusFilter={statusFilter} />
        </TabsContent>
        
        <TabsContent value="table" className="mt-4">
          <BookingTable onEdit={handleOpenDialog} statusFilter={statusFilter} />
        </TabsContent>
      </Tabs>

      <BookingDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        booking={selectedBooking}
      />
    </DashboardLayout>
  );
};

export default BookingsPage;
