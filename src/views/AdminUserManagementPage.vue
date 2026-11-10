<template>
  <ion-page class="rg-users-page">
    <!-- Mobile administration drawer: same links as Admin Dashboard. -->
    <ion-menu v-if="$route.name === 'AdminUserManagement'"
      content-id="users-admin-main"
      menu-id="users-admin-menu"
      type="overlay"
      side="start"
      class="users-admin-menu"
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
            <span class="menu-avatar">{{ adminInitials }}</span>
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
              <ion-item button :detail="false" router-link="/admin/users" class="menu-link current-menu-link" aria-current="page">
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
            <button class="rg-sidebar-logout" type="button" @click="handleLogout">
              <ion-icon :icon="logOutOutline" aria-hidden="true" /> Log Out
            </button>
          </div>
        </div>
      </ion-content>
    </ion-menu>

    <!-- The 266px persistent desktop sidebar matches Admin Dashboard. -->
    <aside class="admin-desktop-sidebar" aria-label="Administration sidebar">
      <div class="desktop-brand">
        Relief<span>GO</span><sup>♥</sup>
        <small>ADMINISTRATION</small>
      </div>
      <div class="desktop-profile">
        <span class="menu-avatar">{{ adminInitials }}</span>
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
        <router-link to="/admin/users" active-class="desktop-active" aria-current="page">
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
        <button class="rg-sidebar-logout" type="button" @click="handleLogout">
          <ion-icon :icon="logOutOutline" aria-hidden="true" /> Log Out
        </button>
      </div>
    </aside>

    <div id="users-admin-main" class="ion-page users-admin-main">
      <ion-header class="users-header">
        <ion-toolbar class="users-toolbar">
          <div class="nav-inner">
            <div class="nav-left">
              <ion-button
                fill="clear"
                class="menu-trigger"
                aria-label="Open administration menu"
                @click="toggleAdminMenu"
              >
                <ion-icon slot="icon-only" :icon="menuOutline" />
              </ion-button>
              <router-link to="/admin" class="brand" aria-label="ReliefGO administrator dashboard">
                Relief<span>GO</span><sup>♥</sup>
              </router-link>
              <span class="nav-divider" aria-hidden="true"></span>
              <span class="nav-page-name">USER MANAGEMENT</span>
            </div>
            <div class="topbar-user" aria-label="Administrator profile">
              <span class="topbar-avatar">{{ adminInitials }}</span>
              <div class="topbar-identity">
                <strong>{{ adminName }}</strong>
                <small>ADMINISTRATOR</small>
              </div>
            </div>
          </div>
        </ion-toolbar>
      </ion-header>

    <ion-content class="users-content">
      <main class="page-wrapper">
        <section class="hero-banner" aria-labelledby="users-page-heading">
          <div class="hero-copy">
            <p class="eyebrow hero-eyebrow">RELIEFGO ADMINISTRATION ✦</p>
            <h1 id="users-page-heading">People behind <em>bayanihan.</em></h1>
            <p>View ReliefGO members, find accounts, and manage access responsibly.</p>
          </div>

          <div class="admin-identity" aria-label="Administrator profile">
            <span class="identity-avatar">{{ adminInitials }}</span>
            <div class="identity-details">
              <span class="eyebrow hero-eyebrow">ADMINISTRATOR ACCOUNT</span>
              <strong>{{ adminName }}</strong>
              <small>Community &amp; account oversight</small>
            </div>
          </div>
        </section>

        <!-- Live values: all are calculated from the existing getAllUsers() result. -->
        <section class="summary-section" aria-label="User account overview">
          <div class="summary-grid">
            <div class="summary-card">
              <ion-icon :icon="peopleOutline" class="summary-icon" />
              <span class="summary-label">REGISTERED USERS</span>
              <strong>{{ users.length }}</strong>
              <small>Total ReliefGO accounts</small>
            </div>
            <div class="summary-card">
              <ion-icon :icon="checkmarkCircleOutline" class="summary-icon" />
              <span class="summary-label">ACTIVE ACCOUNTS</span>
              <strong>{{ activeCount }}</strong>
              <small>Accounts with active access</small>
            </div>
            <div class="summary-card">
              <ion-icon :icon="banOutline" class="summary-icon" />
              <span class="summary-label">SUSPENDED ACCOUNTS</span>
              <strong>{{ suspendedCount }}</strong>
              <small>Access currently restricted</small>
            </div>
          </div>
        </section>

        <section class="directory-section" aria-labelledby="directory-heading">
          <div class="section-head">
            <div>
              <p class="eyebrow">YOUR COMMUNITY DIRECTORY</p>
              <h2 id="directory-heading">Manage <em>accounts.</em></h2>
              <p class="section-description">Search by name or email, then review each member's status.</p>
            </div>
            <div class="results-count" aria-live="polite">
              <ion-icon :icon="peopleOutline" />
              {{ filteredUsers.length }} {{ filteredUsers.length === 1 ? 'ACCOUNT' : 'ACCOUNTS' }} SHOWN
            </div>
          </div>

          <div class="search-panel">
            <label for="user-directory-search" class="field-label">SEARCH USERS</label>
            <ion-searchbar
              id="user-directory-search"
              v-model="searchText"
              class="user-searchbar"
              placeholder="Search by name or email"
              aria-label="Search users by name or email"
              :debounce="200"
              show-clear-button="focus"
            ></ion-searchbar>
            <p class="search-tip">Only regular member accounts may be suspended or reactivated.</p>
          </div>

          <div v-if="loading" class="state-box" role="status">
            <ion-spinner name="crescent" />
            <h3>Gathering member accounts</h3>
            <p>Loading users from ReliefGO...</p>
          </div>

          <div v-else-if="errorMessage" class="state-box error-state" role="alert">
            <ion-icon :icon="alertCircleOutline" class="state-icon" />
            <h3>Something went wrong</h3>
            <p>{{ errorMessage }}</p>
          </div>

          <div v-else-if="filteredUsers.length === 0" class="state-box empty-state">
            <span class="empty-icon"><ion-icon :icon="peopleOutline" /></span>
            <p class="eyebrow">NO MATCHING ACCOUNTS</p>
            <h3>No users found.</h3>
            <p v-if="searchText.trim()">Try searching with a different name or email.</p>
            <p v-else>Accounts will appear here once users register.</p>
          </div>

          <div v-else class="users-grid">
            <article v-for="user in filteredUsers" :key="user.uid" class="user-card" :class="{ 'user-card--suspended': user.isSuspended }">
              <div class="user-card-top">
                <span class="member-avatar" aria-hidden="true">{{ initialsFor(user.displayName) }}</span>
                <div class="member-info">
                  <h3>{{ user.displayName }}</h3>
                  <p class="member-email">{{ user.email }}</p>
                </div>
              </div>

              <div class="badge-row" aria-label="Account role and status">
                <span class="role-badge" :class="{ 'role-badge--admin': user.role === 'admin' }">
                  <ion-icon :icon="user.role === 'admin' ? shieldCheckmarkOutline : personOutline" />
                  {{ roleLabel(user.role) }}
                </span>
                <span class="status-badge" :class="{ 'status-badge--suspended': user.isSuspended }">
                  <span class="status-dot" aria-hidden="true"></span>
                  {{ user.isSuspended ? 'Suspended' : 'Active' }}
                </span>
              </div>

              <div class="member-meta">
                <div v-if="user.phone" class="meta-row">
                  <span><ion-icon :icon="callOutline" /> Mobile</span>
                  <strong>{{ user.phone }}</strong>
                </div>
                <div class="meta-row">
                  <span><ion-icon :icon="calendarOutline" /> Joined</span>
                  <strong>{{ formatDate(user.createdAt) }}</strong>
                </div>
              </div>

              <div class="card-actions">
                <ion-button
                  v-if="canManage(user)"
                  class="manage-button"
                  :class="user.isSuspended ? 'reactivate-button' : 'suspend-button'"
                  :disabled="busyId === user.uid"
                  @click="handleToggle(user)"
                >
                  <ion-icon slot="start" :icon="user.isSuspended ? refreshOutline : banOutline" />
                  {{ busyId === user.uid ? 'Updating...' : user.isSuspended ? 'Reactivate Account' : 'Suspend Account' }}
                </ion-button>
                <p v-else class="protected-note">
                  <ion-icon :icon="lockClosedOutline" />
                  {{ user.uid === currentUser?.uid ? 'This is your account.' : 'Administrator accounts cannot be suspended here.' }}
                </p>
              </div>
            </article>
          </div>
        </section>

        <footer class="page-footer">
          <span>Relief<span class="footer-accent">GO</span> · Community administration</span>
          <span>Every account matters. <b>Every action counts. ♥</b></span>
        </footer>
      </main>
    </ion-content>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonMenu,
  IonMenuToggle,
  IonList,
  IonItem,
  IonLabel,
  menuController,
  IonHeader,
  IonToolbar,
  IonContent,
  IonSearchbar,
  IonButton,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  alertCircleOutline,
  barChartOutline,
  banOutline,
  documentTextOutline,
  logOutOutline,
  megaphoneOutline,
  menuOutline,
  notificationsOutline,
  calendarOutline,
  callOutline,
  checkmarkCircleOutline,
  lockClosedOutline,
  peopleOutline,
  personOutline,
  refreshOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { logoutUser } from '../services/authService';
import { getAllUsers, setUserSuspended } from '../services/userService';
import type { AppUser, UserRole } from '../models/User';
import { formatDate } from '../utils/format';
import { askReason, confirmAction, confirmLogout, showToast } from '../utils/ui';

const router = useRouter();
const USERS_MENU_ID = 'users-admin-menu';

async function toggleAdminMenu() {
  await menuController.toggle(USERS_MENU_ID);
}

async function handleLogout() {
  if (!(await confirmLogout())) return;
  await menuController.close(USERS_MENU_ID).catch(() => undefined);
  await logoutUser();
  await router.replace('/welcome');
}

const users = ref<AppUser[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const searchText = ref('');
const busyId = ref('');

const suspendedCount = computed(() => users.value.filter((u) => u.isSuspended).length);
const activeCount = computed(() => users.value.length - suspendedCount.value);

const adminName = computed(() => currentUser.value?.displayName?.trim() || 'Administrator');
const adminInitials = computed(() => initialsFor(adminName.value));

function initialsFor(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'RG';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

const filteredUsers = computed(() => {
  const term = searchText.value.trim().toLowerCase();
  if (!term) return users.value;
  return users.value.filter(
    (u) => u.displayName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
  );
});

function roleLabel(role: UserRole): string {
  return role === 'admin' ? 'Administrator' : 'Member';
}

/** Admins can suspend regular accounts, but not other admins or themselves. */
function canManage(user: AppUser): boolean {
  return user.role !== 'admin' && user.uid !== currentUser.value?.uid;
}

async function loadUsers() {
  errorMessage.value = '';
  try {
    users.value = await getAllUsers();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load users.';
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(async () => {
  if (users.value.length === 0) loading.value = true;
  await loadUsers();
});

async function handleToggle(user: AppUser) {
  if (user.isSuspended) {
    const ok = await confirmAction(
      'Reactivate account',
      `Allow ${user.displayName} to log in again?`,
      'Reactivate'
    );
    if (!ok) return;
    await runAction(user, '', false, 'Account reactivated.');
    return;
  }

  const reason = await askReason(
    'Suspend account',
    `Why is ${user.displayName}'s account being suspended? They will not be able to log in. Their campaigns stay online unless you suspend them separately.`,
    'Suspend'
  );
  if (!reason) return;
  await runAction(user, reason, true, 'Account suspended.');
}

async function runAction(user: AppUser, reason: string, suspended: boolean, message: string) {
  busyId.value = user.uid;
  try {
    await setUserSuspended(user, suspended, reason);
    await loadUsers();
    await showToast(message);
  } catch (error) {
    await showToast(error instanceof Error ? error.message : 'Action failed.', 'danger');
  } finally {
    busyId.value = '';
  }
}
</script>

<style scoped>
/* Consistent with the ReliefGO Admin Dashboard and Admin Reports design. */
.rg-users-page {
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
.rg-users-page * { box-sizing: border-box; }
.rg-users-page h1, .rg-users-page h2, .rg-users-page h3, .rg-users-page p { margin-top: 0; }
.rg-users-page h1, .rg-users-page h2, .rg-users-page h3, .brand, .summary-card strong { font-family: Georgia, 'Times New Roman', serif; }
.rg-users-page a,
.rg-users-page a:link,
.rg-users-page a:visited,
.rg-users-page a:hover,
.rg-users-page a:active {
  text-decoration: none !important;
  text-decoration-line: none !important;
}


.users-header { box-shadow: none; }
.users-header::after { display: none; }
.users-toolbar {
  --background: #fbf0dc;
  --color: #173729;
  --padding-start: 0;
  --padding-end: 0;
  --min-height: 73px;
  border-bottom: 1px solid var(--border);
}
.nav-inner { min-height: 72px; width: 100%; padding: 7px clamp(17px, 3.2vw, 55px); display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.nav-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
.menu-trigger { display: none; margin: 0; --color: var(--forest); --padding-start: 5px; --padding-end: 5px; font-size: 23px; }
.topbar-user { display: flex; align-items: center; gap: 10px; min-width: 0; }
.topbar-avatar { display: grid; place-items: center; flex: 0 0 39px; width: 39px; height: 39px; border-radius: 50%; background: var(--gold); color: var(--deep); font: 700 14px Georgia, serif; }
.topbar-identity { display: flex; flex-direction: column; min-width: 0; gap: 4px; line-height: 1.3; }
.topbar-identity strong { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.topbar-identity small { color: var(--terracotta); font-size: 9px; font-weight: 800; letter-spacing: 1.2px; }
.brand { font-size: clamp(25px, 2.1vw, 33px); line-height: 1; letter-spacing: -1.9px; font-weight: 700; white-space: nowrap; }
.brand span, .brand sup { color: var(--terracotta); }
.brand sup { font-size: 12px; margin-left: 2px; vertical-align: top; }
.nav-divider { height: 22px; width: 1px; background: #d9ccb4; }
.nav-page-name { font-size: 10px; letter-spacing: 1.25px; font-weight: 800; white-space: nowrap; }

.users-content {
  --background: #fbf0dc;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}
.page-wrapper { width: 100%; max-width: 1490px; margin: auto; padding: clamp(18px, 2.2vw, 32px) clamp(16px, 3.3vw, 55px) 32px; }
.hero-banner {
  min-height: 237px; border-radius: 22px; overflow: hidden;
  background: radial-gradient(circle at 72% 105%, rgba(232,174,76,.11), transparent 42%), linear-gradient(115deg,#173729,#112b20);
  color: #fff8e7; display: flex; align-items: center; justify-content: space-between; gap: 25px;
  padding: clamp(25px, 3.1vw, 49px) clamp(25px, 4vw, 63px);
}
.hero-copy { min-width: 0; max-width: 705px; }
.eyebrow { margin: 0 0 11px; font-size: 10px; font-weight: 800; letter-spacing: 1.8px; color: var(--terracotta); }
.hero-eyebrow { color: var(--gold); }
.hero-banner h1 { font-size: clamp(35px, 3.8vw, 58px); font-weight: 400; line-height: 1.11; letter-spacing: -2.1px; margin-bottom: 13px; }
.hero-banner h1 em { color: var(--gold); font-weight: 400; }
.hero-copy > p:last-child { color: #e1e6d7; font-size: 13px; line-height: 1.8; max-width: 550px; margin: 0; }
.admin-identity {
  display: flex; align-items: center; gap: 16px; flex: 0 0 auto; min-width: 300px; max-width: 420px;
  padding: 17px; border: 1px solid rgba(255,255,255,.21); border-radius: 17px; background: rgba(255,255,255,.07);
}
.identity-avatar { width: 66px; height: 66px; flex: 0 0 66px; display: grid; place-items: center; border-radius: 50%; background: var(--gold); color: var(--deep); font: 700 24px Georgia,serif; }
.identity-details { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.identity-details .eyebrow { font-size: 9px; margin: 0; }
.identity-details strong { font: 500 clamp(18px, 1.5vw, 23px) Georgia,serif; overflow-wrap: anywhere; }
.identity-details small { color: #e1e6d7; font-size: 11px; }

.summary-section { margin-top: 19px; }
.summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 17px; }
.summary-card { background: var(--paper); border: 1px solid var(--border); border-radius: 18px; min-height: 164px; padding: 21px 25px; display: flex; flex-direction: column; align-items: flex-start; }
.summary-icon { font-size: 23px; color: var(--terracotta); margin-bottom: 14px; }
.summary-label { color: var(--terracotta); font-size: 10px; letter-spacing: 1.5px; font-weight: 800; text-transform: uppercase; }
.summary-card strong { display: block; margin: 5px 0; font-size: clamp(27px, 3vw, 42px); font-weight: 400; letter-spacing: -1px; line-height: 1.2; }
.summary-card small { font-size: 11px; color: var(--muted); }

.directory-section { margin-top: 31px; }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; margin-bottom: 21px; }
.section-head h2 { font-weight: 400; font-size: clamp(27px, 2.65vw, 40px); letter-spacing: -1.3px; line-height: 1.1; margin-bottom: 9px; }
.section-head h2 em { color: var(--terracotta); font-weight: 400; }
.section-description { font-size: 12px; color: var(--muted); line-height: 1.7; margin-bottom: 0; }
.results-count { display: inline-flex; align-items: center; gap: 9px; background: var(--paper); border: 1px solid var(--border); border-radius: 99px; padding: 12px 15px; color: var(--forest); font-size: 10px; font-weight: 800; letter-spacing: .5px; white-space: nowrap; }
.results-count ion-icon { color: var(--terracotta); font-size: 17px; }

.search-panel { background: var(--paper); border: 1px solid var(--border); border-radius: 18px; padding: clamp(17px, 2.2vw, 27px); margin-bottom: 21px; }
.field-label { display: block; margin-bottom: 5px; font-size: 10px; font-weight: 800; letter-spacing: 1.3px; color: #536257; }
.user-searchbar {
  --background: #fffdf7;
  --color: var(--forest);
  --placeholder-color: #718074;
  --icon-color: var(--terracotta);
  --clear-button-color: var(--forest);
  --box-shadow: none;
  --border-radius: 11px;
  padding: 0;
  border: 1px solid #d9cbb4;
  border-radius: 11px;
  overflow: hidden;
  min-height: 53px;
}
.user-searchbar::part(container) { min-height: 52px; }
.search-tip { margin: 10px 0 0; color: var(--muted); font-size: 11px; line-height: 1.6; }

.users-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 17px; }
.user-card { min-width: 0; background: var(--paper); border: 1px solid var(--border); border-radius: 19px; padding: clamp(18px, 2vw, 27px); display: flex; flex-direction: column; min-height: 298px; }
.user-card--suspended { border-color: #e2b9a3; background: #fff8ee; }
.user-card-top { display: flex; align-items: center; gap: 14px; min-width: 0; }
.member-avatar { width: 57px; height: 57px; flex: 0 0 57px; display: grid; place-items: center; border-radius: 50%; background: #efe4c8; border: 1px solid #e5d4af; color: var(--forest); font: 700 20px Georgia,serif; }
.member-info { min-width: 0; }
.member-info h3 { font-size: clamp(21px, 1.8vw, 26px); font-weight: 400; letter-spacing: -.45px; margin-bottom: 4px; overflow-wrap: anywhere; }
.member-email { font-size: 12px; color: #667464; margin-bottom: 0; overflow-wrap: anywhere; }
.badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 19px 0 16px; }
.role-badge, .status-badge { min-height: 30px; display: inline-flex; align-items: center; gap: 6px; padding: 7px 11px; border: 1px solid #d7decf; border-radius: 999px; font-size: 10px; line-height: 1; font-weight: 800; background: #e9efe6; color: #28503a; }
.role-badge ion-icon { font-size: 14px; }
.role-badge--admin { color: #734b29; background: #f7e6c7; border-color: #ebd7ae; }
.status-badge { background: #eaf2e7; color: #2e6543; }
.status-dot { height: 7px; width: 7px; border-radius: 50%; background: #449862; }
.status-badge--suspended { background: #fbede5; color: #a14832; border-color: #f0d5c7; }
.status-badge--suspended .status-dot { background: #be563b; }
.member-meta { border-top: 1px solid var(--border); padding-top: 14px; display: flex; flex-direction: column; gap: 11px; }
.meta-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; min-width: 0; font-size: 12px; }
.meta-row > span { display: inline-flex; align-items: center; gap: 7px; flex: 0 0 auto; color: var(--muted); }
.meta-row ion-icon { color: var(--terracotta); font-size: 16px; }
.meta-row strong { min-width: 0; text-align: right; color: var(--forest); font-weight: 700; overflow-wrap: anywhere; }
.card-actions { margin-top: auto; padding-top: 17px; }
.manage-button { --border-radius: 24px; --box-shadow: none; --background: var(--forest); --color: #fffaf0; --padding-start: 17px; --padding-end: 17px; min-height: 43px; font-size: 11px; font-weight: 800; letter-spacing: .2px; text-transform: none; margin: 0; }
.manage-button ion-icon { font-size: 17px; }
.suspend-button { --background: #fff7ee; --color: #9c4b34; --border-width: 1px; --border-style: solid; --border-color: #ddac98; }
.suspend-button:hover { --background: #f5e4d7; }
.reactivate-button:hover { --background: #265640; }
.protected-note { margin: 0; color: #7b766c; font-size: 11px; line-height: 1.6; display: flex; align-items: flex-start; gap: 8px; }
.protected-note ion-icon { font-size: 15px; color: var(--terracotta); flex: 0 0 auto; }

.state-box { padding: 52px 22px; text-align: center; border: 1px solid var(--border); border-radius: 18px; background: var(--paper); color: var(--forest); }
.state-box ion-spinner, .state-icon { color: var(--terracotta); font-size: 39px; }
.state-box h3 { font-size: 25px; font-weight: 400; margin: 15px 0 10px; }
.state-box p { font-size: 13px; color: var(--muted); margin-bottom: 0; line-height: 1.7; }
.error-state .state-icon { color: #af4d3d; }
.empty-icon { display: inline-grid; place-items: center; width: 70px; height: 70px; border-radius: 50%; background: #f4e6ca; color: var(--terracotta); margin-bottom: 18px; }
.empty-icon ion-icon { font-size: 33px; }
.empty-state .eyebrow { font-size: 9px; color: var(--terracotta); }
.empty-state h3 { margin-top: 5px; }
.page-footer { display: flex; justify-content: space-between; gap: 12px; padding: 30px 3px 5px; font-size: 11px; color: var(--muted); }
.page-footer b, .footer-accent { color: var(--terracotta); }

@media (max-width: 950px) {
  .hero-banner { align-items: flex-start; flex-direction: column; gap: 23px; }
  .admin-identity { min-width: 0; width: min(100%,420px); }
  .users-grid { grid-template-columns: 1fr; }
}
@media (max-width: 610px) {
  .nav-inner { min-height: 65px; gap: 9px; padding-inline: 15px; }
  .nav-left { gap: 7px; }
  .brand { font-size: 26px; }
  .nav-divider, .nav-page-name, .topbar-identity { display: none; }
  .page-wrapper { padding: 16px 13px 24px; }
  .hero-banner { padding: 25px 21px; min-height: 0; border-radius: 18px; }
  .hero-banner h1 { font-size: clamp(31px, 8vw, 42px); }
  .hero-copy > p:last-child { font-size: 12px; }
  .admin-identity { gap: 11px; padding: 13px; }
  .identity-avatar { width: 52px; height: 52px; flex-basis: 52px; font-size: 18px; }
  .identity-details strong { font-size: 18px; }
  .summary-grid { gap: 9px; }
  .summary-card { min-height: 141px; padding: 15px 13px; }
  .summary-card .summary-icon { font-size: 20px; margin-bottom: 8px; }
  .summary-label { font-size: 9px; letter-spacing: .6px; }
  .summary-card strong { font-size: clamp(22px, 5.8vw, 29px); }
  .summary-card small { font-size: 10px; }
  .directory-section { margin-top: 26px; }
  .section-head { flex-direction: column; align-items: flex-start; }
  .results-count { padding: 9px 12px; }
  .search-panel { padding: 17px 14px; }
  .user-card { min-height: 0; padding: 18px 15px; }
  .member-info h3 { font-size: 22px; }
  .member-avatar { width: 51px; height: 51px; flex-basis: 51px; font-size: 17px; }
  .meta-row { font-size: 11px; }
  .manage-button { width: 100%; }
  .page-footer { flex-direction: column; text-align: center; }
}
@media (max-width: 390px) {
  .summary-grid { grid-template-columns: 1fr; }
  .summary-card { min-height: 119px; }
}

/* --------------------------------------------------------------------------
   ADMIN SIDEBAR — dashboard-matching 266px desktop / mobile drawer
   -------------------------------------------------------------------------- */
.rg-users-page .users-admin-main {
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
.users-admin-menu { display: none; --width: min(355px, 87vw); --background: var(--cream); }
.users-admin-menu::part(container) { border-radius: 0 24px 24px 0; box-shadow: 7px 0 35px rgba(16,42,32,.17); }
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
.rg-users-page .page-wrapper {
  width: 100%;
  max-width: 1490px;
  margin: 0 auto;
  padding: clamp(18px, 2.2vw, 32px) clamp(16px, 3.3vw, 55px) 32px;
}

@media (max-width: 900px) {
  .admin-desktop-sidebar { display: none; }
  .rg-users-page .users-admin-main { left: 0; width: 100%; }
  .users-admin-menu { display: block; }
  .menu-trigger { display: inline-flex; }
  .topbar-identity { display: none; }
  .rg-users-page .page-wrapper { padding-inline: clamp(16px, 3.3vw, 30px); }
}
@media (max-width: 610px) {
  .rg-users-page .page-wrapper { padding: 16px 13px 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .desktop-links a { transition: none; }
}
</style>