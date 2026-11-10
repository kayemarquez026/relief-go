<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>My Volunteer Applications</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="shell">

        <header class="hero">
          <small>RELIEFGO · BAYANIHAN</small>
          <h1>My Volunteer Journey</h1>
          <p>
            Track your applications, attendance proofs,
            and organizer verification.
          </p>
        </header>

        <p v-if="attendanceMessage" class="card success" role="status">{{ attendanceMessage }}</p>
        <p v-if="loading" class="card">
          Loading volunteer applications...
        </p>

        <p v-if="error" class="warning card" role="alert">
          {{ error }}
          <button class="secondary" @click="load">
            Retry
          </button>
        </p>

        <p
          v-if="!loading && !error && !applications.length"
          class="card"
        >
          You have no volunteer applications yet.
          <router-link to="/campaigns">
            Explore Community Events
          </router-link>
        </p>

        <article
          v-for="application in applications"
          :key="application.id"
          :id="`application-${application.id}`"
          class="card"
          :class="{ 'rg-notification-highlight': route.query.application === application.id }"
        >
          <div class="row">
            <h2>{{ application.campaign_title }}</h2>

            <span
              class="badge"
              :class="application.status"
            >
              {{ application.status }}
            </span>
          </div>

          <p>
            <b>Application:</b>
            {{ application.status }}
          </p>

          <p>
            <b>Attendance:</b>
            {{ application.attendance_status }}
          </p>

          <p>
            <b>Required duration:</b>
            {{ application.required_attendance_hours }} hours
          </p>

          <p v-if="application.volunteer_date">
            <b>Event schedule:</b>
            {{ formatDate(application.volunteer_date) }}
          </p>

          <p
            v-if="application.rejection_reason"
            class="warning"
          >
            <b>Rejection reason:</b>
            {{ application.rejection_reason }}
          </p>

          <p
            v-if="application.attendance_review_reason"
            class="warning"
          >
            <b>Attendance review:</b>
            {{ application.attendance_review_reason }}
          </p>

          <!-- PENDING APPLICATION -->
          <div
            v-if="application.status === 'pending'"
            class="notice"
          >
            Your application is waiting for organizer
            approval. Attendance check-in is not available yet.
          </div>

          <!-- REJECTED APPLICATION -->
          <div
            v-else-if="application.status === 'rejected'"
            class="notice warning"
          >
            Your volunteer application was not approved.
          </div>

          <!-- APPROVED APPLICATION -->
          <template v-else-if="application.status === 'approved'">

            <div class="notice">
              <b>GPS & Photo Attendance</b>

              <p>
                Submit attendance evidence at the official event
                location. Your GPS reading must have an accuracy
                of 100 meters or better, and you must be within
                250 meters of the organizer's map pin.
              </p>

              <p>
                Your location is requested only when you submit
                a check-in, checkpoint, or check-out. Only you and the organizer of this event can view these private records.
              </p>

              <p>
                Check-out requires the event's attendance hours
                and a valid mid-event checkpoint.
              </p>
            </div>

            <div
              v-if="
                application.attendance_status === 'not_started' ||
                application.attendance_status === 'in_progress'
              "
              class="buttons"
            >
              <button
                v-if="application.attendance_status === 'not_started'"
                :disabled="busy"
                @click="startProof(application, 'check_in')"
              >
                1 · Check In
              </button>

              <template v-else>
                <button
                  :disabled="busy"
                  @click="startProof(application, 'checkpoint')"
                >
                  2 · Mid-Event Proof
                </button>

                <button
                  :disabled="busy"
                  @click="startProof(application, 'check_out')"
                >
                  3 · Check Out
                </button>
              </template>
            </div>

            <!-- ATTENDANCE FORM -->
            <div
              v-if="proofFor === application.id"
              class="proof-form"
            >
              <h3>
                Submit {{ proofKind.replace('_', ' ') }}
              </h3>

              <label :for="`attendancePhoto-${application.id}`">
                Attendance Photo
              </label>

              <input
                :id="`attendancePhoto-${application.id}`"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                :aria-invalid="!!photoError"
                required
                :aria-describedby="`photo-hint-${application.id}`"
                @change="onFile"
              />

              <p :id="`photo-hint-${application.id}`">
                A photo and current GPS location are required.
                Your device will ask for location permission.
              </p>

              <p v-if="photoError" class="warning" role="alert" aria-live="polite">{{ photoError }}</p>
              <p v-if="file" class="file-ready">Selected photo: {{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</p>
              <img v-if="photoPreview" :src="photoPreview" alt="Preview of attendance photo before submission" class="photo-preview" />
              <div class="gps-preview">
                <button type="button" class="secondary" :disabled="busy || gpsBusy" @click="locateNow">
                  {{ gpsBusy ? 'Getting GPS location…' : '⌖ Use My Current Location' }}
                </button>
                <p v-if="gpsError" class="warning" role="alert">{{ gpsError }}</p>
                <p v-if="gpsPoint" class="success" role="status">✓ Current location detected · {{ gpsPoint.latitude.toFixed(6) }}, {{ gpsPoint.longitude.toFixed(6) }} · accuracy ±{{ Math.round(gpsPoint.accuracy) }} m. We will refresh your GPS when submitting.</p>
              </div>

              <div class="buttons">
                <button
                  :disabled="busy || gpsBusy || !file"
                  @click="sendProof(application)"
                >
                  {{
                    busy
                      ? 'Submitting...'
                      : 'Submit GPS + Photo'
                  }}
                </button>

                <button
                  class="secondary"
                  :disabled="busy"
                  @click="cancelProof"
                >
                  Cancel
                </button>
              </div>
            </div>

            <p
              v-if="application.attendance_status === 'submitted'"
              class="notice"
            >
              Attendance submitted. Waiting for final
              organizer verification.
            </p>

            <p
              v-if="application.attendance_status === 'verified'"
              class="success"
            >
              ✓ Your attendance was verified by the campaign organizer.
            </p>

            <p
              v-if="application.attendance_status === 'rejected'"
              class="warning"
            >
              Your attendance could not be verified.
            </p>
          </template>

          <!-- HISTORY -->
          <button
            class="secondary"
            :disabled="historyLoading"
            @click="seeHistory(application)"
          >
            {{
              historyFor === application.id
                ? 'Refresh Attendance History'
                : 'View Attendance History'
            }}
          </button>

          <div
            v-if="historyFor === application.id"
            class="history"
          >
            <h3>Attendance Timeline</h3>

            <p v-if="historyLoading">
              Loading attendance records...
            </p>

            <p v-else-if="historyError" class="warning">
              {{ historyError }}
            </p>

            <p v-else-if="!history.length">
              No attendance evidence recorded yet.
            </p>

            <div
              v-for="check in history"
              :key="check.id"
              class="history-item"
            >
              <b>
                {{ check.kind.replace('_', ' ').toUpperCase() }}
              </b>

              <p>{{ formatDate(check.recorded_at) }}</p>

              <p>
                GPS distance:
                {{ Math.round(check.distance_m) }} meters
              </p>

              <p>
                Accuracy:
                ±{{ Math.round(check.accuracy_m) }} meters
              </p>
            </div>
          </div>

        </article>

      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
import { onBeforeUnmount, ref } from 'vue';

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  onIonViewWillEnter
} from '@ionic/vue';

import { api } from '../services/api';

type ProofKind = 'check_in' | 'checkpoint' | 'check_out';

interface Application {
  id: string;
  campaign_title: string;
  volunteer_date: string | null;
  status: 'pending' | 'approved' | 'rejected';
  attendance_status:
    | 'not_started'
    | 'in_progress'
    | 'submitted'
    | 'verified'
    | 'rejected';
  required_attendance_hours: number;
  rejection_reason?: string | null;
  attendance_review_reason?: string | null;
}

interface AttendanceCheck {
  id: string;
  kind: ProofKind;
  recorded_at: string;
  distance_m: number;
  accuracy_m: number;
}

const applications = ref<Application[]>([]);

const loading = ref(false);
const error = ref('');
const attendanceMessage = ref('');
const busy = ref(false);

const proofFor = ref<string | null>(null);
const proofKind = ref<ProofKind>('check_in');
const file = ref<File | null>(null);
const photoError = ref('');
const photoPreview = ref('');
const gpsError = ref('');
const gpsBusy = ref(false);
const gpsPoint = ref<{latitude:number;longitude:number;accuracy:number} | null>(null);
function clearPreview() {
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
  photoPreview.value = '';
}
onBeforeUnmount(clearPreview);


const historyFor = ref<string | null>(null);
const history = ref<AttendanceCheck[]>([]);
const historyLoading = ref(false);
const historyError = ref('');

let historyRequest = 0;

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
    applications.value = await api<Application[]>(
      '/me/volunteers'
    );
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Unable to load volunteer applications.';
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(load);

// =====================================================
// PHOTO FORM
// =====================================================

function startProof(
  application: Application,
  kind: ProofKind
) {
  attendanceMessage.value = '';
  proofFor.value = application.id;
  proofKind.value = kind;
  file.value = null;
  photoError.value = '';
  gpsError.value = '';
  gpsPoint.value = null;
  clearPreview();
}

function cancelProof() {
  proofFor.value = null;
  file.value = null;
  photoError.value = '';
  gpsError.value = '';
  gpsPoint.value = null;
  clearPreview();
}

function onFile(event: Event) {
  const input = event.target as HTMLInputElement;
  clearPreview();
  photoError.value = '';
  const selected = input.files?.[0] || null;
  if (!selected) { file.value = null; return; }
  if (!['image/jpeg','image/png','image/webp'].includes(selected.type)) {
    photoError.value = 'Choose a JPG, PNG, or WEBP photo.';
    file.value = null;
    input.value = '';
    return;
  }
  if (selected.size < 1 || selected.size > 8 * 1024 * 1024) {
    photoError.value = 'The photo must be under 8 MB and cannot be empty.';
    file.value = null;
    input.value = '';
    return;
  }
  file.value = selected;
  photoPreview.value = URL.createObjectURL(selected);
}

// =====================================================
// DEVICE LOCATION
// =====================================================

async function getLocation(): Promise<GeolocationPosition> {
  if (!navigator.geolocation) {
    throw new Error(
      'GPS is unavailable. Enable location services and use HTTPS or localhost.'
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,

      err => {
        const messages: Record<number, string> = {
          1: 'Location permission denied. Allow location access.',
          2: 'Location unavailable. Check your GPS settings.',
          3: 'GPS timed out. Move to an open area and retry.'
        };

        reject(
          new Error(
            messages[err.code] ||
            'Unable to determine your location.'
          )
        );
      },

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000
      }
    );
  });
}

// =====================================================
// Explicit GPS preview, while proof submission always obtains a fresh position.
async function locateNow() {
  gpsBusy.value = true;
  gpsError.value = '';
  gpsPoint.value = null;
  try {
    const position = await getLocation();
    if (position.coords.accuracy > 100) {
      throw new Error(`GPS accuracy is ±${Math.round(position.coords.accuracy)}m. Move to an open area and retry (maximum ±100m).`);
    }
    gpsPoint.value = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    };
  } catch (err) {
    gpsError.value = err instanceof Error ? err.message : 'Unable to read current location.';
  } finally {
    gpsBusy.value = false;
  }
}

// SUBMIT GPS / PHOTO EVIDENCE
// =====================================================

async function sendProof(application: Application) {
  if (busy.value || !file.value) {
    if (!file.value) photoError.value = 'Select an attendance photo first.';
    return;
  }

  if (
    !['image/jpeg', 'image/png', 'image/webp']
      .includes(file.value.type)
  ) {
    window.alert('Use a JPG, PNG, or WEBP photo.');
    return;
  }

  if (
    file.value.size === 0 ||
    file.value.size > 8 * 1024 * 1024
  ) {
    window.alert('Photo must be between 1 byte and 8 MB.');
    return;
  }

  const confirmed = window.confirm(
    'Submit your current GPS location and selected photo ' +
    'as private attendance evidence?'
  );

  if (!confirmed) return;

  busy.value = true;
  gpsError.value = '';

  try {
    const position = await getLocation();

    if (position.coords.accuracy > 100) {
      throw new Error(
        `GPS accuracy is ±${Math.round(position.coords.accuracy)}m. ` +
        'Move to an open area until accuracy is 100m or better.'
      );
    }

    const body = new FormData();

    body.append('kind', proofKind.value);
    body.append('latitude', String(position.coords.latitude));
    body.append('longitude', String(position.coords.longitude));
    body.append('accuracy', String(position.coords.accuracy));
    body.append('photo', file.value);

    await api(
      `/volunteers/${application.id}/attendance`,
      {
        method: 'POST',
        body
      }
    );

    cancelProof();

    await load();

    if (historyFor.value === application.id) {
      await seeHistory(application);
    }

    attendanceMessage.value = '✓ GPS and photo attendance proof submitted. The event organizer can review it.';

  } catch (err) {
    gpsError.value = err instanceof Error ? err.message : 'Unable to submit attendance proof.';
  } finally {
    busy.value = false;
  }
}

// =====================================================
// VIEW ATTENDANCE HISTORY
// =====================================================

async function seeHistory(application: Application) {
  const request = ++historyRequest;

  historyFor.value = application.id;
  history.value = [];
  historyError.value = '';
  historyLoading.value = true;

  try {
    const result = await api<{
      checks: AttendanceCheck[];
    }>(
      `/volunteers/${application.id}/attendance`
    );

    if (request === historyRequest) {
      history.value = result.checks;
    }

  } catch (err) {
    if (request === historyRequest) {
      historyError.value =
        err instanceof Error
          ? err.message
          : 'Unable to load attendance history.';
    }
  } finally {
    if (request === historyRequest) {
      historyLoading.value = false;
    }
  }
}
</script>

<style scoped>
.rg-notification-highlight{outline:3px solid #f3b75d;outline-offset:4px;}
ion-content {
  --background: #fff8e7;
}

.shell {
  max-width: 950px;
  margin: auto;
  padding: 24px;
  color: #14332a;
}

.back {
  color: #14332a;
  font-weight: 700;
  text-decoration: none;
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
  font-weight: 800;
  letter-spacing: 2px;
}

.hero h1 {
  font: 38px Georgia, serif;
  margin: 10px 0;
}

.hero p {
  line-height: 1.7;
}

.card {
  padding: 22px;
  margin-bottom: 18px;
  border: 1px solid #e4d9c5;
  border-radius: 16px;
  background: #fffdf5;
}

.card h2 {
  font: 26px Georgia, serif;
}

.card p {
  line-height: 1.65;
  font-size: 13px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.badge {
  padding: 7px 13px;
  border-radius: 999px;
  background: #f5e7c6;
  text-transform: capitalize;
  font-weight: 800;
  font-size: 12px;
}

.badge.approved {
  background: #d8ead7;
  color: #25623b;
}

.badge.rejected {
  background: #f9dcd1;
  color: #9c3d2e;
}

.notice {
  padding: 15px;
  margin: 14px 0;
  border-radius: 12px;
  background: #edf2e7;
  font-size: 13px;
}

.warning {
  color: #a83e30;
}

.success {
  color: #22683c;
  font-weight: 800;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0;
}

button {
  padding: 12px 16px;
  border: 0;
  border-radius: 10px;
  background: #14332a;
  color: white;
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
  margin: 8px 0;
}

.proof-form {
  border: 1px solid #dfd3bd;
  border-radius: 12px;
  padding: 18px;
  margin: 16px 0;
}

.proof-form h3,
.history h3 {
  font: 22px Georgia, serif;
}

.proof-form input {
  display: block;
  margin: 10px 0;
  max-width: 100%;
}

.history {
  border-top: 1px solid #e1d9ca;
  margin-top: 16px;
  padding-top: 15px;
}

.history-item {
  padding: 12px;
  border-radius: 10px;
  margin: 10px 0;
  background: #f2f2e9;
}

@media (max-width: 600px) {
  .shell { padding: 14px; }
  .hero { padding: 22px; }
  .hero h1 { font-size: 30px; }
}
.photo-preview{width:100%;max-width:320px;max-height:260px;object-fit:contain;border:1px solid #d9cbb8;border-radius:12px;background:#fff;padding:6px;margin:8px 0}
.gps-preview{background:#edf3ea;border:1px solid #d3e2d0;padding:12px 14px;border-radius:12px;margin:12px 0}
.gps-preview p{overflow-wrap:anywhere;font-size:12px;line-height:1.6}.file-ready{color:#173729;font-weight:700}
</style>