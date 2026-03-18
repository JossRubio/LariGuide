import type { SearchFormData, ItineraryData } from '../types/itinerary';

const SERVER_URL = 'http://localhost:3001';

export async function generateItinerary(formData: SearchFormData): Promise<ItineraryData> {
  const { origin, destination, startDate, endDate, budget, budgetEnabled } = formData;

  const response = await fetch(`${SERVER_URL}/api/itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin,
      destination,
      startDate: startDate!.toISOString(),
      endDate: endDate!.toISOString(),
      budget,
      budgetEnabled,
      provider: formData.provider,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: `Error ${response.status}` }));
    throw new Error(error.error || `Error del servidor: ${response.status}`);
  }

  return response.json();
}
