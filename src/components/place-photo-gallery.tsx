"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, X, ZoomIn } from "lucide-react";

interface PlacePhotoGalleryProps {
  photos: string[];
  placeName: string;
  typeLabel: string;
  location: string;
}

export function PlacePhotoGallery({
  photos,
  placeName,
  typeLabel,
  location,
}: PlacePhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const activePhoto = photos[activeIndex];

  useEffect(() => {
    if (lightboxIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowLeft") {
        setLightboxIndex((index) =>
          index === null ? null : (index - 1 + photos.length) % photos.length,
        );
      }
      if (event.key === "ArrowRight") {
        setLightboxIndex((index) =>
          index === null ? null : (index + 1) % photos.length,
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, photos.length]);

  function showPrevious() {
    setLightboxIndex((index) =>
      index === null ? null : (index - 1 + photos.length) % photos.length,
    );
  }

  function showNext() {
    setLightboxIndex((index) =>
      index === null ? null : (index + 1) % photos.length,
    );
  }

  function openPhoto(index: number) {
    setActiveIndex(index);
    setLightboxIndex(index);
  }

  return (
    <>
      <div className="relative aspect-[4/3] min-h-[200px] bg-[var(--sand)] sm:aspect-[21/9] sm:min-h-[220px]">
        {activePhoto ? (
          <button
            type="button"
            onClick={() => openPhoto(activeIndex)}
            aria-label={`View photo ${activeIndex + 1} of ${photos.length} for ${placeName}`}
            className="group absolute inset-0 block h-full w-full cursor-zoom-in text-left"
          >
            <Image
              src={activePhoto}
              alt={`${placeName} photo ${activeIndex + 1}`}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="100vw"
              unoptimized={activePhoto.startsWith("/uploads")}
            />
            <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-2 text-xs font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <ZoomIn className="h-4 w-4" />
              View full image
            </span>
          </button>
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#1f6f78,#17353a_50%,#d76b5c)]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--ink)]/70 via-[var(--ink)]/20 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <span className="rounded-full bg-[var(--cream)]/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--ink)]">
            {typeLabel}
          </span>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.75rem,7vw,3rem)] leading-tight text-white">
            {placeName}
          </h1>
          <p className="mt-2 flex items-start gap-1.5 text-sm text-white/85 sm:text-base">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            {location}
          </p>
        </div>
      </div>

      {photos.length > 1 && (
        <div
          aria-label="Place photos"
          className="flex gap-2 overflow-x-auto border-b border-[var(--line)] p-4"
        >
          {photos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Select photo ${index + 1} of ${photos.length}`}
              aria-pressed={activeIndex === index}
              className={`group relative h-20 w-28 shrink-0 overflow-hidden rounded-xl transition ${
                activeIndex === index
                  ? "ring-2 ring-[var(--teal)] ring-offset-2"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <Image
                src={photo}
                alt={`${placeName} photo ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="112px"
                unoptimized={photo.startsWith("/uploads")}
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxIndex !== null && activePhoto && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${placeName} photo viewer`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) setLightboxIndex(null);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close photo viewer"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label="Previous photo"
                  className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next photo"
                  className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="relative h-[80vh] w-full max-w-6xl">
              <Image
                src={photos[lightboxIndex]}
                alt={`${placeName} photo ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                unoptimized={photos[lightboxIndex].startsWith("/uploads")}
              />
            </div>
            <p className="absolute bottom-4 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">
              {lightboxIndex + 1} / {photos.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
