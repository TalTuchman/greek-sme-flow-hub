
import * as React from 'react';
import type { BookingWithDetails } from './BookingTable';
import { format } from 'date-fns';

// Props expected by react-day-picker for custom Day
interface BookingCalendarDayProps {
  date: Date;
  displayMonth: Date;
  today: Date | undefined;
  selected: Date | undefined;
  bookingsByDay: Record<string, BookingWithDetails[]>;
  staffIds: string[];
  getStaffColor: (staffId: string | undefined, staffIds: string[]) => string;
  onEdit: (booking: BookingWithDetails) => void;
}

export function BookingCalendarDay(props: any) {
  // react-day-picker supplies date, selected, etc. "props" also contains props forwarded from DayPicker.
  const { date, bookingsByDay, staffIds, getStaffColor, onEdit } = props;

  const dayString = format(date, 'yyyy-MM-dd');
  const bookingsForDay: BookingWithDetails[] = bookingsByDay?.[dayString] || [];

  return (
    <div className="flex flex-col min-h-[100px] py-1 px-1 items-stretch w-full">
      <span className="text-xs font-bold text-center">{date.getDate()}</span>
      <div className="flex flex-col gap-1 mt-1 w-full">
        {bookingsForDay?.length > 0 ? bookingsForDay.map((booking) => {
          const col = getStaffColor(booking.staff_id, staffIds);
          return (
            <button
              key={booking.id}
              className={`w-full ${col} rounded px-1 py-0.5 text-xs flex flex-col outline-none ring-2 ring-transparent hover:ring-primary transition font-medium shadow booking-chip`}
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
                <span className="truncate opacity-80 text-[11px] text-left">
                  {booking.staff_members.full_name}
                </span>
              )}
            </button>
          );
        }) : null}
      </div>
    </div>
  );
}
