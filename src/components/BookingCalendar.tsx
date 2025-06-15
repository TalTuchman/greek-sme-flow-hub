
import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import type { BookingWithDetails } from './BookingTable';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { format, parse, isSameDay } from 'date-fns';
import { useTranslation } from 'react-i18next';

// For assigning colors (limited palette for staff members)
const staffColors = [
  "bg-blue-500 text-white",
  "bg-pink-500 text-white",
  "bg-green-500 text-white",
  "bg-yellow-500 text-black",
  "bg-purple-500 text-white",
  "bg-orange-500 text-white",
  "bg-cyan-500 text-black",
  "bg-rose-500 text-white",
];

function getStaffColor(staffId: string | undefined, staffIds: string[]): string {
  if (!staffId) return "bg-gray-400 text-white";
  const idx = staffIds.indexOf(staffId);
  return staffColors[idx % staffColors.length] || "bg-gray-400 text-white";
}

interface BookingCalendarProps {
    bookings: BookingWithDetails[];
    onEdit: (booking: BookingWithDetails) => void;
}

export const BookingCalendar = ({ bookings, onEdit }: BookingCalendarProps) => {
    const { t } = useTranslation();
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    // Build staff id map for color assignment
    const staffIds = React.useMemo(
        () => Array.from(
            new Set(bookings.map(b => b.staff_id).filter(Boolean) as string[])
        ),
        [bookings]
    );

    // Group bookings by day string
    const bookingsByDay = React.useMemo(() => {
        return bookings.reduce((acc, booking) => {
            const day = format(new Date(booking.booking_time), 'yyyy-MM-dd');
            if (!acc[day]) acc[day] = [];
            acc[day].push(booking);
            return acc;
        }, {} as Record<string, BookingWithDetails[]>);
    }, [bookings]);

    // For pre-selecting/marking days with bookings (not used for dot anymore, kept for possible highlight)
    const bookedDays = React.useMemo(() => {
        return Object.keys(bookingsByDay).map(dayStr =>
            parse(dayStr, 'yyyy-MM-dd', new Date())
        );
    }, [bookingsByDay]);

    // Calendar will call this render function to customize each day cell
    const renderDay = (day: Date) => {
        const dayString = format(day, "yyyy-MM-dd");
        const bookingsForDay = bookingsByDay[dayString] || [];

        return (
            <div className="flex flex-col items-center gap-1 min-h-[70px]">
                <span className="text-xs font-medium">{day.getDate()}</span>
                <div className="flex flex-col w-full gap-1">
                    {bookingsForDay.length > 0 ? bookingsForDay.map((booking) => {
                        const col = getStaffColor(booking.staff_id, staffIds);
                        return (
                            <button
                                key={booking.id}
                                className={`booking-chip w-full ${col} rounded px-1 py-0.5 text-xs flex justify-between items-center outline-none ring-2 ring-transparent hover:ring-primary transition`}
                                onClick={e => {
                                  e.stopPropagation();
                                  onEdit(booking);
                                }}
                                tabIndex={-1}
                                title={`${booking.services?.name || ""} · ${booking.staff_members?.full_name || ""}`}
                                type="button"
                            >
                                <span className="truncate">{booking.services?.name || ""}</span>
                                {booking.staff_members?.full_name && (
                                    <span className="pl-1 truncate opacity-80 text-[11px]">
                                      {booking.staff_members.full_name}
                                    </span>
                                )}
                            </button>
                        )
                    }) : null}
                </div>
            </div>
        );
    };

    const selectedDayStr = date ? format(date, 'yyyy-MM-dd') : '';
    const selectedDayBookings = bookingsByDay[selectedDayStr] || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
                 <div className="p-4 flex justify-center w-full">
                  <div className="w-full max-w-4xl">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        modifiers={{ booked: bookedDays }}
                        modifiersClassNames={{ booked: 'has-booking' }}
                        // Custom Day cell rendering
                        render={renderDay}
                        className="custom-booking-calendar"
                    />
                  </div>
                </div>
            </Card>
            <div className="space-y-4">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {date ? t('bookings.calendar_title', { date: format(date, 'PPP') }) : t('bookings.calendar_title_placeholder')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {selectedDayBookings.length > 0 ? selectedDayBookings
                          .sort((a,b) => new Date(a.booking_time).getTime() - new Date(b.booking_time).getTime())
                          .map(booking => (
                             <div key={booking.id} className="border p-3 rounded-md hover:bg-muted/50 transition-colors" >
                                <p className="font-semibold">{booking.services?.name}</p>
                                <p className="text-sm text-muted-foreground">{booking.customers?.full_name}</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">{format(new Date(booking.booking_time), 'p')}</p>
                                    <Button variant="ghost" size="sm" onClick={() => onEdit(booking)}>{t('bookings.edit_booking')}</Button>
                                </div>
                                {booking.staff_members?.full_name &&
                                    <Badge variant="outline" className="mt-1">
                                        {booking.staff_members.full_name}
                                    </Badge>
                                }
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
