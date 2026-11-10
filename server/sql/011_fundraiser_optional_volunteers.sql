-- New fundraisers may optionally recruit volunteers. Existing volunteer_event rows remain valid.
-- No table or column renames and no data deletion.
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_type_and_staffing_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_type_and_staffing_check CHECK (
  (type='fundraiser' AND goal>0 AND payout_method IS NOT NULL AND payout_name IS NOT NULL AND payout_number IS NOT NULL
   AND ((NOT needs_volunteers AND volunteer_help_category IS NULL)
     OR (needs_volunteers AND volunteer_date IS NOT NULL AND volunteer_location IS NOT NULL
         AND NULLIF(TRIM(volunteer_help_category),'') IS NOT NULL
         AND volunteer_duties IS NOT NULL AND volunteer_requirements IS NOT NULL
         AND volunteer_slots BETWEEN 1 AND 10000)))
  OR
  (type='volunteer_event' AND volunteer_location IS NOT NULL AND volunteer_date IS NOT NULL
   AND ((NOT needs_volunteers AND volunteer_help_category IS NULL)
     OR (needs_volunteers AND NULLIF(TRIM(volunteer_help_category),'') IS NOT NULL
         AND volunteer_duties IS NOT NULL AND volunteer_requirements IS NOT NULL
         AND volunteer_slots BETWEEN 1 AND 10000)))
);
CREATE INDEX IF NOT EXISTS campaigns_optional_recruitment_idx
 ON campaigns(status,volunteer_date) WHERE needs_volunteers=true;
