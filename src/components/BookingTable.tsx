
import type { Tables } from "@/integrations/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export type BookingWithDetails = Tables<'bookings'> & {
  customers: { full_name: string } | null;
  services: { name: string } | null;
  staff_members: { full_name: string } | null;
};

interface BookingTableProps {
  bookings: BookingWithDetails[];
  onEdit: (booking: BookingWithDetails) => void;
}

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" | null | undefined } = {
    scheduled: "default",
    completed: "secondary",
    cancelled: "destructive"
}

export const BookingTable = ({ bookings, onEdit }: BookingTableProps) => {
  const { t } = useTranslation();

  const getStatusTranslation = (status: string) => {
    const key = `bookings.status_${status}`;
    const translated = t(key);
    // if translation not found, return original status
    return translated === key ? status : translated;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('bookings.table_title')}</CardTitle>
        <CardDescription>{t('bookings.table_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('bookings.col_customer')}</TableHead>
              <TableHead>{t('bookings.col_service')}</TableHead>
              <TableHead>{t('bookings.col_staff')}</TableHead>
              <TableHead>{t('bookings.col_datetime')}</TableHead>
              <TableHead>{t('bookings.col_status')}</TableHead>
              <TableHead><span className="sr-only">{t('bookings.col_actions')}</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.customers?.full_name || 'N/A'}</TableCell>
                  <TableCell>{booking.services?.name || 'N/A'}</TableCell>
                  <TableCell>{booking.staff_members?.full_name || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(booking.booking_time), "PPP p")}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[booking.status]}>{getStatusTranslation(booking.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => onEdit(booking)}>{t('bookings.edit_booking')}</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {t('bookings.no_bookings')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
