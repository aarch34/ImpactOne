'use client';

import { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function BookingCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const firestore = useFirestore();
  const { user } = useUser();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/bookings`));
  }, [firestore, user]);

  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

  const events = useMemo(() => {
    return bookings?.map(b => ({
        ...b,
        date: b.bookingDate.toDate(),
        title: b.resourceName,
    })) || [];
  }, [bookings]);

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

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-2">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md w-full"
                modifiers={{
                    approved: events.filter(e => e.status === 'Approved').map(e => e.date),
                    pending: events.filter(e => e.status === 'Pending').map(e => e.date),
                    rejected: events.filter(e => e.status === 'Rejected').map(e => e.date),
                }}
                modifiersClassNames={{
                    approved: 'bg-primary/20',
                    pending: 'bg-secondary text-secondary-foreground',
                    rejected: 'bg-destructive/20',
                }}
            />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Events for {date ? format(date, 'PPP') : '...'}</CardTitle>
            <CardDescription>Bookings on the selected date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => (
                <div key={event.id} className="flex items-center p-3 rounded-md border bg-card">
                  <div className="flex-1">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.department}</p>
                  </div>
                  <Badge variant={getBadgeVariant(event.status)} className={event.status === "Approved" ? "bg-primary text-primary-foreground hover:bg-primary/80" : ""}>
                    {event.status}
                  </Badge>
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
