import type {AppUser} from '../models/User';
import {api,json} from './api';
import {mapUser} from './authState';
export async function getAllUsers():Promise<AppUser[]>{return (await api<any[]>('/admin/users')).map(mapUser);}
export async function setUserSuspended(u:AppUser,suspended:boolean,reason:string):Promise<void>{await api(`/admin/users/${u.uid}/suspension`,{method:'PATCH',body:json({suspended,reason:suspended?reason:'Account reactivated by administrator'})});}
