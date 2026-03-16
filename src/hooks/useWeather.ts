import { useState, useEffect } from 'react';
import { getWeather } from '../services/weather';
import type { WeatherData } from '../types/itinerary';

export function useWeather(lat: number | null, lng: number | null) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat === null || lng === null) return;

    setLoading(true);
    setError(null);

    getWeather(lat, lng)
      .then(setWeather)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  return { weather, loading, error };
}
