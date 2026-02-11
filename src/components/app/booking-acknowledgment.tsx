"use client";

import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Booking } from '@/lib/supabase/client';
import { format } from "date-fns";
import { Download, Printer, CheckCircle2 } from "lucide-react";

interface BookingAcknowledgmentProps {
    booking: Booking;
    onClose: () => void;
}

export function BookingAcknowledgment({ booking, onClose }: BookingAcknowledgmentProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const formatTimeSlots = () => {
        if (booking.duration_type === "full-day") {
            return "Full Day (9:00 AM - 4:30 PM)";
        }
        if (booking.selected_slots && booking.selected_slots.length > 0) {
            const sortedSlots = [...booking.selected_slots].sort();
            if (sortedSlots.length === 1) {
                return sortedSlots[0];
            }
            return `${sortedSlots[0]} - ${sortedSlots[sortedSlots.length - 1]}`;
        }
        return `${booking.start_time} - ${booking.end_time}`;
    };

    const addThirtyMinutes = (time: string) => {
        const [hour, minute] = time.split(':');
        const totalMinutes = parseInt(hour) * 60 + parseInt(minute) + 30;
        const newHour = Math.floor(totalMinutes / 60);
        const newMinute = totalMinutes % 60;
        return `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        // Import html2canvas and jspdf dynamically
        const html2canvas = (await import('html2canvas')).default;
        const jsPDF = (await import('jspdf')).default;

        if (printRef.current) {
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`booking-acknowledgment-${booking.id}.pdf`);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="print:hidden">
                    <DialogTitle>Booking Acknowledgment</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 print:hidden">
                    <div className="flex gap-2">
                        <Button onClick={handlePrint} variant="outline" className="flex-1">
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button onClick={handleDownload} className="flex-1 bg-green-600 hover:bg-green-700">
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Acknowledgment Content */}
                <div ref={printRef} className="bg-white p-8 space-y-6 print:p-0">
                    {/* Header */}
                    <div className="text-center border-b-2 border-green-600 pb-4">
                        <h1 className="text-3xl font-bold text-green-700 mb-2">ImpactOne</h1>
                        <h2 className="text-xl font-semibold">Booking Acknowledgment</h2>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-green-600 font-medium">APPROVED</span>
                        </div>
                    </div>

                    {/* Booking Reference */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Booking Reference</p>
                        <p className="font-mono font-bold text-lg">{booking.id.substring(0, 8).toUpperCase()}</p>
                    </div>

                    {/* Event Details */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Event Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Event Title</p>
                                <p className="font-medium">{booking.event_title}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Department</p>
                                <p className="font-medium">{booking.department} - {booking.department_category}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="font-medium">{format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Time</p>
                                <p className="font-medium">{formatTimeSlots()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Expected Attendees</p>
                                <p className="font-medium">{booking.attendees} people</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Resource</p>
                                <p className="font-medium">{booking.resource_name}
                                    {booking.sub_area && ` - ${booking.sub_area}`}
                                </p>
                            </div>
                        </div>

                        {booking.event_description && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600">Description</p>
                                <p className="text-sm mt-1">{booking.event_description}</p>
                            </div>
                        )}
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Contact Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Requester</p>
                                <p className="font-medium">{booking.requester_name}</p>
                                <p className="text-sm text-gray-600">{booking.requester_email}</p>
                            </div>
                            {booking.faculty_incharge && (
                                <div>
                                    <p className="text-sm text-gray-600">Faculty In-charge</p>
                                    <p className="font-medium">{booking.faculty_incharge}</p>
                                    {booking.contact_number && (
                                        <p className="text-sm text-gray-600">{booking.contact_number}</p>
                                    )}
                                    {booking.contact_email && (
                                        <p className="text-sm text-gray-600">{booking.contact_email}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Approval Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Approval Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="font-medium text-green-600">Approved</p>
                            </div>
                            {booking.reviewed_at && (
                                <div>
                                    <p className="text-sm text-gray-600">Approved On</p>
                                    <p className="font-medium">{format(new Date(booking.reviewed_at), 'PPP \'at\' p')}</p>
                                </div>
                            )}
                            {booking.reviewed_by && (
                                <div>
                                    <p className="text-sm text-gray-600">Approved By</p>
                                    <p className="font-medium">{booking.reviewed_by}</p>
                                </div>
                            )}
                            {booking.created_at && (
                                <div>
                                    <p className="text-sm text-gray-600">Requested On</p>
                                    <p className="font-medium">{format(new Date(booking.created_at), 'PPP \'at\' p')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>Please arrive 15 minutes before your scheduled time</li>
                            <li>Ensure the venue is left clean and in good condition</li>
                            <li>Report any damages or issues to the facilities team immediately</li>
                            <li>This acknowledgment must be presented if requested by staff</li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-6 border-t text-sm text-gray-600">
                        <p>This is a computer-generated acknowledgment and does not require a signature.</p>
                        <p className="mt-1">Generated on {format(new Date(), 'PPP \'at\' p')}</p>
                        <p className="mt-2 font-semibold">ImpactOne - Resource Booking System</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
