export interface CurrencyOption {
  code: string;
  name: string;
}

export interface FxRate {
  pair: string;
  rate: number;
  changePct: number;
  trend: 'up' | 'down';
}

export interface SettlementRule {
  id: string;
  title: string;
  description: string;
  active: boolean;
}

export interface CurrencyAccountBalance {
  accountId: string;
  entityName: string;
  currency: string;
  balance: number;
  baseEquivalent: number;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'GBP', name: 'British Pound' },
];

export const FX_RATES: FxRate[] = [
  { pair: 'USD/INR', rate: 83.145, changePct: 0.12, trend: 'up' },
  { pair: 'SGD/INR', rate: 61.421, changePct: -0.05, trend: 'down' },
  { pair: 'AED/INR', rate: 22.639, changePct: 0.08, trend: 'up' },
  { pair: 'GBP/INR', rate: 105.872, changePct: 0.21, trend: 'up' },
  { pair: 'EUR/INR', rate: 90.318, changePct: -0.14, trend: 'down' },
  { pair: 'AUD/INR', rate: 54.902, changePct: 0.03, trend: 'up' },
];

// 30 daily closing points for the USD/INR trend chart; 3M/1Y views resample the same series.
export const USD_INR_TREND: number[] = [
  82.61, 82.68, 82.72, 82.65, 82.79, 82.85, 82.9, 82.88, 82.95, 83.01, 83.08, 82.97, 83.02, 83.1, 83.05, 83.12, 83.18,
  83.09, 83.15, 83.22, 83.3, 83.24, 83.19, 83.27, 83.33, 83.29, 83.36, 83.4, 83.38, 83.145,
];

export const SETTLEMENT_RULES: SettlementRule[] = [
  { id: 'rule-1', title: 'Sweep USD > 10k', description: 'Convert to INR at End of Day', active: true },
  { id: 'rule-2', title: 'Hold SGD Balances', description: 'No auto-conversion active', active: false },
  { id: 'rule-3', title: 'Sweep AED > 5k', description: 'Convert to INR weekly on Friday close', active: true },
];

export const CURRENCY_ACCOUNT_BALANCES: CurrencyAccountBalance[] = [
  { accountId: 'ACC-8901', entityName: 'Global Tech Holdings', currency: 'USD', balance: 125000, baseEquivalent: 10393125 },
  { accountId: 'ACC-8902', entityName: 'Asia Pac Operations', currency: 'SGD', balance: 45200, baseEquivalent: 2776234 },
  { accountId: 'ACC-8903', entityName: 'Domestic Reserve', currency: 'INR', balance: 32060641, baseEquivalent: 32060641 },
  { accountId: 'ACC-8904', entityName: 'Emirates Family Office', currency: 'AED', balance: 812000, baseEquivalent: 18382868 },
  { accountId: 'ACC-8905', entityName: 'London Advisory Desk', currency: 'GBP', balance: 96400, baseEquivalent: 10206208 },
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  SGD: 'S$',
  AED: 'د.إ',
  GBP: '£',
  EUR: '€',
  AUD: 'A$',
};
