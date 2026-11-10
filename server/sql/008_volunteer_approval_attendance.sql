-- ReliefGO Migration 008
-- Volunteer approval and GPS/photo attendance verification.
-- Run after migration 007.

ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS status VARCHAR(12)
NOT NULL DEFAULT 'pending';

ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);

ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS attendance_status VARCHAR(15)
NOT NULL DEFAULT 'not_started';

ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS attendance_review_reason TEXT;

ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS attendance_reviewed_by UUID REFERENCES users(id);

ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS attendance_reviewed_at TIMESTAMPTZ;

ALTER TABLE volunteers
DROP CONSTRAINT IF EXISTS volunteers_approval_status_check;

ALTER TABLE volunteers
ADD CONSTRAINT volunteers_approval_status_check
CHECK (
  status IN ('pending', 'approved', 'rejected')
);

ALTER TABLE volunteers
DROP CONSTRAINT IF EXISTS volunteers_attendance_status_check;

ALTER TABLE volunteers
ADD CONSTRAINT volunteers_attendance_status_check
CHECK (
  attendance_status IN (
    'not_started',
    'in_progress',
    'submitted',
    'verified',
    'rejected'
  )
);

-- Default full-day attendance requirement: 6 hours.
-- This can be adjusted in the database for different events.
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS required_attendance_hours SMALLINT
NOT NULL DEFAULT 6;

ALTER TABLE campaigns
DROP CONSTRAINT IF EXISTS campaigns_attendance_hours_check;

ALTER TABLE campaigns
ADD CONSTRAINT campaigns_attendance_hours_check
CHECK (
  required_attendance_hours BETWEEN 1 AND 12
);

-- Private attendance evidence is stored in PostgreSQL.
-- Actual server timestamps cannot be chosen by the applicant.

CREATE TABLE IF NOT EXISTS volunteer_attendance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  volunteer_id UUID NOT NULL
  REFERENCES volunteers(id) ON DELETE CASCADE,

  kind VARCHAR(12) NOT NULL
  CHECK (
    kind IN ('check_in', 'checkpoint', 'check_out')
  ),

  latitude DOUBLE PRECISION NOT NULL
  CHECK (latitude BETWEEN -90 AND 90),

  longitude DOUBLE PRECISION NOT NULL
  CHECK (longitude BETWEEN -180 AND 180),

  accuracy_m DOUBLE PRECISION NOT NULL
  CHECK (accuracy_m BETWEEN 0 AND 100),

  distance_m DOUBLE PRECISION NOT NULL
  CHECK (distance_m BETWEEN 0 AND 20000000),

  photo_mime VARCHAR(20) NOT NULL
  CHECK (
    photo_mime IN ('image/jpeg', 'image/png', 'image/webp')
  ),

  photo_body BYTEA NOT NULL
  CHECK (
    OCTET_LENGTH(photo_body) BETWEEN 1 AND 8388608
  ),

  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS volunteer_attendance_by_application_idx
ON volunteer_attendance_checks(volunteer_id, recorded_at);

CREATE UNIQUE INDEX IF NOT EXISTS volunteer_one_checkin_idx
ON volunteer_attendance_checks(volunteer_id)
WHERE kind = 'check_in';

CREATE UNIQUE INDEX IF NOT EXISTS volunteer_one_checkout_idx
ON volunteer_attendance_checks(volunteer_id)
WHERE kind = 'check_out';

CREATE INDEX IF NOT EXISTS volunteers_approval_queue_idx
ON volunteers(status, created_at DESC);

CREATE INDEX IF NOT EXISTS volunteers_event_approved_idx
ON volunteers(campaign_id, status);