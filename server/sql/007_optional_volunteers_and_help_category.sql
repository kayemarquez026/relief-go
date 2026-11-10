-- 007: An event's purpose/category is independent of whether the organizer needs volunteers.
-- Safe for existing records. Existing volunteer events keep recruitment enabled.
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS needs_volunteers boolean NOT NULL DEFAULT false;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS volunteer_help_category varchar(70);

UPDATE campaigns
SET needs_volunteers=true,
    volunteer_help_category=COALESCE(NULLIF(volunteer_help_category,''), 'General Assistance')
WHERE type='volunteer_event' AND volunteer_slots IS NOT NULL;

-- Original unnamed table-level CHECK required volunteers for every event.
-- Drop only the original constraint matching those fields, not unrelated constraints.
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid='campaigns'::regclass AND contype='c'
      AND pg_get_constraintdef(oid) LIKE '%volunteer_duties%'
      AND pg_get_constraintdef(oid) LIKE '%payout_method%'
  LOOP
    EXECUTE format('ALTER TABLE campaigns DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE campaigns ADD CONSTRAINT campaigns_type_and_staffing_check
CHECK (
  (type='fundraiser' AND goal>0 AND payout_method IS NOT NULL
   AND payout_name IS NOT NULL AND payout_number IS NOT NULL
   AND NOT needs_volunteers AND volunteer_help_category IS NULL)
  OR
  (type='volunteer_event'
   AND volunteer_location IS NOT NULL AND volunteer_date IS NOT NULL
   AND (
     (NOT needs_volunteers AND volunteer_help_category IS NULL)
     OR
     (needs_volunteers AND NULLIF(TRIM(volunteer_help_category),'') IS NOT NULL
      AND volunteer_duties IS NOT NULL AND volunteer_requirements IS NOT NULL
      AND volunteer_slots BETWEEN 1 AND 10000)
   ))
);
CREATE INDEX IF NOT EXISTS campaigns_volunteer_need_idx
ON campaigns(needs_volunteers,volunteer_help_category)
WHERE type='volunteer_event' AND status='approved';
