import type {AppUser} from '../models/User';
import type {Campaign,CampaignCategory} from '../models/Campaign';
import {api,assetUrl,json} from './api';

export interface CampaignFormData {
 title:string;description:string;category:CampaignCategory;beneficiaryName:string;beneficiaryInfo:string;imageUrl:string;goalAmount:number;startDate:string;deadline:string;locationAddress:string;latitude:number|null;longitude:number|null;
 type:'fundraiser'|'volunteer_event';volunteerDuties:string;volunteerRequirements:string;volunteerDate:string;volunteerSlots:number;contactPhone:string;payoutMethod:'GCash'|'Maya'|'Bank Transfer';payoutName:string;payoutNumber:string;
 needsVolunteers?:boolean;volunteerHelpCategory?:string;
 validId:File|null;barangayClearance:File|null;situationPhoto:File|null;eligibilityProof:File|null;cover:File|null;
}

function mapCampaign(v:any):Campaign{
 const statuses:Record<string,Campaign['status']>={pending:'Pending Approval',approved:'Active',rejected:'Rejected',paused:'Suspended',closed:'Completed'};
 const isEvent=v.type==='volunteer_event';
 const needsVolunteers=typeof v.needs_volunteers==='boolean'?v.needs_volunteers:(isEvent&&Number(v.volunteer_slots||0)>0);
 return {
  id:v.id,organizerId:v.organizer_id||'',organizerName:v.organizer_name||'',title:v.title||'',description:v.description||'',category:v.category||'Other',beneficiaryName:v.beneficiary||'',beneficiaryInfo:v.beneficiary_relation||'',imageUrl:assetUrl(v.cover_file_id)||'',goalAmount:Number(v.goal)||0,
  startDate:String(v.start_date||v.created_at||'').slice(0,10),deadline:String(v.deadline||v.volunteer_date||'2099-12-31').slice(0,10),status:statuses[v.status]||'Pending Approval',locationAddress:v.city||'',latitude:v.latitude==null?null:Number(v.latitude),longitude:v.longitude==null?null:Number(v.longitude),
  createdAt:v.created_at||'',verifiedTotal:Number(v.raised)||0,verifiedDonorCount:Number(v.verified_donor_count)||0,rejectionReason:v.rejection_reason||'',reviewedBy:'',reviewedAt:v.reviewed_at||'',
  payoutMethod:v.payout_method||'',payoutName:v.payout_name||'',payoutNumber:v.payout_number||'',contactPhone:v.contact_phone||'',type:v.type||'fundraiser',
  needsVolunteers,volunteerHelpCategory:needsVolunteers?(v.volunteer_help_category||''):'',
  volunteerDate:v.volunteer_date||'',volunteerSlots:Number(v.volunteer_slots)||0,volunteerDuties:v.volunteer_duties||'',volunteerRequirements:v.volunteer_requirements||'',volunteerCount:Number(v.volunteer_count)||0,
  coverFileId:v.cover_file_id,validIdFileId:v.valid_id_file_id,barangayClearanceFileId:v.barangay_clearance_file_id,eligibilityProofFileId:v.eligibility_proof_file_id,situationPhotoFileId:v.situation_photo_file_id
 } as Campaign;
}

export const mapCampaignRecord=mapCampaign;

export interface CampaignQuery {q?:string;category?:string;city?:string;minGoal?:string;maxGoal?:string;status?:string}

export async function getPublicCampaigns(filters:CampaignQuery={}):Promise<Campaign[]>{const qp=new URLSearchParams({limit:'50'});for(const [key,value] of Object.entries(filters))if(value&&value!=='All'&&value!=='all')qp.set(key,key==='status'?value==='Active'?'active':value==='Completed'?'completed':value:value);const r=await api<any[]>(`/campaigns?${qp.toString()}`);return r.map(mapCampaign);}

export async function getCampaignById(id:string):Promise<Campaign|null>{try{return mapCampaign(await api(`/campaigns/${encodeURIComponent(id)}`));}catch(e){if(String(e).includes('404'))return null;throw e;}}

export async function getMyCampaigns(_uid:string):Promise<Campaign[]>{return (await api<any[]>('/me/campaigns')).map(mapCampaign);}

export async function getCampaignRecord(id:string):Promise<Campaign|null>{return getCampaignById(id);}

function payload(f:CampaignFormData){
 const isEvent=f.type==='volunteer_event';
 const needsVolunteers=f.needsVolunteers??(isEvent&&f.volunteerSlots>0);
 return {
  type:f.type,title:f.title,description:f.description,category:f.category,city:f.locationAddress,beneficiary:f.beneficiaryName,beneficiaryRelation:f.beneficiaryInfo,
  goal:isEvent?0:f.goalAmount,contactPhone:f.contactPhone,startDate:f.startDate,deadline:isEvent?undefined:f.deadline,latitude:f.latitude,longitude:f.longitude,
  payoutMethod:isEvent?undefined:f.payoutMethod,payoutName:isEvent?undefined:f.payoutName,payoutNumber:isEvent?undefined:f.payoutNumber,
  budget:isEvent?[]:[{item:'Campaign needs and relief assistance',estimated:f.goalAmount}],
  needsVolunteers,
  volunteerHelpCategory:needsVolunteers?(f.volunteerHelpCategory||''):undefined,
  volunteerDuties:needsVolunteers?f.volunteerDuties:undefined,
  volunteerRequirements:needsVolunteers?f.volunteerRequirements:undefined,
  volunteerLocation:(needsVolunteers||isEvent)?f.locationAddress:undefined,
  volunteerDate:(needsVolunteers||isEvent)?f.volunteerDate:undefined,
  volunteerSlots:needsVolunteers?f.volunteerSlots:(isEvent?0:undefined)
 };
}

function multipart(f:CampaignFormData,edit=false){const data=new FormData();data.append('data',json(payload(f)));for(const [key,file] of Object.entries({validId:f.validId,barangayClearance:f.barangayClearance,situationPhoto:f.situationPhoto,eligibilityProof:f.eligibilityProof,cover:f.cover}))if(file)data.append(key,file);return data;}

export async function createCampaign(f:CampaignFormData,_organizer:AppUser):Promise<string>{const r=await api<{id:string}>('/campaigns',{method:'POST',body:multipart(f)});return r.id;}

export async function updateCampaign(existing:Campaign,f:CampaignFormData):Promise<void>{await api(`/campaigns/${existing.id}`,{method:'PATCH',body:multipart(f,true)});}

export async function getAllCampaigns():Promise<Campaign[]>{return (await api<any[]>('/admin/campaigns')).map(mapCampaign);}

export async function suspendCampaign(c:Campaign,_adminUid:string,reason:string):Promise<void>{await api(`/admin/campaigns/${c.id}`,{method:'PATCH',body:json({action:'reject',reason})});}

export async function reinstateCampaign(c:Campaign,_adminUid:string):Promise<void>{await api(`/admin/campaigns/${c.id}`,{method:'PATCH',body:json({action:'approve',evidenceChecked:true})});}

export async function getRejectedCampaigns():Promise<Campaign[]>{try{return (await api<any[]>('/campaigns?status=rejected&limit=50')).map(mapCampaign);}catch(e){if(String(e).includes('sign in'))return [];throw e;}}
/** Admin confirms event/campaign completion; organizers cannot change this status. */
export async function setAdminCampaignCompletion(id:string,completed:boolean){await api(`/admin/campaigns/${encodeURIComponent(id)}/status`,{method:'PATCH',body:json({status:completed?'closed':'approved'})});}

/** Only draft/rejected campaigns with no linked activity can be permanently deleted. */
export async function deleteMyCampaign(id: string): Promise<void> {
  await api(`/campaigns/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
