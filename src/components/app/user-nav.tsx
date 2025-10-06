"use client"

import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, updateDoc, doc } from "firebase/firestore";

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
  const auth = useAuth();
  const { user, isUserLoading } = useUser(auth);
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  // Check if user is admin
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('Admin');

  // ✅ Fix: Use useMemoFirebase to properly memoize the query
  const pendingBookingsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, "bookings"), where("status", "==", "Pending"));
  }, [isAdmin, firestore]);
  
  const { data: pendingBookings } = useCollection(pendingBookingsQuery);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleApproval = async (bookingId: string, action: 'Approved' | 'Rejected') => {
    if (!firestore) return;
    
    try {
      await updateDoc(doc(firestore, "bookings", bookingId), {
        status: action,
        reviewedAt: new Date(),
        reviewedBy: user?.email
      });
      
      toast({
        title: `Booking ${action}`,
        description: `The booking request has been ${action.toLowerCase()}.`,
      });
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

  if (isUserLoading || !auth) {
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
                              {getInitials(booking.requesterName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">
                              {booking.requesterName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.eventTitle}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              📍 {booking.resourceName}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(booking.bookingDate.toDate(), 'MMM dd, yyyy')}
                            </div>
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
                <AvatarFallback>{getInitials(user?.displayName || user?.email)}</AvatarFallback>
            </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'No email provided'}
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
