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

  const username = session.user.username || session.user.name;
  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const visitedAt =
      typeof body.visited_at === "string" ? body.visited_at : "";
    const dateTimestamp = Date.parse(`${visitedAt}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(visitedAt) ||
      Number.isNaN(dateTimestamp) ||
      new Date(dateTimestamp).toISOString().slice(0, 10) !== visitedAt
    ) {
      return NextResponse.json(
        { error: "Please provide a valid visit date." },
        { status: 400 },
      );
    }


    // Support both standard place visits (5 category ratings) and mountain visits
    const isMountainVisit = body.mountain_rating !== undefined || body.was_mountain_good !== undefined;

    if (isMountainVisit) {
      if (body.mountain_rating === undefined || body.mountain_rating === null) {
        return NextResponse.json({ error: "Missing field: mountain_rating" }, { status: 400 });
      }
      if (body.was_mountain_good === undefined || body.was_mountain_good === null) {
        return NextResponse.json({ error: "Missing field: was_mountain_good" }, { status: 400 });
      }
    } else {
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
    }

    const place = await markVisited(
      id,
      {
        visited_at: visitedAt,
        rating_ambiance: Number(body.rating_ambiance) || 0,
        rating_food: Number(body.rating_food) || 0,
        rating_drinks: Number(body.rating_drinks) || 0,
        rating_location: Number(body.rating_location) || 0,
        rating_pricing: Number(body.rating_pricing) || 0,
        food_worth_price: Boolean(body.food_worth_price ?? false),
        return_intent: (body.return_intent as ReturnIntent) || "undecided",
        visit_notes: body.visit_notes,
        mountain_rating: body.mountain_rating !== undefined ? Number(body.mountain_rating) : undefined,
        was_mountain_good: body.was_mountain_good !== undefined ? Boolean(body.was_mountain_good) : undefined,
      },
      username,
    );

    return NextResponse.json(place);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mark visited";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
