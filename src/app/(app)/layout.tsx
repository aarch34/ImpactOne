
"use client";

import { MainNav } from "@/components/app/main-nav";
import { UserNav } from "@/components/app/user-nav";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Briefcase, LifeBuoy, Search, Mail, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const isAdmin = user?.primaryEmailAddress?.emailAddress === 'impact1.iceas@gmail.com';


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
            {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Admin"
                  className="justify-start"
                >
                  <Link href="/admin">
                    <ShieldCheck className="size-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <AlertDialog>
              <SidebarMenuItem>
                <AlertDialogTrigger asChild>
                  <SidebarMenuButton
                    tooltip="Support"
                    className="justify-start"
                  >
                    <LifeBuoy className="size-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Support</span>
                  </SidebarMenuButton>
                </AlertDialogTrigger>
              </SidebarMenuItem>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Contact Support</AlertDialogTitle>
                  <AlertDialogDescription>
                    Need help? Click the button below to send an email to the system administrator. Please include a detailed description of your issue.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <a href="mailto:impact1.iceas@gmail.com">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Admin
                    </a>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
        <footer className="border-t py-4 px-6 text-center text-xs text-muted-foreground bg-background/50 backdrop-blur-sm">
          <p>
            Developed by <a href="https://aarx.space" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline">Thejaswin P (1IC23CS082)</a> and <span className="font-semibold text-foreground">Aarcha U (1IC21AI001)</span>
          </p>
        </footer>
      </div>
    </SidebarProvider>
  );
}
