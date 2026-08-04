import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { Place, PlaceInput, VisitInput } from "./types";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

const DATA_PATH = path.join(process.cwd(), "data", "places.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const SEED_PLACES: Place[] = [
  {
    id: "seed-1",
    name: "Sunrise Overlook Café",
    type: "coffee_shop",
    description:
      "A quiet hillside café made for slow mornings and shared notebooks.",
    location: "Tagaytay Ridge, Cavite",
    nearby_landmarks: "People's Park in the Sky, Picnic Grove",
    recommended_transport: "Car or Grab — cooler mornings, bring a light jacket",
    google_maps_url: "https://maps.google.com/?q=Tagaytay",
    photos: [],
    is_visited: false,
    visited_at: null,
    rating_ambiance: null,
    rating_food: null,
    rating_drinks: null,
    rating_location: null,
    rating_pricing: null,
    food_worth_price: null,
    return_intent: "undecided",
    visit_notes: null,
    created_by: "Admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "seed-2",
    name: "Harbor Lantern Bistro",
    type: "restaurant",
    description: "Seafood by the water with soft golden-hour lighting.",
    location: "Manila Baywalk",
    nearby_landmarks: "SM Mall of Asia, Manila Ocean Park",
    recommended_transport: "LRT + short walk, or Grab for evenings",
    google_maps_url: "https://maps.google.com/?q=Manila+Baywalk",
    photos: [],
    is_visited: false,
    visited_at: null,
    rating_ambiance: null,
    rating_food: null,
    rating_drinks: null,
    rating_location: null,
    rating_pricing: null,
    food_worth_price: null,
    return_intent: "undecided",
    visit_notes: null,
    created_by: "Admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

async function ensureLocalData() {
  const dir = path.dirname(DATA_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify(SEED_PLACES, null, 2));
  }
}

async function readLocalPlaces(): Promise<Place[]> {
  await ensureLocalData();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as Place[];
}

async function writeLocalPlaces(places: Place[]) {
  await ensureLocalData();
  await fs.writeFile(DATA_PATH, JSON.stringify(places, null, 2));
}

function normalizePlace(row: Record<string, unknown>): Place {
  return {
    id: String(row.id),
    name: String(row.name),
    type: row.type as Place["type"],
    description: (row.description as string) ?? null,
    location: String(row.location),
    nearby_landmarks: (row.nearby_landmarks as string) ?? null,
    recommended_transport: (row.recommended_transport as string) ?? null,
    google_maps_url: (row.google_maps_url as string) ?? null,
    photos: Array.isArray(row.photos) ? (row.photos as string[]) : [],
    is_visited: Boolean(row.is_visited),
    visited_at: (row.visited_at as string) ?? null,
    rating_ambiance: (row.rating_ambiance as number) ?? null,
    rating_food: (row.rating_food as number) ?? null,
    rating_drinks: (row.rating_drinks as number) ?? null,
    rating_location: (row.rating_location as number) ?? null,
    rating_pricing: (row.rating_pricing as number) ?? null,
    food_worth_price:
      typeof row.food_worth_price === "boolean" ? row.food_worth_price : null,
    return_intent: (row.return_intent as Place["return_intent"]) || "undecided",
    visit_notes: (row.visit_notes as string) ?? null,
    created_by: (row.created_by as string) ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function listPlaces(): Promise<Place[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => normalizePlace(row));
  }
  return readLocalPlaces();
}

export async function getPlace(id: string): Promise<Place | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? normalizePlace(data) : null;
  }
  const places = await readLocalPlaces();
  return places.find((p) => p.id === id) ?? null;
}

export async function createPlace(
  input: PlaceInput,
  createdBy: string,
): Promise<Place> {
  const now = new Date().toISOString();
  const payload = {
    name: input.name,
    type: input.type,
    description: input.description || null,
    location: input.location,
    nearby_landmarks: input.nearby_landmarks || null,
    recommended_transport: input.recommended_transport || null,
    google_maps_url: input.google_maps_url || null,
    photos: input.photos || [],
    is_visited: false,
    visited_at: null,
    rating_ambiance: null,
    rating_food: null,
    rating_drinks: null,
    rating_location: null,
    rating_pricing: null,
    food_worth_price: null,
    return_intent: "undecided" as const,
    visit_notes: null,
    created_by: createdBy,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("places")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return normalizePlace(data);
  }

  const place: Place = { id: uuidv4(), ...payload };
  const places = await readLocalPlaces();
  places.unshift(place);
  await writeLocalPlaces(places);
  return place;
}

export async function updatePlace(
  id: string,
  input: Partial<PlaceInput> & { photos?: string[] },
): Promise<Place> {
  const updates = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("places")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return normalizePlace(data);
  }

  const places = await readLocalPlaces();
  const index = places.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Place not found");
  places[index] = { ...places[index], ...updates };
  await writeLocalPlaces(places);
  return places[index];
}

export async function deletePlace(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("places").delete().eq("id", id);
    if (error) throw error;
    return;
  }

  const places = await readLocalPlaces();
  await writeLocalPlaces(places.filter((p) => p.id !== id));
}

export async function markVisited(
  id: string,
  visit: VisitInput,
): Promise<Place> {
  const updates = {
    is_visited: true,
    visited_at: new Date().toISOString(),
    rating_ambiance: visit.rating_ambiance,
    rating_food: visit.rating_food,
    rating_drinks: visit.rating_drinks,
    rating_location: visit.rating_location,
    rating_pricing: visit.rating_pricing,
    food_worth_price: visit.food_worth_price,
    return_intent: visit.return_intent,
    visit_notes: visit.visit_notes || null,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("places")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return normalizePlace(data);
  }

  const places = await readLocalPlaces();
  const index = places.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Place not found");
  places[index] = { ...places[index], ...updates };
  await writeLocalPlaces(places);
  return places[index];
}

export async function uploadPhoto(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${uuidv4()}.${ext}`;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage
      .from("place-photos")
      .upload(filename, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    if (error) throw error;

    const { data } = supabase.storage
      .from("place-photos")
      .getPublicUrl(filename);
    return data.publicUrl;
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `/uploads/${filename}`;
}
