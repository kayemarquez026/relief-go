<template>
  <ion-page class="manage-page">
    <ion-content class="manage-content">
      <main class="manage-wrapper">
        <!-- Back navigation is aligned right and styled as a readable dark-green button. -->
        <div class="manage-top-actions">
          <router-link to="/organizer/campaigns" class="manage-back">
            <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
            <span>Back to My Campaigns</span>
          </router-link>
        </div>

        <section class="manage-hero">
          <div>
            <span class="eyebrow">RELIEFGO ✦ ORGANIZER WORKSPACE</span>
            <h1>Manage your <em>campaign.</em></h1>
            <p>Review your submission, correct rejected entries, or safely delete an unapproved campaign.</p>
          </div>
          <div class="hero-icon">
            <ion-icon :icon="createOutline" />
          </div>
        </section>

        <div v-if="loading" class="manage-card state" role="status">
          <ion-spinner name="crescent" />
          <p>Loading your campaign…</p>
        </div>

        <div v-else-if="errorMessage || !campaign" class="manage-card state" role="alert">
          <ion-icon :icon="alertCircleOutline" />
          <p>{{ errorMessage || 'Campaign not found.' }}</p>
          <router-link to="/organizer/campaigns">Return to campaigns</router-link>
        </div>

        <template v-else>
          <section class="manage-card">
            <span class="eyebrow">CAMPAIGN RECORD</span>
            <div class="campaign-top">
              <div>
                <h2>{{ campaign.title }}</h2>
                <p>{{ campaign.locationAddress }}</p>
              </div>
              <span class="status-pill">{{ campaign.status }}</span>
            </div>
            <p>{{ campaign.description }}</p>
            <div v-if="campaign.status === 'Rejected'" class="rejection-reason" role="alert">
              <strong>Reason for rejection</strong>
              <p>{{ campaign.rejectionReason || 'Please review the campaign details and supporting documents.' }}</p>
            </div>
            <dl>
              <div>
                <dt>Category</dt>
                <dd>{{ campaign.category }}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{{ formatDate(campaign.createdAt) }}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{{ campaign.type === 'volunteer_event' ? 'Community event' : 'Fundraiser' }}</dd>
              </div>
            </dl>
          </section>

          <section class="manage-grid">
            <article class="manage-card">
              <span class="card-symbol"><ion-icon :icon="createOutline" /></span>
              <h2>Edit details</h2>
              <p v-if="canEdit">
                An administrator requested changes. Edit your details and proofs on the dedicated form page, then resubmit for approval.
              </p>
              <p v-else>
                Editing is available only after an administrator rejects a submission. Approved campaigns stay locked to protect published records.
              </p>
              <router-link
                v-if="canEdit"
                class="manage-button"
                :to="`/organizer/campaigns/${campaign.id}/edit`"
              >
                <ion-icon :icon="createOutline" />
                Open edit form
                <ion-icon :icon="arrowForwardOutline" />
              </router-link>
              <div v-else class="disabled-hint">
                <ion-icon :icon="lockClosedOutline" />
                Editing locked for this status.
              </div>
            </article>

            <article class="manage-card delete-card">
              <span class="card-symbol"><ion-icon :icon="trashOutline" /></span>
              <h2>Delete campaign</h2>
              <p v-if="canDelete">
                Permanently delete this pending or rejected submission only if no donations, expenses, or volunteer records exist.
              </p>
              <p v-else>
                Deleting active or completed campaigns is disabled to preserve donation history, transparency, and audit records.
              </p>
              <template v-if="canDelete">
                <label for="confirm-delete">Type <strong>DELETE</strong> to confirm</label>
                <input
                  id="confirm-delete"
                  v-model="confirmation"
                  class="manage-input"
                  placeholder="DELETE"
                  autocomplete="off"
                  maxlength="6"
                />
                <p v-if="deleteError" class="delete-error" role="alert">{{ deleteError }}</p>
                <button
                  type="button"
                  class="delete-button"
                  :disabled="confirmation !== 'DELETE' || deleting"
                  @click="confirmDelete"
                >
                  <ion-spinner v-if="deleting" name="crescent" />
                  <ion-icon v-else :icon="trashOutline" />
                  {{ deleting ? 'Deleting…' : 'Permanently Delete' }}
                </button>
              </template>
              <div v-else class="disabled-hint">
                <ion-icon :icon="lockClosedOutline" />
                Delete unavailable for this status.
              </div>
            </article>
          </section>
        </template>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSpinner,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  alertCircleOutline,
  arrowBackOutline,
  arrowForwardOutline,
  createOutline,
  lockClosedOutline,
  trashOutline,
} from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { getCampaignRecord, deleteMyCampaign } from '../services/campaignService';
import { formatDate } from '../utils/format';
import type { Campaign } from '../models/Campaign';
import { confirmAction } from '../utils/ui';

const route = useRoute();
const router = useRouter();

const campaign = ref<Campaign | null>(null);
const loading = ref(true);
const errorMessage = ref('');
const deleteError = ref('');
const confirmation = ref('');
const deleting = ref(false);

const canEdit = computed(() => campaign.value?.status === 'Rejected');
const canDelete = computed(() =>
  ['Rejected', 'Pending Approval'].includes(campaign.value?.status || '')
);

onIonViewWillEnter(async () => {
  loading.value = true;
  errorMessage.value = '';
  confirmation.value = '';
  deleteError.value = '';

  try {
    const record = await getCampaignRecord(String(route.params.id));
    if (!record || record.organizerId !== currentUser.value?.uid) {
      errorMessage.value = 'Campaign not found or not owned by this account.';
      campaign.value = null;
    } else {
      campaign.value = record;
    }
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Unable to load the campaign.';
  } finally {
    loading.value = false;
  }
});

async function confirmDelete() {
  if (!campaign.value || !canDelete.value || confirmation.value !== 'DELETE' || deleting.value) return;

  if (!await confirmAction(
    'Delete campaign',
    `Permanently delete "${campaign.value.title}"? This cannot be undone.`,
    'Yes, Delete'
  )) return;

  deleting.value = true;
  deleteError.value = '';

  try {
    await deleteMyCampaign(campaign.value.id);
    await router.replace('/organizer/campaigns');
  } catch (e) {
    deleteError.value = e instanceof Error ? e.message : 'Could not delete the campaign.';
  } finally {
    deleting.value = false;
  }
}
</script>

<style scoped>
.rejection-reason {
  background: #fff0e8;
  border: 1px solid #d99884;
  border-radius: 12px;
  padding: 13px 16px;
  margin: 15px 0;
}
.rejection-reason strong { color: #95362e; }
.rejection-reason p { margin: 5px 0 0; color: #8b3933; }

.manage-page {
  color: #173729;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.manage-content { --background: #fbf0dc; }
.manage-wrapper {
  width: min(1060px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 60px;
}

/* FIX: Align the Back to My Campaigns button at the top right. */
.manage-top-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 18px;
}
.manage-back,
.manage-back:link,
.manage-back:visited {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 46px;
  padding: 12px 19px;
  border: 1px solid #173729;
  border-radius: 12px;
  background: #173729;
  color: #fffaf0;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: .15px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(17, 43, 32, .13);
  transition: background-color .2s ease, box-shadow .2s ease;
}
.manage-back ion-icon {
  flex: none;
  color: #f3b75d;
  font-size: 19px;
}
.manage-back:hover {
  background: #29543e;
  border-color: #29543e;
  color: #fff;
  box-shadow: 0 6px 16px rgba(17, 43, 32, .19);
}
.manage-back:focus-visible {
  outline: 3px solid #be563b;
  outline-offset: 3px;
}
.manage-back:active { background: #112b20; }

.manage-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 34px;
  background: linear-gradient(110deg, #173729, #112b20);
  border-radius: 17px;
  color: #fff8e9;
  margin-bottom: 20px;
}
.manage-hero h1 {
  font: normal clamp(30px, 3.8vw, 49px) Georgia, serif;
  margin: 11px 0;
}
.manage-hero h1 em { color: #f3b75d; }
.manage-hero p {
  color: #e4eade;
  margin: 0;
  max-width: 650px;
  font-size: 14px;
  line-height: 1.6;
}
.eyebrow {
  font-size: 10px;
  letter-spacing: 1.5px;
  font-weight: 800;
  color: #be563b;
}
.manage-hero .eyebrow { color: #f3b75d; }
.hero-icon { font-size: 48px; color: #f3b75d; }
.manage-card {
  background: #fffdf6;
  border: 1px solid #e5dccb;
  border-radius: 15px;
  padding: 24px;
  box-shadow: 0 6px 24px #193d2a0d;
  margin-bottom: 17px;
}
.manage-card h2 { font: normal 25px Georgia, serif; margin: 8px 0 12px; }
.manage-card p {
  color: #58675e;
  font-size: 13px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.campaign-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.campaign-top h2 { font-size: 29px; }
.status-pill {
  background: #e4eddf;
  color: #173729;
  padding: 8px 12px;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}
.manage-card dl {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  border-top: 1px solid #eee2ce;
  margin: 20px 0 0;
  padding-top: 18px;
}
.manage-card dt {
  font-size: 10px;
  color: #997e60;
  letter-spacing: 1px;
  font-weight: 800;
  text-transform: uppercase;
}
.manage-card dd { margin: 5px 0 0; font-weight: 700; font-size: 13px; }
.manage-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 17px; }
.manage-grid .manage-card { margin: 0; }
.card-symbol {
  display: grid;
  place-items: center;
  width: 43px;
  height: 43px;
  background: #f6e5d6;
  color: #b45e43;
  border-radius: 11px;
  font-size: 24px;
}
.manage-button,
.delete-button {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  background: #173729;
  color: #fff9ed;
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
  padding: 13px 17px;
  cursor: pointer;
  margin-top: 12px;
}
.manage-button:hover { background: #2e5b44; }
.delete-card { border-color: #eacbbb; }
.delete-card .card-symbol { background: #ffebe6; }
.delete-card label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-top: 15px;
}
.manage-input {
  display: block;
  width: 100%;
  max-width: 300px;
  min-height: 42px;
  border: 1px solid #d6bbaa;
  border-radius: 10px;
  margin-top: 8px;
  padding: 10px;
  background: #fff;
}
.delete-button { background: #a63830; }
.delete-button:disabled { opacity: .42; cursor: not-allowed; }
.disabled-hint {
  display: flex;
  gap: 7px;
  align-items: center;
  background: #f3eadb;
  color: #625f56;
  padding: 13px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  margin-top: 18px;
}
.delete-error { color: #a63830 !important; }
.state { min-height: 145px; text-align: center; }
.state ion-icon { font-size: 30px; color: #b66044; }

@media (max-width: 700px) {
  .manage-grid { grid-template-columns: 1fr; }
  .manage-hero { padding: 22px; }
  .hero-icon { display: none; }
  .manage-card { padding: 17px; }
  .status-pill { white-space: normal; }
  .manage-top-actions { justify-content: flex-end; margin-bottom: 15px; }
  .manage-back { min-height: 44px; padding: 11px 14px; font-size: 11px; }
  .manage-back ion-icon { font-size: 18px; }
}

@media (prefers-reduced-motion: reduce) {
  .manage-back { transition: none; }
}
</style>