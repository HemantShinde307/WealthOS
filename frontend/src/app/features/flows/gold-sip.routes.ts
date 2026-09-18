import { Routes } from '@angular/router';
import { FlowShellComponent } from '../../core/layout/flow-shell/flow-shell.component';

const FLOW_STEPS = ['Select Plan', 'Investment Details', 'Review & Confirm'];

export const GOLD_SIP_ROUTES: Routes = [
  {
    path: '',
    component: FlowShellComponent,
    data: { flowSteps: FLOW_STEPS, flowBrand: 'WealthOS' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'select-plan' },
      {
        path: 'select-plan',
        data: { title: 'Gold SIP — Select Plan', subtitle: 'Choose a frequency and name your plan', stepIndex: 0 },
        loadComponent: () => import('./gold-sip/select-plan.component').then((m) => m.SelectPlanComponent),
      },
      {
        path: 'investment-details',
        data: { title: 'Investment Details', stepIndex: 1 },
        loadComponent: () => import('./gold-sip/investment-details.component').then((m) => m.InvestmentDetailsComponent),
      },
      {
        path: 'review-confirm',
        data: { title: 'Review & Confirm', stepIndex: 2 },
        loadComponent: () => import('./gold-sip/review-confirm.component').then((m) => m.ReviewConfirmComponent),
      },
    ],
  },
];
