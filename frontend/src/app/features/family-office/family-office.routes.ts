import { Routes } from '@angular/router';

export const FAMILY_OFFICE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    data: { title: 'Family Office Master Dashboard' },
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.FamilyDashboardComponent),
  },
  {
    path: 'consolidated-wealth',
    data: { title: 'Consolidated Wealth View' },
    loadComponent: () => import('./consolidated-wealth/consolidated-wealth.component').then((m) => m.ConsolidatedWealthComponent),
  },
  {
    path: 'consolidated-wealth/cas-reconciliation',
    data: { title: 'CAS Reconciliation' },
    loadComponent: () =>
      import('./consolidated-wealth/cas-reconciliation/cas-reconciliation.component').then((m) => m.CasReconciliationComponent),
  },
  {
    path: 'portfolio-aggregator',
    data: { title: 'Family Portfolio Aggregator' },
    loadComponent: () => import('./portfolio-aggregator/portfolio-aggregator.component').then((m) => m.PortfolioAggregatorComponent),
  },
  {
    path: 'transactions',
    data: { title: 'Family Transaction History' },
    loadComponent: () => import('./transactions/transactions.component').then((m) => m.FamilyTransactionsComponent),
  },
  {
    path: 'members',
    data: { title: 'Family Member Management' },
    loadComponent: () => import('./members/member-management.component').then((m) => m.MemberManagementComponent),
  },
  {
    path: 'members/add',
    data: { title: 'Add Family Member' },
    loadComponent: () => import('./members/member-setup.component').then((m) => m.MemberSetupComponent),
  },
  {
    path: 'tax-succession',
    data: { title: 'Tax & Succession Planner' },
    loadComponent: () => import('./tax-succession/tax-succession.component').then((m) => m.TaxSuccessionComponent),
  },
];
