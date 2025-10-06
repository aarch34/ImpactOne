'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Briefcase } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter(); // ✅ Added router for redirection

  // ✅ Helper to show friendly Firebase error messages
  const handleFirebaseError = (code: string) => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    if (!auth) {
      setError("Authentication service is not available.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);

      toast({
        title: 'Login Successful',
        description: "Welcome back! Redirecting...",
      });

      // ✅ Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (e: any) {
      const errorMessage = handleFirebaseError(e.code || '');
      setError(errorMessage);

      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Briefcase className="text-primary size-8" />
          <h1 className="text-2xl font-headline font-bold">
            ImpactOne
          </h1>
        </div>
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="text-sm font-medium text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              aria-invalid={!!errors.password}
              aria-describedby="password-error"
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" className="text-sm font-medium text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>

           <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="underline hover:text-primary">
                Sign Up
              </Link>
            </p>

        </CardContent>
      </form>
    </Card>
  );
}
