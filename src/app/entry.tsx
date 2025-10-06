"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { Loader2 } from 'lucide-react';

const AUTH_ROUTES = ['/login', '/register'];
const APP_ROUTES_PREFIX = '/';

export function Entry({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser(auth);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isAppRoute = !isAuthRoute && pathname !== '/';

  useEffect(() => {
    // Only perform redirects after auth state is fully loaded
    if (!isUserLoading && auth) {
      if (user && isAuthRoute) {
        // Logged-in user on an auth page, redirect to dashboard
        router.replace('/dashboard');
      } else if (!user && isAppRoute) {
        // Not logged-in user on a protected app page, redirect to login
        router.replace('/login');
      }
    }
  }, [user, isUserLoading, router, isAuthRoute, isAppRoute, auth]);

  // Show a loader while checking auth status for any route that requires auth
  if (isUserLoading || !auth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render protected content until auth is confirmed
  if (isAppRoute && !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Render children when auth check is complete and appropriate
  return <>{children}</>;
}
