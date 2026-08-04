# Horizons We Chase

A private shared bucket list for two — restaurants, coffee shops, and landmarks you want to visit together. Mark places as visited, rate them, upload photos, and keep a living map of your adventures.

## Tech stack

- **Next.js** (App Router) — Vercel-ready
- **Tailwind CSS** — modern UI
- **Framer Motion** — page and interaction animations
- **Supabase** — Postgres + photo storage (production)
- **NextAuth** — credentials login for two users + admin

## Features

- Wishlist and automatic **Done / Visited** sections
- Place types: restaurant, coffee shop, landmark, other
- Ratings: ambiance, food, drinks, location, pricing
- “Is the food worth the price?” + return / never return
- Photos, nearby landmarks, transport tips, Google Maps link
- Admin panel to add, edit, delete, and upload places

## Accounts

| Username | Password         | Role  |
|----------|------------------|-------|
| kyla     | MyprettyBeybb    | user  |
| cedes    | 123@testingpass  | user  |
| Admin    | RomantiziceLife  | admin |

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase env vars, the app stores places in `data/places.json` and photos in `public/uploads/` (fine for local demos only).

## Supabase (required for Vercel)

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Create a **public** Storage bucket named `place-photos`.
4. Add these env vars locally and in Vercel:

```env
AUTH_SECRET=generate-a-long-random-string
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Generate `AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Set the env vars above.
4. Deploy.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
