import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WikimediaImage } from '../../types/itinerary';
import { Skeleton } from '../UI/Skeleton';

interface ImageGalleryProps {
  images: WikimediaImage[];
  loading: boolean;
  destination: string;
}

function LightBox({
  image,
  onClose,
  onPrev,
  onNext,
}: {
  image: WikimediaImage;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9000] bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl z-10"
      >
        ✕
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl z-10 w-12 h-12 flex items-center justify-center glass-dark rounded-full"
      >
        ‹
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl z-10 w-12 h-12 flex items-center justify-center glass-dark rounded-full"
      >
        ›
      </button>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-4xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.url}
          alt={image.title}
          className="max-h-[70vh] w-auto mx-auto rounded-xl object-contain"
        />
        <div className="mt-4 text-center">
          <p className="text-ivory font-medium">{image.title}</p>
          {image.author && (
            <p className="text-ivory/40 text-sm mt-1">📷 {image.author}</p>
          )}
          {image.description && (
            <p className="text-ivory/60 text-sm mt-1 max-w-xl mx-auto">{image.description}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ImageGallery({ images, loading, destination }: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 md:p-8">
        <div className="mb-6">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`rounded-xl ${i === 0 ? 'col-span-2 h-64' : 'h-44'}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!images.length) return null;

  // Create masonry-like layout
  const featured = images[0];
  const rest = images.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-6 md:p-8"
    >
      <div className="mb-6">
        <p className="text-gold text-xs font-medium uppercase tracking-widest mb-2">
          Galería de imágenes
        </p>
        <h2 className="font-display text-2xl text-ivory">
          {destination.split(',')[0]} en imágenes
        </h2>
        <p className="text-ivory/40 text-xs mt-1">
          Imágenes de Wikimedia Commons
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Featured image - spans 2 columns */}
        <motion.div
          className="col-span-2 md:col-span-2 relative overflow-hidden rounded-xl cursor-pointer group flex flex-col"
          onClick={() => setLightboxIndex(0)}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative overflow-hidden" style={{ height: '240px' }}>
            <img
              src={featured.thumbUrl}
              alt={featured.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute top-3 right-3 glass-dark rounded-lg px-2 py-1 text-xs text-ivory/60">
              🔍 Ver
            </div>
          </div>
          <div className="bg-black/60 backdrop-blur-sm px-4 py-3 rounded-b-xl">
            <p className="text-ivory text-sm font-medium truncate">{featured.title}</p>
            {featured.description && (
              <p className="text-ivory/60 text-xs mt-0.5 line-clamp-2">{featured.description}</p>
            )}
            {featured.author && (
              <p className="text-ivory/30 text-xs mt-1">📷 {featured.author}</p>
            )}
          </div>
        </motion.div>

        {/* Rest of images */}
        {rest.slice(0, 7).map((image, i) => (
          <motion.div
            key={i}
            className="relative overflow-hidden rounded-xl cursor-pointer group flex flex-col"
            onClick={() => setLightboxIndex(i + 1)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative overflow-hidden" style={{ height: '150px' }}>
              <img
                src={image.thumbUrl}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  const parent = (e.target as HTMLImageElement).closest('.flex') as HTMLElement;
                  if (parent) parent.style.display = 'none';
                }}
              />
            </div>
            <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-b-xl flex-1">
              <p className="text-ivory text-xs font-medium truncate">{image.title}</p>
              {image.description && (
                <p className="text-ivory/50 text-xs mt-0.5 line-clamp-2">{image.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-ivory/30 text-xs text-center mt-4">
        Imágenes licenciadas bajo Creative Commons — Wikimedia Commons
      </p>

      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <LightBox
            image={images[lightboxIndex]}
            onClose={() => setLightboxIndex(null)}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
