import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import type { SearchFormData, NominatimResult, AIProvider } from '../../types/itinerary';
import { COUNTRIES, type StaticCountry } from '../../data/countries';
import { CHILE_AIRPORT_CITIES, type ChileAirportCity } from '../../data/chileAirports';
import {
  searchCountries,
  searchRegions,
  searchCitiesInCountries,
  extractPlaceName,
  getRegionLevelName,
} from '../../services/nominatim';

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface SearchFormProps {
  onSubmit: (data: SearchFormData) => void;
  loading: boolean;
  preloadCountry?: string | null;
  onPreloadApplied?: () => void;
}

// ─── Budget helpers ────────────────────────────────────────────────────────────
function getBudgetCategory(amount: number): { label: string; color: string } {
  if (amount < 500) return { label: 'Mochilero', color: 'text-green-400' };
  if (amount < 2000) return { label: 'Explorador', color: 'text-sky-400' };
  if (amount < 5000) return { label: 'Viajero', color: 'text-gold' };
  return { label: 'Lujo', color: 'text-terracotta' };
}

// ─── Origin selector using static Chilean airport cities list ─────────────────
function OriginStaticLevel({
  selected,
  onSelect,
  onClear,
}: {
  selected: ChileAirportCity | null;
  onSelect: (city: ChileAirportCity) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = CHILE_AIRPORT_CITIES.filter(
    (c) =>
      query.length === 0 ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.iata.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (city: ChileAirportCity) => {
    onSelect(city);
    setQuery('');
    setOpen(false);
  };

  const handleClear = () => {
    onClear();
    setQuery('');
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div>
      <label className="block text-ivory/50 text-xs font-medium uppercase tracking-widest mb-2">
        Origen
      </label>

      {selected ? (
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="inline-flex items-center gap-1.5 bg-gold/15 border border-gold/30 text-gold text-xs px-2.5 py-1 rounded-full">
            ✈ {selected.name} ({selected.iata})
            <button
              type="button"
              onClick={handleClear}
              className="hover:text-ivory transition-colors leading-none"
            >
              ×
            </button>
          </span>
        </div>
      ) : null}

      {!selected && (
        <div ref={containerRef} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="¿Desde dónde partes?"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-11 py-3.5 text-ivory placeholder-ivory/30 text-sm focus:outline-none focus:border-gold/50 transition-all duration-300"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gold text-lg pointer-events-none">✈</span>

          <AnimatePresence>
            {open && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 top-full mt-2 w-full glass-dark rounded-xl overflow-hidden shadow-2xl border border-white/10 max-h-52 overflow-y-auto"
              >
                {filtered.map((city) => (
                  <button
                    key={city.iata}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gold/10 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="text-ivory text-sm">{city.name}</div>
                    <div className="text-ivory/40 text-xs mt-0.5">{city.airport} · {city.iata}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── Single cascade level (search input + selected chips + dropdown) ──────────
function CascadeLevel({
  label,
  placeholder,
  enabled,
  results,
  selected,
  loading,
  onSearch,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  enabled: boolean;
  results: NominatimResult[];
  selected: NominatimResult[];
  loading: boolean;
  onSearch: (query: string) => void;
  onAdd: (item: NominatimResult) => void;
  onRemove: (placeId: number) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(val), 300);
    setOpen(true);
  };

  const handleAdd = (item: NominatimResult) => {
    if (!selected.find((s) => s.place_id === item.place_id)) {
      onAdd(item);
    }
    setQuery('');
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unselectedResults = results.filter(
    (r) => !selected.find((s) => s.place_id === r.place_id)
  );
  const showDropdown = open && (unselectedResults.length > 0 || loading);

  return (
    <div className={`transition-opacity duration-300 ${!enabled ? 'opacity-35 pointer-events-none' : ''}`}>
      <label className="block text-ivory/50 text-xs font-medium uppercase tracking-widest mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
        {label}
      </label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((item) => (
            <span
              key={item.place_id}
              className="inline-flex items-center gap-1.5 bg-gold/15 border border-gold/30 text-gold text-xs px-2.5 py-1 rounded-full"
            >
              {extractPlaceName(item)}
              <button
                type="button"
                onClick={() => onRemove(item.place_id)}
                className="hover:text-ivory transition-colors leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div ref={containerRef} className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => unselectedResults.length > 0 && setOpen(true)}
          disabled={!enabled}
          placeholder={enabled ? placeholder : 'Selecciona el nivel anterior primero'}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ivory placeholder-ivory/30 text-sm focus:outline-none focus:border-gold/50 transition-all duration-300 disabled:cursor-not-allowed"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            <span className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin inline-block" />
          </span>
        )}

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 top-full mt-2 w-full glass-dark rounded-xl overflow-hidden shadow-2xl border border-white/10 max-h-52 overflow-y-auto"
            >
              {loading && unselectedResults.length === 0 ? (
                <div className="px-4 py-3 text-ivory/40 text-sm">Buscando...</div>
              ) : (
                unselectedResults.map((item) => (
                  <button
                    key={item.place_id}
                    type="button"
                    onClick={() => handleAdd(item)}
                    className="w-full text-left px-4 py-3 hover:bg-gold/10 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="text-ivory text-sm">{extractPlaceName(item)}</div>
                    <div className="text-ivory/40 text-xs mt-0.5">
                      {item.display_name.split(',').slice(1, 3).join(',').trim()}
                    </div>
                  </button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Country level using static list (no API for the list itself) ─────────────
function CountryStaticLevel({
  selected,
  onAdd,
  onRemove,
}: {
  selected: NominatimResult[];
  onAdd: (item: NominatimResult) => void;
  onRemove: (placeId: number) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = COUNTRIES.filter(
    (c) =>
      !selected.find((s) => s.address.country_code === c.code) &&
      (query.length === 0 || c.name.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = async (country: StaticCountry) => {
    setQuery('');
    setOpen(false);
    setGeocoding(true);
    try {
      const geoResults = await searchCountries(country.name);
      const geo = geoResults[0];
      onAdd({
        place_id: hashCode(country.code),
        display_name: country.name,
        lat: geo?.lat ?? '0',
        lon: geo?.lon ?? '0',
        type: 'country',
        address: { country: country.name, country_code: country.code },
      });
    } catch {
      onAdd({
        place_id: hashCode(country.code),
        display_name: country.name,
        lat: '0',
        lon: '0',
        type: 'country',
        address: { country: country.name, country_code: country.code },
      });
    } finally {
      setGeocoding(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div>
      <label className="block text-ivory/50 text-xs font-medium uppercase tracking-widest mb-2 whitespace-nowrap">
        País
      </label>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((item) => (
            <span
              key={item.place_id}
              className="inline-flex items-center gap-1.5 bg-gold/15 border border-gold/30 text-gold text-xs px-2.5 py-1 rounded-full"
            >
              {item.display_name}
              <button
                type="button"
                onClick={() => onRemove(item.place_id)}
                className="hover:text-ivory transition-colors leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div ref={containerRef} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar país..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ivory placeholder-ivory/30 text-sm focus:outline-none focus:border-gold/50 transition-all duration-300"
        />
        {geocoding && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            <span className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin inline-block" />
          </span>
        )}

        <AnimatePresence>
          {open && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 top-full mt-2 w-full glass-dark rounded-xl overflow-hidden shadow-2xl border border-white/10 max-h-52 overflow-y-auto"
            >
              {filtered.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gold/10 transition-colors border-b border-white/5 last:border-0 text-ivory text-sm"
                >
                  {country.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Destination cascade (Country → Region → City) ────────────────────────────
function DestinationCascade({
  onChange,
  preloadCountry,
  onPreloadApplied,
}: {
  onChange: (destination: string, coords: { lat: number; lng: number } | null, level: 'country' | 'region' | 'city' | 'zone') => void;
  preloadCountry?: string | null;
  onPreloadApplied?: () => void;
}) {
  const [countries, setCountries] = useState<NominatimResult[]>([]);
  const [regions, setRegions] = useState<NominatimResult[]>([]);
  const [cities, setCities] = useState<NominatimResult[]>([]);

  const [regionResults, setRegionResults] = useState<NominatimResult[]>([]);
  const [cityResults, setCityResults] = useState<NominatimResult[]>([]);

  const [regionLoading, setRegionLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);

  const countryCodes = countries.map((c) => c.address.country_code ?? '').filter(Boolean);
  const regionLevelName =
    countries.length > 0 ? getRegionLevelName(countries[0].address.country_code ?? '') : 'Región/Provincia';

  // Auto-select country when preloadCountry changes (e.g. from InspirationSection)
  const lastPreloadRef = useRef<string | null>(null);
  useEffect(() => {
    if (!preloadCountry || preloadCountry === lastPreloadRef.current) return;
    const found = COUNTRIES.find((c) => c.name === preloadCountry);
    if (!found) return;
    lastPreloadRef.current = preloadCountry;
    setCountries([]);
    setRegions([]);
    setCities([]);
    (async () => {
      try {
        const geoResults = await searchCountries(found.name);
        const geo = geoResults[0];
        setCountries([{
          place_id: hashCode(found.code),
          display_name: found.name,
          lat: geo?.lat ?? '0',
          lon: geo?.lon ?? '0',
          type: 'country',
          address: { country: found.name, country_code: found.code },
        }]);
      } catch {
        setCountries([{
          place_id: hashCode(found.code),
          display_name: found.name,
          lat: '0',
          lon: '0',
          type: 'country',
          address: { country: found.name, country_code: found.code },
        }]);
      }
      onPreloadApplied?.();
    })();
  }, [preloadCountry, onPreloadApplied]);

  // Notify parent whenever selections change
  useEffect(() => {
    const cityNames = cities.map((c) => extractPlaceName(c));
    const regionNames = regions.map((r) => extractPlaceName(r));
    const countryNames = countries.map((c) => c.address.country ?? extractPlaceName(c));

    const parts: string[] = [];
    if (cityNames.length > 0) parts.push(...cityNames);
    else if (regionNames.length > 0) parts.push(...regionNames);
    if (countryNames.length > 0) parts.push(...countryNames);

    const destination = parts.join(', ');
    const first = cities[0] ?? regions[0] ?? countries[0] ?? null;
    const coords = first ? { lat: parseFloat(first.lat), lng: parseFloat(first.lon) } : null;
    const level: 'country' | 'region' | 'city' | 'zone' =
      cities.length > 0 ? 'city' : regions.length > 0 ? 'region' : 'country';

    onChange(destination, coords, level);
  }, [countries, regions, cities, onChange]);

  const handleRegionSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) { setRegionResults([]); return; }
    setRegionLoading(true);
    try { setRegionResults(await searchRegions(query, countryCodes)); }
    finally { setRegionLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCodes.join(',')]);

  const handleCitySearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) { setCityResults([]); return; }
    setCityLoading(true);
    try { setCityResults(await searchCitiesInCountries(query, countryCodes)); }
    finally { setCityLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCodes.join(',')]);

  const addCountry = (item: NominatimResult) => {
    setCountries((prev) => [...prev, item]);
    setRegions([]);
    setCities([]);
  };
  const addRegion = (item: NominatimResult) => {
    setRegions((prev) => [...prev, item]);
    setRegionResults([]);
    setCities([]);
  };
  const addCity = (item: NominatimResult) => {
    setCities((prev) => [...prev, item]);
    setCityResults([]);
  };

  const removeCountry = (id: number) => {
    setCountries((prev) => prev.filter((c) => c.place_id !== id));
    setRegions([]);
    setCities([]);
  };
  const removeRegion = (id: number) => {
    setRegions((prev) => prev.filter((r) => r.place_id !== id));
    setCities([]);
  };
  const removeCity = (id: number) => setCities((prev) => prev.filter((c) => c.place_id !== id));

  return (
    <div className="space-y-4">
      <CountryStaticLevel
        selected={countries}
        onAdd={addCountry}
        onRemove={removeCountry}
      />
      <CascadeLevel
        label={regionLevelName}
        placeholder={`Buscar ${regionLevelName.toLowerCase()}...`}
        enabled={countries.length > 0}
        results={regionResults}
        selected={regions}
        loading={regionLoading}
        onSearch={handleRegionSearch}
        onAdd={addRegion}
        onRemove={removeRegion}
      />
      <CascadeLevel
        label="Ciudad"
        placeholder="Buscar ciudad..."
        enabled={regions.length > 0}
        results={cityResults}
        selected={cities}
        loading={cityLoading}
        onSearch={handleCitySearch}
        onAdd={addCity}
        onRemove={removeCity}
      />
    </div>
  );
}

// ─── Main SearchForm ──────────────────────────────────────────────────────────
export function SearchForm({ onSubmit, loading, preloadCountry, onPreloadApplied }: SearchFormProps) {
  const [formData, setFormData] = useState<SearchFormData>({
    origin: '',
    originCoords: null,
    destination: '',
    destinationCoords: null,
    destinationLevel: 'country',
    startDate: null,
    endDate: null,
    budget: null,
    budgetEnabled: false,
    provider: 'groq',
  });

  const [selectedOriginCity, setSelectedOriginCity] = useState<ChileAirportCity | null>(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOriginSelect = useCallback((city: ChileAirportCity) => {
    setSelectedOriginCity(city);
    setFormData((prev) => ({
      ...prev,
      origin: city.name,
      originCoords: { lat: city.lat, lng: city.lon },
    }));
  }, []);

  const handleOriginClear = useCallback(() => {
    setSelectedOriginCity(null);
    setFormData((prev) => ({ ...prev, origin: '', originCoords: null }));
  }, []);

  const handleDestinationChange = useCallback(
    (destination: string, coords: { lat: number; lng: number } | null, level: 'country' | 'region' | 'city' | 'zone') => {
      setFormData((prev) => ({
        ...prev,
        destination,
        destinationCoords: coords,
        destinationLevel: level,
      }));
    },
    []
  );

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setBudgetInput(raw);
    setFormData((prev) => ({ ...prev, budget: raw ? parseInt(raw, 10) : null }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.origin.trim()) newErrors.origin = 'Ingresa tu ciudad de origen';
    if (!formData.destination.trim()) newErrors.destination = 'Selecciona al menos un país de destino';
    if (!formData.startDate) newErrors.startDate = 'Selecciona fecha de inicio';
    if (!formData.endDate) newErrors.endDate = 'Selecciona fecha de regreso';
    if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'La fecha de regreso debe ser posterior al inicio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  const tripDays =
    formData.startDate && formData.endDate
      ? Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

  const budgetCategory = formData.budget && formData.budget > 0 ? getBudgetCategory(formData.budget) : null;

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 shadow-2xl">

      {/* Row 1: Origin + Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 items-start">

        {/* Origin */}
        <div>
          <OriginStaticLevel
            selected={selectedOriginCity}
            onSelect={handleOriginSelect}
            onClear={handleOriginClear}
          />
          {errors.origin && <p className="text-red-400 text-xs mt-1">{errors.origin}</p>}
        </div>

        {/* Destination cascade */}
        <div>
          <DestinationCascade
            onChange={handleDestinationChange}
            preloadCountry={preloadCountry}
            onPreloadApplied={onPreloadApplied}
          />
          {errors.destination && <p className="text-red-400 text-xs mt-1">{errors.destination}</p>}
        </div>
      </div>

      {/* Row 2: Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-ivory/50 text-xs font-medium uppercase tracking-widest mb-2">
            Fecha de inicio
          </label>
          <DatePicker
            selected={formData.startDate}
            onChange={(date: Date | null) =>
              setFormData((prev) => ({
                ...prev,
                startDate: date,
                endDate: prev.endDate && date && prev.endDate <= date ? null : prev.endDate,
              }))
            }
            minDate={new Date()}
            placeholderText="Selecciona fecha"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-ivory placeholder-ivory/30 text-sm focus:outline-none focus:border-gold/50 transition-all duration-300 cursor-pointer"
            wrapperClassName="w-full"
            dateFormat="dd/MM/yyyy"
          />
          {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block text-ivory/50 text-xs font-medium uppercase tracking-widest mb-2">
            Fecha de regreso
          </label>
          <DatePicker
            selected={formData.endDate}
            onChange={(date: Date | null) => setFormData((prev) => ({ ...prev, endDate: date }))}
            minDate={formData.startDate || new Date()}
            placeholderText="Selecciona fecha"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-ivory placeholder-ivory/30 text-sm focus:outline-none focus:border-gold/50 transition-all duration-300 cursor-pointer"
            wrapperClassName="w-full"
            dateFormat="dd/MM/yyyy"
          />
          {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate}</p>}
        </div>
      </div>

      {/* Trip duration badge */}
      {tripDays !== null && tripDays > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <Badge variant="gold">
            🗓 {tripDays} {tripDays === 1 ? 'día' : 'días'} de viaje
          </Badge>
        </motion.div>
      )}

      {/* Budget */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-ivory/50 text-xs font-medium uppercase tracking-widest">
            Presupuesto (USD)
          </label>
          <div className="flex items-center gap-3">
            <span className="text-ivory/40 text-xs">Opcional</span>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, budgetEnabled: !prev.budgetEnabled, budget: null }))
              }
              className={`w-10 h-5 rounded-full transition-all duration-300 relative ${
                formData.budgetEnabled ? 'bg-gold' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                  formData.budgetEnabled ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {formData.budgetEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="relative mb-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold font-semibold text-sm pointer-events-none">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={budgetInput}
                  onChange={handleBudgetChange}
                  placeholder="Ingresa tu presupuesto"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-24 py-3.5 text-ivory placeholder-ivory/30 text-sm focus:outline-none focus:border-gold/50 transition-all duration-300"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/30 text-xs pointer-events-none">
                  USD
                </span>
              </div>

              <AnimatePresence mode="wait">
                {budgetCategory && (
                  <motion.p
                    key={budgetCategory.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.15 }}
                    className={`text-xs font-medium ${budgetCategory.color}`}
                  >
                    ✦ Categoría: {budgetCategory.label}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Provider toggle */}
      <div className="flex items-center justify-center gap-1 mb-4">
        <span className="text-ivory/30 text-xs mr-2">Motor IA:</span>
        {(['groq', 'anthropic'] as AIProvider[]).map((p) => {
          const active = formData.provider === p;
          const label = p === 'groq' ? 'Llama 3.3' : 'Claude';
          const icon  = p === 'groq' ? '⚡' : '✦';
          return (
            <button
              key={p}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, provider: p }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                active
                  ? 'bg-gold/15 border border-gold/40 text-gold'
                  : 'bg-white/5 border border-white/10 text-ivory/40 hover:text-ivory/60 hover:border-white/20'
              }`}
            >
              <span>{icon}</span>
              {label}
            </button>
          );
        })}
      </div>

      <Button type="submit" loading={loading} fullWidth className="py-4 text-base font-semibold">
        {loading ? 'Generando tu itinerario...' : '✦ Planificar mi viaje'}
      </Button>
    </form>
  );
}
