import { Routes } from '@angular/router';
import { DesktopShellComponent } from './core/layout/desktop-shell/desktop-shell.component';
import { MobileShellComponent } from './core/layout/mobile-shell/mobile-shell.component';
import { SHELL_CONFIGS, MOBILE_SHELL_CONFIG } from './core/layout/nav-configs';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/marketing/landing-page.component').then((m) => m.LandingPageComponent) },
  { path: 'about', loadComponent: () => import('./features/marketing/about-page.component').then((m) => m.AboutPageComponent) },
  { path: 'careers', loadComponent: () => import('./features/marketing/career-page.component').then((m) => m.CareerPageComponent) },

  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./features/auth/signup/signup.component').then((m) => m.SignupComponent) },
  { path: 'access-denied', loadComponent: () => import('./features/shared-pages/access-denied.component').then((m) => m.AccessDeniedComponent) },

  // Each portal below is restricted to the role(s) it's actually built for — a logged-in user of
  // a different role is redirected to /access-denied rather than seeing another role's screens.
  {
    path: 'investor',
    component: DesktopShellComponent,
    canActivate: [roleGuard(['investor'])],
    data: { shellConfig: SHELL_CONFIGS['investor'] },
    loadChildren: () => import('./features/investor/investor.routes').then((m) => m.INVESTOR_ROUTES),
  },
  {
    path: 'advisor',
    component: DesktopShellComponent,
    canActivate: [roleGuard(['advisor'])],
    data: { shellConfig: SHELL_CONFIGS['advisor'] },
    loadChildren: () => import('./features/advisor/advisor.routes').then((m) => m.ADVISOR_ROUTES),
  },
  {
    path: 'admin',
    component: DesktopShellComponent,
    canActivate: [roleGuard(['admin'])],
    data: { shellConfig: SHELL_CONFIGS['admin'] },
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'institutional',
    component: DesktopShellComponent,
    canActivate: [roleGuard(['institutional'])],
    data: { shellConfig: SHELL_CONFIGS['institutional'] },
    loadChildren: () => import('./features/institutional/institutional.routes').then((m) => m.INSTITUTIONAL_ROUTES),
  },
  {
    path: 'family-office',
    component: DesktopShellComponent,
    canActivate: [roleGuard(['family_office'])],
    data: { shellConfig: SHELL_CONFIGS['familyOffice'] },
    loadChildren: () => import('./features/family-office/family-office.routes').then((m) => m.FAMILY_OFFICE_ROUTES),
  },
  // NRI Wealth Hub is a client-facing NRI portal — investors use it directly, advisors use it
  // while managing NRI clients. Not part of the 5 core roles' own portals, so allow both.
  {
    path: 'nri',
    component: DesktopShellComponent,
    canActivate: [roleGuard(['investor', 'advisor'])],
    data: { shellConfig: SHELL_CONFIGS['nri'] },
    loadChildren: () => import('./features/nri/nri.routes').then((m) => m.NRI_ROUTES),
  },
  // Deep portfolio/risk/report analytics — used by advisors for client reporting and by admins
  // for platform-wide oversight.
  {
    path: 'analytics',
    component: DesktopShellComponent,
    canActivate: [roleGuard(['advisor', 'admin'])],
    data: { shellConfig: SHELL_CONFIGS['analytics'] },
    loadChildren: () => import('./features/analytics/analytics.routes').then((m) => m.ANALYTICS_ROUTES),
  },
  // Platform-wide configuration (currency/market/regulatory/translation) — admin only.
  {
    path: 'localization',
    component: DesktopShellComponent,
    canActivate: [roleGuard(['admin'])],
    data: { shellConfig: SHELL_CONFIGS['localization'] },
    loadChildren: () => import('./features/localization/localization.routes').then((m) => m.LOCALIZATION_ROUTES),
  },
  // Executive/leadership command center — admin only.
  {
    path: 'executive',
    component: DesktopShellComponent,
    canActivate: [roleGuard(['admin'])],
    data: { shellConfig: SHELL_CONFIGS['executive'] },
    loadChildren: () => import('./features/executive/executive.routes').then((m) => m.EXECUTIVE_ROUTES),
  },
  // Back Office (customer management, org setup, ops) is a staff console — admins run platform
  // setup, advisors run day-to-day customer/transaction operations. Not for end customers.
  {
    path: 'back-office',
    component: DesktopShellComponent,
    canActivate: [roleGuard(['admin', 'advisor'])],
    data: { shellConfig: SHELL_CONFIGS['backOffice'] },
    loadChildren: () => import('./features/back-office/back-office.routes').then((m) => m.BACK_OFFICE_ROUTES),
  },
  {
    path: 'mobile',
    component: MobileShellComponent,
    canActivate: [roleGuard(['investor'])],
    data: { shellConfig: MOBILE_SHELL_CONFIG },
    loadChildren: () => import('./features/mobile/mobile.routes').then((m) => m.MOBILE_ROUTES),
  },

  // Multi-step transactional flows (own FlowShellComponent instance per flow, no sidebar).
  // mf-purchase is reachable from the Investor, Advisor ("New Transaction"), and Family Office
  // dashboards, so all three roles are allowed; the rest are investor self-service only, and
  // onboarding is reached from both self-service signup and the Admin "New Customer" button.
  { path: 'mf-purchase', canActivate: [roleGuard(['investor', 'advisor', 'family_office'])], loadChildren: () => import('./features/flows/mf-purchase.routes').then((m) => m.MF_PURCHASE_ROUTES) },
  { path: 'sip-setup', canActivate: [roleGuard(['investor'])], loadChildren: () => import('./features/flows/sip-setup.routes').then((m) => m.SIP_SETUP_ROUTES) },
  { path: 'redemption', canActivate: [roleGuard(['investor'])], loadChildren: () => import('./features/flows/redemption.routes').then((m) => m.REDEMPTION_ROUTES) },
  { path: 'goal-planning', canActivate: [roleGuard(['investor'])], loadChildren: () => import('./features/flows/goal-planning.routes').then((m) => m.GOAL_PLANNING_ROUTES) },
  { path: 'digital-gold', canActivate: [roleGuard(['investor'])], loadChildren: () => import('./features/flows/digital-gold.routes').then((m) => m.DIGITAL_GOLD_ROUTES) },
  { path: 'gold-sip', canActivate: [roleGuard(['investor'])], loadChildren: () => import('./features/flows/gold-sip.routes').then((m) => m.GOLD_SIP_ROUTES) },
  { path: 'onboarding', canActivate: [roleGuard(['investor', 'admin'])], loadChildren: () => import('./features/flows/onboarding.routes').then((m) => m.ONBOARDING_ROUTES) },
  { path: 'cas-import', canActivate: [roleGuard(['investor'])], loadChildren: () => import('./features/flows/cas-import.routes').then((m) => m.CAS_IMPORT_ROUTES) },
  { path: 'corporate-fd', canActivate: [roleGuard(['investor'])], loadChildren: () => import('./features/flows/corporate-fd.routes').then((m) => m.CORPORATE_FD_ROUTES) },

  // Utility pages every authenticated role can reach.
  { path: 'help-center', canActivate: [authGuard], loadComponent: () => import('./features/shared-pages/help-center.component').then((m) => m.HelpCenterComponent) },
  { path: 'alerts-notifications', canActivate: [authGuard], loadComponent: () => import('./features/shared-pages/alerts-notifications.component').then((m) => m.AlertsNotificationsComponent) },

  { path: '**', redirectTo: 'investor/portfolio' },
];
