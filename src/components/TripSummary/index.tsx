import { motion } from 'framer-motion';
import type { ItineraryData, SearchFormData, WeatherData, Day } from '../../types/itinerary';
import { Badge } from '../UI/Badge';
import { Skeleton } from '../UI/Skeleton';

interface TripSummaryProps {
  resumen: ItineraryData['resumen'];
  streamedDias: Day[];
  expectedDays: number;
  formData: SearchFormData;
  weather: WeatherData | null;
  weatherLoading: boolean;
}

function WeatherIcon({ code }: { code: number }) {
  const icons: Record<number, string> = {
    0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️',
    45: '🌫', 48: '🌫', 51: '🌦', 53: '🌦', 55: '🌧',
    61: '🌧', 63: '🌧', 65: '🌧', 71: '🌨', 73: '🌨',
    75: '❄️', 80: '🌦', 81: '🌧', 82: '⛈', 95: '⛈',
    96: '⛈', 99: '⛈',
  };
  return <span className="text-2xl">{icons[code] || '🌡'}</span>;
}

export function TripSummary({ resumen, streamedDias, expectedDays, formData, weather, weatherLoading }: TripSummaryProps) {
  const totalActivities = streamedDias.reduce((acc, d) => acc + d.actividades.length, 0);

  const seasonConfig = {
    alta: { label: 'Temporada Alta', variant: 'red' as const, icon: '🔥' },
    media: { label: 'Temporada Media', variant: 'yellow' as const, icon: '🌤' },
    baja: { label: 'Temporada Baja', variant: 'green' as const, icon: '✨' },
  };
  const season = seasonConfig[resumen.temporada];

  const startDateStr = formData.startDate
    ? formData.startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const endDateStr = formData.endDate
    ? formData.endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <p className="text-gold text-xs font-medium uppercase tracking-widest mb-2">
            Tu itinerario
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-ivory mb-2">
            {formData.destination.split(',')[0]}
          </h2>
          <p className="text-ivory/50 text-sm">
            {formData.origin.split(',')[0]} → {formData.destination.split(',')[0]}
          </p>
          <p className="text-ivory/40 text-xs mt-1">
            {startDateStr} – {endDateStr}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={season.variant}>
            {season.icon} {season.label}
          </Badge>
          {formData.budgetEnabled && formData.budget && (
            <Badge variant="gold">
              💰 Presupuesto: ${formData.budget.toLocaleString()}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-dark rounded-xl p-4 text-center">
          <div className="text-3xl font-display text-gold mb-1">{expectedDays}</div>
          <div className="text-ivory/50 text-xs uppercase tracking-wider">Días</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="glass-dark rounded-xl p-4 text-center">
          <motion.div
            key={totalActivities}
            initial={{ scale: 1.2, color: '#C9A84C' }}
            animate={{ scale: 1, color: '#C9A84C' }}
            className="text-3xl font-display text-gold mb-1"
          >
            {totalActivities}
          </motion.div>
          <div className="text-ivory/50 text-xs uppercase tracking-wider">Actividades</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="glass-dark rounded-xl p-4 text-center">
          <div className="text-2xl font-display text-gold mb-1">
            ${resumen.presupuestoTotal.usd.toLocaleString()}
          </div>
          <div className="text-ivory/50 text-xs uppercase tracking-wider">Presupuesto Total</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="glass-dark rounded-xl p-4 text-center">
          {weatherLoading ? (
            <Skeleton className="h-8 w-16 mx-auto mb-1" />
          ) : weather ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <WeatherIcon code={weather.weathercode} />
                <span className="text-2xl font-display text-gold">{weather.temperature}°</span>
              </div>
              <div className="text-ivory/50 text-xs uppercase tracking-wider">{weather.description}</div>
            </>
          ) : (
            <>
              <div className="text-2xl text-ivory/30 mb-1">—</div>
              <div className="text-ivory/40 text-xs uppercase tracking-wider">Sin datos</div>
            </>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-dark rounded-xl p-5">
          <h3 className="text-gold text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>✈</span> Cómo llegar
          </h3>
          <p className="text-ivory/70 text-sm leading-relaxed mb-3">
            {resumen.como_llegar.descripcion}
          </p>
          <Badge variant="terracotta">
            ~${resumen.como_llegar.costo_estimado_usd} USD en transporte
          </Badge>
        </div>

        <div className="glass-dark rounded-xl p-5">
          <h3 className="text-gold text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>💡</span> Recomendaciones
          </h3>
          <ul className="space-y-2">
            {resumen.recomendaciones_generales.slice(0, 3).map((rec, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-2 text-sm text-ivory/70"
              >
                <span className="text-gold mt-0.5 shrink-0">✦</span>
                {rec}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {resumen.presupuestoTotal.nombreMoneda && resumen.presupuestoTotal.nombreMoneda !== 'USD' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 glass-dark rounded-xl p-4 flex items-center gap-3"
        >
          <span className="text-2xl">{resumen.presupuestoTotal.simbolo}</span>
          <div>
            <p className="text-ivory/50 text-xs uppercase tracking-wider">Moneda local</p>
            <p className="text-ivory text-sm font-medium">
              {resumen.presupuestoTotal.nombreMoneda} — 1 USD ={' '}
              {resumen.presupuestoTotal.valorMonedaLocal} {resumen.presupuestoTotal.monedaLocal}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
