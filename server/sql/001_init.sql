BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(100) NOT NULL,
 email varchar(254) NOT NULL, phone varchar(11) NOT NULL CHECK (phone ~ '^09[0-9]{9}$'),
 password_hash text NOT NULL, role varchar(12) NOT NULL CHECK (role IN ('donor','organizer','admin')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (lower(email));
CREATE TABLE IF NOT EXISTS campaigns (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organizer_id uuid NOT NULL REFERENCES users(id),
 type varchar(20) NOT NULL CHECK(type IN ('fundraiser','volunteer_event')),
 title varchar(120) NOT NULL, description text NOT NULL, category varchar(40) NOT NULL,
 city varchar(100) NOT NULL, beneficiary varchar(120) NOT NULL, beneficiary_relation varchar(200) NOT NULL,
 goal numeric(14,2) NOT NULL DEFAULT 0 CHECK(goal >= 0), budget jsonb NOT NULL DEFAULT '[]'::jsonb,
 payout_method varchar(20), payout_name varchar(100), payout_number varchar(25),
 volunteer_duties text, volunteer_requirements text, volunteer_location varchar(200),
 volunteer_date timestamptz, volunteer_slots integer CHECK(volunteer_slots BETWEEN 1 AND 10000),
 status varchar(12) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','paused','closed')),
 rejection_reason text, created_at timestamptz NOT NULL DEFAULT now(), reviewed_at timestamptz,
 CHECK ((type='fundraiser' AND goal>0 AND payout_method IS NOT NULL AND payout_name IS NOT NULL AND payout_number IS NOT NULL)
 OR (type='volunteer_event' AND volunteer_duties IS NOT NULL AND volunteer_requirements IS NOT NULL AND volunteer_location IS NOT NULL AND volunteer_date IS NOT NULL AND volunteer_slots IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS campaigns_public_idx ON campaigns(status,created_at DESC);
CREATE INDEX IF NOT EXISTS campaigns_org_idx ON campaigns(organizer_id);
CREATE TABLE IF NOT EXISTS donations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id uuid NOT NULL REFERENCES campaigns(id),
 donor_id uuid NOT NULL REFERENCES users(id), amount numeric(14,2) NOT NULL CHECK(amount>0),
 method varchar(20) NOT NULL CHECK(method IN ('GCash','Maya','Bank Transfer')),
 reference varchar(80) NOT NULL, sender_name varchar(100) NOT NULL, anonymous boolean NOT NULL DEFAULT false,
 status varchar(12) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','rejected')),
 rejection_reason text, receipt_file_id uuid, verified_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS donation_ref_unique ON donations(method,lower(reference));
CREATE INDEX IF NOT EXISTS donations_campaign_status ON donations(campaign_id,status);
CREATE TABLE IF NOT EXISTS expenses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id uuid NOT NULL REFERENCES campaigns(id),
 organizer_id uuid NOT NULL REFERENCES users(id), amount numeric(14,2) NOT NULL CHECK(amount>0),
 category varchar(60) NOT NULL, description text NOT NULL, spent_at date NOT NULL,
 status varchar(12) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','rejected')),
 rejection_reason text, proof_file_id uuid, public_safe boolean NOT NULL DEFAULT false,
 reviewed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS expenses_campaign_status ON expenses(campaign_id,status);
CREATE TABLE IF NOT EXISTS files (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL REFERENCES users(id),
 campaign_id uuid REFERENCES campaigns(id), donation_id uuid REFERENCES donations(id), expense_id uuid REFERENCES expenses(id),
 kind varchar(20) NOT NULL CHECK(kind IN ('campaign_proof','campaign_cover','payment_receipt','expense_proof')),
 filename text NOT NULL, mime varchar(100) NOT NULL, size_bytes integer NOT NULL CHECK(size_bytes BETWEEN 1 AND 8388608),
 body bytea NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_receipt_file_id_fkey;
ALTER TABLE donations ADD CONSTRAINT donations_receipt_file_id_fkey FOREIGN KEY (receipt_file_id) REFERENCES files(id);
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_proof_file_id_fkey;
ALTER TABLE expenses ADD CONSTRAINT expenses_proof_file_id_fkey FOREIGN KEY (proof_file_id) REFERENCES files(id);
CREATE TABLE IF NOT EXISTS campaign_updates (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id uuid NOT NULL REFERENCES campaigns(id),
 author_id uuid NOT NULL REFERENCES users(id), title varchar(120) NOT NULL, message text NOT NULL,
 image_url text, created_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS updates_campaign_idx ON campaign_updates(campaign_id,created_at DESC);
CREATE TABLE IF NOT EXISTS volunteer_applications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id uuid NOT NULL REFERENCES campaigns(id),
 user_id uuid NOT NULL REFERENCES users(id), full_name varchar(100) NOT NULL,
 phone varchar(11) NOT NULL CHECK(phone ~ '^09[0-9]{9}$'),
 skills text NOT NULL, availability text NOT NULL, note text, consent boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(campaign_id,user_id)
);
CREATE TABLE IF NOT EXISTS audit_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid REFERENCES users(id),
 action varchar(90) NOT NULL, target_type varchar(30) NOT NULL, target_id uuid,
 details text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_latest_idx ON audit_logs(created_at DESC);
COMMIT;
