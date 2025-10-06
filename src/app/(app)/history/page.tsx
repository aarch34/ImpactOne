"use client";

import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';

export default function HistoryPage() {
    const firestore = useFirestore();
    const { user } = useUser();

    const bookingsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, `users/${user.uid}/bookings`), orderBy('bookingDate', 'desc'));
    }, [firestore, user]);

    const { data: bookings, isLoading: loading } = useCollection<Booking>(bookingsQuery);

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
        if (!bookings) return;
        const headers = ['ID', 'Resource', 'Department', 'Date', 'Status'];
        const rows = bookings.map(b => [b.id, b.resourceName, b.department, b.bookingDate ? format(b.bookingDate.toDate(), 'yyyy-MM-dd') : 'N/A', b.status].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "booking-history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Booking History</h1>
                    <p className="text-muted-foreground">A log of all past and current booking requests.</p>
                </div>
                <Button onClick={exportToCSV} disabled={!bookings || bookings.length === 0}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>
            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Resource</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Date</TableHead>
                             <TableHead>Requester</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                           <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    <div className="flex justify-center items-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && bookings?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground p-8">
                                    No booking history found.
                                </TableCell>
                            </TableRow>
                        )}
                        {bookings?.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.id.substring(0,6).toUpperCase()}</TableCell>
                                <TableCell>{booking.resourceName}</TableCell>
                                <TableCell>{booking.department}</TableCell>
                                <TableCell>{booking.bookingDate ? format(booking.bookingDate.toDate(), 'PP') : 'N/A'}</TableCell>
                                <TableCell>{booking.requesterName}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={getBadgeVariant(booking.status)}
                                           className={booking.status === "Approved" ? "bg-primary text-primary-foreground hover:bg-primary/80" : ""}>
                                        {booking.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
