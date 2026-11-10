-- Run manually on existing databases with a BACKUP first. Fresh installs use 001_init.sql, then 002_impact_proof.sql.
BEGIN;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS impact_file_id uuid;
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_kind_check;
ALTER TABLE files ADD CONSTRAINT files_kind_check CHECK (kind IN ('campaign_proof','campaign_cover','payment_receipt','expense_proof','impact_proof'));
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_impact_file_id_fkey;
ALTER TABLE expenses ADD CONSTRAINT expenses_impact_file_id_fkey FOREIGN KEY (impact_file_id) REFERENCES files(id);
COMMIT;
