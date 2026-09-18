import { Routes } from '@angular/router';

export const ADVISOR_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    data: { title: 'Distributor Dashboard' },
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.AdvisorDashboardComponent),
  },
  {
    path: 'portfolio',
    data: { title: 'Client Portfolio' },
    loadComponent: () => import('./portfolio/portfolio.component').then((m) => m.AdvisorPortfolioComponent),
  },
  {
    path: 'portfolio/revenue-analytics',
    data: { title: 'Revenue Analytics' },
    loadComponent: () => import('./portfolio/revenue-analytics.component').then((m) => m.RevenueAnalyticsComponent),
  },
  {
    path: 'portfolio/aum-growth',
    data: { title: 'AUM Growth & Inflow Tracker' },
    loadComponent: () => import('./portfolio/aum-growth.component').then((m) => m.AumGrowthComponent),
  },
  {
    path: 'portfolio/client-profitability',
    data: { title: 'Client Profitability Analysis' },
    loadComponent: () => import('./portfolio/client-profitability.component').then((m) => m.ClientProfitabilityComponent),
  },
  {
    path: 'clients',
    data: { title: 'Clients' },
    loadComponent: () => import('./clients/client-list.component').then((m) => m.ClientListComponent),
  },
  {
    path: 'clients/:id',
    data: { title: 'Client Master' },
    loadComponent: () => import('./clients/client-detail.component').then((m) => m.ClientDetailComponent),
  },
  {
    path: 'transactions',
    data: { title: 'Transactions' },
    loadComponent: () => import('./transactions/transactions.component').then((m) => m.TransactionsComponent),
  },
  {
    path: 'brokerage',
    data: { title: 'Brokerage' },
    loadComponent: () => import('./brokerage/brokerage-dashboard.component').then((m) => m.BrokerageDashboardComponent),
  },
  {
    path: 'brokerage/reports',
    data: { title: 'Commission Reports' },
    loadComponent: () => import('./brokerage/commission-reports.component').then((m) => m.CommissionReportsComponent),
  },
  {
    path: 'brokerage/slabs',
    data: { title: 'Commission Slabs & Rules' },
    loadComponent: () => import('./brokerage/commission-slabs.component').then((m) => m.CommissionSlabsComponent),
  },
  {
    path: 'brokerage/payouts',
    data: { title: 'Payout History' },
    loadComponent: () => import('./brokerage/payout-history.component').then((m) => m.PayoutHistoryComponent),
  },
  {
    path: 'brokerage/forecasting',
    data: { title: 'Commission Forecasting' },
    loadComponent: () => import('./brokerage/commission-forecasting.component').then((m) => m.CommissionForecastingComponent),
  },
  {
    path: 'campaigns',
    data: { title: 'Campaigns Hub' },
    loadComponent: () => import('./campaigns/campaigns-hub.component').then((m) => m.CampaignsHubComponent),
  },
  {
    path: 'campaigns/templates',
    data: { title: 'Template Gallery' },
    loadComponent: () => import('./campaigns/template-gallery.component').then((m) => m.TemplateGalleryComponent),
  },
  {
    path: 'campaigns/analytics',
    data: { title: 'Lead Analytics' },
    loadComponent: () => import('./campaigns/lead-analytics.component').then((m) => m.LeadAnalyticsComponent),
  },
  {
    path: 'campaigns/new',
    data: { title: 'New Campaign Builder' },
    loadComponent: () => import('./campaigns/campaign-builder.component').then((m) => m.CampaignBuilderComponent),
  },
  {
    path: 'chat',
    data: { title: 'Client Chat' },
    loadComponent: () => import('./chat/client-chat.component').then((m) => m.ClientChatComponent),
  },
];
