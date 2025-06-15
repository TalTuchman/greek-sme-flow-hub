
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, List, Calendar } from "lucide-react";
import * as React from "react";
import type { Tables } from "@/integrations/supabase/types";
import { BookingTable, type BookingWithDetails } from "@/components/BookingTable";
import { BookingDialog } from "@/components/BookingDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookingCalendar } from "@/components/BookingCalendar";

type Booking = Tables<'bookings'>;
type StaffMember = Tables<'staff_members'>;

const BookingsPage = () => {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingBooking, setEditingBooking] = React.useState<Booking | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

    const getBookings = async (staffId: string | null) => {
        let query = supabase
            .from('bookings')
            .select('*, customers(full_name), services(name), staff_members(full_name)')
            .order('booking_time', { ascending: false });

        if (staffId) {
            query = query.eq('staff_id', staffId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as BookingWithDetails[];
    };

    const { data: bookings, isLoading, error } = useQuery<BookingWithDetails[]>({
        queryKey: ['bookings', selectedStaffId],
        queryFn: () => getBookings(selectedStaffId)
    });

    const { data: staffMembers } = useQuery<StaffMember[]>({
        queryKey: ['staff_members'],
        queryFn: async () => {
            const { data, error } = await supabase.from('staff_members').select('*');
            if (error) throw error;
            return data;
        }
    });

    const handleEdit = (booking: Booking) => {
        setEditingBooking(booking);
        setIsDialogOpen(true);
    };
    
    const handleAddNew = () => {
        setEditingBooking(null);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingBooking(null);
    }

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Bookings</h1>
                    <p className="text-muted-foreground">Schedule and manage your appointments.</p>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Booking
                </Button>
            </div>

            <div className="flex items-center justify-between gap-4 mb-4">
                <Select onValueChange={(value) => setSelectedStaffId(value === 'all' ? null : value)} value={selectedStaffId || 'all'}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by staff" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Staff</SelectItem>
                        {staffMembers?.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>{staff.full_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                    <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                        <List className="h-4 w-4" />
                    </Button>
                     <Button variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('calendar')}>
                        <Calendar className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            
            {isLoading && <Skeleton className="h-96 w-full rounded-md border" />}
            {error && <div className="text-red-500 rounded-md border p-4">Error: {error.message}</div>}
            
            {bookings && viewMode === 'list' && <BookingTable bookings={bookings} onEdit={handleEdit} />}
            {bookings && viewMode === 'calendar' && <BookingCalendar bookings={bookings} onEdit={handleEdit} />}

            <BookingDialog 
                isOpen={isDialogOpen} 
                onClose={handleDialogClose}
                booking={editingBooking}
            />
        </DashboardLayout>
    );
};

export default BookingsPage;
