import { Routes } from '@angular/router';
import { ComingSoonComponent } from '../../shared/components/coming-soon.component';
import { STUB_MENU_ROUTES } from './back-office-data.mock';
import { SETUP_ROUTES_FRAGMENT } from './setup/setup.routes-fragment';
import { MUTUAL_FUND_ROUTES_FRAGMENT } from './mutual-fund/mutual-fund.routes-fragment';
import { INSURANCE_INVESTMENTS_ROUTES_FRAGMENT } from './insurance-investments/insurance-investments.routes-fragment';
import { PRESENTATIONS_ROUTES_FRAGMENT } from './presentations/presentations.routes-fragment';
import { ADVISORY_SERVICES_ROUTES_FRAGMENT } from './advisory-services/advisory-services.routes-fragment';

const BASE = '/back-office';

/** Every screen built by the five parallel Back Office build tracks. */
const builtFeatureRoutes: Routes = [
  ...SETUP_ROUTES_FRAGMENT,
  ...MUTUAL_FUND_ROUTES_FRAGMENT,
  ...INSURANCE_INVESTMENTS_ROUTES_FRAGMENT,
  ...PRESENTATIONS_ROUTES_FRAGMENT,
  ...ADVISORY_SERVICES_ROUTES_FRAGMENT,
];

const coveredPaths = new Set(builtFeatureRoutes.map((r) => r.path));

/** Every remaining menu link that isn't a real screen yet resolves here, titled correctly. */
const stubRoutes: Routes = STUB_MENU_ROUTES.filter((item) => !coveredPaths.has(item.route.replace(`${BASE}/`, ''))).map((item) => ({
  path: item.route.replace(`${BASE}/`, ''),
  component: ComingSoonComponent,
  data: { title: item.label },
}));

export const BACK_OFFICE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'customer-investments' },

  { path: 'setup', loadComponent: () => import('./setup-index/setup-index.component').then((m) => m.SetupIndexComponent), data: { title: 'Setup' } },
  {
    path: 'customer-investments',
    loadComponent: () => import('./customer-investments-index/customer-investments-index.component').then((m) => m.CustomerInvestmentsIndexComponent),
    data: { title: 'Customer & Investments' },
  },
  {
    path: 'reports-advisory',
    loadComponent: () => import('./reports-advisory-index/reports-advisory-index.component').then((m) => m.ReportsAdvisoryIndexComponent),
    data: { title: 'Reports & Advisory' },
  },

  // Customer Management — fully working screens.
  { path: 'customer-management', pathMatch: 'full', redirectTo: 'customer-management/master' },
  { path: 'customer-management/master', loadComponent: () => import('./customer-management/customers-master.component').then((m) => m.CustomersMasterComponent), data: { title: 'Customers Master' } },
  { path: 'customer-management/master/new', loadComponent: () => import('./customer-management/add-customer.component').then((m) => m.AddCustomerComponent), data: { title: 'Add Customer' } },
  { path: 'customer-management/master/:id', loadComponent: () => import('./customer-management/customer-detail.component').then((m) => m.CustomerDetailComponent), data: { title: 'Customer Detail' } },
  { path: 'customer-management/groups', loadComponent: () => import('./customer-management/customer-groups.component').then((m) => m.CustomerGroupsComponent), data: { title: 'Customer Groups' } },
  { path: 'customer-management/groups/:id', loadComponent: () => import('./customer-management/group-detail.component').then((m) => m.GroupDetailComponent), data: { title: 'Group Detail' } },
  { path: 'customer-management/merge-groups', loadComponent: () => import('./customer-management/merge-groups.component').then((m) => m.MergeGroupsComponent), data: { title: 'Merge Groups (Family)' } },
  { path: 'customer-management/bulk-merge-groups', loadComponent: () => import('./customer-management/bulk-merge-groups.component').then((m) => m.BulkMergeGroupsComponent), data: { title: 'Bulk Merge Groups' } },
  { path: 'customer-management/merge-customers', loadComponent: () => import('./customer-management/merge-customers.component').then((m) => m.MergeCustomersComponent), data: { title: 'Merge Customers' } },
  { path: 'customer-management/bulk-merge-customers', loadComponent: () => import('./customer-management/bulk-merge-customers.component').then((m) => m.BulkMergeCustomersComponent), data: { title: 'Bulk Merge Customers' } },
  { path: 'customer-management/split-groups', loadComponent: () => import('./customer-management/split-group.component').then((m) => m.SplitGroupComponent), data: { title: 'Split Groups' } },
  { path: 'customer-management/sort-group-members', loadComponent: () => import('./customer-management/sort-group-members.component').then((m) => m.SortGroupMembersComponent), data: { title: 'Sort Group Members' } },
  { path: 'customer-management/renumber-group-codes', loadComponent: () => import('./customer-management/renumber-group-codes.component').then((m) => m.RenumberGroupCodesComponent), data: { title: 'Renumbering of Group Codes' } },
  { path: 'customer-management/browser', loadComponent: () => import('./customer-management/customer-browser.component').then((m) => m.CustomerBrowserComponent), data: { title: 'Customer Browser' } },
  { path: 'customer-management/active-inactive', loadComponent: () => import('./customer-management/active-inactive-customers.component').then((m) => m.ActiveInactiveCustomersComponent), data: { title: 'Active/Inactive Customers' } },
  { path: 'customer-management/import', loadComponent: () => import('./customer-management/import-customers.component').then((m) => m.ImportCustomersComponent), data: { title: 'Import Customers' } },
  { path: 'customer-management/risk-profile-batch-edit', loadComponent: () => import('./customer-management/risk-profile-batch-edit.component').then((m) => m.RiskProfileBatchEditComponent), data: { title: 'Risk Profile Batch Edit' } },
  { path: 'customer-management/risk-assessment/:id', loadComponent: () => import('./customer-management/risk-profile-assessment.component').then((m) => m.RiskProfileAssessmentComponent), data: { title: 'Risk Profile Assessment' } },

  // Setup, Mutual Fund ops, Insurance & Other Investments, Portfolio Presentations, Advisory/Services/New Products.
  ...builtFeatureRoutes,

  // Anything still unbuilt — every link is real and titled, none are dead.
  ...stubRoutes,
];
