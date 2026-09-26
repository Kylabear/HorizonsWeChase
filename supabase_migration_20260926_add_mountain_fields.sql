-- Migration: add mountain metadata to places and mountain-specific visit fields to user_visits
-- Timestamp: 2026-09-26

-- Add columns to places table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'elevation'
  ) THEN
    ALTER TABLE public.places ADD COLUMN elevation integer;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'hours_needed'
  ) THEN
    ALTER TABLE public.places ADD COLUMN hours_needed text;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'mountain_recommendation'
  ) THEN
    ALTER TABLE public.places ADD COLUMN mountain_recommendation text;
  END IF;
END$$;

-- Add columns to user_visits table for mountain visits
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_visits' AND column_name = 'mountain_rating'
  ) THEN
    ALTER TABLE public.user_visits ADD COLUMN mountain_rating integer;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_visits' AND column_name = 'was_mountain_good'
  ) THEN
    ALTER TABLE public.user_visits ADD COLUMN was_mountain_good boolean;
  END IF;
END$$;

-- Add a check constraint on places.mountain_recommendation to limit values to 'diy' or 'tour' or null
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.contype = 'c' AND t.relname = 'places' AND c.conname = 'places_mountain_recommendation_chk'
  ) THEN
    ALTER TABLE public.places
      ADD CONSTRAINT places_mountain_recommendation_chk CHECK (
        mountain_recommendation IN ('diy','tour') OR mountain_recommendation IS NULL
      );
  END IF;
END$$;

-- (Optional) You can add indexes if you plan to query by elevation or mountain_recommendation frequently
-- CREATE INDEX IF NOT EXISTS idx_places_elevation ON public.places (elevation);
-- CREATE INDEX IF NOT EXISTS idx_places_mountain_recommendation ON public.places (mountain_recommendation);

-- End of migration
