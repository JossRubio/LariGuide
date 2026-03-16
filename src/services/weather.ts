import type { WeatherData } from '../types/itinerary';

export async function getWeather(lat: number, lng: number): Promise<WeatherData> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m`
  );

  if (!response.ok) throw new Error('Weather API error');

  const data = await response.json();
  const current = data.current_weather;

  const weatherDescriptions: Record<number, string> = {
    0: 'Despejado',
    1: 'Mayormente despejado',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Neblina',
    48: 'Neblina helada',
    51: 'Llovizna ligera',
    53: 'Llovizna moderada',
    55: 'Llovizna intensa',
    61: 'Lluvia ligera',
    63: 'Lluvia moderada',
    65: 'Lluvia intensa',
    71: 'Nieve ligera',
    73: 'Nieve moderada',
    75: 'Nieve intensa',
    80: 'Chubascos ligeros',
    81: 'Chubascos moderados',
    82: 'Chubascos intensos',
    95: 'Tormenta',
    96: 'Tormenta con granizo',
    99: 'Tormenta intensa con granizo',
  };

  return {
    temperature: Math.round(current.temperature),
    weathercode: current.weathercode,
    windspeed: Math.round(current.windspeed),
    description: weatherDescriptions[current.weathercode] || 'Desconocido',
  };
}
