
"use client";

import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, Check, X } from "lucide-react";
import { useCollection, useMemoFirebase, useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import type { AdminBooking } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ADMIN_EMAIL = 'admin.impact@iceas.ac.in';

export default function AdminPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

    const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

    const bookingsQuery = useMemoFirebase(() => {
        if (!firestore || !isAdmin) return null;
        return query(collection(firestore, `bookings`), orderBy('bookingDate', 'desc'));
    }, [firestore, isAdmin]);

    const { data: bookings, isLoading: loading } = useCollection<AdminBooking>(bookingsQuery);

    const handleUpdateStatus = async (bookingId: string, newStatus: 'Approved' | 'Rejected') => {
      if (!firestore) return;
      setUpdatingBookingId(bookingId);
      const bookingRef = doc(firestore, 'bookings', bookingId);
      
      try {
        await updateDoc(bookingRef, { status: newStatus });
        toast({
          title: "Booking Updated",
          description: `Booking has been successfully ${newStatus.toLowerCase()}.`,
        });
      } catch (error) {
        console.error("Error updating booking status: ", error);
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Could not update the booking status.",
        });
      } finally {
        setUpdatingBookingId(null);
      }
    };
    
    const getBadgeVariant = (status: string) => {
        switch (status) {
            case 'Approved': return 'default';
            case 'Pending': return 'secondary';
            case 'Rejected': return 'destructive';
            default: return 'outline';
        }
    };

    if (isUserLoading || (user && !isAdmin && loading)) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!isAdmin) {
        return (
            <div className="flex justify-center items-center h-full">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex justify-center">
                            <ShieldAlert className="w-12 h-12 text-destructive" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h2 className="text-2xl font-bold">Access Denied</h2>
                        <p className="text-muted-foreground mt-2">You do not have permission to view this page. Please contact an administrator if you believe this is an error.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Admin Panel</h1>
                <p className="text-muted-foreground">Manage all booking requests across the campus.</p>
            </div>
            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Resource</TableHead>
                            <TableHead>Requester</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                           <TableRow>
                                <TableCell colSpan={6} className="text-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && bookings?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground p-8">
                                    No booking requests found.
                                </TableCell>
                            </TableRow>
                        )}
                        {bookings?.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.resourceName}</TableCell>
                                <TableCell>{booking.requesterName}</TableCell>
                                <TableCell>{booking.department}</TableCell>
                                <TableCell>{booking.bookingDate ? format(booking.bookingDate.toDate(), 'PP') : 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant={getBadgeVariant(booking.status)}
                                           className={booking.status === "Approved" ? "bg-primary text-primary-foreground hover:bg-primary/80" : ""}>
                                        {booking.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {booking.status === 'Pending' ? (
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              onClick={() => handleUpdateStatus(booking.id, 'Approved')}
                                              disabled={updatingBookingId === booking.id}
                                            >
                                              {updatingBookingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              onClick={() => handleUpdateStatus(booking.id, 'Rejected')}
                                              disabled={updatingBookingId === booking.id}
                                            >
                                               {updatingBookingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 text-red-600" />}
                                            </Button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No actions</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
