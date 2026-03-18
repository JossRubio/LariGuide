export interface ChileAirportCity {
  name: string;    // City name
  airport: string; // Airport name
  iata: string;    // IATA code
  lat: number;
  lon: number;
}

/** Chilean cities with commercial airports, sorted alphabetically. */
export const CHILE_AIRPORT_CITIES: ChileAirportCity[] = [
  { name: 'Antofagasta',    airport: 'Aeropuerto Cerro Moreno',                  iata: 'ANF', lat: -23.4445, lon: -70.4408 },
  { name: 'Arica',          airport: 'Aeropuerto Chacalluta',                    iata: 'ARI', lat: -18.3485, lon: -70.3387 },
  { name: 'Balmaceda',      airport: 'Aeropuerto Balmaceda (Coyhaique)',          iata: 'BBA', lat: -45.9161, lon: -71.6894 },
  { name: 'Calama',         airport: 'Aeropuerto El Loa',                         iata: 'CJC', lat: -22.4962, lon: -68.9036 },
  { name: 'Castro',         airport: 'Aeropuerto Mocopulli (Chiloé)',             iata: 'MHC', lat: -42.4939, lon: -73.7750 },
  { name: 'Concepción',     airport: 'Aeropuerto Carriel Sur',                   iata: 'CCP', lat: -36.7728, lon: -73.0631 },
  { name: 'Copiapó',        airport: 'Aeropuerto Desierto de Atacama',            iata: 'CPO', lat: -27.2612, lon: -70.4126 },
  { name: 'Iquique',        airport: 'Aeropuerto Diego Aracena',                  iata: 'IQQ', lat: -20.5352, lon: -70.1813 },
  { name: 'Isla de Pascua', airport: 'Aeropuerto Mataveri',                       iata: 'IPC', lat: -27.1648, lon: -109.4218 },
  { name: 'La Serena',      airport: 'Aeropuerto La Florida',                    iata: 'LSC', lat: -29.9162, lon: -71.1995 },
  { name: 'Osorno',         airport: 'Aeropuerto Carlos Hott Siebert',            iata: 'ZOS', lat: -40.6111, lon: -73.0609 },
  { name: 'Puerto Montt',   airport: 'Aeropuerto El Tepual',                     iata: 'PMC', lat: -41.4389, lon: -73.0940 },
  { name: 'Puerto Natales', airport: 'Aeropuerto Teniente Julio Gallardo',        iata: 'PNT', lat: -51.6722, lon: -72.5283 },
  { name: 'Puerto Williams', airport: 'Aeropuerto Guardiamarina Zañartu',        iata: 'WPU', lat: -54.9311, lon: -67.6208 },
  { name: 'Punta Arenas',   airport: 'Aeropuerto Carlos Ibáñez del Campo',       iata: 'PUQ', lat: -53.0024, lon: -70.8549 },
  { name: 'Santiago',       airport: 'Aeropuerto Arturo Merino Benítez',         iata: 'SCL', lat: -33.3928, lon: -70.7858 },
  { name: 'Temuco',         airport: 'Aeropuerto La Araucanía',                  iata: 'ZCO', lat: -38.7659, lon: -72.6371 },
  { name: 'Valdivia',       airport: 'Aeropuerto Pichoy',                        iata: 'ZAL', lat: -39.6500, lon: -73.0862 },
];
