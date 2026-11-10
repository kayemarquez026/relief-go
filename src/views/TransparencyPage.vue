<template>
  <ion-page class="relief-transparency-page">
    <!-- Same ReliefGO Member Workspace navigation as the organizer dashboard. -->
    <ion-menu v-if="isLoggedIn" menu-id="rg-trans-menu" content-id="rg-trans-main"
      type="overlay" side="start" class="rg-trans-mobile-menu">
      <ion-content class="rg-drawer-content">
        <div class="rg-drawer-shell">
          <div class="rg-sidebar-brand">
            Relief<span>GO</span><sup>♥</sup>
            <small>{{ sidebarSection }}</small>
          </div>

            <div class="rg-sidebar-profile">
              <span class="rg-sidebar-avatar">{{ userInitials }}</span>
              <div class="rg-sidebar-account"><small>{{ accountLabel }}</small><strong :title="fullName">{{ fullName }}</strong></div>
            </div>
            <p class="rg-sidebar-title">{{ sidebarTitle }}</p>

            <nav class="rg-sidebar-links" aria-label="ReliefGO workspace navigation">
              <router-link v-for="link in sidebarLinks" :key="link.path" :to="link.path"
                :class="{ 'rg-sidebar-active': isCurrentLink(link.path) }"
                :aria-current="isCurrentLink(link.path) ? 'page' : undefined"
                @click="closeTransparencyMenu">
                <ion-icon :icon="link.icon" aria-hidden="true" />
                <span>{{ link.label }}</span>
              </router-link>
            </nav>
            <div class="rg-sidebar-bottom">
              <span>Small acts. Big hearts. ✦</span>
              <button class="rg-sidebar-logout" type="button" @click="handleLogout">
                <ion-icon :icon="logOutOutline" aria-hidden="true" /> Log Out
              </button>
            </div>
        </div>
      </ion-content>
    </ion-menu>

    <aside v-if="isLoggedIn" class="rg-trans-sidebar" aria-label="ReliefGO member workspace">
      <div class="rg-sidebar-brand">
        Relief<span>GO</span><sup>♥</sup>
        <small>{{ sidebarSection }}</small>
      </div>

            <div class="rg-sidebar-profile">
              <span class="rg-sidebar-avatar">{{ userInitials }}</span>
              <div class="rg-sidebar-account"><small>{{ accountLabel }}</small><strong :title="fullName">{{ fullName }}</strong></div>
            </div>
      <p class="rg-sidebar-title">{{ sidebarTitle }}</p>

            <nav class="rg-sidebar-links" aria-label="ReliefGO workspace navigation">
              <router-link v-for="link in sidebarLinks" :key="link.path" :to="link.path"
                :class="{ 'rg-sidebar-active': isCurrentLink(link.path) }"
                :aria-current="isCurrentLink(link.path) ? 'page' : undefined"
                @click="closeTransparencyMenu">
                <ion-icon :icon="link.icon" aria-hidden="true" />
                <span>{{ link.label }}</span>
              </router-link>
            </nav>
            <div class="rg-sidebar-bottom">
              <span>Small acts. Big hearts. ✦</span>
              <button class="rg-sidebar-logout" type="button" @click="handleLogout">
                <ion-icon :icon="logOutOutline" aria-hidden="true" /> Log Out
              </button>
            </div>
    </aside>

    <div id="rg-trans-main" class="ion-page rg-trans-main" :class="{ 'has-sidebar': isLoggedIn }">
      <ion-header class="rg-trans-header">
        <ion-toolbar class="rg-trans-toolbar">
          <div class="rg-trans-topbar">
            <div class="rg-trans-topbar-left">
              <button v-if="isLoggedIn" type="button" class="rg-trans-menu-toggle"
                aria-label="Open workspace menu" @click="toggleTransparencyMenu">
                <ion-icon :icon="menuOutline" aria-hidden="true" />
              </button>
              <router-link :to="homeHref" class="rg-topbar-brand" aria-label="ReliefGO home">
                Relief<span>GO</span><sup>♥</sup>
              </router-link>
              <span class="rg-topbar-divider" aria-hidden="true"></span>
              <span class="rg-topbar-page-title">TRANSPARENCY REPORT</span>
            </div>
            <div v-if="isLoggedIn" class="rg-topbar-account">
              <span class="rg-topbar-avatar">{{ userInitials }}</span>
              <span class="rg-topbar-account-copy">
                <strong :title="fullName">{{ fullName }}</strong>
                <small>{{ accountLabel }}</small>
              </span>
            </div>
          </div>
        </ion-toolbar>
      </ion-header>

      <ion-content :fullscreen="false" class="transparency-content">
        <div class="transparency-shell">
          <div class="transparency-container">
            <div class="transparency-actions">
              <router-link :to="`/campaigns/${campaignId}`" class="back-link">
                <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
                <span>BACK TO CAMPAIGN</span>
              </router-link>
            </div>

        <main class="page-main">
          <div v-if="loading" class="state-box" role="status" aria-live="polite">
            <ion-spinner name="crescent" class="state-spinner" />
            <h2>Gathering the report...</h2>
            <p>Loading the campaign's verified financial records.</p>
          </div>

          <div v-else-if="errorMessage || !data" class="state-box" role="alert">
            <ion-icon :icon="alertCircleOutline" class="state-icon" />
            <h2>Report not available.</h2>
            <p>{{ errorMessage || 'This campaign does not exist or is not available to the public.' }}</p>
            <router-link to="/campaigns" class="state-action">
              EXPLORE CAMPAIGNS
              <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
            </router-link>
          </div>

          <template v-else>
            <!-- Editorial green introduction. No mock fundraising amounts. -->
            <section class="report-hero" aria-labelledby="report-heading">
              <div class="hero-copy">
                <p class="eyebrow">RELIEFGO <span>✦</span> ACCOUNTABILITY MATTERS</p>
                <h1 id="report-heading">Every peso has <em>a purpose.</em></h1>
                <p class="hero-lead">
                  Explore verified donations, approved expenses, and available proof
                  of how this campaign's funds are being used.
                </p>
                <div class="hero-trust">
                  <ion-icon :icon="shieldCheckmarkOutline" aria-hidden="true" />
                  <span>Transparent giving. Meaningful impact.</span>
                </div>
              </div>
              <div class="hero-art" aria-hidden="true">
                <span class="art-halo"></span>
                <ion-icon :icon="documentTextOutline" class="art-paper" />
                <ion-icon :icon="shieldCheckmarkOutline" class="art-shield" />
                <span class="art-caption">GIVING WITH TRANSPARENCY</span>
              </div>
            </section>

            <div class="report-container">
              <!-- Campaign-specific information from the existing backend -->
              <section class="campaign-heading" aria-label="Campaign information">
                <div>
                  <p class="section-eyebrow">THE CAMPAIGN BEHIND THE REPORT</p>
                  <h2>{{ data.campaign.title }}</h2>
                  <p class="organizer">
                    <ion-icon :icon="peopleOutline" aria-hidden="true" />
                    Organized by <strong>{{ data.campaign.organizerName }}</strong>
                  </p>
                </div>
                <router-link :to="`/campaigns/${campaignId}`" class="campaign-link">
                  VIEW CAMPAIGN
                  <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
                </router-link>
              </section>

              <!-- Preserve the exact verified financial calculations,
                   breakdown, attachments, and empty states in this component. -->
              <section class="report-section" aria-labelledby="financial-report-title">
                <div class="section-heading">
                  <div class="section-number">01</div>
                  <div>
                    <p class="section-eyebrow">FINANCIAL ACCOUNTABILITY</p>
                    <h2 id="financial-report-title">Where the funds <em>go.</em></h2>
                    <p>Only verified donations and approved, documented expenses are counted.</p>
                  </div>
                </div>
                <div class="report-surface">
                  <TransparencyReport :summary="data.summary" :expenses="data.expenses" />
                </div>
              </section>

              <aside class="trust-note">
                <div class="trust-icon">
                  <ion-icon :icon="shieldCheckmarkOutline" aria-hidden="true" />
                </div>
                <div>
                  <p class="section-eyebrow">BUILT AROUND ACCOUNTABILITY</p>
                  <h3>Trust grows with every verified update.</h3>
                  <p>
                    Supporting documentation is displayed when it has been reviewed
                    and approved. Pending or rejected expenses do not count toward
                    the reported approved expenses.
                  </p>
                </div>
              </aside>

              <div class="bottom-actions">
                <router-link :to="`/campaigns/${campaignId}`" class="bottom-back">
                  <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
                  BACK TO CAMPAIGN DETAILS
                </router-link>
                <router-link to="/campaigns" class="browse-link">
                  EXPLORE MORE CAMPAIGNS
                  <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
                </router-link>
              </div>
            </div>
          </template>
        </main>

        <footer class="page-footer">
          <span>© {{ new Date().getFullYear() }} ReliefGO</span>
          <span>Stories of bayanihan live here.</span>
        </footer>
          </div>
        </div>
      </ion-content>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { currentUser } from '../services/authState';
import { dashboardPathForRole } from '../utils/roles';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonContent,
  menuController,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  arrowBackOutline,
  arrowForwardOutline,
  alertCircleOutline,
  shieldCheckmarkOutline,
  documentTextOutline,
  peopleOutline,
  gridOutline,
  addCircleOutline,
  megaphoneOutline,
  notificationsOutline,
  barChartOutline,
  logOutOutline,
  menuOutline,
  heartOutline,
} from 'ionicons/icons';
import { logoutUser } from '../services/authService';
import { confirmLogout } from '../utils/ui';
import TransparencyReport from '../components/TransparencyReport.vue';
import { getTransparencyData } from '../services/transparencyService';
import type { TransparencyData } from '../services/transparencyService';

const route = useRoute();
const router = useRouter();

// Member Workspace sidebar: same entries, order, and behavior as the dashboard.
const TRANSPARENCY_MENU_ID = 'rg-trans-menu';
const isLoggedIn = computed(() => Boolean(currentUser.value));
const accountRole = computed(() => String(currentUser.value?.role || 'guest'));
const homeHref = computed(() => currentUser.value
  ? dashboardPathForRole(currentUser.value.role) : '/welcome');
const accountLabel = computed(() => accountRole.value === 'admin' ? 'ADMINISTRATOR'
  : accountRole.value === 'organizer' ? 'ORGANIZER ACCOUNT'
  : accountRole.value === 'donor' ? 'DONOR ACCOUNT' : 'ACCOUNT');
const sidebarSection = computed(() => accountRole.value === 'admin' ? 'ADMINISTRATION' : 'MEMBER WORKSPACE');
const sidebarTitle = computed(() => accountRole.value === 'admin' ? 'MANAGEMENT TOOLS' : 'MY WORKSPACE');
const fullName = computed(() => currentUser.value?.displayName?.trim()
  || (accountRole.value === 'admin' ? 'ReliefGO Administrator' : 'ReliefGO Member'));
const userInitials = computed(() => {
  const words = fullName.value.split(/\s+/).filter(Boolean);
  return (words.length >= 2
    ? `${words[0][0]}${words[words.length - 1][0]}`
    : fullName.value.slice(0, 2)).toUpperCase();
});

// Adapt if the current router uses a different registered creation/volunteer path.
function resolveWorkspaceRoute(preferred: string[], kind: 'create' | 'volunteer'): string {
  const records = router.getRoutes().filter(item => !/[\:*]/.test(item.path));
  for (const path of preferred) {
    if (records.some(item => item.path === path)) return path;
  }
  const match = records.find(item => {
    const text = `${item.path} ${String(item.name ?? '')}`.toLowerCase();
    if (kind === 'create') return /(?:create|new)/.test(text)
      && /campaign/.test(text) && !/(edit|update)/.test(text);
    return /volunteer/.test(text) && !/(review|application|attendance|detail|manage)/.test(text);
  });
  return match?.path || preferred[0];
}
const createCampaignPath = computed(() => resolveWorkspaceRoute([
  '/organizer/campaigns/create', '/organizer/campaigns/new',
  '/organizer/create-campaign', '/organizer/create', '/campaigns/create', '/create-campaign',
], 'create'));
const volunteeringPath = computed(() => resolveWorkspaceRoute([
  '/volunteering', '/organizer/volunteering', '/organizer/volunteers',
  '/volunteer', '/volunteer/opportunities', '/volunteers',
], 'volunteer'));

const sidebarLinks = computed(() => {
  if (accountRole.value === 'admin') return [
    { path: homeHref.value, label: 'Dashboard', icon: barChartOutline },
    { path: '/notifications', label: 'Notifications', icon: notificationsOutline },
    { path: '/admin/campaigns', label: 'Campaign & Events', icon: megaphoneOutline },
    { path: '/admin/users', label: 'User Management', icon: peopleOutline },
    { path: '/admin/reports', label: 'Reports', icon: barChartOutline },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: documentTextOutline },
  ];
  if (accountRole.value === 'organizer') return [
    { path: homeHref.value, label: 'Dashboard', icon: gridOutline },
    { path: '/campaigns', label: 'Browse Campaigns', icon: heartOutline },
    { path: '/organizer/campaigns', label: 'My Campaigns', icon: megaphoneOutline },
    { path: createCampaignPath.value, label: 'Create Campaign', icon: addCircleOutline },
    { path: volunteeringPath.value, label: 'Volunteering', icon: peopleOutline },
    { path: '/notifications', label: 'Notifications', icon: notificationsOutline },
  ];
  return [
    { path: homeHref.value, label: 'Dashboard', icon: gridOutline },
    { path: '/campaigns', label: 'Browse Campaigns', icon: heartOutline },
    { path: '/notifications', label: 'Notifications', icon: notificationsOutline },
  ];
});
function isCurrentLink(path: string): boolean {
  if (accountRole.value === 'admin' && path === '/admin/campaigns'
      && (route.path === '/campaigns' || route.path.startsWith('/campaigns/'))) return true;
  if (path === '/campaigns' && route.path.startsWith('/campaigns/')) return true;
  if (route.path === path) return true;
  if (path === '/organizer/campaigns' && route.path === createCampaignPath.value) return false;
  return path !== '/' && path !== '/campaigns' && route.path.startsWith(`${path}/`);
}
async function toggleTransparencyMenu() { await menuController.toggle(TRANSPARENCY_MENU_ID); }
async function closeTransparencyMenu() {
  await menuController.close(TRANSPARENCY_MENU_ID).catch(() => undefined);
}
async function handleLogout() {
  if (!(await confirmLogout())) return;
  await closeTransparencyMenu();
  await logoutUser();
  await router.replace('/welcome');
}

const campaignId = String(route.params.id);
const data = ref<TransparencyData | null>(null);
const loading = ref(true);
const errorMessage = ref('');

// Keep the original backend/data flow unchanged.
onIonViewWillEnter(async () => {
  if (!data.value) loading.value = true;
  errorMessage.value = '';

  try {
    data.value = await getTransparencyData(campaignId);
  } catch (error) {
    data.value = null;
    errorMessage.value = error instanceof Error ? error.message : 'Could not load the report.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Original ReliefGO palette and type system */
.relief-transparency-page {
  --forest: #173729;
  --deep: #112b20;
  --cream: #fbf0dc;
  --terracotta: #be563b;
  --gold: #f3b75d;
  --muted: #667365;
  background: var(--cream);
  color: var(--forest);
}
.transparency-content {
  --background: #fbf0dc;
  --color: #173729;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}
.transparency-content::part(background),
.transparency-content::part(scroll) { background: #fbf0dc; }
.transparency-shell {
  width: 100%;
  min-height: 100dvh;
  padding: 0 clamp(14px, 3.6vw, 64px);
  background: var(--cream);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.transparency-shell * { box-sizing: border-box; }
.transparency-shell a { color: inherit; text-decoration: none; }
h1, h2, h3, .brand { font-family: Georgia, 'Times New Roman', serif; }

/* Navigation consistent with the Campaign Details redesign */
.page-navbar {
  height: 76px;
  width: 100%;
  max-width: 1620px;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}
.brand { color: var(--forest); font-size: clamp(27px, 2.4vw, 36px); font-weight: 700; letter-spacing: -2px; white-space: nowrap; line-height: 1; }
.brand span, .brand b { color: var(--terracotta); }
.brand b { vertical-align: top; font-size: 12px; letter-spacing: 0; margin-left: 2px; }
.back-link, .campaign-link, .bottom-back, .browse-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
}
.back-link { padding: 12px 17px; border: 1px solid rgba(24,60,44,.25); border-radius: 999px; white-space: nowrap; }
.back-link ion-icon, .campaign-link ion-icon, .bottom-back ion-icon, .browse-link ion-icon { font-size: 17px; flex-shrink: 0; }
.back-link:hover, .back-link:focus-visible { background: var(--forest); color: #fff8e8; }
.page-main { width: 100%; max-width: 1620px; margin: 0 auto; }

/* Forest-green header with an abstract verification motif (no extra asset). */
.report-hero {
  border-radius: 19px;
  background: linear-gradient(115deg, var(--forest), var(--deep));
  color: #fff8e8;
  /* Compact desktop hero: enough room for the headline without wasting vertical space. */
  min-height: 254px;
  padding: clamp(22px, 2.6vw, 36px) clamp(24px, 3.4vw, 46px);
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(160px, .55fr);
  gap: clamp(14px, 2.2vw, 28px);
  align-items: center;
  overflow: hidden;
  position: relative;
}
.report-hero::before {
  content: 'RELIEFGO';
  position: absolute;
  right: -10px; top: -25px;
  color: rgba(255,248,232,.045);
  font: 900 clamp(70px, 9vw, 138px) Georgia, serif;
  letter-spacing: -6px;
  pointer-events: none;
}
.hero-copy { position: relative; z-index: 1; min-width: 0; }
.hero-copy, .report-hero h1 { overflow-wrap: anywhere; }
.eyebrow, .section-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
  line-height: 1.5;
  margin: 0 0 13px;
  color: var(--terracotta);
}
.eyebrow { color: var(--gold); }
.report-hero .eyebrow { margin-bottom: 9px; }
.eyebrow span { margin: 0 5px; }
.report-hero h1 {
  max-width: 650px;
  margin: 0 0 11px;
  font-weight: 400;
  font-size: clamp(29px, 3vw, 43px);
  line-height: 1.13;
  letter-spacing: -1.1px;
  overflow-wrap: anywhere;
}
.report-hero h1 em { color: var(--gold); font-weight: 400; }
.hero-lead { max-width: 600px; margin: 0; color: #d8e2d3; font-size: clamp(12px, .95vw, 14px); line-height: 1.55; }
.hero-trust { display: flex; align-items: center; gap: 9px; margin-top: 16px; font-size: 11px; color: #e1e9df; }
.hero-trust ion-icon { color: var(--gold); font-size: 18px; flex-shrink: 0; }
.hero-art { position: relative; min-height: 158px; display: grid; place-items: center; }
.art-halo { position: absolute; width: 175px; height: 175px; border-radius: 50%; background: radial-gradient(circle, rgba(232,174,76,.20), transparent 70%); }
.art-paper { font-size: clamp(85px, 7vw, 112px); color: #f1e2c4; transform: rotate(-12deg); filter: drop-shadow(0 9px 12px rgba(0,0,0,.15)); }
.art-shield { font-size: 46px; color: var(--gold); position: absolute; top: 45%; left: 57%; background: var(--forest); border-radius: 50%; padding: 7px; box-shadow: 0 7px 18px rgba(0,0,0,.2); }
.art-caption { position: absolute; bottom: 0; text-align: center; font-size: 8px; letter-spacing: 1.4px; font-weight: 800; color: var(--gold); }

/* Main report body */
.report-container { max-width: 1200px; margin: 0 auto; padding: clamp(29px, 4vw, 56px) 0 30px; }
.campaign-heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 0 5px 30px; border-bottom: 1px solid #e6dbc4; }
.campaign-heading > div { min-width: 0; }
.campaign-heading h2 { font-size: clamp(29px, 2.9vw, 46px); line-height: 1.2; letter-spacing: -1px; font-weight: 400; margin: 0 0 10px; overflow-wrap: anywhere; }
.organizer { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 13px; color: #596b5c; margin: 0; }
.organizer strong { font-weight: 700; color: var(--forest); }
.organizer ion-icon { color: var(--terracotta); font-size: 18px; }
.campaign-link { color: var(--forest); border-bottom: 1px solid var(--terracotta); padding: 10px 0; flex-shrink: 0; }
.campaign-link:hover, .campaign-link:focus-visible { color: var(--terracotta); }
.report-section { margin-top: 39px; }
.section-heading { display: flex; align-items: center; gap: 18px; margin-bottom: 22px; }
.section-number { width: 53px; height: 53px; border: 1px solid #decfb2; border-radius: 15px; color: var(--terracotta); font: 700 25px Georgia, serif; display: grid; place-items: center; flex-shrink: 0; }
.section-heading .section-eyebrow { margin-bottom: 6px; }
.section-heading h2 { font-size: clamp(29px, 2.8vw, 42px); line-height: 1.2; letter-spacing: -1px; font-weight: 400; margin: 0 0 7px; }
.section-heading h2 em { font-weight: 400; color: var(--terracotta); }
.section-heading p:last-child { margin: 0; font-size: 13px; color: #637065; line-height: 1.6; }

/* Original TransparencyReport.vue still computes and renders every amount,
   expense entry, proof attachment, and empty state. We style its OUTER surface. */
.report-surface {
  border-radius: 19px;
  border: 1px solid #e7dec8;
  background: #fffaf0;
  box-shadow: 0 13px 35px rgba(24,60,44,.06);
  padding: clamp(16px, 2.2vw, 30px);
  min-width: 0;
}
/* Deep selectors target common child card/heading primitives without changing
   the child's data or markup. No assumptions about backend field names. */
.report-surface :deep(ion-card) {
  --background: #fffdf7;
  --color: #173729;
  border: 1px solid #e6dbc7;
  border-radius: 16px;
  box-shadow: none;
  margin-left: 0;
  margin-right: 0;
}
.report-surface :deep(h2),
.report-surface :deep(h3) {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 400;
  color: #173729;
}
.report-surface :deep(p),
.report-surface :deep(span),
.report-surface :deep(ion-item) {
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
}
.report-surface :deep(ion-item) { --background: #fffdf7; --color: #173729; }
.report-surface :deep(ion-progress-bar) { --background: #e6eadf; --progress-background: #3d8852; border-radius: 10px; }
.report-surface :deep(.state-box) { color: #667365; }
.report-surface :deep(.muted) { color: #667365; }

.trust-note { margin-top: 30px; display: flex; align-items: center; gap: clamp(16px, 3vw, 30px); border-radius: 18px; padding: 24px clamp(21px, 3vw, 36px); background: #e9eee1; border: 1px solid #d8dfcf; }
.trust-icon { display: grid; place-items: center; width: 63px; height: 63px; flex-shrink: 0; border-radius: 16px; background: #d8e5d5; color: var(--forest); font-size: 32px; }
.trust-note .section-eyebrow { margin-bottom: 6px; }
.trust-note h3 { font-size: clamp(19px, 2vw, 27px); font-weight: 400; margin: 0 0 6px; }
.trust-note p:last-child { font-size: 12px; line-height: 1.75; margin: 0; color: #56675a; max-width: 750px; }
.bottom-actions { display: flex; justify-content: space-between; gap: 18px; flex-wrap: wrap; margin: 29px 0 0; }
.bottom-back, .browse-link { color: var(--forest); border-bottom: 1px solid #dfb16b; padding: 12px 0; }
.bottom-back:hover, .browse-link:hover { color: var(--terracotta); }

.page-footer { max-width: 1620px; margin: 0 auto; padding: 20px 0 26px; display: flex; justify-content: space-between; align-items: center; gap: 15px; font-size: 11px; color: #687768; border-top: 1px solid #e6dbc4; }
.state-box { min-height: 60dvh; display: flex; flex-direction: column; gap: 12px; align-items: center; justify-content: center; text-align: center; padding: 42px 16px; }
.state-box h2 { font-size: clamp(30px, 4vw, 49px); font-weight: 400; margin: 0; }
.state-box p { font-size: 14px; color: #637065; margin: 0; line-height: 1.65; }
.state-spinner, .state-icon { width: 49px; height: 49px; color: var(--terracotta); }
.state-action { display: inline-flex; gap: 10px; align-items: center; margin-top: 15px; background: var(--gold); color: var(--deep); padding: 15px 24px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: .7px; }
.state-action ion-icon { font-size: 19px; }

@media (max-width: 850px) {
  .report-hero { grid-template-columns: minmax(0, 1fr) minmax(125px, .4fr); padding: 24px 26px; }
  .hero-art { min-height: 145px; }
  .art-paper { font-size: 88px; }
  .art-shield { font-size: 42px; }
  .campaign-heading { align-items: flex-start; }
}
@media (max-width: 640px) {
  .transparency-shell { padding-inline: 12px; }
  .page-navbar { height: 68px; }
  .brand { font-size: 27px; }
  .back-link { padding: 9px 11px; gap: 6px; font-size: 9px; letter-spacing: .5px; }
  .back-link ion-icon { font-size: 14px; }
  .report-hero { grid-template-columns: 1fr; min-height: 0; border-radius: 14px; padding: 25px 20px 24px; }
  .report-hero h1 { font-size: clamp(27px, 7vw, 35px); line-height: 1.17; letter-spacing: -.6px; }
  .report-hero::before { top: 10px; font-size: 65px; letter-spacing: -3px; }
  .hero-art { display: none; }
  .campaign-heading { flex-direction: column; gap: 9px; }
  .campaign-heading h2 { font-size: 31px; }
  .campaign-link { font-size: 10px; }
  .section-heading { gap: 11px; align-items: flex-start; }
  .section-number { width: 43px; height: 43px; font-size: 19px; border-radius: 11px; }
  .report-surface { padding: 10px; }
  .trust-note { align-items: flex-start; padding: 19px; gap: 12px; }
  .trust-icon { width: 43px; height: 43px; border-radius: 12px; font-size: 24px; }
  .bottom-actions { flex-direction: column; gap: 2px; align-items: flex-start; }
  .page-footer { font-size: 10px; flex-wrap: wrap; justify-content: center; gap: 4px 14px; }
}

/* ===================================================================
   RELIEFGO MEMBER WORKSPACE — MATCHES DASHBOARD SIDEBAR + CONTENT GUTTERS
   Desktop: 273px sidebar, centered 1128px content. No overlap.
   Mobile: Ionic overlay drawer and responsive details cards.
   =================================================================== */
.relief-transparency-page { --rg-sidebar-width: 273px; }
.rg-trans-sidebar {
  position: fixed; inset: 0 auto 0 0; z-index: 100;
  display: flex; flex-direction: column;
  width: var(--rg-sidebar-width); height: 100dvh;
  color: #fffaf0; background: #15392c;
  font-family: 'DM Sans','Segoe UI',Arial,sans-serif;
  box-shadow: 5px 0 22px rgba(17,43,32,.09);
}
.rg-sidebar-brand {
  display: block; min-height: 113px; padding: 28px 23px 24px;
  color: #fffaf0; font: 700 33px/1 Georgia,'Times New Roman',serif;
  letter-spacing: -.7px; border-bottom: 1px solid rgba(255,255,255,.16);
}
.rg-sidebar-brand span, .rg-sidebar-brand sup { color: #f4b75c; }
.rg-sidebar-brand sup { margin-left: 2px; font-size: 12px; vertical-align: super; }
.rg-sidebar-brand small {
  display: block; margin-top: 12px; color: #f3c17e;
  font: 800 10px 'DM Sans','Segoe UI',Arial,sans-serif;
  letter-spacing: 2.35px;
}
.rg-sidebar-profile {
  display: flex; align-items: center; gap: 12px; min-height: 75px;
  margin: 24px 9px 22px; padding: 14px 10px;
  border-radius: 13px; border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.055); min-width: 0;
}
.rg-sidebar-avatar {
  flex: 0 0 42px; width: 42px; height: 42px;
  display: grid; place-items: center;
  border-radius: 50%; background: #f4b75c; color: #15392c;
  font: 700 17px Georgia,serif;
}
.rg-sidebar-account { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; gap: 5px; }
.rg-sidebar-account small {
  font-size: 10px; font-weight: 800; letter-spacing: .5px; color: #f3c17e;
}
.rg-sidebar-account strong {
  color: #fffaf0; font-size: 12px; font-weight: 800;
  display: block; max-width: 100%; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.rg-sidebar-title {
  margin: 11px 27px 14px; color: #f3c17e;
  font-size: 11px; font-weight: 800; letter-spacing: 1.7px;
}
.rg-sidebar-links {
  display: grid; align-content: start; gap: 5px;
  padding: 0 12px; min-height: 0; flex: 1 1 auto; overflow-y: auto;
}
.rg-sidebar-links a, .rg-sidebar-links a:link, .rg-sidebar-links a:visited {
  display: flex; align-items: center; gap: 15px;
  min-height: 48px; padding: 12px 14px; border-radius: 11px;
  text-decoration: none !important; color: #e6ebe5 !important;
  font-size: 14px; font-weight: 700; line-height: 1.3;
}
.rg-sidebar-links a ion-icon { flex: none; font-size: 19px; color: #efb861; }
.rg-sidebar-links a.rg-sidebar-active,
.rg-sidebar-links a.rg-sidebar-active:link,
.rg-sidebar-links a.rg-sidebar-active:visited {
  background: #f9f0de; color: #173729 !important;
}
.rg-sidebar-links a.rg-sidebar-active ion-icon { color: #c56d4f; }
.rg-sidebar-links a:not(.rg-sidebar-active):hover { background: rgba(255,255,255,.12); }
.rg-sidebar-links a:focus-visible { outline: 2px solid #f4b75c; outline-offset: -2px; }
.rg-sidebar-bottom { margin: auto 12px 0; padding: 12px 0 14px; }
.rg-sidebar-bottom > span {
  padding: 0 13px; color: #efba69;
  font: normal 12px 'DM Sans','Segoe UI',sans-serif;
}
.rg-sidebar-logout {
  display: flex; justify-content: center; align-items: center; gap: 9px;
  width: 100%; min-height: 48px; margin-top: 13px;
  border-radius: 10px; border: 1px solid #f4b75c;
  background: #f4b75c; color: #15392c;
  font: 800 12px 'DM Sans','Segoe UI',Arial,sans-serif; cursor: pointer;
}
.rg-sidebar-logout:hover { background: #ffdfa3; }
.rg-sidebar-logout ion-icon { font-size: 16px; }
.rg-sidebar-logout:focus-visible { outline: 3px solid #be563b; outline-offset: 2px; }

/* Ionic routes position .ion-page absolutely; reserve sidebar width on the route child. */
.rg-trans-main { left: 0; width: 100%; min-width: 0; }
.rg-trans-main.has-sidebar { left: var(--rg-sidebar-width); width: calc(100% - var(--rg-sidebar-width)); }
.rg-trans-header { box-shadow: none; }
.rg-trans-header::after { display: none; }
.rg-trans-toolbar {
  --background: #fbf0dc; --color: #173729;
  --padding-start: 0; --padding-end: 0; --min-height: 74px;
  border-bottom: 1px solid #e5d9c2;
}
.rg-trans-topbar {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; min-height: 74px; gap: 15px; padding: 9px 28px;
  font-family: 'DM Sans','Segoe UI',Arial,sans-serif;
}
.rg-trans-topbar-left { display: flex; align-items: center; gap: 15px; min-width: 0; }
.rg-topbar-brand, .rg-topbar-brand:link, .rg-topbar-brand:visited {
  font: 700 clamp(24px,2.3vw,35px)/1 Georgia,serif;
  color: #173729 !important; letter-spacing: -1.5px; white-space: nowrap; text-decoration: none;
}
.rg-topbar-brand span, .rg-topbar-brand sup { color: #be563b; }
.rg-topbar-brand sup { margin-left: 2px; font-size: 11px; }
.rg-topbar-divider { width: 1px; height: 24px; background: #dacbb4; flex: none; }
.rg-topbar-page-title { font-size: 10px; font-weight: 900; letter-spacing: 1.5px; white-space: nowrap; }
.rg-topbar-account { display: flex; align-items: center; gap: 10px; min-width: 0; }
.rg-topbar-avatar {
  flex: 0 0 43px; width: 43px; height: 43px;
  display: grid; place-items: center; border-radius: 50%;
  background: #f4b75c; color: #15392c; font: 700 17px Georgia,serif;
}
.rg-topbar-account-copy { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.rg-topbar-account-copy strong {
  max-width: 170px; overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; font-size: 12px; color: #173729;
}
.rg-topbar-account-copy small { color: #be563b; font-size: 9px; font-weight: 800; letter-spacing: 1px; }
.rg-trans-menu-toggle {
  display: none; align-items: center; justify-content: center;
  border: 0; background: transparent; color: #173729;
  padding: 8px; border-radius: 8px; cursor: pointer;
}
.rg-trans-menu-toggle ion-icon { font-size: 24px; }
.rg-trans-mobile-menu { display: none; --width: min(320px, 87vw); }
.rg-trans-mobile-menu::part(container) { background: #15392c; box-shadow: 8px 0 35px rgba(0,0,0,.2); }
.rg-drawer-content { --background: #15392c; --color: #fffaf0; }
.rg-drawer-shell { display: flex; flex-direction: column; min-height: 100%; }
.rg-drawer-shell .rg-sidebar-brand { min-height: 105px; padding: 22px 23px 19px; font-size: 30px; }
.rg-drawer-shell .rg-sidebar-profile { margin: 17px 14px 22px; }



/* Main report centered like the Organizer Dashboard: exact equal left/right gutters. */
.rg-trans-main .transparency-shell {
  width: 100%;
  min-height: 100%;
  padding: 0;
}
.rg-trans-main .transparency-container {
  width: min(1128px, calc(100% - 56px));
  max-width: 1128px;
  margin-inline: auto;
  min-width: 0;
}
.rg-trans-main .transparency-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 24px 0 15px;
  min-height: 41px;
}
.rg-trans-main .back-link,
.rg-trans-main .back-link:link,
.rg-trans-main .back-link:visited {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 11px 17px;
  min-height: 41px;
  background: #173729;
  border: 1px solid #173729;
  border-radius: 10px;
  color: #fffaf0 !important;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .5px;
  text-decoration: none;
}
.rg-trans-main .back-link ion-icon { color: #f4b75c; font-size: 18px; }
.rg-trans-main .back-link:hover { background: #295742; }
.rg-trans-main .back-link:focus-visible { outline: 3px solid #f4b75c; outline-offset: 2px; }
.rg-trans-main .page-main,
.rg-trans-main .report-hero,
.rg-trans-main .report-container,
.rg-trans-main .page-footer { width: 100%; max-width: 100%; min-width: 0; }
.rg-trans-main .report-container { margin: 0 auto; padding-top: 38px; }
.rg-trans-main .page-footer { margin-top: 12px; }
.rg-trans-main .state-box { width: 100%; }
@media (max-width: 900px) {
  .rg-trans-sidebar { display: none; }
  .rg-trans-main.has-sidebar { left: 0; width: 100%; }
  .rg-trans-mobile-menu { display: block; }
  .rg-trans-menu-toggle { display: inline-flex; }
  .rg-trans-main .transparency-container { width: calc(100% - 40px); }
  .rg-topbar-account-copy { display: none; }
}
@media (max-width: 640px) {
  .rg-trans-main .transparency-container { width: calc(100% - 28px); }
  .rg-trans-main .transparency-actions { margin: 16px 0 13px; }
  .rg-trans-topbar { padding: 8px 15px; gap: 8px; min-height: 67px; }
  .rg-trans-topbar-left { gap: 9px; }
  .rg-topbar-brand { font-size: 25px !important; }
  .rg-topbar-divider, .rg-topbar-page-title, .rg-topbar-account { display: none; }
  .rg-trans-main .report-hero { padding: 25px 20px 24px; }
  .rg-trans-main .report-container { padding-top: 27px; }
  .rg-trans-main .back-link { padding: 10px 12px; font-size: 10px; }
}
</style>