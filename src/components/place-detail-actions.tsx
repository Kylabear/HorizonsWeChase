"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { Place } from "@/lib/types";
import { PlaceFormModal } from "@/components/place-form-modal";

interface PlaceDetailActionsProps {
  place: Place;
}

export function PlaceDetailActions({ place }: PlaceDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${place.name}" from your shared list?`)) return;
    const res = await fetch(`/api/places/${place.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Delete failed");
      return;
    }
    router.push("/bucket-list");
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--sand)] px-4 py-2 text-sm text-[var(--ink)] transition hover:bg-[var(--amber-soft)]"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit place
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm text-red-700 transition hover:bg-red-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>

      <PlaceFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editing={place}
      />
    </>
  );
}
