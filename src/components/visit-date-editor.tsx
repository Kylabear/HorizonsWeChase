"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, Loader2, Pencil, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface VisitDateEditorProps {
  placeId: string;
  visitedAt: string;
}

function toDateInputValue(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function VisitDateEditor({
  placeId,
  visitedAt,
}: VisitDateEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(() => toDateInputValue(visitedAt));
  const [savedDate, setSavedDate] = useState(visitedAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveDate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/places/${placeId}/visit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visited_at: date }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update date.");

      setSavedDate(result.visited_at);
      setEditing(false);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not update date.",
      );
    } finally {
      setSaving(false);
    }
  }

  function cancelEditing() {
    setDate(toDateInputValue(savedDate));
    setError("");
    setEditing(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--teal)]">
          Visited {formatDate(savedDate)}
        </p>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDate(toDateInputValue(savedDate));
              setEditing(true);
            }}
            className="inline-flex min-h-8 items-center gap-1 rounded-full px-2 text-xs font-medium text-[var(--muted)] transition hover:bg-[var(--teal-soft)] hover:text-[var(--teal)]"
          >
            <Pencil className="h-3 w-3" />
            Edit date
          </button>
        )}
      </div>

      {editing && (
        <form onSubmit={saveDate} className="flex flex-wrap items-end gap-2">
          <label className="space-y-1">
            <span className="sr-only">Choose visit date</span>
            <span className="flex min-h-10 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3">
              <CalendarDays className="h-4 w-4 text-[var(--muted)]" />
              <input
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="min-h-10 bg-transparent text-sm text-[var(--ink)] outline-none"
              />
            </span>
          </label>
          <button
            type="submit"
            disabled={saving || !date}
            className="inline-flex min-h-10 items-center gap-1 rounded-full bg-[var(--teal)] px-3 text-sm font-medium text-white transition hover:bg-[var(--ink)] disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={cancelEditing}
            className="inline-flex min-h-10 items-center gap-1 rounded-full bg-[var(--sand)] px-3 text-sm text-[var(--ink)] transition hover:bg-[var(--line)] disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </form>
      )}

      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
