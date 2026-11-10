<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>
          Event Volunteers · Organizer Review
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="shell">

        <!-- Same right-aligned back button used across the organizer workspace. -->
        <div class="back-nav">
          <router-link
            to="/organizer/campaigns"
            class="back"
            aria-label="Back to My Campaigns"
          >
            <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
            <span>Back to My Campaigns</span>
          </router-link>
        </div>

        <header class="hero">
          <small>RELIEFGO · VOLUNTEER MANAGEMENT</small>

          <h1>
            Review Volunteers &amp; Attendance
          </h1>

          <p>
            Approve or reject applications for your campaign. Review attendance timestamps,
            GPS locations, and private photographic evidence.
          </p>
        </header>

        <div class="toolbar">
          <div>
            <h2>Volunteer Records</h2>
            <p>
              {{ applicants.length }} application(s)
            </p>
          </div>

          <button type="button"
            class="secondary"
            :disabled="loading"
            @click="load"
          >
            Refresh Records
          </button>
        </div>

        <p v-if="loading" class="card">
          Loading volunteer applications...
        </p>

        <p v-if="error" class="card warning" role="alert">
          {{ error }}
        </p>

        <p
          v-if="!loading && !error && !applicants.length"
          class="card"
        >
          No volunteer applications found.
        </p>

        <p v-if="actionMessage" class="review-notice success" role="status">{{ actionMessage }}</p>
        <p v-if="actionError" class="review-notice warning" role="alert">{{ actionError }}</p>
        <div class="grid">
          <article
            v-for="applicant in applicants"
            :key="applicant.id"
            class="card"
          >
            <div class="row">
              <h3>{{ applicant.full_name }}</h3>

              <span
                class="badge"
                :class="applicant.status"
              >
                {{ applicant.status }}
              </span>
            </div>

            <div class="details">
              <p>
                <b>Community Event:</b>
                {{ applicant.campaign_title }}
              </p>

              <p>
                <b>Contact:</b>
                {{ applicant.phone }}
              </p>

              <p>
                <b>Address:</b>
                {{ applicant.address }}
              </p>

              <p>
                <b>Skills:</b>
                {{ applicant.skills }}
              </p>

              <p>
                <b>Availability:</b>
                {{ applicant.availability }}
              </p>

              <p>
                <b>Reason:</b>
                {{ applicant.reason }}
              </p>

              <p v-if="applicant.note">
                <b>Additional Note:</b>
                {{ applicant.note }}
              </p>

              <p>
                <b>Applied:</b>
                {{ formatDate(applicant.created_at) }}
              </p>

              <p>
                <b>Application Status:</b>
                {{ applicant.status }}
              </p>

              <p>
                <b>Attendance Status:</b>
                {{ applicant.attendance_status }}
              </p>

              <p>
                <b>Required Hours:</b>
                {{ applicant.required_attendance_hours }}
              </p>

              <p v-if="applicant.reviewed_at">
                <b>Application Reviewed:</b>
                {{ formatDate(applicant.reviewed_at) }}
              </p>

              <p v-if="applicant.attendance_reviewed_at">
                <b>Attendance Reviewed:</b>
                {{ formatDate(applicant.attendance_reviewed_at) }}
              </p>

              <p
                v-if="applicant.rejection_reason"
                class="warning"
              >
                <b>Application Rejection:</b>
                {{ applicant.rejection_reason }}
              </p>

              <p
                v-if="applicant.attendance_review_reason"
                class="warning"
              >
                <b>Attendance Rejection:</b>
                {{ applicant.attendance_review_reason }}
              </p>
            </div>

            <!-- CAMPAIGN ORGANIZER APPLICATION APPROVAL -->
            <div
              v-if="
                applicant.status === 'pending'
              "
              class="buttons"
            >
              <button type="button"
                :disabled="busy"
                @click="openReview(applicant, 'application', 'approve')"
              >
                <ion-icon :icon="checkmarkCircleOutline" /> Approve Volunteer
              </button>

              <button type="button"
                class="danger"
                :disabled="busy"
                @click="openReview(applicant, 'application', 'reject')"
              >
                <ion-icon :icon="closeCircleOutline" /> Reject Application
              </button>
            </div>

            <!-- VIEW ATTENDANCE EVIDENCE -->
            <button type="button"
              class="secondary"
              :disabled="proofLoading"
              @click="inspect(applicant)"
            >
              <ion-icon :icon="locationOutline" />
              {{ selected === applicant.id ? 'Refresh GPS & Photo Proofs' : 'View GPS & Photo Proofs' }}
            </button>

            <section
              v-if="selected === applicant.id"
              class="evidence"
            >
              <h4>Private Attendance Evidence</h4>

              <p v-if="proofLoading">
                Loading attendance evidence...
              </p>

              <p v-if="proofError" class="warning">
                {{ proofError }}
              </p>

              <p
                v-if="!proofLoading && !checks.length && !proofError"
              >
                No attendance evidence has been submitted.
              </p>

              <template v-if="checks.length">
                <div class="summary">
                  <div>
                    <small>Recorded Duration</small>
                    <strong>{{ spanHours }}</strong>
                  </div>

                  <div>
                    <small>Checkpoints</small>
                    <strong>{{ checkpointCount }}</strong>
                  </div>

                  <div>
                    <small>Required Hours</small>
                    <strong>
                      {{ applicant.required_attendance_hours }}
                    </strong>
                  </div>
                </div>

                <p class="notice">
                  GPS and photos are evidence of submitted
                  attendance points. They do not prove uninterrupted
                  presence for every minute of the event.
                </p>

                <article
                  v-for="check in checks"
                  :key="check.id"
                  class="check"
                >
                  <h5>{{ label(check.kind) }}</h5>

                  <p>
                    <b>Server Timestamp:</b>
                    {{ formatDate(check.recorded_at) }}
                  </p>

                  <p>
                    <b>GPS:</b>
                    {{ Number(check.latitude).toFixed(6) }},
                    {{ Number(check.longitude).toFixed(6) }}
                  </p>

                  <p>
                    <b>Distance From Event:</b>
                    {{ Math.round(check.distance_m) }} meters
                  </p>

                  <p>
                    <b>GPS Accuracy:</b>
                    ±{{ Math.round(check.accuracy_m) }} meters
                  </p>

                  <!-- PRIVATE PHOTO -->
                  <img
                    v-if="photos[check.id]"
                    :src="photos[check.id]"
                    alt="Private volunteer attendance evidence"
                    class="proof"
                  />

                  <p
                    v-else-if="!proofLoading"
                    class="warning"
                  >
                    Photo could not be loaded.
                  </p>

                  <!-- GPS LOCATION MAP -->
                  <LocationMap
                    :latitude="Number(check.latitude)"
                    :longitude="Number(check.longitude)"
                    address="Submitted volunteer GPS location"
                  />
                </article>
              </template>

              <!-- CAMPAIGN ORGANIZER ATTENDANCE VERIFICATION -->
              <div
                v-if="
                  applicant.attendance_status === 'submitted'
                "
                class="buttons"
              >
                <button type="button"
                  :disabled="busy || proofLoading || !!proofError"
                  @click="openReview(applicant, 'attendance', 'verify')"
                >
                  <ion-icon :icon="checkmarkCircleOutline" /> Verify Attendance
                </button>

                <button type="button"
                  class="danger"
                  :disabled="busy || proofLoading"
                  @click="openReview(applicant, 'attendance', 'reject')"
                >
                  <ion-icon :icon="closeCircleOutline" /> Reject Attendance
                </button>
              </div>

              <p
                v-if="applicant.attendance_status === 'verified'"
                class="success"
              >
                ✓ Attendance verified by the event organizer.
              </p>
            </section>

          </article>
        </div>

        <!-- Inline review form replaces browser prompts so validation and colors
             remain consistent with the Welcome-page design. -->
        <div v-if="pendingReview" class="review-overlay" @click.self="closeReview">
          <section class="review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-dialog-title">
            <p class="review-eyebrow">RELIEFGO · ORGANIZER DECISION</p>
            <h2 id="review-dialog-title">{{ reviewTitle }}</h2>
            <p class="review-summary">{{ pendingReview.applicant.full_name }} · {{ pendingReview.applicant.campaign_title }}</p>
            <p v-if="pendingReview.action === 'approve'">Confirm that you checked this volunteer's application and that a slot is available.</p>
            <p v-else-if="pendingReview.action === 'verify'">Confirm that you reviewed the GPS pins, private photos, server timestamps, and attendance duration for this volunteer.</p>
            <form @submit.prevent="confirmReview">
              <label v-if="pendingReview.action === 'reject'" for="organizer-review-reason">Reason for rejection <span>(required)</span></label>
              <textarea v-if="pendingReview.action === 'reject'" id="organizer-review-reason" v-model="reviewReason" rows="3" required minlength="5" maxlength="500" placeholder="Describe the reason clearly (5–500 characters)" autofocus />
              <small v-if="pendingReview.action === 'reject'">{{ reviewReason.trim().length }} / 500 characters</small>
              <p v-if="reviewError" class="warning" role="alert">{{ reviewError }}</p>
              <div class="buttons">
                <button type="submit" :class="{ danger: pendingReview.action === 'reject' }" :disabled="busy">
                  <ion-icon :icon="pendingReview.action === 'reject' ? closeCircleOutline : checkmarkCircleOutline" />
                  {{ busy ? 'Saving decision…' : reviewTitle }}
                </button>
                <button type="button" class="secondary" :disabled="busy" @click="closeReview">Cancel</button>
              </div>
            </form>
          </section>
        </div>

      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  watch
} from 'vue';

import { useRoute } from 'vue-router';

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  onIonViewWillEnter
} from '@ionic/vue';

import { api, apiSession } from '../services/api';

import LocationMap from '../components/LocationMap.vue';
import { checkmarkCircleOutline, closeCircleOutline, locationOutline, arrowBackOutline } from 'ionicons/icons';

// =====================================================
// TYPES
// =====================================================

interface Applicant {
  id: string;
  campaign_id: string;
  full_name: string;
  campaign_title: string;
  phone: string;
  address: string;
  skills: string;
  availability: string;
  reason: string;
  note?: string;

  status: 'pending' | 'approved' | 'rejected';

  attendance_status:
    | 'not_started'
    | 'in_progress'
    | 'submitted'
    | 'verified'
    | 'rejected';

  created_at: string;
  reviewed_at?: string | null;
  attendance_reviewed_at?: string | null;

  rejection_reason?: string | null;
  attendance_review_reason?: string | null;

  required_attendance_hours: number;
}

interface AttendanceCheck {
  id: string;
  kind: 'check_in' | 'checkpoint' | 'check_out';
  latitude: number;
  longitude: number;
  accuracy_m: number;
  distance_m: number;
  recorded_at: string;
}

// =====================================================
// STATE
// =====================================================

const route = useRoute();

const applicants = ref<Applicant[]>([]);
const checks = ref<AttendanceCheck[]>([]);

const photos = ref<Record<string, string>>({});

const selected = ref<string | null>(null);

const loading = ref(false);
const proofLoading = ref(false);
const busy = ref(false);

const error = ref('');
const proofError = ref('');
const actionMessage = ref('');
const actionError = ref('');
const reviewError = ref('');
const reviewReason = ref('');
type ReviewAction = 'approve' | 'reject' | 'verify';
type ReviewKind = 'application' | 'attendance';
const pendingReview = ref<{ applicant: Applicant; kind: ReviewKind; action: ReviewAction } | null>(null);
const reviewTitle = computed(() => {
  if (!pendingReview.value) return '';
  const labels: Record<ReviewAction,string> = {
    approve: 'Approve Volunteer',
    reject: pendingReview.value.kind === 'attendance' ? 'Reject Attendance' : 'Reject Application',
    verify: 'Verify Attendance'
  };
  return labels[pendingReview.value.action];
});
function closeReview() {
  if (busy.value) return;
  pendingReview.value = null;
  reviewReason.value = '';
  reviewError.value = '';
}
function openReview(applicant: Applicant, kind: ReviewKind, action: ReviewAction) {
  if (busy.value) return;
  actionMessage.value = '';
  actionError.value = '';
  if (kind === 'attendance' && action === 'verify' && (
    selected.value !== applicant.id || proofLoading.value || !!proofError.value ||
    checks.value.length < 2 || checks.value.some(check => !photos.value[check.id])
  )) {
    actionError.value = 'Open GPS & Photo Proofs and inspect every record before verifying attendance.';
    return;
  }
  pendingReview.value = { applicant, kind, action };
  reviewReason.value = '';
  reviewError.value = '';
}
async function confirmReview() {
  const decision = pendingReview.value;
  if (!decision || busy.value) return;
  const reason = reviewReason.value.trim();
  if (decision.action === 'reject' && (reason.length < 5 || reason.length > 500)) {
    reviewError.value = 'Please provide a reason between 5 and 500 characters.';
    return;
  }
  const ok = decision.kind === 'application'
    ? await decide(decision.applicant, decision.action as 'approve' | 'reject', reason)
    : await reviewAttendance(decision.applicant, decision.action as 'verify' | 'reject', reason);
  if (ok) closeReview();
}


let proofRequest = 0;

// =====================================================
// COMPUTED STATS
// =====================================================

const checkpointCount = computed(
  () => checks.value.filter(
    check => check.kind === 'checkpoint'
  ).length
);

const spanHours = computed(() => {
  const first = checks.value.find(
    check => check.kind === 'check_in'
  );

  const last = checks.value.find(
    check => check.kind === 'check_out'
  );

  if (!first || !last) {
    return 'Not completed';
  }

  const hours =
    (
      new Date(last.recorded_at).getTime() -
      new Date(first.recorded_at).getTime()
    ) / 3600000;

  return `${hours.toFixed(2)} hours`;
});

function label(kind: string) {
  const names: Record<string, string> = {
    check_in: 'CHECK IN',
    checkpoint: 'MID-EVENT CHECKPOINT',
    check_out: 'CHECK OUT'
  };

  return names[kind] || kind;
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isFinite(date.getTime())
    ? date.toLocaleString('en-PH')
    : 'Invalid date';
}

// =====================================================
// LOAD APPLICATIONS
// =====================================================

async function load() {
  loading.value = true;
  error.value = '';

  try {
    const endpoint = `/campaigns/${encodeURIComponent(
      String(route.params.id)
    )}/volunteers`;

    applicants.value = await api<Applicant[]>(endpoint);

  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Unable to load applications.';
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(load);

// Load the correct organizer event when navigating
// between two event volunteer pages.
watch(
  () => route.params.id,
  () => {
    selected.value = null;
    checks.value = [];
    clearPhotos();
    void load();
  }
);

// =====================================================
// PRIVATE IMAGE MEMORY MANAGEMENT
// =====================================================

function clearPhotos() {
  for (const url of Object.values(photos.value)) {
    URL.revokeObjectURL(url);
  }

  photos.value = {};
}

onBeforeUnmount(() => {
  proofRequest++;
  clearPhotos();
});

// =====================================================
// INSPECT ATTENDANCE
// =====================================================

async function inspect(applicant: Applicant) {
  const request = ++proofRequest;

  selected.value = applicant.id;
  proofLoading.value = true;
  proofError.value = '';

  checks.value = [];
  clearPhotos();

  try {
    const result = await api<{
      checks: AttendanceCheck[];
    }>(
      `/volunteers/${applicant.id}/attendance`
    );

    if (request !== proofRequest) return;

    checks.value = result.checks;

    const apiRoot = (
      import.meta.env.VITE_API_BASE_URL || '/api'
    ).replace(/\/$/, '');

    for (const check of result.checks) {
      if (request !== proofRequest) return;

      const response = await fetch(
        `${apiRoot}/volunteer-evidence/${check.id}`,
        {
          headers: {
            Authorization: `Bearer ${apiSession.token}`
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load attendance photo (${response.status}).`
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (request !== proofRequest) {
        URL.revokeObjectURL(url);
        return;
      }

      photos.value[check.id] = url;
    }

  } catch (err) {
    if (request === proofRequest) {
      proofError.value =
        err instanceof Error
          ? err.message
          : 'Unable to retrieve attendance proofs.';
    }

  } finally {
    if (request === proofRequest) {
      proofLoading.value = false;
    }
  }
}

// =====================================================
// CAMPAIGN ORGANIZER APPLICATION REVIEW
// =====================================================
async function decide(applicant: Applicant, action: 'approve' | 'reject', reason: string): Promise<boolean> {
  if (busy.value) return false;
  busy.value = true;
  actionError.value = '';
  reviewError.value = '';
  try {
    await api(`/organizer/volunteers/${applicant.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason, evidenceChecked: action === 'approve' })
    });
    await load();
    actionMessage.value = action === 'approve'
      ? `${applicant.full_name} was approved for this event.`
      : `${applicant.full_name}'s application was rejected.`;
    return true;
  } catch (err) {
    reviewError.value = err instanceof Error ? err.message : 'Unable to review application.';
    return false;
  } finally {
    busy.value = false;
  }
}

// =====================================================
// CAMPAIGN ORGANIZER ATTENDANCE REVIEW
// =====================================================
async function reviewAttendance(applicant: Applicant, action: 'verify' | 'reject', reason: string): Promise<boolean> {
  if (busy.value) return false;
  busy.value = true;
  actionError.value = '';
  reviewError.value = '';
  try {
    await api(`/organizer/volunteers/${applicant.id}/attendance`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason, evidenceChecked: action === 'verify' })
    });
    await load();
    actionMessage.value = action === 'verify'
      ? `${applicant.full_name}'s attendance was verified.`
      : `${applicant.full_name}'s attendance was rejected.`;
    return true;
  } catch (err) {
    reviewError.value = err instanceof Error ? err.message : 'Unable to review attendance.';
    return false;
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
ion-content {
  --background: #fff8e7;
}

.shell {
  max-width: 1200px;
  margin: auto;
  padding: 24px;
  color: #14332a;
}

/* Back button: top right, dark forest-green with high-contrast cream text. */
.back-nav {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 18px;
}

.back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 45px;
  max-width: 100%;
  padding: 12px 17px;
  border: 1px solid #173729;
  border-radius: 11px;
  background: #173729;
  color: #fffaf0;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.3;
  text-align: center;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(23, 55, 41, .13);
  transition: background .2s ease, box-shadow .2s ease;
}

.back:visited { color: #fffaf0; }
.back:hover { background: #28533e; color: #fffaf0; box-shadow: 0 5px 16px rgba(23, 55, 41, .2); }
.back:focus-visible { outline: 3px solid #f3b75d; outline-offset: 3px; }
.back ion-icon { flex-shrink: 0; color: #f3b75d; font-size: 17px; }
.back span { color: inherit; }

@media (prefers-reduced-motion: reduce) {
  .back { transition: none; }
}

.hero {
  background: #14332a;
  color: #fff8e7;
  padding: 30px;
  border-radius: 18px;
  margin: 20px 0;
}

.hero small {
  color: #f3b75d;
  letter-spacing: 2px;
  font-weight: 800;
}

.hero h1 {
  font: 40px Georgia, serif;
  margin: 10px 0;
}

.hero p {
  line-height: 1.7;
}

.toolbar,
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar {
  margin: 18px 0;
}

.toolbar h2 {
  font: 27px Georgia, serif;
  margin-bottom: 4px;
}

.toolbar p {
  font-size: 13px;
}

.grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(min(100%, 440px), 1fr));
  gap: 16px;
}

.card {
  min-width: 0;
  padding: 22px;
  border-radius: 16px;
  background: #fffdf5;
  border: 1px solid #e4d9c5;
}

.card h3 {
  font: 26px Georgia, serif;
  margin: 0;
}

.card p {
  font-size: 13px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.badge {
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  text-transform: capitalize;
  background: #f5e7c6;
}

.badge.approved {
  background: #d8ead7;
  color: #25623b;
}

.badge.rejected {
  background: #f9dcd1;
  color: #a23f30;
}

.details {
  margin: 15px 0;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 14px 0;
}

button {
  margin: 8px 0;
  padding: 12px 16px;
  background: #14332a;
  border: 0;
  border-radius: 10px;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.secondary {
  background: #ebddbe;
  color: #14332a;
}

.danger {
  background: #a74435;
}

.warning {
  color: #a83e30;
}

.success {
  color: #22683c;
  font-weight: 800;
}

.notice {
  background: #edf2e7;
  padding: 14px;
  border-radius: 10px;
  font-size: 13px;
}

.evidence {
  border-top: 1px solid #ded5c4;
  padding-top: 16px;
  margin-top: 16px;
}

.evidence h4 {
  font: 24px Georgia, serif;
}

.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 15px 0;
}

.summary div {
  padding: 12px;
  border-radius: 10px;
  background: #edf2e7;
}

.summary small {
  display: block;
  font-size: 11px;
  margin-bottom: 6px;
}

.summary strong {
  font-size: 16px;
}

.check {
  background: #f2f2e9;
  padding: 16px;
  border-radius: 12px;
  margin: 15px 0;
}

.check h5 {
  color: #b76545;
  letter-spacing: 1px;
  margin: 0 0 10px;
}

.proof {
  display: block;
  width: 100%;
  max-height: 280px;
  object-fit: contain;
  margin: 12px 0;
  border-radius: 10px;
}

@media (max-width: 600px) {
  .shell { padding: 14px; }
  .hero { padding: 22px; }
  .hero h1 { font-size: 30px; }
  .summary { grid-template-columns: 1fr; }
}
button ion-icon {vertical-align:-2px;font-size:17px;margin-right:5px}
.grid .card {box-shadow: 0 4px 18px #17372912}
.evidence {background:#fdf9ed;border:1px solid #e4d9c5;border-radius:12px;padding:16px;margin-top:18px}
.evidence .check {background:#fffdf8;border:1px solid #e4d9c5}
.grid .card button {min-height:42px}
@media(max-width:600px){.grid .card{padding:16px}.buttons button{flex:1 1 155px}}

.review-overlay{position:fixed;inset:0;background:#102c21b8;z-index:4000;display:grid;place-items:center;padding:16px;overflow-y:auto}
.review-dialog{background:#fffaf0;color:#173729;border-radius:20px;border:1px solid #e4d9c5;box-shadow:0 25px 70px #06160a40;padding:clamp(18px,3vw,30px);width:min(100%,500px);max-height:90vh;overflow-y:auto}
.review-eyebrow{font-weight:800;color:#be563b;letter-spacing:1.8px;font-size:10px}
.review-dialog h2{font:32px Georgia,serif;margin:6px 0 12px}
.review-dialog p{font-size:13px;line-height:1.55}
.review-summary{font-weight:700;background:#f4ead4;padding:11px;border-radius:10px}
.review-dialog label{display:block;font-weight:800;margin:18px 0 8px;font-size:13px}
.review-dialog label span,.review-dialog small{color:#88664e;font-weight:500}
.review-dialog textarea{width:100%;box-sizing:border-box;border-radius:10px;border:1px solid #d9cbb8;background:#fff;resize:vertical;padding:12px;font:inherit;color:#173729;min-height:90px}
.review-dialog textarea:focus{outline:2px solid #be563b;outline-offset:2px}
.review-dialog .buttons{margin-top:18px}.review-dialog .buttons button{flex:1;margin:0}
.review-notice{margin:10px 0;background:#e8f3e4;padding:13px;border-radius:10px;border:1px solid #d3e4ce}
.review-notice.warning{background:#fff0e9;border-color:#ebc6b9}
</style>