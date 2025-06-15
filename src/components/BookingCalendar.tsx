
import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import type { BookingWithDetails } from './BookingTable';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { format, parse } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface BookingCalendarProps {
    bookings: BookingWithDetails[];
    onEdit: (booking: BookingWithDetails) => void;
}

export const BookingCalendar = ({ bookings, onEdit }: BookingCalendarProps) => {
    const { t } = useTranslation();
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

    const bookedDays = React.useMemo(() => {
        return Object.keys(bookingsByDay).map(dayStr => parse(dayStr, 'yyyy-MM-dd', new Date()));
    }, [bookingsByDay]);

    const selectedDayStr = date ? format(date, 'yyyy-MM-dd') : '';
    const selectedDayBookings = bookingsByDay[selectedDayStr] || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    modifiers={{ booked: bookedDays }}
                    modifiersClassNames={{
                        booked: 'has-booking',
                    }}
                />
            </Card>
            <div className="space-y-4">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {date ? t('bookings.calendar_title', { date: format(date, 'PPP') }) : t('bookings.calendar_title_placeholder')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {selectedDayBookings.length > 0 ? selectedDayBookings.sort((a,b) => new Date(a.booking_time).getTime() - new Date(b.booking_time).getTime()).map(booking => (
                             <div key={booking.id} className="border p-3 rounded-md hover:bg-muted/50 transition-colors" >
                                <p className="font-semibold">{booking.services?.name}</p>
                                <p className="text-sm text-muted-foreground">{booking.customers?.full_name}</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">{format(new Date(booking.booking_time), 'p')}</p>
                                    <Button variant="ghost" size="sm" onClick={() => onEdit(booking)}>{t('bookings.edit_booking')}</Button>
                                </div>
                                {booking.staff_members?.full_name && <Badge variant="outline" className="mt-1">{booking.staff_members.full_name}</Badge>}
                             </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-4">{t('bookings.no_bookings_for_day')}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
