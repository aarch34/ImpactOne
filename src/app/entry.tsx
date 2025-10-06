
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

const AUTH_ROUTES = ['/login', '/register'];
const APP_ROUTES_PREFIX = '/';

export function Entry({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isAppRoute = !isAuthRoute && pathname !== '/';

  useEffect(() => {
    if (!isUserLoading) {
      if (user && isAuthRoute) {
        // Logged-in user on an auth page, redirect to dashboard
        router.replace('/dashboard');
      } else if (!user && isAppRoute) {
        // Not logged-in user on a protected app page, redirect to login
        router.replace('/login');
      }
    }
  }, [user, isUserLoading, router, isAuthRoute, isAppRoute]);

  // Show a loader while checking auth status, especially on protected routes
  if (isUserLoading && isAppRoute) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Render children immediately for public/auth routes or when auth check is complete
  return <>{children}</>;
}
