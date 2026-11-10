# ReliefGO — Windows setup and Supabase PostgreSQL guide

**The same application folders and filenames are preserved:** `ReliefGO/relief-go/`.
The frontend remains **Ionic Vue** and the backend remains **Node.js + Express**.
Supabase hosts **PostgreSQL**; it does not automatically host this Express backend.
There is **no Supabase Auth migration** in this patch: the existing `users` table,
`bcrypt` password hashes and server-side JWT login stay in use.

## 1. Back up first (do NOT overwrite your existing .env)

1. Make a copy of the original `ReliefGO.zip` and your current project folder.
2. **Do not upload `.env`, database dumps, or real user photos to GitHub**.
3. The repaired download intentionally excludes `.env`, `node_modules`, log files, `.git`, and generated builds.
   The ZIP cannot contain your existing PostgreSQL records because no database dump was supplied.
4. If `relief-go/.env` already exists on your PC, **keep it**, but inspect and edit it carefully.
   If there is no `.env` yet, create one from `.env.example`:

   ```powershell
   cd "C:\Users\LENOVO\Desktop\ReliefGO\relief-go"
   if (!(Test-Path .env)) { Copy-Item .env.example .env }
   ```

## 2A. Local Docker database (optional; for backups/testing)

Docker Desktop must be open and its engine running. From `relief-go/`:

```powershell
docker compose up -d
docker compose ps
```

Your `docker-compose.yml` maps `127.0.0.1:5433` on Windows to PostgreSQL port
`5432` inside the Docker container. Local `.env` example:

```dotenv
POSTGRES_PASSWORD=YOUR_EXISTING_LOCAL_PASSWORD
DATABASE_URL=postgresql://reliefgo:YOUR_EXISTING_LOCAL_PASSWORD@127.0.0.1:5433/reliefgo
```

If `docker compose ps` shows no running Postgres, `ECONNREFUSED 127.0.0.1:5433`
is expected. This is NOT a password-authentication error. **Changing `POSTGRES_PASSWORD`
does not reset an existing Docker database user when its named volume already
contains a database.** Avoid `docker compose down -v` because that deletes its
named data volume. A Windows system PostgreSQL installation on another port is
not automatically the ReliefGO Docker database.

## 2B. Recommended: Use Supabase as the database

1. Sign in to **https://supabase.com/dashboard** and create a new project.
   Save its DB password in a password manager. Do not share it in chat.
2. Open the project, click **Connect** (top of page) and copy the **Session pooler**
   PostgreSQL connection URI. Session pooling on **port 5432** usually works on
   IPv4-only Windows connections. Use the actual provided host, project-qualified
   username and database name; do not guess them.
3. Open `relief-go/.env`. Replace only `DATABASE_URL` with that **complete URI**,
   including the real password. If needed, URL-encode special characters in the
   password (e.g., `%40` for `@`). Keep TLS/SSL enabled; if the URI has no SSL
   parameter, append `?sslmode=require` (or `&sslmode=require` if it has query options).
4. Configure a strong 32+ character `JWT_SECRET` (and retain the existing one if
   you need existing login sessions to remain valid). Keep `PORT=4000` and
   `CLIENT_ORIGIN=http://localhost:5173,http://localhost:8100` for local browser testing.
5. **Never add the database URI to `VITE_` variables or frontend files**;
   only the Express server talks directly to PostgreSQL.

Example ONLY — placeholders are not real credentials:

```dotenv
DATABASE_URL=postgresql://postgres.PROJECT_REF:ENCODED_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require
JWT_SECRET=REPLACE_WITH_A_NEW_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS
PORT=4000
CLIENT_ORIGIN=http://localhost:5173,http://localhost:8100,http://localhost,capacitor://localhost
VITE_API_BASE_URL=/api
DB_POOL_MAX=5
```

**Do not use Supabase transaction pooler port 6543 for `npm run db:migrate`.**
The migration runner holds a session-level PostgreSQL advisory lock, which
requires a session-sticky connection. Supabase **Direct** (IPv6) or **Session
pooler** (IPv4, port 5432) is suitable. Supabase docs:
https://supabase.com/docs/guides/database/connecting-to-postgres

## 3. Install, migrate and start

Open **PowerShell inside `ReliefGO/relief-go/`**:

```powershell
npm install
npm run check:source
npm run test:api
npx vue-tsc --noEmit
npm run db:migrate
npm run db:check
npm run dev:server
```

The migrations are automatically applied in filename order from `server/sql/`
and tracked by `schema_migrations`:
- `001`–`005`: base tables, evidence, account suspensions and notifications.
- `006`: campaign dates and coordinates (restored from previous working source).
- `007`: optional volunteer recruitment and its proper constraints.
- `008`: approval/attendance columns, evidence table and indexes (relocated).
- `009`: repairs databases where broken 006/007 were marked applied earlier.
- `010`: enables RLS and revokes API roles' direct access to private tables.

**Do not execute the diagnostic `SELECT` queries as migration SQL.**
If the database is new, migrate once; existing databases only apply migration
files that are not yet recorded. Never reset the database to “fix” a migration.

Open **another** terminal:

```powershell
npm run dev
```

Then open `http://localhost:5173/welcome`. `npm run dev` uses Vite with an
`/api` proxy to the Express server; you may use `ionic serve` instead and open
its URL. `http://localhost:4000/api/health` should return JSON with `ok:true`.

To create the **first** administrator in a **new empty database only**:
put `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ chars), `ADMIN_NAME`, `ADMIN_PHONE`
in local `.env`, then execute `npm run admin`. Existing admins are not overwritten.

## 4. If there are EXISTING local users, donations and campaigns

**A repaired source ZIP does not transfer database records.** Do not expect old
accounts to appear automatically in the new empty Supabase project. You must
export existing PostgreSQL data and import it separately before creating new
records in the Supabase DB.

**BACK UP YOUR LOCAL DB BEFORE MIGRATING, even if you think it is empty.**
If the database lives in the `docker-compose.yml` container and Docker is
running, use this in PowerShell from `relief-go/`:

```powershell
docker compose exec -T postgres pg_dump -U reliefgo -d reliefgo --format=custom --schema=public --no-owner --no-acl > .\reliefgo_backup.dump
```

This creates a private binary database dump in your project root. **Do not
commit or share that dump.** Copy it outside the Git repository for safekeeping.
You may need matching PostgreSQL client tools (`pg_dump`, `pg_restore`). The
dump includes users' password hashes and private evidence photos.

For an existing source database, use the official **Postgres → Supabase**
workflow and inspect table ownership, FKs, migration history, and available
space before restoring:
https://supabase.com/kb/guides/migrate-from-postgres

Do **not** blindly restore a complete old schema over a new Supabase schema
that already has migrations 001–010: that can conflict with existing tables.
On a clean destination, apply the app migrations, then restore **data only**
from a verified backup using a PostgreSQL client and a session/direct
connection; avoid restoring `schema_migrations` rows into an already-migrated
target. Because `donations` and `files` have reciprocal FK references, the
restore order may require additional care. Verify row counts and account login
before deleting the local source.

Supabase Storage is **not** automatically used in this version. Existing
proof images and attendance photos stay as private PostgreSQL `BYTEA` data and
are served via authenticated Express routes. Storage migration can be a
separate project once live data is backed up.

## 5. Mobile and hosting

A Supabase database cannot receive Ionic's `/api` requests directly. Keep the
Express API running locally while developing, or deploy it to an HTTPS host.
For Android builds/devices, set `VITE_API_BASE_URL=https://YOUR_HTTPS_BACKEND/api`
**before building**, and allow the mobile origin in server CORS. A mobile
phone's `localhost` points to the phone, not to your Windows machine.
Geolocation requires device permissions and a secure context (HTTPS).
OpenStreetMap/Leaflet tiles and external maps need internet.

## 6. What the automated checks DO / DO NOT prove

Checked during the source repair: `node --check` backend files,
`npx vue-tsc --noEmit`, source checks, server validation/payment unit tests,
and basic HTTP route behavior with a deliberately unavailable test DB.

**Not verified without live credentials/infrastructure:** running Supabase
migrations, SQL FK constraints in a real Postgres instance, full donation /
volunteer check-in browser workflows, Android build/device GPS, email password
reset, delivery of live payment transactions. No payment gateway integration is
included. Attendance GPS/photos are user-supplied evidence and are not
fraud-proof or guaranteed to prove a complete shift.

### Diagnosing errors

- `ECONNREFUSED 127.0.0.1:5433`: old local Docker DB isn't reachable.
- `28P01`: password authentication failed; check password/username.
- `42703` / `42P01`: schema column/table missing; check migration history.
- `ETIMEDOUT` / IPv6 error: try the Supabase **Session pooler** URI from Connect.
- `Crypt key is missing`: **pgAdmin** local saved-password encryption problem,
  not proof that the Postgres database password or records were changed.
- `npm run build` on Windows: run `npm install` to install platform-specific
  native dependencies; they are intentionally not inside the source ZIP.
