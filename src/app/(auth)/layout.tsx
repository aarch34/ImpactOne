
'use client';

// This layout simply centers the content within it.
// The redirection logic is now handled by the root page.tsx.
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            {children}
        </div>
    );
}
