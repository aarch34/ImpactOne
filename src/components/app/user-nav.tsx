"use client"

import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, type Booking } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Bell, LogOut, User as UserIcon, Loader2, Check, X, Calendar } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export function UserNav() {
  const { signOut: clerkSignOut } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);

  // Check if user is admin
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = userEmail === 'thejaswinp6@gmail.com';

  // Fetch pending bookings for admin
  useEffect(() => {
    async function fetchPendingBookings() {
      if (!isAdmin) return;

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'Pending');

      if (data) {
        setPendingBookings(data);
      }
    }

    if (isLoaded) {
      fetchPendingBookings();
    }
  }, [isAdmin, isLoaded]);

  const handleLogout = async () => {
    try {
      await clerkSignOut();
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleApproval = async (bookingId: string, action: 'Approved' | 'Rejected') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          reviewed_by: userEmail
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: `Booking ${action}`,
        description: `The booking request has been ${action.toLowerCase()}.`,
      });

      // Refresh pending bookings
      const { data } = await supabase.from('bookings').select('*').eq('status', 'Pending');
      if (data) setPendingBookings(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking status.",
      });
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  if (!isLoaded || !user) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary" />
  }

  return (
    <div className="flex items-center gap-4">
      {/* Admin Notification Bell */}
      {isAdmin && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              {pendingBookings && pendingBookings.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {pendingBookings.length}
                </Badge>
              )}
              <span className="sr-only">
                {pendingBookings?.length || 0} pending notifications
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Pending Approvals</h3>
              <p className="text-sm text-muted-foreground">
                {pendingBookings?.length || 0} requests awaiting your review
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {pendingBookings && pendingBookings.length > 0 ? (
                pendingBookings.map((booking) => (
                  <div key={booking.id} className="p-4 border-b last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(booking.requester_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">
                            {booking.requester_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.event_title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            📍 {booking.resource_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            📅 {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            👥 {booking.attendees} attendees • {booking.department}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApproval(booking.id, 'Approved')}
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApproval(booking.id, 'Rejected')}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Reject</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending requests</p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Regular users see nothing or regular bell */}
      {!isAdmin && (
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback>{getInitials(user?.fullName || user?.firstName || userEmail)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.fullName || user?.firstName || userEmail?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail || 'No email provided'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
