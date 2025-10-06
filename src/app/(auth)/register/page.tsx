
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Briefcase } from 'lucide-react';
import { departments } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const registerSchema = z.object({
  displayName: z.string().min(1, 'Full name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  department: z.string().min(1, 'Please select your department.'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    if (!auth || !firestore) {
      setError("Services are not available.");
      setLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: data.displayName,
      });

      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: data.displayName,
        department: data.department,
        role: 'Faculty', // Default role
      });

      toast({
        title: 'Account Created',
        description: 'You have successfully signed up.',
      });
      
    } catch (e: any) {
      const errorMessage = e.message || 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
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
        <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
        <CardDescription>Create an account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Full Name</Label>
            <Input id="displayName" type="text" placeholder="John Doe" {...register('displayName')} />
            {errors.displayName && <p className="text-sm font-medium text-destructive">{errors.displayName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
            {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
          </div>
           <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                )}
              />
              {errors.department && <p className="text-sm font-medium text-destructive">{errors.department.message}</p>}
            </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
