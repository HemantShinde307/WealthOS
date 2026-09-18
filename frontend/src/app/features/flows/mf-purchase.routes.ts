import { Routes } from '@angular/router';
import { FlowShellComponent } from '../../core/layout/flow-shell/flow-shell.component';

const FLOW_STEPS = ['Select Scheme', 'Investment Details', 'Review & Confirm', 'Order Placed'];

export const MF_PURCHASE_ROUTES: Routes = [
  {
    path: '',
    component: FlowShellComponent,
    data: { flowSteps: FLOW_STEPS, flowBrand: 'WealthOS' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'select-scheme' },
      {
        path: 'select-scheme',
        data: { title: 'Mutual Fund Purchase', subtitle: 'Select a scheme to invest in', stepIndex: 0 },
        loadComponent: () => import('./mf-purchase/select-scheme.component').then((m) => m.SelectSchemeComponent),
      },
      {
        path: 'investment-details',
        data: { title: 'Investment Details', stepIndex: 1 },
        loadComponent: () => import('./mf-purchase/investment-details.component').then((m) => m.InvestmentDetailsComponent),
      },
      {
        path: 'review-confirm',
        data: { title: 'Review & Confirm', stepIndex: 2 },
        loadComponent: () => import('./mf-purchase/review-confirm.component').then((m) => m.ReviewConfirmComponent),
      },
      {
        path: 'order-placed',
        data: { title: 'Order Placed', stepIndex: 3, hideBack: true },
        loadComponent: () => import('./mf-purchase/order-placed.component').then((m) => m.OrderPlacedComponent),
      },
    ],
  },
];
