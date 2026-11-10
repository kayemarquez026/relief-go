<template>
  <ion-page class="relief-campaigns-page">
    <!-- Organizer-friendly member workspace navigation, shared by desktop and mobile. -->
    <ion-menu v-if="isLoggedIn" content-id="rg-browse-main" menu-id="rg-browse-menu" type="overlay" side="start" class="rg-browse-mobile-menu">
      <ion-header class="drawer-head">
        <ion-toolbar class="drawer-toolbar">
          <div class="drawer-brand">Relief<span>GO</span><sup>♥</sup><small>{{ sidebarSection }}</small></div>
        </ion-toolbar>
      </ion-header>
      <ion-content class="drawer-content">
        <div class="drawer-body">
          <div class="sidebar-profile">
            <span class="sidebar-avatar">{{ userInitials }}</span>
            <div><small>{{ accountLabel }}</small><strong>{{ fullName }}</strong></div>
          </div>
          <p class="sidebar-section-title">{{ sidebarTitle }}</p>
          <nav class="sidebar-links" aria-label="Mobile ReliefGO navigation">
            <router-link v-for="link in sidebarLinks" :key="`mobile-${link.path}`" :to="link.path"
              :class="{ 'sidebar-active': isCurrentLink(link.path) }"
              :aria-current="isCurrentLink(link.path) ? 'page' : undefined" @click="closeBrowseMenu">
              <ion-icon :icon="link.icon" aria-hidden="true" /><span>{{ link.label }}</span>
            </router-link>
          </nav>
          <div class="sidebar-bottom">
            <span>Small acts. Big hearts. ✦</span>
            <button class="sidebar-logout" type="button" @click="handleLogout"><ion-icon :icon="logOutOutline" aria-hidden="true" /> Log Out</button>
          </div>
        </div>
      </ion-content>
    </ion-menu>

    <aside v-if="isLoggedIn" class="rg-browse-sidebar" aria-label="ReliefGO account sidebar">
      <div class="sidebar-brand">Relief<span>GO</span><sup>♥</sup><small>{{ sidebarSection }}</small></div>
      <div class="sidebar-profile">
        <span class="sidebar-avatar">{{ userInitials }}</span>
        <div><small>{{ accountLabel }}</small><strong>{{ fullName }}</strong></div>
      </div>
      <p class="sidebar-section-title">{{ sidebarTitle }}</p>
      <nav class="sidebar-links" aria-label="ReliefGO navigation">
        <router-link v-for="link in sidebarLinks" :key="link.path" :to="link.path"
          :class="{ 'sidebar-active': isCurrentLink(link.path) }"
          :aria-current="isCurrentLink(link.path) ? 'page' : undefined">
          <ion-icon :icon="link.icon" aria-hidden="true" /><span>{{ link.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-bottom">
        <span>Small acts. Big hearts. ✦</span>
        <button class="sidebar-logout" type="button" @click="handleLogout"><ion-icon :icon="logOutOutline" aria-hidden="true" /> Log Out</button>
      </div>
    </aside>

    <div id="rg-browse-main" class="ion-page rg-browse-main" :class="{ 'has-sidebar': isLoggedIn }">
      <ion-header class="rg-browse-header">
        <ion-toolbar class="rg-browse-toolbar">
          <div class="rg-topbar">
            <div class="rg-topbar-left">
              <button v-if="isLoggedIn" type="button" class="rg-menu-toggle" aria-label="Open navigation menu" @click="toggleBrowseMenu">
                <ion-icon :icon="menuOutline" aria-hidden="true" />
              </button>
              <router-link :to="homeHref" class="topbar-brand" aria-label="ReliefGO home">Relief<span>GO</span><sup>♥</sup></router-link>
              <span class="rg-top-divider" aria-hidden="true"></span>
              <span class="rg-top-page-name">BROWSE CAMPAIGNS</span>
            </div>
            <div class="rg-topbar-right">
              <div v-if="isLoggedIn" class="rg-topbar-account">
                <span class="rg-topbar-avatar">{{ userInitials }}</span>
                <span class="rg-topbar-account-text"><strong>{{ fullName }}</strong><small>{{ accountLabel }}</small></span>
              </div>
            </div>
          </div>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="false" class="campaigns-content">
        <div class="campaigns-shell">
        <main>
          <!-- Storybook-style green banner -->
          <section class="campaigns-hero" aria-labelledby="campaigns-heading">
            <div class="hero-text">
              <p class="eyebrow">RELIEFGO · COMMUNITY CAMPAIGNS</p>
              <h1 id="campaigns-heading">Every cause begins<br />with <em>kindness.</em></h1>
              <p class="hero-description">
                Discover fundraisers, support Filipino communities in need, and
                follow the impact of every helping hand.
              </p>
              <div class="hero-note">
                <span class="note-dot" aria-hidden="true"></span>
                STORIES OF BAYANIHAN LIVE HERE
              </div>
            </div>
            <div class="hero-art">
              <div class="hero-glow" aria-hidden="true"></div>
              <img
                :src="reliefLogo"
                alt="ReliefGO illustration of volunteers delivering donations"
                loading="eager"
              />
            </div>
          </section>

          <!-- Actual public campaigns with existing search and filtering -->
          <section class="browse-section" aria-labelledby="browse-heading">
            <div class="section-heading">
              <div>
                <p class="section-eyebrow">FIND YOUR WAY TO GIVE</p>
                <h2 id="browse-heading">Causes worth <em>caring for.</em></h2>
                <p class="section-description">
                  Browse available campaigns and choose where you'd like to make a difference.
                </p>
              </div>
              <div class="campaign-count" aria-live="polite">
                <strong>{{ loading ? '—' : filteredCampaigns.length }}</strong>
                <span>{{ filteredCampaigns.length === 1 ? 'CAMPAIGN FOUND' : 'CAMPAIGNS FOUND' }}</span>
              </div>
            </div>

            <div class="filter-panel">
              <div class="search-group">
                <label class="filter-label" for="campaign-search">SEARCH CAMPAIGNS</label>
                <div class="search-control">
                  <ion-icon :icon="searchOutline" aria-hidden="true" />
                  <ion-searchbar
                    id="campaign-search"
                    v-model="searchText"
                    placeholder="Search by cause, community, or location..."
                    aria-label="Search campaigns"
                    :debounce="200"
                    :animated="false"
                    class="campaign-searchbar"
                  ></ion-searchbar>
                </div>
              </div>
              <div class="category-group">
                <label class="filter-label" for="campaign-category">CATEGORY</label>
                <ion-select
                  id="campaign-category"
                  v-model="selectedCategory"
                  aria-label="Filter campaigns by category"
                  interface="popover"
                  fill="outline"
                  class="category-select"
                >
                  <ion-select-option value="All">All categories</ion-select-option>
                  <ion-select-option
                    v-for="category in CAMPAIGN_CATEGORIES"
                    :key="category"
                    :value="category"
                  >
                    {{ category }}
                  </ion-select-option>
                </ion-select>
              </div>
            </div>

            <!-- Search, category, location, goal range and status all filter the campaign cards. -->
            <div class="rg-extra-filters" role="group" aria-label="Additional campaign filters">
              <div class="rg-filter-field">
                <label for="rg-filter-location"><ion-icon :icon="locationOutline" aria-hidden="true" /> LOCATION</label>
                <div class="rg-filter-input-wrap">
                  <ion-icon :icon="locationOutline" aria-hidden="true" />
                  <input id="rg-filter-location" v-model="filterCity" type="search" autocomplete="off" placeholder="City, barangay or address" />
                </div>
              </div>

              <div class="rg-filter-field">
                <label for="rg-filter-min"><ion-icon :icon="trendingDownOutline" aria-hidden="true" /> MIN GOAL (₱)</label>
                <div class="rg-filter-input-wrap rg-money-input-wrap">
                  <span class="rg-peso-sign" aria-hidden="true">₱</span>
                  <input id="rg-filter-min" :value="minGoalDisplay" type="text" inputmode="numeric" autocomplete="off"
                    placeholder="0.00" aria-label="Minimum fundraising goal in pesos"
                    @input="onGoalInput('min', $event)" @focus="onGoalFocus" @click="clampMoneyCaret" />
                </div>
              </div>

              <div class="rg-filter-field">
                <label for="rg-filter-max"><ion-icon :icon="trendingUpOutline" aria-hidden="true" /> MAX GOAL (₱)</label>
                <div class="rg-filter-input-wrap rg-money-input-wrap">
                  <span class="rg-peso-sign" aria-hidden="true">₱</span>
                  <input id="rg-filter-max" :value="maxGoalDisplay" type="text" inputmode="numeric" autocomplete="off"
                    placeholder="No maximum" aria-label="Maximum fundraising goal in pesos"
                    @input="onGoalInput('max', $event)" @focus="onGoalFocus" @click="clampMoneyCaret" />
                </div>
              </div>

              <!-- Custom status popover: native <select> options cannot be styled consistently across browsers. -->
              <div ref="statusMenuRef" class="rg-filter-field rg-status-filter-field">
                <label for="rg-filter-status"><ion-icon :icon="optionsOutline" aria-hidden="true" /> STATUS</label>
                <div class="rg-status-control">
                  <button
                    id="rg-filter-status"
                    ref="statusTriggerRef"
                    type="button"
                    class="rg-status-trigger"
                    :class="{ 'rg-status-trigger-open': statusOpen }"
                    :aria-expanded="statusOpen"
                    aria-haspopup="listbox"
                    aria-controls="rg-status-options"
                    aria-label="Filter campaigns by status"
                    @click="toggleStatus"
                    @keydown="onStatusTriggerKeydown"
                  >
                    <ion-icon :icon="statusFilterIcon" class="rg-status-leading-icon" aria-hidden="true" />
                    <span>{{ selectedStatusLabel }}</span>
                    <ion-icon :icon="chevronDownOutline" class="rg-status-chevron" aria-hidden="true" />
                  </button>
                  <div
                    v-if="statusOpen"
                    id="rg-status-options"
                    ref="statusOptionsRef"
                    class="rg-status-dropdown"
                    role="listbox"
                    aria-label="Campaign status options"
                    @keydown="onStatusOptionsKeydown"
                  >
                    <button
                      v-for="option in statusOptions"
                      :key="option.value"
                      type="button"
                      role="option"
                      :aria-selected="filterStatus === option.value"
                      class="rg-status-option"
                      :class="{ 'rg-status-option-selected': filterStatus === option.value }"
                      @click="chooseStatus(option.value)"
                    >
                      <span class="rg-status-option-icon"><ion-icon :icon="option.icon" aria-hidden="true" /></span>
                      <span class="rg-status-option-copy">
                        <strong>{{ option.label }}</strong>
                        <small>{{ option.description }}</small>
                      </span>
                      <ion-icon v-if="filterStatus === option.value" :icon="checkmarkOutline" class="rg-status-option-check" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <small class="rg-status-hint"><ion-icon :icon="informationCircleOutline" aria-hidden="true" /> {{ statusHint }}</small>
              </div>
            </div>
            <p v-if="goalRangeError" class="rg-filter-warning" role="alert">
              <ion-icon :icon="alertCircleOutline" aria-hidden="true" /> {{ goalRangeError }}
            </p>
            <div class="results-row">
              <span><span class="results-accent">✦</span> COMMUNITY FUNDRAISERS</span>
              <button
                v-if="hasActiveFilters"
                class="clear-filters"
                type="button"
                @click="clearFilters"
              >
                CLEAR FILTERS <ion-icon :icon="closeOutline" aria-hidden="true" />
              </button>
            </div>

            <div v-if="loading" class="state-box" role="status" aria-live="polite">
              <ion-spinner name="crescent" class="state-spinner"></ion-spinner>
              <h3>Gathering stories of hope...</h3>
              <p>Loading the latest public campaigns.</p>
            </div>

            <div v-else-if="errorMessage" class="state-box" role="alert">
              <ion-icon :icon="alertCircleOutline" class="state-icon"></ion-icon>
              <h3>Something went wrong.</h3>
              <p>{{ errorMessage }}</p>
              <button type="button" class="state-action" @click="loadCampaigns">
                TRY AGAIN <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
              </button>
            </div>

            <div v-else-if="goalRangeError" class="state-box" role="status">
              <ion-icon :icon="alertCircleOutline" class="state-icon" />
              <h3>Check the goal range.</h3>
              <p>{{ goalRangeError }}</p>
              <button type="button" class="state-action" @click="clearGoalFilters">RESET GOAL FILTERS</button>
            </div>
            <div v-else-if="filteredCampaigns.length === 0" class="state-box" role="status">
              <ion-icon :icon="searchOutline" class="state-icon"></ion-icon>
              <h3>No campaigns found.</h3>
              <p>Try searching for another cause or choose a different category.</p>
              <button type="button" class="state-action" @click="clearFilters">
                SHOW ALL CAMPAIGNS <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
              </button>
            </div>

            <!-- Use the actual Campaign Details route, not a reduced preview/modal.
                 That page contains the existing Donate Now, verified donors, updates and transparency features. -->
            <div v-else class="campaign-grid">
              <article
                v-for="campaign in filteredCampaigns"
                :key="campaign.id"
                class="campaign-item"
                @click.capture="onCampaignCardClick($event, campaign)"
              >
                <CampaignCard :campaign="campaign" />
                <button class="rg-open-campaign-button" type="button" @click="openCampaign(campaign)">
                  <span>VIEW CAMPAIGN &amp; DONATION OPTIONS</span>
                  <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
                </button>
              </article>
            </div>
          </section>
        </main>

        <footer class="campaigns-footer">
          <span>© {{ new Date().getFullYear() }} ReliefGO</span>
          <span>Small acts. Big hearts. Real stories of bayanihan.</span>
        </footer>
        </div>
      </ion-content>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonMenu, IonContent, IonSearchbar,
  IonSelect, IonSelectOption, IonSpinner, IonIcon, menuController, onIonViewWillEnter,
} from '@ionic/vue';
import {
  searchOutline, alertCircleOutline, arrowForwardOutline, gridOutline, addCircleOutline,
  closeOutline, locationOutline, optionsOutline, menuOutline,
  notificationsOutline, megaphoneOutline, peopleOutline, barChartOutline,
  documentTextOutline, logOutOutline, checkmarkCircleOutline,
  timeOutline, chevronDownOutline, informationCircleOutline,
  trendingUpOutline, trendingDownOutline, heartOutline, checkmarkOutline,
} from 'ionicons/icons';
import reliefLogo from '../assets/images/reliefgo-logo.png';
import CampaignCard from '../components/CampaignCard.vue';
import { getPublicCampaigns, getRejectedCampaigns } from '../services/campaignService';
import { currentUser } from '../services/authState';
import { logoutUser } from '../services/authService';
import { confirmLogout } from '../utils/ui';
import { dashboardPathForRole } from '../utils/roles';
import { CAMPAIGN_CATEGORIES } from '../models/Campaign';
import type { Campaign } from '../models/Campaign';

const router = useRouter();
const route = useRoute();
const BROWSE_MENU_ID = 'rg-browse-menu';
const isLoggedIn = computed(() => Boolean(currentUser.value));
const accountRole = computed(() => String(currentUser.value?.role || 'guest'));
const homeHref = computed(() => currentUser.value
  ? dashboardPathForRole(currentUser.value.role)
  : '/welcome');
const accountLabel = computed(() => accountRole.value === 'admin' ? 'ADMINISTRATOR'
  : accountRole.value === 'organizer' ? 'ORGANIZER ACCOUNT'
  : accountRole.value === 'donor' ? 'DONOR ACCOUNT' : 'ACCOUNT');
const sidebarSection = computed(() => accountRole.value === 'admin' ? 'ADMINISTRATION' : 'MEMBER WORKSPACE');
const sidebarTitle = computed(() => accountRole.value === 'admin' ? 'MANAGEMENT TOOLS' : 'MY WORKSPACE');
const fullName = computed(() => currentUser.value?.displayName?.trim() || (accountRole.value === 'admin' ? 'ReliefGO Administrator' : 'ReliefGO Member'));
const userInitials = computed(() => {
  const words = fullName.value.split(/\s+/).filter(Boolean);
  return (words.length >= 2 ? `${words[0][0]}${words[words.length - 1][0]}` : fullName.value.slice(0, 2)).toUpperCase();
});

// Find the registered organizer routes, so the new sidebar items use the app's
// actual paths when they differ among ReliefGO router configurations.
// Only static paths are considered: dynamic :id routes need a campaign ID.
function resolveWorkspaceRoute(preferredPaths: string[], kind: 'create' | 'volunteer'): string {
  const registered = router.getRoutes().filter(record => !/[\:*]/.test(record.path));
  for (const path of preferredPaths) {
    if (registered.some(record => record.path === path)) return path;
  }
  const match = registered.find(record => {
    const path = record.path.toLowerCase();
    const name = String(record.name ?? '').toLowerCase();
    if (kind === 'create') {
      return /(?:create|new)/.test(path + ' ' + name) &&
        /campaign/.test(path + ' ' + name) &&
        !/(edit|update)/.test(path + ' ' + name);
    }
    return /volunteer/.test(path + ' ' + name) &&
      !/(review|application|attendance|detail|manage)/.test(path + ' ' + name);
  });
  // Fallbacks are conventional route paths; verify them in src/router/index.ts
  // if your application uses a custom navigation structure.
  return match?.path || preferredPaths[0];
}

const createCampaignPath = computed(() => resolveWorkspaceRoute([
  '/organizer/campaigns/create',
  '/organizer/campaigns/new',
  '/organizer/create-campaign',
  '/organizer/create',
  '/campaigns/create',
  '/create-campaign',
], 'create'));

const volunteeringPath = computed(() => resolveWorkspaceRoute([
  '/volunteering',
  '/organizer/volunteering',
  '/organizer/volunteers',
  '/volunteer',
  '/volunteer/opportunities',
  '/volunteers',
], 'volunteer'));

// Keep admin permissions and items separate from the organizer member workspace.
// Organizer ordering and icons mirror the supplied Member Workspace screenshot.
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
  if (accountRole.value === 'admin' && path === '/admin/campaigns' &&
      (route.path === '/campaigns' || route.path.startsWith('/campaigns/'))) return true;
  if (path === '/campaigns' && route.path.startsWith('/campaigns/')) return true;
  if (route.path === path) return true;
  // Highlight Create Campaign rather than My Campaigns for nested creation URLs.
  if (path === '/organizer/campaigns' && route.path === createCampaignPath.value) return false;
  return path !== '/' && path !== '/campaigns' && route.path.startsWith(`${path}/`);
}
async function toggleBrowseMenu() { await menuController.toggle(BROWSE_MENU_ID); }
async function closeBrowseMenu() { await menuController.close(BROWSE_MENU_ID).catch(() => undefined); }
async function handleLogout() {
  if (!(await confirmLogout())) return;
  await closeBrowseMenu();
  await logoutUser();
  await router.replace('/welcome');
}


const campaigns = ref<Campaign[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const searchText = ref('');
const selectedCategory = ref('All');
const filterCity = ref('');
const filterStatus = ref('all');
// Visually rich, keyboard-accessible status options. The actual filter values stay unchanged.
const statusOptions = [
  { value: 'all', label: 'Active & completed', description: 'Show public campaigns', icon: optionsOutline },
  { value: 'Active', label: 'Active', description: 'Ongoing campaigns', icon: timeOutline },
  { value: 'Completed', label: 'Completed', description: 'Finished campaigns', icon: checkmarkCircleOutline },
  { value: 'Rejected', label: 'Rejected (my campaigns only)', description: 'Your rejected submissions', icon: closeOutline },
];
const statusOpen = ref(false);
const statusMenuRef = ref<HTMLElement | null>(null);
const statusOptionsRef = ref<HTMLElement | null>(null);
const statusTriggerRef = ref<HTMLButtonElement | null>(null);
const selectedStatusLabel = computed(() => statusOptions.find(o => o.value === filterStatus.value)?.label || 'Active & completed');
const statusFilterIcon = computed(() => statusOptions.find(o => o.value === filterStatus.value)?.icon || optionsOutline);
const statusHint = computed(() => filterStatus.value === 'Active' ? 'Showing ongoing fundraisers'
  : filterStatus.value === 'Completed' ? 'Showing finished campaigns'
  : filterStatus.value === 'Rejected' ? 'Showing your rejected submissions'
  : 'Showing active and completed campaigns');

function getStatusButtons(): HTMLButtonElement[] {
  return Array.from(statusOptionsRef.value?.querySelectorAll<HTMLButtonElement>('[role="option"]') || []);
}
async function openStatus(index?: number) {
  statusOpen.value = true;
  await nextTick();
  const buttons = getStatusButtons();
  const selectedIndex = statusOptions.findIndex(o => o.value === filterStatus.value);
  buttons[index ?? Math.max(0, selectedIndex)]?.focus();
}
function toggleStatus() {
  if (statusOpen.value) statusOpen.value = false;
  else void openStatus();
}
function chooseStatus(value: string) {
  filterStatus.value = value;
  statusOpen.value = false;
  statusTriggerRef.value?.focus();
}
function onStatusTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (!statusOpen.value) void openStatus();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (!statusOpen.value) void openStatus(statusOptions.length - 1);
  } else if (event.key === 'Escape') statusOpen.value = false;
}
function onStatusOptionsKeydown(event: KeyboardEvent) {
  const buttons = getStatusButtons();
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  if (event.key === 'ArrowDown') { event.preventDefault(); buttons[(index + 1) % buttons.length]?.focus(); }
  else if (event.key === 'ArrowUp') { event.preventDefault(); buttons[(index + buttons.length - 1) % buttons.length]?.focus(); }
  else if (event.key === 'Home') { event.preventDefault(); buttons[0]?.focus(); }
  else if (event.key === 'End') { event.preventDefault(); buttons[buttons.length - 1]?.focus(); }
  else if (event.key === 'Escape') { event.preventDefault(); statusOpen.value = false; statusTriggerRef.value?.focus(); }
}
function handleStatusOutside(event: PointerEvent) {
  if (statusOpen.value && event.target instanceof Node && !statusMenuRef.value?.contains(event.target)) statusOpen.value = false;
}
onMounted(() => document.addEventListener('pointerdown', handleStatusOutside));

// Store only digits for the server-side filter. Display commas and .00 to the user.
const minGoal = ref('');
const maxGoal = ref('');
const minGoalDisplay = ref('');
const maxGoalDisplay = ref('');
const pesoNumber = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});
const BROWSE_FILTER_KEY = 'reliefgo:browse-campaign-filters';

function formatGoalDigits(digits: string): string {
  if (!digits) return '';
  const numeric = Number(digits);
  return Number.isFinite(numeric) ? pesoNumber.format(numeric) : '';
}

// The .00 suffix is fixed because the goal filter is in whole pesos.
// Keep the caret in the integer portion so typing 1234 yields 1,234.00 naturally.
function clampMoneyCaret(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.value || document.activeElement !== input) return;
  const end = input.value.indexOf('.');
  const max = end >= 0 ? end : input.value.length;
  const point = Math.min(input.selectionStart ?? max, max);
  const pointEnd = Math.min(input.selectionEnd ?? max, max);
  if ((input.selectionStart ?? max) > max || (input.selectionEnd ?? max) > max) {
    input.setSelectionRange(point, pointEnd);
  }
}
function onGoalFocus(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.value) return;
  const position = input.value.indexOf('.');
  input.setSelectionRange(position < 0 ? input.value.length : position, position < 0 ? input.value.length : position);
}

function onGoalInput(which: 'min' | 'max', event: Event) {
  const input = event.target as HTMLInputElement;
  const cursor = input.selectionStart ?? input.value.length;
  const rawInteger = input.value.split('.')[0];
  const beforeCursor = input.value.slice(0, Math.min(cursor, rawInteger.length));
  const digitsBefore = beforeCursor.replace(/\D/g, '').length;
  // Keep at most twelve digits to avoid imprecise monetary comparisons.
  const digits = rawInteger.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 12);
  const display = formatGoalDigits(digits);
  if (which === 'min') { minGoal.value = digits; minGoalDisplay.value = display; }
  else { maxGoal.value = digits; maxGoalDisplay.value = display; }

  // Update immediately, rather than waiting for Vue's next render.
  input.value = display;
  const integerText = display.split('.')[0];
  let count = 0;
  let nextPosition = integerText.length;
  for (let i = 0; i < integerText.length; i++) {
    if (/\d/.test(integerText[i])) count++;
    if (count >= digitsBefore && digitsBefore > 0) { nextPosition = i + 1; break; }
  }
  if (digitsBefore === 0) nextPosition = 0;
  input.setSelectionRange(nextPosition, nextPosition);
}

const goalRangeError = computed(() => {
  if (minGoal.value && maxGoal.value && Number(minGoal.value) > Number(maxGoal.value)) {
    return 'Minimum goal cannot be greater than maximum goal.';
  }
  return '';
});
const hasActiveFilters = computed(() => Boolean(
  searchText.value.trim() || selectedCategory.value !== 'All' ||
  filterCity.value.trim() || minGoal.value || maxGoal.value || filterStatus.value !== 'all'
));

// Apply locally too, so the cards respond immediately while the server re-fetches.
const filteredCampaigns = computed(() => {
  if (goalRangeError.value) return [];
  const term = searchText.value.trim().toLowerCase();
  const location = filterCity.value.trim().toLowerCase();
  const minimum = minGoal.value === '' ? null : Number(minGoal.value);
  const maximum = maxGoal.value === '' ? null : Number(maxGoal.value);

  return campaigns.value.filter((campaign) => {
    const searchFields = [campaign.title, campaign.description,
      campaign.beneficiaryName, campaign.locationAddress];
    const matchesSearch = !term || searchFields.some(value =>
      String(value || '').toLowerCase().includes(term));
    const matchesLocation = !location ||
      String(campaign.locationAddress || '').toLowerCase().includes(location);
    const matchesCategory = selectedCategory.value === 'All' ||
      campaign.category === selectedCategory.value;
    const matchesGoal = (minimum === null || Number(campaign.goalAmount) >= minimum) &&
      (maximum === null || Number(campaign.goalAmount) <= maximum);
    const matchesStatus = filterStatus.value === 'all'
      ? ['Active', 'Completed'].includes(campaign.status)
      : campaign.status === filterStatus.value;
    return matchesSearch && matchesLocation && matchesCategory && matchesGoal && matchesStatus;
  });
});

function clearGoalFilters() {
  minGoal.value = ''; maxGoal.value = '';
  minGoalDisplay.value = ''; maxGoalDisplay.value = '';
}
function clearFilters() {
  statusOpen.value = false;
  searchText.value = '';
  selectedCategory.value = 'All';
  filterCity.value = '';
  filterStatus.value = 'all';
  clearGoalFilters();
  saveFilters();
}

function saveFilters() {
  try {
    sessionStorage.setItem(BROWSE_FILTER_KEY, JSON.stringify({
      searchText: searchText.value,
      selectedCategory: selectedCategory.value,
      filterCity: filterCity.value,
      filterStatus: filterStatus.value,
      minGoal: minGoal.value,
      maxGoal: maxGoal.value,
    }));
  } catch { /* Browsing still works if browser storage is unavailable. */ }
}
function restoreFilters() {
  try {
    const saved = sessionStorage.getItem(BROWSE_FILTER_KEY);
    if (!saved) return;
    const state = JSON.parse(saved) as Record<string, unknown>;
    searchText.value = typeof state.searchText === 'string' ? state.searchText : '';
    selectedCategory.value = typeof state.selectedCategory === 'string' ? state.selectedCategory : 'All';
    filterCity.value = typeof state.filterCity === 'string' ? state.filterCity : '';
    filterStatus.value = typeof state.filterStatus === 'string' &&
      ['all', 'Active', 'Completed', 'Rejected'].includes(state.filterStatus)
      ? state.filterStatus : 'all';
    minGoal.value = typeof state.minGoal === 'string' && /^\d{0,12}$/.test(state.minGoal) ? state.minGoal : '';
    maxGoal.value = typeof state.maxGoal === 'string' && /^\d{0,12}$/.test(state.maxGoal) ? state.maxGoal : '';
    minGoalDisplay.value = formatGoalDigits(minGoal.value);
    maxGoalDisplay.value = formatGoalDigits(maxGoal.value);
  } catch { /* Ignore malformed session state. */ }
}

// The application already has a full Campaign Details page at /campaigns/:id,
// with the Donate Now action at /campaigns/:id/donate and a Back to Campaigns link.
// Route there instead of showing an incomplete custom modal.
function openCampaign(campaign: Campaign) {
  statusOpen.value = false;
  saveFilters();
  void router.push(`/campaigns/${encodeURIComponent(campaign.id)}`);
}
function onCampaignCardClick(event: MouseEvent, campaign: Campaign) {
  const target = event.target as Element | null;
  // Keep existing card links/buttons functional; the explicit button below is always available.
  if (target?.closest('a, button, ion-button, [role="button"]')) {
    saveFilters();
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  openCampaign(campaign);
}

let requestId = 0;
async function loadCampaigns() {
  if (goalRangeError.value) return;
  const latest = ++requestId;
  if (!campaigns.value.length) loading.value = true;
  errorMessage.value = '';
  try {
    const result = filterStatus.value === 'Rejected'
      ? await getRejectedCampaigns()
      : await getPublicCampaigns({
          q: searchText.value,
          category: selectedCategory.value,
          city: filterCity.value,
          minGoal: minGoal.value,
          maxGoal: maxGoal.value,
          status: filterStatus.value,
        });
    if (latest === requestId) campaigns.value = result;
  } catch (error) {
    if (latest === requestId) {
      console.error('Failed to load campaigns:', error);
      errorMessage.value = error instanceof Error ? error.message : 'We could not load the campaigns.';
    }
  } finally {
    if (latest === requestId) loading.value = false;
  }
}

let filterTimer: ReturnType<typeof setTimeout> | undefined;
watch([searchText, selectedCategory, filterCity, minGoal, maxGoal, filterStatus], () => {
  saveFilters();
  if (filterTimer) clearTimeout(filterTimer);
  // Invalidate outstanding requests immediately to prevent an old response overriding new filters.
  ++requestId;
  if (goalRangeError.value) { loading.value = false; return; }
  filterTimer = setTimeout(() => { void loadCampaigns(); }, 350);
});
onIonViewWillEnter(() => {
  statusOpen.value = false;
  restoreFilters();
  if (filterTimer) clearTimeout(filterTimer);
  void loadCampaigns();
});
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleStatusOutside);
  if (filterTimer) clearTimeout(filterTimer);
  ++requestId;
});
</script>

<style scoped>

/* Consistent ReliefGO palette and type system. */
.relief-campaigns-page {
  --forest: #173729;
  --deep: #112b20;
  --cream: #fbf0dc;
  --terracotta: #be563b;
  --gold: #f3b75d;
  --muted: #667365;
  --page-gutter: clamp(18px, 4.5vw, 72px);
  background: var(--cream);
  color: var(--forest);
}
.campaigns-content {
  --background: #fbf0dc;
  --color: #173729;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}
.campaigns-content::part(background),
.campaigns-content::part(scroll) { background: var(--cream); }
.campaigns-shell {
  width: 100%;
  min-height: 100%;
  background: var(--cream);
  color: var(--forest);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.campaigns-shell * { box-sizing: border-box; }
.campaigns-shell a { text-decoration: none; color: inherit; }
.campaigns-shell h1, .campaigns-shell h2, .campaigns-shell h3,
.brand { font-family: Georgia, 'Times New Roman', serif; }

/* Cream header matches Welcome / Login. */
.campaigns-navbar {
  height: 76px;
  width: 100%;
  padding: 0 clamp(22px, 3vw, 52px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: var(--cream);
  border-bottom: 1px solid #e9dfc9;
}
.brand {
  white-space: nowrap;
  font-size: clamp(29px, 2.25vw, 35px);
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1;
}
.brand span, .brand b { color: var(--terracotta); }
.brand b { font-size: 12px; vertical-align: top; margin-left: 2px; }
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 12px 17px;
  border-radius: 50px;
  border: 1px solid rgba(24, 60, 44, .35);
  font-size: 11px;
  letter-spacing: .8px;
  font-weight: 800;
  transition: background .18s, color .18s;
}
.back-link ion-icon { font-size: 17px; }
.back-link:hover, .back-link:focus-visible { background: var(--forest); color: #fff8e8; }

/* Inset dark-green banner, like other ReliefGO green sections. */
.campaigns-hero {
  width: calc(100% - 2 * var(--page-gutter));
  min-height: 260px;
  margin: 18px var(--page-gutter) 0;
  padding: 29px clamp(30px, 5.2vw, 90px);
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr);
  align-items: center;
  gap: 20px;
  background: linear-gradient(120deg, #173729 0%, #112b20 100%);
  color: #fff8e8;
  border-radius: 18px;
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.campaigns-hero::before {
  content: 'RELIEFGO';
  position: absolute;
  right: -32px;
  top: -40px;
  z-index: -1;
  font: 700 clamp(80px, 14vw, 230px) Georgia, serif;
  line-height: 1;
  letter-spacing: -9px;
  white-space: nowrap;
  color: rgba(248,243,228,.06);
  pointer-events: none;
}
.hero-text { position: relative; z-index: 1; min-width: 0; }
.eyebrow { color: var(--gold); letter-spacing: 2.4px; font-size: 10px; font-weight: 800; margin: 0 0 13px; }
.campaigns-hero h1 {
  margin: 0 0 13px;
  font-size: clamp(37px, 3.6vw, 56px);
  line-height: 1.08;
  letter-spacing: -1.7px;
  font-weight: 400;
}
.campaigns-hero h1 em { color: var(--gold); font-weight: 400; }
.hero-description { max-width: 565px; margin: 0; font-size: clamp(12px, .94vw, 14px); line-height: 1.65; color: #d6dfd0; }
.hero-note { margin-top: 22px; display: flex; align-items: center; gap: 9px; color: var(--gold); letter-spacing: 1.5px; font-weight: 800; font-size: 9px; }
.note-dot { height: 8px; width: 8px; flex: none; border-radius: 50%; background: var(--gold); }
.hero-art { position: relative; display: grid; place-items: center; min-width: 0; height: 100%; }
.hero-glow { position: absolute; width: min(85%, 380px); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, rgba(232,174,76,.17), transparent 69%); }
.hero-art img { width: min(100%, 340px); max-height: 237px; object-fit: contain; position: relative; filter: drop-shadow(0 9px 14px rgba(0,0,0,.12)); }

/* Content / search controls. */
.browse-section { width: calc(100% - 2 * var(--page-gutter)); max-width: 1520px; margin: 0 auto; padding: 46px clamp(3px, 2vw, 27px) 65px; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 25px; margin-bottom: 26px; }
.section-eyebrow { color: var(--terracotta); letter-spacing: 2.1px; font-weight: 800; font-size: 11px; margin: 0 0 12px; }
.section-heading h2 { margin: 0 0 10px; font-size: clamp(31px, 2.9vw, 46px); line-height: 1.1; font-weight: 400; letter-spacing: -1.3px; }
.section-heading h2 em { color: var(--terracotta); font-weight: 400; }
.section-description { color: var(--muted); margin: 0; font-size: 13px; line-height: 1.6; }
.campaign-count { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex: none; }
.campaign-count strong { font-size: 35px; line-height: 1; font-family: Georgia, serif; font-weight: 500; }
.campaign-count span { color: var(--muted); font-size: 9px; font-weight: 800; letter-spacing: 1.2px; }
.filter-panel { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(225px, .8fr); gap: 17px; align-items: end; margin: 0 0 27px; }
.search-group, .category-group { min-width: 0; }
.filter-label { display: block; color: var(--forest); margin: 0 0 8px 2px; font-size: 10px; font-weight: 800; letter-spacing: 1.4px; }
.search-control { display: flex; align-items: center; gap: 0; height: 57px; border: 1px solid #ddd3bf; border-radius: 13px; background: #fffdf7; overflow: hidden; }
.search-control > ion-icon { color: var(--terracotta); font-size: 21px; flex: 0 0 auto; margin-left: 17px; }
.campaign-searchbar { padding: 0 !important; width: 100%; height: 100%; flex: 1 1 auto; min-width: 0; --background: transparent; --color: #173729; --placeholder-color: #879083; --icon-color: transparent; --clear-button-color: #173729; --border-radius: 0; --box-shadow: none; font-family: inherit; font-size: 13px; }
.category-select { width: 100%; min-height: 57px; --background: #fffdf7; --border-color: #ddd3bf; --border-width: 1px; --border-radius: 13px; --padding-start: 16px; --padding-end: 15px; --highlight-color-focused: #be563b; color: var(--forest); font-size: 13px; font-weight: 600; }
.results-row { display: flex; justify-content: space-between; align-items: center; gap: 15px; border-bottom: 1px solid #e2d8c3; padding: 0 2px 15px; margin-bottom: 22px; color: var(--forest); font-size: 10px; font-weight: 800; letter-spacing: 1.6px; }
.results-accent { color: var(--terracotta); padding-right: 8px; font-size: 13px; }
.clear-filters { padding: 6px 2px; display: flex; align-items: center; gap: 5px; background: transparent; border: 0; color: var(--terracotta); font-size: 10px; font-weight: 800; cursor: pointer; letter-spacing: .6px; }
.clear-filters ion-icon { font-size: 15px; }

/* CampaignCard.vue is kept intact. The wrapper styles its exterior only. */
.campaign-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 335px), 1fr)); gap: clamp(17px, 2vw, 25px); align-items: stretch; }
.campaign-item { min-width: 0; background: #fffdf7; border: 1px solid #e9dfc9; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 25px rgba(24,60,44,.07); transition: transform .2s, box-shadow .2s; }
.campaign-item:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(24,60,44,.12); }
.campaign-item :deep(ion-card) { margin: 0; border-radius: 0; box-shadow: none; background: #fffdf7; width: 100%; }
.campaign-item :deep(.campaign-card) { margin: 0; border-radius: 0; box-shadow: none; background: #fffdf7; }
.campaign-item :deep(img) { max-width: 100%; }
/* Typography and progress colors carry into the existing CampaignCard component. */
.campaign-item :deep(h2), .campaign-item :deep(h3),
.campaign-item :deep(ion-card-title) {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 500;
  color: #173729;
  line-height: 1.25;
}
.campaign-item :deep(p), .campaign-item :deep(ion-card-subtitle) {
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
}
.campaign-item :deep(ion-progress-bar) {
  --background: #e5eadb;
  --progress-background: #3d8852;
  border-radius: 99px;
  overflow: hidden;
}

/* States use the same warm tone as the other pages. */
.state-box { min-height: 270px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; padding: 35px 18px; background: #fff9ed; border: 1px dashed #daceb5; border-radius: 17px; }
.state-box .state-icon { font-size: 46px; color: var(--terracotta); }
.state-spinner { color: #3d8852; width: 38px; height: 38px; }
.state-box h3 { font-size: 26px; font-weight: 400; margin: 1px 0 0; }
.state-box p { max-width: 460px; color: var(--muted); font-size: 13px; line-height: 1.6; margin: 0; }
.state-action { background: var(--gold); color: var(--deep); border: 0; border-radius: 30px; font-size: 11px; letter-spacing: .7px; font-weight: 800; padding: 12px 18px; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.campaigns-footer { padding: 23px var(--page-gutter) 30px; border-top: 1px solid #e5dac5; color: var(--muted); display: flex; justify-content: space-between; gap: 15px; font-size: 11px; }

@media (max-width: 850px) {
  .campaigns-hero { min-height: 240px; grid-template-columns: 1.3fr .7fr; padding: 25px 33px; }
  .campaigns-hero h1 { font-size: clamp(33px, 4.5vw, 48px); }
  .hero-art img { max-height: 205px; }
  .browse-section { padding-top: 35px; }
}
@media (max-width: 620px) {
  .relief-campaigns-page { --page-gutter: 14px; }
  .campaigns-navbar { height: 68px; padding: 0 16px; }
  .brand { font-size: 28px; }
  .back-link { font-size: 9px; padding: 10px 12px; gap: 5px; }
  .back-link ion-icon { font-size: 15px; }
  .campaigns-hero { margin-top: 11px; min-height: 0; grid-template-columns: 1fr; border-radius: 15px; padding: 26px 22px 20px; gap: 10px; }
  .campaigns-hero::before { font-size: 90px; top: 3px; right: -20px; }
  .campaigns-hero h1 { font-size: clamp(32px, 9vw, 42px); }
  .hero-description { font-size: 12px; }
  .hero-note { font-size: 8px; margin-top: 15px; }
  .hero-art { display: none; }
  .browse-section { width: calc(100% - 28px); padding: 29px 0 44px; }
  .section-heading { gap: 10px; align-items: flex-start; }
  .section-heading h2 { font-size: clamp(29px, 7.7vw, 38px); }
  .section-description { font-size: 12px; }
  .campaign-count strong { font-size: 29px; }
  .campaign-count span { font-size: 8px; max-width: 75px; text-align: right; }
  .filter-panel { grid-template-columns: 1fr; gap: 13px; }
  .results-row { letter-spacing: .8px; font-size: 9px; }
  .campaign-grid { grid-template-columns: 1fr; gap: 18px; }
  .campaigns-footer { justify-content: center; flex-wrap: wrap; text-align: center; font-size: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .campaign-item, .back-link { transition: none; }
}

/* Consistent, accessible filter controls. */
.rg-extra-filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 0 0 21px;
}
.rg-filter-field { min-width: 0; display: flex; flex-direction: column; gap: 9px; }
.rg-filter-field > label {
  color: #173729;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.1px;
}
.rg-filter-input-wrap {
  min-width: 0;
  height: 53px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 14px;
  border: 1px solid #ddd3bf;
  border-radius: 12px;
  background: #fffdf7;
  color: #173729;
  transition: border-color .2s, box-shadow .2s;
}
.rg-filter-input-wrap:focus-within {
  border-color: #b75a3c;
  box-shadow: 0 0 0 3px rgba(190, 86, 59, .13);
}
.rg-filter-input-wrap ion-icon { color: #b85a3f; font-size: 18px; flex: none; }
.rg-filter-input-wrap input,
.rg-filter-input-wrap select {
  flex: 1;
  min-width: 0;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #173729;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
}
.rg-filter-input-wrap input::placeholder { color: #899085; opacity: 1; }
.rg-filter-input-wrap select { cursor: pointer; padding-right: 1px; }
.rg-peso-sign { color: #b85a3f; font-size: 16px; font-weight: 800; flex: none; }
.rg-filter-warning {
  display: flex; align-items: center; gap: 8px;
  margin: -7px 0 21px;
  padding: 11px 14px;
  border: 1px solid #ddaa9d;
  border-radius: 10px;
  background: #fff0e8;
  color: #9c352a;
  font-size: 12px;
  font-weight: 700;
}
.rg-filter-warning ion-icon { font-size: 18px; flex: none; }
/* Keep real campaign cards and their links. An explicit path to the full detail/donate page. */
.campaign-item { display: flex; flex-direction: column; }
.campaign-item > :deep(.campaign-card),
.campaign-item > :deep(ion-card) { flex: 1 1 auto; }
.rg-open-campaign-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: calc(100% - 26px);
  min-height: 47px;
  padding: 12px 15px;
  margin: auto 13px 14px;
  border: 1px solid #173729;
  border-radius: 11px;
  background: #173729;
  color: #fffaf0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .35px;
  cursor: pointer;
  transition: background .2s, transform .2s;
}
.rg-open-campaign-button ion-icon { flex: none; color: #f3b75d; font-size: 18px; }
.rg-open-campaign-button:hover { background: #24543d; transform: translateY(-1px); }
.rg-open-campaign-button:focus-visible { outline: 3px solid #f3b75d; outline-offset: 2px; }
@media (max-width: 900px) { .rg-extra-filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 460px) {
  .rg-extra-filters { grid-template-columns: 1fr; gap: 12px; }
  .rg-filter-input-wrap { height: 49px; }
  .rg-open-campaign-button { font-size: 10px; }
}


/* === RELIEFGO DASHBOARD SIDEBAR / TOP BAR (matches the 266px screenshot) === */
.rg-browse-sidebar {
  position: fixed; inset: 0 auto 0 0; z-index: 100;
  display: flex; flex-direction: column; width: 270px; height: 100dvh;
  background: #123527; color: #fffaf0;
  box-shadow: 5px 0 22px rgba(17,43,32,.12);
  font-family: 'DM Sans','Segoe UI',Arial,sans-serif;
}
.sidebar-brand, .drawer-brand {
  display: block; padding: 30px 17px 27px; border-bottom: 1px solid #ffffff25;
  font: 700 31px/1 Georgia,'Times New Roman',serif; letter-spacing: -.7px;
  color: #fffaf0;
}
.sidebar-brand span, .sidebar-brand sup, .drawer-brand span, .drawer-brand sup { color: #f3b75d; }
.sidebar-brand sup, .drawer-brand sup { margin-left: 2px; font-size: 12px; vertical-align: super; }
.sidebar-brand small, .drawer-brand small { display: block; margin-top: 12px; color: #f4d6a3; font: 800 9px 'DM Sans','Segoe UI',sans-serif; letter-spacing: 2px; }
.sidebar-profile {
  display: flex; align-items: center; gap: 12px; min-width: 0;
  margin: 21px 9px; padding: 14px 10px;
  border-radius: 14px; background: #ffffff11;
}
.sidebar-profile > div { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.sidebar-profile small { font-size: 9px; font-weight: 800; letter-spacing: .7px; color: #edc98d; }
.sidebar-profile strong { color: #fffaf0; font-size: 12px; font-weight: 800; line-height: 1.3; overflow-wrap: anywhere; }
.sidebar-avatar {
  display: grid; place-items: center; flex: 0 0 51px; width: 51px; height: 51px;
  border-radius: 50%; background: #f3b75d; color: #112b20; font: 700 19px Georgia,serif;
}
.sidebar-section-title { margin: 14px 17px 14px; color: #f3b75d; font-size: 10px; font-weight: 800; letter-spacing: 1.6px; }
.sidebar-links { display: grid; align-content: start; overflow-y: auto; flex: 1 1 auto; min-height: 0; gap: 5px; padding: 0 8px; }
.sidebar-links a, .sidebar-links a:link, .sidebar-links a:visited {
  display: flex; align-items: center; gap: 15px;
  padding: 12px 13px; min-height: 49px; border-radius: 12px;
  color: #fffaf0 !important; text-decoration: none !important;
  font-size: 12px; font-weight: 800; line-height: 1.3;
}
.sidebar-links a ion-icon { color: #f3b75d; font-size: 20px; flex: none; }
.sidebar-links a:hover, .sidebar-links a.sidebar-active { color: #fff !important; background: #ffffff25; }
.sidebar-links a:focus-visible { outline: 2px solid #f3b75d; outline-offset: -2px; }
.sidebar-bottom { margin: auto 12px 0; padding: 24px 5px 25px; border-top: 1px solid #ffffff25; color: #e3ccaa; font: italic 13px Georgia,serif; }
.sidebar-bottom > span { display: block; }
.sidebar-logout {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; min-height: 46px; margin-top: 15px;
  background: #f3b75d; border: 1px solid #f3b75d; border-radius: 11px;
  color: #112b20; font: 800 12px 'DM Sans','Segoe UI',sans-serif; cursor: pointer;
}
.sidebar-logout ion-icon { font-size: 17px; }
.sidebar-logout:hover { background: #ffdfa3; }
.sidebar-logout:focus-visible { outline: 3px solid #be563b; outline-offset: 3px; }
.rg-browse-main { left: 0; width: 100%; min-width: 0; }
.rg-browse-main.has-sidebar { left: 270px; width: calc(100% - 270px); --page-gutter: clamp(18px, 3.3vw, 55px); }
.rg-browse-header { box-shadow: none; }
.rg-browse-header::after { display: none; }
.rg-browse-toolbar { --background: #fbf0dc; --color: #173729; --padding-start: 0; --padding-end: 0; --min-height: 75px; border-bottom: 1px solid #e5d9c2; }
.rg-topbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; width: 100%; min-height: 74px; padding: 9px clamp(17px, 3.2vw, 54px); }
.rg-topbar-left, .rg-topbar-right { display: flex; align-items: center; gap: 15px; min-width: 0; }
.rg-topbar-right { margin-left: auto; }
.topbar-brand { color: #173729 !important; font: 700 clamp(24px,2.3vw,35px)/1 Georgia,serif; letter-spacing: -1.5px; white-space: nowrap; }
.topbar-brand span, .topbar-brand sup { color: #be563b; }
.topbar-brand sup { margin-left: 2px; font-size: 11px; }
.rg-top-divider { flex: none; width: 1px; height: 24px; background: #dacbb4; }
.rg-top-page-name { color: #173729; font-size: 10px; font-weight: 900; letter-spacing: 1.5px; white-space: nowrap; }
.rg-topbar-account { display: flex; align-items: center; gap: 10px; }
.rg-topbar-avatar { display: grid; place-items: center; flex: 0 0 43px; width: 43px; height: 43px; border-radius: 50%; background: #f3b75d; color: #112b20; font: 700 17px Georgia,serif; }
.rg-topbar-account-text { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.rg-topbar-account-text strong { max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.rg-topbar-account-text small { color: #be563b; font-size: 9px; font-weight: 800; letter-spacing: 1px; }
.rg-menu-toggle { display: none; background: transparent; color: #173729; border: 0; border-radius: 9px; padding: 8px; cursor: pointer; }
.rg-menu-toggle ion-icon { display: block; font-size: 24px; }
.rg-menu-toggle:focus-visible { outline: 2px solid #be563b; }
.rg-browse-mobile-menu { display: none; --width: min(320px, 87vw); }
.rg-browse-mobile-menu::part(container) { background: #123527; box-shadow: 8px 0 35px rgba(0,0,0,.19); }
.drawer-toolbar { --background: #123527; --min-height: 105px; }
.drawer-brand { padding: 22px; border: 0; font-size: 29px; }
.drawer-content { --background: #123527; --color: #fffaf0; }
.drawer-body { min-height: 100%; display: flex; flex-direction: column; padding: 3px 0 0; }
.drawer-body .sidebar-profile { margin-top: 12px; }
/* Replace the page's former full-width navbar with the dashboard header above. */
.campaigns-navbar { display: none; }
/* Match the screenshot's content gutters *within* the sidebar-reduced workspace. */
.relief-campaigns-page .campaigns-hero { width: calc(100% - 2 * var(--page-gutter)); }
.relief-campaigns-page .browse-section { max-width: 1550px; }

/* Redesigned, clearly separated filters: crisp icons and consistent spacing. */
.rg-extra-filters { column-gap: 15px; row-gap: 18px; margin-top: 6px; margin-bottom: 24px; }
.rg-filter-field { gap: 10px; }
.rg-filter-field > label { display: inline-flex; align-items: center; gap: 7px; min-height: 17px; font-size: 10px; letter-spacing: 1px; }
.rg-filter-field > label ion-icon { color: #be563b; font-size: 15px; flex: none; }
.rg-filter-input-wrap { min-height: 52px; border-radius: 12px; padding-inline: 13px; gap: 11px; }
.rg-filter-input-wrap input, .rg-filter-input-wrap select { font-size: 12px; line-height: 1.5; }
.rg-status-hint { display: inline-flex; align-items: center; gap: 6px; min-height: 17px; color: #6e7b6d; font-size: 10px; line-height: 1.35; }
.rg-status-hint ion-icon { color: #be563b; font-size: 13px; flex: none; }
.rg-filter-input-wrap:focus-within { border-color: #be563b; box-shadow: 0 0 0 3px rgba(190,86,59,.1); }

@media (max-width: 1100px) and (min-width: 901px) {
  .rg-topbar-account-text { display: none; }
  .rg-extra-filters { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .filter-panel { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .rg-browse-sidebar { display: none; }
  .rg-browse-main.has-sidebar { left: 0; width: 100%; }
  .rg-browse-mobile-menu { display: block; }
  .rg-menu-toggle { display: inline-flex; }
  .rg-topbar-account-text { display: none; }
}
@media (max-width: 520px) {
  .rg-topbar { padding: 8px 13px; gap: 8px; min-height: 67px; }
  .rg-topbar-left, .rg-topbar-right { gap: 9px; }
  .topbar-brand { font-size: 25px; }
  .rg-top-divider, .rg-top-page-name, .rg-topbar-account { display: none; }
  .rg-extra-filters { grid-template-columns: 1fr; gap: 16px; }
  .rg-status-hint { font-size: 11px; }
}
@media (prefers-reduced-motion: reduce) {
  .sidebar-links a { transition: none; }
}


/* FINAL STATUS FILTER: fully styled in-app menu (not the native OS dropdown). */
.rg-status-filter-field { position: relative; z-index: 15; }
.rg-status-control { position: relative; width: 100%; }
.rg-status-trigger {
  display: flex; align-items: center; gap: 12px; width: 100%; min-height: 53px;
  padding: 11px 13px; background: #fffdf7; border: 1px solid #d8c9b3;
  border-radius: 12px; color: #173729; font: 700 12px/1.4 'DM Sans','Segoe UI',Arial,sans-serif;
  text-align: left; cursor: pointer; box-shadow: 0 4px 10px #12352709;
  transition: border-color .16s, background .16s, box-shadow .16s;
}
.rg-status-trigger > span { flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere; }
.rg-status-trigger .rg-status-leading-icon { color: #b85a3f !important; font-size: 19px; flex: 0 0 auto; }
.rg-status-trigger .rg-status-chevron { color: #173729 !important; font-size: 19px; flex: 0 0 auto; transition: transform .16s; }
.rg-status-trigger-open .rg-status-chevron { transform: rotate(180deg); }
.rg-status-trigger:hover, .rg-status-trigger-open { border-color: #b8694b; background: #fff9eb; }
.rg-status-trigger:focus-visible { outline: 3px solid #e5b466; outline-offset: 2px; }
.rg-status-dropdown {
  position: absolute; top: calc(100% + 9px); right: 0; width: max(100%, 295px);
  max-width: min(400px, calc(100vw - 40px)); z-index: 100;
  padding: 8px; border-radius: 14px; border: 1px solid #e3d6bf;
  background: #fffaf0; box-shadow: 0 16px 40px rgba(18,53,39,.18);
}
.rg-status-option {
  display: flex; align-items: center; gap: 11px; width: 100%; min-height: 56px;
  padding: 10px 12px; margin: 0; background: transparent; border: 0;
  border-radius: 9px; color: #173729; text-align: left; cursor: pointer;
  font-family: 'DM Sans','Segoe UI',Arial,sans-serif;
}
.rg-status-option + .rg-status-option { margin-top: 3px; }
.rg-status-option:hover, .rg-status-option:focus-visible { background: #f3ead8; outline: none; }
.rg-status-option-selected { background: #e7ede1; }
.rg-status-option-icon {
  display: grid; place-items: center; flex: 0 0 37px; height: 37px;
  color: #ba5d40; border-radius: 9px; background: #f7e6d2;
}
.rg-status-option:nth-child(2) .rg-status-option-icon,
.rg-status-option:nth-child(3) .rg-status-option-icon { color: #287147; background: #e2f0df; }
.rg-status-option:nth-child(4) .rg-status-option-icon { color: #ad4236; background: #fae3db; }
.rg-status-option-icon ion-icon { font-size: 19px; }
.rg-status-option-copy { display: flex; flex-direction: column; min-width: 0; flex: 1; gap: 4px; }
.rg-status-option-copy strong { color: #183b2c; font-size: 12px; font-weight: 800; line-height: 1.35; }
.rg-status-option-copy small { color: #758075; font-size: 10px; line-height: 1.35; }
.rg-status-option-check { color: #277349; font-size: 18px; flex: none; }
/* Preserve the six administrator links while rendering the organizer member workspace. */
@media (max-width: 900px) { .rg-status-dropdown { left: 0; right: auto; } }
@media (max-width: 520px) {
  .rg-status-dropdown { width: 100%; max-width: 100%; }
  .rg-status-trigger { font-size: 13px; }
}


/* === MEMBER WORKSPACE SIDEBAR: screenshot-matched organizer / donor navigation === */
.rg-browse-sidebar, .drawer-body {
  --member-forest: #15392c;
  --member-gold: #f4b75c;
  --member-cream: #f9f0de;
}
.rg-browse-sidebar { width: 273px; background: var(--member-forest); }
.rg-browse-main.has-sidebar { left: 273px; width: calc(100% - 273px); }
.sidebar-brand, .drawer-brand {
  padding: 28px 28px 24px;
  min-height: 113px;
  font-size: 33px;
  background: var(--member-forest);
  border-bottom: 1px solid rgba(255,255,255,.16);
}
.sidebar-brand small, .drawer-brand small {
  margin-top: 12px;
  letter-spacing: 2.35px;
  font-size: 10px;
  color: #f3c17e;
}
.sidebar-profile {
  margin: 24px 14px 22px;
  padding: 14px 10px;
  min-height: 75px;
  border-radius: 13px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.055);
  gap: 12px;
}
.sidebar-avatar { width: 42px; height: 42px; flex-basis: 42px; font-size: 17px; }
.sidebar-profile > div { flex: 1; overflow: hidden; gap: 5px; }
.sidebar-profile small { font-size: 10px; color: #f3c17e; letter-spacing: .55px; }
.sidebar-profile strong {
  display: block; max-width: 100%; overflow: hidden; white-space: nowrap;
  text-overflow: ellipsis; overflow-wrap: normal; font-size: 12px;
}
.sidebar-section-title { margin: 11px 27px 14px; font-size: 11px; letter-spacing: 1.7px; }
.sidebar-links { gap: 5px; padding: 0 12px; }
.sidebar-links a, .sidebar-links a:link, .sidebar-links a:visited {
  min-height: 48px; padding: 12px 14px; gap: 15px;
  font-size: 14px; font-weight: 700; border-radius: 11px;
  color: #e6ebe5 !important;
}
.sidebar-links a ion-icon { font-size: 19px; color: #efb861; }
.sidebar-links a.sidebar-active, .sidebar-links a.sidebar-active:link,
.sidebar-links a.sidebar-active:visited {
  background: var(--member-cream); color: #173729 !important;
}
.sidebar-links a.sidebar-active ion-icon { color: #c56d4f; }
.sidebar-links a:not(.sidebar-active):hover { background: rgba(255,255,255,.12); }
.sidebar-bottom { margin: auto 12px 0; padding: 12px 0 14px; border-top: 0; }
.sidebar-bottom > span { padding: 0 13px; font: normal 12px 'DM Sans','Segoe UI',sans-serif; color: #efba69; }
.sidebar-logout { min-height: 48px; margin-top: 13px; border-radius: 10px; }
/* Keep the header clean: page name and account details only, no return shortcut. */
.rg-topbar-right { justify-content: flex-end; }
@media (max-width: 900px) {
  .rg-browse-sidebar { display: none; }
  .rg-browse-main.has-sidebar { left: 0; width: 100%; }
  .drawer-content, .drawer-toolbar, .rg-browse-mobile-menu::part(container) { --background: #15392c; }
  .drawer-brand { min-height: 105px; padding: 22px 23px 19px; }
  .drawer-body .sidebar-profile { margin: 15px 14px 19px; }
  .drawer-body .sidebar-links { overflow-y: auto; }
}


/* ===============================================================
   DASHBOARD SCREENSHOT ALIGNMENT — EXACT LEFT/RIGHT CONTENT SCALE
   Reference screenshot: 1857 px viewport, 273 px sidebar,
   ~1200 px centered content, ~180 px clear space on each side.
   =============================================================== */
.rg-browse-main {
  --workspace-content-width: 1200px;
  --workspace-edge-space: 28px;
  min-width: 0;
}

/* Sidebar width already matches the dashboard screenshot at 273px.
   Match its inner profile and logo insets too. */
.rg-browse-sidebar {
  width: 273px;
}
.rg-browse-main.has-sidebar {
  left: 273px;
  width: calc(100% - 273px);
}
.sidebar-brand {
  padding-left: 23px;
  padding-right: 23px;
}
.rg-browse-sidebar .sidebar-profile {
  margin-left: 9px;
  margin-right: 9px;
}

/* Dashboard header brand begins 28px after the content boundary. */
.rg-topbar {
  min-height: 74px;
  padding: 9px 28px;
}

/* Both hero and campaign filters/cards use one shared 1200px column.
   The previous layout used page-gutter=55px, which spread the content
   almost edge to edge. Centering fixes both left/right whitespace. */
.relief-campaigns-page .rg-browse-main .campaigns-hero {
  width: min(var(--workspace-content-width), calc(100% - 2 * var(--workspace-edge-space)));
  max-width: var(--workspace-content-width);
  min-height: 330px;
  margin: 40px auto 0;
  padding: 42px clamp(30px, 4vw, 69px);
  border-radius: 19px;
}
.relief-campaigns-page .rg-browse-main .browse-section {
  width: min(var(--workspace-content-width), calc(100% - 2 * var(--workspace-edge-space)));
  max-width: var(--workspace-content-width);
  margin: 0 auto;
  padding: 36px 0 70px;
}
.relief-campaigns-page .rg-browse-main .campaigns-footer {
  width: min(var(--workspace-content-width), calc(100% - 2 * var(--workspace-edge-space)));
  max-width: var(--workspace-content-width);
  margin: 0 auto;
  padding: 23px 0 30px;
}

/* Keep all columns inside the content container on narrower screens. */
.filter-panel,
.rg-extra-filters,
.campaign-grid,
.section-heading { min-width: 0; }

@media (max-width: 1200px) and (min-width: 901px) {
  .rg-browse-main { --workspace-edge-space: 26px; }
  .relief-campaigns-page .rg-browse-main .campaigns-hero {
    min-height: 275px;
    margin-top: 28px;
    padding: 35px clamp(28px, 3.6vw, 54px);
  }
  .relief-campaigns-page .rg-browse-main .browse-section {
    padding-top: 32px;
  }
}

@media (max-width: 900px) {
  .rg-browse-main { --workspace-edge-space: 20px; }
  .rg-browse-sidebar { display: none; }
  .rg-browse-main.has-sidebar { left: 0; width: 100%; }
  .relief-campaigns-page .rg-browse-main .campaigns-hero {
    margin-top: 23px;
    min-height: 260px;
    padding: 29px 34px;
  }
  .relief-campaigns-page .rg-browse-main .browse-section {
    padding-top: 32px;
  }
}

@media (max-width: 620px) {
  .rg-browse-main { --workspace-edge-space: 14px; }
  .rg-topbar { min-height: 67px; padding: 8px 15px; }
  .relief-campaigns-page .rg-browse-main .campaigns-hero {
    min-height: 0;
    margin-top: 13px;
    padding: 27px 22px 23px;
    border-radius: 15px;
    grid-template-columns: 1fr;
  }
  .relief-campaigns-page .rg-browse-main .browse-section {
    padding-top: 29px;
    padding-bottom: 48px;
  }
  .relief-campaigns-page .rg-browse-main .campaigns-footer {
    padding-bottom: 24px;
  }
}

</style>