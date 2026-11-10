import 'dotenv/config';
import { pool } from './db.js';
const needed=['users','campaigns','donations','expenses','files','campaign_updates',
  'volunteers','volunteer_attendance_checks','proofs','notifications','audit_logs','schema_migrations'];
let exit=0;
try {
  const info=await pool.query('SELECT current_database() AS db, current_user AS role');
  console.log('Connected to PostgreSQL database:',info.rows[0].db);
  console.log('Connected as database role:',info.rows[0].role);
  const found=await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name=ANY($1::text[])`,[needed]);
  const names=new Set(found.rows.map(row=>row.table_name));
  const missing=needed.filter(name=>!names.has(name));
  if(missing.length){console.error('Missing tables:',missing.join(', '));exit=1;}
  else {
    const applied=await pool.query('SELECT name FROM schema_migrations ORDER BY name');
    console.log('Database tables OK. Migrations:',applied.rows.map(row=>row.name).join(', '));
    const status=await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='campaigns' AND column_name=ANY($1::text[])`,[['needs_volunteers','volunteer_help_category','required_attendance_hours','latitude','longitude']]);
    if(status.rows.length!==5){console.error('Campaign volunteer/location fields incomplete.');exit=1;}
    else console.log('Campaign volunteer/location columns OK.');
  }
} catch(e) {
  console.error('Database check failed:',e?.code||'UNKNOWN',e?.message||e);
  console.error('Confirm DATABASE_URL, Docker/Supabase connection, and migration status.');
  exit=1;
} finally {await pool.end();}
process.exitCode=exit;
