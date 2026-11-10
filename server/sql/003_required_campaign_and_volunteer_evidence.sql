-- Apply after 001/002. All new fields are nullable for historical records;
-- the HTTP API requires them for every new campaign or resubmission.
BEGIN;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS contact_phone varchar(11);
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_contact_phone_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_contact_phone_check CHECK (contact_phone IS NULL OR contact_phone ~ '^09[0-9]{9}$');
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_kind_check;
ALTER TABLE files ADD CONSTRAINT files_kind_check CHECK (kind IN
 ('campaign_proof','campaign_cover','payment_receipt','expense_proof','impact_proof','valid_id','barangay_clearance','situation_photo'));
ALTER TABLE volunteer_applications RENAME TO volunteers;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS address varchar(200);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS reason text;
CREATE INDEX IF NOT EXISTS files_campaign_kind_idx ON files(campaign_id,kind,created_at DESC);
-- Proofs are first-class database records; binary content remains in protected files storage.
CREATE TABLE IF NOT EXISTS proofs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 file_id uuid NOT NULL UNIQUE REFERENCES files(id) ON DELETE RESTRICT,
 kind varchar(30) NOT NULL,
 approved_for_public boolean NOT NULL DEFAULT false,
 reviewed_by uuid REFERENCES users(id),
 reviewed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS proofs_kind_review_idx ON proofs(kind,approved_for_public);
-- Preserve previously stored evidence when upgrading the existing PostgreSQL starter.
INSERT INTO proofs(file_id,kind,approved_for_public)
SELECT f.id,f.kind,CASE WHEN e.id IS NOT NULL AND e.status='verified' AND e.public_safe THEN true ELSE false END
FROM files f LEFT JOIN expenses e ON e.id=f.expense_id
WHERE f.kind<>'campaign_cover' ON CONFLICT(file_id) DO NOTHING;
COMMIT;
