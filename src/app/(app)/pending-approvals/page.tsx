"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import { supabase, type Booking } from '@/lib/supabase/client';
import { format } from "date-fns";
import { Loader2, Check, X, Calendar, Clock, MapPin, Users, User, Phone, Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = 'impact1.iceas@gmail.com';

export default function PendingApprovalsPage() {
    const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { user, isLoaded } = useUser();
    const { toast } = useToast();
    const router = useRouter();

    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    // Check if user is admin
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    const isAdmin = userEmail === ADMIN_EMAIL;

    // Redirect non-admins
    useEffect(() => {
        if (isLoaded && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isLoaded, isAdmin, router]);

    // Fetch pending bookings
    useEffect(() => {
        async function fetchPendingBookings() {
            if (!isAdmin) return;

            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('status', 'Pending')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching pending bookings:", error);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to load pending bookings.",
                    });
                    return;
                }

                setPendingBookings(data || []);
            } catch (error) {
                console.error("Error fetching pending bookings:", error);
            } finally {
                setLoading(false);
            }
        }

        if (isLoaded) {
            fetchPendingBookings();
        }
    }, [isLoaded, isAdmin]);

    const handleApproval = async (bookingId: string) => {
        setProcessingId(bookingId);

        try {
            // Get the booking details before updating
            const booking = pendingBookings.find(b => b.id === bookingId);

            if (!booking) {
                throw new Error('Booking not found');
            }

            // Update booking status in Supabase
            const { error } = await supabase
                .from('bookings')
                .update({
                    status: 'Approved',
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: userEmail
                })
                .eq('id', bookingId);

            if (error) throw error;

            // Send email notification (non-blocking)
            try {
                const emailResponse = await fetch('/api/send-booking-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        booking,
                        action: 'Approved',
                    }),
                });

                if (!emailResponse.ok) {
                    console.error('Failed to send email notification');
                    toast({
                        title: `Booking Approved`,
                        description: `The booking has been approved, but email notification failed to send.`,
                        variant: "default",
                    });
                } else {
                    toast({
                        title: `Booking Approved`,
                        description: `The booking request has been approved and the user has been notified via email.`,
                    });
                }
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                toast({
                    title: `Booking Approved`,
                    description: `The booking has been approved, but email notification failed to send.`,
                    variant: "default",
                });
            }

            // Remove from pending list
            setPendingBookings(prev => prev.filter(b => b.id !== bookingId));

        } catch (error: any) {
            console.error("Error updating booking:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update booking status.",
            });
        } finally {
            setProcessingId(null);
        }
    };

    const openRejectDialog = (bookingId: string) => {
        setSelectedBookingId(bookingId);
        setRejectionReason("");
        setIsRejectDialogOpen(true);
    };

    const confirmRejection = async () => {
        if (!selectedBookingId) return;

        setProcessingId(selectedBookingId);
        setIsRejectDialogOpen(false); // Close dialog immediately

        try {
            const booking = pendingBookings.find(b => b.id === selectedBookingId);
            if (!booking) throw new Error('Booking not found');

            // Update booking status in Supabase
            const { error } = await supabase
                .from('bookings')
                .update({
                    status: 'Rejected',
                    rejection_reason: rejectionReason, // Save the reason
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: userEmail
                })
                .eq('id', selectedBookingId);

            if (error) throw error;

            // Send email notification
            try {
                await fetch('/api/send-booking-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        booking,
                        action: 'Rejected',
                        reason: rejectionReason, // Send reason to email API
                    }),
                });

                toast({
                    title: "Booking Rejected",
                    description: "The booking request has been rejected.",
                });
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                toast({
                    title: "Booking Rejected",
                    description: "Booking rejected, but email notification failed.",
                    variant: "default", // Warning
                });
            }

            // Remove from list
            setPendingBookings(prev => prev.filter(b => b.id !== selectedBookingId));

        } catch (error: any) {
            console.error("Error updating booking:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to reject booking.",
            });
        } finally {
            setProcessingId(null);
            setSelectedBookingId(null);
        }
    };


    const getInitials = (name: string) => {
        if (!name) return "A";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Format time display based on selected slots
    const formatTimeDisplay = (booking: Booking) => {
        if (booking.duration_type === "full-day") {
            return "Full Day";
        }
        if (booking.selected_slots && booking.selected_slots.length > 0) {
            const sortedSlots = [...booking.selected_slots].sort();
            return `${sortedSlots[0]} - ${sortedSlots[sortedSlots.length - 1]}`;
        }
        return `${booking.start_time || "N/A"} - ${booking.end_time || "N/A"}`;
    };

    if (!isLoaded || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading pending approvals...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Pending Approvals</h1>
                <p className="text-muted-foreground">
                    Review and approve or reject booking requests
                </p>
            </div>

            {/* Summary Card */}
            <Card className="border-yellow-200 bg-yellow-50/50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <CardTitle className="text-yellow-900">
                            {pendingBookings.length} Pending Request{pendingBookings.length !== 1 ? 's' : ''}
                        </CardTitle>
                    </div>
                    <CardDescription className="text-yellow-700">
                        {pendingBookings.length === 0
                            ? "All caught up! No pending approvals at this time."
                            : "Review the requests below and take action."}
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Pending Bookings List */}
            <div className="space-y-4">
                {pendingBookings.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Check className="h-12 w-12 mb-4 text-green-500" />
                            <p className="text-lg font-medium">All caught up!</p>
                            <p className="text-sm">There are no pending approval requests.</p>
                        </CardContent>
                    </Card>
                ) : (
                    pendingBookings.map((booking) => (
                        <Card key={booking.id} className="border-l-4 border-l-yellow-500">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {/* Header with User Info */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>{getInitials(booking.requester_name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold text-lg">{booking.event_title}</h3>
                                                <p className="text-sm text-muted-foreground">{booking.requester_name}</p>
                                                <Badge variant="outline" className="mt-1">
                                                    {booking.department} - {booking.department_category}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Badge className="bg-yellow-500 text-white">Pending</Badge>
                                    </div>

                                    {/* Event Details Grid */}
                                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    <strong>Resource:</strong> {booking.resource_name}
                                                    {booking.sub_area && ` - ${booking.sub_area}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    <strong>Date:</strong> {format(new Date(booking.booking_date), 'PPP')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    <strong>Time:</strong> {formatTimeDisplay(booking)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    <strong>Attendees:</strong> {booking.attendees}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {booking.faculty_incharge && (
                                                <>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            <strong>Faculty:</strong> {booking.faculty_incharge}
                                                        </span>
                                                    </div>
                                                    {booking.contact_number && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                                            <a href={`tel:${booking.contact_number}`} className="hover:underline">
                                                                {booking.contact_number}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {booking.contact_email && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                                            <a href={`mailto:${booking.contact_email}`} className="hover:underline">
                                                                {booking.contact_email}
                                                            </a>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {booking.event_description && (
                                        <div className="p-3 bg-muted/30 rounded-md">
                                            <p className="text-sm font-medium mb-1">Event Description:</p>
                                            <p className="text-sm text-muted-foreground">{booking.event_description}</p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            onClick={() => handleApproval(booking.id)}
                                            disabled={processingId === booking.id}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            {processingId === booking.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Approve
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => openRejectDialog(booking.id)}
                                            disabled={processingId === booking.id}
                                            variant="destructive"
                                            className="flex-1"
                                        >
                                            {processingId === booking.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Reject
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Requested timestamp */}
                                    <div className="text-xs text-muted-foreground border-t pt-2">
                                        Requested on: {booking.created_at ? format(new Date(booking.created_at), 'PPP \'at\' p') : 'Unknown'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Booking Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this booking. This will be sent to the requester.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Rejection Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g., Venue unavailable, Schedule conflict..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={confirmRejection}
                            disabled={!rejectionReason.trim()}
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
