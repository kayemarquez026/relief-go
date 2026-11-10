import {computed,ref} from 'vue';
import type {AppNotification,NotificationType} from '../models/Notification';
import {api} from './api';
export interface NotificationInput{type:NotificationType;title:string;message:string;link:string}
/** No client-side write privilege; notifications are created by audited server actions. */
export function notificationUpdate(_uid:string,_input:NotificationInput):Record<string,unknown>{return {};}
export const notifications=ref<AppNotification[]>([]);
export const unreadCount=computed(()=>notifications.value.filter(n=>!n.isRead).length);
let timer:ReturnType<typeof setInterval>|null=null;
async function refresh(){try{const rows=await api<any[]>('/me/notifications');notifications.value=rows.map(v=>({id:v.id,userId:'',type:v.kind,title:v.title,message:v.message,link:v.link,isRead:!!v.is_read,createdAt:v.created_at}));}catch{/* Keep already-loaded notifications through transient connection errors. */}}
export function startNotificationListener(_uid:string){if(timer)return;void refresh();timer=setInterval(()=>void refresh(),30000);}
export function stopNotificationListener(){if(timer)clearInterval(timer);timer=null;notifications.value=[];}
export async function markAsRead(_uid:string,id:string):Promise<void>{await api(`/me/notifications/${id}/read`,{method:'PATCH'});await refresh();}
export async function markAllAsRead(_uid:string,_ids:string[]):Promise<void>{await api('/me/notifications/read-all',{method:'PATCH'});await refresh();}
export async function deleteNotification(_uid:string,id:string):Promise<void>{await api(`/me/notifications/${id}`,{method:'DELETE'});await refresh();}
