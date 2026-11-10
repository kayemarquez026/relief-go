
import { config as loadEnv } from 'dotenv';
import pg from 'pg';

loadEnv({
  path: new URL('../../.env', import.meta.url)
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing.');
}

const caCertificate = process.env.SUPABASE_CA_CERT
  ?.replace(/\\n/g, '\n')
  .trim();

if (process.env.NODE_ENV === 'production' && !caCertificate) {
  throw new Error('SUPABASE_CA_CERT is missing.');
}

const parsedUrl = new URL(databaseUrl);

if (caCertificate) {
  for (const parameter of [
    'sslmode',
    'sslrootcert',
    'sslcert',
    'sslkey'
  ]) {
    parsedUrl.searchParams.delete(parameter);
  }
}

export const pool = new pg.Pool({
  connectionString: parsedUrl.toString(),
  ...(caCertificate
    ? {
        ssl: {
          ca: caCertificate,
          rejectUnauthorized: true
        }
      }
    : {}),
  max: Number(process.env.DB_POOL_MAX || 5),
  connectionTimeoutMillis: 10000
});

export const q = (sql, args = []) =>
  pool.query(sql, args);

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

export const fail = (status, message) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};

export const logAction = (
  client,
  who,
  action,
  kind,
  id,
  details
) =>
  client.query(
    `INSERT INTO audit_logs
    (actor_id, action, target_type, target_id, details)
    VALUES ($1, $2, $3, $4, $5)`,
    [who, action, kind, id, details]
  );
