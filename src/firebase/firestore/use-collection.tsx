'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  orderBy,
  limit,
  startAt,
  startAfter,
  endAt,
  endBefore,
  doc,
  getDoc,
  type DocumentData,
  type Query,
  type FirestoreError,
  type Unsubscribe,
  type QueryConstraint,
  type DocumentReference,
} from 'firebase/firestore';

interface UseCollectionOptions<T> {
  query?: Query<T> | null;
  initialData?: T[];
  dependencies?: any[];
}

export function useCollection<T extends DocumentData>({
  query,
  initialData,
  dependencies = [],
}: UseCollectionOptions<T>) {
  const [data, setData] = useState<T[] | undefined>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!query) {
      setData(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe: Unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query, ...dependencies]);

  return { data, loading, error };
}
