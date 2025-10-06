
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Bot, CalendarCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-bold font-headline">ImpactOne</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Login
          </Link>
          <Button asChild>
            <Link href="/login" prefetch={false}>
              Get Started
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Unified Campus Resource Management
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    ImpactOne streamlines venue and bus booking for your entire campus, powered by AI to make resource allocation smarter and simpler.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login" prefetch={false}>
                      Book a Venue
                    </Link>
                  </Button>
                </div>
              </div>
              <img
                src="https://picsum.photos/seed/impact/600/400"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="university campus"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Everything You Need in One Place</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From intelligent recommendations to seamless approvals, ImpactOne is designed to make campus resource management effortless and efficient for everyone.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <Card>
                <CardHeader className="flex-row items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Bot className="w-6 h-6 text-primary" />
                    </div>
                  <CardTitle>Smart Venue Recommender</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Let our AI assistant help you find the perfect venue for your event based on your specific requirements, saving you time and effort.</p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex-row items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <CalendarCheck className="w-6 h-6 text-primary" />
                    </div>
                  <CardTitle>Effortless Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Book venues or buses in just a few clicks through our intuitive interface. Track your booking status in real-time from your dashboard.</p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex-row items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                  <CardTitle>Centralized Admin Oversight</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Admins can manage all booking requests from a single dashboard, with simple one-click approvals or rejections.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 ImpactOne. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
