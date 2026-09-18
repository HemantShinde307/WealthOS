import { Routes } from '@angular/router';

export const EXECUTIVE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'command-center' },
  {
    path: 'command-center',
    loadComponent: () => import('./command-center/command-center.component').then((m) => m.CommandCenterComponent),
    data: { title: 'Executive Command Center' },
  },
  {
    path: 'advanced-analytics',
    loadComponent: () => import('./advanced-analytics/advanced-analytics.component').then((m) => m.AdvancedAnalyticsComponent),
    data: { title: 'Executive Alpha — Advanced Analytics' },
  },
  {
    path: 'aurum',
    loadComponent: () => import('./aurum/aurum.component').then((m) => m.AurumComponent),
    data: { title: 'Executive Alpha — Aurum (Gold)' },
  },
  {
    path: 'brokerage',
    loadComponent: () => import('./brokerage/brokerage.component').then((m) => m.BrokerageComponent),
    data: { title: 'Executive Alpha — Brokerage' },
  },
  {
    path: 'institutional-portfolio',
    loadComponent: () => import('./institutional-portfolio/institutional-portfolio.component').then((m) => m.InstitutionalPortfolioComponent),
    data: { title: 'Executive Alpha — Institutional Portfolio' },
  },
  {
    path: 'marketing',
    loadComponent: () => import('./marketing/marketing.component').then((m) => m.MarketingComponent),
    data: { title: 'Executive Alpha — Marketing Growth' },
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./onboarding/onboarding.component').then((m) => m.OnboardingComponent),
    data: { title: 'Executive Alpha — Onboarding' },
  },
];
