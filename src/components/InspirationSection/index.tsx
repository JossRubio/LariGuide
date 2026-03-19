import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { searchImages } from '../../services/wikimedia';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SeasonalRec {
  name: string;
  country: string;
  reason: string;
  estimatedPrice: number;
  season: string;
  iconicAttraction: string;
}

// ─── Seasonal destination card ─────────────────────────────────────────────────
function SeasonalCard({
  rec,
  index,
  onSelect,
}: {
  rec: SeasonalRec;
  index: number;
  onSelect: (country: string) => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    searchImages(rec.iconicAttraction || rec.name, 1)
      .then((imgs) => { if (imgs[0]) setImageUrl(imgs[0].thumbUrl); })
      .catch(() => {})
      .finally(() => setImgLoading(false));
  }, [rec.iconicAttraction, rec.name]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(rec.country)}
      className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer text-left w-full"
    >
      {/* Image / skeleton */}
      {imgLoading ? (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={rec.iconicAttraction || rec.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-white/5" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-display text-xl text-ivory">{rec.name}</h3>
        <p className="text-ivory/60 text-xs mt-0.5">✦ {rec.season}</p>
        <p className="text-gold text-sm font-medium mt-1">Desde ~${rec.estimatedPrice} USD</p>
        <p className="text-ivory/50 text-xs mt-1 leading-relaxed line-clamp-2">{rec.reason}</p>
      </div>

      {/* Hover CTA */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="bg-gold/90 text-deep-black text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
          Planificar viaje →
        </span>
      </div>
    </motion.button>
  );
}

// ─── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-white/5 animate-pulse" />
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function InspirationSection({ onSelectDestination }: { onSelectDestination: (country: string) => void }) {
  const [seasonal, setSeasonal] = useState<SeasonalRec[]>([]);
  const [seasonalLoading, setSeasonalLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/seasonal-recommendations')
      .then((r) => r.json())
      .then((data) => setSeasonal(data))
      .catch(() => {})
      .finally(() => setSeasonalLoading(false));
  }, []);

  const handleSelect = (country: string) => {
    onSelectDestination(country);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col items-center px-6" style={{ paddingBottom: '80px' }}>
    <div className="w-full max-w-6xl">

      {/* Divider */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-gold/40 text-xs uppercase tracking-widest">Inspiración</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Section heading */}
      <div className="text-center mb-8">
        <p className="text-gold text-xs font-medium uppercase tracking-widest mb-2">✦ Ahora mismo</p>
        <h2 className="font-display text-3xl md:text-4xl text-ivory">Destinos de temporada</h2>
        <p className="text-ivory/40 text-sm mt-2">Recomendaciones de temporada · Generadas por IA para {new Date().toLocaleString('es-CL', { month: 'long' })}</p>
      </div>

      {/* 3×2 grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {seasonalLoading
          ? [0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)
          : seasonal.map((rec, i) => (
              <SeasonalCard key={rec.name} rec={rec} index={i} onSelect={handleSelect} />
            ))}
      </div>

    </div>
    </div>
  );
}
