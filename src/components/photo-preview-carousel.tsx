"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoPreviewCarouselProps {
  photos: string[];
  onRemove?: (url: string) => void;
  /** Auto-advance interval in ms. Set 0 to disable. */
  intervalMs?: number;
  className?: string;
  aspectClassName?: string;
}

export function PhotoPreviewCarousel({
  photos,
  onRemove,
  intervalMs = 3200,
  className,
  aspectClassName = "aspect-[16/10]",
}: PhotoPreviewCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = photos.length;

  useEffect(() => {
    if (index >= count) setIndex(Math.max(0, count - 1));
  }, [count, index]);

  useEffect(() => {
    if (count <= 1 || paused || intervalMs <= 0) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [count, paused, intervalMs]);

  if (count === 0) return null;

  const current = photos[Math.min(index, count - 1)];

  function go(delta: number) {
    setIndex((i) => (i + delta + count) % count);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--sand)]",
          aspectClassName,
        )}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={current}
            src={current}
            alt=""
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-125"
          />
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--ink)]/35 via-transparent to-transparent opacity-80" />

        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(current)}
            className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-black/80"
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition hover:bg-black/70 group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition hover:bg-black/70 group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
              {photos.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/80",
                  )}
                  aria-label={`Show photo ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {photos.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition",
                i === index
                  ? "border-[var(--teal)]"
                  : "border-transparent opacity-75 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover transition duration-300 hover:scale-125"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
