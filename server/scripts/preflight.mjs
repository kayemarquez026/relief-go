import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../..');
const must=['src/views/AdminDashboardPage.vue','src/views/DonationDetailsPage.vue','src/views/CreateCampaignPage.vue','src/views/CampaignDetailsPage.vue','src/views/CampaignListPage.vue','server/sql/001_init.sql','server/src/index.js','server/src/validation.js'];
for(const file of must){if(!existsSync(join(root,file)))throw new Error('Missing: '+file);}
const api=readFileSync(join(root,'server/src/index.js'),'utf8');
const app=readFileSync(join(root,'src/services/api.ts'),'utf8');
const sql=readFileSync(join(root,'server/sql/001_init.sql'),'utf8');
for(const token of ['campaign_proof','payment_receipt','expense_proof','audit_logs']){if(!api.includes(token)||!sql.includes(token))throw new Error('Missing proof or flow reference: '+token);}
if(!api.includes('FROM volunteers')||!readFileSync(join(root,'server/sql/003_required_campaign_and_volunteer_evidence.sql'),'utf8').includes('RENAME TO volunteers'))throw new Error('Missing migrated volunteers table');
if(/from ['"]firebase|from ['"]@firebase/.test(api+app))throw new Error('Firebase import found in new runtime');
for(const view of readdirSync(join(root,'src/views')).filter(x=>x.endsWith('.vue'))){const content=readFileSync(join(root,'src/views',view),'utf8');if(!content.includes('<template')||!content.includes('</template>')||!content.includes('<script setup lang="ts">'))throw new Error('Malformed view structure: '+view);}
console.log('Preflight checks passed: required source, proof flows, and no Firebase runtime import.');
console.log('NOTE: This checks file presence, NOT Vue compilation, API integration, database or security.');
