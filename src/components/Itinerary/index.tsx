import { motion, AnimatePresence } from 'framer-motion';
import type { Day } from '../../types/itinerary';
import { DayCard } from './DayCard';

interface ItineraryProps {
  dias: Day[];
  currencySymbol: string;
  streamingDone: boolean;
  expectedDays: number;
}

export function Itinerary({ dias, currencySymbol, streamingDone, expectedDays }: ItineraryProps) {
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
          {expectedDays} días de aventura
        </h2>
        <p className="text-ivory/50 text-sm mt-1">
          Haz clic en cada día para expandir sus actividades
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25cm' }}>
        <AnimatePresence>
          {dias.map((day, i) => (
            <DayCard
              key={day.numero}
              day={day}
              currencySymbol={currencySymbol}
              index={i}
            />
          ))}
        </AnimatePresence>

        {!streamingDone && dias.length < expectedDays && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="glass rounded-2xl p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-gold text-lg"
              >
                ✦
              </motion.span>
            </div>
            <div>
              <p className="text-ivory/60 text-sm">Generando día {dias.length + 1} de {expectedDays}...</p>
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [1, 2, 1] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                    className="w-1 h-3 bg-gold/40 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
