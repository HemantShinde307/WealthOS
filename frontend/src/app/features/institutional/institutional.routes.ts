import { Routes } from '@angular/router';

export const INSTITUTIONAL_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'global-dashboard' },
  {
    path: 'global-dashboard',
    data: { title: 'Global Institutional Master Dashboard' },
    loadComponent: () => import('./global-dashboard/global-dashboard.component').then((m) => m.GlobalDashboardComponent),
  },
  {
    path: 'india-hub',
    data: { title: 'Institutional Master Dashboard — India Hub' },
    loadComponent: () => import('./india-hub/india-hub.component').then((m) => m.IndiaHubComponent),
  },
  {
    path: 'onboarding',
    data: { title: 'Corporate Onboarding' },
    loadComponent: () => import('./onboarding/onboarding-shell.component').then((m) => m.OnboardingShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'entity-search' },
      {
        path: 'entity-search',
        data: { title: 'Entity Verification' },
        loadComponent: () => import('./onboarding/entity-search/entity-search.component').then((m) => m.EntitySearchComponent),
      },
      {
        path: 'structure-ubos',
        data: { title: 'Business Structure & UBO Mapping' },
        loadComponent: () => import('./onboarding/structure-ubos/structure-ubos.component').then((m) => m.StructureUbosComponent),
      },
      {
        path: 'document-vault',
        data: { title: 'Document Vault' },
        loadComponent: () => import('./onboarding/document-vault/document-vault.component').then((m) => m.DocumentVaultComponent),
      },
      {
        path: 'review-queue',
        data: { title: 'Review Queue' },
        loadComponent: () => import('./onboarding/review-queue/review-queue.component').then((m) => m.ReviewQueueComponent),
      },
    ],
  },
  {
    path: 'regulatory-framework',
    data: { title: 'Regulatory & Compliance Framework' },
    loadComponent: () => import('./regulatory-framework/regulatory-framework.component').then((m) => m.RegulatoryFrameworkComponent),
  },
  {
    path: 'market-settings',
    data: { title: 'Market Settings — India Operations' },
    loadComponent: () => import('./market-settings/market-settings.component').then((m) => m.MarketSettingsComponent),
  },
  {
    path: 'currency-fx',
    data: { title: 'Currency & FX — India Focus' },
    loadComponent: () => import('./currency-fx/currency-fx.component').then((m) => m.CurrencyFxComponent),
  },
];
