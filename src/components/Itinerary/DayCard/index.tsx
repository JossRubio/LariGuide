import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Day } from '../../../types/itinerary';
import { ActivityCard } from '../ActivityCard';
import { Badge } from '../../UI/Badge';

interface DayCardProps {
  day: Day;
  currencySymbol: string;
  index: number;
}

export function DayCard({ day, currencySymbol, index }: DayCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const dateStr = new Date(day.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Day header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full p-5 md:p-6 flex items-start md:items-center justify-between gap-4 hover:bg-white/2 transition-colors duration-200"
      >
        <div className="flex items-start md:items-center gap-4 flex-1 min-w-0 text-left">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex flex-col items-center justify-center">
            <span className="text-gold font-display text-lg leading-none">{day.numero}</span>
            <span className="text-gold/50 text-[9px] uppercase tracking-wider">DÍA</span>
          </div>
          <div className="min-w-0">
            <p className="text-ivory/40 text-xs capitalize">{dateStr}</p>
            <h3 className="font-display text-xl text-ivory leading-tight">{day.titulo}</h3>
            <p className="text-ivory/50 text-sm mt-1 line-clamp-2">{day.descripcion_del_dia}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-right">
            <p className="text-gold font-semibold">${day.costo_total_dia_usd}</p>
            <p className="text-ivory/30 text-xs">USD / día</p>
          </div>
          <Badge variant="gold">{day.actividades.length} actividades</Badge>
          <span className="text-ivory/30 text-xs mt-1">{collapsed ? '▲' : '▼'}</span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 p-5 md:p-6">
              {/* Activities timeline */}
              <div className="mb-6">
                {day.actividades.map((activity, i) => (
                  <ActivityCard
                    key={i}
                    activity={activity}
                    index={i}
                    currencySymbol={currencySymbol}
                  />
                ))}
              </div>

              {/* Accommodation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-dark rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏨</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-ivory/40 text-xs uppercase tracking-wider mb-0.5">
                          Alojamiento sugerido
                        </p>
                        <h4 className="text-ivory font-semibold">{day.alojamiento_sugerido.nombre}</h4>
                        <p className="text-ivory/50 text-xs mt-0.5">{day.alojamiento_sugerido.tipo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold font-semibold">
                          ${day.alojamiento_sugerido.costo_noche_usd}
                        </p>
                        <p className="text-ivory/30 text-xs">por noche</p>
                      </div>
                    </div>
                    <p className="text-ivory/50 text-sm mt-2 leading-relaxed">
                      {day.alojamiento_sugerido.descripcion}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
