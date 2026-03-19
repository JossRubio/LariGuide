import { motion } from 'framer-motion';
import { SearchForm } from '../SearchForm';
import type { SearchFormData } from '../../types/itinerary';
import { useMemo } from 'react';

interface HeroProps {
  onSubmit: (data: SearchFormData) => void;
  loading: boolean;
  preloadCountry?: string | null;
  onPreloadApplied?: () => void;
}

export function Hero({ onSubmit, loading, preloadCountry, onPreloadApplied }: HeroProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
      })),
    []
  );

  return (
    <div className="relative flex items-center justify-center overflow-hidden bg-deep-black">
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1 h-1 bg-gold/30 rounded-full"
            style={{ left: p.left, top: p.top }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-terracotta/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4" style={{ paddingTop: '80px', paddingBottom: '40px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.3em' }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-gold text-sm font-medium uppercase mb-4"
          >
            ✦ LariGuide — Tu guía de viaje
          </motion.p>

          <h1 className="font-display text-5xl md:text-7xl text-ivory leading-tight mb-6">
            Tu próximo viaje,
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="block text-gold italic"
            >
              perfectamente planeado
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-ivory/50 text-sm md:text-base leading-relaxed text-center mt-8"
          >
            Itinerarios personalizados con inteligencia artificial. Cada detalle, cada momento, cada experiencia.
          </motion.p>

        </motion.div>

        <div className="mt-16" style={{ paddingTop: '1rem' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-8 mb-4 text-ivory/30 text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="text-gold">✦</span> IA Avanzada
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold">✦</span> Mapas Interactivos
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold">✦</span> Clima en Tiempo Real
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            <SearchForm
              onSubmit={onSubmit}
              loading={loading}
              preloadCountry={preloadCountry}
              onPreloadApplied={onPreloadApplied}
            />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-deep-black to-transparent pointer-events-none" />
    </div>
  );
}
