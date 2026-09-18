import { Routes } from '@angular/router';
import { FlowShellComponent } from '../../core/layout/flow-shell/flow-shell.component';

const FLOW_STEPS = ['Select Scheme', 'Redemption Details', 'Review & Confirm', 'Success'];

export const REDEMPTION_ROUTES: Routes = [
  {
    path: '',
    component: FlowShellComponent,
    data: { flowSteps: FLOW_STEPS, flowBrand: 'WealthOS' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'select-scheme' },
      {
        path: 'select-scheme',
        data: { title: 'Redemption', subtitle: 'Select a holding to redeem', stepIndex: 0 },
        loadComponent: () => import('./redemption/select-scheme.component').then((m) => m.SelectSchemeComponent),
      },
      {
        path: 'details',
        data: { title: 'Redemption Details', stepIndex: 1 },
        loadComponent: () => import('./redemption/details.component').then((m) => m.DetailsComponent),
      },
      {
        path: 'review-confirm',
        data: { title: 'Review & Confirm', stepIndex: 2 },
        loadComponent: () => import('./redemption/review-confirm.component').then((m) => m.ReviewConfirmComponent),
      },
      {
        path: 'success',
        data: { title: 'Redemption Submitted', stepIndex: 3, hideBack: true },
        loadComponent: () => import('./redemption/success.component').then((m) => m.SuccessComponent),
      },
    ],
  },
];
