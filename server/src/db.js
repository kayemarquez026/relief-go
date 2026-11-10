import {config as loadEnv} from 'dotenv';
// npm workspaces starts server commands from server/. Read the shared root .env explicitly.
loadEnv({path:new URL('../../.env',import.meta.url)});
import pg from 'pg';
export const pool = new pg.Pool({connectionString:process.env.DATABASE_URL,max:Number(process.env.DB_POOL_MAX||5),connectionTimeoutMillis:10000});
export const q = (sql,args=[])=>pool.query(sql,args);
export async function tx(fn){const client=await pool.connect();try{await client.query('BEGIN');const result=await fn(client);await client.query('COMMIT');return result;}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}}
export const fail=(status,message)=>{const e=new Error(message);e.status=status;throw e;};
export const logAction=(client,who,action,kind,id,details)=>client.query('INSERT INTO audit_logs(actor_id,action,target_type,target_id,details) VALUES($1,$2,$3,$4,$5)',[who,action,kind,id,details]);
