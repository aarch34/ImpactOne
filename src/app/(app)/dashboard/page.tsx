"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { supabase, type Booking } from '@/lib/supabase/client';
import { Calendar, Clock, MapPin, TrendingUp, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const ADMIN_EMAIL = 'impact1.iceas@gmail.com';

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const { isLoaded, isSignedIn, user } = useUser();

  // Check if user is admin
<<<<<<< HEAD
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = userEmail === 'impact1.iceas@gmail.com';
=======
  const isAdmin = user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;
>>>>>>> 4ee35ad4c2fca4580f9a1483f570442de5b3c91e

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;

      try {
<<<<<<< HEAD
        // Query bookings for stats - all bookings (no limit)
        let statsQuery = supabase
          .from('bookings')
          .select('*')
          .order('booking_date', { ascending: false });
=======
        // For admin: fetch ALL bookings, for regular users: fetch only their bookings
        const query = supabase
          .from('bookings')
          .select('*')
          .order('booking_date', { ascending: false });

        // Only filter by requester_id for non-admin users
        const { data, error } = isAdmin
          ? await query.limit(10)
          : await query.eq('requester_id', user.id).limit(10);
>>>>>>> 4ee35ad4c2fca4580f9a1483f570442de5b3c91e

        // Only filter by requester_id for non-admin users
        if (!isAdmin) {
          statsQuery = statsQuery.eq('requester_id', user.id);
        }

        const { data: allData, error: statsError } = await statsQuery;

        if (statsError) {
          console.error("Error fetching bookings stats:", statsError);
          setLoading(false);
          return;
        }

        // Calculate stats from all bookings
        const statsData = {
          total: allData?.length || 0,
          pending: allData?.filter(b => b.status === "Pending").length || 0,
          approved: allData?.filter(b => b.status === "Approved").length || 0,
          rejected: allData?.filter(b => b.status === "Rejected").length || 0,
        };
        setStats(statsData);

        // Get only the recent 10 bookings for display
        const recentBookings = allData?.slice(0, 10) || [];
        setBookings(recentBookings);

      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && user) {
      fetchBookings();
    }
  }, [isLoaded, user, isAdmin]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-muted-foreground">Please sign in to view your dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Welcome, {isAdmin ? "Admin" : (user.firstName || "User")}!
        </h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Overview of your booking requests and status"
            : "Overview of your booking requests and status"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All your booking requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Successfully approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <MapPin className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Not approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Your latest booking requests (sorted by date)</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-4" />
              <p>No bookings yet</p>
              <p className="text-sm">Create your first booking request to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{booking.event_title || "Untitled Event"}</h3>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status || "Unknown"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{booking.resource_name || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {booking.booking_date
                            ? format(new Date(booking.booking_date), "MMM d, yyyy")
                            : "No date"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {booking.start_time || "N/A"} - {booking.end_time || "N/A"}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {booking.department || "No department"} • {booking.attendees || 0} attendees
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
