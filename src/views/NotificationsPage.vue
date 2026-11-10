<template>
  <ion-page class="rg-notifications-page" :class="{ 'admin-notifications-page': isAdmin }">
    <!-- ADMIN: same persistent sidebar as AdminDashboardPage.vue. -->
    <ion-menu
      v-if="isAdmin && $route.name === 'Notifications'"
      content-id="notifications-main"
      menu-id="notifications-admin-menu"
      type="overlay"
      side="start"
      class="notifications-admin-menu"
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
            <span class="menu-avatar">{{ userInitials }}</span>
            <div>
              <span>ADMINISTRATOR ACCOUNT</span>
              <strong>{{ displayName }}</strong>
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
              <ion-item button :detail="false" router-link="/notifications" class="menu-link current-menu-link" aria-current="page">
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

    <aside v-if="isAdmin" class="admin-desktop-sidebar" aria-label="Administration sidebar">
      <div class="desktop-brand">Relief<span>GO</span><sup>♥</sup><small>ADMINISTRATION</small></div>
      <div class="desktop-profile">
        <span class="menu-avatar">{{ userInitials }}</span>
        <div><small>ADMINISTRATOR</small><strong>{{ displayName }}</strong></div>
      </div>
      <p class="desktop-nav-title">MANAGEMENT TOOLS</p>
      <nav class="desktop-links" aria-label="Administration links">
        <router-link to="/admin" exact-active-class="desktop-active"><ion-icon :icon="barChartOutline" /> Dashboard</router-link>
        <router-link to="/notifications" active-class="desktop-active" aria-current="page"><ion-icon :icon="notificationsOutline" /> Notifications</router-link>
        <router-link to="/admin/campaigns" active-class="desktop-active"><ion-icon :icon="megaphoneOutline" /> Campaign &amp; Events</router-link>
        <router-link to="/admin/users" active-class="desktop-active"><ion-icon :icon="peopleOutline" /> User Management</router-link>
        <router-link to="/admin/reports" active-class="desktop-active"><ion-icon :icon="barChartOutline" /> Reports</router-link>
        <router-link to="/admin/audit-logs" active-class="desktop-active"><ion-icon :icon="documentTextOutline" /> Audit Logs</router-link>
      </nav>
      <div class="desktop-sidebar-bottom">
        <span>Small acts. Big hearts. ✦</span>
        <button class="rg-sidebar-logout" type="button" @click="handleLogout">
          <ion-icon :icon="logOutOutline" aria-hidden="true" /> Log Out
        </button>
      </div>
    </aside>

    <div class="ion-page notification-main" id="notifications-main">
      <ion-header class="rg-header">
        <nav class="rg-navbar" aria-label="Notifications navigation">
          <div class="nav-identity">
            <ion-button
              v-if="isAdmin"
              fill="clear"
              class="menu-trigger"
              aria-label="Open administration menu"
              @click="toggleAdminMenu"
            >
              <ion-icon slot="icon-only" :icon="menuOutline" />
            </ion-button>
            <router-link :to="backHref" class="rg-brand" aria-label="ReliefGO dashboard">
              Relief<span>GO</span><b>♥</b>
            </router-link>
            <template v-if="isAdmin">
              <span class="brand-divider" aria-hidden="true"></span>
              <span class="page-label">NOTIFICATIONS</span>
            </template>
          </div>

          <div class="nav-actions">
            <button
              type="button"
              class="mark-all-button"
              :disabled="unreadCount === 0"
              @click="handleMarkAll"
            >
              <ion-icon :icon="checkmarkDoneOutline" aria-hidden="true" />
              <span>MARK ALL READ</span>
            </button>
            <div v-if="isAdmin" class="topbar-user" aria-label="Administrator profile">
              <span class="topbar-avatar">{{ userInitials }}</span>
              <span class="topbar-identity"><strong>{{ displayName }}</strong><small>ADMINISTRATOR</small></span>
            </div>
            <router-link v-else :to="backHref" class="back-link" aria-label="Back to dashboard">
              <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
              <span>BACK TO DASHBOARD</span>
            </router-link>
          </div>
        </nav>
      </ion-header>

    <!-- Notifications can grow, so this content area scrolls naturally. -->
    <ion-content class="rg-content">
      <div class="page-shell">
        <main class="page-main">
          <section class="welcome-banner" aria-labelledby="notification-page-title">
            <div class="banner-copy">
              <p class="eyebrow">YOUR RELIEFGO UPDATES <span>✦</span></p>
              <h1 id="notification-page-title">Your <em>Notifications.</em></h1>
              <p class="banner-description">
                Follow the latest updates about your donations, campaigns, and relief efforts.
                Every message keeps your bayanihan journey connected.
              </p>
            </div>
            <div class="profile-card">
              <span class="profile-avatar" aria-hidden="true">{{ userInitials }}</span>
              <div class="profile-copy">
                <span class="profile-label">{{ accountRole }} ACCOUNT</span>
                <strong>{{ displayName }}</strong>
                <small>{{ unreadCount === 0 ? 'You are all caught up' : `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}` }}</small>
              </div>
            </div>
          </section>

          <!-- Only counts from the existing live notification service. -->
          <section class="stats-grid" aria-label="Notification summary">
            <div class="stat-box">
              <ion-icon :icon="notificationsOutline" aria-hidden="true" />
              <span class="stat-label">ALL NOTIFICATIONS</span>
              <strong>{{ notifications.length }}</strong>
              <small>Messages received</small>
            </div>
            <div class="stat-box">
              <ion-icon :icon="mailUnreadOutline" aria-hidden="true" />
              <span class="stat-label">UNREAD UPDATES</span>
              <strong>{{ unreadCount }}</strong>
              <small>Waiting for your attention</small>
            </div>
            <div class="stat-box">
              <ion-icon :icon="checkmarkCircleOutline" aria-hidden="true" />
              <span class="stat-label">READ UPDATES</span>
              <strong>{{ readCount }}</strong>
              <small>Already reviewed</small>
            </div>
          </section>

          <section class="updates-section" aria-labelledby="updates-heading">
            <div class="section-heading">
              <div>
                <p class="section-eyebrow">SMALL ACTS. BIG HEARTS.</p>
                <h2 id="updates-heading">Your latest <em>updates.</em></h2>
                <p>{{ notifications.length === 0 ? 'Important news about your bayanihan journey will appear here.' : `${notifications.length} ${notifications.length === 1 ? 'notification' : 'notifications'} in your inbox.` }}</p>
              </div>
              <span v-if="unreadCount > 0" class="unread-pill">
                <span aria-hidden="true"></span>
                {{ unreadCount }} UNREAD
              </span>
            </div>

            <!-- Empty state -->
            <div v-if="notifications.length === 0" class="empty-card">
              <div class="empty-icon" aria-hidden="true">
                <ion-icon :icon="notificationsOffOutline" />
                <span>✦</span>
              </div>
              <p class="empty-kicker">ALL CAUGHT UP</p>
              <h3>No notifications yet.</h3>
              <p>
                When something changes in a donation or campaign, you will find
                the latest information right here.
              </p>
              <router-link to="/campaigns" class="action-button">
                EXPLORE CAMPAIGNS
                <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
              </router-link>
            </div>

            <!-- Read/delete actions remain independent, so buttons don't overlap. -->
            <div v-else class="notifications-list" aria-label="Notification list">
              <article
                v-for="item in notifications"
                :key="item.id"
                class="notification-card"
                :class="{ 'is-unread': !item.isRead }"
              >
                <button
                  type="button"
                  class="notification-open"
                  :aria-label="`Open notification: ${item.title}`"
                  @click="openNotification(item)"
                >
                  <span class="notification-icon" aria-hidden="true">
                    <ion-icon :icon="iconFor(item.type)" />
                  </span>

                  <span class="notification-content">
                    <span class="notification-topline">
                      <span class="notification-type">{{ labelFor(item.type) }}</span>
                      <span v-if="!item.isRead" class="new-tag">NEW</span>
                    </span>
                    <strong class="notification-title">{{ item.title }}</strong>
                    <span class="notification-message">{{ item.message }}</span>
                    <time class="notification-time" :datetime="item.createdAt">
                      <ion-icon :icon="timeOutline" aria-hidden="true" />
                      {{ formatTime(item.createdAt) }}
                    </time>
                  </span>
                  <ion-icon class="open-arrow" :icon="chevronForwardOutline" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  class="delete-button"
                  :aria-label="`Delete notification: ${item.title}`"
                  title="Delete notification"
                  @click="handleDelete(item)"
                >
                  <ion-icon :icon="trashOutline" aria-hidden="true" />
                </button>
              </article>
            </div>
          </section>
        </main>

        <footer class="page-footer">
          <span>© {{ new Date().getFullYear() }} ReliefGO</span>
          <span>Stories of bayanihan live here.</span>
        </footer>
      </div>
    </ion-content>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonMenu,
  IonMenuToggle,
  IonHeader,
  IonToolbar,
  IonButton,
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  menuController,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  arrowBackOutline,
  arrowForwardOutline,
  cashOutline,
  checkmarkCircleOutline,
  checkmarkDoneOutline,
  chevronForwardOutline,
  heartOutline,
  mailUnreadOutline,
  megaphoneOutline,
  notificationsOffOutline,
  notificationsOutline,
  timeOutline,
  trashOutline,
  barChartOutline,
  documentTextOutline,
  peopleOutline,
  logOutOutline,
  menuOutline,
} from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { logoutUser } from '../services/authService';
import {
  deleteNotification,
  markAllAsRead,
  markAsRead,
  notifications,
  startNotificationListener,
  unreadCount,
} from '../services/notificationService';
import type { AppNotification, NotificationType } from '../models/Notification';
import { dashboardPathForRole } from '../utils/roles';
import { confirmLogout, showToast } from '../utils/ui';

const router = useRouter();
const isAdmin = computed(() => currentUser.value?.role === 'admin');
const ADMIN_MENU_ID = 'notifications-admin-menu';

async function toggleAdminMenu() {
  if (!isAdmin.value) return;
  await menuController.toggle(ADMIN_MENU_ID);
}

async function handleLogout() {
  if (!await confirmLogout()) return;
  await menuController.close(ADMIN_MENU_ID).catch(() => undefined);
  await logoutUser();
  await router.replace('/welcome');
}


const backHref = computed(() =>
  currentUser.value ? dashboardPathForRole(currentUser.value.role) : '/welcome'
);
const displayName = computed(() => currentUser.value?.displayName?.trim() || 'ReliefGO Member');
const userInitials = computed(() => {
  const parts = displayName.value.split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) || 'R';
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) || '' : '';
  return (first + last).toUpperCase();
});
const accountRole = computed(() =>
  String(currentUser.value?.role || 'member').toUpperCase()
);
const readCount = computed(() => Math.max(0, notifications.value.length - unreadCount.value));

// Continue the existing live notification listener after navigation/refresh.
onIonViewWillEnter(() => {
  if (currentUser.value) startNotificationListener(currentUser.value.uid);
});

function iconFor(type: NotificationType): string {
  if (type === 'donation') return heartOutline;
  if (type === 'expense') return cashOutline;
  return megaphoneOutline;
}

function labelFor(type: NotificationType): string {
  if (type === 'donation') return 'DONATION UPDATE';
  if (type === 'expense') return 'EXPENSE UPDATE';
  return 'CAMPAIGN UPDATE';
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

async function openNotification(item: AppNotification) {
  const user = currentUser.value;
  if (!user) return;

  if (!item.isRead) {
    try {
      await markAsRead(user.uid, item.id);
    } catch (error) {
      console.error(error); // Still open the destination if marking fails.
    }
  }
  const link = typeof item.link === 'string' ? item.link.trim() : '';
  // A notification may only open an in-app route, not an external URL or an unhandled path.
  if (!link.startsWith('/') || link.startsWith('//') || /[\\]/.test(link)) {
    await showToast('This notification has an invalid destination.', 'danger');
    return;
  }
  const target = router.resolve(link);
  if (!target.matched.length || target.matched.some(route => route.name === undefined && route.path.includes(':pathMatch'))) {
    await showToast('This related page is no longer available.', 'danger');
    return;
  }
  const allowed = target.meta.roles as string[] | undefined;
  if (allowed?.length && !allowed.includes(user.role)) {
    await showToast('You do not have access to this record.', 'danger');
    return;
  }
  try { await router.push(link); }
  catch { await showToast('Unable to open the related record. Please try again.', 'danger'); }
}

async function handleMarkAll() {
  const user = currentUser.value;
  if (!user) return;

  try {
    const unreadIds = notifications.value.filter((item) => !item.isRead).map((item) => item.id);
    await markAllAsRead(user.uid, unreadIds);
  } catch (error) {
    await showToast(error instanceof Error ? error.message : 'Could not update.', 'danger');
  }
}

async function handleDelete(item: AppNotification) {
  const user = currentUser.value;
  if (!user) return;

  try {
    await deleteNotification(user.uid, item.id);
  } catch (error) {
    await showToast(error instanceof Error ? error.message : 'Could not delete.', 'danger');
  }
}
</script>

<style scoped>
/* Consistent ReliefGO palette shared with My Donations and My Campaigns. */
.rg-notifications-page {
  --forest: #173729;
  --deep: #112b20;
  --cream: #fbf0dc;
  --terracotta: #be563b;
  --gold: #f3b75d;
  --muted: #667365;
  background: var(--cream);
  color: var(--forest);
}
.rg-content {
  --background: #fbf0dc;
  --color: #173729;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}
.rg-content::part(background),
.rg-content::part(scroll) { background: #fbf0dc; }
.rg-notifications-page, .rg-notifications-page * { box-sizing: border-box; }
.rg-notifications-page a { text-decoration: none; }
button { font: inherit; }
button:focus-visible, a:focus-visible { outline: 3px solid var(--terracotta); outline-offset: 3px; }

/* Cream navigation: logo left, navigation buttons on the right. */
.rg-header { background: var(--cream); box-shadow: none; }
.rg-header::after { display: none; }
.rg-navbar {
  min-height: 75px;
  padding: 8px clamp(18px, 4vw, 64px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid #e7ddc8;
  background: var(--cream);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
}
.rg-brand {
  flex-shrink: 0;
  white-space: nowrap;
  color: var(--forest);
  font: 700 clamp(27px, 2.6vw, 35px)/1 Georgia, 'Times New Roman', serif;
  letter-spacing: -2px;
}
.rg-brand span, .rg-brand b { color: var(--terracotta); }
.rg-brand b { font-size: 12px; letter-spacing: 0; vertical-align: top; }
.nav-actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 14px; }
.back-link, .mark-all-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  color: var(--forest);
  font-size: 10px;
  letter-spacing: 1px;
  font-weight: 800;
  white-space: nowrap;
}
.back-link ion-icon, .mark-all-button ion-icon { font-size: 18px; }
.back-link:hover { color: var(--terracotta); }
.mark-all-button {
  padding: 10px 15px;
  border: 1px solid #d9ccb1;
  border-radius: 30px;
  background: transparent;
  cursor: pointer;
  transition: background .2s, border-color .2s;
}
.mark-all-button:not(:disabled):hover { background: #eee4ce; border-color: #cfb789; }
.mark-all-button:disabled { opacity: .44; cursor: not-allowed; }

.page-shell {
  width: 100%;
  min-height: calc(100dvh - 75px);
  display: flex;
  flex-direction: column;
  padding: 22px clamp(18px, 4vw, 64px) 0;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
}
.page-main { width: min(100%, 1380px); margin: 0 auto; }

/* Forest green welcome banner and automatically generated user initials. */
.welcome-banner {
  position: relative;
  isolation: isolate;
  min-height: 212px;
  padding: clamp(26px, 3vw, 42px) clamp(25px, 4vw, 58px);
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(220px, .7fr);
  align-items: center;
  gap: 32px;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(120deg, var(--forest), var(--deep));
  color: #fff8e8;
}
.welcome-banner::after {
  content: '';
  position: absolute;
  z-index: -1;
  right: 16%;
  bottom: -190px;
  width: 355px;
  height: 355px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232, 174, 76, .14), transparent 67%);
  pointer-events: none;
}
.banner-copy, .profile-card { min-width: 0; }
.eyebrow, .profile-label, .section-eyebrow, .stat-label, .notification-type, .empty-kicker {
  font-size: 10px;
  letter-spacing: 1.6px;
  font-weight: 800;
}
.eyebrow { margin: 0 0 13px; color: var(--gold); }
.eyebrow span { color: #fff8e8; }
.banner-copy h1 {
  margin: 0 0 12px;
  font: 400 clamp(36px, 4vw, 56px)/1.08 Georgia, 'Times New Roman', serif;
  letter-spacing: -1.5px;
}
.banner-copy h1 em { color: var(--gold); font-weight: 400; }
.banner-description { max-width: 620px; margin: 0; color: #dbe4d8; line-height: 1.65; font-size: 13px; }
.profile-card {
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid rgba(255, 248, 232, .2);
  background: rgba(255, 248, 232, .07);
  padding: 16px;
  border-radius: 17px;
}
.profile-avatar {
  flex: 0 0 62px;
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--gold);
  color: var(--deep);
  font: 700 25px Georgia, serif;
}
.profile-copy { display: flex; min-width: 0; flex-direction: column; gap: 5px; }
.profile-label { color: var(--gold); }
.profile-copy strong { font: 400 clamp(19px, 1.8vw, 25px)/1.25 Georgia, serif; overflow-wrap: anywhere; }
.profile-copy small { font-size: 11px; color: #dbe4d8; }

.stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 19px; }
.stat-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 18px 22px 19px;
  background: #fff9ed;
  border: 1px solid #eadfca;
  border-radius: 17px;
}
.stat-box ion-icon { font-size: 23px; color: var(--terracotta); margin-bottom: 3px; }
.stat-label { color: var(--terracotta); }
.stat-box strong { font: 400 clamp(24px, 2.5vw, 38px)/1.1 Georgia, serif; }
.stat-box small { color: #6a7466; font-size: 11px; }

.updates-section { padding: 35px 0 44px; }
.section-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 22px; }
.section-eyebrow { color: var(--terracotta); margin: 0 0 7px; }
.section-heading h2 { margin: 0 0 7px; color: var(--forest); font: 400 clamp(30px, 3vw, 43px)/1.15 Georgia, serif; }
.section-heading h2 em { color: var(--terracotta); font-weight: 400; }
.section-heading p:not(.section-eyebrow) { margin: 0; color: #687568; font-size: 13px; }
.unread-pill { display: inline-flex; align-items: center; gap: 8px; color: var(--forest); font-size: 10px; letter-spacing: 1px; font-weight: 800; white-space: nowrap; padding: 10px 13px; background: #ede9d8; border-radius: 999px; }
.unread-pill span { width: 8px; height: 8px; border-radius: 50%; background: var(--terracotta); }

/* Empty state has one clear explore action, no duplicate CTA. */
.empty-card {
  min-height: 288px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 34px 24px 38px;
  text-align: center;
  border: 1px solid #e4dac7;
  border-radius: 20px;
  background: #fff9ed;
}
.empty-icon { position: relative; display: grid; place-items: center; width: 69px; height: 69px; margin-bottom: 15px; border-radius: 50%; background: #f4e7ca; color: var(--terracotta); }
.empty-icon ion-icon { font-size: 34px; }
.empty-icon span { position: absolute; top: 5px; right: 4px; font-size: 16px; color: #b99042; }
.empty-kicker { margin: 0 0 8px; color: var(--terracotta); }
.empty-card h3 { margin: 0 0 10px; color: var(--forest); font: 400 32px Georgia, serif; }
.empty-card > p:not(.empty-kicker) { margin: 0 0 19px; max-width: 460px; color: #6b756b; font-size: 13px; line-height: 1.65; }
.action-button { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 21px; border-radius: 100px; color: var(--deep); background: var(--gold); font-size: 11px; font-weight: 800; letter-spacing: .9px; transition: background .2s; }
.action-button:hover { background: #f2bd63; }
.action-button ion-icon { font-size: 17px; }

/* Notification cards: complete click target + separate delete button. */
.notifications-list { display: flex; flex-direction: column; gap: 12px; }
.notification-card { position: relative; display: flex; align-items: stretch; min-width: 0; border: 1px solid #e5dac5; border-radius: 17px; background: #fff9ed; overflow: hidden; transition: border-color .2s, box-shadow .2s; }
.notification-card:hover { border-color: #dbc193; box-shadow: 0 8px 24px rgba(24,60,44,.07); }
.notification-card.is-unread { border-color: #d5b578; background: #fff5e3; }
.notification-open { display: flex; align-items: center; flex: 1 1 auto; min-width: 0; gap: 17px; padding: 22px 14px 22px 22px; border: 0; background: transparent; color: var(--forest); text-align: left; cursor: pointer; }
.notification-icon { display: grid; place-items: center; width: 55px; height: 55px; flex: 0 0 55px; border-radius: 14px; background: #f4e7ce; color: var(--terracotta); }
.notification-icon ion-icon { font-size: 26px; }
.notification-card.is-unread .notification-icon { background: #e5eedf; color: #3b7752; }
.notification-content { display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1 1 auto; }
.notification-topline { display: flex; gap: 9px; align-items: center; flex-wrap: wrap; }
.notification-type { color: var(--terracotta); }
.new-tag { padding: 4px 7px; border-radius: 100px; color: var(--deep); background: var(--gold); font-size: 9px; font-weight: 900; letter-spacing: .7px; }
.notification-title { font: 400 clamp(19px, 1.6vw, 24px)/1.22 Georgia, serif; overflow-wrap: anywhere; }
.notification-card.is-unread .notification-title { font-weight: 700; }
.notification-message { color: #5d6a5f; font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
.notification-time { display: inline-flex; align-items: center; gap: 6px; margin-top: 3px; color: #858b7b; font-size: 11px; }
.notification-time ion-icon { font-size: 13px; }
.open-arrow { font-size: 20px; color: var(--terracotta); flex: 0 0 20px; }
.delete-button { align-self: center; display: grid; place-items: center; width: 42px; height: 42px; margin: 0 15px 0 0; flex: 0 0 42px; border: 1px solid #ead7d0; border-radius: 50%; background: #fff9ed; color: #ac5b47; cursor: pointer; transition: background .2s; }
.delete-button ion-icon { font-size: 19px; }
.delete-button:hover { background: #fbece8; }

.page-footer { width: min(100%, 1380px); margin: auto auto 0; padding: 17px 0; border-top: 1px solid #e7ddc8; display: flex; justify-content: space-between; gap: 12px; color: #6b7769; font-size: 11px; }

/* ADMIN ONLY: same 266px dark-green sidebar as AdminDashboardPage.vue. */
.notification-main { width: 100%; min-width: 0; }
.nav-identity { display: flex; align-items: center; min-width: 0; gap: 14px; }
.brand-divider { width: 1px; height: 23px; background: #d9ccb4; }
.page-label { color: var(--forest); white-space: nowrap; font-size: 10px; font-weight: 800; letter-spacing: 1.25px; }
.menu-trigger { display: none; margin: 0; --color: var(--forest); --padding-start: 4px; --padding-end: 4px; font-size: 23px; }
.topbar-user { display: flex; align-items: center; gap: 10px; margin-left: 9px; }
.topbar-avatar { display: grid; place-items: center; width: 41px; height: 41px; border-radius: 50%; flex: none; background: var(--gold); color: var(--deep); font: 700 14px Georgia, serif; }
.topbar-identity { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.topbar-identity strong { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px; }
.topbar-identity small { color: var(--terracotta); font-size: 9px; font-weight: 800; letter-spacing: 1.1px; }
.admin-desktop-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 100;
  width: 266px;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #123527;
  color: #fffaf0;
  box-shadow: 5px 0 22px #112b2021;
}
.desktop-brand { padding: 30px 22px 27px; font: 700 28px Georgia,serif; border-bottom: 1px solid #ffffff25; }
.desktop-brand span, .desktop-brand sup { color: var(--gold); }
.desktop-brand sup { font-size: 12px; margin-left: 2px; }
.desktop-brand small { display: block; font: 800 9px 'DM Sans',sans-serif; letter-spacing: 2px; margin-top: 10px; color: #ecd8a7; }
.desktop-profile { display: flex; align-items: center; gap: 12px; margin: 21px 14px; padding: 13px 10px; border-radius: 14px; background: #ffffff11; min-width: 0; }
.desktop-profile > div { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.desktop-profile strong { font-size: 13px; overflow-wrap: anywhere; }
.desktop-profile small { font-size: 9px; color: #f0cc91; letter-spacing: .9px; }
.menu-avatar { flex: 0 0 49px; width: 49px; height: 49px; display: grid; place-items: center; background: var(--gold); color: var(--deep); border-radius: 50%; font: 700 18px Georgia,serif; }
.desktop-nav-title { margin: 13px 22px 12px; color: var(--gold); font-size: 10px; letter-spacing: 1.3px; font-weight: 800; }
.desktop-links { display: grid; align-content: start; gap: 5px; padding: 0 12px; overflow-y: auto; min-height: 0; flex: 1 1 auto; }
.desktop-links a { display: flex; align-items: center; gap: 13px; min-height: 49px; padding: 12px 13px; color: #fbf0dc; font-size: 12px; font-weight: 750; border-radius: 12px; transition: background .2s; }
.desktop-links a ion-icon { font-size: 20px; flex: none; color: var(--gold); }
.desktop-links a:hover, .desktop-links a.desktop-active { background: #ffffff22; color: #fff; }
.desktop-sidebar-bottom { flex-shrink: 0; margin: auto 17px 0; padding: 25px 5px; font: italic 14px Georgia,serif; color: #e4ceb3; border-top: 1px solid #ffffff25; }
.desktop-sidebar-bottom > span { display: block; }
.admin-notifications-page .notification-main { left: 266px; width: calc(100% - 266px); }
.admin-notifications-page .rg-navbar { min-height: 74px; padding-inline: clamp(17px, 3.2vw, 55px); }
.admin-notifications-page .page-shell { padding: 24px clamp(18px, 3.2vw, 55px) 0; }
.notifications-admin-menu { display: none; --width: min(355px, 87vw); --background: #fbf0dc; }
.notifications-admin-menu::part(container) { border-radius: 0 24px 24px 0; box-shadow: 7px 0 35px rgba(16,42,32,.17); }
.menu-toolbar { --background: var(--forest); --min-height: 108px; }
.menu-heading { display: flex; flex-direction: column; gap: 7px; padding: 20px 25px; }
.menu-brand { color: #fff8e7; font: 700 30px Georgia,serif; letter-spacing: -1.5px; }
.menu-brand span, .menu-brand sup { color: var(--gold); }
.menu-brand sup { font-size: 13px; margin-left: 3px; }
.menu-heading small { color: #e8c77f; font-size: 9px; font-weight: 800; letter-spacing: 2px; }
.menu-content { --background: #fbf0dc; }
.mobile-menu-body { display: flex; flex-direction: column; min-height: 100%; padding: 20px 0 0; }
.menu-profile { display: flex; align-items: center; gap: 13px; margin: 0 18px 25px; padding: 16px; background: #fffaf0; border: 1px solid #e9ddc7; border-radius: 18px; }
.menu-profile > div { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.menu-profile > div > span { color: var(--terracotta); font-size: 9px; font-weight: 800; letter-spacing: 1px; }
.menu-profile strong { overflow-wrap: anywhere; font: 500 17px Georgia,serif; }
.menu-label { margin: 0 28px 12px; color: var(--terracotta); font-size: 10px; font-weight: 800; letter-spacing: 1.8px; }
.mobile-nav { background: transparent; padding: 0 13px; }
.menu-link { --background: transparent; --background-hover: #eee1c7; --border-radius: 12px; --padding-start: 15px; --inner-padding-end: 14px; --min-height: 52px; margin-bottom: 4px; color: var(--forest); font-size: 13px; font-weight: 700; }
.menu-link ion-icon[slot="start"] { color: var(--terracotta); font-size: 20px; margin-right: 13px; }
.current-menu-link { --background: #eee1c7; }
.mobile-sidebar-bottom { margin: auto 22px 0; padding: 22px 4px; border-top: 1px solid #e9ddc7; color: var(--muted); font: italic 13px Georgia,serif; }
.mobile-sidebar-bottom > span { display: block; }
.rg-sidebar-logout { display: flex; align-items: center; justify-content: center; gap: 9px; min-height: 44px; width: 100%; margin-top: 14px; border-radius: 12px; background: var(--gold); color: var(--forest); font: 800 12px 'Segoe UI',sans-serif; border: 1px solid var(--gold); cursor: pointer; }
.rg-sidebar-logout:hover { background: #ffdfa3; }
.rg-sidebar-logout:focus-visible { outline: 3px solid var(--terracotta); outline-offset: 2px; }
@media (max-width: 900px) {
  .admin-notifications-page .admin-desktop-sidebar { display: none; }
  .admin-notifications-page .notification-main { left: 0; width: 100%; }
  .admin-notifications-page .notifications-admin-menu { display: block; }
  .admin-notifications-page .menu-trigger { display: inline-flex; }
  .admin-notifications-page .rg-navbar { padding-inline: 15px; }
  .admin-notifications-page .topbar-identity { display: none; }
}
@media (max-width: 480px) {
  .admin-notifications-page .brand-divider, .admin-notifications-page .page-label { display: none; }
  .admin-notifications-page .nav-identity { gap: 4px; }
  .admin-notifications-page .topbar-user { display: none; }
  .admin-notifications-page .rg-brand { font-size: 27px; }
  .admin-notifications-page .rg-navbar { gap: 9px; }
  .admin-notifications-page .page-shell { padding-inline: 14px; }
}

@media (max-width: 960px) {
  .welcome-banner { grid-template-columns: 1fr; gap: 20px; }
  .profile-card { max-width: 460px; }
}
@media (max-width: 700px) {
  .rg-navbar { min-height: 67px; padding: 11px 15px; gap: 10px; }
  .rg-brand { font-size: 28px; }
  .nav-actions { gap: 8px; }
  .mark-all-button { min-height: 34px; padding: 8px 10px; font-size: 9px; }
  .mark-all-button ion-icon { font-size: 16px; }
  .back-link { min-height: 34px; font-size: 9px; }
  .back-link span { display: none; }
  .back-link ion-icon { font-size: 21px; }
  .page-shell { min-height: calc(100dvh - 67px); padding: 15px 14px 0; }
  .welcome-banner { padding: 26px 23px; min-height: 0; border-radius: 16px; }
  .banner-copy h1 { font-size: clamp(34px, 8vw, 43px); }
  .banner-description { font-size: 12px; }
  .stats-grid { gap: 9px; }
  .stat-box { padding: 13px; }
  .stat-box strong { font-size: 24px; }
  .stat-label { font-size: 9px; letter-spacing: .7px; }
  .stat-box small { font-size: 10px; }
  .updates-section { padding-top: 27px; }
  .notification-open { padding: 17px 10px 17px 13px; gap: 11px; }
  .notification-icon { flex-basis: 43px; width: 43px; height: 43px; border-radius: 12px; }
  .notification-icon ion-icon { font-size: 22px; }
  .delete-button { margin-right: 9px; width: 37px; height: 37px; flex-basis: 37px; }
  .notification-title { font-size: 19px; }
  .notification-message { font-size: 12px; }
  .page-footer { font-size: 10px; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
  .stat-box { display: grid; grid-template-columns: 32px minmax(0, 1fr); gap: 0 10px; align-items: center; }
  .stat-box ion-icon { grid-row: 1 / 4; }
  .stat-box strong { font-size: 26px; }
  .profile-avatar { width: 52px; height: 52px; flex-basis: 52px; font-size: 21px; }
  .profile-copy strong { font-size: 19px; }
  .section-heading { align-items: start; flex-direction: column; }
  .section-heading h2 { font-size: 33px; }
  .empty-card h3 { font-size: 28px; }
  .empty-card { min-height: 265px; }
  .notification-open { gap: 9px; }
  .open-arrow { display: none; }
  .notification-type { font-size: 9px; }
  .page-footer { flex-wrap: wrap; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .mark-all-button, .notification-card, .delete-button, .action-button { transition: none; }
}
</style>