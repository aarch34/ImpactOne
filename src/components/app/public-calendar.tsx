"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase, type Booking } from '@/lib/supabase/client';
import { format, isSameDay, startOfToday } from "date-fns";
import { Loader2, Clock, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchApprovedBookings() {
            const today = new Date().toISOString().split('T')[0];

            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('id, event_title, booking_date, start_time, end_time, resource_name, sub_area, resource_type, selected_slots, duration_type, status')
                    .eq('status', 'Approved')
                    .gte('booking_date', today) // Only future/today bookings
                    .order('booking_date', { ascending: true });

                if (error) {
                    console.error("Error fetching approved bookings:", error);
                    setLoading(false);
                    return;
                }

                setBookings((data as unknown as Booking[]) || []);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchApprovedBookings();
    }, []);

    // Reliable date parsing helper (avoids timezone shifts)
    const parseSupabaseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        const part = dateStr.split('T')[0];
        const [y, m, d] = part.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    // Get bookings for selected date
    const selectedDateBookings = bookings.filter((booking) => {
        if (!date) return false;
        const bDate = parseSupabaseDate(booking.booking_date);
        return isSameDay(bDate, date);
    });

    // Get dates with bookings for calendar highlighting
    // Create a map to avoid duplicates and easy lookup
    const bookedDates = bookings.map((b) => parseSupabaseDate(b.booking_date));

    // Format time slots display
    const formatTimeSlots = (booking: Booking) => {
        if (booking.duration_type === "full-day") {
            return "Full Day";
        }
        if (booking.selected_slots && booking.selected_slots.length > 0) {
            const sortedSlots = [...booking.selected_slots].sort();
            if (sortedSlots.length === 1) {
                return `${sortedSlots[0]} - ${addThirtyMinutes(sortedSlots[0])}`;
            }
            return `${sortedSlots[0]} - ${addThirtyMinutes(sortedSlots[sortedSlots.length - 1])}`;
        }
        return `${booking.start_time} - ${booking.end_time}`;
    };

    // Helper to add 30 minutes to time string
    const addThirtyMinutes = (time: string) => {
        const [hour, minute] = time.split(':');
        const totalMinutes = parseInt(hour) * 60 + parseInt(minute) + 30;
        const newHour = Math.floor(totalMinutes / 60);
        const newMinute = totalMinutes % 60;
        return `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            {/* Calendar View */}
            <Card className="border-primary/10 shadow-md">
                <CardHeader className="bg-primary/5 pb-4">
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <CalendarIcon className="h-5 w-5" />
                        Event Calendar
                    </CardTitle>
                    <CardDescription>Select a date to view scheduled events</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 flex justify-center">
                    <style jsx global>{`
            .rdp-day_booked {
              background-color: #10b981 !important;
              color: white !important;
              font-weight: 600 !important;
              border-radius: 6px !important;
            }
            .rdp-day_booked:hover {
              background-color: #059669 !important;
            }
            .rdp-day_today {
              font-weight: bold;
              border: 2px solid #10b981;
            }
          `}</style>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border shadow-sm p-4 bg-white"
                        modifiers={{
                            booked: bookedDates,
                        }}
                        modifiersClassNames={{
                            booked: "rdp-day_booked",
                        }}
                        disabled={(date) => date < startOfToday()}
                    />
                </CardContent>
            </Card>

            {/* Bookings List */}
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-2xl font-headline">
                        {date ? format(date, "EEEE, MMMM d, yyyy") : "Upcoming Events"}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {selectedDateBookings.length > 0
                            ? `${selectedDateBookings.length} confirmed event${selectedDateBookings.length !== 1 ? 's' : ''}`
                            : "No public events scheduled for this date."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    {selectedDateBookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/30">
                            <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No events found</p>
                            <p className="text-sm">Try selecting a green highlighted date on the calendar.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedDateBookings
                                .sort((a, b) => {
                                    const timeA = a.start_time || a.selected_slots?.[0] || "00:00";
                                    const timeB = b.start_time || b.selected_slots?.[0] || "00:00";
                                    return timeA.localeCompare(timeB);
                                })
                                .map((booking) => (
                                    <Card key={booking.id} className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-xl text-foreground">{booking.event_title}</h3>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <MapPin className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium">
                                                            {booking.resource_name}
                                                            {booking.sub_area && ` - ${booking.sub_area}`}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-lg whitespace-nowrap">
                                                    <Clock className="h-5 w-5 text-primary" />
                                                    <span className="font-semibold text-lg text-primary">
                                                        {formatTimeSlots(booking)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
