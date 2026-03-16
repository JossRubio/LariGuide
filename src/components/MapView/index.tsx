import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ItineraryData, Activity } from '../../types/itinerary';

interface MapViewProps {
  itinerary: ItineraryData;
  destination: string;
  destinationCoords: { lat: number; lng: number } | null;
}

const activityIcons: Record<string, string> = {
  atraccion: '🏛',
  comida: '🍽',
  transporte: '🚌',
  alojamiento: '🏨',
  compras: '🛍',
  naturaleza: '🌿',
};

const activityColors: Record<string, string> = {
  atraccion: '#C9A84C',
  comida: '#C4724A',
  transporte: '#6B7280',
  alojamiento: '#8B5CF6',
  compras: '#EC4899',
  naturaleza: '#10B981',
};

export function MapView({ itinerary, destination, destinationCoords }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const allActivities: (Activity & { dayNum: number })[] = itinerary.dias.flatMap((day) =>
    day.actividades.map((act) => ({ ...act, dayNum: day.numero }))
  );

  const filteredActivities = selectedDay
    ? allActivities.filter((a) => a.dayNum === selectedDay)
    : allActivities;

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapRef.current) return;

      // Dynamically import Leaflet
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      // Fix default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!isMounted || mapInstanceRef.current) return;

      const centerLat = destinationCoords?.lat || parseFloat(itinerary.dias[0]?.actividades[0]?.coordenadas?.lat as any) || 0;
      const centerLng = destinationCoords?.lng || parseFloat(itinerary.dias[0]?.actividades[0]?.coordenadas?.lng as any) || 0;

      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      if (isMounted) setMapLoaded(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    const addMarkers = async () => {
      const L = await import('leaflet');

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const bounds: [number, number][] = [];

      filteredActivities.forEach((activity) => {
        const { lat, lng } = activity.coordenadas;
        if (!lat || !lng) return;

        bounds.push([lat, lng]);

        const color = activityColors[activity.tipo] || '#C9A84C';
        const icon_char = activityIcons[activity.tipo] || '📍';

        const customIcon = L.divIcon({
          html: `<div style="
            background: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid rgba(255,255,255,0.3);
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 14px; display: block; text-align: center; line-height: 28px;">${icon_char}</span>
          </div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const marker = L.marker([lat, lng], { icon: customIcon })
          .bindPopup(`
            <div style="font-family: 'DM Sans', sans-serif; min-width: 200px;">
              <div style="color: ${color}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">
                ${icon_char} ${activity.tipo} · ${activity.hora}
              </div>
              <div style="color: #F5F0E8; font-size: 14px; font-weight: 600; margin-bottom: 6px;">
                ${activity.nombre}
              </div>
              <div style="color: rgba(245,240,232,0.6); font-size: 12px; line-height: 1.5; margin-bottom: 8px;">
                ${activity.descripcion.slice(0, 100)}...
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <span style="background: ${color}20; color: ${color}; border: 1px solid ${color}40; padding: 2px 8px; border-radius: 99px; font-size: 11px;">
                  $${activity.costo_usd} USD
                </span>
                <span style="background: rgba(255,255,255,0.05); color: rgba(245,240,232,0.5); padding: 2px 8px; border-radius: 99px; font-size: 11px;">
                  ${activity.duracion_horas}h
                </span>
              </div>
              ${activity.requiere_reservacion ? `<div style="margin-top: 8px; color: #C4724A; font-size: 11px;">⚠ Requiere reservación</div>` : ''}
            </div>
          `)
          .addTo(mapInstanceRef.current);

        marker.on('click', () => setSelectedActivity(activity));
        markersRef.current.push(marker);
      });

      // Draw polyline connecting activities in order
      if (bounds.length > 1) {
        const polyline = L.polyline(bounds, {
          color: 'rgba(201, 168, 76, 0.4)',
          weight: 2,
          dashArray: '5, 8',
        }).addTo(mapInstanceRef.current);
        markersRef.current.push(polyline);

        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      } else if (bounds.length === 1) {
        mapInstanceRef.current.setView(bounds[0], 14);
      }
    };

    addMarkers();
  }, [filteredActivities, mapLoaded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-gold text-xs font-medium uppercase tracking-widest mb-1">
              Mapa Interactivo
            </p>
            <h2 className="font-display text-2xl text-ivory">{destination.split(',')[0]}</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDay(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedDay === null
                  ? 'bg-gold text-deep-black'
                  : 'bg-white/5 text-ivory/60 hover:bg-white/10'
              }`}
            >
              Todos los días
            </button>
            {itinerary.dias.map((day) => (
              <button
                key={day.numero}
                onClick={() => setSelectedDay(day.numero)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  selectedDay === day.numero
                    ? 'bg-gold text-deep-black'
                    : 'bg-white/5 text-ivory/60 hover:bg-white/10'
                }`}
              >
                Día {day.numero}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div ref={mapRef} className="w-full h-[500px] md:h-[600px]" />

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-deep-black/80">
            <div className="flex flex-col items-center gap-3">
              <span className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              <span className="text-ivory/50 text-sm">Cargando mapa...</span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass-dark rounded-xl p-3 z-[1000]">
          <div className="flex flex-wrap gap-2">
            {Object.entries(activityIcons).map(([type, icon]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className="text-sm">{icon}</span>
                <span className="text-ivory/50 text-xs capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected activity panel */}
        <AnimatePresence>
          {selectedActivity && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 w-72 glass-dark rounded-xl p-4 z-[1000] shadow-2xl"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs text-ivory/40 uppercase tracking-wider">
                    {activityIcons[selectedActivity.tipo]} {selectedActivity.tipo}
                  </span>
                  <h4 className="text-ivory font-semibold text-sm mt-0.5">
                    {selectedActivity.nombre}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-ivory/30 hover:text-ivory ml-2 mt-0.5"
                >
                  ✕
                </button>
              </div>
              <p className="text-ivory/60 text-xs leading-relaxed mb-3">
                {selectedActivity.descripcion}
              </p>
              <div className="flex gap-2 flex-wrap text-xs">
                <span className="bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                  ${selectedActivity.costo_usd} USD
                </span>
                <span className="bg-white/5 text-ivory/50 px-2 py-0.5 rounded-full">
                  {selectedActivity.hora}
                </span>
                <span className="bg-white/5 text-ivory/50 px-2 py-0.5 rounded-full">
                  {selectedActivity.duracion_horas}h
                </span>
              </div>
              {selectedActivity.requiere_reservacion && selectedActivity.url_reservacion && (
                <a
                  href={selectedActivity.url_reservacion}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-1.5 text-terracotta text-xs hover:text-terracotta/80"
                >
                  🔗 Reservar ahora
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
