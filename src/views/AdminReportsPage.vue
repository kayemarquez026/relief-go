<template>
  <ion-page class="rg-reports-page">
    <!-- Mobile menu with the same admin navigation used on the dashboard. -->
    <ion-menu v-if="$route.name === 'AdminReports'"
      content-id="reports-admin-main"
      menu-id="reports-admin-menu"
      type="overlay"
      side="start"
      class="reports-admin-menu"
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
            <span class="menu-avatar">{{ userInitials }}</span>
            <div>
              <span>ADMINISTRATOR ACCOUNT</span>
              <strong>{{ fullName }}</strong>
            </div>
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
              <ion-item button :detail="false" router-link="/admin/campaigns" class="menu-link">
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
              <ion-item button :detail="false" router-link="/admin/reports" class="menu-link current-menu-link" aria-current="page">
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
            <button type="button" class="rg-sidebar-logout" @click="handleLogout">
              <ion-icon :icon="logOutOutline" aria-hidden="true" /> Log Out
            </button>
          </div>
        </div>
      </ion-content>
    </ion-menu>

    <!-- Desktop: dashboard-matching 266px persistent dark green sidebar. -->
    <aside class="admin-desktop-sidebar" aria-label="Administration sidebar">
      <div class="desktop-brand">
        Relief<span>GO</span><sup>♥</sup>
        <small>ADMINISTRATION</small>
      </div>
      <div class="desktop-profile">
        <span class="menu-avatar">{{ userInitials }}</span>
        <div><small>ADMINISTRATOR</small><strong>{{ fullName }}</strong></div>
      </div>
      <p class="desktop-nav-title">MANAGEMENT TOOLS</p>
      <nav class="desktop-links" aria-label="Administration links">
        <router-link to="/admin" exact-active-class="desktop-active">
          <ion-icon :icon="barChartOutline" /> Dashboard
        </router-link>
        <router-link to="/notifications" active-class="desktop-active">
          <ion-icon :icon="notificationsOutline" /> Notifications
        </router-link>
        <router-link to="/admin/campaigns" active-class="desktop-active">
          <ion-icon :icon="megaphoneOutline" /> Campaign &amp; Events
        </router-link>
        <router-link to="/admin/users" active-class="desktop-active">
          <ion-icon :icon="peopleOutline" /> User Management
        </router-link>
        <router-link to="/admin/reports" active-class="desktop-active" aria-current="page">
          <ion-icon :icon="barChartOutline" /> Reports
        </router-link>
        <router-link to="/admin/audit-logs" active-class="desktop-active">
          <ion-icon :icon="documentTextOutline" /> Audit Logs
        </router-link>
      </nav>
      <div class="desktop-sidebar-bottom">
        <span>Small acts. Big hearts. ✦</span>
        <button type="button" class="rg-sidebar-logout" @click="handleLogout">
          <ion-icon :icon="logOutOutline" aria-hidden="true" /> Log Out
        </button>
      </div>
    </aside>

    <div id="reports-admin-main" class="reports-admin-main rg-menu-page-layout">
      <ion-header class="reports-header">
        <ion-toolbar class="reports-toolbar">
          <div class="nav-inner">
            <div class="nav-left">
              <ion-button fill="clear" class="menu-trigger"
                aria-label="Open administration menu" @click="toggleAdminMenu">
                <ion-icon slot="icon-only" :icon="menuOutline" />
              </ion-button>
              <router-link to="/admin" class="brand" aria-label="ReliefGO administrator dashboard">
                Relief<span>GO</span><sup>♥</sup>
              </router-link>
              <span class="nav-divider" aria-hidden="true"></span>
              <span class="nav-page-name">ADMIN REPORTS</span>
            </div>
            <div class="topbar-user" aria-label="Administrator profile">
              <span class="topbar-avatar">{{ userInitials }}</span>
              <span class="topbar-identity"><strong>{{ fullName }}</strong><small>ADMINISTRATOR</small></span>
            </div>
          </div>
        </ion-toolbar>
      </ion-header>

    <ion-content class="reports-content">
      <main class="page-wrapper">
        <section class="hero-banner" aria-labelledby="report-page-heading">
          <div class="hero-copy">
            <p class="eyebrow hero-eyebrow">RELIEFGO ADMINISTRATION ✦</p>
            <h1 id="report-page-heading">Reports <em>&amp; insights.</em></h1>
            <p>Explore donations, expenses, and campaigns. Filter your records and export the results with confidence.</p>
          </div>
          <div class="admin-identity" aria-label="Administrator profile">
            <span class="identity-avatar">{{ userInitials }}</span>
            <div class="identity-details">
              <span class="eyebrow hero-eyebrow">ADMINISTRATOR ACCOUNT</span>
              <strong>{{ fullName }}</strong>
              <small>Data and reporting center</small>
            </div>
          </div>
        </section>

        <section class="reports-workspace" aria-labelledby="report-workspace-heading">
          <div class="section-head">
            <div>
              <p class="eyebrow">YOUR REPORTING WORKSPACE</p>
              <h2 id="report-workspace-heading">Every number <em>tells a story.</em></h2>
              <p class="section-description">Choose a report to review actual records from ReliefGO.</p>
            </div>
          </div>

          <ion-segment v-model="reportType" class="report-tabs" aria-label="Select report type">
            <ion-segment-button value="donations">
              <ion-icon :icon="heartOutline" />
              <ion-label>Donations</ion-label>
            </ion-segment-button>
            <ion-segment-button value="expenses">
              <ion-icon :icon="receiptOutline" />
              <ion-label>Expenses</ion-label>
            </ion-segment-button>
            <ion-segment-button value="campaigns">
              <ion-icon :icon="megaphoneOutline" />
              <ion-label>Campaigns</ion-label>
            </ion-segment-button>
          </ion-segment>

          <div v-if="loading" class="state-box" role="status">
            <ion-spinner name="crescent" />
            <h3>Gathering your reports</h3>
            <p>Loading live ReliefGO records...</p>
          </div>

          <div v-else-if="errorMessage" class="state-box error-state" role="alert">
            <ion-icon :icon="alertCircleOutline" class="state-icon" />
            <h3>Something went wrong</h3>
            <p>{{ errorMessage }}</p>
          </div>

          <template v-else-if="table">
            <section class="filters-panel" aria-labelledby="filters-heading">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">REFINE YOUR RESULTS</p>
                  <h3 id="filters-heading"><ion-icon :icon="optionsOutline" /> Report filters</h3>
                </div>
                <button class="clear-button" type="button" @click="clearFilters">
                  <ion-icon :icon="refreshOutline" /> CLEAR FILTERS
                </button>
              </div>

              <div class="filter-grid">
                <div class="field-wrap">
                  <label class="field-label">Campaign</label>
                  <ion-select
                    v-model="filters.campaignId"
                    aria-label="Campaign"
                    fill="outline"
                    interface="popover"
                    class="rg-field"
                  >
                    <ion-select-option :value="ALL">All campaigns</ion-select-option>
                    <ion-select-option v-for="item in campaignOptions" :key="item.id" :value="item.id">
                      {{ item.title }}
                    </ion-select-option>
                  </ion-select>
                </div>

                <div class="field-wrap">
                  <label class="field-label">Campaign category</label>
                  <ion-select
                    v-model="filters.category"
                    aria-label="Campaign category"
                    fill="outline"
                    interface="popover"
                    class="rg-field"
                  >
                    <ion-select-option :value="ALL">All categories</ion-select-option>
                    <ion-select-option v-for="item in CAMPAIGN_CATEGORIES" :key="item" :value="item">
                      {{ item }}
                    </ion-select-option>
                  </ion-select>
                </div>

                <div class="field-wrap">
                  <label class="field-label">Status</label>
                  <ion-select
                    v-model="filters.status"
                    aria-label="Status"
                    fill="outline"
                    interface="popover"
                    class="rg-field"
                  >
                    <ion-select-option :value="ALL">All statuses</ion-select-option>
                    <ion-select-option v-for="item in statusOptions" :key="item" :value="item">
                      {{ item }}
                    </ion-select-option>
                  </ion-select>
                </div>

                <div class="field-wrap">
                  <label class="field-label" for="report-date-from-trigger">From date</label>
                  <button
                    id="report-date-from-trigger"
                    type="button"
                    class="date-picker-field date-picker-trigger"
                    aria-label="Select from date"
                    @click="openDatePicker('dateFrom')"
                  >
                    <ion-icon :icon="calendarOutline" aria-hidden="true" />
                    <span :class="{ 'date-placeholder': !filters.dateFrom }">
                      {{ filters.dateFrom ? formatDate(filters.dateFrom) : 'Select date' }}
                    </span>
                    <ion-icon :icon="chevronDownOutline" class="date-chevron" aria-hidden="true" />
                  </button>
                </div>
                <div class="field-wrap">
                  <label class="field-label" for="report-date-to-trigger">To date</label>
                  <button
                    id="report-date-to-trigger"
                    type="button"
                    class="date-picker-field date-picker-trigger"
                    aria-label="Select to date"
                    @click="openDatePicker('dateTo')"
                  >
                    <ion-icon :icon="calendarOutline" aria-hidden="true" />
                    <span :class="{ 'date-placeholder': !filters.dateTo }">
                      {{ filters.dateTo ? formatDate(filters.dateTo) : 'Select date' }}
                    </span>
                    <ion-icon :icon="chevronDownOutline" class="date-chevron" aria-hidden="true" />
                  </button>
                </div>
                <ion-modal
                  class="report-calendar-modal"
                  :is-open="activeDatePicker !== null"
                  @didDismiss="closeDatePicker"
                >
                  <ion-datetime
                    v-if="activeDatePicker"
                    :key="activeDatePicker"
                    presentation="date"
                    locale="en-PH"
                    :value="activeDatePicker ? (filters[activeDatePicker] || undefined) : undefined"
                    :show-default-buttons="true"
                    :show-clear-button="true"
                    @ionChange="handleDatePicked($event)"
                  ></ion-datetime>
                </ion-modal>
              </div>
            </section>

            <div class="summary-grid" aria-label="Report summary">
              <div class="summary-card">
                <ion-icon :icon="documentTextOutline" class="summary-icon" />
                <span class="summary-label">MATCHING RECORDS</span>
                <strong>{{ table.rows.length }}</strong>
                <small>Based on the selected filters</small>
              </div>
              <div class="summary-card">
                <ion-icon :icon="shieldCheckmarkOutline" class="summary-icon" />
                <span class="summary-label">{{ table.totalLabel }}</span>
                <strong>{{ formatPeso(table.totalAmount) }}</strong>
                <small>Calculated from matching records</small>
              </div>
            </div>

            <section class="results-panel" aria-labelledby="results-heading">
              <div class="results-heading">
                <div>
                  <p class="eyebrow">DETAILED RECORDS</p>
                  <h3 id="results-heading">{{ reportTitle }} <em>report.</em></h3>
                  <p>View your filtered records or download the full dataset.</p>
                </div>
                <ion-button
                  class="download-button"
                  :disabled="table.rows.length === 0"
                  @click="handleDownload"
                >
                  <ion-icon slot="start" :icon="downloadOutline" /> DOWNLOAD CSV
                  <ion-icon slot="end" :icon="arrowForwardOutline" />
                </ion-button>
              </div>

              <div v-if="table.rows.length === 0" class="empty-results">
                <span class="empty-icon"><ion-icon :icon="documentTextOutline" /></span>
                <p class="eyebrow">NO MATCHING DATA</p>
                <h4>No records match these filters.</h4>
                <p>Try a different campaign, category, status, or date range.</p>
                <button class="empty-clear" type="button" @click="clearFilters">CLEAR FILTERS <ion-icon :icon="arrowForwardOutline" /></button>
              </div>

              <template v-else>
                <div class="table-scroll" role="region" aria-label="Filtered report records" tabindex="0">
                  <table :class="['report-data-table', `report-data-table--${type}`]">
                    <!-- Fixed column widths keep each header and its row values on the same grid. -->
                    <colgroup v-if="type === 'donations' || type === 'campaigns'">
                      <col
                        v-for="col in table.columns"
                        :key="col.key"
                        :style="{ width: reportColumnWidth(col) }"
                      />
                    </colgroup>
                    <thead>
                      <tr>
                        <th v-for="col in table.columns" :key="col.key" scope="col">
                          <span class="column-heading">
                            <ion-icon
                              v-if="reportColumnIcon(col)"
                              :icon="reportColumnIcon(col)"
                              aria-hidden="true"
                              class="column-heading-icon"
                            />
                            {{ col.label }}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, index) in shownRows" :key="index">
                        <td
                          v-for="col in table.columns"
                          :key="col.key"
                          :class="{ num: col.type === 'money' || col.type === 'number' }"
                        >
                          <span v-if="col.label === 'Status' && String(row[col.key]).toLowerCase() === 'verified'" class="verified-label">
                            <ion-icon :icon="shieldCheckmarkOutline" aria-hidden="true" />
                            {{ displayCell(col, row[col.key]) }}
                          </span>
                          <template v-else>{{ displayCell(col, row[col.key]) }}</template>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p v-if="table.rows.length > MAX_SHOWN" class="table-note">
                  Showing the first {{ MAX_SHOWN }} of {{ table.rows.length }} records. The downloaded CSV contains all records.
                </p>
              </template>
            </section>
          </template>
        </section>
        <footer class="page-footer">
          <span>Small acts. Big hearts. <b>♥</b></span>
          <span>ReliefGO Administration</span>
        </footer>
      </main>
    </ion-content>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
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
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonModal,
  IonButton,
  IonSpinner,
  IonIcon,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  alertCircleOutline, documentTextOutline, downloadOutline,
  arrowForwardOutline, heartOutline, receiptOutline,
  megaphoneOutline, optionsOutline, refreshOutline, shieldCheckmarkOutline,
  barChartOutline, peopleOutline, notificationsOutline, logOutOutline, menuOutline,
  calendarOutline, calendarClearOutline, personOutline, personCircleOutline,
  cashOutline, cardOutline, pricetagOutline, flagOutline, walletOutline,
  timeOutline, documentOutline, checkmarkCircleOutline, keypadOutline,
  chevronDownOutline,
} from 'ionicons/icons';
import { currentUser } from '../services/authState';
import { logoutUser } from '../services/authService';
import { loadAdminData } from '../services/adminDataService';
import type { AdminData } from '../services/adminDataService';
import {
  ALL,
  REPORT_STATUS_OPTIONS,
  buildReport,
  downloadCsv,
  reportToCsv,
} from '../services/reportService';
import type { ReportColumn, ReportFilters, ReportType } from '../services/reportService';
import { CAMPAIGN_CATEGORIES } from '../models/Campaign';
import { formatDate, formatPeso } from '../utils/format';
import { confirmLogout, showToast } from '../utils/ui';

const router = useRouter();
const REPORTS_MENU_ID = 'reports-admin-menu';

async function toggleAdminMenu() {
  await menuController.toggle(REPORTS_MENU_ID);
}

async function handleLogout() {
  if (!(await confirmLogout())) return;
  await menuController.close(REPORTS_MENU_ID).catch(() => undefined);
  await logoutUser();
  await router.replace('/welcome');
}

const MAX_SHOWN = 100;

// Presentation only. Name and initials come from the existing authentication state.
const fullName = computed(() => currentUser.value?.displayName?.trim() || 'ReliefGO Admin');
const userInitials = computed(() => {
  const parts = fullName.value.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : fullName.value.slice(0, 2)).toUpperCase();
});


const data = ref<AdminData | null>(null);
const loading = ref(true);
const errorMessage = ref('');

const reportType = ref<string>('donations');
const type = computed(() => reportType.value as ReportType);
const reportTitle = computed(() => ({
  donations: 'Donation',
  expenses: 'Expense',
  campaigns: 'Campaign',
})[type.value]);

const filters = reactive<ReportFilters>({
  campaignId: ALL,
  category: ALL,
  status: ALL,
  dateFrom: '',
  dateTo: '',
});

const statusOptions = computed(() => REPORT_STATUS_OPTIONS[type.value]);

const campaignOptions = computed(() =>
  (data.value?.campaigns ?? [])
    .map((c) => ({ id: c.id, title: c.title }))
    .sort((a, b) => a.title.localeCompare(b.title))
);

const table = computed(() => (data.value ? buildReport(type.value, data.value, filters) : null));
const shownRows = computed(() => table.value?.rows.slice(0, MAX_SHOWN) ?? []);

// Icons are for the Donation and Campaign report headers only.
// CSV columns and report data remain exactly as defined in reportService.
const reportHeaderIcons: Record<'donations' | 'campaigns', Record<string, string>> = {
  donations: {
    'Submitted': calendarOutline,
    'Campaign': megaphoneOutline,
    'Donor account': personCircleOutline,
    'Amount': cashOutline,
    'Method': cardOutline,
    'Reference no.': keypadOutline,
    'Status': checkmarkCircleOutline,
    'Rejection reason': documentOutline,
  },
  campaigns: {
    'Campaign': megaphoneOutline,
    'Owner': personOutline,
    'Category': pricetagOutline,
    'Status': checkmarkCircleOutline,
    'Goal': flagOutline,
    'Verified donations': walletOutline,
    'Verified donors': peopleOutline,
    'Deadline': timeOutline,
    'Created': calendarClearOutline,
  },
};

function reportColumnIcon(column: ReportColumn): string | undefined {
  if (type.value !== 'donations' && type.value !== 'campaigns') return;
  return reportHeaderIcons[type.value][column.label];
}

// The date filters stay empty ("Select date") until the admin confirms a date.
// A custom trigger prevents ion-datetime-button from showing today's date by default.
const activeDatePicker = ref<'dateFrom' | 'dateTo' | null>(null);

function openDatePicker(field: 'dateFrom' | 'dateTo') {
  activeDatePicker.value = field;
}

function closeDatePicker() {
  activeDatePicker.value = null;
}

// The existing reportService date filters still receive YYYY-MM-DD strings.
function setFilterDate(field: 'dateFrom' | 'dateTo', event: CustomEvent<{ value?: string | string[] | null }>) {
  const selected = event.detail.value;
  filters[field] = typeof selected === 'string' ? selected.slice(0, 10) : '';
  closeDatePicker();
}

function handleDatePicked(event: CustomEvent<{ value?: string | string[] | null }>) {
  const field = activeDatePicker.value;
  if (!field) return;
  setFilterDate(field, event);
}

// Only specify column sizing for Donation and Campaign reports.
// Expense table layout, report fields, calculations, and CSV are untouched.
const reportColumnWidths: Record<'donations' | 'campaigns', Record<string, string>> = {
  donations: {
    'Submitted': '160px',
    'Campaign': '290px',
    'Donor account': '230px',
    'Amount': '150px',
    'Method': '130px',
    'Reference no.': '180px',
    'Status': '145px',
    'Rejection reason': '230px',
  },
  campaigns: {
    'Campaign': '320px',
    'Owner': '230px',
    'Category': '175px',
    'Status': '130px',
    'Goal': '160px',
    'Verified donations': '205px',
    'Verified donors': '180px',
    'Deadline': '165px',
    'Created': '165px',
  },
};

function reportColumnWidth(column: ReportColumn): string | undefined {
  if (type.value !== 'donations' && type.value !== 'campaigns') return undefined;
  return reportColumnWidths[type.value][column.label];
}

// Each report type has its own statuses, so reset that filter when switching
watch(reportType, () => {
  filters.status = ALL;
});

function clearFilters() {
  filters.campaignId = ALL;
  filters.category = ALL;
  filters.status = ALL;
  filters.dateFrom = '';
  filters.dateTo = '';
}

function displayCell(column: ReportColumn, value: string | number | undefined): string {
  if (value === undefined || value === '') return '';
  if (column.type === 'money') return formatPeso(Number(value));
  if (column.type === 'date') return formatDate(String(value));
  return String(value);
}

function handleDownload() {
  if (!table.value) return;
  const csv = reportToCsv(table.value);
  const today = new Date().toLocaleDateString('en-CA');
  downloadCsv(`relief-go-${type.value}-report-${today}.csv`, csv);
  showToast('Report downloaded.');
}

onIonViewWillEnter(async () => {
  if (!data.value) loading.value = true;
  errorMessage.value = '';

  try {
    data.value = await loadAdminData();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load the data.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Same ReliefGO brand palette used by the redesigned Admin Dashboard. */
.rg-reports-page {
  --forest: #173729;
  --deep: #112b20;
  --cream: #fbf0dc;
  --paper: #fffaf0;
  --gold: #f3b75d;
  --terracotta: #be563b;
  --border: #e9ddc7;
  --muted: #697568;
  font-family: 'DM Sans', 'Avenir Next', 'Segoe UI', Arial, sans-serif;
  color: var(--forest);
  background: var(--cream);
}
.rg-reports-page * { box-sizing: border-box; }
.rg-reports-page h1, .rg-reports-page h2, .rg-reports-page h3,
.rg-reports-page h4, .rg-reports-page p { margin-top: 0; }
.rg-reports-page h1, .rg-reports-page h2, .rg-reports-page h3,
.rg-reports-page h4, .brand, .summary-card strong { font-family: Georgia, 'Times New Roman', serif; }
.rg-reports-page a,
.rg-reports-page a:link,
.rg-reports-page a:visited,
.rg-reports-page a:hover,
.rg-reports-page a:active {
  text-decoration: none !important;
  text-decoration-line: none !important;
}

/* Navbar: matches Admin Dashboard, with profile at the right. */
.reports-header { box-shadow: none; }
.reports-header::after { display: none; }
.reports-toolbar {
  --background: #fbf0dc;
  --color: #173729;
  --padding-start: 0;
  --padding-end: 0;
  --min-height: 73px;
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  min-height: 72px;
  width: 100%;
  padding: 8px clamp(17px, 3.2vw, 55px);
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
}
.nav-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
.menu-trigger { display: none; margin: 0; --color: var(--forest); --padding-start: 5px; --padding-end: 5px; font-size: 23px; }
.topbar-user { display: flex; align-items: center; gap: 10px; min-width: 0; }
.topbar-avatar { display: grid; place-items: center; flex: 0 0 41px; width: 41px; height: 41px; border-radius: 50%; background: var(--gold); color: var(--deep); font: 700 14px Georgia,serif; }
.topbar-identity { display: flex; flex-direction: column; min-width: 0; gap: 4px; line-height: 1.3; }
.topbar-identity strong { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; }
.topbar-identity small { color: var(--terracotta); font-size: 9px; font-weight: 800; letter-spacing: 1.1px; }
.brand { font-size: clamp(25px, 2.1vw, 33px); line-height: 1; letter-spacing: -1.9px; font-weight: 700; white-space: nowrap; }
.brand span, .brand sup { color: var(--terracotta); }
.brand sup { font-size: 12px; margin-left: 2px; vertical-align: top; }
.nav-divider { height: 22px; width: 1px; background: #d9ccb4; }
.nav-page-name { font-size: 10px; letter-spacing: 1.25px; font-weight: 800; white-space: nowrap; }

.reports-content { --background: #fbf0dc; --padding-top: 0; --padding-bottom: 0; --padding-start: 0; --padding-end: 0; }
.page-wrapper { width: 100%; max-width: 1490px; margin: auto; padding: clamp(18px, 2.2vw, 32px) clamp(16px, 3.3vw, 55px) 32px; }
.hero-banner {
  min-height: 237px; border-radius: 22px; overflow: hidden;
  background: radial-gradient(circle at 72% 105%, rgba(232,174,76,.11), transparent 42%), linear-gradient(115deg,#173729,#112b20);
  color: #fff8e7; display: flex; align-items: center; justify-content: space-between;
  gap: 25px; padding: clamp(25px, 3.1vw, 49px) clamp(25px, 4vw, 63px);
}
.hero-copy { min-width: 0; max-width: 705px; }
.eyebrow { margin: 0 0 11px; font-size: 10px; font-weight: 800; letter-spacing: 1.8px; color: var(--terracotta); }
.hero-eyebrow { color: var(--gold); }
.hero-banner h1 { font-size: clamp(35px, 3.8vw, 58px); font-weight: 400; line-height: 1.11; letter-spacing: -2.1px; margin-bottom: 13px; }
.hero-banner h1 em { color: var(--gold); font-weight: 400; }
.hero-copy > p:last-child { color: #e1e6d7; font-size: 13px; line-height: 1.8; max-width: 550px; margin: 0; }
.admin-identity {
  display: flex; align-items: center; gap: 16px; flex: 0 0 auto;
  min-width: 300px; max-width: 420px;
  padding: 17px; border: 1px solid rgba(255,255,255,.21); border-radius: 17px;
  background: rgba(255,255,255,.07);
}
.identity-avatar { width: 66px; height: 66px; flex: 0 0 66px; display: grid; place-items: center; border-radius: 50%; background: var(--gold); color: var(--deep); font: 700 24px Georgia,serif; }
.identity-details { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.identity-details .eyebrow { font-size: 9px; margin: 0; }
.identity-details strong { font: 500 clamp(18px, 1.5vw, 23px) Georgia,serif; overflow-wrap: anywhere; }
.identity-details small { color: #e1e6d7; font-size: 11px; }

.reports-workspace { margin-top: 31px; }
.section-head { display: flex; justify-content: space-between; margin-bottom: 21px; }
.section-head h2 { font-weight: 400; font-size: clamp(27px, 2.65vw, 40px); letter-spacing: -1.3px; line-height: 1.1; margin-bottom: 9px; }
.section-head h2 em { color: var(--terracotta); font-weight: 400; }
.section-description { font-size: 12px; color: var(--muted); line-height: 1.7; margin-bottom: 0; }

/* Report type tabs */
.report-tabs {
  --background: #fffaf0; padding: 5px; border: 1px solid var(--border);
  border-radius: 17px; max-width: 710px; min-height: 56px; margin-bottom: 22px;
}
.report-tabs ion-segment-button {
  --color: var(--forest); --color-checked: var(--forest); --indicator-color: var(--gold);
  --indicator-box-shadow: none; --border-radius: 12px;
  font-size: 12px; font-weight: 800; letter-spacing: .2px;
  min-height: 46px; text-transform: none;
}
.report-tabs ion-segment-button ion-icon { display: inline-block; font-size: 16px; margin: 0 5px 0 0; vertical-align: middle; }
.report-tabs ion-segment-button ion-label { display: inline-block; vertical-align: middle; }

/* Filters: labels are external, so there is no overlap with selected values. */
.filters-panel, .results-panel { background: var(--paper); border: 1px solid var(--border); border-radius: 20px; }
.filters-panel { padding: clamp(18px, 2.6vw, 32px); margin-bottom: 20px; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 21px; }
.panel-heading h3 { font-size: clamp(21px, 1.9vw, 28px); font-weight: 400; margin: 0; display: flex; align-items: center; gap: 9px; }
.panel-heading h3 ion-icon { font-size: 21px; color: var(--terracotta); }
.clear-button, .empty-clear { background: transparent; border: 0; cursor: pointer; color: var(--forest); font: 800 10px 'DM Sans',sans-serif; letter-spacing: 1.1px; display: inline-flex; align-items: center; gap: 8px; padding: 9px 2px; }
.clear-button ion-icon, .empty-clear ion-icon { font-size: 16px; }
.clear-button:hover, .empty-clear:hover { color: var(--terracotta); }
.filter-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px; }
.field-wrap { min-width: 0; }
.field-label { display: block; font-size: 10px; text-transform: uppercase; font-weight: 800; color: #536257; margin-bottom: 8px; letter-spacing: 1.2px; }
.rg-field {
  --background: #fffdf7; --color: var(--forest);
  --border-color: #d9cbb4; --border-radius: 11px;
  --highlight-color-focused: var(--forest);
  width: 100%; min-height: 50px; font-size: 13px;
}
.rg-field::part(native) { min-height: 50px; }
/* Calendar-only date filters: match the existing input styling. */
.date-picker-field {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 50px;
  padding: 0 13px;
  border: 1px solid #d9cbb4;
  border-radius: 11px;
  background: #fffdf7;
  color: var(--forest);
}
.date-picker-field > ion-icon { flex: none; color: var(--terracotta); font-size: 18px; }
.date-picker-trigger {
  width: 100%;
  cursor: pointer;
  text-align: left;
  font: 500 13px 'DM Sans', 'Segoe UI', sans-serif;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.date-picker-trigger:hover { border-color: var(--terracotta); }
.date-picker-trigger:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
.date-picker-trigger span { flex: 1; min-width: 0; color: var(--forest); }
.date-picker-trigger .date-placeholder { color: var(--muted); }
.date-picker-trigger .date-chevron { margin-left: auto; font-size: 15px; color: var(--muted); }
/* Ionic overlays render outside the page; these global selectors style only this picker. */
:global(ion-modal.report-calendar-modal) {
  --width: min(94vw, 380px);
  --height: auto;
  --border-radius: 18px;
  --background: #fffaf0;
  --box-shadow: 0 16px 44px rgba(17, 43, 32, .2);
}
:global(ion-modal.report-calendar-modal ion-datetime) {
  --background: #fffaf0;
  --title-color: #173729;
  width: 100%;
  color: #173729;
}
.column-heading { display: inline-flex; align-items: center; gap: 7px; }
.column-heading-icon { flex: none; color: var(--terracotta); font-size: 14px; }
.verified-label { display: inline-flex; align-items: center; gap: 6px; }
.verified-label ion-icon { color: #287d4c; font-size: 16px; flex: none; }

.summary-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 17px; margin-bottom: 23px; }
.summary-card { background: var(--paper); border: 1px solid var(--border); border-radius: 18px; min-height: 176px; padding: 21px 25px; display: flex; flex-direction: column; align-items: flex-start; }
.summary-icon { font-size: 24px; color: var(--terracotta); margin-bottom: 14px; }
.summary-label { color: var(--terracotta); font-size: 10px; letter-spacing: 1.5px; font-weight: 800; text-transform: uppercase; overflow-wrap: anywhere; }
.summary-card strong { display: block; margin: 5px 0; font-size: clamp(26px, 3vw, 42px); font-weight: 400; letter-spacing: -1px; line-height: 1.2; overflow-wrap: anywhere; }
.summary-card small { font-size: 11px; color: var(--muted); }

.results-panel { padding: clamp(18px, 2.6vw, 32px); }
.results-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; margin-bottom: 19px; }
.results-heading h3 { font-size: clamp(25px, 2.5vw, 35px); font-weight: 400; letter-spacing: -1px; margin-bottom: 8px; }
.results-heading h3 em { color: var(--terracotta); font-weight: 400; }
.results-heading p:last-child { font-size: 12px; color: var(--muted); line-height: 1.7; margin-bottom: 0; }
.download-button { --background: var(--gold); --color: var(--deep); --border-radius: 26px; --box-shadow: none; font-size: 10px; font-weight: 800; letter-spacing: .6px; min-height: 44px; margin: 0; flex-shrink: 0; }
.download-button:hover { --background: #f0bc62; }
.download-button[disabled] { opacity: .45; }
.table-scroll { max-width: 100%; overflow: auto; border: 1px solid #e6dccb; border-radius: 13px; background: #fffdf8; }
.table-scroll:focus-visible { outline: 3px solid var(--gold); outline-offset: 2px; }
table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12px; }
th, td { padding: 15px 16px; border-bottom: 1px solid #efe6d8; text-align: left; vertical-align: middle; white-space: nowrap; }
th { position: sticky; top: 0; z-index: 1; background: #e9eee4; color: var(--forest); text-transform: uppercase; font-size: 10px; letter-spacing: .8px; font-weight: 800; }
tbody tr:nth-child(even) { background: #fcf8ed; }
tbody tr:hover { background: #f5eedf; }
tbody tr:last-child td { border-bottom: 0; }
td.num { text-align: right; font-variant-numeric: tabular-nums; }
/* Donation/Campaign headers and rows share fixed column widths.
   Icons occupy 14px + 7px gap, so values start directly below the text label. */
.report-data-table--donations,
.report-data-table--campaigns { table-layout: fixed; }
.report-data-table--donations { min-width: 1515px; }
.report-data-table--campaigns { min-width: 1730px; }
.report-data-table--donations th,
.report-data-table--campaigns th { white-space: nowrap; }
.report-data-table--donations tbody td,
.report-data-table--campaigns tbody td {
  padding-left: 37px;
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.5;
  font-variant-numeric: tabular-nums;
}
.report-data-table--donations .column-heading,
.report-data-table--campaigns .column-heading { display: inline-flex; align-items: center; gap: 7px; }
.table-note { color: var(--muted); font-size: 11px; margin: 13px 0 0; line-height: 1.6; }
.empty-results { text-align: center; padding: 40px 20px 48px; background: #fffcf6; border: 1px dashed #decdb1; border-radius: 16px; }
.empty-icon { display: inline-grid; place-items: center; width: 70px; height: 70px; border-radius: 50%; background: #f4e6ca; color: var(--terracotta); margin-bottom: 18px; }
.empty-icon ion-icon { font-size: 33px; }
.empty-results h4 { font-size: 26px; font-weight: 400; margin-bottom: 9px; }
.empty-results > p:last-of-type { color: var(--muted); font-size: 12px; line-height: 1.7; }
.empty-results .eyebrow { color: var(--terracotta); }

.state-box { padding: 52px 22px; text-align: center; border: 1px solid var(--border); border-radius: 18px; background: var(--paper); color: var(--forest); }
.state-box ion-spinner, .state-icon { color: var(--terracotta); font-size: 39px; }
.state-box h3 { font-size: 25px; font-weight: 400; margin: 15px 0 10px; }
.state-box p { font-size: 13px; color: var(--muted); margin-bottom: 0; }
.error-state .state-icon { color: #af4d3d; }
.page-footer { display: flex; justify-content: space-between; gap: 12px; padding: 30px 3px 5px; font-size: 11px; color: var(--muted); }
.page-footer b { color: var(--terracotta); }

@media (max-width: 950px) {
  .hero-banner { align-items: flex-start; flex-direction: column; gap: 23px; }
  .admin-identity { min-width: 0; width: min(100%,420px); }
  .filter-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
}
@media (max-width: 610px) {
  .nav-inner { min-height: 65px; gap: 9px; padding-inline: 15px; }
  .nav-left { gap: 7px; }
  .brand { font-size: 26px; }
  .nav-divider, .nav-page-name, .topbar-identity { display: none; }
  .page-wrapper { padding: 16px 13px 24px; }
  .hero-banner { padding: 25px 21px; min-height: 0; border-radius: 18px; }
  .hero-banner h1 { font-size: clamp(31px, 8vw, 42px); }
  .hero-copy > p:last-child { font-size: 12px; }
  .admin-identity { gap: 11px; padding: 13px; }
  .identity-avatar { width: 52px; height: 52px; flex-basis: 52px; font-size: 18px; }
  .identity-details strong { font-size: 18px; }
  .reports-workspace { margin-top: 27px; }
  .report-tabs ion-segment-button { font-size: 10px; min-width: 0; }
  .report-tabs ion-segment-button ion-icon { display: none; }
  .filter-grid { grid-template-columns: 1fr; gap: 13px; }
  .filters-panel, .results-panel { padding: 19px 15px; }
  .panel-heading, .results-heading { flex-direction: column; align-items: flex-start; }
  .summary-grid { gap: 10px; }
  .summary-card { padding: 16px 12px; min-height: 152px; }
  .summary-icon { font-size: 20px; margin-bottom: 9px; }
  .summary-label { font-size: 9px; letter-spacing: .9px; }
  .summary-card strong { font-size: clamp(20px, 5.5vw, 28px); }
  .summary-card small { font-size: 10px; }
  .download-button { width: 100%; }
  .page-footer { flex-direction: column; text-align: center; }
}
/* --------------------------------------------------------------------------
   ADMIN SIDEBAR — dashboard-matching 266px desktop / mobile drawer
   -------------------------------------------------------------------------- */
.rg-reports-page .reports-admin-main {
  left: 266px;
  width: calc(100% - 266px);
  min-width: 0;
}
.admin-desktop-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 100;
  width: 266px;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  color: #fffaf0;
  background: #123527;
  box-shadow: 5px 0 22px #112b2021;
}
.desktop-brand {
  padding: 30px 22px 27px;
  border-bottom: 1px solid #ffffff25;
  font: 700 28px Georgia, 'Times New Roman', serif;
}
.desktop-brand span, .desktop-brand sup { color: var(--gold); }
.desktop-brand sup { margin-left: 2px; font-size: 12px; }
.desktop-brand small {
  display: block;
  margin-top: 10px;
  color: #ecd8a7;
  font: 800 9px 'DM Sans', sans-serif;
  letter-spacing: 2px;
}
.desktop-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  margin: 21px 14px;
  padding: 13px 10px;
  border-radius: 14px;
  background: #ffffff11;
}
.desktop-profile > div { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.desktop-profile strong { font-size: 13px; overflow-wrap: anywhere; }
.desktop-profile small { color: #f0cc91; font-size: 9px; letter-spacing: .9px; }
.menu-avatar {
  display: grid;
  place-items: center;
  flex: 0 0 49px;
  width: 49px;
  height: 49px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--deep);
  font: 700 18px Georgia, serif;
}
.desktop-nav-title {
  margin: 13px 22px 12px;
  color: var(--gold);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.3px;
}
.desktop-links {
  display: grid;
  align-content: start;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  gap: 5px;
  padding: 0 12px;
}
.desktop-links a {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  gap: 13px;
  min-height: 49px;
  padding: 12px 13px;
  color: #fbf0dc;
  border: 0;
  border-radius: 12px;
  box-shadow: none;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.25;
  text-decoration: none !important;
  transition: background .2s;
}
.desktop-links a ion-icon { flex: none; color: var(--gold); font-size: 20px; }
.desktop-links a:hover,
.desktop-links a.desktop-active {
  background: #ffffff22;
  color: #fff;
  border-bottom: 0;
  text-decoration: none !important;
}
.desktop-links a:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: -2px;
  text-decoration: none !important;
}
.desktop-sidebar-bottom {
  flex-shrink: 0;
  margin: auto 17px 0;
  padding: 25px 5px;
  border-top: 1px solid #ffffff25;
  color: #e4ceb3;
  font: italic 14px Georgia, serif;
}
.desktop-sidebar-bottom > span { display: block; }
.rg-sidebar-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  min-height: 44px;
  margin-top: 14px;
  border: 1px solid var(--gold);
  border-radius: 12px;
  background: var(--gold);
  color: var(--forest);
  cursor: pointer;
  font: 800 12px 'Segoe UI', sans-serif;
}
.rg-sidebar-logout:hover { background: #ffdfa3; }
.rg-sidebar-logout:focus-visible { outline: 3px solid var(--terracotta); outline-offset: 2px; }

/* Phone/tablet drawer: accessible through the hamburger button. */
.reports-admin-menu { display: none; --width: min(355px, 87vw); --background: var(--cream); }
.reports-admin-menu::part(container) { border-radius: 0 24px 24px 0; box-shadow: 7px 0 35px rgba(16,42,32,.17); }
.menu-toolbar { --background: var(--forest); --min-height: 108px; }
.menu-heading { display: flex; flex-direction: column; gap: 7px; padding: 20px 25px; }
.menu-brand { color: #fff8e7; font: 700 30px Georgia,serif; letter-spacing: -1.5px; }
.menu-brand span, .menu-brand sup { color: var(--gold); }
.menu-brand sup { margin-left: 3px; font-size: 13px; }
.menu-heading small { color: #e8c77f; font-size: 9px; font-weight: 800; letter-spacing: 2px; }
.menu-content { --background: var(--cream); }
.mobile-menu-body { display: flex; flex-direction: column; min-height: 100%; padding: 20px 0 0; }
.menu-profile {
  display: flex;
  align-items: center;
  gap: 13px;
  margin: 0 18px 25px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--paper);
}
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
.mobile-sidebar-bottom { margin: auto 22px 0; padding: 22px 4px; border-top: 1px solid var(--border); color: var(--muted); font: italic 13px Georgia,serif; }
.mobile-sidebar-bottom > span { display: block; }

/* Keep content aligned to Dashboard's responsive 55px padding. */
.rg-reports-page .page-wrapper {
  width: 100%;
  max-width: 1490px;
  margin: 0 auto;
  padding: clamp(18px, 2.2vw, 32px) clamp(16px, 3.3vw, 55px) 32px;
}

@media (max-width: 900px) {
  .admin-desktop-sidebar { display: none; }
  .rg-reports-page .reports-admin-main { left: 0; width: 100%; }
  .reports-admin-menu { display: block; }
  .menu-trigger { display: inline-flex; }
  .topbar-identity { display: none; }
  .rg-reports-page .page-wrapper { padding-inline: clamp(16px, 3.3vw, 30px); }
}
@media (max-width: 610px) {
  .rg-reports-page .page-wrapper { padding: 16px 13px 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .desktop-links a { transition: none; }
}</style>