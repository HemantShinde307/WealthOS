import { Routes } from '@angular/router';

export const INVESTOR_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'portfolio' },
  { path: 'portfolio', loadComponent: () => import('./portfolio-dashboard/portfolio-dashboard.component').then((m) => m.PortfolioDashboardComponent) },
  { path: 'portfolio/detailed', loadComponent: () => import('./portfolio-detail/portfolio-detail.component').then((m) => m.PortfolioDetailComponent) },
  { path: 'ai-insights', loadComponent: () => import('./ai-insights/ai-insights.component').then((m) => m.AiInsightsComponent) },
  { path: 'assistant', loadComponent: () => import('./ai-assistant/ai-assistant.component').then((m) => m.AiAssistantComponent) },
  { path: 'mutual-funds', loadComponent: () => import('./mutual-funds/mutual-funds.component').then((m) => m.MutualFundsComponent) },
  { path: 'goals', loadComponent: () => import('./goals/goals.component').then((m) => m.GoalsComponent) },
  { path: 'gold', loadComponent: () => import('./digital-gold/digital-gold.component').then((m) => m.DigitalGoldComponent) },
  { path: 'gold-sip', loadComponent: () => import('./gold-sip/gold-sip.component').then((m) => m.GoldSipComponent) },
  { path: 'fixed-income', loadComponent: () => import('./fixed-income/fixed-income.component').then((m) => m.FixedIncomeComponent) },
  { path: 'fixed-income/trade', loadComponent: () => import('./fixed-income-trade/fixed-income-trade.component').then((m) => m.FixedIncomeTradeComponent) },
  { path: 'fixed-income/analytics', loadComponent: () => import('./fixed-income-analytics/fixed-income-analytics.component').then((m) => m.FixedIncomeAnalyticsComponent) },
  { path: 'fixed-income/:id', loadComponent: () => import('./fixed-income-detail/fixed-income-detail.component').then((m) => m.FixedIncomeDetailComponent) },
  { path: 'insurance', loadComponent: () => import('./insurance/insurance.component').then((m) => m.InsuranceComponent) },
  { path: 'insurance/needs-analysis', loadComponent: () => import('./insurance-needs-analysis/insurance-needs-analysis.component').then((m) => m.InsuranceNeedsAnalysisComponent) },
  { path: 'insurance/renewals', loadComponent: () => import('./insurance-renewals/insurance-renewals.component').then((m) => m.InsuranceRenewalsComponent) },
  { path: 'tax-saving', loadComponent: () => import('./tax-saving/tax-saving.component').then((m) => m.TaxSavingComponent) },
  { path: 'messages', loadComponent: () => import('./messages/messages.component').then((m) => m.MessagesComponent) },
  { path: 'reports', loadComponent: () => import('./reports/reports.component').then((m) => m.ReportsComponent) },
];
