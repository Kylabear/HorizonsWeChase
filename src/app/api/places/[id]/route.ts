import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deletePlace, getPlace, updatePlace } from "@/lib/places";
import { normalizePlaceType } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const username = session.user.username || session.user.name;
    const place = await getPlace(id, username);
    if (!place) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(place);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load place";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const place = await updatePlace(id, {
      name: body.name,
      type: body.type ? normalizePlaceType(body.type) : undefined,
      description: body.description,
      location: body.location,
      nearby_landmarks: body.nearby_landmarks,
      recommended_transport: body.recommended_transport,
      google_maps_url: body.google_maps_url,
      tiktok_link: body.tiktok_link,
      photos: body.photos,
    });
    return NextResponse.json(place);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update place";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await deletePlace(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete place";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
