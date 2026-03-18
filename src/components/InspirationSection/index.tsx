import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { searchImages } from '../../services/wikimedia';

// ─── Static featured destinations ─────────────────────────────────────────────
interface FeaturedDestination {
  name: string;
  country: string;   // Spanish country name matching COUNTRIES list
  season: string;
  priceFrom: number;
  searchQuery: string;
}

const FEATURED: FeaturedDestination[] = [
  { name: 'Japón',      country: 'Japón',      season: 'Mar–May · Oct–Nov', priceFrom: 1800, searchQuery: 'Mount Fuji Japan' },
  { name: 'Italia',     country: 'Italia',     season: 'Abr–Jun · Sep–Oct', priceFrom: 1400, searchQuery: 'Colosseum Rome Italy' },
  { name: 'Marruecos',  country: 'Marruecos',  season: 'Mar–May · Sep–Nov', priceFrom: 1100, searchQuery: 'Medina Marrakech Morocco' },
  { name: 'Perú',       country: 'Perú',       season: 'May–Oct',           priceFrom: 400,  searchQuery: 'Machu Picchu Peru' },
  { name: 'Islandia',   country: 'Islandia',   season: 'Jun–Ago',           priceFrom: 1600, searchQuery: 'Iceland waterfall landscape' },
  { name: 'Tailandia',  country: 'Tailandia',  season: 'Nov–Mar',           priceFrom: 1200, searchQuery: 'Thailand temple Bangkok' },
];

// ─── Seasonal recommendation type (from Groq) ─────────────────────────────────
interface SeasonalRec {
  name: string;
  country: string;
  reason: string;
  estimatedPrice: number;
  season: string;
}

// ─── Featured destination card ─────────────────────────────────────────────────
function FeaturedCard({
  dest,
  index,
  onSelect,
}: {
  dest: FeaturedDestination;
  index: number;
  onSelect: (country: string) => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    searchImages(dest.searchQuery, 1)
      .then((imgs) => { if (imgs[0]) setImageUrl(imgs[0].thumbUrl); })
      .catch(() => {})
      .finally(() => setImgLoading(false));
  }, [dest.searchQuery]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(dest.country)}
      className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer text-left w-full"
    >
      {/* Image / skeleton */}
      {imgLoading ? (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={dest.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-white/5" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-display text-xl text-ivory">{dest.name}</h3>
        <p className="text-ivory/60 text-xs mt-0.5">✦ {dest.season}</p>
        <p className="text-gold text-sm font-medium mt-1">Desde ~${dest.priceFrom} USD</p>
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

// ─── Seasonal recommendation card ─────────────────────────────────────────────
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

  useEffect(() => {
    searchImages(rec.name, 1)
      .then((imgs) => { if (imgs[0]) setImageUrl(imgs[0].thumbUrl); })
      .catch(() => {});
  }, [rec.name]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(rec.country)}
      className="glass rounded-2xl overflow-hidden group cursor-pointer text-left w-full"
    >
      {/* Image */}
      {imageUrl && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={imageUrl}
            alt={rec.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display text-lg text-ivory leading-tight">{rec.name}</h3>
          <span className="text-gold text-sm font-medium shrink-0">~${rec.estimatedPrice}</span>
        </div>
        <p className="text-gold/70 text-xs">{rec.season}</p>
        <p className="text-ivory/50 text-xs mt-2 leading-relaxed">{rec.reason}</p>
        <div className="mt-3 text-gold/50 text-xs group-hover:text-gold transition-colors">
          Planificar →
        </div>
      </div>
    </motion.button>
  );
}

// ─── Skeleton for seasonal cards ───────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      <div className="h-36 bg-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-5 bg-white/10 rounded w-2/3" />
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-3 bg-white/5 rounded w-full mt-2" />
        <div className="h-3 bg-white/5 rounded w-4/5" />
      </div>
    </div>
  );
}

// ─── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-8">
      <p className="text-gold text-xs font-medium uppercase tracking-widest mb-2">✦ {eyebrow}</p>
      <h2 className="font-display text-3xl md:text-4xl text-ivory">{title}</h2>
      {subtitle && <p className="text-ivory/40 text-sm mt-2">{subtitle}</p>}
    </div>
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
    <div className="max-w-6xl mx-auto px-6 py-20">

      {/* Divider */}
      <div className="flex items-center gap-4 mb-16">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-gold/40 text-xs uppercase tracking-widest">Inspiración</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* ── Featured destinations ── */}
      <section className="mb-20">
        <SectionHeading eyebrow="Explora el mundo" title="Destinos destacados" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURED.map((dest, i) => (
            <FeaturedCard key={dest.name} dest={dest} index={i} onSelect={handleSelect} />
          ))}
        </div>
      </section>

      {/* ── Seasonal recommendations ── */}
      <section>
        <SectionHeading
          eyebrow="Ahora mismo"
          title="Destinos de temporada"
          subtitle="Recomendados por IA según el mes actual"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {seasonalLoading
            ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
            : seasonal.map((rec, i) => (
                <SeasonalCard key={rec.name} rec={rec} index={i} onSelect={handleSelect} />
              ))}
        </div>
      </section>
    </div>
  );
}
