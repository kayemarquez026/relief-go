import {ref} from 'vue';
import type {AppUser} from '../models/User';
import {api,apiSession,clearToken} from './api';
export const currentUser=ref<AppUser|null>(null);
const asUser=(v:any):AppUser=>({uid:v.id,email:v.email,displayName:v.name,phone:v.phone||'',role:v.role==='admin'?'admin':v.role==='organizer'?'organizer':'donor',isSuspended:!!v.is_suspended,createdAt:v.created_at||new Date().toISOString()});
export const mapUser=asUser;
export function setCurrentUser(u:AppUser|null){currentUser.value=u;}
export function setRegistering(_v:boolean){}
export async function fetchUserProfile(_uid:string):Promise<AppUser|null>{if(!apiSession.token)return null;try{return asUser(await api('/me'));}catch{clearToken();return null;}}
let ready:Promise<void>|null=null;
export function initAuth(){return ready||(ready=(async()=>{if(apiSession.token){currentUser.value=await fetchUserProfile('');}})());}
export function resetAuthPromise(){ready=null;}
