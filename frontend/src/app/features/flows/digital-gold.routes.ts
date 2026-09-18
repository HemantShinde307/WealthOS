import { Routes } from '@angular/router';
import { FlowShellComponent } from '../../core/layout/flow-shell/flow-shell.component';

export const DIGITAL_GOLD_ROUTES: Routes = [
  {
    path: '',
    component: FlowShellComponent,
    data: { flowBrand: 'WealthOS' },
    children: [
      { path: 'buy', data: { title: 'Buy Digital Gold' }, loadComponent: () => import('./digital-gold/buy-gold.component').then((m) => m.BuyGoldComponent) },
      { path: 'sell', data: { title: 'Sell Digital Gold' }, loadComponent: () => import('./digital-gold/sell-gold.component').then((m) => m.SellGoldComponent) },
      {
        path: 'physical-delivery',
        data: { title: 'Request Physical Delivery' },
        loadComponent: () => import('./digital-gold/physical-delivery.component').then((m) => m.PhysicalDeliveryComponent),
      },
    ],
  },
];
