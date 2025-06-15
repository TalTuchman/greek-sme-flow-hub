
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

export type BookingWithDetails = Tables<'bookings'> & {
  customers: { full_name: string } | null;
  services: { name: string } | null;
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>A list of all your bookings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.customers?.full_name || 'N/A'}</TableCell>
                  <TableCell>{booking.services?.name || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(booking.booking_time), "PPP p")}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[booking.status]}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => onEdit(booking)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
