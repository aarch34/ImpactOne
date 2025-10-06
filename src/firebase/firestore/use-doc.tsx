'use client';
import { useState, useEffect } from 'react';
import {
  onSnapshot,
  doc,
  type DocumentReference,
  type DocumentData,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore';

interface UseDocOptions<T> {
  ref: DocumentReference<T> | null;
  initialData?: T;
  dependencies?: any[];
}

export function useDoc<T extends DocumentData>({
  ref,
  initialData,
  dependencies = [],
}: UseDocOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!ref) {
      setData(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe: Unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = {
            id: snapshot.id,
            ...snapshot.data(),
          } as T;
          setData(docData);
        } else {
          setData(undefined);
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref, ...dependencies]);

  return { data, loading, error };
}
