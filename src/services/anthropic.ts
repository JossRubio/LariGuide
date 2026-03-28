import type { SearchFormData, ItineraryData, Day } from '../types/itinerary';

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

export interface StreamCallbacks {
  onResumen: (resumen: ItineraryData['resumen']) => void;
  onDia: (dia: Day) => void;
  onDone: (itinerary: ItineraryData) => void;
  onError: (error: string) => void;
}

export async function streamItinerary(
  formData: SearchFormData,
  callbacks: StreamCallbacks
): Promise<void> {
  const { origin, destination, startDate, endDate, budget, budgetEnabled } = formData;

  const response = await fetch(`${SERVER_URL}/api/itinerary/stream`, {
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

  if (!response.ok || !response.body) {
    const err = await response.json().catch(() => ({ error: `Error ${response.status}` }));
    throw new Error(err.error || `Error del servidor: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      let eventType = '';
      let dataLine = '';
      for (const line of part.split('\n')) {
        if (line.startsWith('event: ')) eventType = line.slice(7).trim();
        else if (line.startsWith('data: ')) dataLine = line.slice(6);
      }
      if (!eventType || !dataLine) continue;
      try {
        const data = JSON.parse(dataLine);
        if (eventType === 'resumen') callbacks.onResumen(data);
        else if (eventType === 'dia') callbacks.onDia(data);
        else if (eventType === 'done') callbacks.onDone(data);
        else if (eventType === 'error') callbacks.onError(data.error);
      } catch { /* ignore parse errors */ }
    }
  }
}
