> **REPAIRED PROJECT (Nov 2026):** See `SUPABASE_SETUP.md` for the verified
> connection/migration instructions. Existing README references to port 5432 for
> Docker are outdated: this repo publishes the local container on port **5433**.
> Existing users/data are NOT inside the source ZIP. Password reset emails are
> not integrated; use an administrator-managed secure reset procedure.

# ReliefGO — Original GitHub Ionic Vue UI + PostgreSQL

This package starts with the **original source and existing redesigned pages of `kayemarquez026/relief-go`**. It keeps the original `src/views/*.vue` filenames and locations, the illustration assets, the page styles, and the landing page. The original Firebase RTDB/Auth service calls were replaced in-place by a local Express + PostgreSQL API. The only substantial new top-level folder is `server/` for that backend.

## What you need

- Node.js **22 or later** and npm (the original repository's Vite 8 requirements).
- Docker Desktop **running** (recommended), or your own running PostgreSQL 16+ server.
- Ionic CLI for `ionic serve` (optional): `npm install -g @ionic/cli`.
- **You do not need to sign in to Firebase**, and you do not need a third-party payment API account for manual GCash/Maya/bank receipt submission.
- **You do need** your own PostgreSQL database credentials and administrator login credentials for local setup. Never share these secrets in chat or Git.

## Windows PowerShell — first run

Open **this `relief-go` folder** in VS Code. Run:

```powershell
Copy-Item .env.example .env
```

Open `.env` in VS Code and change all placeholder values:

- `POSTGRES_PASSWORD`: a strong password for the local Docker database.
- `DATABASE_URL`: `postgres://reliefgo:YOUR_SAME_PASSWORD@127.0.0.1:5433/reliefgo`. If the password contains characters like `@`, `#` or `/`, URL-encode them in the connection string.
- `JWT_SECRET`: at least 32 unpredictable characters; use a unique secret that does **not** start with `REPLACE_`.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters), `ADMIN_NAME` and `ADMIN_PHONE`: the initial admin account. **Do not use real production secrets in screenshots.**

Then:

```powershell
# Start PostgreSQL (requires Docker Desktop)
docker compose up -d

# Install frontend and backend dependencies
npm install

# Create/update database schema (the project uses pg, NOT Prisma)
npm run db:migrate

# Seed your first admin account
npm run admin
```

**Run the backend in terminal 1:**

```powershell
npm run dev:server
```

Confirm that `http://localhost:4000/api/health` responds with `{"ok":true,"db":"postgresql"}`.

**Run the Ionic app in terminal 2:**

```powershell
ionic serve
```

Open `http://localhost:8100/welcome` (or the URL printed by Ionic). To use vanilla Vite instead, run `npm run dev` and open `http://localhost:5173/welcome`. The Vite configuration proxies `/api` to `http://localhost:4000` so both browser URLs use the backend.

You can also start both Vite and API together via `npm run dev:full` (that opens port 5173, not 8100).

## Actual database schema

The project uses `pg` SQL migrations (NOT Prisma), tracked in the `schema_migrations` table under `server/sql/`. Major tables: `users`, `campaigns`, `donations`, `expenses`, `volunteers`, `proofs`, `files`, `campaign_updates`, `notifications`, and `audit_logs`. The `files` table stores uploaded file bytes privately in PostgreSQL. Migrations **001–006** include the original campaigns' date/location data, phone, and evidence requirements.

### Reviewable flows

- **Register/login:** email/password + valid 09 phone. Passwords are hashed; signed tokens expire.
- **Create campaign:** fundraiser or volunteer event; requires title, detailed description, beneficiary and location, contact phone, valid ID, barangay clearance, situation photo, and legitimacy evidence. Fundraisers require payout details and a budget matching the fundraising goal; events require duties, requirements, date, and slots. All newly created campaigns start **pending** and stay hidden until admin approval. Rejected campaigns can be corrected at `/organizer/campaigns/:id/edit` and resubmitted.
- **Donation:** a supporter sends money outside ReliefGO to the campaign's GCash/Maya/bank account, then uploads the real transaction reference and a screenshot/PDF. The `donations` table enforces payment-method + normalized reference uniqueness. A screenshot **is not financial proof of settlement**; an administrator must independently reconcile with the real bank/GCash/Maya account before verifying. Pending donations do not raise public totals.
- **Expenses:** the organizer must upload **two different files**: purchase receipt and proof of actual delivery/use. Admin verification is required before evidence is publicly viewable. Pending and rejected evidence is private. Expense verification is bounded by verified donation totals.
- **Volunteers:** for an approved volunteer event, users sign up from the campaign details modal using full name, 09 phone, address, availability, skills, reason, and consent. Organizer can review applicants from **My Campaigns**; duplicate applications and excess slots are blocked.
- **Search/admin:** live category, city, amount, and status filtering; admin campaign/donation/expense review, reports, audit logs, notifications, and user suspension.

### Limits & required human work

**No Firebase data was migrated**: existing users/password hashes, historical donations, and campaign records must be exported and migrated separately. Firebase accounts cannot automatically sign in with the new database. The new application starts with an empty PostgreSQL database until you register users and submit campaigns.

**No payment gateway or bank API is integrated**: payment screenshots and references are subject to fraud. Real-world fund disbursement and payout account verification must be handled outside the application. Admin access is sensitive; review uploads for malware, remove personal data/EXIF before publication, get informed consent, and consult applicable privacy rules before deploying. Database backups, virus scanning, email delivery, rate limiting and production storage should be reviewed and hardened.

The old *Forgot Password* screen remains in its original path, but **email password resets are not configured** because no SMTP sender/account was provided; the screen reports this limitation rather than claiming to have sent an email.

**Android Capacitor note:** browser-based `localhost` proxy is not a mobile API. Set `VITE_API_BASE_URL` to a reachable **HTTPS** API endpoint and configure proper CORS and secure deployment for actual devices.

## Checks

```powershell
npm run build
npm run test:api
npm run check:source
```

`npm run build` requires `npm install` and `vue-tsc`. Source syntax/template checks are **not** a substitute for a full Ionic production build, live database transactions, payment-flow testing, security review or Android testing. See the release note on build verification if included.

## Files and original design

- Original 26 existing pages remain in `src/views/` with their **original filenames**. Original 7 components remain in `src/components/`.
- Original `WelcomePage.vue` landing design, CSS, forest-green/cream/terracotta palette and illustrated imagery are preserved; the welcome hero uses live approved campaign data where available, and labels demo art when no approved campaigns exist.
- Existing router, services, models, maps, utilities, themes, config and tests keep their original directories.
- Added: `src/services/api.ts`, PostgreSQL `server/`, `docker-compose.yml`, and `.env.example`.
- Removed: `src/firebase/`, `firestore.rules`, `database.rules.json`, and the `firebase` npm dependency.
- Generated folders and secrets are deliberately excluded (`node_modules/`, `.git/`, `.env`, `dist/`). The lockfile is regenerated with `npm install` because dependencies changed.


## November 2026 source improvements

This archive retains the original `ReliefGO/relief-go/` folder layout. Existing files were edited in place, with a shared Word exporter and additive SQL migration.

- **Important migration:** Before allowing new fundraising campaigns with volunteer recruitment, run `npm run db:migrate` from the `relief-go` directory against the configured PostgreSQL server. The new script is `server/sql/011_fundraiser_optional_volunteers.sql`. It preserves existing records and legacy volunteer-event campaigns. Back up the database before applying any migrations.
- Fundraising is mandatory for **new** campaigns. Optional volunteer recruitment can be enabled. Older volunteer-event records remain readable and editable under existing rules.
- New notifications generated on campaign submission/review and donation/volunteer reviews carry links to the relevant record (existing historic notifications retain their old stored links).
- Admin campaign details now allow `.docx` download; generated files contain formatted text with no external dependencies.
- Guest/public browsing remains available without logging in. Authenticated Home/brand links route to the role dashboard.

**Verification performed on the updated source:** `node_modules/vue-tsc/bin/vue-tsc.js --noEmit` passed, `npm run check:source` passed, `npm run test:api` passed (22/22 tests), and an exported sample `.docx` was opened and visually rendered. No live PostgreSQL database or logged-in browser sessions were provided, so end-to-end permissions, route behaviors, notifications, GPS attendance, and migration execution have **not** been verified. Full `vite build` also requires installing platform-appropriate optional native dependencies for Linux (the original uploaded `node_modules` contains only Windows native bindings). Run `npm ci` on the target machine before `npm run build`.
