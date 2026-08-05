export type PlaceType = "restaurant" | "coffee_shop" | "horizon" | "other";
export type ReturnIntent = "plan_to_return" | "never_return" | "undecided";
export type UserRole = "user" | "admin";

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  description: string | null;
  location: string;
  nearby_landmarks: string | null;
  recommended_transport: string | null;
  google_maps_url: string | null;
  tiktok_link: string | null;
  photos: string[];
  /** Current user's visit status (personal, not shared). */
  is_visited: boolean;
  visited_at: string | null;
  rating_ambiance: number | null;
  rating_food: number | null;
  rating_drinks: number | null;
  rating_location: number | null;
  rating_pricing: number | null;
  food_worth_price: boolean | null;
  return_intent: ReturnIntent;
  visit_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaceInput {
  name: string;
  type: PlaceType;
  description?: string;
  location: string;
  nearby_landmarks?: string;
  recommended_transport?: string;
  google_maps_url?: string;
  tiktok_link?: string;
  photos?: string[];
}

export interface VisitInput {
  rating_ambiance: number;
  rating_food: number;
  rating_drinks: number;
  rating_location: number;
  rating_pricing: number;
  food_worth_price: boolean;
  return_intent: ReturnIntent;
  visit_notes?: string;
}

export interface UserVisit {
  id: string;
  place_id: string;
  username: string;
  visited_at: string;
  rating_ambiance: number;
  rating_food: number;
  rating_drinks: number;
  rating_location: number;
  rating_pricing: number;
  food_worth_price: boolean;
  return_intent: ReturnIntent;
  visit_notes: string | null;
}

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  restaurant: "Restaurant",
  coffee_shop: "Coffee Shop",
  horizon: "Horizon",
  other: "Other",
};

export const RETURN_INTENT_LABELS: Record<ReturnIntent, string> = {
  plan_to_return: "I'd go again",
  never_return: "Never again",
  undecided: "Undecided",
};

/** Normalize legacy DB/local values (e.g. landmark → horizon). */
export function normalizePlaceType(value: unknown): PlaceType {
  if (value === "landmark" || value === "horizon") return "horizon";
  if (value === "restaurant" || value === "coffee_shop" || value === "other") {
    return value;
  }
  return "other";
}
