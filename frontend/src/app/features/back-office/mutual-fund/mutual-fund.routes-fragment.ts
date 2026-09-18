import { Routes } from '@angular/router';

// Mutual Fund back-office operations — one route entry per screen in the
// "Mutual Fund" column of CUSTOMER_INVESTMENTS_MENU (back-office-data.mock.ts).
// Paths match that menu's routes with the `/back-office/` prefix stripped.
// Merged centrally into back-office.routes.ts alongside the other feature
// route fragments — do not import this into app.routes.ts directly.
export const MUTUAL_FUND_ROUTES_FRAGMENT: Routes = [
  {
    path: 'customer-investments/mutual-fund/folio',
    loadComponent: () => import('./folio-list.component').then((m) => m.FolioListComponent),
    data: { title: 'Folio' },
  },
  {
    path: 'customer-investments/mutual-fund/folio/:id',
    loadComponent: () => import('./folio-detail.component').then((m) => m.FolioDetailComponent),
    data: { title: 'Folio Detail' },
  },
  {
    path: 'customer-investments/mutual-fund/inward',
    loadComponent: () => import('./inward-transaction.component').then((m) => m.InwardTransactionComponent),
    data: { title: 'Inward' },
  },
  {
    path: 'customer-investments/mutual-fund/outward',
    loadComponent: () => import('./outward-transaction.component').then((m) => m.OutwardTransactionComponent),
    data: { title: 'Outward' },
  },
  {
    path: 'customer-investments/mutual-fund/sip',
    loadComponent: () => import('./sip.component').then((m) => m.SipComponent),
    data: { title: 'Systematic Investments (SIP)' },
  },
  {
    path: 'customer-investments/mutual-fund/swp',
    loadComponent: () => import('./swp.component').then((m) => m.SwpComponent),
    data: { title: 'Systematic Withdrawals (SWP)' },
  },
  {
    path: 'customer-investments/mutual-fund/stp',
    loadComponent: () => import('./stp.component').then((m) => m.StpComponent),
    data: { title: 'Systematic Transfers (STPs)' },
  },
  {
    path: 'customer-investments/mutual-fund/import-from-registrar',
    loadComponent: () => import('./import-from-registrar.component').then((m) => m.ImportFromRegistrarComponent),
    data: { title: 'Import from Registrar' },
  },
  {
    path: 'customer-investments/mutual-fund/import-log',
    loadComponent: () => import('./import-log.component').then((m) => m.ImportLogComponent),
    data: { title: 'Import Log' },
  },
  {
    path: 'customer-investments/mutual-fund/import-principal-broker-data',
    loadComponent: () => import('./import-principal-broker-data.component').then((m) => m.ImportPrincipalBrokerDataComponent),
    data: { title: 'Import Principal Broker Data' },
  },
  {
    path: 'customer-investments/mutual-fund/batch-creation-of-transactions',
    loadComponent: () => import('./batch-creation-of-transactions.component').then((m) => m.BatchCreationOfTransactionsComponent),
    data: { title: 'Batch Creation of Transactions' },
  },
  {
    path: 'customer-investments/mutual-fund/brokerage-receivable-structure',
    loadComponent: () => import('./brokerage-receivable-structure.component').then((m) => m.BrokerageReceivableStructureComponent),
    data: { title: 'Brokerage Receivable Structure' },
  },
];
