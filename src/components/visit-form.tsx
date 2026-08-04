"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { StarRating } from "./star-rating";
import type { ReturnIntent } from "@/lib/types";

interface VisitFormProps {
  placeId: string;
  placeName: string;
}

export function VisitForm({ placeId, placeName }: VisitFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    rating_ambiance: 0,
    rating_food: 0,
    rating_drinks: 0,
    rating_location: 0,
    rating_pricing: 0,
    food_worth_price: true,
    return_intent: "plan_to_return" as ReturnIntent,
    visit_notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const ratings = [
      form.rating_ambiance,
      form.rating_food,
      form.rating_drinks,
      form.rating_location,
      form.rating_pricing,
    ];
    if (ratings.some((r) => r < 1)) {
      setError("Please rate all five categories.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/places/${placeId}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      router.push("/bucket-list?tab=visited");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7"
    >
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          We made it
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Mark <span className="text-[var(--ink)]">{placeName}</span> as visited
          and leave your shared review.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <StarRating
          label="Ambiance"
          value={form.rating_ambiance}
          onChange={(v) => setForm((f) => ({ ...f, rating_ambiance: v }))}
        />
        <StarRating
          label="Food"
          value={form.rating_food}
          onChange={(v) => setForm((f) => ({ ...f, rating_food: v }))}
        />
        <StarRating
          label="Drinks"
          value={form.rating_drinks}
          onChange={(v) => setForm((f) => ({ ...f, rating_drinks: v }))}
        />
        <StarRating
          label="Location"
          value={form.rating_location}
          onChange={(v) => setForm((f) => ({ ...f, rating_location: v }))}
        />
        <StarRating
          label="Pricing"
          value={form.rating_pricing}
          onChange={(v) => setForm((f) => ({ ...f, rating_pricing: v }))}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Is the food worth the price?
        </legend>
        <div className="flex flex-wrap gap-2">
          {[
            { value: true, label: "Yes — worth it" },
            { value: false, label: "No — overpriced" },
          ].map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, food_worth_price: option.value }))
              }
              className={`rounded-full px-4 py-2 text-sm transition ${
                form.food_worth_price === option.value
                  ? "bg-[var(--ink)] text-[var(--cream)]"
                  : "bg-[var(--sand)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Would we return?
        </legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "plan_to_return", label: "Plan to return" },
              { value: "never_return", label: "Never return" },
              { value: "undecided", label: "Undecided" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, return_intent: option.value }))
              }
              className={`rounded-full px-4 py-2 text-sm transition ${
                form.return_intent === option.value
                  ? "bg-[var(--teal)] text-white"
                  : "bg-[var(--sand)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="visit_notes"
          className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]"
        >
          Shared notes
        </label>
        <textarea
          id="visit_notes"
          rows={3}
          value={form.visit_notes}
          onChange={(e) =>
            setForm((f) => ({ ...f, visit_notes: e.target.value }))
          }
          placeholder="Favorite dish, little moments, tips for next time…"
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--teal)]"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-[var(--cream)] transition hover:bg-[var(--teal)] disabled:opacity-60 sm:w-auto"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        Mark as visited
      </button>
    </motion.form>
  );
}
