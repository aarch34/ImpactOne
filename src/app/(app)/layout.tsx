
"use client";

import { MainNav } from "@/components/app/main-nav";
import { UserNav } from "@/components/app/user-nav";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Briefcase, LifeBuoy, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
        <Sidebar collapsible="icon" className="border-r bg-sidebar text-sidebar-foreground" side="left">
          <SidebarHeader className="p-3 justify-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Briefcase className="text-primary size-7" />
              <h1 className="text-xl font-headline font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                ImpactOne
              </h1>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
          <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        tooltip="Support"
                        className="justify-start"
                    >
                        <Link href="#">
                            <LifeBuoy className="size-5" />
                            <span className="group-data-[collapsible=icon]:hidden">Support</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col">
            <header className="flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="md:hidden" />
                  <div className="relative w-full max-w-sm hidden md:block">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search bookings, venues..."
                        className="w-full bg-muted pl-8"
                      />
                  </div>
                </div>
                <UserNav />
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
                {children}
            </main>
        </div>
    </SidebarProvider>
  );
}
