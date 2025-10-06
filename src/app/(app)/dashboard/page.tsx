"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BookOpenCheck, CalendarCheck, Clock } from "lucide-react";
import { departments } from "@/lib/data";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const chartData = [
  { name: "Auditorium", total: 32 },
  { name: "Impact Greens", total: 45 },
  { name: "Ramanujan Hall", total: 28 },
  { name: "Bus 1", total: 19 },
  { name: "Bus 2", total: 25 },
];

export default function DashboardPage() {
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
                  <div className="text-2xl font-bold">152</div>
                  <p className="text-xs text-muted-foreground">+12 since last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">2 scheduled for today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Requires your attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Resources</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">3 venues, 2 buses</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 mt-4 grid-cols-1 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle className="font-headline">Booking Overview</CardTitle>
                  <CardDescription>Monthly usage of all resources.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ChartContainer config={{}} className="min-h-[350px] w-full">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart accessibilityLayer data={chartData}>
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
                  <CardDescription>Latest booking requests and approvals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="https://picsum.photos/seed/user1/40/40" alt="Avatar" data-ai-hint="profile picture" />
                        <AvatarFallback>AK</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Anil Kumar</p>
                        <p className="text-sm text-muted-foreground">Booked Ramanujan Hall</p>
                      </div>
                      <div className="ml-auto font-medium text-xs text-muted-foreground">5m ago</div>
                    </div>
                    <div className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="https://picsum.photos/seed/user2/40/40" alt="Avatar" data-ai-hint="profile picture" />
                        <AvatarFallback>SP</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Sunita Patel</p>
                        <p className="text-sm text-muted-foreground">Request for Auditorium was approved</p>
                      </div>
                      <div className="ml-auto font-medium text-xs text-muted-foreground">1h ago</div>
                    </div>
                    <div className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="https://picsum.photos/seed/user3/40/40" alt="Avatar" data-ai-hint="profile picture" />
                        <AvatarFallback>RJ</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Rajesh Joshi</p>
                        <p className="text-sm text-muted-foreground">Requested Bus 1 for a field trip</p>
                      </div>
                      <div className="ml-auto font-medium text-xs text-muted-foreground">3h ago</div>
                    </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
