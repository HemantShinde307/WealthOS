import { Routes } from '@angular/router';

export const LOCALIZATION_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'currency-fx' },
  {
    path: 'currency-fx',
    loadComponent: () => import('./currency-fx/currency-fx.component').then((m) => m.CurrencyFxComponent),
    data: { title: 'Currency & FX Management' },
  },
  {
    path: 'market-settings',
    loadComponent: () => import('./market-settings/market-settings.component').then((m) => m.MarketSettingsComponent),
    data: { title: 'Market Settings' },
  },
  {
    path: 'regulatory-framework',
    loadComponent: () =>
      import('./regulatory-framework/regulatory-framework.component').then((m) => m.RegulatoryFrameworkComponent),
    data: { title: 'Regulatory Framework' },
  },
  {
    path: 'translation-manager',
    loadComponent: () =>
      import('./translation-manager/translation-manager.component').then((m) => m.TranslationManagerComponent),
    data: { title: 'Translation Manager' },
  },
];
