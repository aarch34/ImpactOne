import type { Timestamp } from "firebase/firestore";

export type Booking = {
  id: string;
  resourceType: 'venue' | 'bus';
  resourceId: string;
  resourceName: string;
  bookingDate: Timestamp;
  attendees: number;
  eventTitle: string;
  eventDescription: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requesterId: string;
  requesterName: string;
  department: string;
};

export type AdminBooking = Booking & {
  // Potentially add admin-specific fields later if needed
};
