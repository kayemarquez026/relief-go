-- Existing accounts remain active; admin-only suspensions are audited.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS users_suspended_idx ON users(is_suspended) WHERE is_suspended=true;
