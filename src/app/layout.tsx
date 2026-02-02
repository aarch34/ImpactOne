import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { PWAInstallPrompt } from "@/components/app/pwa-install-prompt";

export const metadata: Metadata = {
  title: "ImpactOne - Campus Resource Management",
  description: "Streamline venue and bus booking for your campus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_cXVpY2staGlwcG8tNzUuY2xlcmsuYWNjb3VudHMuZGV2JA"}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <link rel="manifest" href="/manifest.json" />
        </head>
        <body className={cn('font-body antialiased')}>
          {children}
          <Toaster />
          <PWAInstallPrompt />
        </body>
      </html>
    </ClerkProvider>
  );
}
