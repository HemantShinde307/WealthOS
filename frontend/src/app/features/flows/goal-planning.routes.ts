import { Routes } from '@angular/router';
import { FlowShellComponent } from '../../core/layout/flow-shell/flow-shell.component';

const FLOW_STEPS = ['Select Category', 'Define Parameters', 'Investment Strategy'];

export const GOAL_PLANNING_ROUTES: Routes = [
  {
    path: '',
    component: FlowShellComponent,
    data: { flowSteps: FLOW_STEPS, flowBrand: 'WealthOS' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'select-category' },
      {
        path: 'select-category',
        data: { title: 'Create Goal — Select Category', stepIndex: 0 },
        loadComponent: () => import('./goal-planning/select-category.component').then((m) => m.SelectCategoryComponent),
      },
      {
        path: 'define-parameters',
        data: { title: 'Define Parameters', stepIndex: 1 },
        loadComponent: () => import('./goal-planning/define-parameters.component').then((m) => m.DefineParametersComponent),
      },
      {
        path: 'investment-strategy',
        data: { title: 'Investment Strategy', stepIndex: 2 },
        loadComponent: () => import('./goal-planning/investment-strategy.component').then((m) => m.InvestmentStrategyComponent),
      },
    ],
  },
];
