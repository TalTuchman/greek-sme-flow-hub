
import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import type { BookingWithDetails } from './BookingTable';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { format } from 'date-fns';

interface BookingCalendarProps {
    bookings: BookingWithDetails[];
    onEdit: (booking: BookingWithDetails) => void;
}

export const BookingCalendar = ({ bookings, onEdit }: BookingCalendarProps) => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    const bookingsByDay = React.useMemo(() => {
        return bookings.reduce((acc, booking) => {
            const day = format(new Date(booking.booking_time), 'yyyy-MM-dd');
            if (!acc[day]) {
                acc[day] = [];
            }
            acc[day].push(booking);
            return acc;
        }, {} as Record<string, BookingWithDetails[]>);
    }, [bookings]);

    const selectedDayStr = date ? format(date, 'yyyy-MM-dd') : '';
    const selectedDayBookings = bookingsByDay[selectedDayStr] || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 flex justify-center">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                />
            </Card>
            <div className="space-y-4">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Bookings for {date ? format(date, 'PPP') : 'selected date'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {selectedDayBookings.length > 0 ? selectedDayBookings.sort((a,b) => new Date(a.booking_time).getTime() - new Date(b.booking_time).getTime()).map(booking => (
                             <div key={booking.id} className="border p-3 rounded-md hover:bg-muted/50" >
                                <p className="font-semibold">{booking.services?.name}</p>
                                <p className="text-sm text-muted-foreground">{booking.customers?.full_name}</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">{format(new Date(booking.booking_time), 'p')}</p>
                                    <Button variant="ghost" size="sm" onClick={() => onEdit(booking)}>Edit</Button>
                                </div>
                                {booking.staff_members?.full_name && <Badge variant="outline" className="mt-1">{booking.staff_members.full_name}</Badge>}
                             </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No bookings for this day.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
