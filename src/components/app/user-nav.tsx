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
import { Badge } from "@/components/ui/badge"
import { Bell, LogOut, User as UserIcon, Loader2 } from "lucide-react"

export function UserNav() {
  const { signOut: clerkSignOut } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  // Check if user is admin
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = userEmail === 'impact1.iceas@gmail.com';

  // Fetch pending bookings count for admin
  useEffect(() => {
    async function fetchPendingCount() {
      if (!isAdmin) return;

      const { data, error } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: false })
        .eq('status', 'Pending');

      if (data) {
        setPendingCount(data.length);
      }
    }

    if (isLoaded) {
      fetchPendingCount();

      // Refresh count every 30 seconds
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
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
        <Link href="/pending-approvals">
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
              >
                {pendingCount > 9 ? '9+' : pendingCount}
              </Badge>
            )}
          </Button>
        </Link>
      )}

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {getInitials(user.fullName || user.firstName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.fullName || user.firstName || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/pending-approvals" className="cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Pending Approvals</span>
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {pendingCount}
                    </Badge>
                  )}
                </Link>
              </DropdownMenuItem>
            )}
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
