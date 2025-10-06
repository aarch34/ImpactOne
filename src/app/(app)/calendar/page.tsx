import { BookingCalendar } from "@/components/app/booking-calendar";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Booking Calendar</h1>
        <p className="text-muted-foreground">View all scheduled events and resource availability.</p>
      </div>
      <BookingCalendar />
    </div>
  )
}
