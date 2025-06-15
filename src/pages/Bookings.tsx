
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import * as React from "react";
import type { Tables } from "@/integrations/supabase/types";
import { BookingTable, type BookingWithDetails } from "@/components/BookingTable";
import { BookingDialog } from "@/components/BookingDialog";

type Booking = Tables<'bookings'>;

const BookingsPage = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

    const getBookings = async () => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, customers(full_name), services(name)')
            .order('booking_time', { ascending: false });

        if (error) throw error;
        return data as BookingWithDetails[];
    };

    const { data: bookings, isLoading, error } = useQuery<BookingWithDetails[]>({
        queryKey: ['bookings'],
        queryFn: getBookings
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
            
            {isLoading && <Skeleton className="h-96 w-full rounded-md border" />}
            {error && <div className="text-red-500 rounded-md border p-4">Error: {error.message}</div>}
            {bookings && <BookingTable bookings={bookings} onEdit={handleEdit} />}

            <BookingDialog 
                isOpen={isDialogOpen} 
                onClose={handleDialogClose}
                booking={editingBooking}
            />
        </DashboardLayout>
    );
};

export default BookingsPage;
