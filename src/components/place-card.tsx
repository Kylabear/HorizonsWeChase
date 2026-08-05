"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
  const photo = place.photos[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.55,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] shadow-[0_20px_50px_-30px_rgba(28,45,48,0.45)] sm:rounded-[1.4rem]"
    >
      <Link href={`/places/${place.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--sand)]">
          {photo ? (
            <Image
              src={photo}
              alt={place.name}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={photo.startsWith("/uploads")}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#f3d7b0_0%,transparent_45%),linear-gradient(145deg,#1f6f78_0%,#0f3d42_55%,#17353a_100%)]">
              <Navigation className="h-10 w-10 text-white/70" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/55 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 rounded-full bg-[var(--cream)]/90 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--ink)] backdrop-blur">
            {PLACE_TYPE_LABELS[normalizePlaceType(place.type)]}
          </span>
          {place.is_visited && avg !== null && (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-[var(--cream)]/95 px-2.5 py-1 text-xs font-medium text-[var(--ink)]">
              <Star className="h-3 w-3 fill-[var(--amber)] text-[var(--amber)]" />
              {avg.toFixed(1)}
            </span>
          )}
        </div>

        <div className="space-y-2 p-4 sm:p-5">
          <h3 className="font-[family-name:var(--font-display)] text-[clamp(1.35rem,5vw,1.65rem)] leading-tight text-[var(--ink)]">
            {place.name}
          </h3>
          <p className="flex items-start gap-1.5 text-sm text-[var(--muted)]">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{place.location}</span>
          </p>
          {place.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-[var(--ink)]/70">
              {place.description}
            </p>
          )}
          <div className="pt-1">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em]",
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
