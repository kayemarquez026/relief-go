import type {Campaign} from '../models/Campaign';
import type {AppUser} from '../models/User';
import type {Donation,PaymentMethod,PublicDonor} from '../models/Donation';
import {api,assetUrl,json} from './api';
export interface DonationFormData {amount:number;paymentMethod:PaymentMethod;referenceNumber:string;senderName:string;isAnonymous:boolean;receipt:File|null}
export function normalizeReference(v:string){return v.replace(/[^a-zA-Z0-9]/g,'').toUpperCase();}
export const mapDonation=(v:any):Donation=>({id:v.id,campaignId:v.campaign_id||'',campaignTitle:v.campaign_title||'',donorId:v.donor_id||'',donorName:v.donor_name||'',senderName:v.sender_name||'',isAnonymous:!!v.anonymous,amount:Number(v.amount)||0,paymentMethod:v.method||'GCash',referenceNumber:v.reference||'',screenshotUrl:assetUrl(v.receipt_file_id),transactionDate:v.created_at||'',status:v.status==='verified'?'Verified':v.status==='rejected'?'Rejected':'Pending Verification',verifiedBy:'',verificationDate:v.verified_at||'',rejectionReason:v.rejection_reason||''});
export async function createDonation(campaign:Campaign,_donor:AppUser,f:DonationFormData):Promise<string>{
 if(!f.receipt)throw new Error('Payment screenshot or receipt is required.');
 const d=new FormData();d.append('data',json({amount:f.amount,method:f.paymentMethod,reference:normalizeReference(f.referenceNumber),senderName:f.senderName,anonymous:f.isAnonymous}));d.append('receipt',f.receipt);
 const r=await api<{id:string}>(`/campaigns/${campaign.id}/donations`,{method:'POST',body:d});return r.id;
}
export async function getMyDonations(_uid:string){return (await api<any[]>('/me/donations')).map(mapDonation);}
export async function getDonation(id:string){try{return mapDonation(await api(`/me/donations/${encodeURIComponent(id)}`));}catch{return null;}}
export async function getPublicDonors(id:string):Promise<PublicDonor[]>{const r=await api<any>(`/campaigns/${id}/transparency`);return (r.donors||[]).map((d:any)=>({id:d.id,donorName:d.donor_name||'Anonymous',amount:Number(d.amount)||0,verifiedAt:d.verified_at}));}
export async function getAllDonations(){return (await api<any[]>('/admin/donations')).map(mapDonation);}
export async function verifyDonation(d:Donation,_admin:string){await api(`/admin/donations/${d.id}`,{method:'PATCH',body:json({action:'verify',evidenceChecked:true})});}
export async function rejectDonation(d:Donation,_admin:string,reason:string){await api(`/admin/donations/${d.id}`,{method:'PATCH',body:json({action:'reject',reason})});}

export async function getOrganizerCampaignDonations(campaignId:string):Promise<Donation[]>{return (await api<any[]>(`/campaigns/${encodeURIComponent(campaignId)}/donations`)).map((v:any)=>mapDonation({...v,campaign_id:campaignId}));}
export async function reviewOrganizerDonation(campaignId:string,donation:Donation,action:'verify'|'reject',reason=''){await api(`/campaigns/${encodeURIComponent(campaignId)}/donations/${encodeURIComponent(donation.id)}/review`,{method:'PATCH',body:json({action,evidenceChecked:action==='verify',reason})});}
