import { useState, useEffect } from 'react';
import { searchImages } from '../services/wikimedia';
import type { WikimediaImage } from '../types/itinerary';

export function useWikimedia(destination: string | null) {
  const [images, setImages] = useState<WikimediaImage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!destination) return;

    setLoading(true);
    searchImages(destination)
      .then(setImages)
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [destination]);

  return { images, loading };
}
