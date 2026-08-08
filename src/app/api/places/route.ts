import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPlace, listPlaces } from "@/lib/places";
import { normalizePlaceType } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const username = session.user.username || session.user.name;
    const places = await listPlaces(username);
    return NextResponse.json(places);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load places";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.name || !body.location || !body.type) {
      return NextResponse.json(
        { error: "Name, location, and type are required" },
        { status: 400 },
      );
    }

    const place = await createPlace(
      {
        name: body.name,
        type: normalizePlaceType(body.type),
        description: body.description,
        location: body.location,
        nearby_landmarks: body.nearby_landmarks,
        recommended_transport: body.recommended_transport,
        google_maps_url: body.google_maps_url,
        tiktok_link: body.tiktok_link,
        opens_at: body.opens_at,
        closes_at: body.closes_at,
        photos: body.photos || [],
      },
      session.user.username || session.user.name || "user",
    );

    return NextResponse.json(place, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create place";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
