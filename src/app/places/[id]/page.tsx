import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Bus,
  ExternalLink,
  Landmark,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getPlace } from "@/lib/places";
import { VisitForm } from "@/components/visit-form";
import { StarRating } from "@/components/star-rating";
import {
  PLACE_TYPE_LABELS,
  RETURN_INTENT_LABELS,
} from "@/lib/types";
import { averageRating, formatDate } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export default async function PlaceDetailPage({ params }: Params) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const place = await getPlace(id);
  if (!place) notFound();

  const avg = averageRating(place);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/bucket-list"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to our list
      </Link>

      <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]">
        <div className="relative aspect-[21/9] min-h-[220px] bg-[var(--sand)]">
          {place.photos[0] ? (
            <Image
              src={place.photos[0]}
              alt={place.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              unoptimized={place.photos[0].startsWith("/uploads")}
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#1f6f78,#17353a_50%,#d76b5c)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/70 via-[var(--ink)]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <span className="rounded-full bg-[var(--cream)]/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--ink)]">
              {PLACE_TYPE_LABELS[place.type]}
            </span>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-white sm:text-5xl">
              {place.name}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-white/85">
              <MapPin className="h-4 w-4" />
              {place.location}
            </p>
          </div>
        </div>

        {place.photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-[var(--line)] p-4">
            {place.photos.slice(1).map((photo) => (
              <div
                key={photo}
                className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl"
              >
                <Image
                  src={photo}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="112px"
                  unoptimized={photo.startsWith("/uploads")}
                />
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {place.description && (
              <p className="text-lg leading-relaxed text-[var(--ink)]/80">
                {place.description}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoBlock
                icon={<Landmark className="h-4 w-4" />}
                label="Nearby landmarks"
                value={place.nearby_landmarks || "Not listed yet"}
              />
              <InfoBlock
                icon={<Bus className="h-4 w-4" />}
                label="Recommended transport"
                value={place.recommended_transport || "Not listed yet"}
              />
            </div>

            {place.google_maps_url && (
              <a
                href={place.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--teal)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--ink)]"
              >
                Open in Google Maps
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {place.is_visited ? (
              <div className="space-y-5 rounded-[1.4rem] border border-[var(--line)] bg-[var(--cream)] p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--teal)]">
                      Visited {formatDate(place.visited_at)}
                    </p>
                    <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
                      Our shared review
                    </h2>
                  </div>
                  {avg !== null && (
                    <p className="rounded-full bg-[var(--amber-soft)] px-3 py-1.5 text-sm font-medium text-[var(--amber-deep)]">
                      Avg {avg.toFixed(1)} / 5
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <StarRating
                    label="Ambiance"
                    value={place.rating_ambiance || 0}
                    readOnly
                    size="sm"
                  />
                  <StarRating
                    label="Food"
                    value={place.rating_food || 0}
                    readOnly
                    size="sm"
                  />
                  <StarRating
                    label="Drinks"
                    value={place.rating_drinks || 0}
                    readOnly
                    size="sm"
                  />
                  <StarRating
                    label="Location"
                    value={place.rating_location || 0}
                    readOnly
                    size="sm"
                  />
                  <StarRating
                    label="Pricing"
                    value={place.rating_pricing || 0}
                    readOnly
                    size="sm"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--sand)] px-3 py-1.5 text-sm text-[var(--ink)]">
                    Food worth the price:{" "}
                    {place.food_worth_price ? "Yes" : "No"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--teal-soft)] px-3 py-1.5 text-sm text-[var(--teal)]">
                    <RotateCcw className="h-3.5 w-3.5" />
                    {RETURN_INTENT_LABELS[place.return_intent]}
                  </span>
                </div>

                {place.visit_notes && (
                  <p className="rounded-2xl bg-[var(--surface)] p-4 text-sm leading-relaxed text-[var(--ink)]/80">
                    {place.visit_notes}
                  </p>
                )}
              </div>
            ) : (
              <VisitForm placeId={place.id} placeName={place.name} />
            )}
          </div>

          <aside className="h-fit space-y-4 rounded-[1.4rem] border border-[var(--line)] bg-[var(--cream)] p-5">
            <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
              Quick facts
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Status</dt>
                <dd className="font-medium text-[var(--ink)]">
                  {place.is_visited ? "Visited" : "On wishlist"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Type</dt>
                <dd className="font-medium text-[var(--ink)]">
                  {PLACE_TYPE_LABELS[place.type]}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Added by</dt>
                <dd className="font-medium text-[var(--ink)]">
                  {place.created_by || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">Photos</dt>
                <dd className="font-medium text-[var(--ink)]">
                  {place.photos.length}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream)] p-4">
      <p className="mb-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
        {icon}
        {label}
      </p>
      <p className="text-sm leading-relaxed text-[var(--ink)]">{value}</p>
    </div>
  );
}
