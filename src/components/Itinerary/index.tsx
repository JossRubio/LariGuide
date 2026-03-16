import { motion } from 'framer-motion';
import type { ItineraryData } from '../../types/itinerary';
import { DayCard } from './DayCard';

interface ItineraryProps {
  itinerary: ItineraryData;
}

export function Itinerary({ itinerary }: ItineraryProps) {
  const currencySymbol = itinerary.resumen.presupuestoTotal.simbolo || '$';

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-gold text-xs font-medium uppercase tracking-widest mb-2">
          Itinerario detallado
        </p>
        <h2 className="font-display text-3xl text-ivory">
          {itinerary.dias.length} días de aventura
        </h2>
        <p className="text-ivory/50 text-sm mt-1">
          Haz clic en cada día para expandir sus actividades
        </p>
      </motion.div>

      <div className="space-y-4">
        {itinerary.dias.map((day, i) => (
          <DayCard
            key={day.numero}
            day={day}
            currencySymbol={currencySymbol}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
