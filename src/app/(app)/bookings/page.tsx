"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { venues, buses, departments } from "@/lib/data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@clerk/nextjs';
import { supabase } from "@/lib/supabase/client";

const bookingSchema = z.object({
  resourceType: z.enum(["venue", "bus"], { required_error: "Please select a resource type." }),
  resourceId: z.string().min(1, "Please select a resource."),
  bookingDate: z.date({ required_error: "Please select a booking date." }),
  attendees: z.coerce.number().min(1, "Number of attendees is required."),
  eventTitle: z.string().min(1, "Event title is required."),
  eventDescription: z.string().min(1, "Event description is required."),
  department: z.string().min(1, "Please select your department."),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingsPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isLoaded } = useUser();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const resourceType = form.watch("resourceType");

  const onSubmit = async (data: BookingFormData) => {
    if (!user) return;
    setLoading(true);

    const allResources = [...venues, ...buses];
    const resourceName = allResources.find(r => r.id === data.resourceId)?.name || 'Unknown Resource';

    const newBookingData = {
      resource_type: data.resourceType,
      resource_id: data.resourceId,
      resource_name: resourceName,
      booking_date: data.bookingDate.toISOString(),
      attendees: data.attendees,
      event_title: data.eventTitle,
      event_description: data.eventDescription,
      department: data.department,
      status: 'Pending' as const,
      requester_id: user.id,
      requester_name: user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || "Anonymous User",
    };

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(newBookingData)
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request. Please try again.",
      });
    } else {
      toast({
        title: "Booking Request Submitted!",
        description: "Your request has been sent for approval.",
      });
      form.reset();
    }

    setLoading(false);
  };

  // ✅ Show loading while user is loading
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading booking form...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Create a New Booking</h1>
        <p className="text-muted-foreground">Fill in the details below to request a venue or bus.</p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Booking Form</CardTitle>
            <CardDescription>All requests are subject to approval by the department head.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
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
                      </SelectContent>
                    </Select>
                    {form.formState.errors.resourceType && <p className="text-sm font-medium text-destructive">{form.formState.errors.resourceType.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="resourceId"
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="resource">Resource</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!resourceType}>
                      <SelectTrigger id="resource">
                        <SelectValue placeholder="Select a resource" />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceType === 'venue' && venues.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                        {resourceType === 'bus' && buses.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.resourceId && <p className="text-sm font-medium text-destructive">{form.formState.errors.resourceId.message}</p>}
                  </div>
                )}
              />
            </div>

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
                    {form.formState.errors.bookingDate && <p className="text-sm font-medium text-destructive">{form.formState.errors.bookingDate.message}</p>}
                  </div>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="attendees">Number of Attendees</Label>
                <Input id="attendees" type="number" placeholder="e.g., 50" {...form.register("attendees")} />
                {form.formState.errors.attendees && <p className="text-sm font-medium text-destructive">{form.formState.errors.attendees.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Controller
                name="department"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.department && <p className="text-sm font-medium text-destructive">{form.formState.errors.department.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input id="event-title" placeholder="e.g., Guest Lecture on AI" {...form.register("eventTitle")} />
              {form.formState.errors.eventTitle && <p className="text-sm font-medium text-destructive">{form.formState.errors.eventTitle.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-description">Event Description / Purpose</Label>
              <Textarea id="event-description" placeholder="A brief description of the event." {...form.register("eventDescription")} />
              {form.formState.errors.eventDescription && <p className="text-sm font-medium text-destructive">{form.formState.errors.eventDescription.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading || !user || !isLoaded}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit for Approval
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
