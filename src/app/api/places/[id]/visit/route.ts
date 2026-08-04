import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markVisited } from "@/lib/places";
import type { ReturnIntent } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const required = [
      "rating_ambiance",
      "rating_food",
      "rating_drinks",
      "rating_location",
      "rating_pricing",
      "food_worth_price",
      "return_intent",
    ];

    for (const key of required) {
      if (body[key] === undefined || body[key] === null) {
        return NextResponse.json(
          { error: `Missing field: ${key}` },
          { status: 400 },
        );
      }
    }

    const place = await markVisited(id, {
      rating_ambiance: Number(body.rating_ambiance),
      rating_food: Number(body.rating_food),
      rating_drinks: Number(body.rating_drinks),
      rating_location: Number(body.rating_location),
      rating_pricing: Number(body.rating_pricing),
      food_worth_price: Boolean(body.food_worth_price),
      return_intent: body.return_intent as ReturnIntent,
      visit_notes: body.visit_notes,
    });

    return NextResponse.json(place);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark visited";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
