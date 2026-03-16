import { useState, useCallback } from 'react';
import { searchLocations, detectDestinationLevel } from '../services/nominatim';
import type { NominatimResult } from '../types/itinerary';

export function useNominatim() {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchLocations(query);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
  }, []);

  return { results, loading, search, clear, detectDestinationLevel };
}
