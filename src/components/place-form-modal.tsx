"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { Place, PlaceType } from "@/lib/types";
import { PLACE_TYPE_LABELS, normalizePlaceType } from "@/lib/types";
import { PhotoPreviewCarousel } from "@/components/photo-preview-carousel";

const EMPTY_FORM = {
  name: "",
  type: "restaurant" as PlaceType,
  description: "",
  location: "",
  nearby_landmarks: "",
  recommended_transport: "",
  google_maps_url: "",
  tiktok_link: "",
  opens_at: "",
  closes_at: "",
  photos: [] as string[],
};

interface PlaceFormModalProps {
  open: boolean;
  onClose: () => void;
  editing?: Place | null;
  onSaved?: (place: Place) => void;
}

export function PlaceFormModal({
  open,
  onClose,
  editing = null,
  onSaved,
}: PlaceFormModalProps) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(
    () => (editing ? "Edit place" : "Add a place"),
    [editing],
  );

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name,
        type: normalizePlaceType(editing.type),
        description: editing.description || "",
        location: editing.location,
        nearby_landmarks: editing.nearby_landmarks || "",
        recommended_transport: editing.recommended_transport || "",
        google_maps_url: editing.google_maps_url || "",
        tiktok_link: editing.tiktok_link || "",
        opens_at: editing.opens_at || "",
        closes_at: editing.closes_at || "",
        photos: editing.photos || [],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError("");
  }, [open, editing]);

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
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim(),
        location: form.location.trim(),
        nearby_landmarks: form.nearby_landmarks.trim(),
        recommended_transport: form.recommended_transport.trim(),
        google_maps_url: form.google_maps_url.trim(),
        tiktok_link: form.tiktok_link.trim(),
        opens_at: form.opens_at.trim(),
        closes_at: form.closes_at.trim(),
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

      onSaved?.(data);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[var(--ink)]/45 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !loading && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[min(92dvh,920px)] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-[1.5rem] border border-[var(--line)] bg-[var(--cream)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[1.6rem] sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,6vw,2rem)] text-[var(--ink)]">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {editing
                    ? "Update any field — changes sync to your shared list."
                    : "Add a new spot for both of you to chase."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !loading && onClose()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--sand)]"
                aria-label="Close"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Opens at">
                  <input
                    type="time"
                    value={form.opens_at}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, opens_at: e.target.value }))
                    }
                    className="field"
                  />
                </Field>
                <Field label="Closes at">
                  <input
                    type="time"
                    value={form.closes_at}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, closes_at: e.target.value }))
                    }
                    className="field"
                  />
                </Field>
              </div>

              <Field label="Google Maps link">
                <input
                  type="text"
                  inputMode="url"
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

              <Field label="TikTok link">
                <input
                  type="text"
                  inputMode="url"
                  value={form.tiktok_link}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      tiktok_link: e.target.value,
                    }))
                  }
                  className="field"
                  placeholder="https://www.tiktok.com/... or any video/doc link"
                />
              </Field>

              <Field label="Photos">
                <div className="space-y-3">
                  <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-dashed border-[var(--line)] bg-[var(--sand)] px-4 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--teal)]">
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
                    <PhotoPreviewCarousel
                      photos={form.photos}
                      onRemove={(url) =>
                        setForm((f) => ({
                          ...f,
                          photos: f.photos.filter((p) => p !== url),
                        }))
                      }
                    />
                  )}
                </div>
              </Field>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-11 rounded-full px-4 py-2 text-sm text-[var(--muted)] hover:bg-[var(--sand)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--cream)] hover:bg-[var(--teal)] disabled:opacity-60"
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
