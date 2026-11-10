import type {Expense,ExpenseCategory,ExpenseDocument,PublicExpense} from '../models/Expense';
import type {Campaign} from '../models/Campaign';
import type {AppUser} from '../models/User';
import {api,assetUrl,json} from './api';
export interface ExpenseFormData{description:string;amount:number;category:ExpenseCategory;expenseDate:string;documents:ExpenseDocument[];purchaseReceipt:File|null;actualUseProof:File|null}
export const mapExpense=(v:any):Expense=>({id:v.id,campaignId:v.campaign_id||'',campaignTitle:v.campaign_title||'',organizerId:v.organizer_id||'',organizerName:v.organizer_name||'',description:v.description||'',amount:Number(v.amount)||0,category:v.category||'Other',expenseDate:String(v.spent_at||'').slice(0,10),documents:[...(v.proof_file_id?[{type:'Receipt' as const,url:assetUrl(v.proof_file_id),label:'Purchase receipt'}]:[]),...(v.impact_file_id?[{type:'Photo of goods' as const,url:assetUrl(v.impact_file_id),label:'Actual delivery/use proof'}]:[])],status:v.status==='verified'?'Verified':v.status==='rejected'?'Rejected':'Pending Review',createdAt:v.created_at||'',reviewedBy:'',reviewDate:v.reviewed_at||'',rejectionReason:v.rejection_reason||''});
function data(f:ExpenseFormData){const d=new FormData();d.append('data',json({description:f.description,amount:f.amount,category:f.category,spentAt:f.expenseDate,publicSafe:true}));if(f.purchaseReceipt)d.append('proof',f.purchaseReceipt);if(f.actualUseProof)d.append('impactProof',f.actualUseProof);return d;}
export async function createExpense(c:Campaign,_u:AppUser,f:ExpenseFormData){await api(`/campaigns/${c.id}/expenses`,{method:'POST',body:data(f)});}
export async function updateExpense(e:Expense,f:ExpenseFormData){await api(`/expenses/${e.id}`,{method:'PATCH',body:data(f)});}
export async function getMyExpensesForCampaign(_uid:string,cid:string){return (await api<any[]>(`/campaigns/${cid}/expenses`)).map(mapExpense);}
export async function getExpense(id:string){const campaigns=await api<any[]>('/me/campaigns');for(const c of campaigns){const items=await api<any[]>(`/campaigns/${c.id}/expenses`);const found=items.find((i:any)=>i.id===id);if(found)return mapExpense(found);}return null;}
export async function getPublicExpenses(id:string):Promise<PublicExpense[]>{const r=await api<any>(`/campaigns/${id}/transparency`);return (r.expenses||[]).map((e:any)=>({...mapExpense(e),verifiedAt:e.reviewed_at||''}));}
export async function getAllExpenses(){return (await api<any[]>('/admin/expenses')).map(mapExpense);}
export async function verifyExpense(e:Expense,_admin:string){await api(`/admin/expenses/${e.id}`,{method:'PATCH',body:json({action:'verify',evidenceChecked:true})});}
export async function rejectExpense(e:Expense,_admin:string,reason:string){await api(`/admin/expenses/${e.id}`,{method:'PATCH',body:json({action:'reject',reason})});}

export async function reviewOrganizerExpense(campaignId:string,expense:Expense,action:'verify'|'reject',reason=''){await api(`/campaigns/${encodeURIComponent(campaignId)}/expenses/${encodeURIComponent(expense.id)}/review`,{method:'PATCH',body:json({action,evidenceChecked:action==='verify',reason})});}
