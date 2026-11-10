<template>
  <ion-page class="relief-dashboard-page">
    <!-- IMPORTANT: The APP SHELL owns the one Member Workspace sidebar.
         Do not render another sidebar or ion-menu inside this page. -->
    <ion-header class="rg-dashboard-header">
      <ion-toolbar class="rg-dashboard-toolbar">
        <div class="rg-dashboard-topbar">
          <div class="rg-dashboard-topbar-left">
            <router-link to="/dashboard" class="dashboard-brand" aria-label="ReliefGO home">
              Relief<span>GO</span><b>♥</b>
            </router-link>
            <span class="rg-topbar-divider" aria-hidden="true"></span>
            <span class="rg-topbar-title">MY DASHBOARD</span>
          </div>
          <div class="rg-dashboard-topbar-right">
            <div class="notification-holder" aria-label="Notifications">
              <NotificationBell />
            </div>
            <div class="rg-topbar-profile">
              <span class="rg-topbar-avatar">{{ userInitials }}</span>
              <div class="rg-topbar-identity">
                <strong :title="fullName">{{ fullName }}</strong>
                <small>{{ userRoleLabel.toUpperCase() }}</small>
              </div>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="false" class="dashboard-content">
      <div class="dashboard-shell">
        <main class="dashboard-main">
        <!-- A USER IDENTITY / WELCOME CARD, including an automatic initials avatar. -->
        <section class="welcome-hero" aria-labelledby="dashboard-heading">
          <div class="welcome-copy">
            <p class="eyebrow hero-eyebrow">YOUR RELIEFGO SPACE <span aria-hidden="true">✦</span></p>
            <h1 id="dashboard-heading">Hello, <em>{{ firstName }}!</em></h1>
            <p>
              Every act of kindness makes a difference. Follow your giving and
              fundraising journey, all in one place.
            </p>
            <div class="hero-mini-note">
              <ion-icon :icon="heartOutline" aria-hidden="true" />
              <span>SMALL ACTS. BIG HEARTS.</span>
            </div>
          </div>
  
          <div class="profile-card" aria-label="Account profile">
            <div class="profile-avatar" aria-hidden="true">{{ userInitials }}</div>
            <div class="profile-details">
              <p class="profile-kicker">RELIEFGO MEMBER</p>
              <strong>{{ fullName }}</strong>
              <span class="profile-role">{{ userRoleLabel }}</span>
            </div>
            <span class="profile-heart" aria-hidden="true">♥</span>
          </div>
        </section>
  
        <section v-if="loading" class="feedback-state" aria-live="polite">
          <ion-spinner name="crescent" color="primary" />
          <h2>Gathering your story...</h2>
          <p>Loading your donations and campaigns.</p>
        </section>
  
        <section v-else-if="errorMessage" class="feedback-state" role="alert">
          <ion-icon :icon="alertCircleOutline" class="feedback-icon" aria-hidden="true" />
          <h2>We couldn't load your dashboard.</h2>
          <p>{{ errorMessage }}</p>
          <ion-button class="gold-button" @click="loadDashboard">
            TRY AGAIN <ion-icon slot="end" :icon="arrowForwardOutline" />
          </ion-button>
        </section>
  
        <div v-else class="dashboard-grid">
          <!-- Donor summary and the user's actual, existing donation records. -->
          <section class="dashboard-section donor-section" aria-labelledby="donor-heading">
            <div class="section-heading">
              <div>
                <p class="eyebrow">GIVE WITH HEART</p>
                <h2 id="donor-heading">Your giving <em>impact.</em></h2>
                <p class="section-subtitle">Your donations, progress, and the causes you've supported.</p>
              </div>
              <div class="section-emblem" aria-hidden="true">
                <ion-icon :icon="heartOutline" />
              </div>
            </div>
  
            <div class="stat-grid donor-stats">
              <div class="stat-card">
                <ion-icon :icon="walletOutline" class="stat-icon" aria-hidden="true" />
                <strong>{{ formatPeso(donatedTotal) }}</strong>
                <span>Verified donations</span>
              </div>
              <div class="stat-card">
                <ion-icon :icon="checkmarkCircleOutline" class="stat-icon" aria-hidden="true" />
                <strong>{{ verifiedCount }}</strong>
                <span>Donations verified</span>
              </div>
              <div class="stat-card stat-warning">
                <ion-icon :icon="timeOutline" class="stat-icon" aria-hidden="true" />
                <strong>{{ pendingCount }}</strong>
                <span>Awaiting verification</span>
              </div>
            </div>
  
            <div class="activity-card">
              <div class="activity-heading">
                <h3>Recent donations</h3>
                <span>YOUR LATEST ACTS</span>
              </div>
  
              <div v-if="recentDonations.length === 0" class="empty-state">
                <div class="empty-icon" aria-hidden="true"><ion-icon :icon="heartOutline" /></div>
                <div>
                  <h4>Your story starts here.</h4>
                  <p>You haven't donated yet. Explore a cause close to your heart.</p>
                </div>
              </div>
  
              <ion-list v-else class="donation-list" lines="none">
                <ion-item
                  v-for="donation in recentDonations"
                  :key="donation.id"
                  button
                  detail
                  class="donation-item"
                  :router-link="`/donor/donations/${donation.id}`"
                >
                  <ion-label>
                    <h4>{{ donation.campaignTitle }}</h4>
                    <p>{{ formatDate(donation.transactionDate) }}</p>
                  </ion-label>
                  <ion-chip slot="end" :color="donationStatusColor(donation.status)">
                    {{ formatPeso(donation.amount) }}
                  </ion-chip>
                </ion-item>
              </ion-list>
            </div>
  
            <div class="section-actions">
              <ion-button class="gold-button" router-link="/campaigns">
                BROWSE CAMPAIGNS <ion-icon slot="end" :icon="arrowForwardOutline" />
              </ion-button>
              <ion-button class="outline-button" fill="outline" router-link="/donor/donations">
                ALL MY DONATIONS
              </ion-button>
            </div>
          </section>
  
          <!-- Fundraiser summary and original CampaignProgress integration. -->
          <section class="dashboard-section fundraiser-section" aria-labelledby="fundraiser-heading">
            <div class="section-heading">
              <div>
                <p class="eyebrow">SHARE BAYANIHAN</p>
                <h2 id="fundraiser-heading">Your fundraising <em>journey.</em></h2>
                <p class="section-subtitle">Create campaigns and watch your community's support grow.</p>
              </div>
              <div class="section-emblem" aria-hidden="true">
                <ion-icon :icon="peopleOutline" />
              </div>
            </div>
  
            <div class="stat-grid fundraiser-stats">
              <div class="stat-card">
                <ion-icon :icon="megaphoneOutline" class="stat-icon" aria-hidden="true" />
                <strong>{{ campaigns.length }}</strong>
                <span>My campaigns</span>
              </div>
              <div class="stat-card">
                <ion-icon :icon="trendingUpOutline" class="stat-icon" aria-hidden="true" />
                <strong>{{ formatPeso(raisedTotal) }}</strong>
                <span>Raised across my campaigns</span>
              </div>
            </div>
  
            <div class="activity-card fundraising-activity">
              <div class="activity-heading">
                <h3>My active campaigns</h3>
                <span>FUNDRAISING PROGRESS</span>
              </div>
  
              <div v-if="campaigns.length === 0" class="empty-state">
                <div class="empty-icon" aria-hidden="true"><ion-icon :icon="peopleOutline" /></div>
                <div>
                  <h4>Ready to make an impact?</h4>
                  <p>You haven't started a campaign yet. Bring a cause to life.</p>
                </div>
              </div>
              <p v-else-if="liveCampaigns.length === 0" class="quiet-note">
                You don't have any active campaigns right now.
              </p>
  
              <div v-else class="active-campaign-list">
                <div v-for="campaign in liveCampaigns" :key="campaign.id" class="my-campaign-card">
                  <h4>{{ campaign.title }}</h4>
                  <p>
                    {{ campaign.verifiedDonorCount }} verified
                    {{ campaign.verifiedDonorCount === 1 ? 'donor' : 'donors' }}
                    <span aria-hidden="true"> · </span>
                    Deadline {{ formatDate(campaign.deadline) }}
                  </p>
                  <CampaignProgress :raised="campaign.verifiedTotal" :goal="campaign.goalAmount" />
                </div>
              </div>
            </div>
  
            <div class="section-actions">
              <ion-button class="gold-button" router-link="/organizer/campaigns/new">
                START A CAMPAIGN <ion-icon slot="end" :icon="arrowForwardOutline" />
              </ion-button>
              <ion-button class="outline-button" fill="outline" router-link="/organizer/campaigns">
                MY CAMPAIGNS
              </ion-button>
            </div>
          </section>
        </div>
  
        <div class="bottom-message">
          <ion-icon :icon="heartOutline" aria-hidden="true" />
          <span>Stories of bayanihan live here.</span>
        </div>
        </main>

        <footer class="dashboard-footer">
        <span>© {{ new Date().getFullYear() }} ReliefGO</span>
        <span>Every helping hand makes hope grow.</span>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonSpinner,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  alertCircleOutline,
  heartOutline,
  walletOutline,
  checkmarkCircleOutline,
  timeOutline,
  peopleOutline,
  megaphoneOutline,
  trendingUpOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import CampaignProgress from '../components/CampaignProgress.vue';
import NotificationBell from '../components/NotificationBell.vue';
import { currentUser } from '../services/authState';
import { getMyCampaigns } from '../services/campaignService';
import { getMyDonations } from '../services/donationService';
import type { Campaign } from '../models/Campaign';
import type { Donation } from '../models/Donation';
import { formatDate, formatPeso } from '../utils/format';
import { donationStatusColor } from '../utils/ui';

const donations = ref<Donation[]>([]);
const campaigns = ref<Campaign[]>([]);
const loading = ref(true);
const errorMessage = ref('');

// Dynamically display the logged-in user's name and profile initials.
// No photo upload or new PNG asset is required.
const fullName = computed(() => currentUser.value?.displayName?.trim() || 'ReliefGO Member');
const firstName = computed(() => fullName.value.split(/\s+/)[0] || 'friend');
const userInitials = computed(() => {
  const nameParts = fullName.value.split(/\s+/).filter(Boolean);
  if (nameParts.length === 0) return 'RG';
  const initials = nameParts.length > 1
    ? `${Array.from(nameParts[0]!)[0] ?? ''}${Array.from(nameParts[nameParts.length - 1]!)[0] ?? ''}`
    : Array.from(nameParts[0]!).slice(0, 2).join('');
  return initials.toLocaleUpperCase();
});
const userRoleLabel = computed(() => {
  const role = currentUser.value?.role;
  if (role === 'donor') return 'Donor account';
  if (role === 'organizer') return 'Organizer account';
  if (role === 'admin') return 'Administrator account';
  return 'Community member';
});

const verifiedDonations = computed(() => donations.value.filter((d) => d.status === 'Verified'));
const donatedTotal = computed(() =>
  verifiedDonations.value.reduce((sum, donation) => sum + donation.amount, 0)
);
const verifiedCount = computed(() => verifiedDonations.value.length);
const pendingCount = computed(
  () => donations.value.filter((d) => d.status === 'Pending Verification').length
);
const recentDonations = computed(() => donations.value.slice(0, 3));

const raisedTotal = computed(() =>
  campaigns.value.reduce((sum, campaign) => sum + campaign.verifiedTotal, 0)
);
const liveCampaigns = computed(() => campaigns.value.filter((c) => c.status === 'Active'));

async function loadDashboard() {
  const user = currentUser.value;
  if (!user) {
    loading.value = false;
    errorMessage.value = 'Please log in to view your dashboard.';
    return;
  }

  if (donations.value.length === 0 && campaigns.value.length === 0) loading.value = true;
  errorMessage.value = '';

  try {
    const [myDonations, myCampaigns] = await Promise.all([
      getMyDonations(user.uid),
      getMyCampaigns(user.uid),
    ]);
    donations.value = myDonations;
    campaigns.value = myCampaigns;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load the dashboard.';
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(loadDashboard);

</script>

<style scoped>
/* RELIEFGO ORIGINAL PALETTE */
.relief-dashboard-page {
  --forest: #173729;
  --deep: #112b20;
  --cream: #fbf0dc;
  --terracotta: #be563b;
  --gold: #f3b75d;
  --muted: #667365;
  color: var(--forest);
  background: var(--cream);
}

.dashboard-content {
  --background: #fbf0dc;
  --color: #173729;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}
.dashboard-content::part(background),
.dashboard-content::part(scroll) { background: #fbf0dc; }

.dashboard-shell {
  min-height: 100dvh;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  color: var(--forest);
  background: var(--cream);
  -webkit-font-smoothing: antialiased;
}
.dashboard-shell *, .dashboard-shell *::before, .dashboard-shell *::after { box-sizing: border-box; }
.dashboard-shell a { color: inherit; text-decoration: none; }
.dashboard-shell button { font: inherit; }
.dashboard-shell h1, .dashboard-shell h2, .dashboard-shell h3,
.dashboard-shell h4, .dashboard-shell p { margin-top: 0; }

/* Welcome hero / user identity card */
.welcome-hero {
  position: relative; overflow: hidden; isolation: isolate;
  min-height: 236px;
  padding: clamp(27px, 3.5vw, 55px) clamp(25px, 4vw, 65px);
  display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(260px, .8fr);
  align-items: center; gap: clamp(20px, 3vw, 48px);
  background: linear-gradient(116deg, var(--forest), var(--deep));
  border-radius: 18px; color: #fff8e8;
}
.welcome-hero::before {
  content: ''; position: absolute; width: 470px; height: 470px; border: 1px solid rgba(232,174,76,.13);
  right: 8%; top: -250px; border-radius: 50%; pointer-events: none;
}
.welcome-hero::after {
  content: ''; position: absolute; width: 310px; height: 310px;
  right: -100px; bottom: -210px; border-radius: 50%; background: rgba(232,174,76,.055); pointer-events: none;
}
.welcome-copy { position: relative; z-index: 1; min-width: 0; }
.eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 2.1px; margin: 0 0 13px; color: var(--terracotta); }
.hero-eyebrow { color: var(--gold); }
.hero-eyebrow span { margin-left: 6px; }
.welcome-copy h1 { margin: 0 0 13px; font-size: clamp(38px, 4vw, 64px); line-height: 1.08; font-weight: 400; letter-spacing: -1.3px; overflow-wrap: anywhere; }
.welcome-copy h1 em { color: var(--gold); font-weight: 400; }
.welcome-copy > p:not(.eyebrow) { max-width: 565px; font-size: clamp(13px, 1vw, 15px); line-height: 1.65; color: #dce4d8; margin-bottom: 22px; }
.hero-mini-note { display: flex; gap: 8px; align-items: center; color: var(--gold); font-size: 10px; font-weight: 800; letter-spacing: 1.4px; }
.hero-mini-note ion-icon { font-size: 18px; }
.profile-card {
  position: relative; z-index: 1; min-width: 0;
  display: flex; align-items: center; gap: 16px;
  border: 1px solid rgba(255,248,232,.22); border-radius: 16px;
  background: rgba(255,248,232,.09); padding: clamp(18px, 2vw, 27px);
  backdrop-filter: blur(5px);
}
.profile-avatar {
  display: grid; place-items: center; flex: 0 0 83px; width: 83px; height: 83px;
  border-radius: 50%; border: 3px solid #f8e6bf; background: var(--gold);
  font-family: Georgia, serif; font-size: 29px; font-weight: 700;
  color: var(--deep); box-shadow: 0 7px 22px rgba(0,0,0,.13);
  user-select: none;
}
.profile-details { min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.profile-kicker { margin: 0; font-size: 10px; letter-spacing: 1.6px; color: #dfd9c5; font-weight: 800; }
.profile-details strong { font-family: Georgia, serif; font-weight: 500; font-size: clamp(20px, 1.7vw, 26px); line-height: 1.12; overflow-wrap: anywhere; }
.profile-role { display: inline-block; border-radius: 999px; padding: 6px 11px; color: #fff8e8; background: rgba(255,248,232,.16); font-size: 11px; }
.profile-heart { color: var(--gold); font-size: 15px; align-self: flex-start; margin-left: auto; }

/* Main dashboard panels: balanced donor/fundraiser columns on laptop. */
.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); gap: 22px; margin-top: 27px; align-items: stretch; }
.dashboard-section { min-width: 0; display: flex; flex-direction: column; padding: clamp(19px, 2.2vw, 31px); background: #fffaf0; border: 1px solid #e9dfcb; border-radius: 17px; }
.section-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
.section-heading h2 { font-size: clamp(27px, 2.4vw, 39px); font-weight: 400; letter-spacing: -.8px; line-height: 1.13; margin: 0 0 12px; }
.section-heading h2 em { color: var(--terracotta); font-weight: 400; }
.section-subtitle { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.6; }
.section-emblem { width: 51px; height: 51px; flex: 0 0 51px; display: grid; place-items: center; background: #f2e8cf; color: var(--terracotta); border-radius: 15px; }
.section-emblem ion-icon { font-size: 27px; }
.stat-grid { display: grid; gap: 10px; margin-bottom: 20px; }
.donor-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.fundraiser-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.stat-card { display: flex; min-width: 0; min-height: 133px; flex-direction: column; align-items: flex-start; justify-content: center; gap: 9px; padding: 17px clamp(11px, 1.5vw, 20px); border-radius: 14px; background: #e9efe4; }
.stat-card .stat-icon { font-size: 22px; color: #3d8852; }
.stat-card strong { font-size: clamp(19px, 1.55vw, 25px); font-family: Georgia, serif; font-weight: 700; line-height: 1.1; overflow-wrap: anywhere; }
.stat-card span { font-size: 11px; line-height: 1.45; color: #526657; }
.stat-warning { background: #fff1d3; }
.stat-warning .stat-icon { color: #ae722a; }

.activity-card { min-width: 0; border: 1px solid #eee3d0; border-radius: 14px; padding: clamp(16px, 2vw, 23px); background: #fffdf7; flex: 1 1 auto; }
.activity-heading { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
.activity-heading h3 { margin: 0; font-size: 24px; font-weight: 400; }
.activity-heading > span { color: var(--terracotta); font-size: 9px; letter-spacing: 1px; font-weight: 800; }
.empty-state { min-height: 136px; display: flex; align-items: center; gap: 16px; }
.empty-icon { display: grid; place-items: center; flex: 0 0 65px; height: 65px; border-radius: 50%; background: #f7e8c8; color: var(--terracotta); }
.empty-icon ion-icon { font-size: 31px; }
.empty-state h4 { font-size: 21px; font-weight: 400; margin: 0 0 7px; }
.empty-state p, .quiet-note { color: var(--muted); font-size: 12px; line-height: 1.65; margin: 0; }
.quiet-note { padding: 20px 0; }
.donation-list { background: transparent; padding: 0; }
.donation-item { --background: transparent; --background-hover: #f7efdf; --padding-start: 0; --inner-padding-end: 0; --min-height: 63px; }
.donation-item ion-label h4 { font: 600 15px 'DM Sans', sans-serif; color: var(--forest); white-space: normal; }
.donation-item ion-label p { color: var(--muted); font-size: 11px; }
.donation-item ion-chip { font-size: 11px; }
.my-campaign-card { border-top: 1px solid #e9dfcb; padding: 17px 0; }
.my-campaign-card:first-child { border-top: 0; padding-top: 2px; }
.my-campaign-card h4 { margin: 0 0 7px; font-size: 20px; line-height: 1.25; font-weight: 400; overflow-wrap: anywhere; }
.my-campaign-card p { color: var(--muted); font-size: 11px; line-height: 1.5; margin: 0 0 13px; }

.section-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 17px; }
.gold-button, .outline-button { margin: 0; min-height: 47px; --box-shadow: none; --border-radius: 999px; font-family: 'DM Sans', Arial, sans-serif; font-size: 10px; letter-spacing: .4px; font-weight: 800; }
.gold-button { --background: var(--gold); --background-hover: #f0bc62; --color: var(--deep); }
.outline-button { --color: var(--forest); --border-color: var(--forest); --border-width: 1px; }
.section-actions ion-icon { font-size: 16px; }

.feedback-state { margin-top: 25px; min-height: 290px; background: #fffaf0; border: 1px solid #e9dfcb; border-radius: 16px; padding: 50px 20px; display: flex; flex-direction: column; gap: 9px; align-items: center; text-align: center; }
.feedback-state h2 { font-weight: 400; font-size: 29px; margin: 9px 0 0; }
.feedback-state p { color: var(--muted); font-size: 13px; max-width: 460px; }
.feedback-state .feedback-icon { font-size: 42px; color: var(--terracotta); }
.feedback-state .gold-button { margin-top: 9px; }
.bottom-message { display: flex; justify-content: center; align-items: center; gap: 8px; margin: 30px auto 0; color: var(--muted); font: italic 15px Georgia, serif; }
.bottom-message ion-icon { color: var(--terracotta); font-size: 18px; }
.dashboard-footer { display: flex; justify-content: space-between; align-items: center; gap: 15px; padding: 18px clamp(18px, 4vw, 65px) 26px; font-size: 11px; color: #657464; border-top: 1px solid #e5dcc8; }

@media (max-width: 1250px) {
  .dashboard-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .stat-card { padding-inline: 12px; }
  .section-actions { grid-template-columns: 1fr; }
}
@media (max-width: 1020px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .section-actions { grid-template-columns: 1fr 1fr; }
  .stat-card { padding-inline: 20px; }
}
@media (max-width: 700px) {
  .dashboard-main { width: calc(100% - 28px); padding-top: 15px; }
  .welcome-hero { grid-template-columns: 1fr; padding: 26px 22px; gap: 20px; }
  .welcome-copy h1 { font-size: clamp(35px, 7vw, 49px); }
  .profile-card { max-width: 430px; padding: 14px; }
  .profile-avatar { flex-basis: 62px; width: 62px; height: 62px; font-size: 23px; }
  .profile-details strong { font-size: 20px; }
  .dashboard-grid { gap: 15px; margin-top: 15px; }
  .dashboard-section { padding: 18px; }
  .donor-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .stat-card { min-height: 122px; padding: 12px; }
  .stat-card strong { font-size: 19px; }
  .stat-card span { font-size: 10px; }
  .section-heading h2 { font-size: 30px; }
  .section-actions { grid-template-columns: 1fr; }
  .activity-heading h3 { font-size: 22px; }
  .dashboard-footer { padding: 16px; }
}
@media (max-width: 420px) {
  .donor-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .donor-stats .stat-warning { grid-column: 1 / -1; }
  .stat-card { min-height: 106px; }
  .profile-card { gap: 10px; }
  .profile-heart { display: none; }
  .section-emblem { width: 43px; height: 43px; flex-basis: 43px; }
  .empty-state { align-items: flex-start; gap: 12px; }
  .empty-icon { flex-basis: 50px; height: 50px; }
  .empty-icon ion-icon { font-size: 25px; }
  .dashboard-footer { flex-direction: column; gap: 5px; }
}
@media (prefers-reduced-motion: reduce) { .welcome-hero { transition: none; } }



/* --------------------------------------------------------------
   SINGLE-SIDEBAR FIX
   The application shell already renders the left Member Workspace sidebar.
   This component must NOT render another ion-menu / aside or add a left offset.
   -------------------------------------------------------------- */
.relief-dashboard-page {
  /* Preserve Ionic's built-in ion-page positioning and transitions. */
  width: 100%;
  min-width: 0;
}
.rg-dashboard-header { box-shadow: none; }
.rg-dashboard-header::after { display: none; }
.rg-dashboard-toolbar {
  --background: #fbf0dc;
  --color: #173729;
  --padding-start: 0;
  --padding-end: 0;
  --min-height: 74px;
  border-bottom: 1px solid #e5d9c2;
}
.rg-dashboard-topbar {
  width: 100%;
  min-height: 74px;
  padding: 9px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  box-sizing: border-box;
  font-family: 'DM Sans','Segoe UI',Arial,sans-serif;
}
.rg-dashboard-topbar-left,
.rg-dashboard-topbar-right { display: flex; align-items: center; gap: 16px; min-width: 0; }
.rg-dashboard-topbar-right { margin-left: auto; }
.rg-dashboard-topbar .dashboard-brand {
  color: #173729;
  font: 700 clamp(24px, 2.4vw, 34px)/1 Georgia, serif;
  letter-spacing: -1.7px;
  white-space: nowrap;
  text-decoration: none;
}
.rg-dashboard-topbar .dashboard-brand span,
.rg-dashboard-topbar .dashboard-brand b { color: #be563b; }
.rg-dashboard-topbar .dashboard-brand b { font-size: 12px; vertical-align: super; margin-left: 2px; }
.rg-topbar-divider { width: 1px; height: 24px; flex-shrink: 0; background: #dacbb4; }
.rg-topbar-title { font-size: 10px; font-weight: 900; letter-spacing: 1.6px; white-space: nowrap; }
.rg-topbar-profile { display: flex; align-items: center; gap: 10px; min-width: 0; }
.rg-topbar-avatar {
  display: grid;
  place-items: center;
  flex: 0 0 43px;
  width: 43px;
  height: 43px;
  border-radius: 50%;
  background: #f4b75c;
  color: #15392c;
  font: 700 17px Georgia, serif;
}
.rg-topbar-identity { display: flex; flex-direction: column; min-width: 0; gap: 4px; }
.rg-topbar-identity strong {
  max-width: 195px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #173729;
}
.rg-topbar-identity small { color: #be563b; font-size: 9px; font-weight: 800; letter-spacing: 1px; }

/* Align content centrally within the space remaining after the ONE global sidebar. */
.dashboard-main, .dashboard-footer {
  width: min(1190px, calc(100% - 56px));
  max-width: 1190px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}
.dashboard-main { padding: 34px 0 26px; }
.dashboard-footer { padding: 20px 0 26px; }

/* Compact welcome section (not the oversized original layout). */
.welcome-hero {
  min-height: 215px;
  padding: 28px clamp(28px, 3.2vw, 44px);
  grid-template-columns: minmax(0, 1.3fr) minmax(250px, .7fr);
  gap: clamp(18px, 2.3vw, 35px);
}
.welcome-copy h1 {
  font-size: clamp(34px, 3.2vw, 49px);
  margin-bottom: 10px;
  line-height: 1.09;
}
.welcome-copy > p:not(.eyebrow) { font-size: 13px; line-height: 1.55; margin-bottom: 14px; }
.welcome-copy .eyebrow { font-size: 10px; margin-bottom: 10px; }
.hero-mini-note { font-size: 9px; }
.profile-card { width: 100%; max-width: 330px; margin-left: auto; padding: 16px; gap: 12px; }
.profile-avatar { flex: 0 0 62px; width: 62px; height: 62px; font-size: 23px; }
.profile-details strong { font-size: clamp(18px, 1.45vw, 22px); }
.profile-kicker { font-size: 9px; }
.profile-role { font-size: 10px; padding: 5px 10px; }
.dashboard-grid { margin-top: 23px; gap: 20px; }
.dashboard-section { padding: clamp(17px, 2vw, 26px); }
/* Avoid breaking peso amounts as shown in the screenshot. */
.stat-card strong { font-size: clamp(16px, 1.3vw, 23px); overflow-wrap: normal; word-break: normal; white-space: nowrap; font-variant-numeric: tabular-nums; }
.stat-card { min-width: 0; }

@media (max-width: 1050px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .welcome-hero { grid-template-columns: minmax(0, 1fr) minmax(210px, .65fr); }
}
@media (max-width: 900px) {
  .dashboard-main, .dashboard-footer { width: calc(100% - 40px); }
  .rg-topbar-identity { display: none; }
}
@media (max-width: 700px) {
  .rg-dashboard-topbar { padding: 8px 15px; min-height: 66px; gap: 9px; }
  .rg-dashboard-topbar-left, .rg-dashboard-topbar-right { gap: 9px; }
  .dashboard-main, .dashboard-footer { width: calc(100% - 28px); }
  .dashboard-main { padding-top: 16px; }
  .welcome-hero { min-height: 0; grid-template-columns: 1fr; gap: 16px; padding: 24px 21px; }
  .welcome-copy h1 { font-size: clamp(31px, 7vw, 40px); }
  .profile-card { margin-left: 0; max-width: 100%; padding: 13px; }
  .profile-avatar { width: 54px; height: 54px; flex-basis: 54px; font-size: 20px; }
  .dashboard-grid { margin-top: 15px; gap: 15px; }
  .dashboard-section { padding: 17px; }
}
@media (max-width: 450px) {
  .rg-topbar-divider, .rg-topbar-title { display: none; }
  .rg-dashboard-topbar .dashboard-brand { font-size: 27px; }
  .welcome-hero { padding: 22px 17px; }
  .welcome-copy h1 { font-size: 31px; }
}

</style>