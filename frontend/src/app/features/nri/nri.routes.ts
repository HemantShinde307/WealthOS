import { Routes } from '@angular/router';

export const NRI_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'hub' },
  {
    path: 'hub',
    loadComponent: () => import('./hub/nri-hub.component').then((m) => m.NriHubComponent),
    data: { title: 'NRI Wealth Management Hub' },
  },
  {
    path: 'onboarding-compliance',
    loadComponent: () => import('./onboarding-compliance/onboarding-compliance.component').then((m) => m.OnboardingComplianceComponent),
    data: { title: 'NRI Onboarding & Compliance' },
  },
  {
    path: 'taxation-repatriation',
    loadComponent: () => import('./taxation-repatriation/taxation-repatriation.component').then((m) => m.TaxationRepatriationComponent),
    data: { title: 'NRI Taxation & Repatriation Planner' },
  },
  {
    path: 'portfolio-tracker',
    loadComponent: () => import('./portfolio-tracker/portfolio-tracker.component').then((m) => m.PortfolioTrackerComponent),
    data: { title: 'NRI Portfolio & Repatriation Tracker' },
  },
];
