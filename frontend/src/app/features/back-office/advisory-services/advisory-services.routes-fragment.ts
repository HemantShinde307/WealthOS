import { Routes } from '@angular/router';

// Portfolio Advisory / Services / New Products screens under /back-office/reports-advisory/...
// Paths and titles below match REPORTS_ADVISORY_MENU exactly (see back-office-data.mock.ts).
export const ADVISORY_SERVICES_ROUTES_FRAGMENT: Routes = [
  // Portfolio Advisory — Mutual Fund
  {
    path: 'reports-advisory/advisory/book-profit-stop-loss-advice',
    loadComponent: () => import('./book-profit-stop-loss-advice.component').then((m) => m.BookProfitStopLossAdviceComponent),
    data: { title: 'Book Profit / Stop Loss Advice' },
  },
  {
    path: 'reports-advisory/advisory/elss-redemption-available',
    loadComponent: () => import('./elss-redemption-available.component').then((m) => m.ElssRedemptionAvailableComponent),
    data: { title: 'ELSS Redemption Available' },
  },
  {
    path: 'reports-advisory/advisory/lt-redemption-available',
    loadComponent: () => import('./lt-redemption-available.component').then((m) => m.LtRedemptionAvailableComponent),
    data: { title: 'LT Redemption Available' },
  },

  // Services
  {
    path: 'reports-advisory/services/application-register',
    loadComponent: () => import('./application-register.component').then((m) => m.ApplicationRegisterComponent),
    data: { title: 'Application Register' },
  },
  {
    path: 'reports-advisory/services/view-service-request',
    loadComponent: () => import('./view-service-request.component').then((m) => m.ViewServiceRequestComponent),
    data: { title: 'View Service Request' },
  },

  // New Products
  {
    path: 'reports-advisory/new-products/loan-against-securities',
    loadComponent: () => import('./loan-against-securities.component').then((m) => m.LoanAgainstSecuritiesComponent),
    data: { title: 'Loan Against Securities' },
  },
  {
    path: 'reports-advisory/new-products/equity-baskets',
    loadComponent: () => import('./equity-baskets.component').then((m) => m.EquityBasketsComponent),
    data: { title: 'Equity Baskets' },
  },
  {
    path: 'reports-advisory/new-products/p2p-investment',
    loadComponent: () => import('./p2p-investment.component').then((m) => m.P2pInvestmentComponent),
    data: { title: 'P2P Investment' },
  },
  {
    path: 'reports-advisory/new-products/digigold',
    loadComponent: () => import('./digigold.component').then((m) => m.DigigoldComponent),
    data: { title: 'DigiGold' },
  },
  {
    path: 'reports-advisory/new-products/ecas',
    loadComponent: () => import('./ecas.component').then((m) => m.EcasComponent),
    data: { title: 'eCAS' },
  },
  {
    path: 'reports-advisory/new-products/whatsapp-fintsoclick',
    loadComponent: () => import('./whatsapp-fintsoclick.component').then((m) => m.WhatsappFintsoclickComponent),
    data: { title: 'WhatsApp (FintsoClick)' },
  },
  {
    path: 'reports-advisory/new-products/ipo',
    loadComponent: () => import('./ipo.component').then((m) => m.IpoComponent),
    data: { title: 'IPO' },
  },
];
