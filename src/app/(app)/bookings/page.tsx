"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, UtensilsCrossed, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { venues, buses } from "@/lib/data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ✅ Time slots with lunch break excluded
const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30",
  // 13:00 (1:00 PM) - 14:00 (2:00 PM) = LUNCH BREAK
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

// ✅ Updated department structure
const DEPARTMENTS = {
  Engineering: [
    "AIML", "CSE", "Electronics", "Automation and Robotics",
    "Mechanical", "Civil", "Data Science", "Cyber Security"
  ],
  Management: ["MBA", "BBA", "BCom", "Other Bachelor's Degree"],
  Architecture: ["Architecture"]
};

const bookingSchema = z.object({
  resourceType: z.enum(["venue", "bus", "turf"], { required_error: "Please select a resource type." }),
  resourceId: z.string().optional(),
  subArea: z.string().optional(),
  selectedSlots: z.array(z.string()).min(1, "Please select at least one time slot."),
  durationType: z.enum(["custom", "full-day"], { required_error: "Please select duration." }),
  bookingDate: z.date({ required_error: "Please select a booking date." }),
  attendees: z.coerce.number().min(1, "Number of attendees is required."),
  eventTitle: z.string().min(1, "Event title is required."),
  eventDescription: z.string().min(1, "Event description is required."),
  departmentCategory: z.string().min(1, "Please select department category."),
  department: z.string().min(1, "Please select your department."),
  facultyIncharge: z.string().min(2, "Faculty in-charge name is required."),
  contactNumber: z.string().min(10, "Valid contact number is required.").max(15),
  contactEmail: z.string().email("Valid email is required."),
}).refine((data) => {
  if (data.resourceType === 'venue' || data.resourceType === 'bus') {
    return !!data.resourceId;
  }
  if (data.resourceType === 'turf') {
    return !!data.subArea;
  }
  return true;
}, {
  message: "Please complete all required fields for the selected resource type.",
  path: ["resourceType"]
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const { toast } = useToast();
  const { isLoaded, user } = useUser();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      selectedSlots: [],
      durationType: "custom"
    }
  });

  const resourceType = form.watch("resourceType");
  const durationType = form.watch("durationType");
  const departmentCategory = form.watch("departmentCategory");
  const bookingDate = form.watch("bookingDate");
  const resourceId = form.watch("resourceId");
  const subArea = form.watch("subArea");

  // ✅ Check for conflicts whenever key fields change
  useEffect(() => {
    if (bookingDate && selectedSlots.length > 0) {
      if ((resourceType === 'venue' && resourceId) ||
        (resourceType === 'bus' && resourceId) ||
        (resourceType === 'turf' && subArea)) {
        checkAvailability();
      }
    }
  }, [bookingDate, selectedSlots, resourceId, subArea, resourceType]);

  // ✅ Check availability function using Supabase
  const checkAvailability = async () => {
    setCheckingAvailability(true);
    setConflictWarning(null);

    try {
      const dateString = format(bookingDate, "yyyy-MM-dd");

      // Query for bookings on same date and resource
      let query = supabase
        .from('bookings')
        .select('*')
        .in('status', ['Pending', 'Approved']);

      if (resourceType === 'venue' || resourceType === 'bus') {
        query = query.eq('resource_id', resourceId);
      } else if (resourceType === 'turf') {
        query = query.eq('sub_area', subArea).eq('facility', 'Turf');
      }

      const { data: bookings, error } = await query;

      if (error) {
        console.error('Error checking availability:', error);
        return;
      }

      const conflicts: any[] = [];

      bookings?.forEach(booking => {
        const bookingDateStr = format(new Date(booking.booking_date), "yyyy-MM-dd");

        // Check if same date
        if (bookingDateStr === dateString) {
          // Check for time slot overlap
          const bookedSlots = booking.selected_slots || [];
          const hasOverlap = selectedSlots.some(slot => bookedSlots.includes(slot));

          if (hasOverlap) {
            conflicts.push({
              eventTitle: booking.event_title,
              department: booking.department,
              slots: bookedSlots,
              status: booking.status
            });
          }
        }
      });

      if (conflicts.length > 0) {
        const conflictMsg = conflicts.map(c =>
          `"${c.eventTitle}" (${c.department}) - ${c.status}`
        ).join(', ');
        setConflictWarning(
          `⚠️ This ${resourceType === 'turf' ? subArea + ' area' : 'resource'} is already booked on ${format(bookingDate, "PPP")} for: ${conflictMsg}`
        );
      }

    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // ✅ Toggle slot selection
  const toggleSlot = (slot: string) => {
    const currentSlots = form.getValues("selectedSlots") || [];
    let newSlots: string[];

    if (currentSlots.includes(slot)) {
      newSlots = currentSlots.filter(s => s !== slot);
    } else {
      newSlots = [...currentSlots, slot].sort();
    }

    setSelectedSlots(newSlots);
    form.setValue("selectedSlots", newSlots);
  };

  // ✅ Auto-select all slots for full day (excluding lunch)
  const handleDurationChange = (value: "custom" | "full-day") => {
    form.setValue("durationType", value);
    if (value === "full-day") {
      setSelectedSlots(TIME_SLOTS);
      form.setValue("selectedSlots", TIME_SLOTS);
    } else {
      setSelectedSlots([]);
      form.setValue("selectedSlots", []);
    }
  };

  // ✅ Reset department when category changes
  const handleDepartmentCategoryChange = (value: string) => {
    form.setValue("departmentCategory", value);
    form.setValue("department", "");
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!user || !isLoaded) return;

    // ✅ Block submission if there's a conflict
    if (conflictWarning) {
      toast({
        variant: "destructive",
        title: "❌ Booking Conflict Detected",
        description: "Please check the calendar for available slots or choose a different time/date.",
      });
      return;
    }

    setLoading(true);

    const resourceTypeValue = form.watch("resourceType");
    let resourceName = '';
    let finalResourceId = data.resourceId;

    if (resourceTypeValue === 'venue') {
      resourceName = venues.find(r => r.id === data.resourceId)?.name || 'Unknown Venue';
    } else if (resourceTypeValue === 'bus') {
      resourceName = buses.find(r => r.id === data.resourceId)?.name || 'Unknown Bus';
    } else if (resourceTypeValue === 'turf') {
      resourceName = `${data.subArea} Area`;
      // Generate a resource ID for turf since it doesn't have one selected
      finalResourceId = `turf-${data.subArea?.toLowerCase().replace(/\s+/g, '-')}`;
    }

    const sortedSlots = [...data.selectedSlots].sort();
    const startTime = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    const [hour, minute] = lastSlot.split(':');
    const endTime = `${hour}:${parseInt(minute) + 30 === 60 ? String(parseInt(hour) + 1).padStart(2, '0') : hour}:${parseInt(minute) + 30 === 60 ? '00' : String(parseInt(minute) + 30)}`;

    // ✅ Get user display name and email
    const userName = user.fullName ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.emailAddresses[0]?.emailAddress?.split('@')[0] ||
      "Anonymous";
    const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || '';

    try {
      // ✅ CREATE BOOKING DATA OBJECT FOR SUPABASE
      const bookingData = {
        resource_type: data.resourceType,
        resource_id: finalResourceId,
        resource_name: resourceName,
        sub_area: data.subArea || null,
        facility: resourceTypeValue === 'turf' ? 'Turf' : resourceTypeValue,
        booking_date: data.bookingDate.toISOString(),
        start_time: startTime,
        end_time: endTime,
        selected_slots: sortedSlots,
        duration_type: data.durationType,
        attendees: data.attendees,
        event_title: data.eventTitle,
        event_description: data.eventDescription,
        department_category: data.departmentCategory,
        department: data.department,
        faculty_incharge: data.facultyIncharge,
        contact_number: data.contactNumber,
        contact_email: data.contactEmail,
        status: "Pending" as const,
        requester_id: user.id,
        requester_name: userName,
        requester_email: userEmail,
      };

      console.log('📝 Creating booking:', bookingData);

      // ✅ SAVE TO SUPABASE
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Booking created:', booking);

      toast({
        title: "✅ Booking Request Submitted!",
        description: `Your booking for ${resourceName} has been sent for approval.`,
      });

      form.reset();
      setSelectedSlots([]);
      setConflictWarning(null);

    } catch (error: any) {
      console.error('❌ Booking error:', error);
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: error.message || "Please try again. Check console for details.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading booking form...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-muted-foreground">Please sign in to create a booking</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Create a New Booking</h1>
        <p className="text-muted-foreground">Fill in the details below to request a venue, bus, or turf slot.</p>
      </div>

      {/* ✅ CONFLICT WARNING ALERT */}
      {conflictWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Booking Conflict Detected</AlertTitle>
          <AlertDescription>
            {conflictWarning}
            <br />
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-destructive underline"
              onClick={() => window.open('/calendar', '_blank')}
            >
              → Check Calendar for Available Slots
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {checkingAvailability && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Checking availability...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Booking Form</CardTitle>
            <CardDescription>All requests are subject to approval by the department head.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {/* Resource Type Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <Controller
                name="resourceType"
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="resource-type">Resource Type</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="resource-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="venue">Venue</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="turf">🏟️ Turf</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.resourceType && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.resourceType.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {resourceType === 'venue' && (
                <Controller
                  name="resourceId"
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="resource">Venue</Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="resource">
                          <SelectValue placeholder="Select a venue" />
                        </SelectTrigger>
                        <SelectContent>
                          {venues.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.resourceId && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.resourceId.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              )}

              {resourceType === 'bus' && (
                <Controller
                  name="resourceId"
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="resource">Bus</Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="resource">
                          <SelectValue placeholder="Select a bus" />
                        </SelectTrigger>
                        <SelectContent>
                          {buses.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.resourceId && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.resourceId.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              )}

              {resourceType === 'turf' && (
                <Controller
                  name="subArea"
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="sub-area">Turf Area</Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="sub-area">
                          <SelectValue placeholder="Select turf area" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Football">⚽ Football Area</SelectItem>
                          <SelectItem value="Badminton">🏸 Badminton Area</SelectItem>
                          <SelectItem value="Table Tennis">🏓 Table Tennis Area</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              )}
            </div>

            {/* Date & Attendees */}
            <div className="grid md:grid-cols-2 gap-4">
              <Controller
                name="bookingDate"
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="booking-date">Booking Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.bookingDate && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.bookingDate.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="attendees">Number of Attendees</Label>
                <Input id="attendees" type="number" placeholder="e.g., 50" {...form.register("attendees")} />
                {form.formState.errors.attendees && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.attendees.message}
                  </p>
                )}
              </div>
            </div>

            {/* DURATION TYPE */}
            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={durationType === "custom" ? "default" : "outline"}
                  onClick={() => handleDurationChange("custom")}
                  className="flex-1"
                >
                  Custom Slots
                </Button>
                <Button
                  type="button"
                  variant={durationType === "full-day" ? "default" : "outline"}
                  onClick={() => handleDurationChange("full-day")}
                  className="flex-1"
                >
                  Full Day (9:00 AM - 5:00 PM)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Note: 1:00 PM - 2:00 PM is lunch break</p>
            </div>

            {/* TIME SLOT GRID */}
            <div className="space-y-2">
              <Label>Select Time Slots {selectedSlots.length > 0 && `(${selectedSlots.length} selected)`}</Label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedSlots.includes(slot);
                  return (
                    <Button
                      key={slot}
                      type="button"
                      variant="outline"
                      disabled={durationType === "full-day"}
                      onClick={() => toggleSlot(slot)}
                      className={cn(
                        "h-12 text-sm font-medium transition-all",
                        isSelected && "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
                        durationType === "full-day" && "opacity-50"
                      )}
                    >
                      {slot}
                    </Button>
                  );
                })}

                <div className="col-span-4 flex items-center justify-center gap-2 py-2 px-4 bg-orange-50 border border-orange-200 rounded-md">
                  <UtensilsCrossed className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Lunch Break: 1:00 PM - 2:00 PM</span>
                </div>
              </div>
              {form.formState.errors.selectedSlots && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.selectedSlots.message}
                </p>
              )}
            </div>

            {/* DEPARTMENT SELECTION */}
            <div className="grid md:grid-cols-2 gap-4">
              <Controller
                name="departmentCategory"
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="department-category">Department Category</Label>
                    <Select onValueChange={handleDepartmentCategoryChange} defaultValue={field.value}>
                      <SelectTrigger id="department-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(DEPARTMENTS).map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.departmentCategory && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.departmentCategory.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="department"
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!departmentCategory}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentCategory && DEPARTMENTS[departmentCategory as keyof typeof DEPARTMENTS]?.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.department && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.department.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* FACULTY IN-CHARGE SECTION */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg">Faculty In-charge Details</h3>

              <div className="space-y-2">
                <Label htmlFor="faculty-incharge">Faculty In-charge Name</Label>
                <Input
                  id="faculty-incharge"
                  placeholder="e.g., Dr. John Doe"
                  {...form.register("facultyIncharge")}
                />
                {form.formState.errors.facultyIncharge && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.facultyIncharge.message}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-number">Contact Number</Label>
                  <Input
                    id="contact-number"
                    type="tel"
                    placeholder="e.g., +91 98765 43210"
                    {...form.register("contactNumber")}
                  />
                  {form.formState.errors.contactNumber && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.contactNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="e.g., faculty@college.edu"
                    {...form.register("contactEmail")}
                  />
                  {form.formState.errors.contactEmail && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.contactEmail.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input id="event-title" placeholder="e.g., Guest Lecture on AI" {...form.register("eventTitle")} />
              {form.formState.errors.eventTitle && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.eventTitle.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Event Description / Purpose</Label>
              <Textarea id="event-description" placeholder="A brief description of the event." {...form.register("eventDescription")} />
              {form.formState.errors.eventDescription && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.eventDescription.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || !user || !isLoaded || !!conflictWarning}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit for Approval
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
