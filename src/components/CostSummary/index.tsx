import { motion } from 'framer-motion';
import type { ItineraryData, SearchFormData } from '../../types/itinerary';

interface CostSummaryProps {
  itinerary: ItineraryData;
  formData: SearchFormData;
  onExportPDF: () => void;
  exportingPDF: boolean;
}

export function CostSummary({ itinerary, formData, onExportPDF, exportingPDF }: CostSummaryProps) {
  const { resumen, dias } = itinerary;

  // Calculate cost breakdown
  const costByType: Record<string, number> = {};
  let totalActivities = 0;
  let totalAccommodation = 0;

  dias.forEach((day) => {
    day.actividades.forEach((activity) => {
      if (!costByType[activity.tipo]) costByType[activity.tipo] = 0;
      costByType[activity.tipo] += activity.costo_usd;
      totalActivities += activity.costo_usd;
    });
    totalAccommodation += day.alojamiento_sugerido.costo_noche_usd;
  });

  const transportCost = resumen.como_llegar.costo_estimado_usd;
  const grandTotal = resumen.presupuestoTotal.usd;
  const budgetUsedPercent = formData.budgetEnabled && formData.budget
    ? Math.min((grandTotal / formData.budget) * 100, 100)
    : null;

  const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
    atraccion: { label: 'Atracciones', icon: '🏛', color: '#C9A84C' },
    comida: { label: 'Comida', icon: '🍽', color: '#C4724A' },
    transporte: { label: 'Transporte local', icon: '🚌', color: '#6B7280' },
    alojamiento: { label: 'Alojamiento diario', icon: '🏨', color: '#8B5CF6' },
    compras: { label: 'Compras', icon: '🛍', color: '#EC4899' },
    naturaleza: { label: 'Naturaleza', icon: '🌿', color: '#10B981' },
  };

  const costEntries = Object.entries(costByType).sort(([, a], [, b]) => b - a);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-gold text-xs font-medium uppercase tracking-widest mb-2">
            Resumen de costos
          </p>
          <h2 className="font-display text-2xl text-ivory">Desglose financiero</h2>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExportPDF}
          disabled={exportingPDF}
          className="flex items-center gap-2 bg-gold/10 text-gold border border-gold/30 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gold/20 transition-all duration-300 disabled:opacity-50"
        >
          {exportingPDF ? (
            <>
              <span className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              📥 Exportar PDF
            </>
          )}
        </motion.button>
      </div>

      {/* Grand total */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="glass-dark rounded-2xl p-6 mb-6 flex items-center justify-between"
      >
        <div>
          <p className="text-ivory/40 text-xs uppercase tracking-wider mb-1">Total del viaje</p>
          <p className="font-display text-4xl text-gold">${grandTotal.toLocaleString()}</p>
          <p className="text-ivory/40 text-sm mt-1">
            {resumen.presupuestoTotal.valorMonedaLocal > 0 && (
              <>
                {resumen.presupuestoTotal.simbolo}
                {(grandTotal * resumen.presupuestoTotal.valorMonedaLocal).toLocaleString()}{' '}
                {resumen.presupuestoTotal.monedaLocal}
              </>
            )}
          </p>
        </div>
        <div className="text-5xl opacity-20">💰</div>
      </motion.div>

      {/* Budget progress bar */}
      {budgetUsedPercent !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 glass-dark rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-ivory/60 text-sm">Uso del presupuesto</span>
            <span
              className={`text-sm font-semibold ${
                budgetUsedPercent > 90 ? 'text-red-400' :
                budgetUsedPercent > 70 ? 'text-yellow-400' : 'text-green-400'
              }`}
            >
              {budgetUsedPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${budgetUsedPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                budgetUsedPercent > 90 ? 'bg-red-500' :
                budgetUsedPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-ivory/30">
            <span>$0</span>
            <span>Presupuesto: ${formData.budget?.toLocaleString()}</span>
          </div>
        </motion.div>
      )}

      {/* Cost breakdown table */}
      <div className="space-y-2 mb-6">
        {/* Transport to destination */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between p-3 glass-dark rounded-xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">✈</span>
            <div>
              <p className="text-ivory text-sm font-medium">Transporte al destino</p>
              <p className="text-ivory/40 text-xs">Vuelos / transporte principal</p>
            </div>
          </div>
          <span className="text-gold font-semibold">${transportCost.toLocaleString()}</span>
        </motion.div>

        {/* Accommodation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between p-3 glass-dark rounded-xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🏨</span>
            <div>
              <p className="text-ivory text-sm font-medium">Alojamiento total</p>
              <p className="text-ivory/40 text-xs">{dias.length} noches</p>
            </div>
          </div>
          <span className="text-gold font-semibold">${totalAccommodation.toLocaleString()}</span>
        </motion.div>

        {/* Activities by type */}
        {costEntries.map(([type, cost], i) => {
          const config = typeLabels[type] || { label: type, icon: '📌', color: '#C9A84C' };
          const percentage = totalActivities > 0 ? (cost / (grandTotal - transportCost)) * 100 : 0;

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (i + 2) * 0.05 }}
              className="flex items-center justify-between p-3 glass-dark rounded-xl"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xl">{config.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-ivory text-sm font-medium">{config.label}</p>
                  <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                  </div>
                </div>
              </div>
              <span className="text-gold font-semibold ml-4">${cost.toLocaleString()}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Per-day breakdown */}
      <div className="glass-dark rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <h3 className="text-ivory/60 text-xs font-semibold uppercase tracking-wider">
            Costo por día
          </h3>
        </div>
        <div className="divide-y divide-white/5">
          {dias.map((day, i) => (
            <motion.div
              key={day.numero}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between px-4 py-3 hover:bg-white/2 transition-colors"
            >
              <div>
                <span className="text-ivory/40 text-xs mr-2">Día {day.numero}</span>
                <span className="text-ivory text-sm">{day.titulo}</span>
              </div>
              <div className="text-right">
                <span className="text-gold text-sm font-medium">
                  ${day.costo_total_dia_usd.toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-gold/20 bg-gold/5 flex items-center justify-between">
          <span className="text-gold text-sm font-semibold">Total (sin transporte principal)</span>
          <span className="text-gold font-bold">
            ${(grandTotal - transportCost).toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
