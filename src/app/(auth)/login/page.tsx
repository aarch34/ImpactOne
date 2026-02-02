import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary/90',
            card: 'shadow-lg',
          },
        }}
        routing="hash"
        signUpUrl="/register"
        afterSignInUrl="/dashboard"
      />
    </div>
  );
}
