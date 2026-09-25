import { Routes } from '@angular/router';

export const PLATFORM_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tenants' },
  {
    path: 'tenants',
    loadComponent: () => import('./platform-tenants.component').then((m) => m.PlatformTenantsComponent),
    data: { title: 'Tenants' },
  },
];
