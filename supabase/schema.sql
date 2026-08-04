-- Horizons We Chase — Supabase schema
-- Run this in the Supabase SQL editor, then create a public storage bucket named "place-photos".

create extension if not exists "pgcrypto";

do $$ begin
  create type place_type as enum ('restaurant', 'coffee_shop', 'horizon', 'other');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type return_intent as enum ('plan_to_return', 'never_return', 'undecided');
exception when duplicate_object then null;
end $$;

-- If you already ran an older schema with "landmark", migrate it:
do $$ begin
  alter type place_type rename value 'landmark' to 'horizon';
exception
  when undefined_object then null;
  when invalid_parameter_value then null;
end $$;

create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type place_type not null default 'other',
  description text,
  location text not null,
  nearby_landmarks text,
  recommended_transport text,
  google_maps_url text,
  photos text[] default '{}',
  is_visited boolean default false,
  visited_at timestamptz,
  rating_ambiance int check (rating_ambiance is null or rating_ambiance between 1 and 5),
  rating_food int check (rating_food is null or rating_food between 1 and 5),
  rating_drinks int check (rating_drinks is null or rating_drinks between 1 and 5),
  rating_location int check (rating_location is null or rating_location between 1 and 5),
  rating_pricing int check (rating_pricing is null or rating_pricing between 1 and 5),
  food_worth_price boolean,
  return_intent return_intent default 'undecided',
  visit_notes text,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists places_is_visited_idx on places (is_visited);
create index if not exists places_created_at_idx on places (created_at desc);

-- Storage: create bucket "place-photos" (public) in the Supabase dashboard.
