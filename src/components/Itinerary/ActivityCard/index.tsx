import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Activity } from '../../../types/itinerary';
import { Badge } from '../../UI/Badge';

interface ActivityCardProps {
  activity: Activity;
  index: number;
  currencySymbol: string;
}

const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
  atraccion: { icon: '🏛', label: 'Atracción', color: 'gold' },
  comida: { icon: '🍽', label: 'Comida', color: 'terracotta' },
  transporte: { icon: '🚌', label: 'Transporte', color: 'gold' },
  alojamiento: { icon: '🏨', label: 'Alojamiento', color: 'gold' },
  compras: { icon: '🛍', label: 'Compras', color: 'gold' },
  naturaleza: { icon: '🌿', label: 'Naturaleza', color: 'green' },
};

const concurrencyConfig: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' }> = {
  bajo: { label: 'Poca gente', variant: 'green' },
  medio: { label: 'Moderado', variant: 'yellow' },
  alto: { label: 'Muy concurrido', variant: 'red' },
};

export function ActivityCard({ activity, index, currencySymbol }: ActivityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const type = typeConfig[activity.tipo] || typeConfig.atraccion;
  const concurrency = concurrencyConfig[activity.nivel_concurrencia];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative pl-8"
    >
      {/* Timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" />

      {/* Timeline dot */}
      <div
        className="absolute left-1.5 top-4 w-3 h-3 rounded-full border-2 z-10"
        style={{
          borderColor: activity.tipo === 'comida' ? '#C4724A' :
                       activity.tipo === 'naturaleza' ? '#10B981' : '#C9A84C',
          background: '#0A0A0F',
        }}
      />

      <div
        className="glass-dark rounded-xl overflow-hidden mb-4 cursor-pointer hover:border-gold/20 transition-all duration-300"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="text-2xl shrink-0 mt-0.5">{type.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-gold/70 text-xs font-mono">{activity.hora}</span>
                  <Badge variant={type.color as any}>{type.label}</Badge>
                  {activity.requiere_reservacion && (
                    <Badge variant="terracotta">Reservación</Badge>
                  )}
                </div>
                <h4 className="text-ivory font-semibold text-sm leading-tight">{activity.nombre}</h4>
                <p className="text-ivory/50 text-xs mt-1 line-clamp-2">{activity.descripcion}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-gold font-semibold text-sm">${activity.costo_usd}</div>
              <div className="text-ivory/30 text-xs">USD</div>
              <div className="text-ivory/40 text-xs mt-0.5">{activity.duracion_horas}h</div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/5 p-4 space-y-4">
                {/* Details grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-ivory/30 text-xs uppercase tracking-wider mb-1">Costo local</p>
                    <p className="text-ivory text-sm">
                      {currencySymbol}{activity.costo_moneda_local.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-ivory/30 text-xs uppercase tracking-wider mb-1">Concurrencia</p>
                    <Badge variant={concurrency.variant}>{concurrency.label}</Badge>
                  </div>
                  <div>
                    <p className="text-ivory/30 text-xs uppercase tracking-wider mb-1">Mejor hora</p>
                    <p className="text-ivory text-sm">{activity.mejor_hora_visita}</p>
                  </div>
                </div>

                {/* Tips */}
                {activity.tips && activity.tips.length > 0 && (
                  <div>
                    <p className="text-ivory/30 text-xs uppercase tracking-wider mb-2">Tips</p>
                    <ul className="space-y-1.5">
                      {activity.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-ivory/60">
                          <span className="text-gold mt-0.5 shrink-0">✦</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reservation banner */}
                {activity.requiere_reservacion && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-terracotta/10 border border-terracotta/30 rounded-lg p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-terracotta text-xs font-semibold">Requiere reservación anticipada</p>
                      {activity.nombre_sitio_oficial && (
                        <p className="text-ivory/50 text-xs mt-0.5">{activity.nombre_sitio_oficial}</p>
                      )}
                    </div>
                    {activity.url_reservacion && (
                      <a
                        href={activity.url_reservacion}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-terracotta text-ivory text-xs px-3 py-1.5 rounded-lg hover:bg-terracotta/80 transition-colors shrink-0 font-medium"
                      >
                        Reservar →
                      </a>
                    )}
                  </motion.div>
                )}

                {/* Coordinates */}
                <div className="flex items-center gap-2 text-ivory/30 text-xs">
                  <span>📍</span>
                  <span>
                    {activity.coordenadas.lat.toFixed(4)}, {activity.coordenadas.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 pb-2 text-ivory/30 text-xs text-right">
          {expanded ? '▲ Menos' : '▼ Más detalles'}
        </div>
      </div>
    </motion.div>
  );
}
