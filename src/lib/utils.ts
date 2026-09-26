import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function averageRating(place: {
  rating_ambiance: number | null;
  rating_food: number | null;
  rating_drinks: number | null;
  rating_location: number | null;
  rating_pricing: number | null;
}): number | null {
  const ratings = [
    place.rating_ambiance,
    place.rating_food,
    place.rating_drinks,
    place.rating_location,
    place.rating_pricing,
  ].filter(
    (r): r is number =>
      typeof r === "number" && Number.isFinite(r) && r >= 1 && r <= 5,
  );

  if (ratings.length === 0) return null;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

export function formatDate(iso: string | null) {
  if (!iso) return "";
  const isDateOnly =
    /^\d{4}-\d{2}-\d{2}(?:T00:00:00(?:\.0+)?(?:Z|\+00:00))?$/.test(iso);
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(isDateOnly ? { timeZone: "UTC" } : {}),
  });
}

export function formatTime(value: string | null | undefined) {
  if (!value) return "";
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
