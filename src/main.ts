import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';

import App from './App.vue';
import router from './router';

import { enableLiveValidation } from './utils/liveValidation';

// =====================================================
// IONIC CORE CSS
// =====================================================

import '@ionic/vue/css/core.css';

// =====================================================
// IONIC BASIC CSS
// =====================================================

import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

// =====================================================
// IONIC UTILITY CSS
// =====================================================

import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

// =====================================================
// RELIEFGO THEME
// =====================================================

import './theme/variables.css';
import './theme/relief-go.css';

// =====================================================
// STARTUP ERROR HANDLER
// =====================================================

function showStartupError(error: unknown): void {
  console.error('[ReliefGO] Startup error:', error);

  const root = document.getElementById('app');

  if (!root) {
    console.error('[ReliefGO] Root element #app not found.');
    return;
  }

  const message =
    error instanceof Error
      ? error.message
      : String(error);

  root.replaceChildren();

  root.style.minHeight = '100vh';
  root.style.display = 'flex';
  root.style.alignItems = 'center';
  root.style.justifyContent = 'center';
  root.style.padding = '24px';
  root.style.backgroundColor = '#f8f3e4';
  root.style.color = '#183c2c';
  root.style.fontFamily = 'Arial, sans-serif';
  root.style.textAlign = 'center';

  const container = document.createElement('div');

  const heading = document.createElement('h2');
  heading.textContent = 'ReliefGO could not start';

  const description = document.createElement('p');

  description.textContent = import.meta.env.DEV
    ? message
    : 'Unable to load the application. Please restart.';

  description.style.marginTop = '12px';
  description.style.lineHeight = '1.6';

  container.appendChild(heading);
  container.appendChild(description);

  root.appendChild(container);
}

// =====================================================
// INITIALIZE RELIEFGO
// =====================================================

async function initializeApp(): Promise<void> {
  try {
    // Enable validation for supported form fields.
    enableLiveValidation();

    // Create Vue application.
    const app = createApp(App);

    // Catch Vue component errors.
    app.config.errorHandler = (error, _instance, info) => {
      console.error('[ReliefGO] Vue error:', error);
      console.error('[ReliefGO] Component information:', info);
    };

    // Register Ionic Vue.
    app.use(IonicVue);

    // Register Vue Router.
    app.use(router);

    // Catch router errors.
    router.onError((error) => {
      console.error('[ReliefGO] Router error:', error);
    });

    // Wait for initial navigation before mounting.
    await router.isReady();

    // Mount application.
    app.mount('#app');

    console.log('[ReliefGO] Application initialized successfully.');

  } catch (error) {
    showStartupError(error);
  }
}

// =====================================================
// START APPLICATION
// =====================================================

void initializeApp();