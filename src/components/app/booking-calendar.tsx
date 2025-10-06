'use client';

import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { bookingHistory } from '@/lib/data';
import { parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const events = bookingHistory.map(b => ({
  date: parseISO(b.date),
  title: b.resource,
  department: b.department,
  status: b.status as 'Approved' | 'Pending' | 'Rejected',
}));

export function BookingCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

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
                }}
                modifiersClassNames={{
                    approved: 'bg-primary/20',
                    pending: 'bg-accent/30',
                }}
            />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Events for {date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '...'}</CardTitle>
            <CardDescription>Bookings on the selected date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event, index) => (
                <div key={index} className="flex items-center p-3 rounded-md border bg-card">
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
