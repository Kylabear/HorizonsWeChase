"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Plus, Sparkles } from "lucide-react";
import { PlaceCard } from "./place-card";
import { PlaceFormModal } from "./place-form-modal";
import type { Place, PlaceType } from "@/lib/types";
import { PLACE_TYPE_LABELS, normalizePlaceType } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | PlaceType;

const CATEGORY_FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "horizon", label: PLACE_TYPE_LABELS.horizon },
  { id: "restaurant", label: PLACE_TYPE_LABELS.restaurant },
  { id: "coffee_shop", label: PLACE_TYPE_LABELS.coffee_shop },
  { id: "other", label: PLACE_TYPE_LABELS.other },
];

interface BucketListViewProps {
  places: Place[];
  userName?: string | null;
}

export function BucketListView({ places, userName }: BucketListViewProps) {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "visited" ? "visited" : "wishlist";
  const [tab, setTab] = useState<"wishlist" | "visited">(initialTab);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [addOpen, setAddOpen] = useState(false);

  const wishlist = useMemo(
    () => places.filter((p) => !p.is_visited),
    [places],
  );
  const visited = useMemo(() => places.filter((p) => p.is_visited), [places]);
  const tabbed = tab === "wishlist" ? wishlist : visited;

  const shown = useMemo(() => {
    if (category === "all") return tabbed;
    return tabbed.filter((p) => normalizePlaceType(p.type) === category);
  }, [tabbed, category]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      all: tabbed.length,
      horizon: 0,
      restaurant: 0,
      coffee_shop: 0,
      other: 0,
    };
    for (const place of tabbed) {
      counts[normalizePlaceType(place.type)] += 1;
    }
    return counts;
  }, [tabbed]);

  const title = `Places we'll chase My Beybb${userName ? ` ${userName}` : ""}`;

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
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2rem,9vw,3.75rem)] leading-[1.05] text-[var(--ink)]">
              {title}
            </h1>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--cream)] transition hover:bg-[var(--teal)]"
            >
              <Plus className="h-4 w-4" />
              Add place
            </button>
          </div>
          <p className="mt-4 max-w-xl text-sm text-[var(--muted)] sm:text-base">
            A living map of dinners, coffee stops, and horizons — add, edit, and
            mark places done on your own account.
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

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {CATEGORY_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-3.5 sm:py-2 sm:text-sm",
              category === item.id
                ? "bg-[var(--teal)] text-white"
                : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]",
            )}
          >
            {item.label}
            <span className="ml-1.5 opacity-70">{categoryCounts[item.id]}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-[1.25rem] border border-dashed border-[var(--line)] bg-[var(--surface)] px-5 py-12 text-center sm:rounded-[1.5rem] sm:px-6 sm:py-16">
          <p className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,6vw,1.875rem)] text-[var(--ink)]">
            {tab === "wishlist" ? "The list is clear" : "No visits logged yet"}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {category !== "all"
              ? `No ${PLACE_TYPE_LABELS[category as PlaceType].toLowerCase()} places here yet.`
              : tab === "wishlist"
                ? "Tap Add place above to start your shared bucket list."
                : "When you mark a place visited, it lands here on your account only."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((place, index) => (
            <PlaceCard key={place.id} place={place} index={index} />
          ))}
        </div>
      )}

      <PlaceFormModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
