import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
    data: { title: 'Admin Dashboard' },
  },
  {
    path: 'organization',
    loadComponent: () => import('./organization/organization.component').then((m) => m.OrganizationComponent),
    data: { title: 'Organization' },
  },
  {
    path: 'compliance',
    loadComponent: () => import('./compliance/compliance.component').then((m) => m.ComplianceComponent),
    data: { title: 'Compliance Dashboard' },
  },
  {
    path: 'documents',
    loadComponent: () => import('./documents/documents.component').then((m) => m.DocumentsComponent),
    data: { title: 'Document Vault' },
  },
  {
    path: 'audit-trail',
    loadComponent: () => import('./audit-trail/audit-trail.component').then((m) => m.AuditTrailComponent),
    data: { title: 'Audit Trail & System Logs' },
  },
  {
    path: 'regulatory-reporting',
    loadComponent: () => import('./regulatory-reporting/regulatory-reporting.component').then((m) => m.RegulatoryReportingComponent),
    data: { title: 'Regulatory Reporting Center' },
  },
];
