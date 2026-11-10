<template>
  <ion-app :class="{ 'member-shell-enabled': memberShell }">
    <!-- Persistent member workspace navigation; admin/public layouts are untouched. -->
    <template v-if="memberShell">
      <header class="member-app-header">
        <button class="member-menu-toggle" type="button" :aria-expanded="mobileNavOpen" aria-controls="member-mobile-navigation" aria-label="Toggle account navigation" @click="mobileNavOpen = !mobileNavOpen">
          <ion-icon :icon="mobileNavOpen ? closeOutline : menuOutline" />
        </button>
        <router-link to="/dashboard" class="member-app-brand" @click="mobileNavOpen = false">Relief<span>GO</span><sup>♥</sup></router-link>
        <span class="member-app-title">{{ workspaceTitle }}</span>
        <span class="member-app-spacer" />
        <router-link to="/notifications" class="member-header-icon" aria-label="View notifications" title="Notifications"><ion-icon :icon="notificationsOutline" /><span v-if="unreadCount > 0" class="member-unread-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span></router-link>
        <div class="member-header-profile"><span class="member-avatar">{{ initials }}</span><span class="member-profile-label"><strong>{{ displayName }}</strong><small>{{ roleLabel }}</small></span></div>
      </header>
      <div v-if="mobileNavOpen" class="member-menu-backdrop" @click="mobileNavOpen = false" />
      <aside id="member-mobile-navigation" class="member-app-sidebar" :class="{ 'is-mobile-open': mobileNavOpen }" aria-label="Account navigation">
        <div class="member-sidebar-brand">Relief<span>GO</span><sup>♥</sup><small>MEMBER WORKSPACE</small></div>
        <div class="member-sidebar-profile"><span class="member-avatar">{{ initials }}</span><div><small>{{ roleLabel }}</small><strong>{{ displayName }}</strong></div></div>
        <p class="member-nav-eyebrow">MY WORKSPACE</p>
        <nav class="member-app-links">
          <router-link to="/dashboard" exact-active-class="member-link-active" @click="closeMenu"><ion-icon :icon="gridOutline" /> Dashboard</router-link>
          <router-link to="/campaigns" @click="closeMenu"><ion-icon :icon="heartOutline" /> Browse Campaigns</router-link>
          <router-link v-if="currentUser?.role === 'donor'" to="/donor/donations" active-class="member-link-active" @click="closeMenu"><ion-icon :icon="receiptOutline" /> My Donations</router-link>
          <router-link v-if="currentUser?.role === 'organizer'" to="/organizer/campaigns" active-class="member-link-active" @click="closeMenu"><ion-icon :icon="megaphoneOutline" /> My Campaigns</router-link>
          <router-link v-if="currentUser?.role === 'organizer'" to="/organizer/campaigns/new" active-class="member-link-active" @click="closeMenu"><ion-icon :icon="addCircleOutline" /> Create Campaign</router-link>
          <router-link to="/my/volunteers" active-class="member-link-active" @click="closeMenu"><ion-icon :icon="peopleOutline" /> Volunteering</router-link>
          <router-link to="/notifications" active-class="member-link-active" @click="closeMenu"><ion-icon :icon="notificationsOutline" /> Notifications</router-link>
        </nav>
        <div class="member-sidebar-bottom">
          <p class="member-sidebar-foot">Small acts. Big hearts. ✦</p>
          <button type="button" class="member-logout" :disabled="loggingOut" @click="signOut"><ion-icon :icon="logOutOutline" /><span>{{ loggingOut ? 'Logging out…' : 'Log Out' }}</span></button>
        </div>
      </aside>
    </template>
    <ion-router-outlet :class="{ 'member-app-outlet': memberShell }" />
  </ion-app>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonApp, IonRouterOutlet, IonIcon, menuController } from '@ionic/vue';
import { addCircleOutline, closeOutline, gridOutline, heartOutline, logOutOutline, megaphoneOutline, menuOutline, notificationsOutline, peopleOutline, receiptOutline } from 'ionicons/icons';
import { currentUser } from './services/authState';
import { logoutUser } from './services/authService';
import { confirmLogout, showToast } from './utils/ui';
import { unreadCount, startNotificationListener, stopNotificationListener } from './services/notificationService';
const route = useRoute();
const router = useRouter();
const mobileNavOpen = ref(false);
const loggingOut = ref(false);
const memberShell = computed(() => {
  if (!currentUser.value || currentUser.value.role === 'admin') return false;
  return /^\/(dashboard|donor(?:\/|$)|organizer(?:\/|$)|my(?:\/|$)|notifications(?:\/|$))/.test(route.path) || /^\/campaigns\/[^/]+\/donate$/.test(route.path);
});
const displayName = computed(() => currentUser.value?.displayName?.trim() || 'ReliefGO Member');
const initials = computed(() => displayName.value.split(/\s+/).slice(0, 2).map(v => v[0] || '').join('').toUpperCase());
const roleLabel = computed(() => currentUser.value?.role === 'organizer' ? 'ORGANIZER ACCOUNT' : currentUser.value?.role === 'donor' ? 'DONOR ACCOUNT' : 'MEMBER ACCOUNT');
const workspaceTitle = computed(() => route.path.startsWith('/organizer') ? 'ORGANIZER WORKSPACE' : route.path.startsWith('/donor') ? 'DONOR WORKSPACE' : 'MY DASHBOARD');
function closeMenu() { mobileNavOpen.value = false; }
// Ionic menus are per-page; an open menu left behind by a route transition
// can leave its backdrop and disable pointer events on the new page.
watch(() => route.fullPath, () => {
  closeMenu();
  void menuController.close().catch(() => undefined);
}, { flush: 'post' });
watch(() => currentUser.value?.uid, uid => { if (uid) startNotificationListener(uid); else stopNotificationListener(); }, { immediate: true });
async function signOut() {
  if (loggingOut.value || !await confirmLogout()) return;
  loggingOut.value = true;
  try { await logoutUser(); closeMenu(); await router.replace('/welcome'); }
  catch { await showToast('Unable to log out. Please try again.', 'danger'); }
  finally { loggingOut.value = false; }
}
</script>

<style>
/* The header/sidebar live outside the route outlet and never scroll with page content. */
.member-shell-enabled{--member-dark:#173729;--member-cream:#fbf0dc;--member-terra:#be563b;--member-gold:#f3b75d;--member-border:#e4dccb}
.member-app-header{position:fixed;top:0;left:250px;right:0;height:72px;display:flex;align-items:center;gap:16px;padding:0 24px;background:var(--member-cream);border-bottom:1px solid var(--member-border);z-index:3005;color:var(--member-dark);box-sizing:border-box}
.member-app-header a{text-decoration:none;color:inherit}.member-app-brand{font:700 29px Georgia,serif;letter-spacing:-1.7px;white-space:nowrap}.member-app-brand span,.member-app-brand sup{color:var(--member-terra)}.member-app-brand sup{font-size:11px;vertical-align:top}
.member-app-title{border-left:1px solid #d9cdb9;padding-left:15px;font:800 10px 'Segoe UI',sans-serif;letter-spacing:1.6px;color:var(--member-dark)}.member-app-spacer{flex:1}.member-header-icon{display:grid;place-items:center;font-size:23px;padding:8px;border-radius:50%}.member-header-icon:hover{background:#eee3cb}.member-header-icon{position:relative}.member-unread-badge{position:absolute;top:0;right:0;min-width:18px;height:18px;border-radius:12px;background:#b84436;color:white;font:bold 10px/18px Arial,sans-serif;text-align:center;padding:0 3px}
.member-header-profile{display:flex;gap:9px;align-items:center;min-width:0}.member-avatar{height:39px;width:39px;border-radius:50%;background:var(--member-gold);display:grid;place-items:center;flex:none;color:#2d281b;font:bold 15px Georgia,serif}.member-profile-label{display:flex;flex-direction:column;min-width:0;max-width:160px;line-height:1.2}.member-profile-label strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.member-profile-label small{font-size:9px;color:var(--member-terra);font-weight:800;letter-spacing:.7px;margin-top:4px}
.member-logout{background:var(--member-dark);color:#fff9ed;border:1px solid var(--member-dark);border-radius:10px;padding:10px 12px;display:flex;gap:8px;align-items:center;cursor:pointer;font-size:11px;font-weight:800}.member-logout:hover{background:#2d5945}.member-logout:disabled{opacity:.5}
.member-app-sidebar{position:fixed;top:0;bottom:0;left:0;width:250px;background:#173a2c;z-index:3006;overflow-y:auto;color:#fff8e9;display:flex;flex-direction:column;box-shadow:4px 0 20px #14302010;padding:25px 13px 15px;box-sizing:border-box}
.member-sidebar-brand{font:bold 27px Georgia,serif;letter-spacing:-1px;padding:3px 15px 23px;border-bottom:1px solid #ffffff29}.member-sidebar-brand span,.member-sidebar-brand sup{color:var(--member-gold)}.member-sidebar-brand sup{font-size:10px;vertical-align:top}.member-sidebar-brand small{display:block;margin-top:7px;font:800 9px 'Segoe UI',sans-serif;letter-spacing:2px;color:#e7b980}
.member-sidebar-profile{display:flex;align-items:center;gap:11px;margin:22px 2px 18px;padding:13px 8px;background:#ffffff10;border:1px solid #ffffff1f;border-radius:12px}.member-sidebar-profile>div{min-width:0}.member-sidebar-profile small{display:block;font-size:9px;letter-spacing:.8px;color:#e7b980}.member-sidebar-profile strong{font-size:13px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:5px}
.member-nav-eyebrow{margin:9px 13px 12px;font-size:10px;letter-spacing:1.5px;color:#e7b980;font-weight:800}.member-app-links{display:flex;flex-direction:column;gap:4px}.member-app-links a{padding:12px;border-radius:10px;display:flex;align-items:center;gap:11px;text-decoration:none;color:#eaf0e8;font:600 13px 'Segoe UI',sans-serif;transition:background .15s}.member-app-links a ion-icon{font-size:19px;color:#e7b980}.member-app-links a:hover,.member-app-links a:focus-visible{background:#ffffff20}.member-app-links a.member-link-active{background:#f6eedc;color:#173a2c;font-weight:800}.member-app-links a.member-link-active ion-icon{color:#bc6949}.member-sidebar-bottom{margin-top:auto;display:flex;flex-direction:column;gap:12px;padding-top:24px}.member-sidebar-bottom .member-logout{width:100%;min-height:44px;justify-content:center;background:#f3b75d;color:#173729;border:1px solid #f3b75d}.member-sidebar-bottom .member-logout:hover{background:#ffe0a2}.member-sidebar-foot{margin:0 12px;padding-top:30px;font-size:11px;color:#e9bd81}
.member-app-outlet{position:absolute!important;top:72px!important;left:250px!important;right:0!important;bottom:0!important;width:calc(100% - 250px)!important;height:calc(100% - 72px)!important;contain:layout size style}
.member-app-outlet ion-header{display:none!important}.member-app-outlet .dashboard-navbar{display:none!important}
.member-app-outlet .dashboard-shell{min-height:100%!important}
.member-app-outlet .dashboard-main,.member-app-outlet .page-shell,.member-app-outlet .dashboard-shell,.member-app-outlet .page-wrapper{max-width:1200px;margin-left:auto;margin-right:auto}
.member-app-outlet ion-button:not([color="danger"]){--border-radius:10px}.member-app-outlet .rg-native-field,.member-app-outlet input:not([type="checkbox"]):not([type="radio"]),.member-app-outlet textarea,.member-app-outlet select{max-width:100%}
.member-menu-toggle{display:none;background:transparent;border:0;color:var(--member-dark);font-size:26px;cursor:pointer;padding:5px}.member-menu-backdrop{display:none}
@media(max-width:850px){.member-app-header{left:0;height:64px;padding:0 12px;gap:10px}.member-menu-toggle{display:grid;place-items:center}.member-app-brand{font-size:25px}.member-app-title{display:none}.member-profile-label{display:none}.member-header-profile .member-avatar{width:34px;height:34px}.member-logout{padding:9px}.member-logout span{display:none}.member-app-sidebar{transform:translateX(-110%);transition:transform .2s ease;width:min(275px,86vw);z-index:3100}.member-app-sidebar.is-mobile-open{transform:translateX(0)}.member-menu-backdrop{display:block;position:fixed;inset:0;background:#081c16aa;z-index:3090}.member-app-outlet{top:64px!important;left:0!important;width:100%!important;height:calc(100% - 64px)!important}}
@media(max-width:410px){.member-app-header{gap:7px}.member-header-icon{font-size:20px}.member-logout{padding:7px}.member-app-brand{font-size:23px}}
@media(prefers-reduced-motion:reduce){.member-app-sidebar{transition:none}}
</style>
