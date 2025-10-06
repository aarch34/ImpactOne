'use client';

import { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useUser, useMemoFirebase, useAuth } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function BookingCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useUser(auth);

  // Check if user is admin
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('Admin');

  // Updated query: Show approved bookings for all users, but admin can see all statuses
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    
    if (isAdmin) {
      // Admin sees all bookings (all statuses)
      return query(collection(firestore, "bookings"));
    } else {
      // Regular users see only approved bookings (from all users) + their own bookings (all statuses)
      // This will show approved bookings as public calendar + their own pending/rejected
      return query(collection(firestore, "bookings"));
    }
  }, [firestore, user, isAdmin]);

  const { data: allBookings, isLoading } = useCollection<Booking>(bookingsQuery);

  // Filter bookings based on user type
  const filteredBookings = useMemo(() => {
    if (!allBookings) return [];
    
    if (isAdmin) {
      // Admin sees all bookings
      return allBookings;
    } else {
      // Regular users see:
      // 1. All approved bookings (to see resource availability)
      // 2. Their own bookings (regardless of status)
      return allBookings.filter(booking => 
        booking.status === 'Approved' || booking.requesterId === user?.uid
      );
    }
  }, [allBookings, isAdmin, user?.uid]);

  const events = useMemo(() => {
    return filteredBookings?.map(b => ({
        ...b,
        date: b.bookingDate.toDate(),
        title: b.eventTitle, // Show event title instead of resource name
    })) || [];
  }, [filteredBookings]);

  const selectedDayEvents = date ? events.filter(e => e.date.toDateString() === date.toDateString()) : [];

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

  // Enhanced calendar modifiers to show different types of bookings
  const approvedEvents = events.filter(e => e.status === 'Approved');
  const pendingEvents = events.filter(e => e.status === 'Pending');
  const rejectedEvents = events.filter(e => e.status === 'Rejected');

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Resource Calendar</CardTitle>
            <CardDescription>
              {isAdmin 
                ? "All bookings and requests across the system" 
                : "Approved bookings (public) and your requests"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md w-full"
                modifiers={{
                    approved: approvedEvents.map(e => e.date),
                    pending: pendingEvents.map(e => e.date),
                    rejected: rejectedEvents.map(e => e.date),
                }}
                modifiersClassNames={{
                    approved: 'bg-green-100 text-green-800 hover:bg-green-200',
                    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
                    rejected: 'bg-red-100 text-red-800 hover:bg-red-200',
                }}
            />
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-100"></div>
                <span className="text-muted-foreground">Approved</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-100"></div>
                <span className="text-muted-foreground">Pending</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-100"></div>
                <span className="text-muted-foreground">Rejected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Events for {date ? format(date, 'PPP') : '...'}</CardTitle>
            <CardDescription>
              {selectedDayEvents.length} booking{selectedDayEvents.length !== 1 ? 's' : ''} on this date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => (
                <div key={event.id} className="flex flex-col p-3 rounded-md border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{event.title}</h3>
                    <Badge variant={getBadgeVariant(event.status)} className={event.status === "Approved" ? "bg-green-600 text-white hover:bg-green-700" : ""}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>📍 {event.resourceName}</p>
                    <p>👤 {event.requesterName}</p>
                    <p>👥 {event.attendees} attendees</p>
                    <p>🏢 {event.department}</p>
                    {event.eventDescription && (
                      <p className="border-t pt-2 mt-2">
                        📝 {event.eventDescription}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No events scheduled.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
