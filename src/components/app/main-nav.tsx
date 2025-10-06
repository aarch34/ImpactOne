
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, Calendar, CalendarPlus, History, Bot, User, ShieldCheck } from "lucide-react";
import { useUser } from "@/firebase";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "New Booking", icon: CalendarPlus },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/history", label: "History", icon: History },
  { href: "/recommender", label: "AI Recommender", icon: Bot },
  { href: "/profile", label: "Profile", icon: User },
];

const adminLink = { href: "/admin", label: "Admin", icon: ShieldCheck };

export function MainNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const isAdmin = user?.email === 'admin.impact@iceas.ac.in';
  
  const navLinks = [...links];
  if (isAdmin) {
    navLinks.push(adminLink);
  }

  return (
    <SidebarMenu>
      {navLinks.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
            tooltip={link.label}
            className="justify-start"
          >
            <Link href={link.href}>
              <link.icon className="size-5" />
              <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
