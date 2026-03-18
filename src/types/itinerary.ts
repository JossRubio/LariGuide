export type AIProvider = 'groq' | 'anthropic';

export interface SearchFormData {
  origin: string;
  originCoords: { lat: number; lng: number } | null;
  destination: string;
  destinationCoords: { lat: number; lng: number } | null;
  destinationLevel: 'country' | 'region' | 'city' | 'zone';
  startDate: Date | null;
  endDate: Date | null;
  budget: number | null;
  budgetEnabled: boolean;
  provider: AIProvider;
}

export interface Activity {
  hora: string;
  nombre: string;
  descripcion: string;
  tipo: 'atraccion' | 'comida' | 'transporte' | 'alojamiento' | 'compras' | 'naturaleza';
  duracion_horas: number;
  costo_usd: number;
  costo_moneda_local: number;
  requiere_reservacion: boolean;
  url_reservacion: string | null;
  nombre_sitio_oficial: string | null;
  nivel_concurrencia: 'bajo' | 'medio' | 'alto';
  mejor_hora_visita: string;
  coordenadas: { lat: number; lng: number };
  tips: string[];
}

export interface Accommodation {
  nombre: string;
  tipo: string;
  costo_noche_usd: number;
  descripcion: string;
}

export interface Day {
  numero: number;
  fecha: string;
  titulo: string;
  descripcion_del_dia: string;
  actividades: Activity[];
  costo_total_dia_usd: number;
  alojamiento_sugerido: Accommodation;
}

export interface ItineraryData {
  resumen: {
    presupuestoTotal: {
      usd: number;
      monedaLocal: string;
      valorMonedaLocal: number;
      nombreMoneda: string;
      simbolo: string;
    };
    temporada: 'baja' | 'media' | 'alta';
    recomendaciones_generales: string[];
    como_llegar: {
      descripcion: string;
      costo_estimado_usd: number;
    };
  };
  dias: Day[];
}

export interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed: number;
  description: string;
}

export interface WikimediaImage {
  title: string;
  url: string;
  thumbUrl: string;
  author: string;
  description: string;
}

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address: {
    country?: string;
    country_code?: string;
    city?: string;
    state?: string;
    region?: string;
    town?: string;
    village?: string;
    municipality?: string;
  };
}
