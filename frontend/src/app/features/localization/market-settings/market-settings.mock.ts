export interface MarketProfile {
  countryCode: string;
  countryName: string;
  regulator: string;
  primaryCurrency: string;
  dateFormat: string;
  languages: string;
  tradingHoursEnabled: boolean;
  status: 'active' | 'inactive';
}

export interface MarketReadinessItem {
  id: string;
  region: string;
  status: 'complete' | 'in-progress' | 'not-started';
  note: string;
  progressPct: number;
}

export interface MarketHoliday {
  countryCode: string;
  date: string;
  name: string;
}

export const MARKET_PROFILES: MarketProfile[] = [
  {
    countryCode: 'IN',
    countryName: 'India',
    regulator: 'SEBI',
    primaryCurrency: 'INR (₹)',
    dateFormat: 'DD-MM-YYYY',
    languages: 'EN-IN / HI',
    tradingHoursEnabled: true,
    status: 'active',
  },
  {
    countryCode: 'SG',
    countryName: 'Singapore',
    regulator: 'MAS',
    primaryCurrency: 'SGD (S$)',
    dateFormat: 'DD/MM/YYYY',
    languages: 'EN-SG',
    tradingHoursEnabled: true,
    status: 'active',
  },
  {
    countryCode: 'AE',
    countryName: 'UAE (DIFC)',
    regulator: 'DFSA',
    primaryCurrency: 'AED (د.إ)',
    dateFormat: 'DD/MM/YYYY',
    languages: 'EN / AR',
    tradingHoursEnabled: false,
    status: 'active',
  },
  {
    countryCode: 'UK',
    countryName: 'United Kingdom',
    regulator: 'FCA',
    primaryCurrency: 'GBP (£)',
    dateFormat: 'DD/MM/YYYY',
    languages: 'EN-GB',
    tradingHoursEnabled: false,
    status: 'inactive',
  },
];

export const MARKET_READINESS: MarketReadinessItem[] = [
  {
    id: 'eu',
    region: 'Eurozone (MiFID II)',
    status: 'complete',
    note: 'Regulatory frameworks aligned. Currency profiles validated.',
    progressPct: 100,
  },
  {
    id: 'hk',
    region: 'Hong Kong (SFC)',
    status: 'in-progress',
    note: 'Pending localized fee schedule approval.',
    progressPct: 65,
  },
  {
    id: 'au',
    region: 'Australia (ASIC)',
    status: 'not-started',
    note: 'Awaiting compliance docket initiation.',
    progressPct: 0,
  },
];

export const MARKET_HOLIDAYS: MarketHoliday[] = [
  { countryCode: 'IN', date: '2026-10-02', name: 'Gandhi Jayanti' },
  { countryCode: 'IN', date: '2026-11-08', name: 'Diwali (Laxmi Pujan)' },
  { countryCode: 'SG', date: '2026-11-09', name: 'Deepavali' },
  { countryCode: 'AE', date: '2026-12-02', name: 'UAE National Day' },
  { countryCode: 'UK', date: '2026-12-25', name: 'Christmas Day' },
  { countryCode: 'IN', date: '2026-12-25', name: 'Christmas Day' },
];
