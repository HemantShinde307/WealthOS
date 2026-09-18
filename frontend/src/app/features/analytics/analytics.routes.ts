import { Routes } from '@angular/router';

export const ANALYTICS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'portfolio-overview' },
  {
    path: 'portfolio-overview',
    data: { title: 'Advanced Analytics — Portfolio Overview' },
    loadComponent: () => import('./portfolio-overview/portfolio-overview.component').then((m) => m.PortfolioOverviewComponent),
  },
  {
    path: 'performance-attribution',
    data: { title: 'Performance Attribution' },
    loadComponent: () => import('./performance-attribution/performance-attribution.component').then((m) => m.PerformanceAttributionComponent),
  },
  {
    path: 'risk-stress-testing',
    data: { title: 'Risk & Stress Testing' },
    loadComponent: () => import('./risk-stress-testing/risk-stress-testing.component').then((m) => m.RiskStressTestingComponent),
  },
  {
    path: 'monte-carlo',
    data: { title: 'Monte Carlo Simulations' },
    loadComponent: () => import('./monte-carlo/monte-carlo.component').then((m) => m.MonteCarloComponent),
  },
  {
    path: 'report-center',
    data: { title: 'Report Center' },
    loadComponent: () =>
      import('./report-center/template-library/report-template-library.component').then((m) => m.ReportTemplateLibraryComponent),
  },
  {
    path: 'report-center/configure',
    data: { title: 'Report Center — Configure Report' },
    loadComponent: () =>
      import('./report-center/configuration/report-configuration.component').then((m) => m.ReportConfigurationComponent),
  },
  {
    path: 'report-center/scheduled',
    data: { title: 'Report Center — Scheduled Reports' },
    loadComponent: () =>
      import('./report-center/scheduled/scheduled-reports.component').then((m) => m.ScheduledReportsComponent),
  },
  {
    path: 'report-center/preview',
    data: { title: 'Report Center — Presentation Preview' },
    loadComponent: () =>
      import('./report-center/preview/presentation-preview.component').then((m) => m.PresentationPreviewComponent),
  },
];
