import { Routes } from '@angular/router';
import { FlowShellComponent } from '../../core/layout/flow-shell/flow-shell.component';

const FLOW_STEPS = ['Select Scheme', 'Investment Details', 'Mandate Selection', 'Review & Confirm', 'Success'];

export const SIP_SETUP_ROUTES: Routes = [
  {
    path: '',
    component: FlowShellComponent,
    data: { flowSteps: FLOW_STEPS, flowBrand: 'WealthOS' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'select-scheme' },
      {
        path: 'select-scheme',
        data: { title: 'SIP Setup', subtitle: 'Select a scheme to invest in', stepIndex: 0 },
        loadComponent: () => import('./sip-setup/select-scheme.component').then((m) => m.SelectSchemeComponent),
      },
      {
        path: 'investment-details',
        data: { title: 'SIP Investment Details', stepIndex: 1 },
        loadComponent: () => import('./sip-setup/investment-details.component').then((m) => m.InvestmentDetailsComponent),
      },
      {
        path: 'mandate-selection',
        data: { title: 'e-Mandate Selection', subtitle: 'Authorize auto-debit for your SIP', stepIndex: 2 },
        loadComponent: () => import('./sip-setup/mandate-selection.component').then((m) => m.MandateSelectionComponent),
      },
      {
        path: 'review-confirm',
        data: { title: 'Review & Confirm', stepIndex: 3 },
        loadComponent: () => import('./sip-setup/review-confirm.component').then((m) => m.ReviewConfirmComponent),
      },
      {
        path: 'success',
        data: { title: 'SIP Activated', stepIndex: 4, hideBack: true },
        loadComponent: () => import('./sip-setup/success.component').then((m) => m.SuccessComponent),
      },
    ],
  },
];
