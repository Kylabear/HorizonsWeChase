"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { PlaceCard } from "./place-card";
import type { Place } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BucketListViewProps {
  places: Place[];
  userName?: string | null;
}

export function BucketListView({ places, userName }: BucketListViewProps) {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "visited" ? "visited" : "wishlist";
  const [tab, setTab] = useState<"wishlist" | "visited">(initialTab);

  const wishlist = useMemo(
    () => places.filter((p) => !p.is_visited),
    [places],
  );
  const visited = useMemo(() => places.filter((p) => p.is_visited), [places]);
  const shown = tab === "wishlist" ? wishlist : visited;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-5 py-8 sm:rounded-[2rem] sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,#f0c27a55,transparent_70%)] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,#1f6f7844,transparent_70%)] blur-2xl" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--teal)]">
            <Heart className="h-3.5 w-3.5 fill-[var(--coral)] text-[var(--coral)]" />
            Shared with love
          </p>
          <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2rem,9vw,3.75rem)] leading-[1.05] text-[var(--ink)]">
            Places we&apos;ll chase
            {userName ? `, ${userName}` : ""}
          </h1>
          <p className="mt-4 max-w-xl text-sm text-[var(--muted)] sm:text-base">
            A living map of dinners, coffee stops, and horizons — mark places
            done on your own account, with ratings that stay private to you.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm sm:gap-3">
            <span className="rounded-full bg-[var(--amber-soft)] px-3 py-1.5 text-[var(--amber-deep)]">
              {wishlist.length} waiting
            </span>
            <span className="rounded-full bg-[var(--teal-soft)] px-3 py-1.5 text-[var(--teal)]">
              {visited.length} visited
            </span>
          </div>
        </motion.div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex w-full overflow-x-auto rounded-full border border-[var(--line)] bg-[var(--surface)] p-1 sm:inline-flex sm:w-auto">
          {(
            [
              { id: "wishlist", label: "Wishlist", short: "Wishlist", count: wishlist.length },
              { id: "visited", label: "Done / Visited", short: "Visited", count: visited.length },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "min-h-11 flex-1 whitespace-nowrap rounded-full px-3 py-2 text-sm transition sm:flex-none sm:px-4",
                tab === item.id
                  ? "bg-[var(--ink)] text-[var(--cream)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]",
              )}
            >
              <span className="sm:hidden">{item.short}</span>
              <span className="hidden sm:inline">{item.label}</span>
              <span className="ml-2 opacity-70">{item.count}</span>
            </button>
          ))}
        </div>
        <p className="hidden items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-[var(--muted)] sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5 text-[var(--amber)]" />
          Tap a place for details
        </p>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-[1.25rem] border border-dashed border-[var(--line)] bg-[var(--surface)] px-5 py-12 text-center sm:rounded-[1.5rem] sm:px-6 sm:py-16">
          <p className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,6vw,1.875rem)] text-[var(--ink)]">
            {tab === "wishlist" ? "The list is clear" : "No visits logged yet"}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {tab === "wishlist"
              ? "Ask Admin to add restaurants, cafés, or horizons."
              : "When you mark a place visited, it lands here on your account only."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {shown.map((place, index) => (
            <PlaceCard key={place.id} place={place} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
