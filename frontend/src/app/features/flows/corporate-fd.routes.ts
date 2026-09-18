import { Routes } from '@angular/router';
import { FlowShellComponent } from '../../core/layout/flow-shell/flow-shell.component';

const FLOW_STEPS = ['Marketplace', 'Application Setup'];

export const CORPORATE_FD_ROUTES: Routes = [
  {
    path: '',
    component: FlowShellComponent,
    data: { flowSteps: FLOW_STEPS, flowBrand: 'WealthOS' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'marketplace' },
      {
        path: 'marketplace',
        data: { title: 'Corporate Fixed Deposits Marketplace', stepIndex: 0 },
        loadComponent: () => import('./corporate-fd/marketplace.component').then((m) => m.MarketplaceComponent),
      },
      {
        path: 'application',
        data: { title: 'Corporate FD — Application Setup', stepIndex: 1 },
        loadComponent: () => import('./corporate-fd/application.component').then((m) => m.ApplicationComponent),
      },
    ],
  },
];
