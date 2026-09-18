import { Routes } from '@angular/router';

// Portfolio Presentations — 28 report screens under /back-office/reports-advisory/presentations/*.
// This fragment is meant to be spread into the back-office reports-advisory route children by
// whichever route file owns that wiring (see AGENT_CONVENTIONS.md — we don't edit
// back-office.routes.ts ourselves). Route paths below match REPORTS_ADVISORY_MENU exactly, minus
// the leading `/back-office/` prefix.
//
// Several near-duplicate menu items intentionally share one parameterised component:
//  - mf-portfolio-valuation-summary(-beta), mf-sip-valuation-cagr(-beta) and
//    mf-comprehensive-portfolio-chart / mf-comprehensive-chart-beta each share a component; the
//    "(Beta)" route just flags `data.beta` to show a beta banner in the shared report header —
//    the underlying computation and table/chart are the same report, which mirrors how the real
//    menu presents them as the same report at two rollout stages.
//  - mf-active-sip-report / mf-active-stp-report / mf-active-swp-report share
//    MfSystematicPlanReportComponent, parameterised by `data.planType`, since all three are the
//    same "list of active systematic plans of a given kind" report differing only by plan type.
// Every other menu item gets its own real, independently data-populated component.
export const PRESENTATIONS_ROUTES_FRAGMENT: Routes = [
  // Consolidated
  {
    path: 'reports-advisory/presentations/crm-centre',
    loadComponent: () => import('./consolidated/crm-centre.component').then((m) => m.CrmCentreComponent),
    data: { title: 'CRM Centre' },
  },
  {
    path: 'reports-advisory/presentations/consolidated-wealth-portfolio',
    loadComponent: () => import('./consolidated/consolidated-wealth-portfolio.component').then((m) => m.ConsolidatedWealthPortfolioComponent),
    data: { title: 'Consolidated Wealth Portfolio' },
  },

  // General Insurance
  {
    path: 'reports-advisory/presentations/policy-fact-sheet',
    loadComponent: () => import('./insurance/policy-fact-sheet.component').then((m) => m.PolicyFactSheetComponent),
    data: { title: 'Policy Fact Sheet' },
  },

  // Stocks
  {
    path: 'reports-advisory/presentations/stocks-portfolio-valuation-report',
    loadComponent: () => import('./stocks/stocks-portfolio-valuation-report.component').then((m) => m.StocksPortfolioValuationReportComponent),
    data: { title: 'Portfolio Valuation Report' },
  },
  {
    path: 'reports-advisory/presentations/stock-ledger',
    loadComponent: () => import('./stocks/stock-ledger.component').then((m) => m.StockLedgerComponent),
    data: { title: 'Stock Ledger' },
  },
  {
    path: 'reports-advisory/presentations/stocks-capital-gains-report',
    loadComponent: () => import('./stocks/stocks-capital-gains-report.component').then((m) => m.StocksCapitalGainsReportComponent),
    data: { title: 'Capital Gains Report' },
  },

  // Mutual Fund
  {
    path: 'reports-advisory/presentations/mf-portfolio-valuation-summary-beta',
    loadComponent: () => import('./mutual-fund/mf-portfolio-valuation-summary.component').then((m) => m.MfPortfolioValuationSummaryComponent),
    data: { title: 'Portfolio Valuation Summary (Beta)', beta: true },
  },
  {
    path: 'reports-advisory/presentations/mf-sip-valuation-cagr-beta',
    loadComponent: () => import('./mutual-fund/mf-sip-valuation-cagr.component').then((m) => m.MfSipValuationCagrComponent),
    data: { title: 'SIP Valuation (CAGR Report) (Beta)', beta: true },
  },
  {
    path: 'reports-advisory/presentations/mf-comprehensive-chart-beta',
    loadComponent: () => import('./mutual-fund/mf-comprehensive-portfolio-chart.component').then((m) => m.MfComprehensivePortfolioChartComponent),
    data: { title: 'Comprehensive Portfolio Chart (Beta)', beta: true },
  },
  {
    path: 'reports-advisory/presentations/mf-portfolio-valuation-summary',
    loadComponent: () => import('./mutual-fund/mf-portfolio-valuation-summary.component').then((m) => m.MfPortfolioValuationSummaryComponent),
    data: { title: 'Portfolio Valuation Summary' },
  },
  {
    path: 'reports-advisory/presentations/mf-periodic-performance-report',
    loadComponent: () => import('./mutual-fund/mf-periodic-performance-report.component').then((m) => m.MfPeriodicPerformanceReportComponent),
    data: { title: 'Periodic Performance Report' },
  },
  {
    path: 'reports-advisory/presentations/mf-portfolio-exposure-summary',
    loadComponent: () => import('./mutual-fund/mf-portfolio-exposure-summary.component').then((m) => m.MfPortfolioExposureSummaryComponent),
    data: { title: 'Portfolio Exposure Summary' },
  },
  {
    path: 'reports-advisory/presentations/mf-portfolio-valuation-cagr',
    loadComponent: () => import('./mutual-fund/mf-portfolio-valuation-cagr.component').then((m) => m.MfPortfolioValuationCagrComponent),
    data: { title: 'Portfolio Valuation (CAGR Report)' },
  },
  {
    path: 'reports-advisory/presentations/mf-sip-valuation-cagr',
    loadComponent: () => import('./mutual-fund/mf-sip-valuation-cagr.component').then((m) => m.MfSipValuationCagrComponent),
    data: { title: 'SIP Valuation (CAGR Report)' },
  },
  {
    path: 'reports-advisory/presentations/mf-portfolio-asset-allocation',
    loadComponent: () => import('./mutual-fund/mf-portfolio-asset-allocation.component').then((m) => m.MfPortfolioAssetAllocationComponent),
    data: { title: 'Portfolio Asset Allocation' },
  },
  {
    path: 'reports-advisory/presentations/mf-portfolio-gain-loss',
    loadComponent: () => import('./mutual-fund/mf-portfolio-gain-loss.component').then((m) => m.MfPortfolioGainLossComponent),
    data: { title: 'Portfolio Gain - Loss' },
  },
  {
    path: 'reports-advisory/presentations/mf-capital-gains-report',
    loadComponent: () => import('./mutual-fund/mf-capital-gains-report.component').then((m) => m.MfCapitalGainsReportComponent),
    data: { title: 'Capital Gains Report' },
  },
  {
    path: 'reports-advisory/presentations/mf-folio-ledger',
    loadComponent: () => import('./mutual-fund/mf-folio-ledger.component').then((m) => m.MfFolioLedgerComponent),
    data: { title: 'Folio Ledger' },
  },
  {
    path: 'reports-advisory/presentations/mf-active-sip-report',
    loadComponent: () => import('./mutual-fund/mf-systematic-plan-report.component').then((m) => m.MfSystematicPlanReportComponent),
    data: { title: 'Active SIP Report', planType: 'SIP' },
  },
  {
    path: 'reports-advisory/presentations/mf-comprehensive-portfolio-chart',
    loadComponent: () => import('./mutual-fund/mf-comprehensive-portfolio-chart.component').then((m) => m.MfComprehensivePortfolioChartComponent),
    data: { title: 'Comprehensive Portfolio Chart' },
  },
  {
    path: 'reports-advisory/presentations/mf-account-statement',
    loadComponent: () => import('./mutual-fund/mf-account-statement.component').then((m) => m.MfAccountStatementComponent),
    data: { title: 'Account Statement' },
  },
  {
    path: 'reports-advisory/presentations/mf-active-stp-report',
    loadComponent: () => import('./mutual-fund/mf-systematic-plan-report.component').then((m) => m.MfSystematicPlanReportComponent),
    data: { title: 'Active STP Report', planType: 'STP' },
  },
  {
    path: 'reports-advisory/presentations/mf-goal-wise-portfolio-report',
    loadComponent: () => import('./mutual-fund/mf-goal-wise-portfolio-report.component').then((m) => m.MfGoalWisePortfolioReportComponent),
    data: { title: 'Goal wise Portfolio Report' },
  },
  {
    path: 'reports-advisory/presentations/mf-active-swp-report',
    loadComponent: () => import('./mutual-fund/mf-systematic-plan-report.component').then((m) => m.MfSystematicPlanReportComponent),
    data: { title: 'Active SWP Report', planType: 'SWP' },
  },

  // FDs, RDs, Bonds & More
  {
    path: 'reports-advisory/presentations/fd-rd-investments-chart',
    loadComponent: () => import('./other-investments/fd-rd-investments-chart.component').then((m) => m.FdRdInvestmentsChartComponent),
    data: { title: 'Investments Chart' },
  },
  {
    path: 'reports-advisory/presentations/ppf-passbook',
    loadComponent: () => import('./other-investments/ppf-passbook.component').then((m) => m.PpfPassbookComponent),
    data: { title: 'PPF Passbook' },
  },
  {
    path: 'reports-advisory/presentations/ppf-challan',
    loadComponent: () => import('./other-investments/ppf-challan.component').then((m) => m.PpfChallanComponent),
    data: { title: 'PPF Challan' },
  },
  {
    path: 'reports-advisory/presentations/bullion-valuation-report',
    loadComponent: () => import('./other-investments/bullion-valuation-report.component').then((m) => m.BullionValuationReportComponent),
    data: { title: 'Bullion Valuation Report' },
  },
];
