import { useState, useCallback } from 'react';
import { gridDataClient } from '../api/client';
import { tradeRowToObject } from '../utils/tradeRowMapper';

export function useSearchTrades() {
  const [results, setResults] = useState<ReturnType<typeof tradeRowToObject>[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (field: string, value: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gridDataClient.searchTrades({ field, value });
      setResults(response.trades.map(tradeRowToObject));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return { results, loading, error, search, clear };
}
