import { Routes } from '@angular/router';

// Back Office → Setup — real screens built for all 25 SETUP_MENU items.
// This fragment is NOT registered anywhere by this feature itself; it is merged
// into the central back-office routing table by another process. Do not import
// or wire this file into back-office.routes.ts / app.routes.ts from here.
export const SETUP_ROUTES_FRAGMENT: Routes = [
  // --- Organization Setup ------------------------------------------------
  { path: 'setup/org/branches', loadComponent: () => import('./org/branches.component').then((m) => m.BranchesComponent), data: { title: 'Branches' } },
  { path: 'setup/org/employees', loadComponent: () => import('./org/employees.component').then((m) => m.EmployeesComponent), data: { title: 'Employees' } },
  { path: 'setup/org/associates', loadComponent: () => import('./org/associates.component').then((m) => m.AssociatesComponent), data: { title: 'Associates' } },
  { path: 'setup/org/agencies', loadComponent: () => import('./org/agencies.component').then((m) => m.AgenciesComponent), data: { title: 'Agencies' } },
  { path: 'setup/org/arn-master', loadComponent: () => import('./org/arn-master.component').then((m) => m.ArnMasterComponent), data: { title: 'ARN Master' } },
  {
    path: 'setup/org/principal-broker-relationships',
    loadComponent: () => import('./org/principal-broker-relationships.component').then((m) => m.PrincipalBrokerRelationshipsComponent),
    data: { title: 'Principal Broker Relationships' },
  },

  // --- User Management -----------------------------------------------
  { path: 'setup/users/roles-master', loadComponent: () => import('./users/roles-master.component').then((m) => m.RolesMasterComponent), data: { title: 'Roles Master' } },
  { path: 'setup/users/role-privileges', loadComponent: () => import('./users/role-privileges.component').then((m) => m.RolePrivilegesComponent), data: { title: 'Role Privileges' } },
  { path: 'setup/users/user-master', loadComponent: () => import('./users/user-master.component').then((m) => m.UserMasterComponent), data: { title: 'User Master' } },
  { path: 'setup/users/rm-mapping', loadComponent: () => import('./users/rm-mapping.component').then((m) => m.RmMappingComponent), data: { title: 'Relationship Manager Mapping' } },

  // --- Customer Access -----------------------------------------------------
  { path: 'setup/access/login-management', loadComponent: () => import('./access/login-management.component').then((m) => m.LoginManagementComponent), data: { title: 'Customer Login Management' } },
  {
    path: 'setup/access/sms-email-usage-log',
    loadComponent: () => import('./access/sms-email-usage-log.component').then((m) => m.SmsEmailUsageLogComponent),
    data: { title: 'SMS/Email Usage Log' },
  },
  {
    path: 'setup/access/report-mail-back-log',
    loadComponent: () => import('./access/report-mail-back-log.component').then((m) => m.ReportMailBackLogComponent),
    data: { title: 'Report Mail Back Log' },
  },

  // --- Settings ---------------------------------------------------------
  {
    path: 'setup/settings/application-configuration',
    loadComponent: () => import('./settings/application-configuration.component').then((m) => m.ApplicationConfigurationComponent),
    data: { title: 'Application Configuration' },
  },
  {
    path: 'setup/settings/greetings-configuration',
    loadComponent: () => import('./settings/greetings-configuration.component').then((m) => m.GreetingsConfigurationComponent),
    data: { title: 'Greetings Configuration' },
  },
  {
    path: 'setup/settings/recommended-funds',
    loadComponent: () => import('./settings/recommended-funds.component').then((m) => m.RecommendedFundsComponent),
    data: { title: 'Recommended Funds' },
  },

  // --- Alerts & Notifications --------------------------------------------
  {
    path: 'setup/alerts/intimation-templates',
    loadComponent: () => import('./alerts/intimation-templates.component').then((m) => m.IntimationTemplatesComponent),
    data: { title: 'Intimation Templates' },
  },
  {
    path: 'setup/alerts/scheduling-services',
    loadComponent: () => import('./alerts/scheduling-services.component').then((m) => m.SchedulingServicesComponent),
    data: { title: 'Scheduling Services' },
  },
  {
    path: 'setup/alerts/schedule-service-log',
    loadComponent: () => import('./alerts/schedule-service-log.component').then((m) => m.ScheduleServiceLogComponent),
    data: { title: 'Schedule Service Log' },
  },
  {
    path: 'setup/alerts/communication-panel',
    loadComponent: () => import('./alerts/communication-panel.component').then((m) => m.CommunicationPanelComponent),
    data: { title: 'Communication Panel' },
  },
  {
    path: 'setup/alerts/scheduled-reports-management',
    loadComponent: () => import('./alerts/scheduled-reports-management.component').then((m) => m.ScheduledReportsManagementComponent),
    data: { title: 'Scheduled Reports Management' },
  },

  // --- Miscellaneous ------------------------------------------------------
  { path: 'setup/misc/area-master', loadComponent: () => import('./misc/area-master.component').then((m) => m.AreaMasterComponent), data: { title: 'Area Master' } },
  { path: 'setup/misc/holidays-master', loadComponent: () => import('./misc/holidays-master.component').then((m) => m.HolidaysMasterComponent), data: { title: 'Holidays Master' } },
  { path: 'setup/misc/import-log', loadComponent: () => import('./misc/import-log.component').then((m) => m.ImportLogComponent), data: { title: 'Import Log' } },
  { path: 'setup/misc/version-history', loadComponent: () => import('./misc/version-history.component').then((m) => m.VersionHistoryComponent), data: { title: 'Version History' } },
];
