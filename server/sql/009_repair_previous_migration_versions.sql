-- Recovery for an existing database where 006/007 were previously recorded as
-- applied with incomplete content. Also safe on newly created databases.
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS needs_volunteers BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS volunteer_help_category VARCHAR(70);
CREATE INDEX IF NOT EXISTS campaigns_deadline_idx ON campaigns(deadline) WHERE status='approved';

-- Legacy events with volunteer slots should keep accepting volunteers.
UPDATE campaigns
SET needs_volunteers=true,
    volunteer_help_category=COALESCE(NULLIF(BTRIM(volunteer_help_category),''),'General Assistance')
WHERE type='volunteer_event'
  AND volunteer_slots IS NOT NULL
  AND volunteer_duties IS NOT NULL
  AND volunteer_requirements IS NOT NULL;
UPDATE campaigns SET needs_volunteers=false,volunteer_help_category=NULL WHERE type='fundraiser';
UPDATE campaigns SET volunteer_help_category=NULL WHERE type='volunteer_event' AND NOT needs_volunteers;

-- The original 001 table CHECK enforced volunteers on every event. Drop only
-- that constraint based on its definition, never other business constraints.
DO $$
DECLARE row RECORD;
BEGIN
  FOR row IN SELECT conname FROM pg_constraint
    WHERE conrelid='campaigns'::regclass AND contype='c'
      AND pg_get_constraintdef(oid) LIKE '%volunteer_duties%'
      AND pg_get_constraintdef(oid) LIKE '%payout_method%'
  LOOP
    EXECUTE format('ALTER TABLE campaigns DROP CONSTRAINT %I',row.conname);
  END LOOP;
END $$;

ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_type_and_staffing_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_type_and_staffing_check CHECK (
 (type='fundraiser' AND goal>0 AND payout_method IS NOT NULL
  AND payout_name IS NOT NULL AND payout_number IS NOT NULL
  AND NOT needs_volunteers AND volunteer_help_category IS NULL)
 OR
 (type='volunteer_event' AND volunteer_location IS NOT NULL
  AND volunteer_date IS NOT NULL
  AND ((NOT needs_volunteers AND volunteer_help_category IS NULL)
    OR (needs_volunteers AND NULLIF(BTRIM(volunteer_help_category),'') IS NOT NULL
        AND volunteer_duties IS NOT NULL AND volunteer_requirements IS NOT NULL
        AND volunteer_slots BETWEEN 1 AND 10000)))
);
CREATE INDEX IF NOT EXISTS campaigns_volunteer_need_idx
ON campaigns(needs_volunteers,volunteer_help_category)
WHERE type='volunteer_event' AND status='approved';
