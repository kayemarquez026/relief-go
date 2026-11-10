<template>
  <ion-page class="rg-audit-page">
    <!-- Mobile drawer. All links and actions match Admin Dashboard. -->
    <ion-menu
      content-id="audit-admin-main"
      menu-id="audit-admin-menu"
      side="start"
      type="overlay"
      class="audit-admin-menu"
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
              <ion-item button :detail="false" router-link="/admin/campaigns" class="menu-link">
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
              <ion-item button :detail="false" router-link="/admin/audit-logs" class="menu-link current-menu-link" aria-current="page">
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

    <!-- Permanent desktop sidebar, matching the 266px Admin Dashboard. -->
    <aside class="admin-desktop-sidebar" aria-label="Administration sidebar">
      <div class="desktop-brand">
        Relief<span>GO</span><sup>♥</sup><small>ADMINISTRATION</small>
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
        <router-link to="/admin/campaigns" active-class="desktop-active">
          <ion-icon :icon="megaphoneOutline" /> Campaign &amp; Events
        </router-link>
        <router-link to="/admin/users" active-class="desktop-active">
          <ion-icon :icon="peopleOutline" /> User Management
        </router-link>
        <router-link to="/admin/reports" active-class="desktop-active">
          <ion-icon :icon="barChartOutline" /> Reports
        </router-link>
        <router-link to="/admin/audit-logs" active-class="desktop-active" aria-current="page">
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

    <div id="audit-admin-main" class="ion-page audit-admin-main">
      <ion-header class="rg-header">
        <ion-toolbar class="rg-toolbar">
          <div class="nav-inner">
            <div class="nav-left">
              <ion-button fill="clear" class="menu-trigger"
                aria-label="Open administration menu" @click="toggleAdminMenu">
                <ion-icon slot="icon-only" :icon="menuOutline" />
              </ion-button>
              <router-link to="/admin" class="brand" aria-label="ReliefGO administrator dashboard">
                Relief<span>GO</span><sup>♥</sup>
              </router-link>
              <span class="brand-divider" aria-hidden="true"></span>
              <span class="page-label">AUDIT LOGS</span>
            </div>
            <div class="topbar-user" aria-label="Administrator profile">
              <span class="topbar-avatar">{{ initials }}</span>
              <span class="topbar-identity">
                <strong>{{ adminName }}</strong>
                <small>ADMINISTRATOR</small>
              </span>
            </div>
          </div>
        </ion-toolbar>
      </ion-header>

    <ion-content class="rg-content">
      <main class="page-wrapper">
        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">RELIEFGO · ADMINISTRATION</p>
            <h1>Audit <em>Logs.</em></h1>
            <p>Monitor administrator and campaign-organizer actions, including financial reviews, event approvals and updates.</p>
          </div>
          <div class="identity">
            <div class="avatar">{{ initials }}</div>
            <div><span class="identity-label">ADMINISTRATOR ACCOUNT</span><strong>{{ adminName }}</strong><small>Activity monitoring</small></div>
          </div>
        </section>

        <section class="stat-grid" aria-label="Audit log summary">
          <div class="stat"><ion-icon :icon="receiptOutline" /><span>RECORDED ACTIONS</span><strong>{{ logs.length }}</strong><small>Latest retrieved records</small></div>
          <div class="stat"><ion-icon :icon="filterOutline" /><span>MATCHING RESULTS</span><strong>{{ visibleLogs.length }}</strong><small>Current filters and search</small></div>
          <div class="stat"><ion-icon :icon="shieldCheckmarkOutline" /><span>LOG RETENTION</span><strong>200</strong><small>Latest actions shown</small></div>
        </section>

        <section class="list-section">
          <div class="section-heading">
            <div><p class="eyebrow dark">TRANSPARENT ADMINISTRATION</p><h2>Activity <em>history.</em></h2><p>Find actions by category, actor, or description.</p></div>
          </div>

          <div class="filter-panel">
            <div class="tab-scroll">
              <ion-segment v-model="segment" class="status-tabs">
                <ion-segment-button value="all"><ion-label>All</ion-label></ion-segment-button>
                <ion-segment-button value="campaign"><ion-label>Campaigns</ion-label></ion-segment-button>
                <ion-segment-button value="donation"><ion-label>Donations</ion-label></ion-segment-button>
                <ion-segment-button value="expense"><ion-label>Expenses</ion-label></ion-segment-button>
                <ion-segment-button value="user"><ion-label>Users</ion-label></ion-segment-button>
              </ion-segment>
            </div>
            <div class="search-wrap">
              <ion-icon :icon="searchOutline" class="search-icon" />
              <ion-searchbar v-model="searchText" placeholder="Search actions, names, details" :debounce="200" class="audit-search"></ion-searchbar>
            </div>
            <p class="audit-note"><ion-icon :icon="informationCircleOutline" /> Showing the latest 200 actions. Entries cannot be edited or deleted.</p>
          </div>

          <div v-if="loading" class="state-box"><ion-spinner name="crescent" /><p>Loading logs...</p></div>
          <div v-else-if="errorMessage" class="state-box"><ion-icon :icon="alertCircleOutline" class="state-icon" /><h3>Something went wrong</h3><p>{{ errorMessage }}</p></div>
          <div v-else-if="visibleLogs.length === 0" class="state-box"><div class="empty-icon"><ion-icon :icon="documentTextOutline" /></div><p class="eyebrow dark">NO ACTIVITY FOUND</p><h3>No log entries.</h3><p>{{ logs.length ? 'Try another search or category.' : 'Campaign, admin and organizer actions will appear here.' }}</p></div>
          <div v-else class="log-list">
            <article v-for="log in visibleLogs" :key="log.id" class="log-card">
              <div class="log-symbol"><ion-icon :icon="iconFor(log.targetType)" /></div>
              <div class="log-main">
                <div class="log-heading">
                  <h3>{{ log.action }}</h3>
                  <span class="type-pill">{{ log.targetType }}</span>
                </div>
                <p class="log-details">{{ log.details }}</p>
                <div class="log-meta">
                  <span><ion-icon :icon="personOutline" /> {{ log.adminName }}</span>
                  <span><ion-icon :icon="timeOutline" /> {{ formatTime(log.createdAt) }}</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </ion-content>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonMenu, IonMenuToggle, IonList, IonItem, menuController,
  IonHeader, IonToolbar, IonContent, IonSegment, IonSegmentButton,
  IonLabel, IonButton, IonSearchbar, IonSpinner, IonIcon, onIonViewWillEnter,
} from '@ionic/vue';
import {
  alertCircleOutline, documentTextOutline, receiptOutline,
  filterOutline, shieldCheckmarkOutline, searchOutline, informationCircleOutline,
  personOutline, timeOutline, megaphoneOutline, heartOutline, walletOutline, peopleOutline,
  barChartOutline, notificationsOutline, logOutOutline, menuOutline,
} from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { logoutUser } from '../services/authService';
import { confirmLogout } from '../utils/ui';
import { getAuditLogs } from '../services/auditService';
import type { AuditLog } from '../models/AuditLog';

const router = useRouter();
const AUDIT_MENU_ID = 'audit-admin-menu';

async function toggleAdminMenu() {
  await menuController.toggle(AUDIT_MENU_ID);
}

async function handleLogout() {
  if (!(await confirmLogout())) return;
  await menuController.close(AUDIT_MENU_ID).catch(() => undefined);
  await logoutUser();
  await router.replace('/welcome');
}

const logs = ref<AuditLog[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const segment = ref<string>('all');
const searchText = ref('');

const adminName = computed(() => currentUser.value?.displayName || 'Administrator');
const initials = computed(() => adminName.value.trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase() || '').join('') || 'A');

const visibleLogs = computed(() => {
  const term = searchText.value.trim().toLowerCase();
  return logs.value.filter((log) => {
    const matchesType = segment.value === 'all' || log.targetType === segment.value;
    const matchesSearch =
      term === '' ||
      log.action.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.adminName.toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });
});

function iconFor(type: string): string {
  if (type === 'campaign') return megaphoneOutline;
  if (type === 'donation') return heartOutline;
  if (type === 'expense') return walletOutline;
  if (type === 'user') return peopleOutline;
  return documentTextOutline;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

onIonViewWillEnter(async () => {
  if (logs.value.length === 0) loading.value = true;
  errorMessage.value = '';
  try { logs.value = await getAuditLogs(); }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : 'Could not load the logs.'; }
  finally { loading.value = false; }
});
</script>

<style scoped>
.rg-audit-page {
  --forest: #173729;
  --deep: #112b20;
  --cream: #fbf0dc;
  --paper: #fffaf0;
  --gold: #f3b75d;
  --terracotta: #be563b;
  --border: #e9ddc7;
  --muted: #697568;
  color: var(--forest);
  background: var(--cream);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
}
.rg-audit-page *, .rg-audit-page { box-sizing: border-box; }
.rg-audit-page a, .rg-audit-page a:link, .rg-audit-page a:visited,
.rg-audit-page a:hover, .rg-audit-page a:active {
  text-decoration: none !important;
  text-decoration-line: none !important;
}
.rg-header{box-shadow:none}.rg-header::after{display:none}.rg-toolbar{--background:#fbf0dc;--color:#143b2b;--min-height:74px;--border-color:#e6dcc6;--padding-start:0;--padding-end:0;border-bottom:1px solid #e6dcc6}
.nav-inner{width:100%;padding:8px clamp(17px,3.2vw,55px);margin:auto;display:flex;align-items:center;justify-content:space-between;min-height:74px;gap:20px}
.nav-left{display:flex;align-items:center;gap:14px;min-width:0}
.menu-trigger{display:none;margin:0;--color:var(--forest);--padding-start:5px;--padding-end:5px;font-size:23px}
.brand-divider{width:1px;height:23px;background:#d9ccb4}
.page-label{color:var(--forest);font-size:10px;letter-spacing:1.3px;font-weight:800;white-space:nowrap}
.topbar-user{display:flex;align-items:center;gap:10px;min-width:0}
.topbar-avatar{display:grid;place-items:center;flex:0 0 41px;width:41px;height:41px;border-radius:50%;background:var(--gold);color:var(--deep);font:700 14px Georgia,serif}
.topbar-identity{display:flex;flex-direction:column;gap:4px;min-width:0}
.topbar-identity strong{max-width:180px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.topbar-identity small{color:var(--terracotta);font-size:9px;font-weight:800;letter-spacing:1.1px}
.brand{font-family:Georgia,serif;font-size:36px;font-weight:bold;color:#123b2a;text-decoration:none;letter-spacing:-1.7px}.brand span{color:#be563b}.brand sup{font:13px Georgia,serif;color:#be563b;vertical-align:top}
.rg-content{--background:#fbf0dc;color:#16382a;font-family:'DM Sans','Avenir Next','Segoe UI',Arial,sans-serif}
.page-wrapper{box-sizing:border-box;width:100%;max-width:1490px;margin:0 auto;padding:clamp(18px,2.2vw,32px) clamp(16px,3.3vw,55px) 70px}
.hero{background:radial-gradient(circle at 75% 130%,#38533a 0,transparent 38%),linear-gradient(115deg,#193e2e,#112b20);color:#fff8e7;border-radius:23px;padding:46px 58px;display:flex;align-items:center;justify-content:space-between;gap:30px}
.hero-copy{max-width:700px}.eyebrow,.mini-label{color:#f0b44e;letter-spacing:2px;font-size:11px;font-weight:900;margin:0 0 15px}
.hero h1{font:normal clamp(37px,4.3vw,65px)/1.06 Georgia,serif;letter-spacing:-1.6px;margin:0 0 15px;color:#fff9eb}.hero h1 em{color:#f3b75d;font-weight:normal}.hero-copy>p:last-child{font-size:14px;line-height:1.7;max-width:640px;margin:0;color:#e7ebdc}
.identity{display:flex;align-items:center;gap:16px;min-width:300px;max-width:400px;padding:19px;border:1px solid #ffffff35;background:#ffffff0e;border-radius:18px}.avatar{flex:none;width:65px;height:65px;border-radius:50%;background:#f3b75d;color:#153729;display:grid;place-items:center;font:30px Georgia,serif}.identity-label{display:block;color:#f0b44e;font-size:10px;font-weight:900;letter-spacing:1.7px;margin-bottom:6px}.identity strong{display:block;color:#fff8e7;font:25px Georgia,serif;overflow-wrap:anywhere}.identity small{display:block;color:#e7e9da;margin-top:4px}
.stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:20px 0 34px}.stat{min-width:0;background:#fffaf0;border:1px solid #e9dcc3;border-radius:18px;padding:22px 25px;display:flex;flex-direction:column;align-items:flex-start}.stat ion-icon{color:#be563b;font-size:23px;margin-bottom:17px}.stat span{color:#be563b;font-size:10px;font-weight:900;letter-spacing:1.6px}.stat strong{font:38px Georgia,serif;color:#173e2d;margin:8px 0 2px}.stat small{color:#788078;font-size:12px}
.section-heading{margin:0 0 22px}.eyebrow.dark{color:#be563b;margin-bottom:8px}.section-heading h2{font:normal clamp(32px,3.4vw,49px) Georgia,serif;margin:0;color:#173e2d}.section-heading h2 em{color:#be563b;font-weight:normal}.section-heading p:last-child{color:#6d796e;font-size:14px;margin:8px 0 0}
.status-tabs{--background:#efe6d2;background:#efe6d2;border-radius:14px;padding:5px;max-width:650px;margin:0 0 20px}.status-tabs ion-segment-button{--color:#315342;--color-checked:#153e2c;--indicator-color:#fffaf0;--border-radius:11px;font-weight:800;min-height:43px}
.notice{background:#fff4d9;border:1px solid #edd8a9;border-radius:14px;padding:18px 22px;margin:12px 0 20px;color:#705b2d;font-size:13px;line-height:1.7}
.expense-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.expense-card{min-width:0;border:1px solid #e8dcc6;border-radius:20px;background:#fffaf0;padding:27px;box-shadow:0 8px 25px #253d2810}
.card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.mini-label{display:block;color:#be563b;margin-bottom:10px}.card-top h3{font:normal 28px/1.18 Georgia,serif;color:#183d2c;margin:0 0 8px;overflow-wrap:anywhere}.card-top p{font-size:13px;color:#7a8178;margin:0}.card-top ion-chip{flex:none;margin:0;text-transform:capitalize}
.amount-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:25px 0 13px}.amount-grid>div{background:#f6eedc;padding:15px;border-radius:12px;min-width:0}.amount-grid span{display:block;color:#a46448;font-size:10px;font-weight:900;letter-spacing:.9px}.amount-grid strong{display:block;font:25px Georgia,serif;color:#153b2a;margin-top:8px;overflow-wrap:anywhere}
.progress-track{height:8px;background:#e5e8d9;border-radius:20px;overflow:hidden}.progress-fill{height:100%;background:#d6a048;border-radius:20px}
.details{margin:22px 0 0}.details p{display:flex;gap:9px;align-items:flex-start;color:#626e64;font-size:13px;line-height:1.5;margin:11px 0}.details ion-icon{color:#be563b;flex:none;font-size:17px}.details b,.description b{color:#1b4330}
.description{border-top:1px solid #ece2d1;margin-top:16px;padding-top:15px;font-size:13px;line-height:1.6}.description p{color:#69766b;white-space:pre-line;overflow-wrap:anywhere;margin:6px 0 0}
.reason{margin-top:16px;padding:14px;background:#fff0e9;border:1px solid #efc9b7;border-radius:12px;color:#a44530;font-size:13px;line-height:1.5}
.actions{display:flex;flex-wrap:wrap;gap:10px;border-top:1px solid #ece2d1;padding-top:18px;margin-top:20px}.actions ion-button{--border-radius:10px;font-size:11px;font-weight:800;letter-spacing:.2px;min-height:38px;margin:0;text-transform:none}.outline-action{--color:#173e2d;--border-color:#173e2d}.danger-action{--color:#b34d37;--border-color:#b34d37}.primary-action{--background:#173e2d;--color:#fffaf0}
.state-box{text-align:center;padding:68px 24px;background:#fffaf0;border:1px solid #e8dcc6;border-radius:20px;color:#68766c}.state-box h3{font:normal 33px Georgia,serif;color:#173e2d;margin:12px 0}.state-box p{font-size:14px}.state-icon{font-size:46px;color:#be563b}.empty-icon{height:75px;width:75px;display:grid;place-items:center;margin:0 auto 15px;border-radius:50%;background:#f4e6c8;color:#be563b;font-size:36px}
@media(max-width:900px){.hero{padding:34px;align-items:stretch;flex-direction:column}.identity{max-width:none;min-width:0}.expense-grid{grid-template-columns:1fr}}
@media(max-width:620px){.nav-inner{padding-inline:15px;min-height:65px}.nav-left{gap:7px}.brand{font-size:29px}.brand-divider,.page-label,.topbar-identity{display:none}.rg-audit-page .page-wrapper{width:100%;padding:16px 14px 44px}.hero{padding:28px 22px;border-radius:18px}.hero h1{font-size:39px}.identity{padding:13px}.avatar{width:53px;height:53px;font-size:23px}.identity strong{font-size:20px}.stat-grid{gap:9px;margin:12px 0 28px}.stat{padding:14px 11px;border-radius:13px}.stat ion-icon{font-size:19px;margin-bottom:12px}.stat span{font-size:8px;letter-spacing:.5px}.stat strong{font-size:29px}.stat small{font-size:10px}.status-tabs ion-segment-button{font-size:11px}.expense-card{padding:19px}.card-top{flex-wrap:wrap}.amount-grid strong{font-size:20px}}

.expense-card .details{margin-top:23px}
.expense-card .details p{margin:14px 0;overflow-wrap:anywhere}
.expense-card .card-top h3{font-size:37px}
.expense-card .card-top p{line-height:1.5}
.notice.compact{margin:16px 0 0;padding:12px 15px}

.expense-card .details{margin-top:23px}
.expense-card .details p{margin:14px 0;overflow-wrap:anywhere}
.expense-card .card-top h3{font-size:37px}
.expense-card .card-top p{line-height:1.5}
.docs{display:flex;flex-wrap:wrap;gap:9px;margin-top:13px}
.doc-link{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border-radius:10px;background:#f1e7d4;color:#17412e;text-decoration:none;font-size:12px;font-weight:800;overflow-wrap:anywhere;max-width:100%}
.doc-link:hover{background:#e8d8ba}
.doc-link ion-icon{font-size:16px;flex:none}

.filter-panel{background:#fffaf0;border:1px solid #e8dcc6;border-radius:19px;padding:20px;margin-bottom:20px}
.tab-scroll{overflow-x:auto;max-width:100%;padding-bottom:4px}
.filter-panel .status-tabs{max-width:none;min-width:520px;width:100%;margin-bottom:13px}
.search-wrap{position:relative}
.audit-search{--background:#f7f0e2;--color:#173e2d;--placeholder-color:#81887e;--icon-color:#be563b;--clear-button-color:#173e2d;--border-radius:12px;padding:0}
.search-icon{display:none}
.audit-note{display:flex;align-items:center;gap:8px;color:#788078;font-size:12px;line-height:1.5;margin:10px 0 0}
.audit-note ion-icon{font-size:18px;color:#be563b;flex:none}
.log-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
.log-card{min-width:0;display:flex;gap:15px;background:#fffaf0;border:1px solid #e8dcc6;border-radius:18px;padding:22px;box-shadow:0 7px 22px #253d2810}
.log-symbol{width:46px;height:46px;border-radius:13px;background:#f4e7cf;color:#bd6d46;display:grid;place-items:center;flex:none;font-size:23px}
.log-main{min-width:0;flex:1}
.log-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.log-heading h3{font:normal 23px/1.2 Georgia,serif;color:#173e2d;margin:0;overflow-wrap:anywhere}
.type-pill{background:#e9eedf;border:1px solid #d4dec9;border-radius:999px;padding:6px 10px;color:#315a3b;font-size:10px;font-weight:900;letter-spacing:.5px;text-transform:capitalize;flex:none}
.log-details{font-size:13px;color:#647165;line-height:1.65;white-space:pre-line;overflow-wrap:anywhere;margin:13px 0 19px}
.log-meta{display:flex;flex-wrap:wrap;gap:8px 18px;border-top:1px solid #e9e0d0;padding-top:13px;color:#7b837a;font-size:11px}
.log-meta span{display:inline-flex;align-items:center;gap:5px;overflow-wrap:anywhere}
.log-meta ion-icon{font-size:15px;color:#be563b;flex:none}
@media(max-width:900px){.log-list{grid-template-columns:1fr}}
@media(max-width:620px){.filter-panel{padding:13px}.log-card{padding:16px;gap:11px}.log-symbol{width:39px;height:39px;font-size:19px}.log-heading h3{font-size:20px}.type-pill{font-size:9px;padding:5px 8px}}

/* --------------------------------------------------------------------------
   ADMIN SIDEBAR — dashboard-matching 266px desktop / mobile drawer
   -------------------------------------------------------------------------- */
.rg-audit-page .audit-admin-main {
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
.audit-admin-menu { display: none; --width: min(355px, 87vw); --background: var(--cream); }
.audit-admin-menu::part(container) { border-radius: 0 24px 24px 0; box-shadow: 7px 0 35px rgba(16,42,32,.17); }
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
.rg-audit-page .page-wrapper {
  width: 100%;
  max-width: 1490px;
  margin: 0 auto;
  padding: clamp(18px, 2.2vw, 32px) clamp(16px, 3.3vw, 55px) 32px;
}

@media (max-width: 900px) {
  .admin-desktop-sidebar { display: none; }
  .rg-audit-page .audit-admin-main { left: 0; width: 100%; }
  .audit-admin-menu { display: block; }
  .menu-trigger { display: inline-flex; }
  .topbar-identity { display: none; }
  .rg-audit-page .page-wrapper { padding-inline: clamp(16px, 3.3vw, 30px); }
}
@media (max-width: 610px) {
  .rg-audit-page .page-wrapper { padding: 16px 13px 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .desktop-links a { transition: none; }
}
</style>