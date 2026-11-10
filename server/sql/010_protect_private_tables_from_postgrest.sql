-- ReliefGO uses server-side JWT auth and the Express API; not Supabase Auth.
-- Supabase public-schema tables must not become readable by anon/authenticated.
-- No FORCE ROW LEVEL SECURITY: database table owners running migrations and
-- the trusted Express backend still use their direct PostgreSQL connections.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_attendance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
 users,campaigns,donations,expenses,files,campaign_updates,volunteers,
 volunteer_attendance_checks,proofs,notifications,audit_logs,schema_migrations
 FROM PUBLIC;

-- Only revoke from roles that exist; plain local PostgreSQL has no anon role.
DO $$
DECLARE role_name TEXT;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon','authenticated','service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname=role_name) THEN
      EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE users,campaigns,donations,expenses,files,campaign_updates,volunteers,volunteer_attendance_checks,proofs,notifications,audit_logs,schema_migrations FROM %I', role_name);
    END IF;
  END LOOP;
END $$;
