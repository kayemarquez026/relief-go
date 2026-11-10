import 'dotenv/config';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {readFile,readdir} from 'node:fs/promises';
import {pool} from './db.js';
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL required in .env');
const dir=join(dirname(fileURLToPath(import.meta.url)),'..','sql');
let client;
try { client=await pool.connect(); }
catch (error) {
  console.error('Cannot reach PostgreSQL. Check DATABASE_URL host/port, Docker/Supabase status, and network access.');
  console.error('Connection error code:', error?.code || 'unknown');
  await pool.end();
  process.exitCode=1;
  throw error;
}
try{
  // The lock serializes concurrent migration runners; tracking and schema change commit together.
  await client.query('SELECT pg_advisory_lock(167711009)');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())');
  for(const name of (await readdir(dir)).filter(n=>/^\d+_.+\.sql$/.test(n)).sort()){
    const done=await client.query('SELECT 1 FROM schema_migrations WHERE name=$1',[name]);
    if(done.rowCount){console.log(`SKIP ${name}`);continue;}
    // Earlier migrations contained their own BEGIN/COMMIT directives.
    const sql=(await readFile(join(dir,name),'utf8'))
      .replace(/^\s*BEGIN\s*;\s*$/gim,'')
      .replace(/^\s*COMMIT\s*;\s*$/gim,'');
    await client.query('BEGIN');
    try{
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(name) VALUES($1)',[name]);
      await client.query('COMMIT');
      console.log(`APPLIED ${name}`);
    }catch(e){await client.query('ROLLBACK');console.error(`FAILED MIGRATION ${name}:`,e?.code||'',e?.message||e);throw e;}
  }
}finally{await client.query('SELECT pg_advisory_unlock(167711009)').catch(()=>{});client.release();await pool.end();}
