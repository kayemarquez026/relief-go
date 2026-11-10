<template>
  <ion-page class="relief-login-page">
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-shell">
        <!-- Cream navigation, matching the ReliefGO welcome page -->
        <header class="login-navbar">
          <router-link to="/welcome" class="login-brand" aria-label="ReliefGO home">
            Relief<span>GO</span><b>♥</b>
          </router-link>

          <router-link to="/welcome" class="home-link">
            <ion-icon :icon="arrowBackOutline" aria-hidden="true" />
            <span>BACK TO HOME</span>
          </router-link>
        </header>

        <main class="login-layout">
          <!-- Story panel: reuse your EXISTING ReliefGO illustration -->
          <section class="story-panel" aria-labelledby="story-heading">
            <div class="story-heading">
              <p class="eyebrow">STORIES OF BAYANIHAN</p>
              <h1 id="story-heading">Every act of <em>kindness</em> brings hope closer.</h1>
              <p class="story-description">
                Together, we make relief and compassion reach more Filipino communities.
              </p>
            </div>

            <div class="story-artwork">
              <img
                :src="reliefLogo"
                alt="ReliefGO illustration of Filipino volunteers carrying donations for families"
              />
            </div>

            <div class="story-bottom">
              <span class="story-dot" aria-hidden="true"></span>
              <p>SMALL ACTS. BIG HEARTS.</p>
              <span class="story-rule" aria-hidden="true"></span>
            </div>
          </section>

          <!-- Existing ReliefGO design and authentication are preserved. -->
          <section class="form-panel" aria-labelledby="login-heading">
            <div class="form-inner">
              <p class="form-eyebrow">WELCOME TO RELIEFGO <span>✦</span></p>
              <h2 id="login-heading">Welcome <em>back.</em></h2>
              <p class="form-subtitle">
                Log in to donate, manage campaigns, or review submissions.
              </p>

              <!-- Saved credentials remain selectable; empty on a fresh visit. -->
              <form
                :key="inputResetKey"
                class="login-form"
                @submit.prevent="handleLogin"
                novalidate
              >
                <div class="relief-login-group">
                  <div class="relief-field-heading">
                    <label class="relief-field-label" for="login-email">EMAIL ADDRESS</label>
                    <!-- The ONLY visible validation message: floating above its input. -->
                    <div
                      v-if="emailTip"
                      id="login-email-tip"
                      class="relief-floating-error"
                      role="alert"
                    >
                      <ion-icon :icon="alertCircleOutline" aria-hidden="true" />
                      <span>{{ emailTip }}</span>
                    </div>
                  </div>
                  <div class="relief-input-wrap">
                    <!-- Native input prevents Ionic from rendering a second inline error. -->
                    <input
                      ref="emailInputEl"
                      id="login-email"
                      v-model="email"
                      name="username"
                      type="email"
                      autocomplete="username"
                      :readonly="!inputsUnlocked"
                      aria-label="Gmail address"
                      :aria-invalid="Boolean(emailTip)"
                      :aria-describedby="emailTip ? 'login-email-tip' : undefined"
                      placeholder="Enter your Email address"
                      autocapitalize="off"
                      spellcheck="false"
                      inputmode="email"
                      class="relief-native-input"
                      :class="{ 'field-invalid': Boolean(emailTip) }"
                      @pointerdown.capture="unlockInputs"
                      @focus="unlockInputs"
                      @keydown.capture="unlockInputs"
                      @input="onEmailInput"
                      @change="onEmailChange"
                      @blur="onEmailBlur"
                    />
                  </div>
                </div>

                <div class="relief-login-group">
                  <div class="relief-field-heading">
                    <label class="relief-field-label" for="login-password">PASSWORD</label>
                    <!-- The ONLY visible validation message: floating above its input. -->
                    <div
                      v-if="passwordTip"
                      id="login-password-tip"
                      class="relief-floating-error"
                      role="alert"
                    >
                      <ion-icon :icon="alertCircleOutline" aria-hidden="true" />
                      <span>{{ passwordTip }}</span>
                    </div>
                  </div>
                  <div class="relief-input-wrap">
                    <!-- No Ionic error-text slot; only the floating badge above is used. -->
                    <input
                      ref="passwordInputEl"
                      id="login-password"
                      v-model="password"
                      name="password"
                      :type="showPassword ? 'text' : 'password'"
                      autocomplete="current-password"
                      :readonly="!inputsUnlocked"
                      aria-label="Password"
                      :aria-invalid="Boolean(passwordTip)"
                      :aria-describedby="passwordTip ? 'login-password-tip' : undefined"
                      placeholder="Enter your password"
                      class="relief-native-input"
                      :class="{ 'field-invalid': Boolean(passwordTip) }"
                      @pointerdown.capture="unlockInputs"
                      @focus="unlockInputs"
                      @keydown.capture="unlockInputs"
                      @input="onPasswordInput"
                      @change="onPasswordChange"
                      @blur="onPasswordBlur"
                    />
                    <button
                      type="button"
                      class="relief-password-toggle"
                      :aria-label="showPassword ? 'Hide password' : 'Show password'"
                      :aria-pressed="showPassword"
                      @click="showPassword = !showPassword"
                    >
                      <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <ion-button type="submit" expand="block" class="submit-button" :disabled="loading">
                  <ion-spinner v-if="loading" name="crescent" aria-label="Logging in" />
                  <template v-else>
                    LOG IN
                    <ion-icon slot="end" :icon="arrowForwardOutline" aria-hidden="true" />
                  </template>
                </ion-button>

                <div class="form-links">
                  <router-link to="/register">Create an account <span aria-hidden="true">↗</span></router-link>
                </div>
              </form>

              <div class="form-divider" aria-hidden="true"><span>♥</span></div>
              <p class="form-footnote">Your next act of kindness starts here.</p>
            </div>
          </section>
        </main>

        <footer class="login-footer">
          <span>© {{ new Date().getFullYear() }} ReliefGO</span>
          <span>Stories of bayanihan live here.</span>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonButton,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
  onIonViewDidLeave,
} from '@ionic/vue';
import { alertCircleOutline, arrowBackOutline, arrowForwardOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import reliefLogo from '../assets/images/reliefgo-logo.png';
import { loginUser } from '../services/authService';
import { dashboardPathForRole } from '../utils/roles';

const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const emailInputEl = ref<HTMLInputElement | null>(null);
const passwordInputEl = ref<HTMLInputElement | null>(null);
const emailEdited = ref(false);
const emailBlurred = ref(false);
const passwordEdited = ref(false);
const passwordBlurred = ref(false);
const attemptedLogin = ref(false);
const inputsUnlocked = ref(false);
const inputResetKey = ref(0);
const loading = ref(false);
const authError = ref('');

const gmailPattern = /^(?!.*\.\.)[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@gmail\.com$/i;
const cleanEmail = computed(() => email.value.trim().toLowerCase());

const emailTip = computed(() => {
  const value = cleanEmail.value;
  if (!value) {
    return attemptedLogin.value || emailEdited.value ? 'This field is required.' : '';
  }

  if (value.includes('..')) return 'Enter a valid Gmail address.';
  const firstAt = value.indexOf('@');
  if (firstAt !== value.lastIndexOf('@')) return 'Use only one @ symbol.';

  if (firstAt !== -1) {
    const local = value.slice(0, firstAt);
    const domain = value.slice(firstAt + 1);
    if (!local) return 'Enter a valid Gmail address.';
    if (domain && !'gmail.com'.startsWith(domain)) return 'Please Enter a valid email address.';
    if (domain === 'gmail.com' && !gmailPattern.test(value)) {
      return 'Enter a valid Gmail address.';
    }
  }

  if ((emailBlurred.value || attemptedLogin.value) && !gmailPattern.test(value)) {
    return 'Please Enter a valid email address.';
  }
  return '';
});

const passwordTip = computed(() => {
  if (authError.value) return authError.value;
  if (!password.value && (attemptedLogin.value || passwordEdited.value)) {
    return 'This field is required.';
  }
  return '';
});

function unlockInputs() {
  inputsUnlocked.value = true;
}

function onEmailInput(event: Event) {
  email.value = (event.target as HTMLInputElement).value;
  emailEdited.value = true;
  emailBlurred.value = false;
  authError.value = '';
}

function onEmailChange(event: Event) {
  email.value = (event.target as HTMLInputElement).value;
  if (email.value) emailEdited.value = true;
  emailBlurred.value = true;
  authError.value = '';
}

function onEmailBlur() {
  emailBlurred.value = true;
}

function onPasswordInput(event: Event) {
  password.value = (event.target as HTMLInputElement).value;
  passwordEdited.value = true;
  passwordBlurred.value = false;
  authError.value = '';
}

function onPasswordChange(event: Event) {
  password.value = (event.target as HTMLInputElement).value;
  if (password.value) passwordEdited.value = true;
  passwordBlurred.value = true;
  authError.value = '';
}

function onPasswordBlur() {
  passwordBlurred.value = true;
}

function syncBrowserFilledValues() {
  if (emailInputEl.value) email.value = emailInputEl.value.value;
  if (passwordInputEl.value) password.value = passwordInputEl.value.value;
}

function resetLoginFields() {
  email.value = '';
  password.value = '';
  showPassword.value = false;
  emailEdited.value = false;
  emailBlurred.value = false;
  passwordEdited.value = false;
  passwordBlurred.value = false;
  attemptedLogin.value = false;
  authError.value = '';
  inputsUnlocked.value = false;
  inputResetKey.value += 1;
}

onMounted(resetLoginFields);
onIonViewWillEnter(resetLoginFields);
onIonViewDidLeave(resetLoginFields);

function conciseAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (/confirm|verif/i.test(message)) return 'Please verify your email.';
  if (/network|fetch|connect|offline/i.test(message)) return 'Network error. Try again.';
  if (/invalid|password|credentials|unauthorized/i.test(message)) {
    return 'Incorrect email or password.';
  }
  return 'Login failed. Please try again.';
}

async function handleLogin() {
  if (loading.value) return;

  syncBrowserFilledValues();
  attemptedLogin.value = true;
  emailBlurred.value = true;
  passwordBlurred.value = true;
  authError.value = '';

  if (emailTip.value || !gmailPattern.test(cleanEmail.value)) return;
  if (!password.value) return;

  loading.value = true;
  try {
    const user = await loginUser(cleanEmail.value, password.value);
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '';
    const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '';
    const destination = safeRedirect || dashboardPathForRole(user.role);

    resetLoginFields();
    await router.replace(destination);
  } catch (error) {
    password.value = '';
    authError.value = conciseAuthError(error);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.relief-login-page {
  --forest: #173729;
  --deep: #112b20;
  --cream: #fbf0dc;
  --terracotta: #be563b;
  --gold: #f3b75d;
  --muted: #667365;
  background: var(--cream);
  color: var(--forest);
}

.login-content {
  --background: #fbf0dc;
  --color: #173729;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}

.login-content::part(background),
.login-content::part(scroll) {
  background: #fbf0dc;
}

.login-shell {
  width: 100%;
  box-sizing: border-box;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 0 clamp(16px, 3.5vw, 64px);
  background: var(--cream);
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.login-shell * { box-sizing: border-box; }
.login-shell a { color: inherit; text-decoration: none; }
.login-shell h1, .login-shell h2, .login-brand { font-family: Georgia, 'Times New Roman', serif; }

.login-navbar {
  flex: 0 0 78px;
  max-width: 1620px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.login-brand {
  display: inline-flex;
  align-items: flex-start;
  color: var(--forest);
  font-size: clamp(29px, 2.5vw, 36px);
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1;
  white-space: nowrap;
}
.login-brand span, .login-brand b { color: var(--terracotta); }
.login-brand b { font-family: Georgia, serif; font-size: 12px; letter-spacing: 0; margin: 0 0 0 2px; }

.home-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  border: 1px solid #173729;
  border-radius: 999px;
  padding: 12px 16px;
  font-size: 11px;
  letter-spacing: 1px;
  font-weight: 800;
  background: #173729;
  transition: background .2s, color .2s, border-color .2s;
}
.login-shell .home-link { color: #fff9ef; }
.home-link ion-icon { font-size: 16px; }
.home-link:hover, .home-link:focus-visible { background: #28543e; color: #fff9ef; border-color: #28543e; }

.login-layout {
  flex: 1 0 auto;
  width: 100%;
  max-width: 1620px;
  margin: 0 auto;
  min-height: 590px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr);
  align-items: stretch;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 55px rgba(29, 57, 36, .08);
}

.story-panel {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  padding: clamp(32px, 3vw, 54px) clamp(30px, 4vw, 66px) 27px;
  background: linear-gradient(142deg, var(--forest), var(--deep) 94%);
  color: #fff8e8;
}
.story-panel::before {
  content: '';
  position: absolute;
  z-index: -1;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  left: 15%;
  bottom: -13%;
  background: radial-gradient(circle, rgba(232, 174, 76, .18) 0%, transparent 70%);
  pointer-events: none;
}

.story-heading { position: relative; z-index: 1; }
.eyebrow, .form-eyebrow {
  margin: 0 0 18px;
  font-size: 11px;
  letter-spacing: 2.2px;
  font-weight: 800;
}
.eyebrow { color: var(--gold); }
.story-heading h1 {
  max-width: 620px;
  margin: 0 0 13px;
  font-size: clamp(32px, 3.25vw, 55px);
  line-height: 1.08;
  font-weight: 400;
  letter-spacing: -1.9px;
}
.story-heading h1 em { color: var(--gold); font-weight: 400; }
.story-description {
  max-width: 490px;
  color: #d6dfd0;
  font-size: clamp(12px, .95vw, 15px);
  line-height: 1.65;
  margin: 0;
}
.story-artwork {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  place-items: center;
  padding: 13px 0 0;
}
.story-artwork img {
  display: block;
  width: min(100%, 535px);
  max-height: min(39dvh, 385px);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 12px 18px rgba(0,0,0,.13));
}
.story-bottom {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 0 0 auto;
}
.story-bottom p {
  margin: 0;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  white-space: nowrap;
}
.story-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }
.story-rule { height: 1px; flex: 1; background: rgba(255,248,232,.25); }

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(30px, 4vw, 68px);
  min-width: 0;
  background: #fff9ed;
  border: 1px solid #e8dfcb;
  border-left: 0;
}
.form-inner { width: 100%; max-width: 445px; min-width: 0; }
.form-eyebrow { color: var(--terracotta); margin-bottom: 20px; }
.form-eyebrow span { color: var(--gold); }
.form-inner h2 {
  font-size: clamp(40px, 3.45vw, 59px);
  line-height: 1.12;
  font-weight: 400;
  letter-spacing: -2px;
  margin: 0 0 17px;
}
.form-inner h2 em { color: var(--terracotta); font-weight: 400; }
.form-subtitle {
  font-size: 14px;
  line-height: 1.65;
  font-weight: 400;
  color: #596b5c;
  margin: 0 0 27px;
  max-width: 390px;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.relief-login-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  gap: 9px;
}
.relief-field-label {
  display: block;
  margin: 0;
  padding-left: 2px;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.5;
  letter-spacing: 1.3px;
  color: var(--forest);
}
.relief-native-input {
  display: block;
  width: 100%;
  min-height: 57px;
  margin: 0;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--forest);
  --background: #fffdf7;
  --color: #173729;
  --placeholder-color: #899284;
  --placeholder-opacity: 1;
  --border-color: #d6cfbd;
  --border-width: 1px;
  --highlight-color-focused: #be563b;
  --border-radius: 13px;
  --padding-start: 17px;
  --padding-end: 14px;
  --padding-top: 15px;
  --padding-bottom: 15px;
}
.relief-native-input.ion-focused {
  --border-color: #be563b;
}
.submit-button {
  margin: 5px 0 3px;
  min-height: 52px;
  --background: var(--gold);
  --background-hover: #f0bc62;
  --background-activated: #d99e34;
  --color: #112b20;
  --border-radius: 999px;
  --box-shadow: none;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.2px;
}
.submit-button::part(native) { padding-inline: 23px; }
.submit-button ion-icon { font-size: 18px; }
.form-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 10px 0 0;
}
.form-links a { font-size: 14px; color: var(--forest); font-weight: 800; }
.form-links a:hover, .form-links a:focus-visible { color: var(--terracotta); text-decoration: underline; }
.form-divider { display: flex; align-items: center; gap: 13px; margin: 37px 0 13px; color: var(--terracotta); }
.form-divider::before, .form-divider::after { content: ''; height: 1px; flex: 1; background: #e7dbc5; }
.form-divider span { font-size: 14px; }
.form-footnote { font: italic 15px Georgia, serif; text-align: center; color: #6d7a69; margin: 0; }

.login-footer {
  flex: 0 0 52px;
  width: 100%;
  max-width: 1620px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  color: #677768;
  font-size: 11px;
}

@media (max-width: 1000px) {
  .login-layout { grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); }
  .story-panel { padding-inline: 30px; }
  .story-heading h1 { font-size: clamp(32px, 3.4vw, 42px); letter-spacing: -1px; }
  .form-panel { padding-inline: 35px; }
}

@media (max-width: 760px) {
  .login-shell { padding-inline: 15px; }
  .login-navbar { flex-basis: 71px; }
  .login-layout { min-height: 0; grid-template-columns: 1fr; border-radius: 16px; }
  .story-panel { padding: 28px 28px 24px; }
  .story-heading h1 { font-size: clamp(29px, 5vw, 38px); max-width: 520px; }
  .story-heading .eyebrow { margin-bottom: 13px; }
  .story-description { font-size: 12px; }
  .story-artwork, .story-bottom { display: none; }
  .form-panel { border-left: 1px solid #e8dfcb; padding: 40px clamp(20px, 6vw, 46px) 48px; }
  .form-inner h2 { font-size: clamp(36px, 8vw, 48px); }
  .form-subtitle { margin-bottom: 24px; }
}

@media (max-width: 420px) {
  .login-brand { font-size: 28px; }
  .home-link { padding: 10px 11px; font-size: 9px; gap: 5px; }
  .home-link ion-icon { font-size: 14px; }
  .story-panel { padding: 26px 21px 24px; }
  .story-heading h1 { font-size: 30px; }
  .form-panel { padding: 32px 18px 40px; }
  .form-subtitle { font-size: 13px; }
  .relief-native-input { min-height: 54px; font-size: 14px; }
  .relief-field-label { font-size: 10px; }
  .login-footer { font-size: 10px; flex-wrap: wrap; justify-content: center; padding: 15px 0; }
}

@media (prefers-reduced-motion: reduce) {
  .home-link { transition: none; }
}

.relief-login-page {
  height: 100%;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
}
.login-content {
  height: 100%;
  --overflow: auto;
  --padding-top: 0;
  --padding-bottom: 0;
}
.login-content::part(scroll) {
  height: 100%;
  overflow-y: auto !important;
  overscroll-behavior-y: auto;
}
.login-shell {
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  max-height: 100dvh;
  overflow: hidden;
  display: grid;
  grid-template-rows: clamp(58px, 8dvh, 72px) minmax(0, 1fr) clamp(29px, 4.2dvh, 42px);
  padding-inline: clamp(12px, 3.5vw, 64px);
}
.login-navbar {
  height: 100%;
  min-height: 0;
  flex: none;
}
.login-layout {
  height: 100%;
  min-height: 0;
  max-height: 100%;
  flex: none;
  align-self: stretch;
}
.login-footer {
  height: 100%;
  min-height: 0;
  flex: none;
  line-height: 1.25;
}
.story-panel {
  min-height: 0;
  padding: clamp(17px, 3dvh, 38px) clamp(20px, 3vw, 55px) clamp(14px, 2dvh, 24px);
}
.story-heading h1 {
  font-size: clamp(27px, 3vw, 46px);
  line-height: 1.08;
  margin-bottom: 8px;
}
.story-heading .eyebrow { margin-bottom: 11px; }
.story-description { font-size: clamp(12px, .9vw, 14px); line-height: 1.5; }
.story-artwork {
  min-height: 0;
  overflow: hidden;
  padding-block: 10px;
}
.story-artwork img {
  max-height: min(32dvh, 305px);
  max-width: 100%;
  object-fit: contain;
}
.form-panel {
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: clamp(14px, 2.5dvh, 30px) clamp(18px, 3vw, 47px);
}
.form-inner { max-height: 100%; }
.form-eyebrow { margin-bottom: 10px; }
.form-inner h2 {
  font-size: clamp(34px, 3.25vw, 52px);
  line-height: 1.08;
  margin-bottom: 11px;
}
.form-subtitle {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
}
.login-form { gap: clamp(10px, 1.6dvh, 16px); }
.relief-login-group { gap: 6px; }
.relief-native-input {
  min-height: 48px;
  --padding-top: 11px;
  --padding-bottom: 11px;
}
.submit-button { min-height: 47px; margin: 2px 0; }
.form-links { margin-top: 5px; }
.form-divider { margin: clamp(14px, 2dvh, 22px) 0 9px; }
.form-footnote { font-size: 13px; }

@media (min-width: 761px) and (max-height: 720px) {
  .story-heading h1 { font-size: clamp(26px, 2.7vw, 37px); }
  .story-artwork img { max-height: min(28dvh, 210px); }
  .story-panel { padding-block: 17px; }
  .form-inner h2 { font-size: clamp(30px, 3vw, 42px); }
  .form-subtitle { margin-bottom: 12px; }
  .form-divider { margin-top: 10px; }
  .login-form { gap: 10px; }
  .relief-native-input { min-height: 45px; }
}

@media (max-width: 760px) {
  .login-shell {
    padding-inline: clamp(9px, 3vw, 16px);
    grid-template-rows: 56px minmax(0, 1fr) 31px;
  }
  .login-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 88px minmax(0, 1fr);
    min-height: 0;
    border-radius: 14px;
  }
  .story-panel {
    height: auto;
    padding: 12px 20px;
    display: flex;
    justify-content: center;
  }
  .story-heading .eyebrow { margin: 0 0 5px; font-size: 9px; }
  .story-heading h1 { font-size: clamp(19px, 5vw, 27px); line-height: 1.1; letter-spacing: -.5px; margin: 0; }
  .story-description, .story-artwork, .story-bottom { display: none; }
  .form-panel {
    min-height: 0;
    padding: clamp(12px, 2.6dvh, 24px) clamp(14px, 5vw, 30px);
    border-left: 1px solid #e8dfcb;
    align-items: center;
  }
  .form-inner h2 { font-size: clamp(30px, 7vw, 41px); }
  .form-subtitle { font-size: 12px; margin-bottom: 14px; }
  .form-eyebrow { font-size: 9px; margin-bottom: 8px; }
  .login-form { gap: 10px; }
  .relief-native-input { min-height: 46px; font-size: 13px; }
  .relief-field-label { font-size: 10px; }
  .submit-button { min-height: 45px; font-size: 12px; }
  .form-divider { margin: 11px 0 8px; }
  .form-footnote { font-size: 12px; }
  .login-footer { padding: 0; flex-wrap: nowrap; font-size: 9px; }
  .login-navbar { height: 100%; }
}
@media (max-width: 420px) {
  .login-brand { font-size: 27px; }
  .home-link { padding: 8px 10px; }
  .form-panel { padding-inline: 16px; }
  .login-footer { justify-content: space-between; }
}
@media (max-height: 620px) {
  .form-panel { overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; }
}

.relief-login-group {
  position: relative;
  isolation: isolate;
  gap: 0;
}

.relief-field-heading {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  min-height: 40px;
}

.relief-field-heading .relief-field-label {
  display: flex;
  align-items: center;
  margin: 0;
  height: 100%;
  min-height: 0;
  flex: 0 0 auto;
  padding-inline: 2px;
}

.relief-input-wrap {
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: visible;
}

.relief-floating-error {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
  width: max-content;
  max-width: calc(100% - 112px);
  max-height: 40px;
  margin: 0;
  padding: 6px 11px;
  border: 1px solid #e4a8a0;
  border-radius: 9px;
  background: #fff8f1;
  box-shadow: 0 5px 13px rgba(71, 39, 30, .1);
  color: #a53129;
  font: 700 11.5px/1.12 'DM Sans', 'Segoe UI', Arial, sans-serif;
  overflow-wrap: anywhere;
  pointer-events: none;
}

.relief-floating-error::after {
  content: '';
  position: absolute;
  bottom: -5px;
  right: 17px;
  width: 8px;
  height: 8px;
  border-right: 1px solid #e4a8a0;
  border-bottom: 1px solid #e4a8a0;
  background: #fff8f1;
  transform: rotate(45deg);
}

.relief-floating-error ion-icon {
  flex: 0 0 14px;
  font-size: 14px;
}

.relief-floating-error span { min-width: 0; }

@media (max-width: 420px) {
  .relief-floating-error {
    max-width: calc(100% - 102px);
    padding: 6px 8px;
    gap: 5px;
    font-size: 10.5px;
  }
  .relief-floating-error ion-icon { flex-basis: 12px; font-size: 12px; }
}

.relief-input-wrap {
  position: relative;
  width: 100%;
  isolation: isolate;
}

.relief-native-input {
  appearance: none;
  -webkit-appearance: none;
  display: block;
  width: 100%;
  height: 48px;
  min-height: 48px;
  box-sizing: border-box;
  border: 1px solid #d6cfbd;
  border-radius: 13px;
  background: #fffdf7;
  padding: 11px 17px;
  margin: 0;
  outline: none;
  box-shadow: none;
  color: #173729;
  font: 500 15px/1.4 'DM Sans', 'Segoe UI', Arial, sans-serif;
  caret-color: #173729;
  color-scheme: light;
  transition: border-color .15s ease, box-shadow .15s ease;
}

.relief-native-input::placeholder { color: #899284; opacity: 1; }
.relief-native-input:focus { border-color: #be563b; box-shadow: 0 0 0 2px rgba(198,107,70,.12); }
.relief-native-input.field-invalid,
.relief-native-input.field-invalid:focus { border-color: #ba493e; }
.relief-native-input:read-only { cursor: text; opacity: 1; }

.relief-native-input:-webkit-autofill,
.relief-native-input:-webkit-autofill:hover,
.relief-native-input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px #fffdf7 inset !important;
  box-shadow: 0 0 0 1000px #fffdf7 inset !important;
  -webkit-text-fill-color: #173729 !important;
  caret-color: #173729 !important;
}

#login-password { padding-right: 60px; }
.relief-password-toggle {
  position: absolute;
  z-index: 2;
  top: 50%;
  right: 9px;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #1b6932;
  cursor: pointer;
}
.relief-password-toggle:hover { background: rgba(24,60,44,.07); }
.relief-password-toggle:focus-visible { outline: 2px solid #be563b; outline-offset: 1px; }
.relief-password-toggle ion-icon { font-size: 22px; }

@media (max-width: 760px) {
  .relief-native-input { height: 46px; min-height: 46px; font-size: 13px; }
}


/* MOBILE LOGIN SCROLLING FIX — avoid clipping form fields on small phones. */
@media (max-width: 760px) {
  .login-content {
    --overflow: auto !important;
  }

  .login-content::part(scroll) {
    height: 100% !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    overscroll-behavior-y: auto !important;
    -webkit-overflow-scrolling: touch;
  }

  .login-shell {
    height: auto !important;
    min-height: 100%;
    max-height: none !important;
    overflow: visible !important;
    grid-template-rows: 56px auto auto !important;
  }

  .login-layout {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    grid-template-rows: 88px auto !important;
  }

  .form-panel {
    max-height: none !important;
    overflow: visible !important;
  }

  .form-inner {
    max-height: none !important;
  }

  .login-footer {
    height: auto !important;
    min-height: 31px;
  }
}

</style>
