"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Navigation, Star } from "lucide-react";
import type { Place } from "@/lib/types";
import { PLACE_TYPE_LABELS, normalizePlaceType } from "@/lib/types";
import { averageRating, cn, formatDate } from "@/lib/utils";

interface PlaceCardProps {
  place: Place;
  index?: number;
}

export function PlaceCard({ place, index = 0 }: PlaceCardProps) {
  const avg = averageRating(place);
  const photos = place.photos;
  const [photoIndex, setPhotoIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (photos.length <= 1 || paused) return;
    const id = window.setInterval(() => {
      setPhotoIndex((i) => (i + 1) % photos.length);
    }, 3400);
    return () => window.clearInterval(id);
  }, [photos.length, paused]);

  const photo = photos[photoIndex] ?? photos[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_12px_30px_-24px_rgba(28,45,48,0.45)] sm:rounded-[1.1rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link href={`/places/${place.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--sand)]">
          {photo ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={photo}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                <Image
                  src={photo}
                  alt={place.name}
                  fill
                  className="object-cover transition duration-500 ease-out group-hover:scale-110"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 25vw"
                  unoptimized={photo.startsWith("/uploads")}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#f3d7b0_0%,transparent_45%),linear-gradient(145deg,#1f6f78_0%,#0f3d42_55%,#17353a_100%)]">
              <Navigation className="h-6 w-6 text-white/70 sm:h-8 sm:w-8" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/50 via-transparent to-transparent" />
          <span className="absolute left-1.5 top-1.5 rounded-full bg-[var(--cream)]/90 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-[var(--ink)] backdrop-blur sm:left-2 sm:top-2 sm:px-2 sm:py-0.5 sm:text-[10px]">
            {PLACE_TYPE_LABELS[normalizePlaceType(place.type)]}
          </span>
          {place.is_visited && avg !== null && (
            <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-0.5 rounded-full bg-[var(--cream)]/95 px-1.5 py-0.5 text-[10px] font-medium text-[var(--ink)] sm:bottom-2 sm:right-2 sm:px-2 sm:text-xs">
              <Star className="h-2.5 w-2.5 fill-[var(--amber)] text-[var(--amber)] sm:h-3 sm:w-3" />
              {avg.toFixed(1)}
            </span>
          )}
          {photos.length > 1 && (
            <div className="absolute bottom-1.5 left-1.5 flex gap-0.5 sm:bottom-2 sm:left-2 sm:gap-1">
              {photos.map((url, i) => (
                <span
                  key={url}
                  className={cn(
                    "h-0.5 rounded-full transition-all sm:h-1",
                    i === photoIndex
                      ? "w-2.5 bg-white sm:w-3"
                      : "w-0.5 bg-white/45 sm:w-1",
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1 p-2 sm:space-y-1.5 sm:p-3">
          <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-sm leading-snug text-[var(--ink)] sm:text-base">
            {place.name}
          </h3>
          <p className="flex items-start gap-1 text-[11px] text-[var(--muted)] sm:text-xs">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{place.location}</span>
          </p>
          {place.description && (
            <p className="hidden line-clamp-1 text-xs leading-relaxed text-[var(--ink)]/70 sm:block">
              {place.description}
            </p>
          )}
          <div className="pt-0.5">
            <span
              className={cn(
                "inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] sm:px-2 sm:text-[10px]",
                place.is_visited
                  ? "bg-[var(--teal-soft)] text-[var(--teal)]"
                  : "bg-[var(--amber-soft)] text-[var(--amber-deep)]",
              )}
            >
              {place.is_visited
                ? `Visited ${formatDate(place.visited_at)}`
                : "On your list"}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
