import { Routes } from '@angular/router';
import { FlowShellComponent } from '../../core/layout/flow-shell/flow-shell.component';

const FLOW_STEPS = ['Upload Statement', 'Mapping & Verification', 'Success Summary'];

export const CAS_IMPORT_ROUTES: Routes = [
  {
    path: '',
    component: FlowShellComponent,
    data: { flowSteps: FLOW_STEPS, flowBrand: 'WealthOS' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'upload-statement' },
      {
        path: 'upload-statement',
        data: { title: 'CAS Import — Upload Statement', stepIndex: 0 },
        loadComponent: () => import('./cas-import/upload-statement.component').then((m) => m.UploadStatementComponent),
      },
      {
        path: 'mapping-verification',
        data: { title: 'Mapping & Verification', stepIndex: 1 },
        loadComponent: () => import('./cas-import/mapping-verification.component').then((m) => m.MappingVerificationComponent),
      },
      {
        path: 'success-summary',
        data: { title: 'Import Successful', stepIndex: 2, hideBack: true },
        loadComponent: () => import('./cas-import/success-summary.component').then((m) => m.SuccessSummaryComponent),
      },
    ],
  },
];
