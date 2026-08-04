import { auth } from "@/lib/auth";
import { listPlaces } from "@/lib/places";
import { AdminPlaceManager } from "@/components/admin-place-manager";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/bucket-list");

  const places = await listPlaces();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-10">
      <AdminPlaceManager initialPlaces={places} />
    </div>
  );
}
