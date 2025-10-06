'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User, type Auth } from 'firebase/auth';

export function useUser(auth: Auth) {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  return { user, isUserLoading };
}
