<template>
  <ion-page class="detail-page">
    <!-- Mobile menu with the same admin navigation used on the dashboard. -->
    <ion-menu v-if="$route.name === 'AdminCampaignDetails'"
      content-id="details-admin-main"
      menu-id="details-admin-menu"
      type="overlay"
      side="start"
      class="details-admin-menu"
    >
      <ion-header>
        <ion-toolbar class="menu-toolbar">
          <div class="menu-heading">
            <span class="menu-brand">Relief<span>GO</span><sup>♥</sup></span>
            <small>ADMINISTRATION</small>
          </div>
        </ion-toolbar>
      </ion-header>
      <ion-content class="menu-content">
        <div class="mobile-menu-body">
          <div class="menu-profile">
            <span class="menu-avatar">{{ initials }}</span>
            <div>
              <span>ADMINISTRATOR ACCOUNT</span>
              <strong>{{ adminName }}</strong>
            </div>
          </div>
          <p class="menu-label">MANAGEMENT TOOLS</p>
          <ion-list lines="none" class="mobile-nav">
            <ion-menu-toggle :auto-hide="true">
              <ion-item button :detail="false" router-link="/admin" class="menu-link">
                <ion-icon slot="start" :icon="barChartOutline" />
                <ion-label>Dashboard</ion-label>
              </ion-item>
            </ion-menu-toggle>
            <ion-menu-toggle :auto-hide="true">
              <ion-item button :detail="false" router-link="/notifications" class="menu-link">
                <ion-icon slot="start" :icon="notificationsOutline" />
                <ion-label>Notifications</ion-label>
              </ion-item>
            </ion-menu-toggle>
            <ion-menu-toggle :auto-hide="true">
              <ion-item button :detail="false" router-link="/admin/campaigns" class="menu-link current-menu-link" aria-current="page">
                <ion-icon slot="start" :icon="megaphoneOutline" />
                <ion-label>Campaign &amp; Events</ion-label>
              </ion-item>
            </ion-menu-toggle>
            <ion-menu-toggle :auto-hide="true">
              <ion-item button :detail="false" router-link="/admin/users" class="menu-link">
                <ion-icon slot="start" :icon="peopleOutline" />
                <ion-label>User Management</ion-label>
              </ion-item>
            </ion-menu-toggle>
            <ion-menu-toggle :auto-hide="true">
              <ion-item button :detail="false" router-link="/admin/reports" class="menu-link">
                <ion-icon slot="start" :icon="barChartOutline" />
                <ion-label>Reports</ion-label>
              </ion-item>
            </ion-menu-toggle>
            <ion-menu-toggle :auto-hide="true">
              <ion-item button :detail="false" router-link="/admin/audit-logs" class="menu-link">
                <ion-icon slot="start" :icon="documentTextOutline" />
                <ion-label>Audit Logs</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
          <div class="mobile-sidebar-bottom">
            <span>Small acts. Big hearts. ✦</span>
            <button type="button" class="rg-sidebar-logout" @click="handleLogout">
              <ion-icon :icon="logOutOutline" aria-hidden="true" /> Log Out
            </button>
          </div>
        </div>
      </ion-content>
    </ion-menu>

    <!-- Desktop: dashboard-matching 266px persistent dark green sidebar. -->
    <aside class="admin-desktop-sidebar" aria-label="Administration sidebar">
      <div class="desktop-brand">
        Relief<span>GO</span><sup>♥</sup>
        <small>ADMINISTRATION</small>
      </div>
      <div class="desktop-profile">
        <span class="menu-avatar">{{ initials }}</span>
        <div><small>ADMINISTRATOR</small><strong>{{ adminName }}</strong></div>
      </div>
      <p class="desktop-nav-title">MANAGEMENT TOOLS</p>
      <nav class="desktop-links" aria-label="Administration links">
        <router-link to="/admin" exact-active-class="desktop-active">
          <ion-icon :icon="barChartOutline" /> Dashboard
        </router-link>
        <router-link to="/notifications" active-class="desktop-active">
          <ion-icon :icon="notificationsOutline" /> Notifications
        </router-link>
        <router-link to="/admin/campaigns" class="desktop-active" aria-current="page">
          <ion-icon :icon="megaphoneOutline" /> Campaign &amp; Events
        </router-link>
        <router-link to="/admin/users" active-class="desktop-active">
          <ion-icon :icon="peopleOutline" /> User Management
        </router-link>
        <router-link to="/admin/reports" active-class="desktop-active">
          <ion-icon :icon="barChartOutline" /> Reports
        </router-link>
        <router-link to="/admin/audit-logs" active-class="desktop-active">
          <ion-icon :icon="documentTextOutline" /> Audit Logs
        </router-link>
      </nav>
      <div class="desktop-sidebar-bottom">
        <span>Small acts. Big hearts. ✦</span>
        <button type="button" class="rg-sidebar-logout" @click="handleLogout">
          <ion-icon :icon="logOutOutline" aria-hidden="true" /> Log Out
        </button>
      </div>
    </aside>

    <div id="details-admin-main" class="ion-page details-admin-main">
      <ion-header class="page-header">
        <ion-toolbar class="toolbar">
          <div class="nav-inner">
            <div class="nav-left">
              <ion-button fill="clear" class="menu-trigger"
                aria-label="Open administration menu" @click="toggleAdminMenu">
                <ion-icon slot="icon-only" :icon="menuOutline" />
              </ion-button>
              <router-link to="/admin" class="brand" aria-label="ReliefGO administrator dashboard">
                Relief<span>GO</span><sup>♥</sup>
              </router-link>
              <span class="nav-divider" aria-hidden="true"></span>
              <span class="nav-page-name">CAMPAIGN DETAILS</span>
            </div>
            <div class="topbar-user" aria-label="Administrator profile">
              <span class="topbar-avatar">{{ initials }}</span>
              <span class="topbar-identity"><strong>{{ adminName }}</strong><small>ADMINISTRATOR</small></span>
            </div>
          </div>
        </ion-toolbar>
      </ion-header>

    <ion-content class="page-content">
      <main class="page-wrap">
        <section class="hero">
          <div>
            <p class="eyebrow">RELIEFGO · ADMIN CAMPAIGN RECORD</p>
            <h1>Campaign <em>Details.</em></h1>
            <p>Organizer credentials, supporting evidence, and event outcome monitoring.</p>
          </div>
          <div class="hero-badge"><ion-icon :icon="shieldCheckmarkOutline" /><span>ADMINISTRATOR<br />RESTRICTED VIEW</span></div>
        </section>
        <div v-if="loading" class="state"><ion-spinner name="crescent" /> Loading organizer submission...</div>
        <div v-else-if="error" class="state error" role="alert">{{ error }}</div>
        <div v-else-if="campaign" class="record">
          <div class="record-heading">
            <div><p class="eyebrow terracotta">SUBMITTED {{ campaign.type === 'volunteer_event' ? 'COMMUNITY EVENT' : 'FUNDRAISING CAMPAIGN' }}</p><h2>{{ campaign.title }}</h2><p>Submitted by <b>{{ campaign.organizerName }}</b> · <span class="status">{{ campaign.status }}</span></p></div>
            <div class="record-buttons">
              <router-link class="btn primary" :to="`/admin/campaigns?campaign=${campaign.id}`"><ion-icon :icon="shieldCheckmarkOutline" /> Review in queue</router-link>
              <button class="btn secondary" type="button" @click="downloadDetails">
                <ion-icon :icon="downloadOutline" aria-hidden="true" /> Export (.docx)
              </button>
              <button class="btn outline" type="button" @click="printDetails">
                <ion-icon :icon="printOutline" aria-hidden="true" /> Print Details
              </button>
              <router-link class="btn primary" to="/admin/campaigns">Back to list</router-link>
            </div>
          </div>
          <div class="record-grid">
            <section class="card">
              <h3><ion-icon :icon="personOutline" /> Organizer &amp; beneficiary</h3>
              <div class="field"><span>ORGANIZER NAME</span><strong>{{ campaign.organizerName || 'Not provided' }}</strong></div>
              <div class="field"><span>CONTACT NUMBER</span><strong>{{ campaign.contactPhone || 'Not provided' }}</strong></div>
              <div class="field"><span>BENEFICIARY / GROUP</span><strong>{{ campaign.beneficiaryName || 'Not provided' }}</strong></div>
              <div class="field"><span>BENEFICIARY RELATION / BACKGROUND</span><p>{{ campaign.beneficiaryInfo || 'Not provided' }}</p></div>
            </section>
            <section class="card">
              <h3><ion-icon :icon="documentTextOutline" /> Campaign information</h3>
              <div class="field"><span>TYPE</span><strong>{{ campaign.type === 'volunteer_event' ? 'Community event' : 'Fundraising campaign' }}</strong></div>
              <div class="field"><span>CATEGORY</span><strong>{{ campaign.category }}</strong></div>
              <div class="field"><span>LOCATION</span><strong>{{ campaign.locationAddress || 'Not provided' }}</strong></div>
              <div class="field"><span>SUBMITTED</span><strong>{{ formatDate(campaign.createdAt) }}</strong></div>
              <div class="field"><span>DESCRIPTION / PURPOSE</span><p>{{ campaign.description || 'Not provided' }}</p></div>
              <div class="field"><span>STATUS</span><strong>{{ campaign.status }}</strong></div>
            </section>
            <section v-if="campaign.type === 'volunteer_event' || campaign.needsVolunteers" class="card" :class="{ 'wide-card': campaign.type === 'volunteer_event' }">
              <h3><ion-icon :icon="calendarOutline" /> Event &amp; volunteer information</h3>
              <div class="field"><span>EVENT DATE</span><strong>{{ campaign.volunteerDate ? formatDate(campaign.volunteerDate) : 'Not provided' }}</strong></div>
              <div class="field"><span>NEEDS VOLUNTEERS</span><strong>{{ campaign.needsVolunteers ? 'Yes' : 'No' }}</strong></div>
              <template v-if="campaign.needsVolunteers">
                <div class="field"><span>ASSISTANCE CATEGORY</span><strong>{{ campaign.volunteerHelpCategory || 'Not provided' }}</strong></div>
                <div class="field"><span>NUMBER OF SLOTS</span><strong>{{ campaign.volunteerSlots || 0 }}</strong></div>
                <div class="field"><span>APPROVED VOLUNTEERS</span><strong>{{ campaign.volunteerCount || 0 }}</strong></div>
                <div class="field"><span>DUTIES</span><p>{{ campaign.volunteerDuties || 'Not provided' }}</p></div>
                <div class="field"><span>REQUIREMENTS</span><p>{{ campaign.volunteerRequirements || 'Not provided' }}</p></div>
              </template>
            </section>
            <section v-if="campaign.type !== 'volunteer_event'" class="card" :class="{ 'wide-card': !campaign.needsVolunteers }">
              <h3><ion-icon :icon="walletOutline" /> Fundraising &amp; payout credentials</h3>
              <div class="field"><span>GOAL</span><strong>{{ formatPeso(campaign.goalAmount) }}</strong></div>
              <div class="field"><span>VERIFIED DONATIONS</span><strong>{{ formatPeso(campaign.verifiedTotal) }}</strong></div>
              <div class="field"><span>START DATE</span><strong>{{ formatDate(campaign.startDate) }}</strong></div>
              <div class="field"><span>DEADLINE</span><strong>{{ formatDate(campaign.deadline) }}</strong></div>
              <div class="field"><span>PAYOUT METHOD</span><strong>{{ campaign.payoutMethod || 'Not provided' }}</strong></div>
              <div class="field"><span>PAYOUT ACCOUNT NAME</span><strong>{{ campaign.payoutName || 'Not provided' }}</strong></div>
              <div class="field"><span>PAYOUT NUMBER</span><strong>{{ campaign.payoutNumber || 'Not provided' }}</strong></div>
            </section>
          </div>

          <section class="card proofs-card">
            <h3><ion-icon :icon="shieldCheckmarkOutline" /> Submitted verification documents</h3>
            <p class="helper">Private organizer evidence. Only the organizer and administrator can access these documents. Select View to preview; Word downloads include document names, not the image/PDF contents.</p>
            <div class="proof-grid">
              <div v-for="proof in proofs" :key="proof.label" class="proof-item">
                <div><strong>{{ proof.label }}</strong><span>{{ proof.id ? 'Document submitted' : 'Not uploaded' }}</span></div>
                <button type="button" class="btn outline" :disabled="!proof.id || previewLoading" @click="showPreview(proof)">View</button>
                <button type="button" class="btn secondary" :disabled="!proof.id" @click="downloadProof(proof)">Download</button>
              </div>
            </div>
            <div v-if="previewLoading" class="helper preview-state">Preparing secured document preview...</div>
            <div v-if="previewError" class="helper error" role="alert">{{ previewError }}</div>
            <div v-if="previewUrl" class="preview-panel">
              <div class="preview-heading"><strong>{{ previewName }}</strong><button class="btn outline" type="button" @click="clearPreview">Close preview</button></div>
              <img v-if="previewType.startsWith('image/')" :src="previewUrl" :alt="previewName" class="preview-image" />
              <iframe v-else-if="previewType === 'application/pdf'" :src="previewUrl" :title="previewName" class="preview-pdf" />
              <p v-else>Preview is unavailable for this file format. Select Download.</p>
            </div>
          </section>

          <section v-if="campaign.type === 'volunteer_event'" class="card event-card">
            <h3><ion-icon :icon="checkmarkCircleOutline" /> Event success monitoring</h3>
            <p class="helper">After checking that the event happened and reviewing the available updates and participation records, mark it completed. A completed status reflects an administrator-confirmed outcome.</p>
            <div class="outcome-row">
              <span class="status">CURRENT STATUS: {{ campaign.status }}</span>
              <button v-if="campaign.status === 'Active'" type="button" class="btn primary" :disabled="busy" @click="changeCompletion(true)">{{ busy ? 'Saving...' : 'Mark event successful / completed' }}</button>
              <button v-if="campaign.status === 'Completed'" type="button" class="btn outline" :disabled="busy" @click="changeCompletion(false)">{{ busy ? 'Saving...' : 'Reopen event' }}</button>
              <router-link class="btn outline" to="/admin/reports">View volunteer totals in reports</router-link>
            </div>
          </section>
        </div>
      </main>
    </ion-content>
    </div>
  </ion-page>
</template>
<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage, IonMenu, IonMenuToggle, IonList, IonItem,
  IonHeader, IonToolbar, IonContent, IonIcon, IonButton, IonLabel,
  IonSpinner, menuController, onIonViewWillEnter
} from '@ionic/vue';
import {
  shieldCheckmarkOutline, printOutline, downloadOutline, documentTextOutline, personOutline,
  calendarOutline, walletOutline, checkmarkCircleOutline, barChartOutline,
  notificationsOutline, megaphoneOutline, peopleOutline,
  logOutOutline, menuOutline
} from 'ionicons/icons';
import { apiSession, viewPrivateProof, assetUrl } from '../services/api';
import { getAllCampaigns, setAdminCampaignCompletion } from '../services/campaignService';
import type { Campaign } from '../models/Campaign';
import { formatDate, formatPeso } from '../utils/format';
import { confirmAction, confirmLogout, showToast } from '../utils/ui';
import { downloadWordDetails } from '../utils/docxExport';
import { currentUser } from '../services/authState';
import { logoutUser } from '../services/authService';
const route = useRoute();
const router = useRouter();
const DETAILS_MENU_ID = 'details-admin-menu';
const adminName = computed(() => currentUser.value?.displayName?.trim() || 'ReliefGO Administrator');
const initials = computed(() => {
  const words = adminName.value.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0]!.charAt(0) + words[words.length-1]!.charAt(0) : words[0]?.slice(0,2) || 'RA').toUpperCase();
});

async function toggleAdminMenu() {
  await menuController.toggle(DETAILS_MENU_ID);
}

async function handleLogout() {
  if (!(await confirmLogout())) return;
  await menuController.close(DETAILS_MENU_ID).catch(() => undefined);
  await logoutUser();
  await router.replace('/welcome');
}
const campaign = ref<Campaign | null>(null);
const loading = ref(true);
const error = ref('');
const busy = ref(false);
const previewUrl = ref('');
const previewName = ref('');
const previewType = ref('');
const previewError = ref('');
const previewLoading = ref(false);
const proofs = computed(() => ([
  {label:'Government-issued valid ID',id:campaign.value?.validIdFileId},
  {label:'Barangay clearance / legitimacy proof',id:campaign.value?.barangayClearanceFileId},
  {label:'Situation / beneficiary photo',id:campaign.value?.situationPhotoFileId},
  {label:'Eligibility / event supporting proof',id:campaign.value?.eligibilityProofFileId},
]));
type Proof = { label:string; id?:string|null };
function clearPreview(){if(previewUrl.value)URL.revokeObjectURL(previewUrl.value);previewUrl.value='';previewError.value='';}
onBeforeUnmount(clearPreview);
onIonViewWillEnter(async () => {
  clearPreview();loading.value=true;error.value='';campaign.value=null;
  try {const records=await getAllCampaigns();campaign.value=records.find(c=>c.id===String(route.params.id))||null;if(!campaign.value)error.value='Campaign record not found.';}
  catch(e){error.value=e instanceof Error?e.message:'Cannot load campaign details.';}
  finally{loading.value=false;}
});
async function showPreview(proof:Proof){
  if(!proof.id)return;
  clearPreview();previewLoading.value=true;previewName.value=proof.label;
  try {
    const resp=await fetch(assetUrl(proof.id),{headers:{Authorization:`Bearer ${apiSession.token}`}});
    if(!resp.ok)throw new Error('Document could not be accessed.');
    previewType.value=resp.headers.get('Content-Type')?.split(';')[0]||'';
    previewUrl.value=URL.createObjectURL(await resp.blob());
  }catch(e){previewError.value=e instanceof Error?e.message:'Unable to preview this document.';}
  finally{previewLoading.value=false;}
}
async function downloadProof(proof:Proof){if(!proof.id)return;try{await viewPrivateProof(proof.id);}catch(e){await showToast(e instanceof Error?e.message:'Cannot download document.','danger');}}
async function changeCompletion(done:boolean){
  if(!campaign.value||busy.value)return;
  const ok=await confirmAction(done?'Confirm successful event':'Reopen event',done?'Confirm that you have checked the event updates and participation records and the event has actually been completed successfully.':'Reopen this event for continued monitoring?',done?'Mark completed':'Reopen');
  if(!ok)return;busy.value=true;
  try{await setAdminCampaignCompletion(campaign.value.id,done);campaign.value={...campaign.value,status:done?'Completed':'Active'};await showToast(done?'Event marked completed.':'Event reopened.');}
  catch(e){await showToast(e instanceof Error?e.message:'Could not update event status.','danger');}
  finally{busy.value=false;}
}
/** The download and print actions share one source of record details. */
type DetailField = { label: string; value: unknown; section: string };

function buildDocumentFields(c: Campaign): DetailField[] {
  const rows: [string, unknown][] = [
    ['Campaign/Event', c.title],
    ['Type', c.type === 'volunteer_event' ? 'Community event' : 'Fundraising campaign'],
    ['Status', c.status],
    ['Organizer', c.organizerName],
    ['Organizer contact', c.contactPhone],
    ['Category', c.category],
    ['Location', c.locationAddress],
    ['Beneficiary', c.beneficiaryName],
    ['Beneficiary information', c.beneficiaryInfo],
    ['Description', c.description],
    ['Submitted', formatDate(c.createdAt)],
    ...(c.type === 'volunteer_event'
      ? [
          ['Event date', c.volunteerDate ? formatDate(c.volunteerDate) : '—'],
          ['Volunteers required', c.needsVolunteers ? 'Yes' : 'No'],
          ['Volunteer category', c.volunteerHelpCategory],
          ['Volunteer slots', c.volunteerSlots],
          ['Approved volunteers', c.volunteerCount],
          ['Volunteer duties', c.volunteerDuties],
          ['Volunteer requirements', c.volunteerRequirements],
        ] as [string, unknown][]
      : [
          ['Goal', formatPeso(c.goalAmount)],
          ['Verified giving', formatPeso(c.verifiedTotal)],
          ['Start date', formatDate(c.startDate)],
          ['Deadline', formatDate(c.deadline)],
          ['Payout method', c.payoutMethod],
          ['Account holder', c.payoutName],
          ['Payout number', c.payoutNumber],
        ] as [string, unknown][]),
    ...(c.type !== 'volunteer_event' && c.needsVolunteers
      ? [
          ['Volunteers required', 'Yes'],
          ['Event date', c.volunteerDate ? formatDate(c.volunteerDate) : '—'],
          ['Volunteer category', c.volunteerHelpCategory],
          ['Volunteer slots', c.volunteerSlots],
          ['Approved volunteers', c.volunteerCount],
          ['Volunteer duties', c.volunteerDuties],
          ['Volunteer requirements', c.volunteerRequirements],
        ] as [string, unknown][]
      : []),
    ...proofs.value.map(proof => [
      proof.label,
      proof.id ? 'Submitted (private document)' : 'Not uploaded',
    ] as [string, unknown]),
  ];

  const proofLabels = new Set(proofs.value.map(proof => proof.label));
  let section = 'Campaign information';

  return rows.map(([label, value]) => {
    if (label === 'Goal' || label === 'Event date') {
      section = 'Campaign goals and participation';
    }
    if (proofLabels.has(label)) {
      section = 'Supporting documents';
    }
    return { label, value, section };
  });
}

/** Download the existing professional Microsoft Word export. */
async function downloadDetails(): Promise<void> {
  const c = campaign.value;
  if (!c) return;

  try {
    await downloadWordDetails(c.title, buildDocumentFields(c), c.id);
  } catch (err) {
    await showToast(
      err instanceof Error ? err.message : 'Unable to download the Word document.',
      'danger'
    );
  }
}

/** Encode record content so campaign text cannot become HTML/scripts. */
function escapePrintHtml(value: unknown): string {
  const printable = value === null || value === undefined || value === ''
    ? 'Not provided'
    : String(value);

  return printable.replace(/[&<>"']/g, character => {
    const entities: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    };
    return entities[character] || character;
  });
}

/**
 * Open a clean, printable record in a separate browser tab.
 * No admin sidebar, menu, action buttons or scroll-container clipping.
 * Browser print supports paper printing and Save as PDF.
 */
function printDetails(): void {
  const c = campaign.value;
  if (!c) return;

  // Must open synchronously from the click event to avoid popup blocking.
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    void showToast('Please allow pop-ups to print campaign details.', 'danger');
    return;
  }
  printWindow.opener = null;

  const sections = new Map<string, DetailField[]>();
  for (const field of buildDocumentFields(c)) {
    const group = sections.get(field.section) || [];
    group.push(field);
    sections.set(field.section, group);
  }

  const body = [...sections.entries()].map(([sectionName, fields]) => `
    <section class="print-section">
      <h2>${escapePrintHtml(sectionName)}</h2>
      <dl>
        ${fields.map(field => `
          <div class="print-field">
            <dt>${escapePrintHtml(field.label)}</dt>
            <dd>${escapePrintHtml(field.value)}</dd>
          </div>
        `).join('')}
      </dl>
    </section>
  `).join('');

  const printedAt = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short'
  }).format(new Date());

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ReliefGO — ${escapePrintHtml(c.title)}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 22px; background: #fff; color: #1b3026;
           font: 12px/1.55 Arial, Helvetica, sans-serif; }
    .print-heading { border-bottom: 2px solid #173729; padding-bottom: 12px; margin-bottom: 14px; }
    .brand { font: bold 22px Georgia, serif; color: #173729; }
    .brand span { color: #be563b; }
    h1 { font: 400 26px Georgia, serif; margin: 8px 0 4px; overflow-wrap: anywhere; }
    .meta { color: #637066; font-size: 11px; }
    .print-section { break-inside: auto; margin: 14px 0 0; }
    .print-section h2 { font-size: 13px; color: #173729; background: #edf2eb;
                        padding: 7px 9px; margin: 0 0 6px; break-after: avoid; }
    dl { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 0 14px; margin: 0; }
    .print-field { padding: 7px 2px; border-bottom: 1px solid #e5e8e2;
                   break-inside: avoid; min-width: 0; }
    dt { font-weight: 700; font-size: 9px; letter-spacing: .5px;
         text-transform: uppercase; color: #986045; }
    dd { margin: 3px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; }
    .footer { margin-top: 17px; padding-top: 8px; border-top: 1px solid #ccd5cb;
              color: #667468; font-size: 10px; }
    .print-tools { display: flex; gap: 10px; margin: 0 0 18px; }
    .print-tools button { border: 0; padding: 10px 17px; border-radius: 8px;
                          background: #173729; color: #fff; cursor: pointer; font-weight: bold; }
    .print-tools button:last-child { background: #eee9dd; color: #173729; }
    @media print {
      body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-tools { display: none !important; }
      h1 { font-size: 22px; }
      .print-section { margin-top: 11px; }
    }
  
/* Two independent document actions: Word download and browser printing. */
.detail-page .record-buttons button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
.detail-page .record-buttons button ion-icon { font-size: 15px; flex: none; }
</style>
</head>
<body>
  <div class="print-tools">
    <button type="button" onclick="window.print()">Print</button>
    <button type="button" onclick="window.close()">Close</button>
  </div>
  <header class="print-heading">
    <div class="brand">Relief<span>GO</span></div>
    <h1>${escapePrintHtml(c.title)}</h1>
    <div class="meta">ADMINISTRATOR CAMPAIGN DETAILS · ${escapePrintHtml(c.status)}</div>
  </header>
  ${body}
  <footer class="footer">
    Printed on ${escapePrintHtml(printedAt)} (Philippine time) · Record ID: ${escapePrintHtml(c.id)}
    <div>Supporting documents are listed by submission status; private files are not embedded.</div>
  </footer>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  // Let the new document finish layout before opening the native print dialog.
  printWindow.setTimeout(() => {
    if (!printWindow.closed) {
      printWindow.focus();
      printWindow.print();
    }
  }, 250);
}
</script>
<style scoped>
.detail-page{font-family:'DM Sans',Arial,sans-serif;color:#173729;--cream:#fbf0dc;--forest:#173729;--gold:#f3b75d;--terracotta:#be563b}
.page-header{box-shadow:none}.page-header::after{display:none}.toolbar{--background:#fbf0dc;--min-height:72px;--color:#173729}.nav-row{width:min(1390px,calc(100% - 48px));min-height:72px;display:flex;justify-content:space-between;align-items:center;margin:auto;gap:12px}.logo{font:700 32px Georgia,serif;letter-spacing:-1.8px;color:#173729;text-decoration:none}.logo span,.logo sup{color:#be563b}.logo sup{font-size:11px}.back-link{display:flex;align-items:center;gap:7px;font-size:10px;letter-spacing:.7px;font-weight:800;text-decoration:none;color:#173729}.page-content{--background:#fbf0dc}.page-wrap{width:min(1370px,calc(100% - 48px));margin:auto;padding:23px 0 70px}
.hero{display:flex;align-items:center;justify-content:space-between;gap:25px;padding:40px 45px;background:linear-gradient(110deg,#173729,#112b20);border-radius:22px;color:#fff8e7}.eyebrow{color:#f3b75d;font-weight:850;letter-spacing:1.6px;font-size:10px}.hero h1{margin:7px 0;font:normal clamp(35px,4vw,58px) Georgia,serif}.hero h1 em{font-weight:normal;color:#f3b75d}.hero p:last-child{color:#e4ebde;font-size:13px;line-height:1.7}.hero-badge{display:flex;align-items:center;gap:15px;background:#ffffff16;border:1px solid #ffffff2b;border-radius:16px;padding:20px;font-size:11px;letter-spacing:1px;font-weight:800}.hero-badge ion-icon{font-size:28px;color:#f3b75d}
.record{margin-top:25px}.record-heading{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:15px 0 20px}.record-heading h2{font:normal clamp(28px,3vw,39px) Georgia,serif;margin:8px 0;overflow-wrap:anywhere}.record-heading p:not(.eyebrow){font-size:13px;color:#68756b}.eyebrow.terracotta{color:#ba6244}.status{font-size:11px;font-weight:850;color:#8e543c;letter-spacing:.5px}.record-buttons,.outcome-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:38px;padding:10px 16px;border-radius:999px;font:800 11px 'DM Sans',Arial,sans-serif;cursor:pointer;text-decoration:none;border:1px solid transparent;transition:filter .2s}.btn:disabled{opacity:.48;cursor:default}.btn:hover:not(:disabled){filter:brightness(1.1)}.btn.primary{background:#173729;color:#fffaf0}.btn.outline{color:#173729;background:transparent;border-color:#173729}.btn.text-btn{color:#a45a3e;background:transparent}.record-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px}.card{background:#fffaf0;border:1px solid #e6d9c1;border-radius:19px;padding:26px 29px;min-width:0}.card h3{display:flex;align-items:center;gap:11px;font:normal 25px Georgia,serif;margin:0 0 22px}.card h3 ion-icon{color:#be563b;font-size:24px;flex:none}.field{margin:0 0 16px;padding:0 0 14px;border-bottom:1px solid #ede4d2;min-width:0}.field:last-child{border:0;margin:0;padding:0}.field>span{display:block;font-size:10px;color:#9b5b42;font-weight:850;letter-spacing:.9px;margin-bottom:5px}.field strong,.field p{font-size:13px;color:#193d2d;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere;margin:0}.proofs-card,.event-card{margin-top:17px}.helper{color:#697568;font-size:12px;line-height:1.8;margin:0 0 17px}.proof-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.proof-item{display:flex;align-items:center;gap:9px;border:1px solid #e9dcc8;border-radius:12px;padding:13px;background:#f7f0e2;min-width:0}.proof-item>div{flex:1;min-width:0}.proof-item strong{display:block;font-size:13px}.proof-item span{display:block;font-size:11px;color:#697568;margin-top:6px}.preview-panel{margin-top:23px;border:1px solid #e7dac3;border-radius:15px;padding:13px}.preview-heading{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:14px}.preview-image{max-width:100%;display:block;max-height:760px;margin:auto}.preview-pdf{width:100%;height:650px;border:none}.error{color:#b64036}.state{padding:75px 22px;text-align:center;background:#fffaf0;border-radius:19px;margin-top:20px}.outcome-row{margin-top:20px}.outcome-row .status{margin-right:auto}
@media(max-width:800px){.record-grid,.proof-grid{grid-template-columns:1fr}.hero{align-items:flex-start;flex-direction:column;padding:28px}.record-heading{align-items:flex-start;flex-direction:column}.hero-badge{padding:14px}.proof-item{flex-wrap:wrap}}
@media(max-width:520px){.nav-row,.page-wrap{width:calc(100% - 26px)}.logo{font-size:26px}.back-link{font-size:9px}.hero h1{font-size:37px}.card{padding:20px 18px}.card h3{font-size:22px}.record-buttons{width:100%}}

/* Navbar: matches Admin Dashboard, with profile at the right. */
.page-header { box-shadow: none; }
.page-header::after { display: none; }
.toolbar {
  --background: #fbf0dc;
  --color: #173729;
  --padding-start: 0;
  --padding-end: 0;
  --min-height: 73px;
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  min-height: 72px;
  width: 100%;
  padding: 8px clamp(17px, 3.2vw, 55px);
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
}
.nav-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
.menu-trigger { display: none; margin: 0; --color: var(--forest); --padding-start: 5px; --padding-end: 5px; font-size: 23px; }
.topbar-user { display: flex; align-items: center; gap: 10px; min-width: 0; }
.topbar-avatar { display: grid; place-items: center; flex: 0 0 41px; width: 41px; height: 41px; border-radius: 50%; background: var(--gold); color: var(--deep); font: 700 14px Georgia,serif; }
.topbar-identity { display: flex; flex-direction: column; min-width: 0; gap: 4px; line-height: 1.3; }
.topbar-identity strong { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; }
.topbar-identity small { color: var(--terracotta); font-size: 9px; font-weight: 800; letter-spacing: 1.1px; }
.brand { font-size: clamp(25px, 2.1vw, 33px); line-height: 1; letter-spacing: -1.9px; font-weight: 700; white-space: nowrap; }
.brand span, .brand sup { color: var(--terracotta); }
.brand sup { font-size: 12px; margin-left: 2px; vertical-align: top; }
.nav-divider { height: 22px; width: 1px; background: #d9ccb4; }
.nav-page-name { font-size: 10px; letter-spacing: 1.25px; font-weight: 800; white-space: nowrap; }


/* --------------------------------------------------------------------------
   ADMIN SIDEBAR — dashboard-matching 266px desktop / mobile drawer
   -------------------------------------------------------------------------- */
.detail-page .details-admin-main {
  left: 266px;
  width: calc(100% - 266px);
  min-width: 0;
}
.admin-desktop-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 100;
  width: 266px;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  color: #fffaf0;
  background: #123527;
  box-shadow: 5px 0 22px #112b2021;
}
.desktop-brand {
  padding: 30px 22px 27px;
  border-bottom: 1px solid #ffffff25;
  font: 700 28px Georgia, 'Times New Roman', serif;
}
.desktop-brand span, .desktop-brand sup { color: var(--gold); }
.desktop-brand sup { margin-left: 2px; font-size: 12px; }
.desktop-brand small {
  display: block;
  margin-top: 10px;
  color: #ecd8a7;
  font: 800 9px 'DM Sans', sans-serif;
  letter-spacing: 2px;
}
.desktop-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  margin: 21px 14px;
  padding: 13px 10px;
  border-radius: 14px;
  background: #ffffff11;
}
.desktop-profile > div { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.desktop-profile strong { font-size: 13px; overflow-wrap: anywhere; }
.desktop-profile small { color: #f0cc91; font-size: 9px; letter-spacing: .9px; }
.menu-avatar {
  display: grid;
  place-items: center;
  flex: 0 0 49px;
  width: 49px;
  height: 49px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--deep);
  font: 700 18px Georgia, serif;
}
.desktop-nav-title {
  margin: 13px 22px 12px;
  color: var(--gold);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.3px;
}
.desktop-links {
  display: grid;
  align-content: start;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  gap: 5px;
  padding: 0 12px;
}
.desktop-links a {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  gap: 13px;
  min-height: 49px;
  padding: 12px 13px;
  color: #fbf0dc;
  border: 0;
  border-radius: 12px;
  box-shadow: none;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.25;
  text-decoration: none !important;
  transition: background .2s;
}
.desktop-links a ion-icon { flex: none; color: var(--gold); font-size: 20px; }
.desktop-links a:hover,
.desktop-links a.desktop-active {
  background: #ffffff22;
  color: #fff;
  border-bottom: 0;
  text-decoration: none !important;
}
.desktop-links a:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: -2px;
  text-decoration: none !important;
}
.desktop-sidebar-bottom {
  flex-shrink: 0;
  margin: auto 17px 0;
  padding: 25px 5px;
  border-top: 1px solid #ffffff25;
  color: #e4ceb3;
  font: italic 14px Georgia, serif;
}
.desktop-sidebar-bottom > span { display: block; }
.rg-sidebar-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  min-height: 44px;
  margin-top: 14px;
  border: 1px solid var(--gold);
  border-radius: 12px;
  background: var(--gold);
  color: var(--forest);
  cursor: pointer;
  font: 800 12px 'Segoe UI', sans-serif;
}
.rg-sidebar-logout:hover { background: #ffdfa3; }
.rg-sidebar-logout:focus-visible { outline: 3px solid var(--terracotta); outline-offset: 2px; }

/* Phone/tablet drawer: accessible through the hamburger button. */
.details-admin-menu { display: none; --width: min(355px, 87vw); --background: var(--cream); }
.details-admin-menu::part(container) { border-radius: 0 24px 24px 0; box-shadow: 7px 0 35px rgba(16,42,32,.17); }
.menu-toolbar { --background: var(--forest); --min-height: 108px; }
.menu-heading { display: flex; flex-direction: column; gap: 7px; padding: 20px 25px; }
.menu-brand { color: #fff8e7; font: 700 30px Georgia,serif; letter-spacing: -1.5px; }
.menu-brand span, .menu-brand sup { color: var(--gold); }
.menu-brand sup { margin-left: 3px; font-size: 13px; }
.menu-heading small { color: #e8c77f; font-size: 9px; font-weight: 800; letter-spacing: 2px; }
.menu-content { --background: var(--cream); }
.mobile-menu-body { display: flex; flex-direction: column; min-height: 100%; padding: 20px 0 0; }
.menu-profile {
  display: flex;
  align-items: center;
  gap: 13px;
  margin: 0 18px 25px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--paper);
}
.menu-profile > div { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.menu-profile > div > span { color: var(--terracotta); font-size: 9px; font-weight: 800; letter-spacing: 1px; }
.menu-profile strong { overflow-wrap: anywhere; font: 500 17px Georgia,serif; }
.menu-label { margin: 0 28px 12px; color: var(--terracotta); font-size: 10px; font-weight: 800; letter-spacing: 1.8px; }
.mobile-nav { background: transparent; padding: 0 13px; }
.menu-link {
  --background: transparent;
  --background-hover: #eee1c7;
  --border-radius: 12px;
  --padding-start: 15px;
  --inner-padding-end: 14px;
  --min-height: 52px;
  --border-width: 0;
  --inner-border-width: 0;
  margin-bottom: 4px;
  color: var(--forest);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none !important;
}
.menu-link ion-icon[slot="start"] { color: var(--terracotta); font-size: 20px; margin-right: 13px; }
.current-menu-link { --background: #eee1c7; }
.mobile-sidebar-bottom { margin: auto 22px 0; padding: 22px 4px; border-top: 1px solid var(--border); color: var(--muted); font: italic 13px Georgia,serif; }
.mobile-sidebar-bottom > span { display: block; }

/* Keep content aligned to Dashboard's responsive 55px padding. */
.detail-page .page-wrap {
  width: 100%;
  max-width: 1490px;
  margin: 0 auto;
  padding: clamp(18px, 2.2vw, 32px) clamp(16px, 3.3vw, 55px) 32px;
}

@media (max-width: 900px) {
  .admin-desktop-sidebar { display: none; }
  .detail-page .details-admin-main { left: 0; width: 100%; }
  .details-admin-menu { display: block; }
  .menu-trigger { display: inline-flex; }
  .topbar-identity { display: none; }
  .detail-page .page-wrap { padding-inline: clamp(16px, 3.3vw, 30px); }
}
@media (max-width: 610px) {
  .detail-page .page-wrap { padding: 16px 13px 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .desktop-links a { transition: none; }
}

/* --------------------------------------------------------------------------
   COMPACT & BALANCED DETAILS -- aligned with Admin Dashboard 55px gutters
   -------------------------------------------------------------------------- */
.detail-page {
  --forest: #173729; --deep: #112b20; --cream: #fbf0dc;
  --paper: #fffaf0; --gold: #f3b75d; --terracotta: #be563b;
  --border: #e9ddc7; --muted: #697568;
  background: var(--cream);
}
.detail-page *, .detail-page { box-sizing: border-box; }
.detail-page a, .detail-page a:link, .detail-page a:visited,
.detail-page a:hover, .detail-page a:active {
  text-decoration: none !important;
  text-decoration-line: none !important;
}
.detail-page .page-wrap { width: 100%; max-width: 1490px; margin: 0 auto;
  padding: clamp(18px,2.2vw,32px) clamp(16px,3.3vw,55px) 42px; }
.detail-page .hero {
  min-height: 210px;
  padding: clamp(24px,3vw,40px) clamp(25px,4vw,58px);
  border-radius: 20px;
  gap: 24px;
}
.detail-page .hero h1 { font-size: clamp(35px,3.6vw,53px); margin: 9px 0; }
.detail-page .hero p:last-child { max-width: 540px; margin: 0; }
.detail-page .hero-badge { padding: 14px 18px; min-height: 72px; border-radius: 15px; }
.detail-page .record { margin-top: 17px; }
.detail-page .record-heading { padding: 8px 0 15px; gap: 15px; align-items: center; }
.detail-page .record-heading h2 { font-size: clamp(26px,2.65vw,36px); margin: 5px 0; }
.detail-page .record-heading p:not(.eyebrow) { margin: 4px 0 0; }
.detail-page .record-buttons { gap: 8px; justify-content: flex-end; }
.detail-page .btn {
  min-height: 38px; padding: 9px 14px; border-radius: 11px;
  font-size: 10px; line-height: 1.35; white-space: normal; text-align: center;
  transition: background .2s, border-color .2s, color .2s;
}
.detail-page .btn.primary { background: #173729; color: #fffaf0; }
.detail-page .btn.primary:hover:not(:disabled) { background: #27543e; }
.detail-page .btn.secondary { background: #e9e1ce; color: #173729; border-color: #d4c6a9; }
.detail-page .btn.secondary:hover:not(:disabled) { background: #e2d5bb; }
.detail-page .btn.outline { background: #fffaf0; border-color: #173729; color: #173729; }
.detail-page .btn.outline:hover:not(:disabled) { background: #eaf0e7; }
.detail-page .btn:focus-visible { outline: 3px solid #be563b; outline-offset: 2px; }
.detail-page .record-grid {
  display: grid; grid-template-columns: repeat(2,minmax(0,1fr));
  align-items: stretch; gap: 14px;
}
.detail-page .card {
  min-width: 0; padding: 19px 21px; border-radius: 16px;
  background: #fffaf0; border: 1px solid #e6d9c1; box-shadow: none;
}
.detail-page .card h3 {
  display: flex; align-items: center; gap: 9px;
  font: 400 clamp(19px,1.7vw,23px)/1.22 Georgia,serif;
  margin: 0 0 12px;
}
.detail-page .card h3 ion-icon { font-size: 20px; }
.detail-page .field { margin: 0; padding: 10px 0; border-bottom: 1px solid #ede4d2; }
.detail-page .field:last-child { padding-bottom: 0; border-bottom: 0; }
.detail-page .field > span { margin-bottom: 3px; font-size: 9px; line-height: 1.4; }
.detail-page .field strong, .detail-page .field p { font-size: 12px; line-height: 1.55; }
.detail-page .record-grid .wide-card {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  column-gap: 22px;
  align-content: start;
}
.detail-page .record-grid .wide-card h3 { grid-column: 1 / -1; }
.detail-page .proofs-card, .detail-page .event-card { margin-top: 14px; }
.detail-page .proofs-card .helper, .detail-page .event-card .helper {
  max-width: 850px; margin: 0 0 14px; line-height: 1.6;
}
.detail-page .proof-grid { grid-template-columns:repeat(2,minmax(0,1fr));gap:10px; }
.detail-page .proof-item { padding: 10px 12px; min-height: 67px; gap: 7px; }
.detail-page .proof-item strong { font-size: 12px; }
.detail-page .proof-item span { margin-top: 3px; font-size: 10px; }
.detail-page .proof-item .btn { min-height: 34px; padding: 7px 11px; }
.detail-page .preview-panel { margin-top: 15px; }
.detail-page .preview-image { max-height: 510px; object-fit: contain; }
.detail-page .preview-pdf { height: min(62vh,560px); }
.detail-page .outcome-row { margin-top: 12px; gap: 8px; }
.detail-page .state { padding: 34px 20px; }
@media (max-width: 1100px) {
  .detail-page .record-heading { align-items: flex-start; flex-direction: column; }
  .detail-page .record-buttons { justify-content: flex-start; }
  .detail-page .hero-badge { flex-shrink: 0; }
}
@media (max-width: 900px) {
  .detail-page .hero { padding: 28px; min-height: 0; }
  .detail-page .page-wrap { padding-inline: clamp(16px,3.3vw,30px); }
  .detail-page .record-grid .wide-card { grid-column: auto; display: block; }
}
@media (max-width: 680px) {
  .detail-page .record-grid, .detail-page .proof-grid { grid-template-columns: 1fr; }
  .detail-page .hero { padding: 23px 20px; }
  .detail-page .record-grid .wide-card { grid-column: 1; }
  .detail-page .card { padding: 16px; }
  .detail-page .record-buttons { width: 100%; }
  .detail-page .record-buttons .btn { flex: 1 1 auto; }
  .detail-page .proof-item { flex-wrap: wrap; }
  .detail-page .page-wrap { padding: 15px 13px 28px; }
  .detail-page .hero-badge { padding: 11px 14px; }
}
@media (max-width: 520px) {
  .detail-page .nav-inner { padding-inline: 12px; }
  .detail-page .nav-left { gap: 6px; }
  .detail-page .nav-divider, .detail-page .nav-page-name, .detail-page .topbar-identity { display: none; }
  .detail-page .brand { font-size: 27px; }
}
</style>