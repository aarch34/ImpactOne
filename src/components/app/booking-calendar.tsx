"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { supabase, type Booking } from '@/lib/supabase/client';
import { format, isSameDay } from "date-fns";
import { Loader2, Clock, MapPin, Users, User, Phone, Mail, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export function BookingCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  // Check if user is admin
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = userEmail === 'thejaswinp6@gmail.com';

  useEffect(() => {
    async function fetchBookings() {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('booking_date', { ascending: true });

        if (error) {
          console.error("Error fetching bookings:", error);
          setLoading(false);
          return;
        }

        setBookings(data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  // Get bookings for selected date
  const selectedDateBookings = bookings.filter((booking) => {
    if (!date) return false;
    const bookingDate = new Date(booking.booking_date);
    return isSameDay(bookingDate, date);
  });

  // Get dates with bookings for calendar highlighting
  const bookedDates = bookings.map((b) => new Date(b.booking_date)).filter(Boolean);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Format time slots display
  const formatTimeSlots = (booking: Booking) => {
    if (booking.duration_type === "full-day") {
      return "Full Day (9:00 AM - 5:00 PM)";
    }
    if (booking.selected_slots && booking.selected_slots.length > 0) {
      const sortedSlots = [...booking.selected_slots].sort();
      if (sortedSlots.length === 1) {
        return `${sortedSlots[0]} - ${addThirtyMinutes(sortedSlots[0])}`;
      }
      return `${sortedSlots[0]} - ${addThirtyMinutes(sortedSlots[sortedSlots.length - 1])} (${sortedSlots.length} slots)`;
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

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;

    setCancelling(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'Cancelled' })
        .eq('id', bookingToCancel);

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "The booking has been cancelled successfully.",
      });

      // Update local state
      setBookings(prev => prev.map(b =>
        b.id === bookingToCancel ? { ...b, status: 'Cancelled' as const } : b
      ));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast({
        variant: "destructive",
        title: "Cancel Failed",
        description: "Failed to cancel the booking. Please try again.",
      });
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[350px_1fr]">
      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>Click a date to view bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <style jsx global>{`
            .rdp-day_booked {
              background-color: #10b981 !important;
              color: white !important;
              font-weight: 600 !important;
              border-radius: 6px !important;
              box-shadow: 0 0 8px rgba(16, 185, 129, 0.5) !important;
            }
            .rdp-day_booked:hover {
              background-color: #059669 !important;
              box-shadow: 0 0 12px rgba(16, 185, 129, 0.7) !important;
            }
          `}</style>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
              booked: bookedDates,
            }}
            modifiersClassNames={{
              booked: "rdp-day_booked",
            }}
          />
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span>Date with bookings</span>
            </div>
            <div className="mt-4 pt-4 border-t space-y-2">
              <p className="font-semibold">Booking Status:</p>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Rejected</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {date ? format(date, "EEEE, MMMM d, yyyy") : "Select a date"}
          </CardTitle>
          <CardDescription>
            {selectedDateBookings.length > 0
              ? `${selectedDateBookings.length} booking(s) on this date`
              : "No bookings on this date"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDateBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mb-4" />
              <p>No bookings scheduled for this date</p>
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
                  <Card key={booking.id} className="border-l-4" style={{ borderLeftColor: getStatusColor(booking.status).replace('bg-', '#') }}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {/* Header with Status */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{booking.event_title}</h3>
                            <Badge variant="outline" className="mt-1">
                              {booking.department} - {booking.department_category}
                            </Badge>
                          </div>
                          <Badge className={cn("text-white", getStatusColor(booking.status))}>
                            {booking.status}
                          </Badge>
                        </div>

                        {/* Time Slot - PROMINENT */}
                        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-md border border-primary/20">
                          <Clock className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-lg text-primary">
                            {formatTimeSlots(booking)}
                          </span>
                        </div>

                        {/* Resource & Location */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {booking.resource_name}
                            {booking.sub_area && ` - ${booking.sub_area}`}
                            {booking.resource_type && ` (${booking.resource_type})`}
                          </span>
                        </div>

                        {/* Attendees */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{booking.attendees} attendees</span>
                        </div>

                        {/* Faculty Details */}
                        {booking.faculty_incharge && (
                          <div className="pt-2 border-t space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Faculty In-charge:</span>
                              <span>{booking.faculty_incharge}</span>
                            </div>
                            {booking.contact_number && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <a href={`tel:${booking.contact_number}`} className="hover:underline">
                                  {booking.contact_number}
                                </a>
                              </div>
                            )}
                            {booking.contact_email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <a href={`mailto:${booking.contact_email}`} className="hover:underline">
                                  {booking.contact_email}
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Requester */}
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Requested by: {booking.requester_name}
                        </div>

                        {/* Admin Cancel Button */}
                        {isAdmin && booking.status !== 'Cancelled' && booking.status !== 'Rejected' && (
                          <div className="pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelClick(booking.id)}
                              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Booking
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? The booking will be marked as cancelled
              and will remain in the history for record keeping, but will be removed from active bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
