import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero } from './components/Hero';
import { InspirationSection } from './components/InspirationSection';
import { TripSummary } from './components/TripSummary';
import { MapView } from './components/MapView';
import { ImageGallery } from './components/ImageGallery';
import { Itinerary } from './components/Itinerary';
import { CostSummary } from './components/CostSummary';
import { useItinerary } from './hooks/useItinerary';
import { useWeather } from './hooks/useWeather';
import { useWikimedia } from './hooks/useWikimedia';
import type { SearchFormData } from './types/itinerary';

function LoadingScreen() {
  const messages = [
    'Consultando la IA...',
    'Investigando actividades locales...',
    'Calculando costos y rutas...',
    'Buscando los mejores lugares...',
    'Optimizando tu itinerario...',
    'Añadiendo los últimos detalles...',
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  // Cycle through messages
  useState(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  });

  return (
    <div className="fixed inset-0 z-50 bg-deep-black/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-gold border-r-transparent border-b-transparent border-l-transparent" />
              <div className="absolute inset-2 rounded-full border border-terracotta/30 border-t-terracotta" />
            </motion.div>
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.5rem', lineHeight: 1 }}>✦</span>
          </div>
        </div>

        <h2 className="font-display text-2xl text-ivory mb-3">Creando tu viaje perfecto</h2>

        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-ivory/50 text-sm"
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>

        <div className="mt-8 flex justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ scaleY: [1, 2, 1] }}
              transition={{
                duration: 1,
                delay: i * 0.15,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-1 h-4 bg-gold/40 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [formData, setFormData] = useState<SearchFormData | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [preloadCountry, setPreloadCountry] = useState<string | null>(null);
  const [preloadBudget, setPreloadBudget] = useState<number | null>(null);
  const [navVisible, setNavVisible] = useState(true);
  const resultRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollY.current && currentY >= 10;
      lastScrollY.current = currentY;

      if (scrollingDown) {
        setNavVisible(false);
      }

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setNavVisible(true), 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(idleTimer);
    };
  }, []);

  const { itinerary, loading, error, generate, regenerate, reset } = useItinerary();
  const { weather, loading: weatherLoading } = useWeather(
    formData?.destinationCoords?.lat ?? null,
    formData?.destinationCoords?.lng ?? null
  );
  const { images, loading: imagesLoading } = useWikimedia(
    itinerary ? (formData?.destination ?? null) : null,
    itinerary ?? null
  );

  const handleSubmit = useCallback(
    async (data: SearchFormData) => {
      setFormData(data);
      try {
        await generate(data);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } catch {
        // Error handled in hook
      }
    },
    [generate]
  );

  const handleRegenerate = useCallback(async () => {
    if (!formData) return;
    try {
      await regenerate(formData);
    } catch {
      // Error handled in hook
    }
  }, [formData, regenerate]);

  const handleNewSearch = useCallback(() => {
    reset();
    setFormData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [reset]);

  const handleExportPDF = useCallback(async () => {
    if (!resultRef.current || !itinerary) return;
    setExportingPDF(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      // Usa el motor CSS del navegador para resolver cualquier expresión de color
      // (oklch, oklab, color-mix, color()) a un valor rgb/rgba que html2canvas entienda
      const colorProbeDiv = document.createElement('div');
      colorProbeDiv.style.display = 'none';
      document.body.appendChild(colorProbeDiv);
      const colorCache = new Map<string, string>();
      const resolveColor = (expr: string): string => {
        if (colorCache.has(expr)) return colorCache.get(expr)!;
        try {
          colorProbeDiv.style.setProperty('background-color', expr, 'important');
          const val = window.getComputedStyle(colorProbeDiv).backgroundColor;
          const result = val?.startsWith('rgb') ? val : 'transparent';
          colorCache.set(expr, result);
          return result;
        } catch {
          colorCache.set(expr, 'transparent');
          return 'transparent';
        }
      };

      // Parser con conteo de paréntesis para extraer expresiones completas,
      // incluyendo color-mix(in oklab, var(--x) 50%, transparent) con parens anidados
      const patchCss = (css: string): string => {
        const triggers = ['color-mix(', 'oklch(', 'oklab(', 'color('];
        let out = '';
        let i = 0;
        while (i < css.length) {
          let found = false;
          for (const t of triggers) {
            if (css.startsWith(t, i)) {
              let depth = 0, j = i;
              while (j < css.length) {
                if (css[j] === '(') depth++;
                else if (css[j] === ')') { if (--depth === 0) { j++; break; } }
                j++;
              }
              out += resolveColor(css.slice(i, j));
              i = j;
              found = true;
              break;
            }
          }
          if (!found) out += css[i++];
        }
        return out;
      };

      const canvas = await html2canvas(resultRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0A0A0F',
        logging: false,
        onclone: (clonedDoc) => {
          Array.from(clonedDoc.querySelectorAll('style')).forEach((el) => {
            if (el.textContent) el.textContent = patchCss(el.textContent);
          });
        },
      });
      colorProbeDiv.remove();

      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / pdfWidth;
      const imgHeightMM = imgHeight / ratio;

      let heightLeft = imgHeightMM;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightMM);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeightMM;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightMM);
        heightLeft -= pdfHeight;
      }

      const filename = `lariguide-${(formData?.destination ?? 'viaje').split(',')[0].replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setExportingPDF(false);
    }
  }, [itinerary, formData]);

  return (
    <div className="min-h-screen bg-deep-black">
      <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>

      {/* Hero / Search + Inspiration */}
      <AnimatePresence>
        {!itinerary && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <Hero
              onSubmit={handleSubmit}
              loading={loading}
              preloadCountry={preloadCountry}
              preloadBudget={preloadBudget}
              onPreloadApplied={() => { setPreloadCountry(null); setPreloadBudget(null); }}
            />
            <div style={{ marginTop: '80px' }}>
              <InspirationSection onSelectDestination={(country, budget) => { setPreloadCountry(country); setPreloadBudget(budget); }} />
            </div>

            {/* Footer */}
            <div className="text-center py-8 border-t border-white/5 mt-16">
              <p className="text-gold text-sm font-medium">✦ LariGuide</p>
              <p className="text-ivory/30 text-xs mt-2">
                Planificación de viajes con IA · Datos de OpenStreetMap, Open-Meteo y Wikimedia
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {error && !loading && !itinerary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full flex justify-center px-4 py-16"
          >
            <div className="w-full max-w-2xl text-center">
              <div className="glass rounded-2xl p-8">
                <div className="text-4xl mb-4">⚠</div>
                <h2 className="font-display text-2xl text-ivory mb-3">Algo salió mal</h2>
                <p className="text-ivory/60 text-sm mb-6 leading-relaxed">{error}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleRegenerate}
                    className="bg-gold/10 text-gold border border-gold/30 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gold/20 transition-all"
                  >
                    Reintentar
                  </button>
                  <button
                    onClick={handleNewSearch}
                    className="bg-white/5 text-ivory/60 px-5 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-all"
                  >
                    Nueva búsqueda
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {itinerary && !loading && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Nav bar — fixed, hide on scroll down / show on scroll up */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                backgroundColor: 'rgba(10, 10, 15, 0.85)',
                borderBottom: '1px solid rgba(201, 168, 76, 0.1)',
                transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform 0.3s ease-in-out',
              }}
            >
              <div
                className="flex items-center justify-between py-3"
                style={{ width: '88%', maxWidth: '1024px', marginLeft: 'auto', marginRight: 'auto' }}
              >
                <button
                  onClick={handleNewSearch}
                  className="flex items-center gap-2 text-gold hover:text-gold/70 text-base font-medium transition-colors"
                >
                  ← Nueva búsqueda
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-gold text-sm font-medium">✦ LariGuide</span>
                </div>
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-2 text-gold hover:text-gold/70 text-base font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                    <polyline points="21 3 21 8 16 8" />
                    <polyline points="3 21 3 16 8 16" />
                  </svg>
                  Regenerar
                </button>
              </div>
            </div>

            {/* Content — paddingTop compensa la altura de la barra fija (~48px) */}
            <div
              className="pb-12"
              style={{ width: '88%', maxWidth: '1024px', marginLeft: 'auto', marginRight: 'auto', paddingTop: '48px' }}
            >
              {/* Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5cm', marginTop: '0.5cm' }}>
                {/* Trip Summary */}
                <TripSummary
                  itinerary={itinerary}
                  formData={formData!}
                  weather={weather}
                  weatherLoading={weatherLoading}
                />

                {/* Image Gallery */}
                <ImageGallery
                  images={images}
                  loading={imagesLoading}
                  destination={formData?.destination || ''}
                />

                {/* Map View */}
                <MapView
                  itinerary={itinerary}
                  destination={formData?.destination || ''}
                  destinationCoords={formData?.destinationCoords || null}
                />

                {/* Itinerary */}
                <Itinerary itinerary={itinerary} />

                {/* Cost Summary */}
                <CostSummary
                  itinerary={itinerary}
                  formData={formData!}
                  onExportPDF={handleExportPDF}
                  exportingPDF={exportingPDF}
                />
              </div>

              {/* Footer */}
              <div className="text-center py-8 border-t border-white/5 mt-8">
                <p className="text-gold text-sm font-medium">✦ LariGuide</p>
                <p className="text-ivory/30 text-xs mt-2">
                  Planificación de viajes con IA · Datos de OpenStreetMap, Open-Meteo y Wikimedia
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
