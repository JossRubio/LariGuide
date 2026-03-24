import { useState, useRef, useCallback } from 'react';
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
  const resultRef = useRef<HTMLDivElement>(null);

  const { itinerary, loading, error, generate, regenerate, reset } = useItinerary();
  const { weather, loading: weatherLoading } = useWeather(
    formData?.destinationCoords?.lat ?? null,
    formData?.destinationCoords?.lng ?? null
  );
  const { images, loading: imagesLoading } = useWikimedia(
    itinerary ? (formData?.destination ?? null) : null
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

      const canvas = await html2canvas(resultRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0A0A0F',
        logging: false,
      });

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
              onPreloadApplied={() => setPreloadCountry(null)}
            />
            <div style={{ marginTop: '80px' }}>
              <InspirationSection onSelectDestination={setPreloadCountry} />
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
            className="max-w-6xl mx-auto px-4 py-12 space-y-8"
          >
            {/* Nav bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <button
                onClick={handleNewSearch}
                className="flex items-center gap-2 text-ivory/50 hover:text-ivory text-sm transition-colors"
              >
                ← Nueva búsqueda
              </button>
              <div className="flex items-center gap-2">
                <span className="text-gold text-sm font-medium">✦ LariGuide</span>
              </div>
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 text-ivory/50 hover:text-gold text-sm transition-colors"
              >
                🔄 Regenerar
              </button>
            </motion.div>

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

            {/* Footer */}
            <div className="text-center py-8 border-t border-white/5">
              <p className="text-gold text-sm font-medium">✦ LariGuide</p>
              <p className="text-ivory/30 text-xs mt-2">
                Planificación de viajes con IA · Datos de OpenStreetMap, Open-Meteo y Wikimedia
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
