import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { Place, PlaceInput, ReturnIntent, UserVisit, VisitInput } from "./types";
import { normalizePlaceType } from "./types";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

const DATA_PATH = path.join(process.cwd(), "data", "places.json");
const VISITS_PATH = path.join(process.cwd(), "data", "user-visits.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EMPTY_VISIT = {
  is_visited: false,
  visited_at: null as string | null,
  rating_ambiance: null as number | null,
  rating_food: null as number | null,
  rating_drinks: null as number | null,
  rating_location: null as number | null,
  rating_pricing: null as number | null,
  food_worth_price: null as boolean | null,
  return_intent: "undecided" as ReturnIntent,
  visit_notes: null as string | null,
};

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
    tiktok_link: null,
    photos: [],
    ...EMPTY_VISIT,
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
    tiktok_link: null,
    photos: [],
    ...EMPTY_VISIT,
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
  try {
    await fs.access(VISITS_PATH);
  } catch {
    await fs.writeFile(VISITS_PATH, JSON.stringify([], null, 2));
  }
}

async function readLocalPlaces(): Promise<Place[]> {
  await ensureLocalData();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return (JSON.parse(raw) as Record<string, unknown>[]).map((row) =>
    normalizePlace(row),
  );
}

async function writeLocalPlaces(places: Place[]) {
  await ensureLocalData();
  // Persist shared place fields only (visits live in user-visits.json)
  const rows = places.map(
    ({
      is_visited: _v,
      visited_at: _va,
      rating_ambiance: _ra,
      rating_food: _rf,
      rating_drinks: _rd,
      rating_location: _rl,
      rating_pricing: _rp,
      food_worth_price: _fw,
      return_intent: _ri,
      visit_notes: _vn,
      ...shared
    }) => shared,
  );
  await fs.writeFile(DATA_PATH, JSON.stringify(rows, null, 2));
}

async function readLocalVisits(): Promise<UserVisit[]> {
  await ensureLocalData();
  const raw = await fs.readFile(VISITS_PATH, "utf-8");
  return JSON.parse(raw) as UserVisit[];
}

async function writeLocalVisits(visits: UserVisit[]) {
  await ensureLocalData();
  await fs.writeFile(VISITS_PATH, JSON.stringify(visits, null, 2));
}

function normalizePlace(row: Record<string, unknown>): Place {
  return {
    id: String(row.id),
    name: String(row.name),
    type: normalizePlaceType(row.type),
    description: (row.description as string) ?? null,
    location: String(row.location),
    nearby_landmarks: (row.nearby_landmarks as string) ?? null,
    recommended_transport: (row.recommended_transport as string) ?? null,
    google_maps_url: (row.google_maps_url as string) ?? null,
    tiktok_link: (row.tiktok_link as string) ?? null,
    photos: Array.isArray(row.photos) ? (row.photos as string[]) : [],
    ...EMPTY_VISIT,
    created_by: (row.created_by as string) ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function normalizeVisit(row: Record<string, unknown>): UserVisit {
  return {
    id: String(row.id),
    place_id: String(row.place_id),
    username: String(row.username),
    visited_at: String(row.visited_at),
    rating_ambiance: Number(row.rating_ambiance),
    rating_food: Number(row.rating_food),
    rating_drinks: Number(row.rating_drinks),
    rating_location: Number(row.rating_location),
    rating_pricing: Number(row.rating_pricing),
    food_worth_price: Boolean(row.food_worth_price),
    return_intent: (row.return_intent as ReturnIntent) || "undecided",
    visit_notes: (row.visit_notes as string) ?? null,
  };
}

function applyVisit(place: Place, visit: UserVisit | undefined): Place {
  if (!visit) return { ...place, ...EMPTY_VISIT };
  return {
    ...place,
    is_visited: true,
    visited_at: visit.visited_at,
    rating_ambiance: visit.rating_ambiance,
    rating_food: visit.rating_food,
    rating_drinks: visit.rating_drinks,
    rating_location: visit.rating_location,
    rating_pricing: visit.rating_pricing,
    food_worth_price: visit.food_worth_price,
    return_intent: visit.return_intent,
    visit_notes: visit.visit_notes,
  };
}

async function getVisitsForUser(username: string): Promise<UserVisit[]> {
  const key = username.toLowerCase();
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("user_visits")
      .select("*")
      .ilike("username", key);
    if (error) throw error;
    return (data || []).map((row) => normalizeVisit(row));
  }
  const visits = await readLocalVisits();
  return visits.filter((v) => v.username.toLowerCase() === key);
}

async function getVisitForPlace(
  placeId: string,
  username: string,
): Promise<UserVisit | null> {
  const key = username.toLowerCase();
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("user_visits")
      .select("*")
      .eq("place_id", placeId)
      .ilike("username", key)
      .maybeSingle();
    if (error) throw error;
    return data ? normalizeVisit(data) : null;
  }
  const visits = await readLocalVisits();
  return (
    visits.find(
      (v) => v.place_id === placeId && v.username.toLowerCase() === key,
    ) ?? null
  );
}

export async function listPlaces(username?: string | null): Promise<Place[]> {
  let places: Place[];
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    places = (data || []).map((row) => normalizePlace(row));
  } else {
    places = await readLocalPlaces();
  }

  if (!username) return places;

  const visits = await getVisitsForUser(username);
  const byPlace = new Map(visits.map((v) => [v.place_id, v]));
  return places.map((p) => applyVisit(p, byPlace.get(p.id)));
}

export async function getPlace(
  id: string,
  username?: string | null,
): Promise<Place | null> {
  let place: Place | null;
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    place = data ? normalizePlace(data) : null;
  } else {
    const places = await readLocalPlaces();
    place = places.find((p) => p.id === id) ?? null;
  }

  if (!place || !username) return place;

  const visit = await getVisitForPlace(id, username);
  return applyVisit(place, visit ?? undefined);
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
    tiktok_link: input.tiktok_link || null,
    photos: input.photos || [],
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

  const place: Place = { id: uuidv4(), ...payload, ...EMPTY_VISIT };
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
  const visits = await readLocalVisits();
  await writeLocalVisits(visits.filter((v) => v.place_id !== id));
}

export async function markVisited(
  id: string,
  visit: VisitInput,
  username: string,
): Promise<Place> {
  const place = await getPlace(id);
  if (!place) throw new Error("Place not found");

  const now = new Date().toISOString();
  const key = username.toLowerCase();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const existing = await getVisitForPlace(id, username);
    const payload = {
      place_id: id,
      username: key,
      visited_at: now,
      rating_ambiance: visit.rating_ambiance,
      rating_food: visit.rating_food,
      rating_drinks: visit.rating_drinks,
      rating_location: visit.rating_location,
      rating_pricing: visit.rating_pricing,
      food_worth_price: visit.food_worth_price,
      return_intent: visit.return_intent,
      visit_notes: visit.visit_notes || null,
      updated_at: now,
    };

    if (existing) {
      const { error } = await supabase
        .from("user_visits")
        .update(payload)
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("user_visits").insert({
        ...payload,
        created_at: now,
      });
      if (error) throw error;
    }

    return applyVisit(place, {
      id: existing?.id ?? uuidv4(),
      place_id: id,
      username: key,
      visited_at: now,
      rating_ambiance: visit.rating_ambiance,
      rating_food: visit.rating_food,
      rating_drinks: visit.rating_drinks,
      rating_location: visit.rating_location,
      rating_pricing: visit.rating_pricing,
      food_worth_price: visit.food_worth_price,
      return_intent: visit.return_intent,
      visit_notes: visit.visit_notes || null,
    });
  }

  const visits = await readLocalVisits();
  const index = visits.findIndex(
    (v) => v.place_id === id && v.username.toLowerCase() === key,
  );
  const record: UserVisit = {
    id: index >= 0 ? visits[index].id : uuidv4(),
    place_id: id,
    username: key,
    visited_at: now,
    rating_ambiance: visit.rating_ambiance,
    rating_food: visit.rating_food,
    rating_drinks: visit.rating_drinks,
    rating_location: visit.rating_location,
    rating_pricing: visit.rating_pricing,
    food_worth_price: visit.food_worth_price,
    return_intent: visit.return_intent,
    visit_notes: visit.visit_notes || null,
  };

  if (index >= 0) visits[index] = record;
  else visits.push(record);
  await writeLocalVisits(visits);

  return applyVisit(place, record);
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
