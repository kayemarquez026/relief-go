import { createRouter, createWebHistory } from '@ionic/vue-router';
import { menuController } from '@ionic/vue';
import type { RouteRecordRaw } from 'vue-router';
import type { Component } from 'vue';

import { MEMBER_ROLES } from '../models/User';
import type { UserRole } from '../models/User';

import { currentUser, initAuth } from '../services/authState';
import { dashboardPathForRole } from '../utils/roles';

// Load views without crashing the entire router when a file is missing.
const views = import.meta.glob<{ default: Component }>(
  '../views/*.vue'
);

function loadView(name: string) {
  const path = `../views/${name}.vue`;
  const loader = views[path];

  return loader ?? (() =>
    Promise.reject(
      new Error(`ReliefGO view not found: ${path}`)
    )
  );
}

const memberMeta = {
  requiresAuth: true,
  roles: MEMBER_ROLES
};

const adminMeta = {
  requiresAuth: true,
  roles: ['admin']
};

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/welcome'
  },

  // PUBLIC PAGES
  {
    path: '/welcome',
    name: 'Welcome',
    component: loadView('WelcomePage')
  },
  {
    path: '/campaigns',
    name: 'CampaignList',
    component: loadView('CampaignListPage')
  },
  {
    path: '/campaigns/:id',
    name: 'CampaignDetails',
    component: loadView('CampaignDetailsPage')
  },
  {
    path: '/campaigns/:id/transparency',
    name: 'Transparency',
    component: loadView('TransparencyPage')
  },

  // AUTHENTICATION
  {
    path: '/login',
    name: 'Login',
    component: loadView('LoginPage'),
    meta: { guestOnly: true }
  },
  {
    path: '/admin/login',
    redirect: '/login'
  },
  {
    path: '/register',
    name: 'Register',
    component: loadView('RegisterPage'),
    meta: { guestOnly: true }
  },

  // NOTIFICATIONS
  {
    path: '/notifications',
    name: 'Notifications',
    component: loadView('NotificationsPage'),
    meta: { requiresAuth: true }
  },

  // MEMBER DASHBOARD
  {
    path: '/dashboard',
    name: 'UserDashboard',
    component: loadView('UserDashboardPage'),
    meta: memberMeta
  },
  {
    path: '/donor',
    redirect: '/dashboard'
  },
  {
    path: '/organizer',
    redirect: '/dashboard'
  },
  {
    path: '/my',
    redirect: '/dashboard'
  },

  // DONATIONS
  {
    path: '/campaigns/:id/donate',
    name: 'DonationForm',
    component: loadView('DonationFormPage'),
    meta: memberMeta
  },
  {
    path: '/donor/donations',
    name: 'DonationHistory',
    component: loadView('DonationHistoryPage'),
    meta: memberMeta
  },
  {
    path: '/donor/donations/:id',
    name: 'DonationDetails',
    component: loadView('DonationDetailsPage'),
    meta: memberMeta
  },

  // ORGANIZER
  {
    path: '/organizer/campaigns',
    name: 'MyCampaigns',
    component: loadView('MyCampaignsPage'),
    meta: memberMeta
  },
  {
    path: '/organizer/campaigns/new',
    name: 'CreateCampaign',
    component: loadView('CreateCampaignPage'),
    meta: memberMeta
  },
  {
    path: '/organizer/campaigns/:id/manage',
    name: 'ManageCampaign',
    component: loadView('ManageCampaignPage'),
    meta: memberMeta
  },
  {
    path: '/organizer/campaigns/:id/edit',
    name: 'EditCampaign',
    component: loadView('CreateCampaignPage'),
    meta: memberMeta
  },
  {
    path: '/organizer/campaigns/:id/expenses',
    name: 'CampaignExpenses',
    component: loadView('CampaignExpensesPage'),
    meta: memberMeta
  },
  {
    path: '/organizer/campaigns/:id/expenses/new',
    name: 'AddExpense',
    component: loadView('ExpenseSubmissionPage'),
    meta: memberMeta
  },
  {
    path: '/organizer/campaigns/:id/expenses/:expenseId/edit',
    name: 'EditExpense',
    component: loadView('ExpenseSubmissionPage'),
    meta: memberMeta
  },
  {
    path: '/organizer/campaigns/:id/updates',
    name: 'CampaignUpdates',
    component: loadView('CampaignUpdatesPage'),
    meta: memberMeta
  },

  // VOLUNTEERS
  {
    path: '/my/volunteers',
    name: 'MyVolunteerApplications',
    component: loadView('MyVolunteerApplicationsPage'),
    meta: memberMeta
  },
  {
    path: '/organizer/campaigns/:id/volunteers',
    name: 'EventVolunteers',
    component: loadView('VolunteerManagementPage'),
    meta: { requiresAuth: true, roles: ['organizer'] }
  },

  // LEGACY LINKS
  {
    path: '/organizer/campaigns/:id',
    redirect: to => {
      const id = encodeURIComponent(String(to.params.id));

      if (to.query.tab === 'volunteers') {
        return `/organizer/campaigns/${id}/volunteers`;
      }

      if (to.query.tab === 'expenses') {
        return `/organizer/campaigns/${id}/expenses`;
      }

      if (to.query.tab === 'updates') {
        return `/organizer/campaigns/${id}/updates`;
      }

      return '/organizer/campaigns';
    }
  },

  // ORGANIZER FINANCIAL VERIFICATION — only the campaign owner can access the API data.
  {
    path: '/organizer/campaigns/:id/finances',
    name: 'OrganizerCampaignFinances',
    component: loadView('OrganizerCampaignFinancesPage'),
    meta: memberMeta
  },

  // ADMIN
  {
    path: '/admin/campaigns/:id/view',
    name: 'AdminCampaignDetails',
    component: loadView('AdminCampaignDetailsPage'),
    meta: adminMeta
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: loadView('AdminDashboardPage'),
    meta: adminMeta
  },
  {
    path: '/admin/campaigns',
    name: 'AdminCampaignReview',
    component: loadView('AdminCampaignReviewPage'),
    meta: adminMeta
  },
  {
    path: '/admin/volunteers',
    redirect: '/admin/reports'
  },
  {
    path: '/admin/donations',
    name: 'AdminDonationVerification',
    component: loadView('AdminDonationVerificationPage'),
    meta: adminMeta
  },
  {
    path: '/admin/expenses',
    name: 'AdminExpenseReview',
    component: loadView('AdminExpenseReviewPage'),
    meta: adminMeta
  },
  {
    path: '/admin/users',
    name: 'AdminUserManagement',
    component: loadView('AdminUserManagementPage'),
    meta: adminMeta
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: loadView('AdminReportsPage'),
    meta: adminMeta
  },
  {
    path: '/admin/audit-logs',
    name: 'AdminAuditLogs',
    component: loadView('AdminAuditLogsPage'),
    meta: adminMeta
  },

  // FALLBACK
  {
    path: '/:pathMatch(.*)*',
    redirect: () => currentUser.value ? dashboardPathForRole(currentUser.value.role) : '/campaigns'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach(async to => {
  // Close Ionic menus before the previous routed page is hidden. An open
  // menu locks pointer events and scrolling on its associated main content.
  const openMenu = await menuController.getOpen();
  if (openMenu) {
    await openMenu.close();
  }


  // Public pages do not need to wait for the backend.
  if (!to.meta.requiresAuth && !to.meta.guestOnly) {
    return true;
  }

  await initAuth();

  const user = currentUser.value;

  if (to.meta.requiresAuth && !user) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    };
  }

  if (to.meta.guestOnly && user) {
    return dashboardPathForRole(user.role);
  }

  const allowedRoles = to.meta.roles as UserRole[] | undefined;

  if (
    user &&
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return dashboardPathForRole(user.role);
  }

  return true;
});

export default router;