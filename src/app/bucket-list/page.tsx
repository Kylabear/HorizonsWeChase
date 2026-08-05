import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { listPlaces } from "@/lib/places";
import { BucketListView } from "@/components/bucket-list-view";
import { redirect } from "next/navigation";

export default async function BucketListPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const username = session.user.username || session.user.name;
  const places = await listPlaces(username);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-10">
      <Suspense fallback={<div className="h-40 animate-pulse rounded-3xl bg-[var(--sand)]" />}>
        <BucketListView
          places={places}
          userName={session.user.name}
          role={session.user.role}
        />
      </Suspense>
    </div>
  );
}
