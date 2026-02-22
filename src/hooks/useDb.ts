import { useEffect, useState } from 'react';
import { getConnection, type AsyncDuckDBConnection } from '../db/client';

interface UseDbResult {
  conn: AsyncDuckDBConnection | null;
  loading: boolean;
  error: Error | null;
}

export function useDb(): UseDbResult {
  const [conn, setConn] = useState<AsyncDuckDBConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    getConnection()
      .then((c) => {
        if (!cancelled) {
          setConn(c);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { conn, loading, error };
}
