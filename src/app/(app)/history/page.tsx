"use client";

import { useMemo, useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, AlertTriangle } from "lucide-react";
import { useUser, useAuth, useFirestore } from '@/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';

export default function HistoryPage() {
    const firestore = useFirestore();
    const auth = useAuth();
    const { user } = useUser(auth);
    
    // Local state for bookings
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if user is admin
    const isAdmin = user?.email?.includes('admin') || user?.email?.includes('Admin');

    // Fetch bookings manually to avoid permission issues
    useEffect(() => {
        async function fetchBookings() {
            if (!firestore || !user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                // Try different approaches based on user type
                let bookingsSnapshot;
                
                try {
                    if (isAdmin) {
                        // Admin: try to get all bookings
                        const allBookingsRef = collection(firestore, "bookings");
                        bookingsSnapshot = await getDocs(allBookingsRef);
                    } else {
                        // Regular user: try to get only their bookings
                        const userBookingsRef = query(
                            collection(firestore, "bookings"), 
                            where("requesterId", "==", user.uid)
                        );
                        bookingsSnapshot = await getDocs(userBookingsRef);
                    }
                } catch (permissionError) {
                    // If admin query fails, try simple collection query
                    console.warn('Admin query failed, trying simple query:', permissionError);
                    const simpleRef = collection(firestore, "bookings");
                    bookingsSnapshot = await getDocs(simpleRef);
                }

                const fetchedBookings: Booking[] = [];
                bookingsSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const booking = {
                        id: doc.id,
                        ...data,
                    } as Booking;
                    fetchedBookings.push(booking);
                });

                // Client-side filtering and sorting
                let filteredBookings = fetchedBookings;
                
                // Filter for non-admin users
                if (!isAdmin) {
                    filteredBookings = fetchedBookings.filter(booking => 
                        booking.requesterId === user.uid
                    );
                }

                // Sort by booking date (newest first)
                filteredBookings.sort((a, b) => {
                    const dateA = a.bookingDate?.toDate?.() || new Date(0);
                    const dateB = b.bookingDate?.toDate?.() || new Date(0);
                    return dateB.getTime() - dateA.getTime();
                });

                setBookings(filteredBookings);
                
            } catch (err) {
                console.error('Error fetching bookings:', err);
                setError(`Failed to load booking history: ${err instanceof Error ? err.message : 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        }

        // Only fetch if user is loaded
        if (user) {
            fetchBookings();
        } else if (!loading && !user) {
            setLoading(false);
        }
    }, [firestore, user, isAdmin]);

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'default';
            case 'Pending':
                return 'secondary';
            case 'Rejected':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const exportToCSV = () => {
        if (!bookings || bookings.length === 0) return;
        
        const headers = ['ID', 'Event Title', 'Resource', 'Department', 'Date', 'Requester', 'Status', 'Attendees'];
        const csvContent = [
            headers.join(','),
            ...bookings.map(booking => [
                booking.id,
                `"${booking.eventTitle || 'N/A'}"`,
                `"${booking.resourceName || 'N/A'}"`,
                `"${booking.department || 'N/A'}"`,
                booking.bookingDate ? format(booking.bookingDate.toDate(), 'yyyy-MM-dd') : 'N/A',
                `"${booking.requesterName || 'N/A'}"`,
                booking.status || 'N/A',
                booking.attendees || 0
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booking-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    const retryFetch = () => {
        if (user) {
            setError(null);
            setLoading(true);
            // Re-trigger the useEffect
            setBookings([]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Booking History</h1>
                    <p className="text-muted-foreground">
                        {isAdmin 
                            ? 'A log of all past and current booking requests.' 
                            : 'A log of your past and current booking requests.'
                        }
                    </p>
                </div>
                <Button onClick={exportToCSV} disabled={!bookings || bookings.length === 0}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-medium text-red-800">Unable to load booking history</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={retryFetch}
                                className="mt-2"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Event Title</TableHead>
                            <TableHead>Resource</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Date</TableHead>
                            {isAdmin && <TableHead>Requester</TableHead>}
                            <TableHead>Attendees</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                           <TableRow>
                                <TableCell colSpan={isAdmin ? 8 : 7} className="text-center">
                                    <div className="flex justify-center items-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <span className="ml-2">Loading booking history...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && !error && (!bookings || bookings.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-muted-foreground p-8">
                                    {isAdmin ? 'No bookings found in the system.' : 'You have no booking history yet.'}
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && !error && bookings?.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-mono text-xs font-medium">
                                    {booking.id.substring(0,8).toUpperCase()}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {booking.eventTitle || 'N/A'}
                                </TableCell>
                                <TableCell>{booking.resourceName || 'N/A'}</TableCell>
                                <TableCell>{booking.department || 'N/A'}</TableCell>
                                <TableCell>
                                    {booking.bookingDate ? format(booking.bookingDate.toDate(), 'MMM dd, yyyy') : 'N/A'}
                                </TableCell>
                                {isAdmin && (
                                    <TableCell>{booking.requesterName || 'N/A'}</TableCell>
                                )}
                                <TableCell>{booking.attendees || 0}</TableCell>
                                <TableCell className="text-right">
                                    <Badge 
                                        variant={getBadgeVariant(booking.status)}
                                        className={booking.status === "Approved" ? "bg-green-600 text-white hover:bg-green-700" : ""}
                                    >
                                        {booking.status || 'Unknown'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            {/* Summary Stats - only show if we have data and no errors */}
            {!loading && !error && bookings && bookings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card border rounded-lg p-4">
                        <div className="text-2xl font-bold">{bookings.length}</div>
                        <div className="text-sm text-muted-foreground">Total Bookings</div>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">
                            {bookings.filter(b => b.status === 'Approved').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Approved</div>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-600">
                            {bookings.filter(b => b.status === 'Pending').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                        <div className="text-2xl font-bold text-red-600">
                            {bookings.filter(b => b.status === 'Rejected').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Rejected</div>
                    </div>
                </div>
            )}
        </div>
    )
}
