<template>
  <ion-page class="relief-details-page">
    <!-- Same ReliefGO Member Workspace navigation as the organizer dashboard. -->
    <ion-menu v-if="isLoggedIn && $route.name === 'CampaignDetails'" menu-id="rg-detail-menu" content-id="rg-detail-main"
      type="overlay" side="start" class="rg-detail-mobile-menu">
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
                @click="closeDetailsMenu">
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

    <aside v-if="isLoggedIn" class="rg-detail-sidebar" aria-label="ReliefGO member workspace">
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
                @click="closeDetailsMenu">
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

    <div id="rg-detail-main" class="ion-page rg-detail-main" :class="{ 'has-sidebar': isLoggedIn }">
      <ion-header class="rg-detail-header">
        <ion-toolbar class="rg-detail-toolbar">
          <div class="rg-details-topbar">
            <div class="rg-details-topbar-left">
              <button v-if="isLoggedIn" type="button" class="rg-detail-menu-toggle"
                aria-label="Open workspace menu" @click="toggleDetailsMenu">
                <ion-icon :icon="menuOutline" aria-hidden="true" />
              </button>
              <router-link :to="homeHref" class="rg-topbar-brand" aria-label="ReliefGO home">
                Relief<span>GO</span><sup>♥</sup>
              </router-link>
              <span class="rg-topbar-divider" aria-hidden="true"></span>
              <span class="rg-topbar-page-title">CAMPAIGN DETAILS</span>
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

      <ion-content :fullscreen="false" class="details-content">
        <div class="details-shell">
          <div class="details-container">
            <div class="details-actions">
              <router-link :to="backHref" class="back-link">
                <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
                <span>{{ accountRole === 'organizer' ? 'BACK TO MY CAMPAIGNS' : 'BACK TO CAMPAIGNS' }}</span>
              </router-link>
            </div>

        <main class="details-main">

          <div v-if="loading" class="state-box" role="status" aria-live="polite">
            <ion-spinner name="crescent" class="state-spinner" />
            <h2>Gathering this story...</h2>
            <p>Loading the campaign details and community updates.</p>
          </div>

          <div v-else-if="!campaign" class="state-box" role="alert">
            <ion-icon :icon="alertCircleOutline" class="state-icon" />
            <h2>Campaign not found.</h2>
            <p>This campaign does not exist or is not available to the public.</p>
            <router-link to="/campaigns" class="state-action">
              EXPLORE CAMPAIGNS
              <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
            </router-link>
          </div>

          <template v-else>

            <!-- HERO -->
            <section class="detail-hero" aria-labelledby="campaign-title">
              <div class="hero-copy">
                <p class="eyebrow">
                  RELIEFGO
                  <span class="eyebrow-dot">✦</span>
                  STORIES OF BAYANIHAN
                </p>

                <span class="category-badge">
                  {{ campaign.category }}
                </span>

                <h1 id="campaign-title">{{ campaign.title }}</h1>

                <p class="hero-description">
                  Every helping hand can make a difference.
                </p>

                <div class="organizer-line">
                  <ion-icon :icon="peopleOutline" aria-hidden="true" />
                  <span>
                    Organized by
                    <strong>{{ campaign.organizerName }}</strong>
                  </span>
                </div>
              </div>

              <div class="hero-visual">
                <img
                  v-if="campaign.imageUrl"
                  :src="campaign.imageUrl"
                  :alt="`Photo for ${campaign.title}`"
                  loading="eager"
                />

                <div
                  v-else
                  class="hero-image-placeholder"
                  role="img"
                  aria-label="ReliefGO campaign illustration placeholder"
                >
                  <span class="placeholder-rays" aria-hidden="true"></span>
                  <ion-icon :icon="heartOutline" aria-hidden="true" />
                  <span>SMALL ACTS. BIG HEARTS.</span>
                </div>
              </div>
            </section>

            <div class="detail-layout">

              <!-- LEFT SIDE -->
              <div class="detail-story">

                <section class="story-intro" aria-labelledby="story-section-heading">
                  <p class="section-eyebrow">
                    THE STORY BEHIND THE CAUSE
                  </p>

                  <h2 id="story-section-heading">
                    A little help can bring <em>hope.</em>
                  </h2>

                  <p class="story-lead">
                    Learn more about this campaign, the people it supports,
                    and where help is needed.
                  </p>
                </section>

                <!-- ABOUT -->
                <section class="info-panel" aria-labelledby="about-heading">
                  <div class="panel-heading">
                    <span class="heading-accent" aria-hidden="true">01</span>

                    <div>
                      <p class="section-eyebrow">EVERY STORY MATTERS</p>
                      <h3 id="about-heading">
                        {{ isVolunteerEvent ? 'About this event' : 'About this campaign' }}
                      </h3>
                    </div>
                  </div>

                  <p class="body-copy">
                    {{ campaign.description }}
                  </p>
                </section>

                <!-- BENEFICIARY -->
                <section class="info-panel" aria-labelledby="beneficiary-heading">
                  <div class="panel-heading">
                    <span class="heading-accent" aria-hidden="true">02</span>

                    <div>
                      <p class="section-eyebrow">WHO WE'RE HELPING</p>
                      <h3 id="beneficiary-heading">The beneficiary</h3>
                    </div>
                  </div>

                  <p class="beneficiary-name">
                    {{ campaign.beneficiaryName }}
                  </p>

                  <p class="body-copy">
                    {{ campaign.beneficiaryInfo }}
                  </p>
                </section>

                <!-- LOCATION -->
                <section
                  class="info-panel location-panel"
                  aria-labelledby="location-heading"
                >
                  <div class="panel-heading">
                    <span class="heading-accent" aria-hidden="true">03</span>

                    <div>
                      <p class="section-eyebrow">WHERE HELP IS NEEDED</p>
                      <h3 id="location-heading">Campaign location</h3>
                    </div>
                  </div>

                  <p class="location-address">
                    <ion-icon :icon="locationOutline" aria-hidden="true" />
                    <span>{{ campaign.locationAddress }}</span>
                  </p>

                  <div class="map-frame">
                    <LocationMap
                      :latitude="campaign.latitude"
                      :longitude="campaign.longitude"
                      :address="campaign.locationAddress"
                    />
                  </div>
                </section>

                <!-- UPDATES -->
                <section class="info-panel" aria-labelledby="updates-heading">
                  <div class="panel-heading">
                    <span class="heading-accent" aria-hidden="true">04</span>

                    <div>
                      <p class="section-eyebrow">FOLLOW THEIR JOURNEY</p>
                      <h3 id="updates-heading">Campaign updates</h3>
                    </div>
                  </div>

                  <div class="updates-content">
                    <CampaignUpdatesList :updates="updates" />
                  </div>
                </section>

                <!-- DONORS - FUNDRAISING ONLY -->
                <section
                  v-if="!isVolunteerEvent"
                  class="info-panel"
                  aria-labelledby="donors-heading"
                >
                  <div class="panel-heading">
                    <span class="heading-accent" aria-hidden="true">05</span>

                    <div>
                      <p class="section-eyebrow">KINDNESS IN ACTION</p>
                      <h3 id="donors-heading">Recent donors</h3>
                    </div>
                  </div>

                  <p v-if="donors.length === 0" class="empty-donors">
                    No verified donations yet. Be the first to help.
                  </p>

                  <ion-list v-else class="donor-list" lines="full">
                    <ion-item
                      v-for="donor in donors"
                      :key="donor.id"
                      class="donor-item"
                    >
                      <ion-label>
                        <h4>{{ donor.donorName }}</h4>
                        <p>{{ formatDate(donor.verifiedAt) }}</p>
                      </ion-label>

                      <ion-note slot="end" class="donor-amount">
                        {{ formatPeso(donor.amount) }}
                      </ion-note>
                    </ion-item>
                  </ion-list>
                </section>

              </div>

              <!-- RIGHT SIDE -->
              <aside
                class="donation-aside"
                aria-label="Campaign and volunteer information"
              >
                <div class="summary-card">

                  <p class="section-eyebrow">
                    {{ isVolunteerEvent ? 'COMMUNITY EVENT' : 'GIVE WITH HEART' }}
                    <span aria-hidden="true">♥</span>
                  </p>

                  <h2>
                    {{ isVolunteerEvent ? 'Join the' : 'Help make this' }}
                    <em>
                      {{ isVolunteerEvent ? 'bayanihan.' : 'possible.' }}
                    </em>
                  </h2>

                  <!-- VOLUNTEER EVENT DETAILS -->
                  <div v-if="isVolunteerEvent || needsVolunteers" class="volunteer-details">

                    <div class="event-info">
                      <span class="event-info-label">EVENT CATEGORY</span>
                      <strong>{{ campaign.category }}</strong>
                    </div>

                    <div v-if="campaign.volunteerDate" class="event-info">
                      <span class="event-info-label">EVENT DATE</span>
                      <strong>
                        {{ formatDate(campaign.volunteerDate) }}
                      </strong>
                    </div>

                    <!-- VOLUNTEERS REQUIRED -->
                    <template v-if="needsVolunteers">

                      <div class="volunteer-status volunteer-status-yes">
                        <ion-icon :icon="peopleOutline" />
                        <span>THIS EVENT NEEDS VOLUNTEERS</span>
                      </div>

                      <div class="event-info">
                        <span class="event-info-label">
                          TYPE OF VOLUNTEER HELP
                        </span>

                        <strong>
                          {{ campaign.volunteerHelpCategory || 'General Assistance' }}
                        </strong>
                      </div>

                      <div
                        v-if="campaign.volunteerDuties"
                        class="event-info"
                      >
                        <span class="event-info-label">
                          VOLUNTEER DUTIES
                        </span>

                        <p>{{ campaign.volunteerDuties }}</p>
                      </div>

                      <div
                        v-if="campaign.volunteerRequirements"
                        class="event-info"
                      >
                        <span class="event-info-label">
                          VOLUNTEER REQUIREMENTS
                        </span>

                        <p>{{ campaign.volunteerRequirements }}</p>
                      </div>

                      <div class="volunteer-stats">
                        <div class="volunteer-stat">
                          <strong>{{ campaign.volunteerSlots || 0 }}</strong>
                          <span>Volunteer slots</span>
                        </div>

                        <div class="volunteer-stat">
                          <strong>{{ campaign.volunteerCount || 0 }}</strong>
                          <span>Applications</span>
                        </div>
                      </div>

                    </template>

                    <!-- NO VOLUNTEERS REQUIRED -->
                    <div v-else class="volunteer-status volunteer-status-no">
                      <ion-icon :icon="informationCircleOutline" />

                      <div>
                        <strong>No volunteers needed</strong>
                        <p>
                          The organizer is not currently recruiting
                          volunteers for this event.
                        </p>
                      </div>
                    </div>

                  </div>

                  <!-- FUNDRAISING PROGRESS -->
                  <div v-if="!isVolunteerEvent" class="progress-section">
                    <CampaignProgress
                      :raised="campaign.verifiedTotal"
                      :goal="campaign.goalAmount"
                    />
                  </div>

                  <!-- FUNDRAISING STATS -->
                  <div v-if="!isVolunteerEvent" class="stats">

                    <div class="stat">
                      <strong>{{ campaign.verifiedDonorCount }}</strong>
                      <span>Verified donors</span>
                    </div>

                    <div class="stat">
                      <strong>{{ remainingDays }}</strong>
                      <span>Days left</span>
                    </div>

                    <div class="stat">
                      <strong>{{ formatDate(campaign.deadline) }}</strong>
                      <span>Deadline</span>
                    </div>

                  </div>

                  <!-- VOLUNTEER APPLICATION BUTTON -->
                  <template v-if="needsVolunteers">

                    <ion-button
                      v-if="needsVolunteers"
                      expand="block"
                      class="donate-button"
                      :disabled="volunteerDisabled"
                      @click="startVolunteering"
                    >
                      VOLUNTEER FOR THIS EVENT
                      <ion-icon
                        slot="end"
                        :icon="arrowForwardOutline"
                      />
                    </ion-button>

                    <p
                      v-if="volunteerHint"
                      class="donate-hint"
                    >
                      {{ volunteerHint }}
                    </p>

                  </template>

                  <!-- DONATION BUTTON -->
                  <template v-if="!isVolunteerEvent">

                    <ion-button
                      expand="block"
                      class="donate-button"
                      :disabled="donateDisabled"
                      :router-link="`/campaigns/${campaign.id}/donate`"
                    >
                      DONATE NOW

                      <ion-icon
                        slot="end"
                        :icon="arrowForwardOutline"
                        aria-hidden="true"
                      />
                    </ion-button>

                    <p v-if="donateHint" class="donate-hint">
                      {{ donateHint }}
                    </p>

                  </template>

                  <div class="summary-divider"></div>

                  <div class="transparency-note">
                    <ion-icon
                      :icon="shieldCheckmarkOutline"
                      aria-hidden="true"
                    />

                    <span>
                      {{
                        isVolunteerEvent
                          ? 'Events are reviewed by ReliefGO administrators before publication.'
                          : 'Fundraising progress reflects verified donations.'
                      }}
                    </span>
                  </div>

                </div>

                <!-- VOLUNTEER APPLICATION MODAL -->
                <div
                  v-if="volunteerOpen && needsVolunteers"
                  class="rg-modal-backdrop"
                  @click.self="closeVolunteerModal"
                  @keydown.esc="closeVolunteerModal"
                >
                  <section
                    class="rg-volunteer-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Apply to volunteer"
                  >

                    <h2>
                      Join the <em>bayanihan.</em>
                    </h2>

                    <p>
                      Tell us about yourself and how you can help
                      with this event.
                    </p>

                    <div class="modal-event-category">
                      <span>VOLUNTEER CATEGORY</span>

                      <strong>
                        {{ campaign.volunteerHelpCategory || 'General Assistance' }}
                      </strong>
                    </div>

                    <form @submit.prevent="submitVolunteer">

                      <label>
                        FULL NAME *

                        <input
                          v-model="volunteerForm.fullName"
                          autocomplete="name"
                          aria-label="Volunteer full name"
                          minlength="2"
                          required
                          placeholder="Full name"
                          maxlength="100"
                        />
                      </label>

                      <label>
                        CONTACT NUMBER *

                        <input
                          v-model="volunteerForm.phone"
                          type="tel"
                          autocomplete="tel"
                          pattern="09[0-9]{9}"
                          aria-label="Volunteer mobile number"
                          required
                          inputmode="numeric"
                          maxlength="11"
                          placeholder="09XXXXXXXXX"
                        />
                      </label>

                      <label>
                        ADDRESS *

                        <input
                          v-model="volunteerForm.address"
                          autocomplete="street-address"
                          minlength="5"
                          maxlength="200"
                          aria-label="Volunteer home address"
                          required
                          placeholder="Complete address"
                        />
                      </label>

                      <label>
                        AVAILABILITY *

                        <textarea
                          v-model="volunteerForm.availability"
                          minlength="5" maxlength="500"
                          aria-label="Volunteer availability"
                          required
                          rows="2"
                          placeholder="When are you available?"
                        />
                      </label>

                      <label>
                        SKILLS *

                        <textarea
                          v-model="volunteerForm.skills"
                          minlength="5" maxlength="1000"
                          aria-label="Volunteer skills"
                          required
                          rows="2"
                          placeholder="What skills can you share?"
                        />
                      </label>

                      <label>
                        REASON FOR JOINING *

                        <textarea
                          v-model="volunteerForm.reason"
                          minlength="10" maxlength="1000"
                          aria-label="Reason for volunteering"
                          required
                          rows="3"
                          placeholder="Why do you want to volunteer?"
                        />
                      </label>

                      <label class="consent">
                        <input
                          v-model="volunteerForm.consent"
                          type="checkbox"
                          required
                        />

                        I consent to share these details with
                        this event's organizer.
                      </label>

                      <p
                        v-if="volunteerError"
                        class="rg-volunteer-error"
                        role="alert"
                      >
                        {{ volunteerError }}
                      </p>

                      <div class="rg-volunteer-actions">

                        <button
                          type="button"
                          :disabled="volunteerBusy"
                          @click="closeVolunteerModal"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          :disabled="volunteerBusy"
                        >
                          {{
                            volunteerBusy
                              ? 'Submitting...'
                              : 'Submit application'
                          }}
                        </button>

                      </div>

                    </form>
                  </section>
                </div>

                <!-- TRANSPARENCY REPORT -->
                <router-link
                  :to="`/campaigns/${campaign.id}/transparency`"
                  class="transparency-link"
                >
                  <span>
                    <small>ACCOUNTABILITY MATTERS</small>
                    <strong>View Transparency Report</strong>
                  </span>

                  <ion-icon
                    :icon="arrowForwardOutline"
                    aria-hidden="true"
                  />
                </router-link>

              </aside>
            </div>
          </template>
        </main>

        <footer class="details-footer">
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
import { dashboardPathForRole } from '../utils/roles';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, json } from '../services/api';

import {
  IonPage,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonContent,
  menuController,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';

import {
  arrowBackOutline,
  arrowForwardOutline,
  heartOutline,
  peopleOutline,
  shieldCheckmarkOutline,
  locationOutline,
  alertCircleOutline,
  informationCircleOutline,
  gridOutline,
  addCircleOutline,
  megaphoneOutline,
  notificationsOutline,
  barChartOutline,
  documentTextOutline,
  logOutOutline,
  menuOutline,
} from 'ionicons/icons';

import CampaignProgress from '../components/CampaignProgress.vue';
import CampaignUpdatesList from '../components/CampaignUpdatesList.vue';
import LocationMap from '../components/LocationMap.vue';

import { currentUser } from '../services/authState';
import { logoutUser } from '../services/authService';
import { confirmLogout } from '../utils/ui';
import { getCampaignById } from '../services/campaignService';
import { getPublicDonors } from '../services/donationService';
import { getCampaignUpdates } from '../services/updateService';

import { formatDate, formatPeso, daysLeft } from '../utils/format';

import type { Campaign } from '../models/Campaign';
import type { CampaignUpdate } from '../models/CampaignUpdate';
import type { PublicDonor } from '../models/Donation';

const route = useRoute();
const router = useRouter();

// Member Workspace sidebar: same entries, order, and behavior as the dashboard.
const DETAILS_MENU_ID = 'rg-detail-menu';
const isLoggedIn = computed(() => Boolean(currentUser.value));
const accountRole = computed(() => String(currentUser.value?.role || 'guest'));
const homeHref = computed(() => currentUser.value
  ? dashboardPathForRole(currentUser.value.role) : '/welcome');
const backHref = computed(() => accountRole.value === 'organizer'
  ? '/organizer/campaigns' : '/campaigns');
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
async function toggleDetailsMenu() { await menuController.toggle(DETAILS_MENU_ID); }
async function closeDetailsMenu() {
  await menuController.close(DETAILS_MENU_ID).catch(() => undefined);
}
async function handleLogout() {
  if (!(await confirmLogout())) return;
  await closeDetailsMenu();
  await logoutUser();
  await router.replace('/welcome');
}

const campaignId = String(route.params.id);

const campaign = ref<Campaign | null>(null);
const donors = ref<PublicDonor[]>([]);
const updates = ref<CampaignUpdate[]>([]);
const loading = ref(true);

const volunteerOpen = ref(false);
const volunteerBusy = ref(false);
const volunteerError = ref('');

const volunteerForm = ref({
  fullName: '',
  phone: '',
  address: '',
  availability: '',
  skills: '',
  reason: '',
  consent: false,
});

// Determine campaign type
const isVolunteerEvent = computed(() => {
  return campaign.value?.type === 'volunteer_event';
});

// Check if organizer needs volunteers
const needsVolunteers = computed(() => {
  const event = campaign.value;

  if (!event || (event.type !== 'volunteer_event' && !event.needsVolunteers)) {
    return false;
  }

  if (typeof event.needsVolunteers === 'boolean') {
    return event.needsVolunteers;
  }

  // Compatibility with older events
  return Number(event.volunteerSlots || 0) > 0;
});

// Check if volunteer slots are full
const slotsFull = computed(() => {
  const event = campaign.value;

  if (!event || !needsVolunteers.value) {
    return false;
  }

  const totalSlots = Number(event.volunteerSlots || 0);
  const currentVolunteers = Number(event.volunteerCount || 0);

  return totalSlots <= currentVolunteers;
});

// Check if event already ended
const eventEnded = computed(() => {
  const eventDate = campaign.value?.volunteerDate;

  if (!eventDate) {
    return false;
  }

  const timestamp = Date.parse(eventDate);

  return Number.isFinite(timestamp) && timestamp < Date.now();
});

// Check if campaign belongs to current user
const isOwnCampaign = computed(() => {
  return (
    campaign.value !== null &&
    currentUser.value?.uid === campaign.value.organizerId
  );
});

// Volunteer application restrictions
const volunteerDisabled = computed(() => {
  return (
    !needsVolunteers.value ||
    volunteerBusy.value ||
    isOwnCampaign.value ||
    currentUser.value?.role === 'admin' ||
    slotsFull.value ||
    eventEnded.value
  );
});

// Volunteer application messages
const volunteerHint = computed(() => {
  if (!needsVolunteers.value && !isVolunteerEvent.value) {
    return '';
  }

  if (!needsVolunteers.value) {
    return 'The organizer is not recruiting volunteers for this event.';
  }

  if (isOwnCampaign.value) {
    return 'You cannot volunteer for your own event.';
  }

  if (currentUser.value?.role === 'admin') {
    return 'Administrator accounts cannot apply to volunteer.';
  }

  if (eventEnded.value) {
    return 'This event has already taken place.';
  }

  if (slotsFull.value) {
    return 'All available volunteer slots have been filled.';
  }

  if (!currentUser.value) {
    return 'You will be asked to log in before applying.';
  }

  return '';
});

// Close volunteer modal
function closeVolunteerModal() {
  if (!volunteerBusy.value) {
    volunteerOpen.value = false;
  }
}

// Open volunteer modal
function startVolunteering() {
  if (volunteerDisabled.value) {
    return;
  }

  if (!currentUser.value) {
    router.push({
      path: '/login',
      query: { redirect: route.fullPath },
    });

    return;
  }

  volunteerForm.value = {
    fullName: currentUser.value.displayName || '',
    phone: currentUser.value.phone || '',
    address: '',
    availability: '',
    skills: '',
    reason: '',
    consent: false,
  };

  volunteerError.value = '';
  volunteerOpen.value = true;
}

// Submit volunteer application
async function submitVolunteer() {
  if (
    volunteerBusy.value ||
    volunteerDisabled.value ||
    !currentUser.value
  ) {
    return;
  }

  const form = volunteerForm.value;

  if (!/^[\p{L}\p{M} .'-]{2,100}$/u.test(form.fullName.trim())) {
    volunteerError.value = 'Enter your full name using letters only.';
    return;
  }

  if (!/^09\d{9}$/.test(form.phone)) {
    volunteerError.value =
      'Contact number must have 11 digits starting with 09.';
    return;
  }

  if (form.address.trim().length < 5 || form.address.trim().length > 200) {
    volunteerError.value = 'Enter a full address between 5 and 200 characters.';
    return;
  }
  if (form.availability.trim().length < 5 || form.availability.trim().length > 500) {
    volunteerError.value = 'Describe your availability in 5–500 characters.';
    return;
  }
  if (form.skills.trim().length < 5 || form.skills.trim().length > 1000) {
    volunteerError.value = 'Describe your skills in 5–1000 characters.';
    return;
  }
  if (form.reason.trim().length < 10 || form.reason.trim().length > 1000) {
    volunteerError.value = 'Explain why you want to volunteer (10–1000 characters).';
    return;
  }
  if (!form.consent) {
    volunteerError.value = 'Confirm your consent before sending your application.';
    return;
  }

  volunteerBusy.value = true;
  volunteerError.value = '';

  try {
    await api(`/campaigns/${campaignId}/volunteer`, {
      method: 'POST',
      body: json({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        availability: form.availability.trim(),
        skills: form.skills.trim(),
        reason: form.reason.trim(),
        consent: form.consent,
      }),
    });

    volunteerOpen.value = false;

    window.alert(
      'Your volunteer application was submitted successfully.'
    );

  } catch (error) {
    volunteerError.value =
      error instanceof Error
        ? error.message
        : 'Application failed.';
  } finally {
    volunteerBusy.value = false;
  }
}

// Remaining fundraising days
const remainingDays = computed(() => {
  return campaign.value
    ? daysLeft(campaign.value.deadline)
    : 0;
});

// Donation restrictions
const donateDisabled = computed(() => {
  return (
    currentUser.value?.role === 'admin' ||
    isOwnCampaign.value ||
    remainingDays.value === 0
  );
});

const donateHint = computed(() => {
  const user = currentUser.value;

  if (remainingDays.value === 0) {
    return 'This campaign has reached its deadline.';
  }

  if (!user) {
    return 'You will be asked to log in first.';
  }

  if (user.role === 'admin') {
    return 'Administrator accounts cannot donate.';
  }

  if (isOwnCampaign.value) {
    return 'You cannot donate to your own campaign.';
  }

  return '';
});

// Load campaign details
onIonViewWillEnter(async () => {
  volunteerOpen.value = false;
  volunteerError.value = '';

  if (!campaign.value) {
    loading.value = true;
  }

  try {
    campaign.value = await getCampaignById(campaignId);

    donors.value =
      campaign.value && !isVolunteerEvent.value
        ? await getPublicDonors(campaignId)
        : [];

  } catch (error) {
    console.error('Failed to load campaign:', error);
    campaign.value = null;
    donors.value = [];
  } finally {
    loading.value = false;
  }

  if (campaign.value) {
    try {
      updates.value = (
        await getCampaignUpdates(campaignId)
      ).slice(0, 5);

    } catch (error) {
      console.error('Failed to load updates:', error);
      updates.value = [];
    }
  } else {
    updates.value = [];
  }
});
</script>

<style scoped>
/* COLORS */
.relief-details-page {
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

/* PAGE */
.details-content {
  --background: #fbf0dc;
  --color: #173729;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}

.details-content::part(background),
.details-content::part(scroll) {
  background: var(--cream);
}

.details-shell {
  width: 100%;
  min-height: 100%;
  background: var(--cream);
  color: var(--forest);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.details-shell * {
  box-sizing: border-box;
}

.details-shell a {
  text-decoration: none;
  color: inherit;
}

.details-shell h1,
.details-shell h2,
.details-shell h3,
.brand {
  font-family: Georgia, 'Times New Roman', serif;
}

/* NAVBAR */
.details-navbar {
  min-height: 76px;
  padding: 0 clamp(22px, 3vw, 52px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
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

.brand span,
.brand b {
  color: var(--terracotta);
}

.brand b {
  font-size: 12px;
  vertical-align: top;
  margin-left: 2px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 12px 17px;
  border-radius: 999px;
  border: 1px solid rgba(24, 60, 44, .35);
  font-size: 11px;
  letter-spacing: .8px;
  font-weight: 800;
  transition: background .18s, color .18s;
}

.back-link ion-icon {
  font-size: 17px;
}

.back-link:hover,
.back-link:focus-visible {
  background: var(--forest);
  color: #fff8e8;
}

.details-main {
  padding-bottom: 50px;
}

/* HERO */
.detail-hero {
  width: calc(100% - 2 * var(--page-gutter));
  margin: 18px var(--page-gutter) 0;
  min-height: 332px;
  padding: clamp(24px, 3.7vw, 56px);
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr);
  align-items: center;
  gap: clamp(21px, 3vw, 48px);
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: linear-gradient(125deg, var(--forest), var(--deep));
  color: #fff8e8;
  border-radius: 18px;
}

.detail-hero::before {
  content: 'BAYANIHAN';
  position: absolute;
  top: -40px;
  left: -20px;
  z-index: -1;
  pointer-events: none;
  font: 700 clamp(80px, 12vw, 175px) Georgia, serif;
  letter-spacing: -9px;
  color: rgba(248, 243, 228, .045);
  white-space: nowrap;
}

.hero-copy {
  min-width: 0;
}

.eyebrow,
.section-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.9px;
  line-height: 1.5;
}

.eyebrow {
  margin: 0 0 22px;
  color: var(--gold);
}

.eyebrow-dot {
  padding-inline: 7px;
  color: #fff8e8;
}

.category-badge {
  display: inline-flex;
  padding: 8px 13px;
  border: 1px solid rgba(255, 248, 232, .35);
  border-radius: 999px;
  background: rgba(255, 248, 232, .12);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .7px;
  color: #fff8e8;
}

.hero-copy h1 {
  margin: 16px 0 13px;
  font-size: clamp(36px, 3.75vw, 62px);
  line-height: 1.08;
  font-weight: 400;
  letter-spacing: -1.4px;
  overflow-wrap: anywhere;
}

.hero-description {
  margin: 0 0 24px;
  color: #d6dfd0;
  font-size: clamp(13px, 1vw, 15px);
  line-height: 1.65;
}

.organizer-line {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #e3e9de;
  font-size: 13px;
  line-height: 1.5;
  min-width: 0;
}

.organizer-line ion-icon {
  font-size: 18px;
  color: var(--gold);
  flex-shrink: 0;
}

.organizer-line strong {
  font-weight: 800;
  color: #fff8e8;
  overflow-wrap: anywhere;
}

/* HERO IMAGE */
.hero-visual {
  width: 100%;
  min-width: 0;
  height: 295px;
  overflow: hidden;
  border-radius: 15px;
  background: #234c3a;
  border: 1px solid rgba(255, 255, 255, .2);
}

.hero-visual > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-image-placeholder {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 21px;
  overflow: hidden;
  background:
    radial-gradient(circle at 70% 25%, rgba(232,174,76,.17), transparent 47%),
    linear-gradient(145deg, #275b43, #112b20);
}

.hero-image-placeholder::before {
  content: '';
  position: absolute;
  inset: 15px;
  border: 1px solid rgba(255, 248, 232, .17);
  border-radius: 8px;
  pointer-events: none;
}

.hero-image-placeholder ion-icon {
  font-size: clamp(60px, 6vw, 100px);
  color: var(--gold);
  opacity: .95;
  z-index: 1;
}

.hero-image-placeholder > span:last-child {
  color: #fff8e8;
  font-size: 10px;
  letter-spacing: 3px;
  font-weight: 800;
  z-index: 1;
}

.placeholder-rays {
  position: absolute;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(232,174,76,.14), transparent 70%);
}

/* MAIN LAYOUT */
.detail-layout {
  width: calc(100% - 2 * var(--page-gutter));
  max-width: 1500px;
  margin: 0 auto;
  padding: clamp(32px, 4vw, 60px) clamp(0px, 1.2vw, 18px) 0;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(305px, .75fr);
  gap: clamp(26px, 4vw, 64px);
  align-items: start;
}

.detail-story,
.donation-aside {
  min-width: 0;
}

.story-intro {
  margin: 0 0 27px;
}

.section-eyebrow {
  color: var(--terracotta);
  margin: 0 0 9px;
}

.story-intro h2 {
  margin: 0 0 12px;
  font-size: clamp(32px, 3.3vw, 49px);
  line-height: 1.12;
  letter-spacing: -1.2px;
  font-weight: 400;
}

.story-intro h2 em,
.summary-card h2 em {
  color: var(--terracotta);
  font-weight: 400;
}

.story-lead {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
  margin: 0;
  max-width: 600px;
}

/* INFO PANELS */
.info-panel {
  background: #fff9ed;
  border: 1px solid #e8dfcb;
  border-radius: 17px;
  padding: clamp(20px, 2.1vw, 31px);
  margin: 0 0 21px;
  box-shadow: 0 9px 24px rgba(24, 60, 44, .035);
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  gap: 17px;
  margin-bottom: 17px;
}

.heading-accent {
  font: 400 26px Georgia, serif;
  color: var(--terracotta);
  opacity: .72;
  min-width: 33px;
}

.panel-heading h3 {
  margin: 0;
  font-size: clamp(24px, 2vw, 30px);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -.5px;
}

.panel-heading .section-eyebrow {
  font-size: 9px;
  letter-spacing: 1.5px;
  margin-bottom: 5px;
}

.body-copy {
  font-size: 14px;
  color: #485a4e;
  line-height: 1.85;
  margin: 0;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.beneficiary-name {
  margin: 0 0 8px;
  font: 400 22px Georgia, serif;
  color: var(--forest);
  overflow-wrap: anywhere;
}

.location-address {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin: 0 0 17px;
  color: #485a4e;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.location-address ion-icon {
  color: var(--terracotta);
  font-size: 20px;
  flex: none;
}

.map-frame {
  overflow: hidden;
  border-radius: 13px;
  border: 1px solid #e0d5c1;
  min-width: 0;
}

/* UPDATES & DONORS */
.updates-content {
  font-size: 13px;
  color: #485a4e;
}

.empty-donors {
  padding: 16px;
  border-radius: 11px;
  background: #f0f1e5;
  color: #526657;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.donor-list {
  background: transparent;
  padding: 0;
}

.donor-item {
  --background: #fff9ed;
  --border-color: #e8dfcb;
  --padding-start: 0;
  --padding-end: 0;
}

.donor-item ion-label h4 {
  color: var(--forest);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 800;
}

.donor-item ion-label p {
  font-size: 11px;
  color: var(--muted);
}

.donor-amount {
  color: var(--forest);
  font-size: 13px;
  font-weight: 800;
}

/* RIGHT SUMMARY CARD */
.donation-aside {
  position: sticky;
  top: 16px;
}

.summary-card {
  background: #fff9ed;
  border: 1px solid #e2d5bf;
  border-radius: 18px;
  padding: clamp(20px, 2.1vw, 35px);
  box-shadow: 0 16px 38px rgba(24,60,44,.09);
}

.summary-card > .section-eyebrow {
  margin-bottom: 13px;
}

.summary-card > .section-eyebrow span {
  color: var(--terracotta);
}

.summary-card h2 {
  margin: 0 0 25px;
  font-size: clamp(28px, 2.2vw, 39px);
  line-height: 1.15;
  font-weight: 400;
  letter-spacing: -.7px;
}

/* PROGRESS */
.progress-section {
  padding: 0 0 17px;
  border-bottom: 1px solid #e8dfcb;
}

.progress-section :deep(ion-progress-bar) {
  --background: #e5eadb;
  --progress-background: #3d8852;
  height: 11px;
  border-radius: 999px;
  overflow: hidden;
}

.progress-section :deep(strong),
.progress-section :deep(.amount) {
  color: var(--forest);
}

/* FUNDRAISING STATS */
.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 21px 0 22px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 86px;
  gap: 7px;
  padding: 11px 4px;
  background: #edf0e6;
  border-radius: 12px;
  min-width: 0;
}

.stat strong {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(14px, 1.2vw, 20px);
  font-weight: 700;
  color: var(--forest);
  line-height: 1.13;
  overflow-wrap: anywhere;
}

.stat span {
  font-size: 10px;
  line-height: 1.4;
  color: #5e6e5f;
}

/* VOLUNTEER EVENT */
.volunteer-details {
  padding: 4px 0 18px;
  color: #315743;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 14px 0;
  border-bottom: 1px solid #e8dfcb;
}

.event-info-label {
  color: #8a7557;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.event-info strong {
  color: #173729;
  font-size: 14px;
  font-weight: 800;
}

.event-info p {
  margin: 0;
  color: #526657;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-line;
}

.volunteer-status {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 15px;
  margin: 17px 0;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.6;
}

.volunteer-status ion-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.volunteer-status-yes {
  background: #e3f0df;
  color: #22613b;
  border: 1px solid #c7dfc4;
}

.volunteer-status-no {
  background: #f4ebd6;
  color: #6d6040;
  border: 1px solid #ead9b2;
}

.volunteer-status-no strong {
  font-size: 13px;
}

.volunteer-status-no p {
  margin: 5px 0 0;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.6;
}

.volunteer-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 16px;
}

.volunteer-stat {
  background: #edf0e6;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}

.volunteer-stat strong {
  font: 700 27px Georgia, serif;
  color: #173729;
}

.volunteer-stat span {
  color: #647366;
  font-size: 11px;
}

/* BUTTONS */
.donate-button {
  width: 100%;
  margin: 0;
  min-height: 51px;
  --background: var(--gold);
  --background-hover: #f0bc62;
  --background-activated: #d99e34;
  --color: var(--deep);
  --border-radius: 999px;
  --box-shadow: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.donate-button ion-icon {
  font-size: 20px;
}

.donate-hint {
  margin: 10px 0 0;
  font-size: 11px;
  line-height: 1.5;
  text-align: center;
  color: var(--muted);
}

.summary-divider {
  height: 1px;
  background: #e8dfcb;
  margin: 22px 0 17px;
}

.transparency-note {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #526657;
  font-size: 11px;
  line-height: 1.5;
}

.transparency-note ion-icon {
  flex: none;
  color: #3d8852;
  font-size: 24px;
}

.transparency-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 13px;
  margin-top: 15px;
  padding: 21px 23px;
  background: var(--forest);
  color: #fff8e8 !important;
  border-radius: 16px;
  transition: background .2s;
}

.transparency-link:hover {
  background: var(--deep);
}

.transparency-link > span {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transparency-link small {
  color: var(--gold);
  font-size: 9px;
  letter-spacing: 1.3px;
  font-weight: 800;
}

.transparency-link strong {
  font: 400 20px Georgia, serif;
}

.transparency-link > ion-icon {
  font-size: 24px;
  color: var(--gold);
  flex: none;
}

/* VOLUNTEER MODAL */
.rg-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #102e21b8;
  display: grid;
  place-items: center;
  padding: 16px;
  overflow: auto;
}

.rg-volunteer-modal {
  width: min(530px, 100%);
  max-height: calc(100vh - 40px);
  overflow: auto;
  background: #fff9e9;
  border: 1px solid #e6d9c2;
  border-radius: 17px;
  padding: 25px;
  box-shadow: 0 20px 60px #0004;
}

.rg-volunteer-modal h2 {
  font: 31px Georgia, serif;
  color: #153d2b;
  margin: 0 0 7px;
}

.rg-volunteer-modal h2 em {
  color: #c16a47;
}

.rg-volunteer-modal p {
  font-size: 13px;
  color: #476450;
}

.modal-event-category {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 14px;
  margin: 18px 0;
  background: #edf0e6;
  border-radius: 11px;
}

.modal-event-category span {
  color: #7c785f;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.modal-event-category strong {
  color: #173729;
  font-size: 14px;
}

.rg-volunteer-modal label {
  display: block;
  margin-top: 10px;
  font: 800 10px system-ui;
  color: #234d39;
  letter-spacing: .5px;
}

.rg-volunteer-modal input:not([type=checkbox]),
.rg-volunteer-modal textarea {
  width: 100%;
  border: 1px solid #dcd2c0;
  border-radius: 9px;
  min-height: 38px;
  background: #fffefa;
  margin-top: 6px;
  padding: 9px;
  font: 13px system-ui;
  color: #173f2c;
}

.rg-volunteer-modal .consent {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  letter-spacing: 0;
  line-height: 1.6;
}

.rg-volunteer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 16px;
}

.rg-volunteer-actions button {
  border: 0;
  border-radius: 9px;
  background: #183f2e;
  color: #fffaf0;
  padding: 11px 16px;
  font-weight: 700;
  cursor: pointer;
}

.rg-volunteer-actions button:first-child {
  background: #efe6d4;
  color: #153c2a;
}

.rg-volunteer-actions button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.rg-volunteer-error {
  color: #b5362c !important;
}

/* LOADING AND EMPTY STATES */
.state-box {
  width: calc(100% - 2 * var(--page-gutter));
  max-width: 950px;
  min-height: 360px;
  margin: 22px auto 0;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 13px;
  border: 1px dashed #d6cbb4;
  background: #fff9ed;
  border-radius: 18px;
  text-align: center;
}

.state-box h2 {
  font-size: clamp(27px, 3vw, 40px);
  font-weight: 400;
  margin: 0;
}

.state-box p {
  font-size: 13px;
  color: var(--muted);
  margin: 0;
  line-height: 1.7;
}

.state-spinner {
  color: #3d8852;
  width: 41px;
  height: 41px;
}

.state-icon {
  color: var(--terracotta);
  font-size: 51px;
}

.state-action {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 13px;
  padding: 14px 24px;
  color: var(--deep) !important;
  background: var(--gold);
  border-radius: 999px;
  font-weight: 800;
  letter-spacing: .8px;
  font-size: 11px;
}

/* FOOTER */
.details-footer {
  min-height: 80px;
  padding: 22px var(--page-gutter) 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  border-top: 1px solid #e5dac5;
  color: var(--muted);
  font-size: 11px;
}

/* TABLET */
@media (max-width: 1000px) {
  .detail-hero {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 19px;
  }

  .hero-copy h1 {
    font-size: clamp(32px, 4.2vw, 49px);
  }

  .hero-visual {
    height: 275px;
  }

  .detail-layout {
    grid-template-columns: minmax(0, 1fr) minmax(275px, .8fr);
    gap: 23px;
  }

  .stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* MOBILE */
@media (max-width: 760px) {
  .relief-details-page {
    --page-gutter: clamp(12px, 3vw, 23px);
  }

  .details-navbar {
    min-height: 69px;
    padding-inline: 17px;
  }

  .brand {
    font-size: 28px;
  }

  .back-link {
    padding: 10px 12px;
    gap: 6px;
    font-size: 9px;
  }

  .back-link ion-icon {
    font-size: 15px;
  }

  .detail-hero {
    margin-top: 12px;
    grid-template-columns: 1fr;
    gap: 21px;
    padding: 25px 22px 22px;
  }

  .detail-hero::before {
    font-size: 100px;
    top: -15px;
  }

  .eyebrow {
    margin-bottom: 13px;
    font-size: 9px;
  }

  .hero-copy h1 {
    font-size: clamp(31px, 7.8vw, 45px);
    margin-top: 12px;
  }

  .hero-description {
    margin-bottom: 13px;
  }

  .hero-visual {
    height: clamp(205px, 50vw, 330px);
  }

  .detail-layout {
    grid-template-columns: 1fr;
    padding-top: 30px;
    gap: 22px;
  }

  .donation-aside {
    position: static;
    grid-row: 1;
  }

  .story-intro {
    margin-bottom: 20px;
  }

  .story-intro h2 {
    font-size: clamp(30px, 7vw, 40px);
  }

  .info-panel {
    margin-bottom: 15px;
  }

  .details-main {
    padding-bottom: 24px;
  }

  .details-footer {
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
    padding: 21px;
    min-height: 75px;
  }
}

/* SMALL PHONES */
@media (max-width: 410px) {
  .details-navbar {
    padding-inline: 12px;
  }

  .brand {
    font-size: 26px;
  }

  .back-link {
    font-size: 8px;
    padding: 9px 10px;
  }

  .detail-hero {
    padding: 22px 16px;
  }

  .hero-copy h1 {
    font-size: 31px;
  }

  .hero-visual {
    height: 205px;
  }

  .summary-card {
    padding: 19px 14px;
  }

  .stat {
    padding-inline: 3px;
  }

  .stat strong {
    font-size: 14px;
  }

  .stat span {
    font-size: 9px;
  }

  .panel-heading {
    gap: 11px;
  }

  .heading-accent {
    min-width: 28px;
    font-size: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-link,
  .transparency-link {
    transition: none;
  }
}


/* ===================================================================
   RELIEFGO MEMBER WORKSPACE — MATCHES DASHBOARD SIDEBAR + CONTENT GUTTERS
   Desktop: 273px sidebar, centered 1128px content. No overlap.
   Mobile: Ionic overlay drawer and responsive details cards.
   =================================================================== */
.relief-details-page { --rg-sidebar-width: 273px; }
.rg-detail-sidebar {
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
.rg-detail-main { left: 0; width: 100%; min-width: 0; }
.rg-detail-main.has-sidebar { left: var(--rg-sidebar-width); width: calc(100% - var(--rg-sidebar-width)); }
.rg-detail-header { box-shadow: none; }
.rg-detail-header::after { display: none; }
.rg-detail-toolbar {
  --background: #fbf0dc; --color: #173729;
  --padding-start: 0; --padding-end: 0; --min-height: 74px;
  border-bottom: 1px solid #e5d9c2;
}
.rg-details-topbar {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; min-height: 74px; gap: 15px; padding: 9px 28px;
  font-family: 'DM Sans','Segoe UI',Arial,sans-serif;
}
.rg-details-topbar-left { display: flex; align-items: center; gap: 15px; min-width: 0; }
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
.rg-detail-menu-toggle {
  display: none; align-items: center; justify-content: center;
  border: 0; background: transparent; color: #173729;
  padding: 8px; border-radius: 8px; cursor: pointer;
}
.rg-detail-menu-toggle ion-icon { font-size: 24px; }
.rg-detail-mobile-menu { display: none; --width: min(320px, 87vw); }
.rg-detail-mobile-menu::part(container) { background: #15392c; box-shadow: 8px 0 35px rgba(0,0,0,.2); }
.rg-drawer-content { --background: #15392c; --color: #fffaf0; }
.rg-drawer-shell { display: flex; flex-direction: column; min-height: 100%; }
.rg-drawer-shell .rg-sidebar-brand { min-height: 105px; padding: 22px 23px 19px; font-size: 30px; }
.rg-drawer-shell .rg-sidebar-profile { margin: 17px 14px 22px; }

/* Identical left/right gutters, measured inside the sidebar-reduced workspace. */
.rg-detail-main .details-shell { width: 100%; min-height: 100%; }
.rg-detail-main .details-container {
  width: min(1128px, calc(100% - 56px)); max-width: 1128px;
  margin: 0 auto; min-width: 0;
}
.rg-detail-main .details-actions {
  display: flex; justify-content: flex-end; align-items: center;
  min-height: 41px; margin: 24px 0 15px;
}
.rg-detail-main .back-link, .rg-detail-main .back-link:link, .rg-detail-main .back-link:visited {
  display: inline-flex; gap: 9px; align-items: center;
  min-height: 41px; padding: 11px 17px;
  background: #173729; color: #fffaf0 !important; border: 1px solid #173729;
  border-radius: 10px; text-decoration: none; font-size: 11px; font-weight: 800;
  letter-spacing: .5px; transition: background .18s, transform .18s;
}
.rg-detail-main .back-link ion-icon { font-size: 18px; color: #f4b75c; }
.rg-detail-main .back-link:hover { background: #295742; transform: translateY(-1px); }
.rg-detail-main .back-link:focus-visible { outline: 3px solid #f4b75c; outline-offset: 2px; }
/* Compact campaign hero: readable for long campaign titles, without an oversized banner. */
.rg-detail-main .detail-hero {
  width: 100%;
  max-width: 100%;
  margin: 0;
  min-height: 280px;
  padding: clamp(22px, 2.5vw, 32px);
  grid-template-columns: minmax(0, 1.08fr) minmax(0, .92fr);
  gap: clamp(18px, 2.3vw, 28px);
  align-items: center;
}
.rg-detail-main .hero-copy h1 {
  font-size: clamp(28px, 2.55vw, 39px);
  line-height: 1.13;
  letter-spacing: -.6px;
  margin: 12px 0 12px;
  overflow-wrap: break-word;
}
.rg-detail-main .eyebrow { margin-bottom: 13px; font-size: 9px; letter-spacing: 1.7px; }
.rg-detail-main .category-badge { padding: 7px 12px; font-size: 10px; }
.rg-detail-main .hero-description { font-size: 13px; margin-bottom: 14px; line-height: 1.55; }
.rg-detail-main .organizer-line { font-size: 12px; }
.rg-detail-main .hero-visual { height: 220px; border-radius: 12px; }
.rg-detail-main .detail-hero::before { font-size: clamp(64px, 10vw, 120px); top: -24px; }
.rg-detail-main .detail-layout {
  width: 100%; max-width: 100%; margin: 0;
  padding: 34px 0 0;
  grid-template-columns: minmax(0,1.22fr) minmax(340px,.78fr);
  gap: clamp(23px,2.6vw,43px);
}
.rg-detail-main .details-footer { padding: 23px 0 30px; margin-top: 6px; }
.rg-detail-main .state-box { width: 100%; max-width: 100%; }
.rg-detail-main .detail-hero, .rg-detail-main .detail-layout,
.rg-detail-main .detail-story, .rg-detail-main .donation-aside { min-width: 0; }

@media (max-width: 1200px) and (min-width: 901px) {
  .rg-detail-main .details-container { width: calc(100% - 48px); }
  .rg-detail-main .detail-layout { grid-template-columns: minmax(0,1fr) minmax(300px,.8fr); gap: 22px; }
  .rg-detail-main .stats { grid-template-columns: repeat(3,minmax(0,1fr)); }
  .rg-detail-main .stat { padding: 11px 3px; }
}
@media (max-width: 900px) {
  .rg-detail-sidebar { display: none; }
  .rg-detail-main.has-sidebar { left: 0; width: 100%; }
  .rg-detail-mobile-menu { display: block; }
  .rg-detail-menu-toggle { display: inline-flex; }
  .rg-detail-main .details-container { width: calc(100% - 40px); }
  .rg-detail-main .detail-layout { grid-template-columns: minmax(0,1.1fr) minmax(270px,.9fr); gap: 21px; }
  .rg-topbar-account-copy { display: none; }
}
@media (max-width: 760px) {
  .rg-detail-main .detail-hero {
    grid-template-columns: 1fr;
    gap: 16px;
    min-height: 0;
    padding: 23px 22px;
  }
  .rg-detail-main .hero-copy h1 { font-size: clamp(27px, 6.2vw, 34px); line-height: 1.16; }
  .rg-detail-main .hero-visual { height: clamp(170px, 43vw, 230px); }
  .rg-detail-main .detail-layout { grid-template-columns: 1fr; gap: 22px; padding-top: 28px; }
  .rg-detail-main .donation-aside { position: static; grid-row: 1; }
  .rg-detail-main .details-actions { margin-top: 17px; margin-bottom: 13px; }
  .rg-detail-main .details-container { width: calc(100% - 34px); }
  .rg-detail-main .details-footer { padding-bottom: 23px; }
}
@media (max-width: 520px) {
  .rg-details-topbar { padding: 8px 15px; gap: 9px; min-height: 67px; }
  .rg-details-topbar-left { gap: 9px; }
  .rg-topbar-brand { font-size: 25px !important; }
  .rg-topbar-divider, .rg-topbar-page-title, .rg-topbar-account { display: none; }
  .rg-detail-main .details-container { width: calc(100% - 28px); }
  .rg-detail-main .detail-hero { padding: 20px 17px; }
  .rg-detail-main .hero-copy h1 { font-size: clamp(26px, 7vw, 31px); }
  .rg-detail-main .hero-visual { height: 175px; }
  .rg-detail-main .back-link { font-size: 10px; padding: 10px 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .rg-detail-main .back-link { transition: none; }
}

</style>