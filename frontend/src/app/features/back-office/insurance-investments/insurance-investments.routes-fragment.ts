import { Routes } from '@angular/router';

/**
 * Route entries for the Life Insurance, General Insurance, Other Investments and
 * Document Management screens under /back-office/customer-investments/...
 *
 * This fragment is NOT wired into back-office.routes.ts by this agent (per
 * assignment scope) — it is provided so the routes owner can splice these
 * entries in, replacing the corresponding stub routes generated from
 * CUSTOMER_INVESTMENTS_MENU in back-office-data.mock.ts.
 */
export const INSURANCE_INVESTMENTS_ROUTES_FRAGMENT: Routes = [
  // --- Life Insurance ---
  {
    path: 'customer-investments/life-insurance/policy-entry',
    loadComponent: () => import('./life-insurance/policy-entry.component').then((m) => m.PolicyEntryComponent),
    data: { title: 'Policy Entry' },
  },
  {
    path: 'customer-investments/life-insurance/policy-alteration',
    loadComponent: () => import('./life-insurance/policy-alteration.component').then((m) => m.PolicyAlterationComponent),
    data: { title: 'Policy Alteration' },
  },
  {
    path: 'customer-investments/life-insurance/fup-date-batch-update',
    loadComponent: () => import('./life-insurance/fup-date-batch-update.component').then((m) => m.FupDateBatchUpdateComponent),
    data: { title: 'FUP Date Batch Update' },
  },
  {
    path: 'customer-investments/life-insurance/premium-deposits',
    loadComponent: () => import('./life-insurance/premium-deposits.component').then((m) => m.PremiumDepositsComponent),
    data: { title: 'Premium Deposits' },
  },
  {
    path: 'customer-investments/life-insurance/ulip-unit-adjustments',
    loadComponent: () => import('./life-insurance/ulip-unit-adjustments.component').then((m) => m.UlipUnitAdjustmentsComponent),
    data: { title: 'ULIP Unit Adjustments' },
  },
  {
    path: 'customer-investments/life-insurance/import-data',
    loadComponent: () => import('./life-insurance/import-data.component').then((m) => m.LifeInsuranceImportDataComponent),
    data: { title: 'Import Data' },
  },

  // --- General Insurance ---
  {
    path: 'customer-investments/general-insurance/policies',
    loadComponent: () => import('./general-insurance/policies.component').then((m) => m.GeneralInsurancePoliciesComponent),
    data: { title: 'Policies' },
  },
  {
    path: 'customer-investments/general-insurance/import-policies',
    loadComponent: () => import('./general-insurance/import-policies.component').then((m) => m.GeneralInsuranceImportPoliciesComponent),
    data: { title: 'Import Policies from Excel' },
  },

  // --- Other Investments ---
  {
    path: 'customer-investments/other-investments/masters',
    loadComponent: () => import('./other-investments/masters.component').then((m) => m.OtherInvestmentsMastersComponent),
    data: { title: 'Masters' },
  },
  {
    path: 'customer-investments/other-investments/stocks',
    loadComponent: () => import('./other-investments/stocks.component').then((m) => m.OtherInvestmentsStocksComponent),
    data: { title: 'Stocks' },
  },
  {
    path: 'customer-investments/other-investments/postal-investments',
    loadComponent: () => import('./other-investments/postal-investments.component').then((m) => m.PostalInvestmentsComponent),
    data: { title: 'Postal Investments' },
  },
  {
    path: 'customer-investments/other-investments/fds-rds',
    loadComponent: () => import('./other-investments/fds-rds.component').then((m) => m.FdsRdsComponent),
    data: { title: 'FDs & RDs' },
  },
  {
    path: 'customer-investments/other-investments/ppf',
    loadComponent: () => import('./other-investments/ppf.component').then((m) => m.PpfComponent),
    data: { title: 'PPF' },
  },
  {
    path: 'customer-investments/other-investments/bonds',
    loadComponent: () => import('./other-investments/bonds.component').then((m) => m.BondsComponent),
    data: { title: 'Bonds' },
  },
  {
    path: 'customer-investments/other-investments/debentures',
    loadComponent: () => import('./other-investments/debentures.component').then((m) => m.DebenturesComponent),
    data: { title: 'Debentures' },
  },
  {
    path: 'customer-investments/other-investments/company-deposits',
    loadComponent: () => import('./other-investments/company-deposits.component').then((m) => m.CompanyDepositsComponent),
    data: { title: 'Company Deposits' },
  },
  {
    path: 'customer-investments/other-investments/recurring-deposits',
    loadComponent: () => import('./other-investments/recurring-deposits.component').then((m) => m.RecurringDepositsComponent),
    data: { title: 'Recurring Deposits' },
  },
  {
    path: 'customer-investments/other-investments/income-schemes',
    loadComponent: () => import('./other-investments/income-schemes.component').then((m) => m.IncomeSchemesComponent),
    data: { title: 'Income Schemes' },
  },
  {
    path: 'customer-investments/other-investments/bullion',
    loadComponent: () => import('./other-investments/bullion.component').then((m) => m.BullionComponent),
    data: { title: 'Bullion' },
  },
  {
    path: 'customer-investments/other-investments/pms-transaction-detail',
    loadComponent: () => import('./other-investments/pms-transaction-detail.component').then((m) => m.PmsTransactionDetailComponent),
    data: { title: 'PMS Transaction Detail' },
  },
  {
    path: 'customer-investments/other-investments/import-data',
    loadComponent: () => import('./other-investments/import-data.component').then((m) => m.OtherInvestmentsImportDataComponent),
    data: { title: 'Import Data' },
  },

  // --- Document Management ---
  {
    path: 'customer-investments/document-management/manage-documents',
    loadComponent: () => import('./document-management/manage-documents.component').then((m) => m.ManageDocumentsComponent),
    data: { title: 'Manage Documents' },
  },
];
