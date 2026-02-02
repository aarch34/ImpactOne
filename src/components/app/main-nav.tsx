
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { LayoutDashboard, Calendar, CalendarPlus, History, Bot, ClipboardCheck } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const userLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "New Booking", icon: CalendarPlus },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/history", label: "History", icon: History },
  { href: "/recommender", label: "AI Recommender", icon: Bot },
];

const adminLinks = [
  { href: "/pending-approvals", label: "Pending Approvals", icon: ClipboardCheck },
];

export function MainNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const isAdmin = user?.primaryEmailAddress?.emailAddress === 'thejaswinp6@gmail.com';

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {userLinks.map((link) => (
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
        </SidebarGroupContent>
      </SidebarGroup>

      {isAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminLinks.map((link) => (
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
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
}
