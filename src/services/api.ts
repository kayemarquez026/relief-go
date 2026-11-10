/** PostgreSQL Express API client. Firebase is not used anywhere in this project. */
export interface APIUser { id:string; name:string; email:string; phone:string; role:'donor'|'organizer'|'admin'; is_suspended?:boolean; created_at?:string }
const KEY='reliefgo_pg_token';
const ROOT=(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/,'');
export const apiSession={ token:localStorage.getItem(KEY)||'' };
export function setToken(token:string){apiSession.token=token;localStorage.setItem(KEY,token);}
export function clearToken(){apiSession.token='';localStorage.removeItem(KEY);}
export async function api<T=any>(path:string,options:RequestInit={}):Promise<T>{
 const headers=new Headers(options.headers);
 if(apiSession.token)headers.set('Authorization',`Bearer ${apiSession.token}`);
 if(options.body && !(options.body instanceof FormData))headers.set('Content-Type','application/json');
 let resp:Response;
 try {resp=await fetch(`${ROOT}${path}`,{...options,headers});}catch {throw new Error('Cannot connect to ReliefGO API. Check the Express backend URL and database connection.');}
 const body=await resp.json().catch(()=>({}));
 if(!resp.ok) {if(resp.status===401)clearToken(); throw new Error(body.error||`Server error (${resp.status})`);}
 return body as T;
}
export const json=(data:unknown)=>JSON.stringify(data);
export const assetUrl=(id?:string|null)=>id?`${ROOT}/files/${id}`:'';
export const goodFile=(file:File|null|undefined)=>Boolean(file && file.size>0 && file.size<=8*1024*1024 && ['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type));
export async function viewPrivateProof(fileId:string){
 const resp=await fetch(`${ROOT}/files/${fileId}`,{headers:{Authorization:`Bearer ${apiSession.token}`}});
 if(!resp.ok)throw new Error('You cannot access this private proof.');
 const blob=await resp.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='reliefgo-private-evidence';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
