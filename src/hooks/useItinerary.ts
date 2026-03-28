import { useState, useCallback } from 'react';
import { streamItinerary } from '../services/anthropic';
import type { ItineraryData, SearchFormData, Day } from '../types/itinerary';

export function useItinerary() {
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [partialResumen, setPartialResumen] = useState<ItineraryData['resumen'] | null>(null);
  const [streamedDias, setStreamedDias] = useState<Day[]>([]);
  const [streamingDone, setStreamingDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (formData: SearchFormData) => {
    setLoading(true);
    setError(null);
    setItinerary(null);
    setPartialResumen(null);
    setStreamedDias([]);
    setStreamingDone(false);

    try {
      await streamItinerary(formData, {
        onResumen: (resumen) => {
          setPartialResumen(resumen);
          setLoading(false);
        },
        onDia: (dia) => {
          setStreamedDias((prev) => [...prev, dia]);
        },
        onDone: (fullItinerary) => {
          setItinerary(fullItinerary);
          setStreamedDias(fullItinerary.dias);
          setStreamingDone(true);
        },
        onError: (errMsg) => {
          setError(errMsg);
          setLoading(false);
        },
      });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const regenerate = useCallback(
    async (formData: SearchFormData) => generate(formData),
    [generate]
  );

  const reset = useCallback(() => {
    setItinerary(null);
    setPartialResumen(null);
    setStreamedDias([]);
    setStreamingDone(false);
    setError(null);
  }, []);

  return {
    itinerary,
    partialResumen,
    streamedDias,
    streamingDone,
    loading,
    error,
    generate,
    regenerate,
    reset,
  };
}
