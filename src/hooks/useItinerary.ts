import { useState, useCallback } from 'react';
import { generateItinerary } from '../services/anthropic';
import type { ItineraryData, SearchFormData } from '../types/itinerary';

export function useItinerary() {
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (formData: SearchFormData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateItinerary(formData);
      setItinerary(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerate = useCallback(
    async (formData: SearchFormData) => {
      return generate(formData);
    },
    [generate]
  );

  const reset = useCallback(() => {
    setItinerary(null);
    setError(null);
  }, []);

  return { itinerary, loading, error, generate, regenerate, reset };
}
