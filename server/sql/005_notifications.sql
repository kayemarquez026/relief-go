-- Private, per-user notification inbox. Non-credential emails are not stored in notifications.
CREATE TABLE IF NOT EXISTS notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 kind varchar(24) NOT NULL CHECK(kind IN ('campaign','donation','expense','volunteer','update','user')),
 title varchar(150) NOT NULL,
 message text NOT NULL,
 link text NOT NULL DEFAULT '/my',
 is_read boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id,created_at DESC);
