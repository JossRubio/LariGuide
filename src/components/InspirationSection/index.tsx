import { useState, useEffect, useRef } from 'react';
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
  onSelect,
}: {
  rec: SeasonalRec;
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
    <button
      onClick={() => onSelect(rec.country)}
      className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer text-left w-full"
    >
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

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-display text-xl text-ivory">{rec.name}</h3>
        <p className="text-ivory/60 text-xs mt-0.5">✦ {rec.season}</p>
        <p className="text-gold text-sm font-medium mt-1">Desde ~${rec.estimatedPrice} USD</p>
        <p className="text-ivory/50 text-xs mt-1 leading-relaxed line-clamp-2">{rec.reason}</p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="bg-gold/90 text-deep-black text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
          Planificar viaje →
        </span>
      </div>
    </button>
  );
}

// ─── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-white/5 animate-pulse w-full" />;
}

// ─── Carousel ──────────────────────────────────────────────────────────────────
const TOTAL_CARDS = 9;
const DESKTOP_PER_PAGE = 3;
const AUTO_INTERVAL = 10000;
const TRANSITION_MS = 500;

function Carousel({
  items,
  loading,
  onSelect,
}: {
  items: SeasonalRec[];
  loading: boolean;
  onSelect: (country: string) => void;
}) {
  // Responsive cards per page
  const [perPage, setPerPage] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : DESKTOP_PER_PAGE
  );

  useEffect(() => {
    const handler = () => setPerPage(window.innerWidth < 768 ? 1 : DESKTOP_PER_PAGE);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const cardCount = loading ? TOTAL_CARDS : items.length;
  const totalPages = Math.ceil(cardCount / perPage);

  const [page, setPage] = useState(0);
  const hovered = useRef(false);

  // Clamp page when perPage/totalPages changes
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  // Auto-advance
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      if (!hovered.current) {
        setPage((p) => (p + 1) % totalPages);
      }
    }, AUTO_INTERVAL);
    return () => clearInterval(interval);
  }, [loading, totalPages]);

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(next, totalPages - 1));
    setPage(clamped);
  };

  // Build page groups
  const skeletons = Array.from({ length: TOTAL_CARDS });
  const pageGroups = Array.from({ length: totalPages }, (_, i) => ({
    start: i * perPage,
    end: Math.min((i + 1) * perPage, cardCount),
  }));

  // translateX: each page-slide is w-full (= 100% of container).
  // The flex track width = totalPages * container width.
  // translateX(-X%) shifts by X% of track width.
  // To shift by 1 page = 1 container width: shift by (100 / totalPages)%
  const translatePct = page * (100 / totalPages);

  return (
    <div
      className="relative"
      onMouseEnter={() => { hovered.current = true; }}
      onMouseLeave={() => { hovered.current = false; }}
    >
      {/* Viewport */}
      <div className="overflow-hidden">
        {/* Track — contains one full-width slide per page */}
        <div
          className="flex"
          style={{
            transform: `translateX(-${translatePct}%)`,
            transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        >
          {pageGroups.map((group, pageIdx) => (
            <div
              key={pageIdx}
              className="w-full flex-shrink-0 grid gap-4"
              style={{ gridTemplateColumns: `repeat(${perPage}, 1fr)` }}
            >
              {loading
                ? skeletons.slice(group.start, group.end).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                : items.slice(group.start, group.end).map((rec) => (
                    <SeasonalCard key={rec.name} rec={rec} onSelect={onSelect} />
                  ))}
            </div>
          ))}
        </div>
      </div>

      {/* Left arrow */}
      <button
        onClick={() => goTo(page - 1)}
        aria-label="Anterior"
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 border border-gold/30 text-gold shadow-lg transition-all duration-300 hover:bg-black/80 hover:border-gold/60 focus:outline-none ${
          page === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        onClick={() => goTo(page + 1)}
        aria-label="Siguiente"
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 border border-gold/30 text-gold shadow-lg transition-all duration-300 hover:bg-black/80 hover:border-gold/60 focus:outline-none ${
          page === totalPages - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Pagination dots */}
      <div className="flex justify-center items-center gap-2 mt-6">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Grupo ${i + 1}`}
            className={`rounded-full transition-all duration-300 focus:outline-none ${
              i === page
                ? 'w-4 h-2 bg-gold'
                : 'w-2 h-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
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
          <p className="text-ivory/40 text-sm mt-2">
            Recomendaciones de temporada · Generadas por IA para{' '}
            {new Date().toLocaleString('es-CL', { month: 'long' })}
          </p>
        </div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-6"
        >
          <Carousel
            items={seasonal}
            loading={seasonalLoading}
            onSelect={handleSelect}
          />
        </motion.div>

      </div>
    </div>
  );
}
