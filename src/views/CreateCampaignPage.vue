<template>
  <ion-page class="rg-page">
    <!-- Compact error feedback: dismissed automatically after 3 seconds. -->
    <transition name="rg-error-fade">
      <div v-if="formErrors.length" class="rg-error-toast" role="alert" aria-live="assertive" aria-atomic="true">
        <ion-icon :icon="alertCircleOutline" class="rg-error-toast-icon" aria-hidden="true" />
        <div class="rg-error-toast-body">
          <strong>PLEASE CHECK YOUR FORM</strong>
          <ul>
            <li v-for="(message, index) in formErrors.slice(0, 4)" :key="`${index}-${message}`">{{ message }}</li>
          </ul>
          <small v-if="formErrors.length > 4">+{{ formErrors.length - 4 }} more field(s) to review.</small>
        </div>
        <button type="button" class="rg-error-dismiss" aria-label="Dismiss error messages" @click="dismissFormErrors">
          <ion-icon :icon="closeOutline" aria-hidden="true" />
        </button>
      </div>
    </transition>
    <ion-header class="rg-header">
      <nav class="rg-navbar" aria-label="Campaign form navigation">
        <router-link to="/dashboard" class="rg-brand" aria-label="ReliefGO home">
          Relief<span>GO</span><b>♥</b>
        </router-link>
        <router-link to="/organizer/campaigns" class="nav-back">
          <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
          <span>BACK TO MY CAMPAIGNS</span>
        </router-link>
      </nav>
    </ion-header>

    <ion-content class="rg-content">
      <div class="page-shell">
        <main class="main-content">
          <section class="hero" aria-labelledby="form-title">
            <div class="hero-text">
              <p class="kicker">YOUR BAYANIHAN JOURNEY <span>✦</span></p>
              <h1 id="form-title">{{ isEdit ? 'Edit your' : 'Start a' }} <em>campaign.</em></h1>
              <p>{{ isEdit ? 'Keep your campaign information accurate so supporters know the impact of their giving.' : 'Tell your story, share who needs help, and bring the spirit of bayanihan to life.' }}</p>
            </div>
            <div class="hero-badge" aria-hidden="true">
              <ion-icon :icon="heartOutline" />
              <span>SMALL ACTS.<br />BIG HEARTS.</span>
            </div>
          </section>

          <div v-if="loading" class="feedback-card" aria-live="polite">
            <ion-spinner name="crescent" />
            <h2>Loading campaign...</h2>
            <p>Retrieving your information.</p>
          </div>

          <div v-else-if="blockMessage" class="feedback-card" role="alert">
            <ion-icon :icon="alertCircleOutline" class="feedback-icon" />
            <h2>Campaign unavailable</h2>
            <p>{{ blockMessage }}</p>
            <router-link to="/organizer/campaigns" class="secondary-link">BACK TO MY CAMPAIGNS <ion-icon :icon="arrowForwardOutline" /></router-link>
          </div>

          <form v-else class="campaign-form" @submit.prevent="handleSubmit" novalidate>
            <div class="notice"><ion-icon :icon="informationCircleOutline" aria-hidden="true" />
              <p>New campaigns and events are submitted for administrator review. Your identity documents remain private. Rejected submissions can be edited and resubmitted.</p>
            </div>

            <section class="form-section" aria-label="Choose campaign type">
              <p class="section-eyebrow">WHAT WILL YOU ORGANIZE?</p>
              <div class="form-grid">
                <div class="field-group full">
                  <label for="campaign-type">CAMPAIGN TYPE *</label>
                  <select id="campaign-type" v-model="campaignType" class="rg-native-field" :disabled="isEdit" @change="onCampaignTypeChange">
                    <option value="fundraiser">Fundraising campaign</option>
                    <option v-if="isEdit && campaignType === 'volunteer_event'" value="volunteer_event">Legacy community event</option>
                  </select>
                  <small class="field-hint">Every new campaign includes a donation goal. Recruiting volunteers is optional.</small>
                </div>
              </div>
            </section>
            <section class="form-section" aria-labelledby="basics-title">
              <div class="section-title-row"><span class="step">01</span><div><p class="section-eyebrow">SHARE YOUR STORY</p><h2 id="basics-title">Campaign <em>details.</em></h2></div></div>
              <div class="form-grid">
                <div class="field-group full"><label for="campaign-title">CAMPAIGN TITLE *</label>
                  <ion-input id="campaign-title" v-model="title" aria-label="Campaign title" fill="outline" placeholder="e.g. Help families rebuild after the storm" :maxlength="120" class="rg-field" />
                  <small class="field-hint compact-hint">Any words, numbers, or punctuation are allowed (up to 120 characters).</small>
                </div>
                <div class="field-group full">
                  <label for="campaign-category">{{ campaignType === 'volunteer_event' ? 'EVENT CATEGORY *' : 'CAMPAIGN CATEGORY *' }}</label>
                  <ion-select id="campaign-category" v-model="category" aria-label="Category" fill="outline" interface="popover" placeholder="Choose a category" class="rg-field">
                    <ion-select-option v-for="item in (campaignType === 'volunteer_event' ? EVENT_CATEGORIES : CAMPAIGN_CATEGORIES)" :key="item" :value="item">{{ item }}</ion-select-option>
                  </ion-select>
                  <small v-if="campaignType === 'volunteer_event'" class="field-hint">This describes the event itself (e.g. Healthcare or Relief Assistance), not the volunteers' tasks.</small>
                </div>
                <div class="field-group full"><label for="campaign-description">CAMPAIGN DESCRIPTION *</label>
                  <ion-textarea id="campaign-description" v-model="description" aria-label="Campaign description" fill="outline" :auto-grow="true" :rows="4" placeholder="Explain your cause, why it matters, and how funds will be used..." class="rg-field rg-textarea" />
                  <small class="word-count" :class="{ 'word-limit': countWords(description) >= MAX_WORDS }">{{ countWords(description) }} / {{ MAX_WORDS }} words</small>
                </div>
              </div>
            </section>

            <section class="form-section" aria-labelledby="beneficiary-title">
              <div class="section-title-row"><span class="step">02</span><div><p class="section-eyebrow">PEOPLE AT THE HEART OF IT</p><h2 id="beneficiary-title">Who will <em>benefit?</em></h2></div></div>
              <div class="form-grid">
                <div class="field-group full"><label for="beneficiary-name">BENEFICIARY NAME OR ORGANIZATION *</label>
                  <ion-textarea id="beneficiary-name" v-model="beneficiaryName" aria-label="Beneficiary name or organization" fill="outline" :auto-grow="true" :rows="2" placeholder="Name of the family, group, or organization" class="rg-field rg-textarea rg-name-textarea" />
                  <small class="word-count" :class="{ 'word-limit': countWords(beneficiaryName) >= MAX_WORDS }">{{ countWords(beneficiaryName) }} / {{ MAX_WORDS }} words</small>
                </div>
                <div class="field-group full"><label for="beneficiary-info">BENEFICIARY INFORMATION *</label>
                  <ion-textarea id="beneficiary-info" v-model="beneficiaryInfo" aria-label="Beneficiary information" fill="outline" :auto-grow="true" :rows="3" placeholder="Who needs help, and how will this campaign support them?" class="rg-field rg-textarea" />
                  <small class="word-count" :class="{ 'word-limit': countWords(beneficiaryInfo) >= MAX_WORDS }">{{ countWords(beneficiaryInfo) }} / {{ MAX_WORDS }} words</small>
                </div>
              </div>
            </section>

            <section v-if="campaignType === 'fundraiser'" class="form-section" aria-labelledby="goal-title">
              <div class="section-title-row"><span class="step">03</span><div><p class="section-eyebrow">SET A CLEAR GOAL</p><h2 id="goal-title">Goal &amp; <em>timeline.</em></h2></div></div>
              <div class="form-grid">
                <div class="field-group full">
                  <label for="goal-preset">FUNDRAISING GOAL (₱) *</label>
                  <div class="goal-picker-grid">
                    <div class="goal-picker-item">
                      <span class="input-caption">QUICK AMOUNT</span>
                      <select id="goal-preset" v-model="goalPreset" class="rg-native-field goal-preset" aria-label="Choose a fundraising goal amount" @change="onGoalPresetChange">
                        <option value="" disabled>Choose an amount</option>
                        <option v-for="amount in GOAL_PRESETS" :key="amount" :value="String(amount)">{{ formatCurrency(amount) }}</option>
                        <option value="custom">Custom amount</option>
                      </select>
                    </div>
                    <div class="goal-picker-item">
                      <label for="goal-amount" class="input-caption">AMOUNT (EDITABLE)</label>
                      <div class="currency-input-wrap">
                        <span class="currency-symbol" aria-hidden="true">₱</span>
                        <input id="goal-amount" type="text" inputmode="decimal" autocomplete="off" class="rg-native-field currency-input"
                          :value="goalDisplay" placeholder="0.00" aria-label="Fundraising goal amount in pesos"
                          @input="onGoalAmountInput" @blur="onGoalAmountBlur" />
                      </div>
                    </div>
                  </div>
                  <small class="field-hint goal-helper">Choose a suggested goal or edit the amount. It is displayed with commas and two decimal places, e.g. ₱10,000.00. Maximum: ₱10,000,000.00.</small>
                </div>
                <div class="field-group">
                  <label for="start-date">START DATE *</label>
                  <input id="start-date" v-model="startDate" aria-label="Select campaign start date" type="date"
                    class="rg-native-field rg-calendar-field" :min="today()" required @change="onStartDateChange" />
                  <small class="field-hint compact-hint">Select today or a future date (Philippine time).</small>
                </div>
                <div class="field-group">
                  <label for="deadline">DEADLINE *</label>
                  <input id="deadline" v-model="deadline" aria-label="Select campaign deadline" type="date"
                    class="rg-native-field rg-calendar-field" :min="minimumDeadline" required @change="onDeadlineChange" />
                  <small class="field-hint compact-hint">Deadline must be later than the start date.</small>
                </div>
              </div>
            </section>

            <section class="form-section" aria-labelledby="event-title">
              <div class="section-title-row">
                <span class="step">04</span>
                <div>
                  <p class="section-eyebrow">ORGANIZER REQUIREMENTS</p>
                  <h2 id="event-title">Optional <em>volunteers.</em></h2>
                </div>
              </div>
              <div class="form-grid">
                <div v-if="needsVolunteersChoice === 'yes' || campaignType === 'volunteer_event'" class="field-group full">
                  <label>VOLUNTEER EVENT DATE &amp; TIME *</label>
                  <div class="event-datetime-grid">
                    <div class="goal-picker-item">
                      <label for="event-date" class="input-caption">EVENT DATE</label>
                      <input id="event-date" v-model="volunteerEventDate" type="date" class="rg-native-field rg-calendar-field"
                        :min="today()" aria-label="Select volunteer event date" required @change="onVolunteerDateChange" />
                    </div>
                    <div class="goal-picker-item">
                      <label for="event-time" class="input-caption">EVENT TIME</label>
                      <input id="event-time" v-model="volunteerEventTime" type="time" class="rg-native-field rg-calendar-field"
                        :min="minimumVolunteerClock" :disabled="!volunteerEventDate || eventTimeUnavailableToday" aria-label="Select volunteer event time" required @change="onVolunteerTimeChange" />
                    </div>
                  </div>
                  <small class="field-hint compact-hint">Choose a date first, then a time. Past dates and times are not allowed (Philippine time).</small>
                  <small v-if="eventTimeUnavailableToday" class="field-hint compact-hint">No future time is left today. Please choose tomorrow or a later date.</small>
                  <small v-if="eventDateTimeError" class="inline-error" role="alert">{{ eventDateTimeError }}</small>
                </div>
                <div class="field-group full">
                  <label for="needs-volunteers">RECRUIT VOLUNTEERS? (OPTIONAL)</label>
                  <select id="needs-volunteers" v-model="needsVolunteersChoice" class="rg-native-field" @change="onVolunteerNeedChange">
                    <option disabled value="">Choose yes or no</option>
                    <option value="yes">Yes — we are recruiting volunteers</option>
                    <option value="no">No — donations only</option>
                  </select>
                  <small v-if="needsVolunteersChoice === ''" class="field-hint">Choose whether people may apply to volunteer for this event.</small>
                </div>
                <template v-if="needsVolunteersChoice === 'yes'">
                  <div class="field-group full">
                    <label for="volunteer-help-category">WHAT KIND OF HELP DO YOU NEED? *</label>
                    <select id="volunteer-help-category" v-model="volunteerHelpCategory" class="rg-native-field" required>
                      <option disabled value="">Choose a volunteer help category</option>
                      <option v-for="help in VOLUNTEER_HELP_CATEGORIES" :key="help" :value="help">{{ help }}</option>
                    </select>
                    <small class="field-hint">Example: Healthcare event → Healthcare / Medical volunteers.</small>
                  </div>
                  <div class="field-group full">
                    <label for="duties">VOLUNTEER DUTIES *</label>
                    <ion-textarea id="duties" v-model="volunteerDuties" class="rg-field rg-textarea" fill="outline" :auto-grow="true" :rows="3" placeholder="Describe specific volunteer tasks, e.g. manage the patient queue and help the medical team" />
                    <small class="word-count" :class="{ 'word-limit': countWords(volunteerDuties) >= MAX_WORDS }">{{ countWords(volunteerDuties) }} / {{ MAX_WORDS }} words</small>
                  </div>
                  <div class="field-group full">
                    <label for="requirements">VOLUNTEER QUALIFICATIONS / REQUIREMENTS *</label>
                    <ion-textarea id="requirements" v-model="volunteerRequirements" class="rg-field rg-textarea" fill="outline" :auto-grow="true" :rows="3" placeholder="Describe qualifications, safety rules, or experience required" />
                    <small class="word-count" :class="{ 'word-limit': countWords(volunteerRequirements) >= MAX_WORDS }">{{ countWords(volunteerRequirements) }} / {{ MAX_WORDS }} words</small>
                  </div>
                  <div class="field-group">
                    <label for="event-slots">NUMBER OF VOLUNTEERS NEEDED *</label>
                    <input id="event-slots" v-model.number="volunteerSlots" type="number" min="1" max="10000" step="1" inputmode="numeric" placeholder="Enter the number of volunteers" class="rg-native-field" required />
                    <small class="field-hint compact-hint">Numbers only. Enter 1 to 10,000 volunteers.</small>
                  </div>
                </template>
                <div v-else-if="needsVolunteersChoice === 'no'" class="field-group full">
                  <p class="event-info">No volunteer recruitment is needed. Donors can still support your campaign. No volunteer fields are required.</p>
                </div>
              </div>
            </section>
            <section class="form-section" aria-labelledby="location-title">
              <div class="section-title-row"><span class="step">05</span><div><p class="section-eyebrow">WHERE HELP IS NEEDED</p><h2 id="location-title">Campaign <em>location.</em></h2></div></div>
              <div class="field-group"><label for="location-address">LOCATION ADDRESS *</label>
                <div class="location-search-row">
                  <input id="location-address" v-model="locationAddress" class="rg-native-field location-address-field" :maxlength="100" placeholder="Search street, barangay, city, or landmark" autocomplete="street-address" @input="onLocationAddressInput" @keydown.enter.prevent="searchLocation" />
                  <ion-button type="button" class="location-search-btn" :disabled="searchingLocation || locationAddress.trim().length < 3" @click="searchLocation"><ion-icon slot="start" :icon="searchOutline" />{{ searchingLocation ? 'Searching…' : 'Search' }}</ion-button>
                  <ion-button type="button" fill="outline" class="location-gps-btn" :disabled="findingLocation" @click="useCurrentLocation"><ion-icon slot="start" :icon="locateOutline" />{{ findingLocation ? 'Locating…' : 'Use Current Location' }}</ion-button>
                </div>
                <p v-if="locationStatus" class="location-status" :class="{ 'location-status-error': locationError }" role="status">{{ locationStatus }}</p>
                <ul v-if="locationResults.length" class="location-result-list" aria-label="Location search results">
                  <li v-for="(item, index) in locationResults" :key="`${item.lat}-${item.lng}-${index}`"><button type="button" @click="chooseLocation(item)"><ion-icon :icon="locationOutline" aria-hidden="true" /><span>{{ item.label }}</span><ion-icon :icon="arrowForwardOutline" aria-hidden="true" /></button></li>
                </ul>
              </div>
              <p class="field-hint">Search then choose an address, use GPS (permission required), or tap the map to position the pin. Check the address before submitting. Map/location search requires internet. Location data © OpenStreetMap contributors.</p>
              <div class="map-frame"><LocationPicker v-model="pin" /></div>
            </section>

            <section class="form-section" aria-labelledby="image-title">
              <div class="section-title-row"><span class="step">06</span><div><p class="section-eyebrow">HELP SUPPORTERS CONNECT</p><h2 id="image-title">Campaign <em>photo.</em></h2></div></div>
              <div class="field-group"><label for="campaign-image">IMAGE LINK (OPTIONAL)</label>
                <ion-input id="campaign-image" v-model="imageUrl" aria-label="Campaign image URL" type="url" fill="outline" :maxlength="1000" placeholder="https://example.com/photo.jpg" class="rg-field" />
              </div>
              <p class="field-hint">You can upload a cover photo below. Identity documents are private, and never published on the campaign page.</p>
              <img v-if="showPreview" :src="imageUrl.trim()" alt="Campaign preview" class="preview" />
            </section>

            <section class="form-section" aria-labelledby="evidence-title">
              <div class="section-title-row"><span class="step">07</span><div><p class="section-eyebrow">ACCOUNTABILITY FIRST</p><h2 id="evidence-title">Verification &amp; <em>payment.</em></h2></div></div>
              <p class="field-hint">All four documents are required on first submission (JPG, PNG, WebP or PDF, maximum 8 MB per file). The ID and clearance remain private to you and administrators.</p>
              <div class="form-grid">
                <div class="field-group"><label for="contact-number">CONTACT NUMBER *</label><input id="contact-number" v-model="contactPhone" class="rg-native-field" inputmode="numeric" maxlength="11" placeholder="09XXXXXXXXX" @blur="onContactPhoneBlur" /><small v-if="contactPhoneError" class="inline-error" role="status">{{ contactPhoneError }}</small></div>
                <div v-if="campaignType==='fundraiser'" class="field-group"><label for="payout-method">PAYOUT METHOD *</label><select id="payout-method" v-model="payoutMethod" class="rg-native-field"><option value="GCash">GCash</option><option value="Maya">PayMaya / Maya</option><option value="Bank Transfer">Bank transfer</option></select></div>
                <div v-if="campaignType==='fundraiser'" class="field-group"><label for="payout-name">ACCOUNT HOLDER NAME *</label><input id="payout-name" v-model="payoutName" class="rg-native-field" maxlength="100" placeholder="Account holder full name" /></div>
                <div v-if="campaignType==='fundraiser'" class="field-group"><label for="payout-number">ACCOUNT NUMBER *</label><input id="payout-number" v-model="payoutNumber" class="rg-native-field" inputmode="numeric" maxlength="25" placeholder="Enter payout number" /></div>
                <div class="field-group"><label for="valid-id">VALID ID {{ isEdit ? '(replace if needed)' : '*' }}</label><input id="valid-id" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="rg-native-field" @change="setFile('validId', $event)" /></div>
                <div class="field-group"><label for="clearance">BARANGAY CLEARANCE / LEGITIMACY PROOF {{ isEdit ? '' : '*' }}</label><input id="clearance" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="rg-native-field" @change="setFile('barangayClearance', $event)" /></div>
                <div class="field-group"><label for="situation">PHOTO OF THE SITUATION {{ isEdit ? '' : '*' }}</label><input id="situation" type="file" accept="image/jpeg,image/png,image/webp" class="rg-native-field" @change="setFile('situationPhoto', $event)" /></div>
                <div class="field-group"><label for="legitimacy">BENEFICIARY / EVENT LEGITIMACY PROOF {{ isEdit ? '' : '*' }}</label><input id="legitimacy" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="rg-native-field" @change="setFile('eligibilityProof', $event)" /></div>
                <div class="field-group full"><label for="cover-image">CAMPAIGN COVER IMAGE (OPTIONAL)</label><input id="cover-image" type="file" accept="image/jpeg,image/png,image/webp" class="rg-native-field" @change="setFile('cover', $event)" /></div>
              </div>
              <p class="field-hint">Financial budget is initially the full goal under “Campaign needs and relief assistance.” The administrator must confirm that the goal and evidence are appropriate before approval.</p>
            </section>

            <div class="submit-row">
              <div><p class="submit-kicker">READY TO MAKE A DIFFERENCE?</p><strong>{{ isEdit ? 'Resubmit your campaign for review.' : 'Your bayanihan story starts here.' }}</strong></div>
              <ion-button class="submit-button" type="submit" :disabled="saving">
                <ion-spinner v-if="saving" name="crescent" />
                <template v-else>{{ isEdit ? 'SAVE & RESUBMIT' : 'SUBMIT FOR REVIEW' }} <ion-icon slot="end" :icon="arrowForwardOutline" /></template>
              </ion-button>
            </div>
          </form>
        </main>
        <footer class="rg-footer"><span>© {{ new Date().getFullYear() }} ReliefGO</span><span>Stories of bayanihan live here.</span></footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonContent,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import { alertCircleOutline, arrowBackOutline, arrowForwardOutline, heartOutline, informationCircleOutline, searchOutline, locateOutline, locationOutline, closeOutline } from 'ionicons/icons';
import LocationPicker from '../components/LocationPicker.vue';
import { currentUser } from '../services/authState';
import {
  createCampaign,
  getCampaignRecord,
  updateCampaign,
} from '../services/campaignService';
import type { MapPoint } from '../services/googleMaps';
import { CAMPAIGN_CATEGORIES, EDITABLE_STATUSES } from '../models/Campaign';
import type { Campaign, CampaignCategory } from '../models/Campaign';
import { showToast } from '../utils/ui';

const route = useRoute();
const router = useRouter();

// Read once when the page is created, so it does not change while navigating away
const campaignId = typeof route.params.id === 'string' ? route.params.id : '';
const isEdit = campaignId !== '';

const title = ref('');
const campaignType = ref<'fundraiser' | 'volunteer_event'>('fundraiser');
// Event categories describe the kind of event. Volunteer assistance is a separate subcategory.
// Kept inside this .vue file so no other project file needs editing for the form UI.
const EVENT_CATEGORIES = [
  'Healthcare', 'Medical Outreach', 'Medical Assistance',
  'Disaster Relief', 'Emergency Relief', 'Relief Assistance',
  'Food and Basic Needs', 'Education', 'Educational Assistance',
  'Community Assistance', 'Environmental Assistance',
  'Livelihood Assistance', 'Other Assistance', 'Other',
] as const;
const VOLUNTEER_HELP_CATEGORIES = [
  'Healthcare / Medical', 'Food & Relief Distribution',
  'Emergency Response', 'Education & Tutoring',
  'Logistics & Transportation', 'Community Outreach',
  'Environmental Cleanup', 'Construction & Repair',
  'General Assistance', 'Other Assistance',
] as const;
type VolunteerHelpCategory = typeof VOLUNTEER_HELP_CATEGORIES[number];
const needsVolunteersChoice = ref<'' | 'yes' | 'no'>('no');
const volunteerHelpCategory = ref<VolunteerHelpCategory | ''>('');
const volunteerDuties = ref('');
const volunteerRequirements = ref('');
const volunteerDate = ref(''); // Combined YYYY-MM-DDTHH:mm, kept for existing campaignService
const volunteerEventDate = ref('');
const volunteerEventTime = ref('');
const eventDateTimeError = ref('');
let eventErrorTimer: ReturnType<typeof setTimeout> | null = null;
watch(eventDateTimeError, (message) => {
  if (eventErrorTimer) clearTimeout(eventErrorTimer);
  eventErrorTimer = null;
  if (message) {
    showFormError(message);
    eventErrorTimer = setTimeout(() => { eventDateTimeError.value = ''; eventErrorTimer = null; }, 3000);
  }
});
const volunteerSlots = ref<number | null>(null);

function clearVolunteerFields() {
  volunteerHelpCategory.value = '';
  volunteerDuties.value = '';
  volunteerRequirements.value = '';
  volunteerSlots.value = null;
}
function onCampaignTypeChange() {
  category.value = '';
  needsVolunteersChoice.value = 'no';
  volunteerDate.value = '';
  volunteerEventDate.value = '';
  volunteerEventTime.value = '';
  eventDateTimeError.value = '';
  clearVolunteerFields();
}
function onVolunteerNeedChange() {
  if (needsVolunteersChoice.value !== 'yes') {
    clearVolunteerFields();
    volunteerDate.value = '';
    volunteerEventDate.value = '';
    volunteerEventTime.value = '';
    eventDateTimeError.value = '';
  }
}
const category = ref<CampaignCategory | ''>('');
const description = ref('');
const beneficiaryName = ref('');
const beneficiaryInfo = ref('');

// Limits count WORDS rather than characters; existing service receives plain strings.
const MAX_WORDS = 500;
function countWords(value: string): number {
  return value.trim() ? (value.trim().match(/\S+/gu) || []).length : 0;
}
function limitWords(value: string): string {
  const matches = Array.from(value.matchAll(/\S+/gu));
  if (matches.length <= MAX_WORDS) return value;
  const last = matches[MAX_WORDS - 1];
  return value.slice(0, (last.index ?? 0) + last[0].length).trimEnd();
}
// Watchers cover typing AND pasting, without rejecting punctuation, numbers or symbols.
for (const [fieldName, field] of [
  ['Campaign description', description],
  ['Beneficiary name or organization', beneficiaryName],
  ['Beneficiary information', beneficiaryInfo],
  ['Volunteer duties', volunteerDuties],
  ['Volunteer qualifications / requirements', volunteerRequirements],
] as const) {
  watch(field, (value) => {
    const shortened = limitWords(value || '');
    if (shortened !== value) {
      field.value = shortened;
      showFormError(`${fieldName}: maximum ${MAX_WORDS} words allowed.`);
    }
  }, { flush: 'sync' });
}

const goalAmount = ref(''); // Normalized decimal string; no commas sent to the backend
const goalDisplay = ref(''); // Human-readable amount shown in the field
const goalPreset = ref('');
const GOAL_PRESETS = [1000, 3000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000] as const;
const pesoFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
function formatCurrency(amount: number): string {
  return `₱${pesoFormatter.format(amount)}`;
}
function normalizedGoalInput(text: string): string {
  // Keep digits and one decimal point; prevent more than two centavo digits.
  const cleaned = text.replace(/[^\d.]/g, '');
  const pointIndex = cleaned.indexOf('.');
  if (pointIndex === -1) return cleaned;
  return cleaned.slice(0, pointIndex + 1) + cleaned.slice(pointIndex + 1).replace(/\./g, '').slice(0, 2);
}
function groupAmount(text: string): string {
  if (!text) return '';
  const [integer, decimals] = text.split('.');
  const grouped = (integer || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimals === undefined ? grouped : `${grouped}.${decimals}`;
}
function onGoalPresetChange() {
  if (!goalPreset.value || goalPreset.value === 'custom') {
    if (goalPreset.value === 'custom' && !goalAmount.value) goalDisplay.value = '';
    return;
  }
  const amount = Number(goalPreset.value);
  if (!Number.isFinite(amount)) return;
  goalAmount.value = amount.toFixed(2);
  goalDisplay.value = pesoFormatter.format(amount);
}
function onGoalAmountInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const caret = input.selectionStart ?? input.value.length;
  const beforeCaret = normalizedGoalInput(input.value.slice(0, caret));
  const normalized = normalizedGoalInput(input.value);
  goalAmount.value = normalized;
  goalDisplay.value = groupAmount(normalized);
  goalPreset.value = normalized ? (GOAL_PRESETS.some(n => n === Number(normalized)) ? String(Number(normalized)) : 'custom') : '';
  // Restore caret after inserting grouping commas, so editing stays natural.
  input.value = goalDisplay.value;
  const offset = groupAmount(beforeCaret).length;
  input.setSelectionRange(offset, offset);
}
function onGoalAmountBlur() {
  const amount = Number(goalAmount.value);
  if (!goalAmount.value || !Number.isFinite(amount)) {
    goalAmount.value = '';
    goalDisplay.value = '';
    return;
  }
  goalAmount.value = amount.toFixed(2);
  goalDisplay.value = pesoFormatter.format(amount);
  goalPreset.value = GOAL_PRESETS.some(n => n === amount) ? String(amount) : 'custom';
}
const startDate = ref('');
const deadline = ref('');
function nextDate(date: string): string {
  // Date-only UTC arithmetic avoids local-time/DST shifts.
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}
const minimumDeadline = computed(() => nextDate(startDate.value && startDate.value >= today() ? startDate.value : today()));
function onStartDateChange() {
  if (startDate.value && startDate.value < today()) startDate.value = '';
  if (deadline.value && deadline.value < minimumDeadline.value) deadline.value = '';
}
function onDeadlineChange() {
  if (deadline.value && deadline.value < minimumDeadline.value) deadline.value = '';
}
const locationAddress = ref('');
const pin = ref<MapPoint | null>(null);
const imageUrl = ref('');
const contactPhone = ref('');
const payoutMethod = ref<'GCash'|'Maya'|'Bank Transfer'>('GCash');
const payoutName = ref('');
const payoutNumber = ref('');
const files = ref<{validId:File|null;barangayClearance:File|null;situationPhoto:File|null;eligibilityProof:File|null;cover:File|null}>({validId:null,barangayClearance:null,situationPhoto:null,eligibilityProof:null,cover:null});
function setFile(which:keyof typeof files.value,event:Event){files.value[which]=(event.target as HTMLInputElement).files?.[0]||null;}


const loading = ref(false);
const saving = ref(false);
// A non-blocking red error box. Each new error restarts the 3-second timer.
const formErrors = ref<string[]>([]);
let errorToastTimer: ReturnType<typeof setTimeout> | null = null;
function dismissFormErrors() {
  if (errorToastTimer) clearTimeout(errorToastTimer);
  errorToastTimer = null;
  formErrors.value = [];
}
function showFormErrors(messages: string[]) {
  dismissFormErrors();
  if (!messages.length) return;
  formErrors.value = messages;
  errorToastTimer = setTimeout(() => {
    formErrors.value = [];
    errorToastTimer = null;
  }, 3000);
}
function showFormError(message: string) {
  showFormErrors([message]);
}

// Optional inline phone warning also disappears after three seconds.
const contactPhoneError = ref('');
let phoneErrorTimer: ReturnType<typeof setTimeout> | null = null;
function onContactPhoneBlur() {
  if (phoneErrorTimer) clearTimeout(phoneErrorTimer);
  contactPhoneError.value = contactPhone.value && !/^09\d{9}$/.test(contactPhone.value)
    ? 'Use exactly 11 digits beginning with 09.' : '';
  if (contactPhoneError.value) {
    showFormError(contactPhoneError.value);
    phoneErrorTimer = setTimeout(() => { contactPhoneError.value = ''; phoneErrorTimer = null; }, 3000);
  }
}
const blockMessage = ref('');
const existing = ref<Campaign | null>(null);

// Address auto-fill state (the address follows the map pin)
const GEOCODE_DELAY_MS = 600;
let geocodeTimer: ReturnType<typeof setTimeout> | null = null;
let geocodeRequestId = 0;
let lastAutoAddress = '';
let suppressNextPinReverse = false;

const showPreview = computed(() => imageUrl.value.trim().startsWith('https://'));

/** Today's date as YYYY-MM-DD in the person's own time zone. */
function today(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(clockTick.value));
}
const clockTick = ref(Date.now());
const clockTimer = setInterval(() => { clockTick.value = Date.now(); }, 30_000);
const minimumEventTime = computed(() => {
  // Round forward to the following minute: a time that has already begun is not selectable.
  const nextMinute = Math.floor(clockTick.value / 60000) * 60000 + 60000;
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(nextMinute)).replace(' ', 'T');
});
const eventTimeUnavailableToday = computed(() =>
  volunteerEventDate.value === today() && minimumEventTime.value.slice(0, 10) !== today()
);
const minimumVolunteerClock = computed(() =>
  volunteerEventDate.value === today()
    ? (eventTimeUnavailableToday.value ? '23:59' : minimumEventTime.value.slice(11, 16))
    : '00:00'
);
function isFutureVolunteerDateTime(): boolean {
  if (!volunteerEventDate.value || !volunteerEventTime.value) return false;
  const timestamp = Date.parse(`${volunteerEventDate.value}T${volunteerEventTime.value}:00+08:00`);
  return Number.isFinite(timestamp) && timestamp > Date.now();
}
function syncVolunteerEventDateTime() {
  volunteerDate.value = volunteerEventDate.value && volunteerEventTime.value
    ? `${volunteerEventDate.value}T${volunteerEventTime.value}` : '';
}
function onVolunteerDateChange() {
  eventDateTimeError.value = '';
  if (volunteerEventDate.value && volunteerEventDate.value < today()) {
    volunteerEventDate.value = '';
    eventDateTimeError.value = 'Past dates are not allowed. Select today or a future date.';
  }
  if (volunteerEventTime.value &&
      (eventTimeUnavailableToday.value || !isFutureVolunteerDateTime())) {
    volunteerEventTime.value = '';
    eventDateTimeError.value = 'Please choose a future time for today.';
  }
  syncVolunteerEventDateTime();
}
function onVolunteerTimeChange() {
  eventDateTimeError.value = '';
  if (volunteerEventTime.value &&
      (eventTimeUnavailableToday.value || !isFutureVolunteerDateTime())) {
    volunteerEventTime.value = '';
    eventDateTimeError.value = 'That time has already passed. Please select a future time.';
  }
  syncVolunteerEventDateTime();
}

function cancelGeocode() {
  if (geocodeTimer !== null) {
    clearTimeout(geocodeTimer);
    geocodeTimer = null;
  }
  geocodeRequestId++;
}

function resetForm() {
  cancelGeocode();
  title.value = '';
  campaignType.value = 'fundraiser';
  needsVolunteersChoice.value = 'no';
  volunteerDate.value = '';
  volunteerEventDate.value = '';
  volunteerEventTime.value = '';
  eventDateTimeError.value = '';
  clearVolunteerFields();
  category.value = '';
  description.value = '';
  beneficiaryName.value = '';
  beneficiaryInfo.value = '';
  goalAmount.value = '';
  goalDisplay.value = '';
  goalPreset.value = '';
  startDate.value = ''; // Blank until the organizer chooses a date
  deadline.value = '';
  locationAddress.value = '';
  locationResults.value = []; locationStatus.value = ''; locationError.value = false;
  pin.value = null;
  imageUrl.value = '';
  contactPhone.value=currentUser.value?.phone||'';payoutName.value=currentUser.value?.displayName||'';payoutMethod.value='GCash';payoutNumber.value='';files.value={validId:null,barangayClearance:null,situationPhoto:null,eligibilityProof:null,cover:null};
  dismissFormErrors();
  contactPhoneError.value = '';
  if (phoneErrorTimer) clearTimeout(phoneErrorTimer);
  phoneErrorTimer = null;
  blockMessage.value = '';
  lastAutoAddress = '';
  existing.value = null;
}

function fillForm(campaign: Campaign) {
  const record = campaign as Campaign & {
    type?: 'fundraiser' | 'volunteer_event'; needsVolunteers?: boolean;
    volunteerHelpCategory?: VolunteerHelpCategory | null;
    volunteerDuties?: string; volunteerRequirements?: string;
    volunteerDate?: string; volunteerSlots?: number | null;
  };
  campaignType.value = record.type || 'fundraiser';
  const isRecruiting = record.needsVolunteers === true ||
    (record.needsVolunteers === undefined && Number(record.volunteerSlots || 0) > 0);
  needsVolunteersChoice.value = isRecruiting ? 'yes' : 'no';
  volunteerHelpCategory.value = isRecruiting
    ? (record.volunteerHelpCategory || 'General Assistance') : '';
  volunteerDuties.value = isRecruiting ? record.volunteerDuties || '' : '';
  volunteerRequirements.value = isRecruiting ? record.volunteerRequirements || '' : '';
  // Convert stored UTC timestamp to local datetime-local value.
  const savedDate = record.volunteerDate ? new Date(record.volunteerDate) : null;
  volunteerDate.value = savedDate && !Number.isNaN(savedDate.getTime())
    ? new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      }).format(savedDate).replace(' ', 'T')
    : '';
  volunteerEventDate.value = volunteerDate.value.slice(0, 10);
  volunteerEventTime.value = volunteerDate.value.slice(11, 16);
  eventDateTimeError.value = '';
  volunteerSlots.value = isRecruiting ? (Number(record.volunteerSlots) || null) : null;
  title.value = campaign.title;
  category.value = campaign.category;
  description.value = campaign.description;
  beneficiaryName.value = campaign.beneficiaryName;
  beneficiaryInfo.value = campaign.beneficiaryInfo;
  goalAmount.value = String(campaign.goalAmount);
  goalDisplay.value = pesoFormatter.format(Number(campaign.goalAmount) || 0);
  goalPreset.value = GOAL_PRESETS.some(n => n === Number(campaign.goalAmount))
    ? String(Number(campaign.goalAmount)) : 'custom';
  startDate.value = campaign.startDate;
  deadline.value = campaign.deadline;
  locationAddress.value = campaign.locationAddress;
  pin.value =
    campaign.latitude !== null && campaign.longitude !== null
      ? { lat: campaign.latitude, lng: campaign.longitude }
      : null;
  imageUrl.value = campaign.imageUrl;
  contactPhone.value=(campaign as any).contactPhone||currentUser.value?.phone||'';payoutMethod.value=(campaign as any).payoutMethod||'GCash';payoutName.value=(campaign as any).payoutName||'';payoutNumber.value=(campaign as any).payoutNumber||'';
}

/** Address search is explicit (button/Enter), never per-keystroke, for controlled requests. */
type LocationResult = { label: string; lat: number; lng: number };
const locationResults = ref<LocationResult[]>([]);
const locationStatus = ref('');
const locationError = ref(false);
let locationErrorTimer: ReturnType<typeof setTimeout> | null = null;
watch(locationStatus, (message) => {
  if (locationErrorTimer) clearTimeout(locationErrorTimer);
  locationErrorTimer = null;
  if (message && locationError.value) {
    showFormError(message);
    locationErrorTimer = setTimeout(() => {
      if (locationStatus.value === message && locationError.value) {
        locationStatus.value = '';
        locationError.value = false;
      }
      locationErrorTimer = null;
    }, 3000);
  }
});
const searchingLocation = ref(false);
const findingLocation = ref(false);
let locationAbort: AbortController | null = null;
const locationCache = new Map<string, LocationResult[]>();
let lastLocationRequestAt = 0;

function photonLabel(p: any): string {
  const fields = [p.name, p.housenumber, p.street, p.district, p.city, p.county, p.state, p.country];
  return [...new Set(fields.filter((v: unknown) => typeof v === 'string' && v.trim()))].join(', ');
}

/** Demo geocoding endpoint; host/provide your own service for high-volume deployment. */
const geocoderBase = (import.meta.env.VITE_GEOCODING_BASE_URL || 'https://photon.komoot.io').replace(/\/$/, '');
async function locationFetch(path: string, signal: AbortSignal) {
  // Limit requests from this form so rapid searches do not hammer a shared endpoint.
  const remaining = Math.max(0, 1100 - (Date.now() - lastLocationRequestAt));
  if (remaining) await new Promise(resolve => setTimeout(resolve, remaining));
  if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
  lastLocationRequestAt = Date.now();
  const response = await fetch(`${geocoderBase}${path}`, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Location service unavailable. Try again or select a pin on the map.');
  return response.json();
}

async function searchLocation() {
  const q = locationAddress.value.trim();
  if (q.length < 3) {
    locationStatus.value = 'Type at least three characters to search.';
    locationError.value = true;
    return;
  }
  locationAbort?.abort();
  const controller = new AbortController();
  locationAbort = controller;
  searchingLocation.value = true;
  locationError.value = false;
  locationResults.value = [];
  locationStatus.value = 'Searching for matching places…';
  try {
    let results = locationCache.get(q.toLowerCase());
    if (!results) {
      const data = await locationFetch(`/api/?q=${encodeURIComponent(q)}&limit=5&lang=en`, controller.signal);
      results = (data.features || []).map((f: any) => ({
        lat: Number(f.geometry?.coordinates?.[1]),
        lng: Number(f.geometry?.coordinates?.[0]),
        label: photonLabel(f.properties || {})
      })).filter((p: LocationResult) => Number.isFinite(p.lat) && Number.isFinite(p.lng) && p.label);
      locationCache.set(q.toLowerCase(), results!);
    }
    if (controller.signal.aborted) return;
    locationResults.value = results!;
    locationStatus.value = results!.length ? 'Choose a matching location below to update the map pin.' : 'No matches. Try a nearby landmark or manually select a pin on the map.';
  } catch (error) {
    if (controller.signal.aborted) return;
    locationError.value = true;
    locationStatus.value = error instanceof Error ? error.message : 'Could not search locations. Try again or select a pin.';
  } finally {
    if (locationAbort === controller) { locationAbort = null; searchingLocation.value = false; }
  }
}

/** Editing a searched address requires selecting a matching new pin before submission. */
function onLocationAddressInput() {
  locationAbort?.abort();
  locationResults.value = [];
  locationStatus.value = '';
  locationError.value = false;
  if (lastAutoAddress && locationAddress.value.trim() !== lastAutoAddress && pin.value) {
    cancelGeocode();
    pin.value = null;
    lastAutoAddress = '';
    locationStatus.value = 'Address changed. Search again or choose a matching pin on the map.';
  }
}

function chooseLocation(result: LocationResult) {
  cancelGeocode();
  lastAutoAddress = result.label.slice(0, 100);
  suppressNextPinReverse = true;
  locationAddress.value = lastAutoAddress;
  pin.value = { lat: result.lat, lng: result.lng };
  locationResults.value = [];
  locationError.value = false;
  locationStatus.value = 'Location selected. Confirm the pin on the map.';
}

function useCurrentLocation() {
  if (findingLocation.value) return;
  if (!navigator.geolocation || !window.isSecureContext) {
    locationError.value = true;
    locationStatus.value = 'GPS needs permission and HTTPS (or localhost). You can select the pin manually.';
    return;
  }
  findingLocation.value = true;
  locationError.value = false;
  locationStatus.value = 'Getting your current position…';
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    findingLocation.value = false;
    const point = { lat: coords.latitude, lng: coords.longitude };
    lastAutoAddress = locationAddress.value.trim();
    suppressNextPinReverse = true;
    pin.value = point;
    locationResults.value = [];
    locationStatus.value = 'GPS pin set. Checking the nearby address…';
    const controller = new AbortController();
    locationAbort?.abort();
    locationAbort = controller;
    try {
      const data = await locationFetch(`/reverse?lat=${point.lat}&lon=${point.lng}&lang=en`, controller.signal);
      if (controller.signal.aborted) return;
      const first = data.features?.[0];
      const label = first ? photonLabel(first.properties || {}) : '';
      if (label) {
        locationAddress.value = label.slice(0, 100);
        lastAutoAddress = locationAddress.value;
        locationStatus.value = 'Current location found. Check the address and map pin.';
      } else locationStatus.value = 'GPS pin set. Type your address in the field above.';
    } catch {
      locationStatus.value = 'GPS pin set. Enter the address manually if it was not filled in.';
    } finally { if (locationAbort === controller) locationAbort = null; }
  }, (error) => {
    findingLocation.value = false;
    locationError.value = true;
    locationStatus.value = error.code === 1 ? 'Location permission denied. Enable permission or choose a pin manually.' : 'Could not get GPS position. Check location settings or use the map.';
  }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
}

/** Auto-fill when a map pin changes, without overwriting a manually typed address. */
watch(pin, (point) => {
  if (suppressNextPinReverse) { suppressNextPinReverse = false; return; }
  if (geocodeTimer !== null) { clearTimeout(geocodeTimer); geocodeTimer = null; }
  if (!point) return;
  const current = locationAddress.value.trim();
  if (current && current !== lastAutoAddress) return;
  const requestId = ++geocodeRequestId;
  geocodeTimer = setTimeout(async () => {
    geocodeTimer = null;
    const controller = new AbortController();
    try {
      const data = await locationFetch(`/reverse?lat=${point.lat}&lon=${point.lng}&lang=en`, controller.signal);
      if (requestId !== geocodeRequestId) return;
      const first = data.features?.[0];
      const address = first ? photonLabel(first.properties || {}).slice(0, 100) : '';
      if (address && (!locationAddress.value.trim() || locationAddress.value.trim() === lastAutoAddress)) {
        locationAddress.value = address;
        lastAutoAddress = address;
      }
    } catch { /* Map pin stays selected even if address lookup is unavailable. */ }
  }, GEOCODE_DELAY_MS);
});

onIonViewWillEnter(async () => {
  resetForm();
  if (!isEdit) return;

  loading.value = true;
  try {
    const campaign = await getCampaignRecord(campaignId);
    if (!campaign || campaign.organizerId !== currentUser.value?.uid) {
      blockMessage.value = 'Campaign not found.';
    } else if (!EDITABLE_STATUSES.includes(campaign.status)) {
      blockMessage.value = 'Only rejected campaigns can be edited and resubmitted for administrator review.';
    } else {
      existing.value = campaign;
      fillForm(campaign);
    }
  } catch (error) {
    blockMessage.value = error instanceof Error ? error.message : 'Could not load the campaign.';
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  clearInterval(clockTimer);
  locationAbort?.abort();
  cancelGeocode();
  dismissFormErrors();
  if (eventErrorTimer) clearTimeout(eventErrorTimer);
  if (phoneErrorTimer) clearTimeout(phoneErrorTimer);
  if (locationErrorTimer) clearTimeout(locationErrorTimer);
});

function validate(): string[] {
  const errors: string[] = [];
  // Text fields accept any content (including symbols, punctuation, and numbers)
  // but whitespace-only entries are not valid submissions.
  if (!title.value.trim()) errors.push('Campaign title: This field is required.');
  if (!category.value) errors.push('Campaign category: Please select a category.');
  if (!description.value.trim()) errors.push('Campaign description: This field is required.');
  if (!beneficiaryName.value.trim()) errors.push('Beneficiary name or organization: This field is required.');
  if (!beneficiaryInfo.value.trim()) errors.push('Beneficiary information: This field is required.');

  for (const [label, value] of [
    ['Campaign description', description.value],
    ['Beneficiary name or organization', beneficiaryName.value],
    ['Beneficiary information', beneficiaryInfo.value],
  ]) {
    if (countWords(value) > MAX_WORDS) errors.push(`${label}: Maximum ${MAX_WORDS} words.`);
  }

  const goal = Number(goalAmount.value);
  if (campaignType.value === 'fundraiser') {
    if (!goalAmount.value.trim() || !Number.isFinite(goal) || goal <= 0) {
      errors.push('Fundraising goal: Choose or enter an amount greater than ₱0.');
    } else if (!/^\d+(?:\.\d{1,2})?$/.test(goalAmount.value) || goal > 10000000) {
      errors.push('Fundraising goal: Enter up to ₱10,000,000.00 (maximum 2 decimal places).');
    }
    if (!startDate.value || startDate.value < today())
      errors.push('Start date: Choose today or a future date.');
    if (!deadline.value || deadline.value < minimumDeadline.value)
      errors.push('Deadline: Choose a date after the start date.');
  }

  if (needsVolunteersChoice.value === 'yes' || campaignType.value === 'volunteer_event') {
    if (!volunteerEventDate.value || !volunteerEventTime.value || !volunteerDate.value ||
        volunteerEventDate.value < today() ||
        !Number.isFinite(Date.parse(`${volunteerDate.value}:00+08:00`)) ||
        Date.parse(`${volunteerDate.value}:00+08:00`) <= Date.now()) {
      errors.push('Volunteer event: Please select a future date and time (Philippine time).');
    }
    if (needsVolunteersChoice.value === 'yes') {
      if (!volunteerHelpCategory.value) errors.push('Volunteer help category: This field is required.');
      if (!volunteerDuties.value.trim()) errors.push('Volunteer duties: This field is required.');
      if (!volunteerRequirements.value.trim()) errors.push('Volunteer qualifications / requirements: This field is required.');
      if (countWords(volunteerDuties.value) > MAX_WORDS)
        errors.push(`Volunteer duties: Maximum ${MAX_WORDS} words.`);
      if (countWords(volunteerRequirements.value) > MAX_WORDS)
        errors.push(`Volunteer qualifications / requirements: Maximum ${MAX_WORDS} words.`);
      if (volunteerSlots.value === null || volunteerSlots.value === undefined ||
          !Number.isInteger(Number(volunteerSlots.value)) ||
          Number(volunteerSlots.value) < 1 || Number(volunteerSlots.value) > 10000) {
        errors.push('Number of volunteers needed: Enter a whole number from 1 to 10,000.');
      }
    }
  }

  if (locationAddress.value.trim().length < 3 || locationAddress.value.trim().length > 100 ||
      !/[\p{L}]/u.test(locationAddress.value))
    errors.push('Location address: Enter a valid address (3–100 characters).');
  if (!pin.value) errors.push('Location pin: Search, use GPS, or select a pin on the map.');

  if (!/^09\d{9}$/.test(contactPhone.value))
    errors.push('Contact number: Enter exactly 11 digits beginning with 09.');
  if (campaignType.value === 'fundraiser') {
    if (!/^[\p{L}\p{M} .'-]{2,100}$/u.test(payoutName.value.trim()))
      errors.push('Payout account holder: Please enter a valid name.');
    if (!/^\d{8,25}$/.test(payoutNumber.value))
      errors.push('Payout account number: Enter 8–25 digits.');
    else if (payoutMethod.value !== 'Bank Transfer' && !/^09\d{9}$/.test(payoutNumber.value))
      errors.push('GCash / Maya number: Enter 11 digits beginning with 09.');
  }
  if (!isEdit) {
    const requiredFiles: { field: keyof typeof files.value; label: string }[] = [
      { field: 'validId', label: 'Valid ID' },
      { field: 'barangayClearance', label: 'Barangay clearance / legitimacy proof' },
      { field: 'situationPhoto', label: 'Photo of the situation' },
      { field: 'eligibilityProof', label: 'Beneficiary / event legitimacy proof' },
    ];
    for (const { field, label } of requiredFiles)
      if (!files.value[field]) errors.push(`${label}: This document is required.`);
  }
  for (const [key, file] of Object.entries(files.value)) {
    if (file && (file.size > 8 * 1024 * 1024 ||
        !['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type) ||
        ((key === 'situationPhoto' || key === 'cover') && file.type === 'application/pdf'))) {
      errors.push('Attachments: Use JPG, PNG, WebP or PDF under 8 MB (situation and cover must be images).');
      break;
    }
  }
  const image = imageUrl.value.trim();
  if (image && !image.startsWith('https://'))
    errors.push('Image link: Please use an https:// URL.');
  return errors;
}

async function handleSubmit() {
  if (saving.value) return;
  const validationErrors = validate();
  if (validationErrors.length) {
    showFormErrors(validationErrors);
    return;
  }
  dismissFormErrors();

  const user = currentUser.value;
  if (!user) {
    showFormError('Please log in before submitting an event or campaign.');
    return;
  }

  const form = {
    title: title.value,
    description: description.value,
    category: category.value as CampaignCategory,
    beneficiaryName: beneficiaryName.value,
    beneficiaryInfo: beneficiaryInfo.value,
    imageUrl: imageUrl.value,
    goalAmount: Number(goalAmount.value),
    startDate: startDate.value,
    deadline: deadline.value,
    locationAddress: locationAddress.value,
    latitude: pin.value ? pin.value.lat : null,
    longitude: pin.value ? pin.value.lng : null,
    type: campaignType.value,
    needsVolunteers: needsVolunteersChoice.value === 'yes',
    volunteerHelpCategory: needsVolunteersChoice.value === 'yes'
      ? volunteerHelpCategory.value : '',
    volunteerDuties: needsVolunteersChoice.value === 'yes'
      ? volunteerDuties.value.trim() : '',
    volunteerRequirements: needsVolunteersChoice.value === 'yes'
      ? volunteerRequirements.value.trim() : '',
    volunteerDate: (needsVolunteersChoice.value === 'yes' || campaignType.value === 'volunteer_event') && volunteerDate.value ? new Date(`${volunteerDate.value}:00+08:00`).toISOString() : '',
    volunteerSlots: needsVolunteersChoice.value === 'yes'
      ? Number(volunteerSlots.value || 0) : 0,
    contactPhone:contactPhone.value,payoutMethod:payoutMethod.value,payoutName:payoutName.value,payoutNumber:payoutNumber.value,...files.value,
  };

  saving.value = true;
  try {
    if (isEdit && existing.value) {
      await updateCampaign(existing.value, form);
      await showToast('Changes saved.');
    } else {
      await createCampaign(form, user);
      await showToast('Campaign submitted for admin verification.');
    }
    router.replace('/organizer/campaigns');
  } catch (error) {
    showFormError(error instanceof Error ? error.message : 'Could not save the campaign.');
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
/* Transient error card is fixed to the viewport so it is visible from any scroll position. */
.rg-error-toast {
  position: fixed;
  z-index: 9999;
  top: max(16px, env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  width: min(480px, calc(100vw - 30px));
  display: flex;
  gap: 11px;
  align-items: flex-start;
  padding: 15px 13px 15px 15px;
  background: #fff1ef;
  border: 1px solid #d98a82;
  border-left: 5px solid #b93d35;
  border-radius: 13px;
  color: #8a2b25;
  box-shadow: 0 10px 28px rgba(85, 25, 18, .17);
  font-family: 'DM Sans', 'Segoe UI', Arial, sans-serif;
}
.rg-error-toast-icon { font-size: 22px; color: #b93d35; flex: none; }
.rg-error-toast-body { flex: 1; min-width: 0; }
.rg-error-toast-body strong { display: block; font-size: 11px; letter-spacing: .6px; margin-bottom: 5px; }
.rg-error-toast-body ul { margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.5; }
.rg-error-toast-body li + li { margin-top: 4px; }
.rg-error-toast-body small { display: block; margin-top: 7px; font-size: 11px; font-weight: 700; }
.rg-error-dismiss { border: 0; background: transparent; color: #8a2b25; padding: 2px; cursor: pointer; }
.rg-error-dismiss ion-icon { font-size: 19px; }
.rg-error-fade-enter-active, .rg-error-fade-leave-active { transition: opacity .16s ease; }
.rg-error-fade-enter-from, .rg-error-fade-leave-to { opacity: 0; }
.word-count { align-self: flex-end; color: #687466; font: 700 11px 'DM Sans', 'Segoe UI', sans-serif; }
.word-count.word-limit { color: #b33e32; }
.rg-name-textarea { min-height: 66px; }
@media (max-width: 610px) { .rg-error-toast { top: max(9px, env(safe-area-inset-top)); } }
.rg-page{--forest:#173729;--deep:#112b20;--cream:#fbf0dc;--gold:#f3b75d;--terracotta:#be563b;background:var(--cream);color:var(--forest)}
.rg-page *{box-sizing:border-box}.rg-page a{text-decoration:none}
.rg-header,.rg-navbar{background:var(--cream)}.rg-header{box-shadow:none}.rg-header::after{display:none}
.rg-navbar{height:74px;border-bottom:1px solid #e8dec9;padding:0 clamp(18px,4vw,66px);display:flex;align-items:center;justify-content:space-between;gap:20px;font-family:'DM Sans','Segoe UI',Arial,sans-serif}
.rg-brand{font:700 clamp(29px,2.6vw,37px)/1 Georgia,serif;letter-spacing:-2px;white-space:nowrap;color:var(--forest)}.rg-brand span,.rg-brand b{color:var(--terracotta)}.rg-brand b{font-size:12px;letter-spacing:0;vertical-align:top}
.nav-back,.secondary-link{display:inline-flex;align-items:center;gap:8px;color:var(--forest);font:800 11px 'DM Sans','Segoe UI',sans-serif;letter-spacing:1.1px}.nav-back ion-icon{font-size:20px}.nav-back:hover,.secondary-link:hover{color:var(--terracotta)}
.rg-content{--background:#fbf0dc;--color:#173729;--padding-start:0;--padding-end:0;--padding-top:0;--padding-bottom:0}
.page-shell{min-height:calc(100dvh - 74px);padding:24px clamp(16px,4vw,66px) 0;display:flex;flex-direction:column;font-family:'DM Sans','Avenir Next','Segoe UI',Arial,sans-serif}
.main-content{width:min(100%,1370px);margin:0 auto}.hero{background:linear-gradient(118deg,var(--forest),var(--deep));border-radius:21px;min-height:205px;color:#fff8e8;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:clamp(26px,4vw,52px);overflow:hidden;position:relative}.hero:after{content:'';position:absolute;right:6%;bottom:-135px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(232,174,76,.12),transparent 75%);pointer-events:none}.hero-text{max-width:720px;position:relative;z-index:1}.kicker,.section-eyebrow,.submit-kicker{font-weight:800;font-size:10px;letter-spacing:1.8px;color:var(--gold);margin:0 0 12px}.kicker span{color:#fff8e8}.hero h1,.section-title-row h2,.submit-row strong,.feedback-card h2{font-family:Georgia,'Times New Roman',serif;font-weight:400}.hero h1{font-size:clamp(39px,4.8vw,64px);line-height:1.05;letter-spacing:-1.7px;margin:0 0 14px}.hero h1 em{color:var(--gold);font-weight:400}.hero-text>p:last-child{font-size:14px;line-height:1.65;color:#d9e4d8;margin:0;max-width:570px}.hero-badge{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;width:160px;height:150px;border:1px solid rgba(255,248,232,.2);border-radius:20px;background:rgba(255,248,232,.06);flex-shrink:0}.hero-badge ion-icon{color:var(--gold);font-size:50px}.hero-badge span{font-weight:800;color:#f9e2ae;font-size:10px;line-height:1.5;letter-spacing:1.3px;text-align:center}
.campaign-form{width:min(100%,1010px);margin:26px auto 52px}.notice{display:flex;align-items:flex-start;gap:12px;padding:15px 19px;background:#f4e7ca;border:1px solid #e6d3ad;border-radius:15px;color:#4f634f}.notice ion-icon{color:var(--terracotta);font-size:23px;flex-shrink:0}.notice p{margin:0;font-size:12px;line-height:1.6}
.form-section{background:#fff9ed;border:1px solid #e8dcc5;border-radius:18px;padding:clamp(21px,3vw,33px);margin-top:18px}.section-title-row{display:flex;align-items:center;gap:16px;margin-bottom:23px}.step{font:400 34px Georgia,serif;color:#c4ab7b;min-width:45px}.section-eyebrow{color:var(--terracotta);margin:0 0 4px}.section-title-row h2{color:var(--forest);font-size:clamp(28px,3vw,37px);line-height:1.15;margin:0}.section-title-row h2 em{color:var(--terracotta)}
.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.field-group{display:flex;flex-direction:column;gap:8px;min-width:0;margin:0}.field-group.full{grid-column:1/-1}.field-group label{color:var(--forest);font-size:11px;font-weight:800;letter-spacing:1.2px}.rg-field{--background:#fffdf7;--color:#173729;--placeholder-color:#899284;--placeholder-opacity:1;--border-color:#d7cdbb;--border-width:1px;--highlight-color-focused:#be563b;--border-radius:13px;--padding-start:17px;--padding-end:16px;--padding-top:13px;--padding-bottom:13px;min-height:51px;font-size:14px;font-family:'DM Sans','Segoe UI',sans-serif}.rg-field.ion-focused{--border-color:#be563b}.rg-textarea{min-height:110px}.field-hint{color:#697568;font-size:12px;margin:12px 0 14px;line-height:1.6}.map-frame{border-radius:13px;overflow:hidden;border:1px solid #e5d9c3;background:#f3f0e6}.preview{display:block;width:100%;max-height:310px;object-fit:cover;border-radius:14px;margin:16px 0 0}.error{background:#fff0e9;border-radius:12px;padding:13px 16px;color:#a53125;font-size:13px;line-height:1.6}
.submit-row{padding:23px 27px;margin-top:20px;border-radius:18px;background:var(--forest);color:#fff8e8;display:flex;align-items:center;justify-content:space-between;gap:20px}.submit-kicker{margin-bottom:7px}.submit-row strong{font-size:clamp(18px,2.3vw,26px);line-height:1.2}.submit-button{margin:0;min-height:52px;--background:var(--gold);--color:#112b20;--border-radius:999px;--box-shadow:none;font-weight:800;font-size:12px;letter-spacing:1px;flex-shrink:0}.submit-button::part(native){padding-inline:25px}.submit-button ion-icon{font-size:18px}
.feedback-card{width:min(100%,920px);min-height:280px;padding:50px 24px;margin:26px auto;border-radius:18px;text-align:center;background:#fff9ed;border:1px solid #e8dcc5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}.feedback-card ion-spinner{color:var(--forest);width:34px;height:34px}.feedback-icon{color:var(--terracotta);font-size:42px}.feedback-card h2{font-size:29px;margin:0}.feedback-card p{color:#637363;margin:0 0 10px;font-size:13px}.secondary-link{font-size:11px}.rg-footer{width:min(100%,1370px);margin:auto auto 0;display:flex;align-items:center;justify-content:space-between;gap:20px;border-top:1px solid #e8ddc9;padding:18px 0;color:#738070;font:11px 'DM Sans','Segoe UI',sans-serif}
@media(max-width:700px){.rg-navbar{height:66px;padding-inline:16px}.nav-back{font-size:9px;letter-spacing:.4px}.nav-back ion-icon{font-size:17px}.page-shell{min-height:calc(100dvh - 66px);padding:15px 14px 0}.hero{padding:28px 24px;min-height:0}.hero-badge{display:none}.hero h1{font-size:38px}.hero-text>p:last-child{font-size:12px}.form-grid{grid-template-columns:1fr;gap:17px}.form-section{padding:21px 17px}.section-title-row{gap:11px}.section-title-row h2{font-size:27px}.step{min-width:35px;font-size:28px}.submit-row{padding:24px 20px;flex-direction:column;align-items:stretch}.submit-button{width:100%}.rg-footer{font-size:10px;flex-wrap:wrap;justify-content:center}}
@media(prefers-reduced-motion:reduce){.nav-back{scroll-behavior:auto}}
/* Fundraising amount selector + calendar/time controls use the existing ReliefGO palette. */
.goal-picker-grid,.event-datetime-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.goal-picker-item{min-width:0;display:flex;flex-direction:column;gap:7px}
.input-caption{font:800 10px 'DM Sans','Segoe UI',sans-serif;letter-spacing:1px;color:#536257}
.goal-preset,.currency-input,.rg-calendar-field{min-height:51px;border:1px solid #d7cdbb;border-radius:13px;background:#fffdf7;color:#173729;font-size:14px;padding:12px 15px}
.goal-preset,.rg-calendar-field{cursor:pointer;color-scheme:light}
.goal-preset:focus-visible,.currency-input:focus-visible,.rg-calendar-field:focus-visible{outline:2px solid #be563b;outline-offset:2px}
.currency-input-wrap{display:flex;align-items:center;overflow:hidden;border:1px solid #d7cdbb;border-radius:13px;background:#fffdf7}
.currency-input-wrap:focus-within{outline:2px solid #be563b;outline-offset:2px}
.currency-symbol{color:#be563b;font-weight:800;font-size:16px;padding:0 0 0 16px}
.currency-input{flex:1;min-width:0;min-height:49px;border:0;border-radius:0;background:transparent;padding-left:8px;font-variant-numeric:tabular-nums}
.currency-input:focus-visible{outline:none}
.compact-hint{display:block;margin:3px 0 0}.goal-helper{display:block;margin:2px 0 0}
@media(max-width:700px){.goal-picker-grid,.event-datetime-grid{grid-template-columns:1fr;gap:13px}}
</style>

<style>
.event-info{margin:0;padding:13px 15px;border:1px solid #bad6c1;border-radius:12px;background:#ecf6eb;color:#204c35;font-size:13px;line-height:1.6}
.rg-native-field{width:100%;min-height:45px;border:1px solid #d8d4c5;border-radius:10px;background:#fffcf6;padding:10px 12px;color:#143b2d;font:500 13px system-ui,sans-serif}.rg-native-field:focus{outline:2px solid #408c68;outline-offset:1px}.inline-error{display:block;margin-top:6px;color:#bd4433;font-size:12px}
</style>

<style scoped>
.location-search-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.location-address-field{flex:1 1 240px;min-width:160px}.location-search-btn{--background:#173729;--color:#fff9ec;--border-radius:10px;min-height:42px;text-transform:none}.location-gps-btn{--color:#173729;--border-color:#173729;--border-radius:10px;min-height:42px;text-transform:none}.location-result-list{list-style:none;padding:0;margin:8px 0;max-height:255px;overflow:auto;border:1px solid #e5dcc8;border-radius:12px;background:#fffdf7}.location-result-list li+li{border-top:1px solid #e5dcc8}.location-result-list button{display:flex;align-items:center;gap:10px;background:transparent;border:0;padding:12px;width:100%;text-align:left;color:#173729;cursor:pointer}.location-result-list button span{flex:1}.location-result-list button:hover,.location-result-list button:focus-visible{background:#f7ebd8}.location-result-list ion-icon{color:#be563b}.location-status{margin:7px 0 0;font-size:12px;color:#173729}.location-status-error{color:#a93229}.rg-native-field,.rg-field{max-width:100%}@media(max-width:600px){.location-search-row>ion-button{flex:1 1 auto}.location-address-field{flex-basis:100%}}
</style>
