<template>
  <ion-page class="finance-page">
    <ion-header class="rg-header">
      <ion-toolbar class="rg-toolbar">
        <div class="nav-inner">
          <router-link to="/dashboard" class="brand">Relief<span>GO</span><sup>♥</sup></router-link>
          <router-link to="/organizer/campaigns" class="back"><ion-icon :icon="arrowBackOutline" /> BACK TO MY CAMPAIGNS</router-link>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content class="rg-content">
      <main class="page-wrapper">
        <section class="hero">
          <div><p class="eyebrow">RELIEFGO · ORGANIZER FINANCES</p><h1>Donations &amp; <em>Expenses.</em></h1><p>Only the creator of this campaign can verify its donations and review expenses. Every decision is recorded in the platform audit logs.</p></div>
          <div class="hero-identity"><ion-icon :icon="shieldCheckmarkOutline" /><div><strong>Campaign Organizer</strong><small>Restricted financial reviews</small></div></div>
        </section>
        <section v-if="loading" class="state"><ion-spinner name="crescent" /><p>Loading your campaign financial records...</p></section>
        <section v-else-if="error" class="state error" role="alert"><ion-icon :icon="alertCircleOutline" /><h2>Unable to open this campaign</h2><p>{{ error }}</p><router-link to="/organizer/campaigns" class="btn primary">My Campaigns</router-link></section>
        <template v-else-if="campaign">
          <div class="campaign-identity"><div><p class="eyebrow dark">YOUR CAMPAIGN · {{ campaign.status }}</p><h2>{{ campaign.title }}</h2><p>Submitted by {{ campaign.organizerName }}</p></div><router-link :to="`/organizer/campaigns/${campaign.id}/expenses`" class="btn outline">Expense History <ion-icon :icon="arrowForwardOutline" /></router-link></div>
          <section class="stats" aria-label="Your campaign financial summary">
            <button class="stat" type="button" @click="section='donations'"><ion-icon :icon="heartOutline" /><span>VERIFIED DONATIONS</span><strong>{{ formatPeso(verifiedDonationTotal) }}</strong><small>Confirmed giving for this campaign</small></button>
            <button class="stat attention" type="button" @click="section='donations'"><ion-icon :icon="timeOutline" /><span>DONATIONS TO VERIFY</span><strong>{{ pendingDonations.length }}</strong><small>Requires matching payment reference</small></button>
            <button class="stat attention" type="button" @click="section='expenses'"><ion-icon :icon="receiptOutline" /><span>EXPENSES TO REVIEW</span><strong>{{ pendingExpenses.length }}</strong><small>Review supporting evidence</small></button>
            <button class="stat" type="button" @click="section='expenses'"><ion-icon :icon="walletOutline" /><span>APPROVED EXPENSES</span><strong>{{ formatPeso(approvedExpenseTotal) }}</strong><small>Verified and included in reports</small></button>
          </section>
          <div class="section-heading"><div><p class="eyebrow dark">CAMPAIGN FINANCIAL REVIEW</p><h2>Manage <em>records.</em></h2></div><button class="btn outline" type="button" :disabled="refreshing" @click="load"><ion-icon :icon="refreshOutline" /> Refresh</button></div>
          <ion-segment v-model="section" class="tabs"><ion-segment-button value="donations"><ion-label>Donations ({{ donations.length }})</ion-label></ion-segment-button><ion-segment-button value="expenses"><ion-label>Expenses ({{ expenses.length }})</ion-label></ion-segment-button></ion-segment>
          <div class="guide" v-if="section==='donations'"><strong>Verify payments only after confirming receipt.</strong> Check the payment screenshot, sender, transaction reference and exact amount against your own GCash/Maya/bank transaction history. A screenshot alone is not proof that funds arrived.</div>
          <div class="guide" v-else><strong>Review expenditure evidence.</strong> Match the receipt, amount and photo of actual use. Approved expenses cannot exceed verified donations. Because you submit and review your own expenses, approval is recorded for administrator oversight.</div>
          <div v-if="section==='donations'" class="list">
            <div v-if="donations.length===0" class="state"><ion-icon :icon="heartOutline" /><h3>No donations yet.</h3><p>Donations submitted to this campaign appear here.</p></div>
            <article v-for="donation in sortedDonations" :key="donation.id" class="record-card">
              <div class="card-heading"><div><p class="eyebrow dark">DONATION · {{ donation.paymentMethod }}</p><h3>{{ formatPeso(donation.amount) }}</h3><p>{{ donation.campaignTitle || campaign.title }}</p></div><ion-chip :color="donationStatusColor(donation.status)">{{ donation.status }}</ion-chip></div>
              <div class="detail-grid"><div><span>TRANSACTION REFERENCE</span><strong>{{ donation.referenceNumber }}</strong></div><div><span>SENDER / ACCOUNT NAME</span><strong>{{ donation.senderName }}</strong></div><div><span>SUBMITTED</span><strong>{{ formatDate(donation.transactionDate) }}</strong></div><div><span>PAYMENT METHOD</span><strong>{{ donation.paymentMethod }}</strong></div></div>
              <p v-if="donation.rejectionReason" class="reason">Rejected: {{ donation.rejectionReason }}</p>
              <div class="actions"><button class="btn outline" :disabled="!donation.screenshotUrl" type="button" @click="showProof(donation.screenshotUrl,'Donation payment proof')"><ion-icon :icon="documentTextOutline" /> View payment proof</button>
                <template v-if="donation.status==='Pending Verification'"><button class="btn primary" type="button" :disabled="busyId===donation.id" @click="verifyDonationRecord(donation)"><ion-icon :icon="checkmarkCircleOutline" /> Verify donation</button><button class="btn danger" type="button" :disabled="busyId===donation.id" @click="rejectDonationRecord(donation)">Reject</button></template>
              </div>
            </article>
          </div>
          <div v-else class="list">
            <div v-if="expenses.length===0" class="state"><ion-icon :icon="receiptOutline" /><h3>No expenses yet.</h3><p>Submit an expense from your campaign expenses page.</p><router-link class="btn primary" :to="`/organizer/campaigns/${campaign.id}/expenses`">View expenses</router-link></div>
            <article v-for="expense in sortedExpenses" :key="expense.id" class="record-card">
              <div class="card-heading"><div><p class="eyebrow dark">EXPENSE · {{ expense.category }}</p><h3>{{ formatPeso(expense.amount) }}</h3><p>{{ expense.description }}</p></div><ion-chip :color="expenseStatusColor(expense.status)">{{ expense.status }}</ion-chip></div>
              <div class="detail-grid"><div><span>EXPENSE DATE</span><strong>{{ formatDate(expense.expenseDate) }}</strong></div><div><span>CATEGORY</span><strong>{{ expense.category }}</strong></div></div>
              <p v-if="expense.rejectionReason" class="reason">Rejected: {{ expense.rejectionReason }}</p>
              <div class="actions">
                <button v-for="doc in expense.documents" :key="doc.url" type="button" class="btn outline" @click="showProof(doc.url,doc.label||doc.type)"><ion-icon :icon="documentTextOutline" /> {{ doc.label || doc.type }}</button>
                <template v-if="expense.status==='Pending Review'"><button class="btn primary" type="button" :disabled="busyId===expense.id" @click="verifyExpenseRecord(expense)"><ion-icon :icon="checkmarkCircleOutline" /> Approve expense</button><button class="btn danger" type="button" :disabled="busyId===expense.id" @click="rejectExpenseRecord(expense)">Reject</button></template>
              </div>
            </article>
          </div>
          <section v-if="previewUrl || previewLoading || previewError" class="preview-card" aria-label="Private financial evidence preview">
            <div class="preview-title"><h3>{{ previewName }}</h3><button type="button" class="btn outline" @click="clearPreview">Close preview</button></div>
            <p v-if="previewLoading">Loading private proof securely...</p><p v-if="previewError" class="reason">{{ previewError }}</p>
            <img v-if="previewUrl && previewType.startsWith('image/')" :src="previewUrl" :alt="previewName" />
            <iframe v-if="previewUrl && previewType==='application/pdf'" :src="previewUrl" :title="previewName" />
          </section>
        </template>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonContent, IonIcon, IonSpinner, IonChip, IonSegment, IonSegmentButton, IonLabel, onIonViewWillEnter } from '@ionic/vue';
import { arrowBackOutline, arrowForwardOutline, shieldCheckmarkOutline, heartOutline, timeOutline, receiptOutline, walletOutline, refreshOutline, documentTextOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { apiSession } from '../services/api';
import { getCampaignRecord } from '../services/campaignService';
import { getOrganizerCampaignDonations, reviewOrganizerDonation } from '../services/donationService';
import { getMyExpensesForCampaign, reviewOrganizerExpense } from '../services/expenseService';
import type { Campaign } from '../models/Campaign';
import type { Donation } from '../models/Donation';
import type { Expense } from '../models/Expense';
import { formatDate, formatPeso } from '../utils/format';
import { donationStatusColor, expenseStatusColor, askReason, confirmAction, showToast } from '../utils/ui';
const route=useRoute();
const campaign=ref<Campaign|null>(null),donations=ref<Donation[]>([]),expenses=ref<Expense[]>([]);
const loading=ref(true),refreshing=ref(false),error=ref(''),busyId=ref(''),section=ref('donations');
const previewUrl=ref(''),previewType=ref(''),previewName=ref(''),previewError=ref(''),previewLoading=ref(false);
const verifiedDonationTotal=computed(()=>donations.value.filter(d=>d.status==='Verified').reduce((sum,d)=>sum+d.amount,0));
const pendingDonations=computed(()=>donations.value.filter(d=>d.status==='Pending Verification'));
const pendingExpenses=computed(()=>expenses.value.filter(e=>e.status==='Pending Review'));
const approvedExpenseTotal=computed(()=>expenses.value.filter(e=>e.status==='Verified').reduce((sum,e)=>sum+e.amount,0));
const sortedDonations=computed(()=>[...donations.value].sort((a,b)=>Number(b.status==='Pending Verification')-Number(a.status==='Pending Verification')));
const sortedExpenses=computed(()=>[...expenses.value].sort((a,b)=>Number(b.status==='Pending Review')-Number(a.status==='Pending Review')));
async function load(){
  refreshing.value=true;error.value='';
  try {
    const id=String(route.params.id);
    const item=await getCampaignRecord(id);
    if(!item||!currentUser.value||item.organizerId!==currentUser.value.uid)throw new Error('Only the organizer who created this campaign can review its financial records.');
    if(item.type==='volunteer_event')throw new Error('Financial review applies to fundraising campaigns.');
    // These endpoints also enforce campaign ownership on the server.
    const [donationRecords,expenseRecords]=await Promise.all([getOrganizerCampaignDonations(id),getMyExpensesForCampaign(currentUser.value.uid,id)]);
    campaign.value=item;donations.value=donationRecords;expenses.value=expenseRecords;
  }catch(e){error.value=e instanceof Error?e.message:'Could not load campaign finances.';}
  finally{loading.value=false;refreshing.value=false;}
}
onIonViewWillEnter(()=>{loading.value=true;void load();});
function clearPreview(){if(previewUrl.value)URL.revokeObjectURL(previewUrl.value);previewUrl.value='';previewType.value='';previewError.value='';previewLoading.value=false;}
onBeforeUnmount(clearPreview);
async function showProof(url:string,label:string){
  clearPreview();previewName.value=label;previewLoading.value=true;
  try{
    const response=await fetch(url,{headers:{Authorization:`Bearer ${apiSession.token}`}});
    if(!response.ok)throw new Error('Cannot open this private proof.');
    previewType.value=response.headers.get('Content-Type')?.split(';')[0]||'';
    previewUrl.value=URL.createObjectURL(await response.blob());
  }catch(e){previewError.value=e instanceof Error?e.message:'Cannot preview proof.';}
  finally{previewLoading.value=false;}
}
async function act(id:string,fn:()=>Promise<void>,message:string){
  if(busyId.value)return;busyId.value=id;
  try{await fn();await load();await showToast(message);}catch(e){await showToast(e instanceof Error?e.message:'Unable to save review.','danger');}finally{busyId.value='';}
}
async function verifyDonationRecord(d:Donation){
  if(!campaign.value)return;
  if(!await confirmAction('Verify donation',`Have you checked your actual ${d.paymentMethod} records and confirmed that ${formatPeso(d.amount)} was received under reference ${d.referenceNumber}, and that the screenshot matches?`,'Verify'))return;
  await act(d.id,()=>reviewOrganizerDonation(campaign.value!.id,d,'verify'),'Donation verified.');
}
async function rejectDonationRecord(d:Donation){
  if(!campaign.value)return;const reason=await askReason('Reject donation','Enter the reason for rejection. The donor will be notified.','Reject');if(!reason)return;
  await act(d.id,()=>reviewOrganizerDonation(campaign.value!.id,d,'reject',reason),'Donation rejected.');
}
async function verifyExpenseRecord(e:Expense){
  if(!campaign.value)return;
  if(!await confirmAction('Approve expense',`Have you checked BOTH the purchase receipt and actual-use proof for ${formatPeso(e.amount)}, confirmed no private information will be exposed, and verified sufficient funds are available? This action will appear in admin audit logs.`,'Approve'))return;
  await act(e.id,()=>reviewOrganizerExpense(campaign.value!.id,e,'verify'),'Expense approved.');
}
async function rejectExpenseRecord(e:Expense){
  if(!campaign.value)return;const reason=await askReason('Reject expense','Why is this expense being rejected? Enter a reason.','Reject');if(!reason)return;
  await act(e.id,()=>reviewOrganizerExpense(campaign.value!.id,e,'reject',reason),'Expense rejected.');
}
</script>

<style scoped>
.finance-page{--forest:#173729;--deep:#112b20;--terracotta:#be563b;--gold:#f3b75d;font-family:'DM Sans',Arial,sans-serif;color:var(--forest)}.rg-header{box-shadow:none}.rg-header::after{display:none}.rg-toolbar{--background:#fbf0dc;--min-height:72px}.nav-inner{width:min(1390px,calc(100% - 48px));margin:auto;display:flex;justify-content:space-between;align-items:center;gap:15px;min-height:72px}.brand{font:700 34px Georgia,serif;letter-spacing:-1.7px;color:var(--forest);text-decoration:none}.brand span,.brand sup{color:var(--terracotta)}.brand sup{font-size:12px}.back{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:800;letter-spacing:.7px;color:var(--forest);text-decoration:none}.rg-content{--background:#fbf0dc}.page-wrapper{width:min(1370px,calc(100% - 48px));margin:auto;padding:23px 0 75px}.hero{background:linear-gradient(110deg,#173729,#112b20);border-radius:22px;color:#fffaf0;padding:43px 47px;display:flex;justify-content:space-between;align-items:center;gap:25px}.eyebrow{margin:0 0 8px;font-size:10px;font-weight:850;letter-spacing:1.7px;color:#f3b75d}.eyebrow.dark{color:#b65b3c}.hero h1{font:normal clamp(37px,4vw,58px) Georgia,serif;margin:6px 0 13px}.hero h1 em,.section-heading h2 em{color:#f3b75d;font-weight:normal}.hero p:last-child{color:#d9e1d6;line-height:1.7;font-size:13px;max-width:630px}.hero-identity{display:flex;align-items:center;gap:12px;background:#ffffff16;border:1px solid #ffffff22;border-radius:16px;padding:19px 24px;flex:none}.hero-identity ion-icon{font-size:28px;color:#f3b75d}.hero-identity strong{display:block;font:22px Georgia,serif}.hero-identity small{display:block;margin-top:5px;font-size:10px;color:#d9e1d6}.campaign-identity{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:25px 0}.campaign-identity h2{font:normal 30px Georgia,serif;margin:3px 0;color:var(--forest)}.campaign-identity p:last-child{font-size:12px;color:#6e786f;margin:8px 0}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.stat{text-align:left;display:flex;flex-direction:column;align-items:flex-start;border:1px solid #e7dac3;border-radius:16px;background:#fffaf0;padding:23px 19px;color:var(--forest);cursor:pointer;transition:transform .15s}.stat:hover{transform:translateY(-2px)}.stat.attention{background:#fff5df}.stat ion-icon{color:#be563b;font-size:24px;margin-bottom:16px}.stat span{color:#a45538;font-size:9px;line-height:1.5;font-weight:900;letter-spacing:1.1px;min-height:27px}.stat strong{font:normal clamp(23px,2.5vw,34px) Georgia,serif;margin:7px 0;overflow-wrap:anywhere}.stat small{font-size:10px;line-height:1.6;color:#697568}.section-heading{display:flex;justify-content:space-between;align-items:center;gap:15px;margin:36px 0 16px}.section-heading h2{font:normal 39px Georgia,serif;margin:6px 0}.section-heading h2 em{color:#be563b}.tabs{--background:#eee5d1;background:#eee5d1;border-radius:14px;padding:5px;max-width:540px;margin-bottom:17px}.tabs ion-segment-button{--color:#325241;--color-checked:#173729;--indicator-color:#fffaf0;--border-radius:11px;font-weight:850;text-transform:none}.guide{background:#fff1d4;border:1px solid #ecd3a5;border-radius:14px;color:#6b5731;line-height:1.7;padding:17px 19px;font-size:12px;margin-bottom:21px}.guide strong{display:block;color:#4f452b}.list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.record-card{background:#fffaf0;border:1px solid #e7dac3;border-radius:18px;padding:25px;min-width:0}.card-heading{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}.card-heading h3{font:normal 32px Georgia,serif;margin:4px 0 9px;color:var(--forest);overflow-wrap:anywhere}.card-heading p:last-child{font-size:12px;color:#66766b;line-height:1.5;margin:0}.card-heading ion-chip{flex:none;font-size:11px}.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;margin-top:20px;padding:17px;background:#f7f0e1;border-radius:13px}.detail-grid span{display:block;font-size:9px;color:#a45538;letter-spacing:.8px;font-weight:900;margin-bottom:7px}.detail-grid strong{font-size:12px;color:#193d2c;overflow-wrap:anywhere}.actions{display:flex;gap:9px;align-items:center;flex-wrap:wrap;border-top:1px solid #e9ddca;margin-top:20px;padding-top:17px}.btn{display:inline-flex;gap:8px;align-items:center;justify-content:center;border-radius:999px;padding:10px 17px;min-height:39px;border:1px solid transparent;cursor:pointer;font-weight:850;font-size:11px;text-decoration:none;line-height:1.5;font-family:'DM Sans',Arial,sans-serif}.btn.primary{color:#fffaf0;background:#173729}.btn.outline{color:#173729;border-color:#173729;background:transparent}.btn.danger{color:#b24333;border-color:#b24333;background:#fffaf0}.btn:hover:not(:disabled){filter:brightness(1.13)}.btn:disabled{opacity:.45;cursor:default}.reason{background:#fff0e7;padding:11px 13px;color:#ad4937;border-radius:10px;font-size:12px;line-height:1.5}.state{grid-column:1/-1;background:#fffaf0;border:1px solid #e7dac3;border-radius:17px;padding:60px 20px;text-align:center;color:#697568;font-size:13px}.state>ion-icon{font-size:35px;color:#be563b}.state h2,.state h3{font:normal 30px Georgia,serif;color:#173729}.state.error{color:#ac4732}.preview-card{margin-top:23px;background:#fffaf0;border:1px solid #e7dac3;padding:22px;border-radius:17px}.preview-title{display:flex;justify-content:space-between;align-items:center;gap:10px}.preview-title h3{font:normal 25px Georgia,serif}.preview-card img{max-height:720px;max-width:100%;display:block;margin:auto}.preview-card iframe{width:100%;height:680px;border:0}
@media(max-width:1080px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.hero{flex-direction:column;align-items:flex-start;padding:30px}.hero-identity{width:100%}.list{grid-template-columns:1fr}.campaign-identity{flex-direction:column;align-items:flex-start}.section-heading h2{font-size:33px}}@media(max-width:490px){.nav-inner,.page-wrapper{width:calc(100% - 26px)}.brand{font-size:27px}.back{font-size:9px}.stats{gap:9px}.stat{padding:17px 12px}.stat strong{font-size:23px}.stat span{font-size:8px}.record-card{padding:18px}.detail-grid{grid-template-columns:1fr}.hero h1{font-size:38px}}
</style>
