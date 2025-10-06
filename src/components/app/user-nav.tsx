"use client"

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import { Bell, LifeBuoy, LogOut, Settings, User as UserIcon, Loader2 } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function UserNav() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const userImage = PlaceHolderImages.find(p => p.id === 'user-avatar-main');

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  if (isUserLoading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary" />
  }

  return (
    <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border">
                <AvatarImage src={userImage?.imageUrl} alt="User avatar" data-ai-hint={userImage?.imageHint} />
                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.displayName || 'Anonymous User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                {user?.email || 'No email provided'}
                </p>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
            <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
            </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>Support</span>
            </DropdownMenuItem>
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
