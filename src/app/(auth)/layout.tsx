
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        // Wait until the auth check is complete.
        if (!isUserLoading && user) {
            // If loading is done and there IS a user, redirect to the dashboard.
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);

    // While checking auth state, or if we found a user and are about to redirect,
    // show a full-screen loader.
    if (isUserLoading || user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    // If loading is done and there's NO user, show the children (Login page).
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            {children}
        </div>
    );
}
