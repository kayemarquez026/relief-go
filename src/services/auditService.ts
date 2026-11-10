import type {AuditLog,AuditTargetType} from '../models/AuditLog';
import {api} from './api';
/** Kept for legacy source compatibility; audit entries are created atomically by the API. */
export function auditUpdate(_action:string,_targetType:AuditTargetType,_targetId:string,_details:string):Record<string,unknown>{return {};}
export async function getAuditLogs():Promise<AuditLog[]>{return (await api<any[]>('/admin/audit')).map(v=>({id:v.id,adminId:v.actor_id||'',adminName:v.admin_name,action:v.action,targetType:v.target_type,targetId:v.target_id||'',details:v.details,createdAt:v.created_at}));}
