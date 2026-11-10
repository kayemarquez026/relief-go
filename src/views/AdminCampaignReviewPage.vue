<template>
  <ion-page class="admin-campaign-review-page">
    <!-- Same ReliefGO admin navigation as the dashboard and notifications pages. -->
    <ion-menu v-if="$route.name === 'AdminCampaignReview'"
      content-id="campaign-admin-main"
      menu-id="campaign-admin-menu"
      type="overlay"
      side="start"
      class="campaign-admin-menu"
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
            <div><span>ADMINISTRATOR ACCOUNT</span><strong>{{ adminName }}</strong></div>
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
            <button class="rg-sidebar-logout" type="button" @click="handleLogout">
              <ion-icon :icon="logOutOutline" aria-hidden="true" /> Log Out
            </button>
          </div>
        </div>
      </ion-content>
    </ion-menu>

    <!-- Persistent desktop sidebar, exactly the admin section's 266px layout. -->
    <aside class="admin-desktop-sidebar" aria-label="Administration sidebar">
      <div class="desktop-brand">Relief<span>GO</span><sup>♥</sup><small>ADMINISTRATION</small></div>
      <div class="desktop-profile">
        <span class="menu-avatar">{{ initials }}</span>
        <div><small>ADMINISTRATOR</small><strong>{{ adminName }}</strong></div>
      </div>
      <p class="desktop-nav-title">MANAGEMENT TOOLS</p>
      <nav class="desktop-links" aria-label="Administration links">
        <router-link to="/admin" exact-active-class="desktop-active"><ion-icon :icon="barChartOutline" /> Dashboard</router-link>
        <router-link to="/notifications" active-class="desktop-active"><ion-icon :icon="notificationsOutline" /> Notifications</router-link>
        <router-link to="/admin/campaigns" active-class="desktop-active" aria-current="page"><ion-icon :icon="megaphoneOutline" /> Campaign &amp; Events</router-link>
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

    <div id="campaign-admin-main" class="ion-page campaign-admin-main">
      <ion-header class="rg-header">
        <ion-toolbar class="rg-toolbar">
          <div class="nav-inner">
            <div class="nav-left">
              <ion-button fill="clear" class="menu-trigger" aria-label="Open administration menu" @click="toggleAdminMenu">
                <ion-icon slot="icon-only" :icon="menuOutline" />
              </ion-button>
              <router-link to="/admin" class="brand">Relief<span>GO</span><sup>♥</sup></router-link>
              <span class="brand-divider" aria-hidden="true"></span>
              <span class="page-label">CAMPAIGN &amp; EVENTS</span>
            </div>
            <div class="topbar-user" aria-label="Administrator profile">
              <span class="topbar-avatar">{{ initials }}</span>
              <span class="topbar-identity"><strong>{{ adminName }}</strong><small>ADMINISTRATOR</small></span>
            </div>
          </div>
        </ion-toolbar>
      </ion-header>

      <ion-content class="rg-content">
      <main class="page-wrapper">

        <!-- HEADER -->
        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">RELIEFGO · ADMINISTRATION</p>

            <h1>
              Campaign <em>Management.</em>
            </h1>

            <p>
              Review fundraising campaigns and community events,
              verify organizer documents, and approve bayanihan
              initiatives before they become public.
            </p>
          </div>

          <div class="identity">
            <div class="avatar">{{ initials }}</div>

            <div>
              <span class="identity-label">
                ADMINISTRATOR ACCOUNT
              </span>

              <strong>{{ adminName }}</strong>
              <small>Campaign and event oversight</small>
            </div>
          </div>
        </section>

        <!-- STATISTICS -->
        <section class="stat-grid" aria-label="Campaign statistics">

          <div class="stat">
            <ion-icon :icon="timeOutline" />
            <span>PENDING APPROVAL</span>
            <strong>{{ pending.length }}</strong>
            <small>Awaiting administrator review</small>
          </div>

          <div class="stat">
            <ion-icon :icon="megaphoneOutline" />
            <span>LIVE CAMPAIGNS</span>
            <strong>{{ live.length }}</strong>
            <small>Currently public</small>
          </div>

          <div class="stat">
            <ion-icon :icon="banOutline" />
            <span>SUSPENDED</span>
            <strong>{{ suspended.length }}</strong>
            <small>Removed from public view</small>
          </div>

        </section>

        <!-- CAMPAIGN MANAGEMENT -->
        <section class="list-section">

          <div class="section-heading">
            <div>
              <p class="eyebrow dark">
                KEEPING BAYANIHAN ACCOUNTABLE
              </p>

              <h2>
                Manage <em>campaigns.</em>
              </h2>

              <p>
                Review submitted campaigns and events,
                verify the requirements, and manage approvals.
              </p>
            </div>
          </div>

          <!-- STATUS TABS -->
          <ion-segment v-model="segment" class="status-tabs">

            <ion-segment-button value="pending">
              <ion-label>
                Pending ({{ pending.length }})
              </ion-label>
            </ion-segment-button>

            <ion-segment-button value="live">
              <ion-label>
                Live ({{ live.length }})
              </ion-label>
            </ion-segment-button>

            <ion-segment-button value="suspended">
              <ion-label>
                Suspended ({{ suspended.length }})
              </ion-label>
            </ion-segment-button>

            <ion-segment-button value="other">
              <ion-label>
                Other ({{ other.length }})
              </ion-label>
            </ion-segment-button>

          </ion-segment>

          <!-- PENDING APPROVAL NOTICE -->
          <div v-if="segment === 'pending'" class="notice">
            <strong>Administrator Verification Required</strong>

            <p>
              All new fundraising campaigns and community events
              must be reviewed before becoming publicly available.
              Verify the organizer's identification, barangay
              clearance, situation photo, and supporting documents
              before approving the submission.
            </p>

            <p>
              For events requiring volunteers, also review the
              volunteer help category, duties, qualifications,
              and number of available slots.
            </p>
          </div>

          <!-- LOADING -->
          <div v-if="loading" class="state-box">
            <ion-spinner name="crescent" />
            <p>Loading campaigns...</p>
          </div>

          <!-- ERROR -->
          <div v-else-if="errorMessage" class="state-box">
            <ion-icon
              :icon="alertCircleOutline"
              class="state-icon"
            />

            <h3>Something went wrong</h3>
            <p>{{ errorMessage }}</p>
          </div>

          <!-- EMPTY -->
          <div
            v-else-if="visibleCampaigns.length === 0"
            class="state-box"
          >
            <div class="empty-icon">
              <ion-icon :icon="checkmarkDoneOutline" />
            </div>

            <p class="eyebrow dark">ALL CAUGHT UP</p>

            <h3>Nothing here.</h3>

            <p>
              There are no campaigns or events in this list.
            </p>
          </div>

          <!-- CAMPAIGN CARDS -->
          <div v-else class="campaign-grid">

            <article
              v-for="campaign in visibleCampaigns"
              :key="campaign.id"
              class="campaign-card"
            >

              <!-- CAMPAIGN HEADER -->
              <div class="card-top">

                <div>
                  <span class="mini-label">
                    {{
                      isVolunteerEvent(campaign)
                        ? 'COMMUNITY EVENT'
                        : 'FUNDRAISING CAMPAIGN'
                    }}
                  </span>

                  <h3>{{ campaign.title }}</h3>

                  <p>
                    by {{ campaign.organizerName }}
                    · {{ campaign.category }}
                  </p>
                </div>

                <ion-chip
                  :color="campaignStatusColor(campaign.status)"
                >
                  {{ campaign.status }}
                </ion-chip>

              </div>

              <!-- EVENT CATEGORY -->
              <div
                v-if="isVolunteerEvent(campaign)"
                class="event-review"
              >

                <div class="event-review-heading">
                  <ion-icon :icon="calendarOutline" />

                  <div>
                    <strong>Community Event Details</strong>
                    <span>Organizer's submitted event information</span>
                  </div>
                </div>

                <!-- CATEGORY -->
                <div class="event-review-row">
                  <span>EVENT CATEGORY</span>
                  <strong>{{ campaign.category }}</strong>
                </div>

                <!-- EVENT DATE -->
                <div
                  v-if="campaign.volunteerDate"
                  class="event-review-row"
                >
                  <span>EVENT DATE</span>

                  <strong>
                    {{ formatDate(campaign.volunteerDate) }}
                  </strong>
                </div>

                <!-- NEED VOLUNTEERS YES -->
                <template v-if="eventNeedsVolunteers(campaign)">

                  <div class="volunteer-status needs-help">
                    <ion-icon :icon="peopleOutline" />
                    <strong>VOLUNTEERS REQUIRED</strong>
                  </div>

                  <div class="event-review-row">
                    <span>VOLUNTEER HELP CATEGORY</span>

                    <strong>
                      {{
                        campaign.volunteerHelpCategory ||
                        'General Assistance'
                      }}
                    </strong>
                  </div>

                  <div
                    v-if="campaign.volunteerDuties"
                    class="event-review-row stacked"
                  >
                    <span>VOLUNTEER DUTIES</span>

                    <p>
                      {{ campaign.volunteerDuties }}
                    </p>
                  </div>

                  <div
                    v-if="campaign.volunteerRequirements"
                    class="event-review-row stacked"
                  >
                    <span>VOLUNTEER REQUIREMENTS</span>

                    <p>
                      {{ campaign.volunteerRequirements }}
                    </p>
                  </div>

                  <div class="event-review-row">
                    <span>VOLUNTEER SLOTS</span>

                    <strong>
                      {{ campaign.volunteerSlots || 0 }}
                    </strong>
                  </div>

                  <div class="event-review-row">
                    <span>CURRENT APPLICATIONS</span>

                    <strong>
                      {{ campaign.volunteerCount || 0 }}
                    </strong>
                  </div>

                </template>

                <!-- NEED VOLUNTEERS NO -->
                <div v-else class="volunteer-status no-help">
                  <ion-icon :icon="informationCircleOutline" />

                  <div>
                    <strong>NO VOLUNTEERS REQUIRED</strong>

                    <p>
                      The organizer does not require volunteer
                      applications for this event.
                    </p>
                  </div>
                </div>

              </div>

              <!-- FUNDRAISING ONLY -->
              <template v-else>

                <div class="amount-grid">

                  <div>
                    <span>FUNDRAISING GOAL</span>

                    <strong>
                      {{ formatPeso(campaign.goalAmount) }}
                    </strong>
                  </div>

                  <div>
                    <span>VERIFIED DONATIONS</span>

                    <strong>
                      {{ formatPeso(campaign.verifiedTotal) }}
                    </strong>
                  </div>

                </div>

                <div class="progress-track">
                  <div
                    class="progress-fill"
                    :style="{
                      width: progressPercent(campaign) + '%'
                    }"
                  ></div>
                </div>

              </template>

              <!-- COMMON INFORMATION -->
              <div class="details">

                <p v-if="!isVolunteerEvent(campaign)">
                  <ion-icon :icon="calendarOutline" />

                  <span>
                    <b>Dates:</b>
                    {{ formatDate(campaign.startDate) }}
                    to
                    {{ formatDate(campaign.deadline) }}
                  </span>
                </p>

                <p>
                  <ion-icon :icon="locationOutline" />

                  <span>
                    <b>Location:</b>
                    {{ campaign.locationAddress }}
                  </span>
                </p>

                <p>
                  <ion-icon :icon="personOutline" />

                  <span>
                    <b>Beneficiary:</b>
                    {{ campaign.beneficiaryName }}
                  </span>
                </p>

              </div>

              <!-- BENEFICIARY INFORMATION -->
              <div
                v-if="campaign.beneficiaryInfo"
                class="description"
              >
                <b>Beneficiary information</b>

                <p>{{ campaign.beneficiaryInfo }}</p>
              </div>

              <!-- DESCRIPTION -->
              <div
                v-if="campaign.description"
                class="description"
              >
                <b>
                  {{
                    isVolunteerEvent(campaign)
                      ? 'Event description'
                      : 'Campaign description'
                  }}
                </b>

                <p>{{ campaign.description }}</p>
              </div>

              <!-- REJECTION REASON -->
              <div
                v-if="campaign.rejectionReason"
                class="reason"
              >
                <b>Reason given:</b>
                {{ campaign.rejectionReason }}
              </div>

              <!-- ADMIN ACTIONS: decisions first, main View Details centered at bottom. -->
              <div class="actions">
                <div
                  v-if="campaign.status === 'Pending Approval'"
                  class="decision-actions"
                >
                  <ion-button
                    class="primary-action"
                    :disabled="busyId === campaign.id"
                    @click="handleReinstate(campaign)"
                  >
                    {{
                      busyId === campaign.id
                        ? 'Processing...'
                        : isVolunteerEvent(campaign)
                          ? 'Approve event'
                          : 'Approve campaign'
                    }}
                  </ion-button>
                  <ion-button
                    class="danger-action"
                    :disabled="busyId === campaign.id"
                    @click="handleSuspend(campaign)"
                  >
                    {{ isVolunteerEvent(campaign) ? 'Reject event' : 'Reject campaign' }}
                  </ion-button>
                </div>

                <ion-button
                  class="view-action"
                  :disabled="busyId === campaign.id"
                  :router-link="`/admin/campaigns/${campaign.id}/view`"
                  :aria-label="`View details for ${campaign.title}`"
                >
                  <ion-icon slot="start" :icon="eyeOutline" />
                  View Details
                  <ion-icon slot="end" :icon="arrowForwardOutline" />
                </ion-button>
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
  IonPage,
  IonMenu,
  IonMenuToggle,
  IonList,
  IonItem,
  menuController,
  IonHeader,
  IonToolbar,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonChip,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';

import {
  alertCircleOutline,
  checkmarkDoneOutline,
  arrowForwardOutline,
  eyeOutline,
  megaphoneOutline,
  banOutline,
  calendarOutline,
  locationOutline,
  personOutline,
  peopleOutline,
  informationCircleOutline,
  timeOutline,
  barChartOutline,
  notificationsOutline,
  documentTextOutline,
  logOutOutline,
  menuOutline,
} from 'ionicons/icons';

import { currentUser } from '../services/authState';
import { logoutUser } from '../services/authService';


import {
  getAllCampaigns,
  reinstateCampaign,
  suspendCampaign,
} from '../services/campaignService';

import type { Campaign } from '../models/Campaign';

import {
  formatDate,
  formatPeso,
} from '../utils/format';

import {
  askReason,
  campaignStatusColor,
  confirmAction,
  confirmLogout,
  showToast,
} from '../utils/ui';

const router = useRouter();
const ADMIN_MENU_ID = 'campaign-admin-menu';

async function toggleAdminMenu() {
  await menuController.toggle(ADMIN_MENU_ID);
}

async function handleLogout() {
  if (!(await confirmLogout())) return;
  await menuController.close(ADMIN_MENU_ID).catch(() => undefined);
  await logoutUser();
  await router.replace('/welcome');
}

// CAMPAIGN DATA
const campaigns = ref<Campaign[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const segment = ref<string>('pending');
const busyId = ref('');

// ADMIN INFORMATION
const adminName = computed(() => {
  return currentUser.value?.displayName || 'Administrator';
});

const initials = computed(() => {
  return (
    adminName.value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || '')
      .join('') || 'A'
  );
});

// CAMPAIGN STATUS GROUPS
const pending = computed(() => {
  return campaigns.value.filter(
    (campaign) => campaign.status === 'Pending Approval'
  );
});

const live = computed(() => {
  return campaigns.value.filter(
    (campaign) => campaign.status === 'Active'
  );
});

const suspended = computed(() => {
  return campaigns.value.filter(
    (campaign) => campaign.status === 'Suspended'
  );
});

const other = computed(() => {
  return campaigns.value.filter(
    (campaign) =>
      campaign.status !== 'Pending Approval' &&
      campaign.status !== 'Active' &&
      campaign.status !== 'Suspended'
  );
});

// SELECTED TAB
const visibleCampaigns = computed(() => {
  if (segment.value === 'pending') {
    return pending.value;
  }

  if (segment.value === 'live') {
    return live.value;
  }

  if (segment.value === 'suspended') {
    return suspended.value;
  }

  return other.value;
});

// CHECK EVENT TYPE
function isVolunteerEvent(campaign: Campaign): boolean {
  return campaign.type === 'volunteer_event';
}

// CHECK IF VOLUNTEERS ARE REQUIRED
function eventNeedsVolunteers(campaign: Campaign): boolean {
  if (!isVolunteerEvent(campaign)) {
    return false;
  }

  // New event records
  if (typeof campaign.needsVolunteers === 'boolean') {
    return campaign.needsVolunteers;
  }

  // Compatibility with older volunteer events
  return Number(campaign.volunteerSlots || 0) > 0;
}

// FUNDRAISING PROGRESS
function progressPercent(campaign: Campaign): number {
  const goal = Number(campaign.goalAmount);

  if (!Number.isFinite(goal) || goal <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (Number(campaign.verifiedTotal || 0) / goal) * 100
    )
  );
}

// LOAD CAMPAIGNS
async function loadCampaigns() {
  errorMessage.value = '';

  try {
    campaigns.value = await getAllCampaigns();
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Could not load campaigns.';
  } finally {
    loading.value = false;
  }
}

// REFRESH WHEN PAGE OPENS
onIonViewWillEnter(async () => {
  if (campaigns.value.length === 0) {
    loading.value = true;
  }

  await loadCampaigns();
});

// EXECUTE ADMIN ACTION
async function runAction(
  campaign: Campaign,
  action: () => Promise<void>,
  successMessage: string
) {
  busyId.value = campaign.id;

  try {
    await action();
    await loadCampaigns();
    await showToast(successMessage);
  } catch (error) {
    await showToast(
      error instanceof Error
        ? error.message
        : 'Action failed.',
      'danger'
    );
  } finally {
    busyId.value = '';
  }
}

// REJECT CAMPAIGN OR EVENT
async function handleSuspend(campaign: Campaign) {
  const adminUid = currentUser.value?.uid;

  if (!adminUid || busyId.value) {
    return;
  }

  const event = isVolunteerEvent(campaign);

  const reason = await askReason(
    event ? 'Reject event' : 'Reject campaign',
    `Why is "${campaign.title}" being rejected? The organizer will see this reason and may edit and resubmit.`,
    'Reject'
  );

  if (!reason) {
    return;
  }

  await runAction(
    campaign,
    () => suspendCampaign(campaign, adminUid, reason),
    event
      ? 'Event rejected. The organizer may edit and resubmit.'
      : 'Campaign rejected. The organizer may edit and resubmit.'
  );
}

// APPROVE CAMPAIGN OR EVENT
async function handleReinstate(campaign: Campaign) {
  const adminUid = currentUser.value?.uid;

  if (!adminUid || busyId.value) {
    return;
  }

  const event = isVolunteerEvent(campaign);

  const eventRequirements = eventNeedsVolunteers(campaign)
    ? ' Also verify the volunteer category, duties, requirements, and slots.'
    : '';

  const ok = await confirmAction(
    event ? 'Approve event' : 'Approve campaign',
    `Have you reviewed the valid ID, barangay clearance, situation photo, and legitimacy proof for "${campaign.title}"?${eventRequirements} Approval will make this ${event ? 'event' : 'campaign'} public.`,
    'Approve'
  );

  if (!ok) {
    return;
  }

  await runAction(
    campaign,
    () => reinstateCampaign(campaign, adminUid),
    event
      ? 'Event approved and now public.'
      : 'Campaign approved and now public.'
  );
}
</script>

<style scoped>
/* ORIGINAL RELIEFGO DESIGN — preserved, with admin dashboard spacing alignment. */

.rg-header {
  box-shadow: none;
}

.rg-toolbar {
  --background: #fbf0dc;
  --color: #143b2b;
  --min-height: 73px;
  --border-color: #e6dcc6;
  --padding-start: 0;
  --padding-end: 0;
  border-bottom: 1px solid #e6dcc6;
}

.nav-inner {
  width: 100%;
  padding-inline: clamp(18px, 3.2vw, 55px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  gap: 20px;
}

.brand {
  font-family: Georgia, serif;
  font-size: clamp(25px, 2.1vw, 33px);
  font-weight: bold;
  color: #123b2a;
  text-decoration: none;
  letter-spacing: -1.7px;
}

.brand span {
  color: #be563b;
}

.brand sup {
  font: 13px Georgia, serif;
  color: #be563b;
  vertical-align: top;
}


.rg-content {
  --background: #fbf0dc;
  color: #16382a;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
}

.page-wrapper {
  box-sizing: border-box;
  width: 100%;
  max-width: 1490px;
  margin: 0 auto;
  padding: clamp(18px, 2.2vw, 32px) clamp(16px, 3.3vw, 55px) 70px;
}

/* HERO */
.hero {
  background:
    radial-gradient(circle at 75% 130%, #38533a 0, transparent 38%),
    linear-gradient(115deg, #193e2e, #112b20);
  color: #fff8e7;
  border-radius: 23px;
  padding: 46px 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.hero-copy {
  max-width: 700px;
}

.eyebrow,
.mini-label {
  color: #f0b44e;
  letter-spacing: 2px;
  font-size: 11px;
  font-weight: 900;
  margin: 0 0 15px;
}

.hero h1 {
  font: normal clamp(37px, 4.3vw, 65px)/1.06 Georgia, serif;
  letter-spacing: -1.6px;
  margin: 0 0 15px;
  color: #fff9eb;
}

.hero h1 em {
  color: #f3b75d;
  font-weight: normal;
}

.hero-copy > p:last-child {
  font-size: 14px;
  line-height: 1.7;
  max-width: 640px;
  margin: 0;
  color: #e7ebdc;
}

.identity {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 300px;
  max-width: 400px;
  padding: 19px;
  border: 1px solid #ffffff35;
  background: #ffffff0e;
  border-radius: 18px;
}

.avatar {
  flex: none;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: #f3b75d;
  color: #153729;
  display: grid;
  place-items: center;
  font: 30px Georgia, serif;
}

.identity-label {
  display: block;
  color: #f0b44e;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.7px;
  margin-bottom: 6px;
}

.identity strong {
  display: block;
  color: #fff8e7;
  font: 25px Georgia, serif;
  overflow-wrap: anywhere;
}

.identity small {
  display: block;
  color: #e7e9da;
  margin-top: 4px;
}

/* STATISTICS */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 20px 0 34px;
}

.stat {
  min-width: 0;
  background: #fffaf0;
  border: 1px solid #e9dcc3;
  border-radius: 18px;
  padding: 22px 25px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat ion-icon {
  color: #be563b;
  font-size: 23px;
  margin-bottom: 17px;
}

.stat span {
  color: #be563b;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.6px;
}

.stat strong {
  font: 38px Georgia, serif;
  color: #173e2d;
  margin: 8px 0 2px;
}

.stat small {
  color: #788078;
  font-size: 12px;
}

/* SECTION */
.section-heading {
  margin: 0 0 22px;
}

.eyebrow.dark {
  color: #be563b;
  margin-bottom: 8px;
}

.section-heading h2 {
  font: normal clamp(32px, 3.4vw, 49px) Georgia, serif;
  margin: 0;
  color: #173e2d;
}

.section-heading h2 em {
  color: #be563b;
  font-weight: normal;
}

.section-heading p:last-child {
  color: #6d796e;
  font-size: 14px;
  margin: 8px 0 0;
}

/* TABS */
.status-tabs {
  --background: #efe6d2;
  background: #efe6d2;
  border-radius: 14px;
  padding: 5px;
  max-width: 760px;
  margin: 0 0 20px;
}

.status-tabs ion-segment-button {
  --color: #315342;
  --color-checked: #153e2c;
  --indicator-color: #fffaf0;
  --border-radius: 11px;
  font-weight: 800;
  min-height: 43px;
}

/* APPROVAL NOTICE */
.notice {
  background: #fff4d9;
  border: 1px solid #edd8a9;
  border-radius: 14px;
  padding: 18px 22px;
  margin: 12px 0 20px;
  color: #705b2d;
  font-size: 13px;
  line-height: 1.7;
}

.notice > strong {
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
}

.notice p {
  margin: 0 0 8px;
}

.notice p:last-child {
  margin-bottom: 0;
}

/* CAMPAIGN GRID */
.campaign-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.campaign-card {
  min-width: 0;
  border: 1px solid #e8dcc6;
  border-radius: 20px;
  background: #fffaf0;
  padding: 27px;
  box-shadow: 0 8px 25px #253d2810;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.mini-label {
  display: block;
  color: #be563b;
  margin-bottom: 10px;
}

.card-top h3 {
  font: normal 28px/1.18 Georgia, serif;
  color: #183d2c;
  margin: 0 0 8px;
  overflow-wrap: anywhere;
}

.card-top p {
  font-size: 13px;
  color: #7a8178;
  margin: 0;
}

.card-top ion-chip {
  flex: none;
  margin: 0;
  text-transform: capitalize;
}

/* FUNDRAISING DETAILS */
.amount-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 25px 0 13px;
}

.amount-grid > div {
  background: #f6eedc;
  padding: 15px;
  border-radius: 12px;
  min-width: 0;
}

.amount-grid span {
  display: block;
  color: #a46448;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .9px;
}

.amount-grid strong {
  display: block;
  font: 25px Georgia, serif;
  color: #153b2a;
  margin-top: 8px;
  overflow-wrap: anywhere;
}

.progress-track {
  height: 8px;
  background: #e5e8d9;
  border-radius: 20px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #d6a048;
  border-radius: 20px;
}

/* EVENT REVIEW */
.event-review {
  margin: 22px 0 12px;
  background: #f2f5ec;
  border: 1px solid #d7e1cf;
  border-radius: 14px;
  padding: 17px;
}

.event-review-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid #dce4d6;
}

.event-review-heading ion-icon {
  color: #be563b;
  font-size: 25px;
  flex-shrink: 0;
}

.event-review-heading > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.event-review-heading strong {
  color: #183d2c;
  font-size: 13px;
}

.event-review-heading span {
  color: #718074;
  font-size: 11px;
}

.event-review-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  padding: 13px 0;
  border-bottom: 1px solid #dce4d6;
}

.event-review-row:last-child {
  border-bottom: none;
}

.event-review-row > span {
  color: #758070;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .6px;
}

.event-review-row > strong {
  color: #183d2c;
  font-size: 12px;
  text-align: right;
  overflow-wrap: anywhere;
}

.event-review-row.stacked {
  flex-direction: column;
  gap: 7px;
}

.event-review-row.stacked p {
  margin: 0;
  color: #536657;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre-line;
}

/* VOLUNTEER STATUS */
.volunteer-status {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 13px;
  margin: 14px 0;
  border-radius: 11px;
  font-size: 12px;
  line-height: 1.6;
}

.volunteer-status ion-icon {
  font-size: 21px;
  flex-shrink: 0;
}

.needs-help {
  background: #dfeedd;
  color: #26613e;
  border: 1px solid #c4dcc1;
  font-weight: 800;
}

.no-help {
  background: #f5ead3;
  color: #735d38;
  border: 1px solid #e7d8b7;
}

.no-help strong {
  font-size: 12px;
}

.no-help p {
  margin: 5px 0 0;
  font-size: 12px;
}

/* COMMON DETAILS */
.details {
  margin: 22px 0 0;
}

.details p {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  color: #626e64;
  font-size: 13px;
  line-height: 1.5;
  margin: 11px 0;
}

.details ion-icon {
  color: #be563b;
  flex: none;
  font-size: 17px;
}

.details b,
.description b {
  color: #1b4330;
}

.description {
  border-top: 1px solid #ece2d1;
  margin-top: 16px;
  padding-top: 15px;
  font-size: 13px;
  line-height: 1.6;
}

.description p {
  color: #69766b;
  white-space: pre-line;
  overflow-wrap: anywhere;
  margin: 6px 0 0;
}

.reason {
  margin-top: 16px;
  padding: 14px;
  background: #fff0e9;
  border: 1px solid #efc9b7;
  border-radius: 12px;
  color: #a44530;
  font-size: 13px;
  line-height: 1.5;
}

/* ADMIN ACTIONS */
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  border-top: 1px solid #ece2d1;
  padding-top: 18px;
  margin-top: 20px;
}

.actions ion-button {
  --border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .2px;
  min-height: 38px;
  margin: 0;
  text-transform: none;
}

.outline-action {
  --color: #173e2d;
  --border-color: #173e2d;
}

.danger-action {
  --color: #b34d37;
  --border-color: #b34d37;
}

.primary-action {
  --background: #173e2d;
  --color: #fffaf0;
}

/* STATES */
.state-box {
  text-align: center;
  padding: 68px 24px;
  background: #fffaf0;
  border: 1px solid #e8dcc6;
  border-radius: 20px;
  color: #68766c;
}

.state-box h3 {
  font: normal 33px Georgia, serif;
  color: #173e2d;
  margin: 12px 0;
}

.state-box p {
  font-size: 14px;
}

.state-icon {
  font-size: 46px;
  color: #be563b;
}

.empty-icon {
  height: 75px;
  width: 75px;
  display: grid;
  place-items: center;
  margin: 0 auto 15px;
  border-radius: 50%;
  background: #f4e6c8;
  color: #be563b;
  font-size: 36px;
}

/* TABLET */
/* ADMIN CAMPAIGN REVIEW: same 266px dark-green sidebar as AdminDashboardPage.vue. */
.admin-campaign-review-page {
  --forest: #173729;
  --deep: #112b20;
  --cream: #fbf0dc;
  --terracotta: #be563b;
  --gold: #f3b75d;
  --muted: #667365;
}

/* The dashboard already disables link underlines; apply the same rule here.
   Only the intended brand/footer dividers should remain visible. */
.admin-campaign-review-page a,
.admin-campaign-review-page a:link,
.admin-campaign-review-page a:visited,
.admin-campaign-review-page a:hover,
.admin-campaign-review-page a:active {
  text-decoration: none !important;
  text-decoration-line: none !important;
}

.campaign-admin-main { width: 100%; min-width: 0; }
.nav-left { display: flex; align-items: center; min-width: 0; gap: 14px; }
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
.desktop-links {
  display: grid;
  align-content: start;
  gap: 5px;
  padding: 0 12px;
  overflow-y: auto;
  min-height: 0;
  flex: 1 1 auto;
}
.desktop-links a {
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 49px;
  padding: 12px 13px;
  box-sizing: border-box;
  color: #fbf0dc;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.25;
  text-decoration: none !important;
  border: 0;
  border-bottom: 0;
  box-shadow: none;
  border-radius: 12px;
  transition: background .2s;
}
.desktop-links a ion-icon { font-size: 20px; flex: none; color: var(--gold); }
.desktop-links a:hover, .desktop-links a.desktop-active {
  background: #ffffff22;
  color: #fff;
  text-decoration: none !important;
  border-bottom: 0;
}
.desktop-links a:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: -2px;
  text-decoration: none !important;
}
.desktop-sidebar-bottom { flex-shrink: 0; margin: auto 17px 0; padding: 25px 5px; font: italic 14px Georgia,serif; color: #e4ceb3; border-top: 1px solid #ffffff25; }
.desktop-sidebar-bottom > span { display: block; }
.campaign-admin-menu { display: none; --width: min(355px, 87vw); --background: #fbf0dc; }
.campaign-admin-menu::part(container) { border-radius: 0 24px 24px 0; box-shadow: 7px 0 35px rgba(16,42,32,.17); }
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
.mobile-sidebar-bottom { margin: auto 22px 0; padding: 22px 4px; border-top: 1px solid #e9ddc7; color: var(--muted); font: italic 13px Georgia,serif; }
.mobile-sidebar-bottom > span { display: block; }
.rg-sidebar-logout { display: flex; align-items: center; justify-content: center; gap: 9px; min-height: 44px; width: 100%; margin-top: 14px; border-radius: 12px; background: var(--gold); color: var(--forest); font: 800 12px 'Segoe UI',sans-serif; border: 1px solid var(--gold); cursor: pointer; }
.rg-sidebar-logout:hover { background: #ffdfa3; }
.rg-sidebar-logout:focus-visible { outline: 3px solid var(--terracotta); outline-offset: 2px; }
.admin-campaign-review-page .campaign-admin-main { left: 266px; width: calc(100% - 266px); min-width: 0; }
.admin-campaign-review-page .page-wrapper {
  width: 100%;
  max-width: 1490px;
  padding: clamp(18px, 2.2vw, 32px) clamp(16px, 3.3vw, 55px) 70px;
}
.admin-campaign-review-page .campaign-admin-menu { display: none; }
@media (max-width: 900px) {
  .admin-campaign-review-page .admin-desktop-sidebar { display: none; }
  .admin-campaign-review-page .campaign-admin-main { left: 0; width: 100%; }
  .admin-campaign-review-page .campaign-admin-menu { display: block; }
  .admin-campaign-review-page .menu-trigger { display: inline-flex; }
  .admin-campaign-review-page .topbar-identity { display: none; }
  .admin-campaign-review-page .page-wrapper {
    padding-inline: clamp(16px, 3.3vw, 30px);
  }
}
@media (max-width: 540px) {
  .admin-campaign-review-page .brand-divider,
  .admin-campaign-review-page .page-label { display: none; }
  .admin-campaign-review-page .nav-left { gap: 5px; }
  .admin-campaign-review-page .nav-inner { padding-inline: 12px; }
  .admin-campaign-review-page .brand { font-size: 29px; }
  .admin-campaign-review-page .topbar-user { display: none; }
}

@media (max-width: 900px) {
  .hero {
    padding: 34px;
    align-items: stretch;
    flex-direction: column;
  }

  .identity {
    max-width: none;
    min-width: 0;
  }

  .campaign-grid {
    grid-template-columns: 1fr;
  }
}

/* MOBILE */
@media (max-width: 620px) {
  .nav-inner {
    width: calc(100% - 30px);
  }

  .brand {
    font-size: 29px;
  }

  .back-link {
    font-size: 9px;
    letter-spacing: .3px;
  }

  .admin-campaign-review-page .page-wrapper {
    width: 100%;
    max-width: none;
    padding: 16px 14px 44px;
  }

  .hero {
    padding: 28px 22px;
    border-radius: 18px;
  }

  .hero h1 {
    font-size: 39px;
  }

  .identity {
    padding: 13px;
  }

  .avatar {
    width: 53px;
    height: 53px;
    font-size: 23px;
  }

  .identity strong {
    font-size: 20px;
  }

  .stat-grid {
    gap: 9px;
    margin: 12px 0 28px;
  }

  .stat {
    padding: 14px 11px;
    border-radius: 13px;
  }

  .stat ion-icon {
    font-size: 19px;
    margin-bottom: 12px;
  }

  .stat span {
    font-size: 8px;
    letter-spacing: .5px;
  }

  .stat strong {
    font-size: 29px;
  }

  .stat small {
    font-size: 10px;
  }

  .status-tabs {
    max-width: 100%;
    overflow-x: auto;
  }

  .status-tabs ion-segment-button {
    font-size: 10px;
  }

  .campaign-card {
    padding: 19px;
  }

  .card-top {
    flex-wrap: wrap;
  }

  .amount-grid strong {
    font-size: 20px;
  }

  .event-review-row {
    flex-direction: column;
    gap: 5px;
  }

  .event-review-row > strong {
    text-align: left;
  }
}

/* ========================================================================
   COMPACT CAMPAIGN REVIEW — balanced cards, centered bottom View button
   Existing sidebar, data, status tabs, approvals, and navigation are retained.
   ======================================================================== */
.admin-campaign-review-page .page-wrapper {
  padding-bottom: 40px;
}

.admin-campaign-review-page .hero {
  padding: 30px clamp(24px, 3vw, 42px);
  gap: 22px;
  border-radius: 19px;
}
.admin-campaign-review-page .hero h1 {
  font-size: clamp(34px, 3.4vw, 48px);
  margin-bottom: 11px;
}
.admin-campaign-review-page .hero .eyebrow {
  margin-bottom: 10px;
}
.admin-campaign-review-page .identity {
  min-width: 0;
  width: min(100%, 340px);
  padding: 13px 16px;
  gap: 12px;
}
.admin-campaign-review-page .identity .avatar {
  width: 51px;
  height: 51px;
  font-size: 22px;
}
.admin-campaign-review-page .identity strong {
  font-size: 20px;
}

/* Summary boxes should not occupy excessive vertical space. */
.admin-campaign-review-page .stat-grid {
  gap: 12px;
  margin: 15px 0 25px;
}
.admin-campaign-review-page .stat {
  min-height: 0;
  padding: 15px 18px;
  border-radius: 14px;
}
.admin-campaign-review-page .stat ion-icon {
  font-size: 20px;
  margin-bottom: 9px;
}
.admin-campaign-review-page .stat strong {
  font-size: 32px;
  margin: 4px 0 2px;
}
.admin-campaign-review-page .section-heading {
  margin-bottom: 16px;
}
.admin-campaign-review-page .section-heading h2 {
  font-size: clamp(29px, 3vw, 39px);
}
.admin-campaign-review-page .status-tabs {
  margin-bottom: 14px;
}
.admin-campaign-review-page .notice {
  padding: 12px 16px;
  margin: 8px 0 16px;
  line-height: 1.55;
}
.admin-campaign-review-page .notice > strong {
  margin-bottom: 5px;
}

/* Cards stay equal-height within a row; preview text is shortened visually,
   while full text remains intact in the record and its View Details page. */
.admin-campaign-review-page .campaign-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  align-items: stretch;
}
.admin-campaign-review-page .campaign-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 17px 19px;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(24, 56, 39, .045);
}
.admin-campaign-review-page .card-top {
  gap: 10px;
}
.admin-campaign-review-page .card-top h3 {
  font-size: clamp(19px, 1.65vw, 24px);
  line-height: 1.2;
  margin-bottom: 5px;
}
.admin-campaign-review-page .mini-label {
  font-size: 9px;
  letter-spacing: 1.25px;
  margin-bottom: 6px;
}
.admin-campaign-review-page .card-top p {
  font-size: 11px;
  line-height: 1.45;
}
.admin-campaign-review-page .card-top ion-chip {
  font-size: 10px;
  height: 28px;
  max-width: 43%;
}
.admin-campaign-review-page .amount-grid {
  gap: 9px;
  margin: 13px 0 10px;
}
.admin-campaign-review-page .amount-grid > div {
  padding: 11px 12px;
  border-radius: 10px;
}
.admin-campaign-review-page .amount-grid span {
  font-size: 9px;
  letter-spacing: .45px;
}
.admin-campaign-review-page .amount-grid strong {
  font-size: clamp(19px, 1.7vw, 23px);
  margin-top: 4px;
}
.admin-campaign-review-page .progress-track {
  height: 7px;
}
.admin-campaign-review-page .details {
  margin-top: 13px;
}
.admin-campaign-review-page .details p {
  font-size: 12px;
  line-height: 1.45;
  margin: 7px 0;
}
.admin-campaign-review-page .details ion-icon {
  font-size: 15px;
}
.admin-campaign-review-page .description {
  margin-top: 10px;
  padding-top: 9px;
  line-height: 1.5;
  font-size: 12px;
}
.admin-campaign-review-page .description p,
.admin-campaign-review-page .event-review-row.stacked p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
  margin-top: 4px;
  line-height: 1.5;
}
.admin-campaign-review-page .reason {
  padding: 10px 12px;
  margin-top: 11px;
  line-height: 1.45;
}

/* Condense the volunteer overview without discarding submitted values. */
.admin-campaign-review-page .event-review {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  padding: 11px;
  margin: 12px 0 7px;
  border-radius: 12px;
}
.admin-campaign-review-page .event-review-heading,
.admin-campaign-review-page .volunteer-status {
  grid-column: 1 / -1;
}
.admin-campaign-review-page .event-review-heading {
  gap: 8px;
  padding-bottom: 9px;
}
.admin-campaign-review-page .event-review-heading ion-icon {
  font-size: 20px;
}
.admin-campaign-review-page .event-review-row,
.admin-campaign-review-page .event-review-row.stacked {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 8px 9px;
  background: rgba(255, 255, 255, .63);
  border: 0;
  border-radius: 8px;
}
.admin-campaign-review-page .event-review-row > strong {
  text-align: left;
  font-size: 12px;
}
.admin-campaign-review-page .event-review-row > span {
  font-size: 9px;
}
.admin-campaign-review-page .volunteer-status {
  padding: 9px 11px;
  margin: 3px 0;
}

/* Decision buttons appear together; View Details is the visual footer. */
.admin-campaign-review-page .actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 10px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 0;
}
.admin-campaign-review-page .decision-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  gap: 9px;
}
.admin-campaign-review-page .actions ion-button {
  --box-shadow: none;
  --border-radius: 11px;
  min-height: 41px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  margin: 0;
  text-transform: none;
}
.admin-campaign-review-page .decision-actions ion-button {
  width: 100%;
}
.admin-campaign-review-page .actions .primary-action {
  --background: #173e2d;
  --color: #fffaf0;
  --background-hover: #265742;
}
.admin-campaign-review-page .actions .danger-action {
  --background: #f9e5dc;
  --color: #a34031;
  --background-hover: #f1d3c7;
}
.admin-campaign-review-page .actions .view-action {
  align-self: center;
  width: min(84%, 460px);
  --background: #173e2d;
  --color: #fffaf0;
  --background-hover: #285b43;
  --border-radius: 11px;
  margin: 0 auto;
  min-height: 44px;
}
.admin-campaign-review-page .actions .view-action ion-icon {
  font-size: 16px;
}
.admin-campaign-review-page .actions ion-button:focus-visible {
  outline: 3px solid #f3b75d;
  outline-offset: 3px;
}

@media (max-width: 1050px) {
  .admin-campaign-review-page .campaign-grid {
    grid-template-columns: 1fr;
  }
  .admin-campaign-review-page .campaign-card {
    max-width: none;
  }
}
@media (max-width: 900px) {
  .admin-campaign-review-page .hero {
    padding: 25px;
  }
}
@media (max-width: 620px) {
  .admin-campaign-review-page .hero {
    padding: 22px 20px;
  }
  .admin-campaign-review-page .campaign-card {
    padding: 14px 15px;
  }
  .admin-campaign-review-page .stat {
    padding: 13px 11px;
  }
  .admin-campaign-review-page .stat strong {
    font-size: 26px;
  }
  .admin-campaign-review-page .event-review {
    grid-template-columns: 1fr;
  }
  .admin-campaign-review-page .actions .view-action {
    width: 100%;
  }
}
@media (max-width: 390px) {
  .admin-campaign-review-page .decision-actions {
    grid-template-columns: 1fr;
  }
}

</style>