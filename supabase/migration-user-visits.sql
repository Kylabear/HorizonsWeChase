-- Run this in the Supabase SQL editor against your current schema.
-- Safe to re-run: uses IF NOT EXISTS / exception handlers.

-- 1) Rename enum value landmark → horizon (matches the app)
do $$ begin
  alter type place_type rename value 'landmark' to 'horizon';
exception
  when undefined_object then null;
  when invalid_parameter_value then null; -- already renamed
end $$;

-- 2) TikTok / video / doc link on places
alter table places add column if not exists tiktok_link text;

-- 3) Per-user visits + ratings (each account has its own done status)
create table if not exists user_visits (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  username text not null,
  visited_at timestamptz not null default now(),
  rating_ambiance int not null check (rating_ambiance between 1 and 5),
  rating_food int not null check (rating_food between 1 and 5),
  rating_drinks int not null check (rating_drinks between 1 and 5),
  rating_location int not null check (rating_location between 1 and 5),
  rating_pricing int not null check (rating_pricing between 1 and 5),
  food_worth_price boolean not null,
  return_intent return_intent not null default 'undecided',
  visit_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (place_id, username)
);

create index if not exists user_visits_username_idx on user_visits (username);
create index if not exists user_visits_place_id_idx on user_visits (place_id);

-- Optional: drop the old global visited index (visits are per-user now)
-- drop index if exists places_is_visited_idx;
