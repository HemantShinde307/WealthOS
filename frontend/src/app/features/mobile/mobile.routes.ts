import { Routes } from '@angular/router';

export const MOBILE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    data: { title: 'Mobile Dashboard' },
    loadComponent: () => import('./dashboard/mobile-dashboard.component').then((m) => m.MobileDashboardComponent),
  },
  {
    path: 'portfolio',
    data: { title: 'Mobile Portfolio' },
    loadComponent: () => import('./portfolio/mobile-portfolio.component').then((m) => m.MobilePortfolioComponent),
  },
  {
    path: 'goals',
    data: { title: 'Mobile Goals Progress' },
    loadComponent: () => import('./goals/mobile-goals.component').then((m) => m.MobileGoalsComponent),
  },
  {
    path: 'tax-saving',
    data: { title: 'Mobile Tax Saving (80C)' },
    loadComponent: () => import('./tax-saving/mobile-tax-saving.component').then((m) => m.MobileTaxSavingComponent),
  },

  // Non-tab routes: the "Invest" transaction flow, reached via clicks (Invest quick action,
  // holding row, goal top-up, tax-saving gap) rather than the bottom tab bar.
  {
    path: 'payment-selection',
    data: { title: 'Select Payment Method' },
    loadComponent: () => import('./transactions/payment-selection.component').then((m) => m.PaymentSelectionComponent),
  },
  {
    path: 'order-review',
    data: { title: 'Order Review' },
    loadComponent: () => import('./transactions/order-review.component').then((m) => m.OrderReviewComponent),
  },
  {
    path: 'transaction-success',
    data: { title: 'Order Placed' },
    loadComponent: () => import('./transactions/transaction-success.component').then((m) => m.TransactionSuccessComponent),
  },
  {
    path: 'transaction-alert',
    data: { title: 'Portfolio Alert' },
    loadComponent: () => import('./transactions/transaction-alert.component').then((m) => m.TransactionAlertComponent),
  },
];
