import { useState, useEffect } from 'react';
import { searchImages } from '../services/wikimedia';
import type { ItineraryData, WikimediaImage } from '../types/itinerary';

export function useWikimedia(destination: string | null, itinerary: ItineraryData | null = null) {
  const [images, setImages] = useState<WikimediaImage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!destination) return;

    setLoading(true);
    searchImages(destination, itinerary ?? undefined)
      .then(setImages)
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [destination, itinerary]);

  return { images, loading };
}
