-- Keep the original Ionic Vue campaign-model date/location fields in PostgreSQL.
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS deadline date;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS longitude double precision;
CREATE INDEX IF NOT EXISTS campaigns_deadline_idx ON campaigns(deadline) WHERE status='approved';
