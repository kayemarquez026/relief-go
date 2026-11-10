
import tls from 'node:tls';
import { config as loadEnv } from 'dotenv';
import pg from 'pg';

// Load local environment variables
loadEnv({
  path: new URL('../../.env', import.meta.url)
});

// Database connection URL
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing.');
}

// Load Supabase SSL CA certificate
const caCertificate = (
  process.env.SUPABASE_CA_CERT || ''
)
  .replace(/\\n/g, '\n')
  .trim();

// Require Supabase certificate in production
if (
  process.env.NODE_ENV === 'production' &&
  !caCertificate
) {
  throw new Error(
    'SUPABASE_CA_CERT is missing in production.'
  );
}

// Parse PostgreSQL connection string
const parsedUrl = new URL(databaseUrl);

// Remove SSL URL parameters because they can
// override the explicit node-postgres SSL config.
for (const parameter of [
  'sslmode',
  'sslrootcert',
  'sslcert',
  'sslkey',
  'ssl'
]) {
  parsedUrl.searchParams.delete(parameter);
}

// Configure secure SSL connection
const sslConfig = {
  rejectUnauthorized: true,

  ...(caCertificate
    ? {
        ca: [
          ...tls.rootCertificates,
          caCertificate
        ]
      }
    : {})
};

// Create PostgreSQL connection pool
export const pool = new pg.Pool({
  connectionString: parsedUrl.toString(),

  ssl: sslConfig,

  max: Number(process.env.DB_POOL_MAX || 5),

  connectionTimeoutMillis: 10000,

  idleTimeoutMillis: 30000
});

// Execute SQL queries
export const q = (sql, args = []) => {
  return pool.query(sql, args);
};

// Execute database transactions
export async function tx(fn) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await fn(client);

    await client.query('COMMIT');

    return result;
  } catch (error) {
    await client.query('ROLLBACK');

    throw error;
  } finally {
    client.release();
  }
}

// API error helper
export const fail = (status, message) => {
  const error = new Error(message);

  error.status = status;

  throw error;
};

// Record audit logs
export const logAction = (
  client,
  who,
  action,
  kind,
  id,
  details
) => {
  return client.query(
    `INSERT INTO audit_logs
      (
        actor_id,
        action,
        target_type,
        target_id,
        details
      )
     VALUES ($1, $2, $3, $4, $5)`,
    [
      who,
      action,
      kind,
      id,
      details
    ]
  );
};
