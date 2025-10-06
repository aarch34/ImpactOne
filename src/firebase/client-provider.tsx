'use client';
import { ReactNode, useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app } = initializeFirebase();

  const auth = useMemo(() => getAuth(app), [app]);
  const firestore = useMemo(() => getFirestore(app), [app]);

  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
