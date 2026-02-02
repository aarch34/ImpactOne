'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { useUser } from '@clerk/nextjs';
import { supabase, type Booking } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function BookingCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { user } = useUser();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = userEmail === 'thejaswinp6@gmail.com';

  // Fetch bookings from Supabase
  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;

      setIsLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*');

      if (data) {
        setAllBookings(data);
      }
      setIsLoading(false);
    }

    fetchBookings();
  }, [user]);

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
        booking.status === 'Approved' || booking.requester_id === user?.id
      );
    }
  }, [allBookings, isAdmin, user?.id]);

  const events = useMemo(() => {
    return filteredBookings?.map(b => ({
      ...b,
      date: new Date(b.booking_date),
      title: b.event_title, // Show event title instead of resource name
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
                  <div className="space-y-2 text-sm">
                    <p><strong>Resource:</strong> {event.resource_name}</p>
                    <p><strong>Requester:</strong> {event.requester_name}</p>
                    <p><strong>Attendees:</strong> {event.attendees}</p>
                    {event.event_description && (
                      <p className="text-muted-foreground">
                        {event.event_description?.length > 100
                          ? `${event.event_description.substring(0, 100)}...`
                          : event.event_description}
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
