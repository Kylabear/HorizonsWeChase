"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { Place, PlaceType } from "@/lib/types";
import { PLACE_TYPE_LABELS } from "@/lib/types";

const EMPTY_FORM = {
  name: "",
  type: "restaurant" as PlaceType,
  description: "",
  location: "",
  nearby_landmarks: "",
  recommended_transport: "",
  google_maps_url: "",
  photos: [] as string[],
};

interface AdminPlaceManagerProps {
  initialPlaces: Place[];
}

export function AdminPlaceManager({ initialPlaces }: AdminPlaceManagerProps) {
  const router = useRouter();
  const [places, setPlaces] = useState(initialPlaces);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(
    () => (editing ? "Edit place" : "Add a place"),
    [editing],
  );

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setOpen(true);
  }

  function openEdit(place: Place) {
    setEditing(place);
    setForm({
      name: place.name,
      type: place.type,
      description: place.description || "",
      location: place.location,
      nearby_landmarks: place.nearby_landmarks || "",
      recommended_transport: place.recommended_transport || "",
      google_maps_url: place.google_maps_url || "",
      photos: place.photos || [],
    });
    setError("");
    setOpen(true);
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        urls.push(data.url);
      }
      setForm((f) => ({ ...f, photos: [...f.photos, ...urls] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        type: form.type,
        description: form.description,
        location: form.location,
        nearby_landmarks: form.nearby_landmarks,
        recommended_transport: form.recommended_transport,
        google_maps_url: form.google_maps_url,
        photos: form.photos,
      };

      const res = await fetch(
        editing ? `/api/places/${editing.id}` : "/api/places",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setPlaces((prev) => {
        if (editing) {
          return prev.map((p) => (p.id === editing.id ? data : p));
        }
        return [data, ...prev];
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this place from your shared list?")) return;
    const res = await fetch(`/api/places/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Delete failed");
      return;
    }
    setPlaces((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--teal)]">
            Admin
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
            Curate our horizons
          </h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            Upload places you want to chase together — cafés, dinners, landmarks,
            and everything in between.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--cream)] transition hover:bg-[var(--teal)]"
        >
          <Plus className="h-4 w-4" />
          Add place
        </button>
      </div>

      <div className="overflow-hidden rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface)]">
        <div className="divide-y divide-[var(--line)]">
          {places.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-[var(--muted)]">
              No places yet. Add your first shared destination.
            </p>
          )}
          {places.map((place) => (
            <div
              key={place.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-[var(--ink)]">{place.name}</p>
                <p className="text-sm text-[var(--muted)]">
                  {PLACE_TYPE_LABELS[place.type]} · {place.location} ·{" "}
                  {place.is_visited ? "Visited" : "Wishlist"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(place)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sand)] px-3 py-1.5 text-sm text-[var(--ink)] transition hover:bg-[var(--amber-soft)]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(place.id)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-[var(--ink)]/45 p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.6rem] border border-[var(--line)] bg-[var(--cream)] p-5 shadow-2xl sm:p-7"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
                    {title}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Details sync to your shared bucket list.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-[var(--muted)] hover:bg-[var(--sand)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Name">
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="field"
                    placeholder="e.g. Lantern Alley Café"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Type">
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          type: e.target.value as PlaceType,
                        }))
                      }
                      className="field"
                    >
                      {Object.entries(PLACE_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Location">
                    <input
                      required
                      value={form.location}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, location: e.target.value }))
                      }
                      className="field"
                      placeholder="City, neighborhood, address"
                    />
                  </Field>
                </div>

                <Field label="Description">
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="field"
                    placeholder="Why this place belongs on our list"
                  />
                </Field>

                <Field label="Nearby landmarks">
                  <input
                    value={form.nearby_landmarks}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nearby_landmarks: e.target.value,
                      }))
                    }
                    className="field"
                    placeholder="Parks, malls, scenic spots nearby"
                  />
                </Field>

                <Field label="Recommended transport">
                  <input
                    value={form.recommended_transport}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        recommended_transport: e.target.value,
                      }))
                    }
                    className="field"
                    placeholder="Car, Grab, train, walk…"
                  />
                </Field>

                <Field label="Google Maps link">
                  <input
                    type="url"
                    value={form.google_maps_url}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        google_maps_url: e.target.value,
                      }))
                    }
                    className="field"
                    placeholder="https://maps.google.com/..."
                  />
                </Field>

                <Field label="Photos">
                  <div className="space-y-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-[var(--line)] bg-[var(--sand)] px-4 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--teal)]">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                      {uploading ? "Uploading…" : "Upload photos"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => uploadFiles(e.target.files)}
                      />
                    </label>
                    {form.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.photos.map((url) => (
                          <div
                            key={url}
                            className="group relative h-16 w-16 overflow-hidden rounded-xl"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  photos: f.photos.filter((p) => p !== url),
                                }))
                              }
                              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>

                {error && (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full px-4 py-2 text-sm text-[var(--muted)] hover:bg-[var(--sand)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--cream)] hover:bg-[var(--teal)] disabled:opacity-60"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editing ? "Save changes" : "Add to list"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
