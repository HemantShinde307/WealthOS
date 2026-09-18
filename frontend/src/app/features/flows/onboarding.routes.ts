import { Routes } from '@angular/router';
import { FlowShellComponent } from '../../core/layout/flow-shell/flow-shell.component';

const FLOW_STEPS = ['Overview', 'Risk Assessment', 'Client Details', 'Document Upload', 'Final Review'];

export const ONBOARDING_ROUTES: Routes = [
  {
    path: '',
    component: FlowShellComponent,
    data: { flowSteps: FLOW_STEPS, flowBrand: 'WealthOS' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        data: { title: 'Welcome to WealthOS', stepIndex: 0 },
        loadComponent: () => import('./onboarding/overview.component').then((m) => m.OverviewComponent),
      },
      {
        path: 'risk-questionnaire',
        data: { title: 'Risk Assessment Questionnaire', stepIndex: 1 },
        loadComponent: () => import('./onboarding/risk-questionnaire.component').then((m) => m.RiskQuestionnaireComponent),
      },
      {
        path: 'risk-results',
        data: { title: 'Your Risk Profile', stepIndex: 1 },
        loadComponent: () => import('./onboarding/risk-results.component').then((m) => m.RiskResultsComponent),
      },
      {
        path: 'client-details',
        data: { title: 'KYC — Client Details', stepIndex: 2 },
        loadComponent: () => import('./onboarding/client-details.component').then((m) => m.ClientDetailsComponent),
      },
      {
        path: 'document-upload',
        data: { title: 'KYC — Document Upload', stepIndex: 3 },
        loadComponent: () => import('./onboarding/document-upload.component').then((m) => m.DocumentUploadComponent),
      },
      {
        path: 'final-review',
        data: { title: 'KYC — Final Review & Submit', stepIndex: 4 },
        loadComponent: () => import('./onboarding/final-review.component').then((m) => m.FinalReviewComponent),
      },
    ],
  },
];
