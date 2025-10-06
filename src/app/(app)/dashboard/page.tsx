
"use client";

import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BookOpenCheck, CalendarCheck, Clock, Loader2 } from "lucide-react";
import { departments, venues, buses } from "@/lib/data";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { Booking } from '@/lib/types';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/bookings`));
  }, [firestore, user]);

  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);
  
  const userAvatars = PlaceHolderImages.filter(p => p.id.startsWith('user-avatar-'));

  const dashboardStats = useMemo(() => {
    if (!bookings) {
      return {
        totalBookings: 0,
        upcomingEvents: 0,
        pendingRequests: 0,
        activeResources: venues.length + buses.length,
        chartData: [],
        recentActivity: [],
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = bookings.filter(b => b.status === 'Approved' && b.bookingDate.toDate() >= today).length;
    const pendingRequests = bookings.filter(b => b.status === 'Pending').length;

    const resourceUsage = bookings.reduce((acc, booking) => {
      const name = booking.resourceName;
      if (!acc[name]) {
        acc[name] = 0;
      }
      acc[name]++;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(resourceUsage).map(([name, total]) => ({ name, total }));
    
    const recentActivity = [...bookings]
        .sort((a, b) => b.bookingDate.toMillis() - a.bookingDate.toMillis())
        .slice(0, 3);

    return {
      totalBookings: bookings.length,
      upcomingEvents,
      pendingRequests,
      activeResources: venues.length + buses.length,
      chartData,
      recentActivity,
    };
  }, [bookings]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, here's a summary of campus activities.</p>
        </div>
      </div>
      
      <Tabs defaultValue={departments[0].id}>
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 md:w-max">
          {departments.map((dept) => (
            <TabsTrigger key={dept.id} value={dept.id}>{dept.name}</TabsTrigger>
          ))}
        </TabsList>
        {departments.map((dept) => (
          <TabsContent key={dept.id} value={dept.id}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.upcomingEvents}</div>
                  <p className="text-xs text-muted-foreground">Approved and upcoming</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.pendingRequests}</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Resources</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.activeResources}</div>
                  <p className="text-xs text-muted-foreground">{venues.length} venues, {buses.length} buses</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 mt-4 grid-cols-1 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle className="font-headline">Booking Overview</CardTitle>
                  <CardDescription>Usage of all resources.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ChartContainer config={{}} className="min-h-[350px] w-full">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart accessibilityLayer data={dashboardStats.chartData}>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                 <CardHeader>
                  <CardTitle className="font-headline">Recent Activity</CardTitle>
                  <CardDescription>Latest booking requests.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {dashboardStats.recentActivity.length > 0 ? dashboardStats.recentActivity.map((booking, index) => {
                      const avatar = userAvatars[index % userAvatars.length];
                      return (
                        <div className="flex items-center" key={booking.id}>
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={avatar.imageUrl} alt="Avatar" data-ai-hint={avatar.imageHint} />
                            <AvatarFallback>{booking.requesterName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{booking.requesterName}</p>
                            <p className="text-sm text-muted-foreground">Booked {booking.resourceName}</p>
                          </div>
                          <div className="ml-auto font-medium text-xs text-muted-foreground">
                            {format(booking.bookingDate.toDate(), 'PP')}
                          </div>
                        </div>
                      )
                    }) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                    )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

    