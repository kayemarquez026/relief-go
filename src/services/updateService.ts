import type {CampaignUpdate} from '../models/CampaignUpdate';
import type {Campaign} from '../models/Campaign';
import type {AppUser} from '../models/User';
import {api,json} from './api';
export interface UpdateFormData{title:string;message:string;imageUrl:string}
export async function getCampaignUpdates(campaignId:string):Promise<CampaignUpdate[]>{const r=await api<any>(`/campaigns/${campaignId}/transparency`);return (r.updates||[]).map((v:any)=>({id:v.id,campaignId,organizerId:v.author_id||'',organizerName:v.organizer_name||'',title:v.title,message:v.message,imageUrl:v.image_url||'',createdAt:v.created_at}));}
export async function postCampaignUpdate(c:Campaign,_u:AppUser,f:UpdateFormData):Promise<string>{const r=await api<{id:string}>(`/campaigns/${c.id}/updates`,{method:'POST',body:json(f)});return r.id;}
export async function deleteCampaignUpdate(_c:string,id:string):Promise<void>{await api(`/updates/${id}`,{method:'DELETE'});}
