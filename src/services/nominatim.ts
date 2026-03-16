import type { NominatimResult } from '../types/itinerary';

const HEADERS = { 'Accept-Language': 'es' };

// Region level name per country code
export const REGION_LEVEL_NAMES: Record<string, string> = {
  cl: 'Región',
  ar: 'Provincia',
  us: 'Estado',
  mx: 'Estado',
  es: 'Comunidad Autónoma',
  fr: 'Región',
  it: 'Región',
  de: 'Estado (Land)',
  br: 'Estado',
  co: 'Departamento',
  pe: 'Departamento',
  uy: 'Departamento',
  bo: 'Departamento',
  ec: 'Provincia',
  ve: 'Estado',
  py: 'Departamento',
  gb: 'Región',
  jp: 'Prefectura',
  cn: 'Provincia',
  in: 'Estado',
  au: 'Estado',
  ca: 'Provincia',
  pt: 'Distrito',
  nl: 'Provincia',
  be: 'Región',
  ch: 'Cantón',
  at: 'Estado',
};

export function getRegionLevelName(countryCode: string): string {
  return REGION_LEVEL_NAMES[countryCode?.toLowerCase()] ?? 'Región/Provincia';
}

// Generic search (legacy, kept for compatibility)
export async function searchLocations(query: string): Promise<NominatimResult[]> {
  if (!query || query.length < 2) return [];
  const resp = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
    { headers: HEADERS }
  );
  if (!resp.ok) return [];
  return resp.json();
}

// Origin: Chilean cities only — no featuretype restriction so Nominatim returns all types,
// then we filter client-side to exclude administrative/country boundaries.
export async function searchCitiesInChile(query: string): Promise<NominatimResult[]> {
  if (!query || query.length < 2) return [];
  const resp = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=cl&addressdetails=1&limit=10`,
    { headers: HEADERS }
  );
  if (!resp.ok) return [];
  const results: NominatimResult[] = await resp.json();
  const PLACE_TYPES = new Set([
    'city', 'town', 'village', 'municipality', 'hamlet',
    'suburb', 'quarter', 'neighbourhood', 'administrative',
  ]);
  return results.filter((r) => PLACE_TYPES.has(r.type));
}

// Extracts the most specific city/town name from a result
export function extractPlaceName(result: NominatimResult): string {
  return (
    result.address.city ||
    result.address.town ||
    result.address.village ||
    result.address.municipality ||
    result.display_name.split(',')[0].trim()
  );
}

// Format for origin field: "Santiago (Chile)"
export function formatChileCity(result: NominatimResult): string {
  return `${extractPlaceName(result)} (Chile)`;
}

// Destination cascade — Level 1: Countries
export async function searchCountries(query: string): Promise<NominatimResult[]> {
  if (!query || query.length < 2) return [];
  const resp = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&featuretype=country&limit=8&addressdetails=1`,
    { headers: HEADERS }
  );
  if (!resp.ok) return [];
  return resp.json();
}

// Destination cascade — Level 2: Regions/Provinces within selected countries
export async function searchRegions(
  query: string,
  countryCodes: string[]
): Promise<NominatimResult[]> {
  if (!query || query.length < 2 || countryCodes.length === 0) return [];
  const codes = countryCodes.join(',');
  const resp = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${codes}&featuretype=state&limit=10&addressdetails=1`,
    { headers: HEADERS }
  );
  if (!resp.ok) return [];
  return resp.json();
}

// Destination cascade — Level 3: Cities within selected countries (filtered by region name if possible)
export async function searchCitiesInCountries(
  query: string,
  countryCodes: string[]
): Promise<NominatimResult[]> {
  if (!query || query.length < 2 || countryCodes.length === 0) return [];
  const codes = countryCodes.join(',');
  const resp = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${codes}&featuretype=city&limit=10&addressdetails=1`,
    { headers: HEADERS }
  );
  if (!resp.ok) return [];
  return resp.json();
}

export function detectDestinationLevel(
  result: NominatimResult
): 'country' | 'region' | 'city' | 'zone' {
  const type = result.type;
  if (type === 'country') return 'country';
  if (['city', 'town', 'village'].includes(type)) return 'city';
  if (['state', 'province', 'region'].includes(type)) return 'region';
  return 'zone';
}
