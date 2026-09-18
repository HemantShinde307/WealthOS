// Local mock domain for the Institutional module — large corporate / institutional
// accounts, not the retail Client model in core/models. Kept local per module
// conventions (institutional-specific concepts: LEI/CIN registries, UBO mapping,
// document vaults, regulatory frameworks, FX desks).

export interface CorporateEntity {
  id: string;
  name: string;
  jurisdiction: string;
  entityType: string;
  lei: string;
  registrationNumber: string;
  registeredAddress: string;
  status: 'Active' | 'Dissolved' | 'Pending';
  aum: number;
}

export const MOCK_CORPORATE_ENTITIES: CorporateEntity[] = [
  {
    id: 'ENT-1001',
    name: 'Meridian Capital Holdings LLC',
    jurisdiction: 'US (Delaware)',
    entityType: 'Limited Liability Company (LLC)',
    lei: '5493006MHB84DD0ZWV18',
    registrationNumber: 'DE-1284560',
    registeredAddress: '1209 Orange Street, Wilmington, DE 19801, United States',
    status: 'Active',
    aum: 4820000000,
  },
  {
    id: 'ENT-1002',
    name: 'Meridian Capital (UK) Ltd',
    jurisdiction: 'GB (England & Wales)',
    entityType: 'Private Limited Company',
    lei: '213800XY9F8T2KLM4N56',
    registrationNumber: '09876543',
    registeredAddress: '1 Fleet Place, London EC4M 7RA, United Kingdom',
    status: 'Active',
    aum: 1120000000,
  },
  {
    id: 'ENT-1003',
    name: 'Meridian Structured Finance GmbH',
    jurisdiction: 'DE (Berlin)',
    entityType: 'Gesellschaft mit beschraenkter Haftung',
    lei: '391200HRB1234500002',
    registrationNumber: 'HRB 145678',
    registeredAddress: 'Friedrichstrasse 88, 10117 Berlin, Germany',
    status: 'Dissolved',
    aum: 0,
  },
];

export interface RegistryMatch {
  entityId: string;
  entityName: string;
  identifier: string;
  jurisdiction: string;
  status: 'Active' | 'Dissolved';
}

export const MOCK_REGISTRY_MATCHES: RegistryMatch[] = [
  { entityId: 'ENT-1001', entityName: 'Meridian Capital Holdings LLC', identifier: 'DE-1284560', jurisdiction: 'US (Delaware)', status: 'Active' },
  { entityId: 'ENT-1002', entityName: 'Meridian Capital (UK) Ltd', identifier: '09876543', jurisdiction: 'GB (England & Wales)', status: 'Active' },
  { entityId: 'ENT-1003', entityName: 'Meridian Structured Finance GmbH', identifier: 'HRB 145678', jurisdiction: 'DE (Berlin)', status: 'Dissolved' },
];

export interface UboEntry {
  name: string;
  type: 'Individual' | 'Corporate (Fund)' | 'Trust';
  ownershipPct: number;
  verification: 'Verified' | 'Pending Docs' | 'In Review';
}

export const MOCK_UBOS: UboEntry[] = [
  { name: 'Arjun Devarajan', type: 'Individual', ownershipPct: 42, verification: 'Verified' },
  { name: 'Solaris Capital Partners', type: 'Corporate (Fund)', ownershipPct: 33, verification: 'Pending Docs' },
  { name: 'Meera Krishnan', type: 'Individual', ownershipPct: 15, verification: 'Verified' },
];

export interface Signatory {
  name: string;
  role: string;
  documentType: string;
  expiryDate: string;
  status: 'Verified' | 'Expiring' | 'In Review';
}

export const MOCK_SIGNATORIES: Signatory[] = [
  { name: 'Arjun Devarajan', role: 'Managing Director', documentType: 'Passport', expiryDate: '14 Aug 2028', status: 'Verified' },
  { name: 'Meera Krishnan', role: 'UBO (>25%)', documentType: 'National ID (Aadhaar)', expiryDate: '9 Days', status: 'Expiring' },
  { name: 'Rohan Kapadia', role: 'Authorized Signatory', documentType: 'Utility Bill', expiryDate: 'N/A', status: 'In Review' },
];

export interface VaultDocument {
  name: string;
  meta: string;
  status: 'Verified' | 'Pending' | 'Upload Required';
}

export interface VaultCategory {
  label: string;
  icon: string;
  statusLabel: string;
  statusTone: 'complete' | 'pending';
  documents: VaultDocument[];
}

export const MOCK_VAULT_CATEGORIES: VaultCategory[] = [
  {
    label: 'Constitutional Documents',
    icon: 'account_balance',
    statusLabel: 'COMPLETE',
    statusTone: 'complete',
    documents: [
      { name: 'Memorandum of Association', meta: 'Uploaded 12 Oct 2025 - v1.2', status: 'Verified' },
      { name: 'Articles of Association', meta: 'Uploaded 12 Oct 2025 - v1.0', status: 'Verified' },
    ],
  },
  {
    label: 'Financials',
    icon: 'bar_chart',
    statusLabel: '1 PENDING',
    statusTone: 'pending',
    documents: [
      { name: 'FY24 Audited Financials', meta: 'Uploaded 5 Jan 2026', status: 'Verified' },
      { name: 'FY25 Interim Report', meta: 'Required for compliance review', status: 'Upload Required' },
    ],
  },
];

export interface ReviewQueueEntity {
  id: string;
  entityName: string;
  riskRating: 'High' | 'Medium' | 'Low';
  missingDocs: number;
  timeInQueueHrs: number;
  jurisdiction: string;
  entityType: string;
  aumLabel: string;
  missingDocuments: string[];
}

export const MOCK_REVIEW_QUEUE: ReviewQueueEntity[] = [
  {
    id: 'REV-1',
    entityName: 'Apex Global Capital LLC',
    riskRating: 'High',
    missingDocs: 2,
    timeInQueueHrs: 48.2,
    jurisdiction: 'Cayman Islands',
    entityType: 'Hedge Fund',
    aumLabel: '$500M+ / High Volume',
    missingDocuments: ['UBO Declaration Form - Director B', 'Certificate of Good Standing (Expired)'],
  },
  { id: 'REV-2', entityName: 'Meridian Trust Partners', riskRating: 'Medium', missingDocs: 0, timeInQueueHrs: 12.75, jurisdiction: 'Singapore', entityType: 'Family Trust', aumLabel: '$120M / Moderate', missingDocuments: [] },
  { id: 'REV-3', entityName: 'Vanguard Equities Ltd.', riskRating: 'Low', missingDocs: 0, timeInQueueHrs: 4.3, jurisdiction: 'UK', entityType: 'Asset Manager', aumLabel: '$60M / Low', missingDocuments: [] },
  { id: 'REV-4', entityName: 'Quantum Holdings Inc.', riskRating: 'Medium', missingDocs: 1, timeInQueueHrs: 24.1, jurisdiction: 'US (Delaware)', entityType: 'Holding Company', aumLabel: '$210M / Moderate', missingDocuments: ['Board Resolution'] },
  { id: 'REV-5', entityName: 'Stratos Ventures Group', riskRating: 'High', missingDocs: 3, timeInQueueHrs: 72.5, jurisdiction: 'India (Mumbai)', entityType: 'Venture Fund', aumLabel: '$340M / High', missingDocuments: ['FATCA Self-Certification', 'UBO Declaration', 'Audited Financials FY25'] },
];

export interface MarketIndex {
  name: string;
  value: string;
  changePct: number;
  portfolioImpactPct: number;
}

export const MOCK_GLOBAL_INDICES: MarketIndex[] = [
  { name: 'S&P 500', value: '5,147.21', changePct: 1.24, portfolioImpactPct: 0.4 },
  { name: 'FTSE 100', value: '7,932.10', changePct: -0.45, portfolioImpactPct: -0.1 },
  { name: 'Nikkei 225', value: '39,803.09', changePct: 0.88, portfolioImpactPct: 0.2 },
];

export const MOCK_INDIA_INDICES: MarketIndex[] = [
  { name: 'Nifty 50', value: '22,462.00', changePct: 1.12, portfolioImpactPct: 0.6 },
  { name: 'BSE Sensex', value: '74,014.55', changePct: 0.95, portfolioImpactPct: 0.5 },
  { name: 'Nifty Bank', value: '47,564.10', changePct: -0.24, portfolioImpactPct: -0.1 },
];

export interface RegionAum {
  label: string;
  amountLabel: string;
  widthPct: number;
  colorVar: string;
}

export const MOCK_GLOBAL_REGIONS: RegionAum[] = [
  { label: 'Americas', amountLabel: '$84.2B', widthPct: 60, colorVar: '--color-secondary' },
  { label: 'EMEA', amountLabel: '$41.5B', widthPct: 30, colorVar: '--color-primary-container' },
  { label: 'APAC', amountLabel: '$17.1B', widthPct: 10, colorVar: '--color-tertiary-container' },
];

export const MOCK_INDIA_CITIES: RegionAum[] = [
  { label: 'Mumbai', amountLabel: '₹65,210 Cr', widthPct: 68, colorVar: '--color-secondary' },
  { label: 'Delhi NCR', amountLabel: '₹32,150 Cr', widthPct: 33, colorVar: '--color-primary-container' },
  { label: 'Bengaluru', amountLabel: '₹21,180 Cr', widthPct: 22, colorVar: '--color-tertiary-container' },
];

export interface RegionalOperation {
  jurisdiction: string;
  status: 'Compliant' | 'Review Required' | 'Onboarding';
  activeEntities: number;
  pendingTasks: number;
}

export const MOCK_GLOBAL_OPERATIONS: RegionalOperation[] = [
  { jurisdiction: 'USA (SEC/FINRA)', status: 'Compliant', activeEntities: 1245, pendingTasks: 12 },
  { jurisdiction: 'UK (FCA)', status: 'Compliant', activeEntities: 892, pendingTasks: 4 },
  { jurisdiction: 'Singapore (MAS)', status: 'Review Required', activeEntities: 430, pendingTasks: 18 },
  { jurisdiction: 'UAE (DFSA)', status: 'Onboarding', activeEntities: 156, pendingTasks: 32 },
];

export const MOCK_INDIA_OPERATIONS: RegionalOperation[] = [
  { jurisdiction: 'Maharashtra (SEBI HQ Circle)', status: 'Compliant', activeEntities: 918, pendingTasks: 9 },
  { jurisdiction: 'Delhi NCR', status: 'Compliant', activeEntities: 604, pendingTasks: 6 },
  { jurisdiction: 'Karnataka', status: 'Review Required', activeEntities: 372, pendingTasks: 15 },
  { jurisdiction: 'Gujarat (GIFT City)', status: 'Onboarding', activeEntities: 88, pendingTasks: 21 },
];

export interface ActivityItem {
  icon: string;
  tone: 'info' | 'success' | 'error';
  title: string;
  region: string;
  detail: string;
  time: string;
}

export const MOCK_GLOBAL_ACTIVITY: ActivityItem[] = [
  { icon: 'swap_horiz', tone: 'info', title: 'Block Trade Executed', region: 'Americas', detail: 'AAPL - 500,000 shares - Avg Price $172.45', time: '10 mins ago' },
  { icon: 'verified', tone: 'success', title: 'Entity Onboarded', region: 'EMEA', detail: 'Vanguard European Equity Fund approved for trading.', time: '45 mins ago' },
  { icon: 'gavel', tone: 'error', title: 'Margin Call Issued', region: 'APAC', detail: 'Account ID: ACCT-8892 - Requirement: $2.4M', time: '2 hours ago' },
];

export const MOCK_INDIA_ACTIVITY: ActivityItem[] = [
  { icon: 'swap_horiz', tone: 'info', title: 'Block Trade Executed', region: 'Mumbai', detail: 'RELIANCE - 82,000 shares - Avg Price Rs 2,945.10', time: '18 mins ago' },
  { icon: 'verified', tone: 'success', title: 'Entity Onboarded', region: 'Delhi NCR', detail: 'Sundaram Structured Credit Fund approved for trading.', time: '1 hour ago' },
  { icon: 'gavel', tone: 'error', title: 'Margin Call Issued', region: 'Bengaluru', detail: 'Account ID: ACCT-INB-441 - Requirement: Rs 1.8 Cr', time: '3 hours ago' },
];

export interface ComplianceStandard {
  title: string;
  description: string;
  tone: 'ok' | 'alert';
  tags: string[];
  meta: string;
}

export const MOCK_COMPLIANCE_STANDARDS: ComplianceStandard[] = [
  { title: 'UBO Identification (Ultimate Beneficial Owner)', description: 'Require >=25% ownership disclosure for all corporate entities registered in India.', tone: 'ok', tags: ['CORP ACCOUNTS', 'TRUSTS'], meta: 'Last Updated Oct 12, 2025' },
  { title: 'FATCA / CRS Reporting', description: 'Annual tax reporting configuration requires review due to recent SEBI circular.', tone: 'alert', tags: ['ACTION REQUIRED'], meta: 'Review' },
  { title: 'AML / KYC Tiering', description: 'Risk-based approach logic mapped. Enhanced Due Diligence (EDD) triggered for High-Risk ratings.', tone: 'ok', tags: [], meta: 'Active Rule V2.4' },
];

export interface RequiredDocument {
  name: string;
  detail: string;
  icon: string;
}

export const MOCK_REQUIRED_DOCUMENTS: RequiredDocument[] = [
  { name: 'PAN Card & Aadhaar', detail: 'Mandatory for all individuals', icon: 'badge' },
  { name: 'CKYC Registration', detail: 'Central KYC Registry profile', icon: 'account_balance' },
  { name: 'FATCA / CRS', detail: 'Mandatory for Indian entities', icon: 'description' },
];

export interface MarketProfile {
  code: string;
  country: string;
  regulator: string;
  currency: string;
  dateFormat: string;
  language: string;
  tradingHrsOn: boolean;
  online: boolean;
}

export const MOCK_MARKET_PROFILES: MarketProfile[] = [
  { code: 'IN', country: 'India', regulator: 'SEBI', currency: 'INR (Rs)', dateFormat: 'DD-MM-YYYY', language: 'EN-IN / HI', tradingHrsOn: true, online: true },
  { code: 'SG', country: 'Singapore', regulator: 'MAS', currency: 'SGD (S$)', dateFormat: 'DD/MM/YYYY', language: 'EN-SG', tradingHrsOn: true, online: true },
];

export interface MarketReadiness {
  label: string;
  status: 'live' | 'in-progress' | 'pending';
  statusLabel: string;
  detail: string;
  widthPct: number;
}

export const MOCK_MARKET_READINESS: MarketReadiness[] = [
  { label: 'India (NSE/BSE)', status: 'live', statusLabel: 'LIVE', detail: 'SEBI compliance active. Trading profiles synchronized.', widthPct: 100 },
  { label: 'Hong Kong (SFC)', status: 'in-progress', statusLabel: 'IN PROGRESS', detail: 'Pending localized fee schedule approval.', widthPct: 55 },
  { label: 'Australia (ASIC)', status: 'pending', statusLabel: 'PENDING', detail: 'Awaiting compliance docket initiation.', widthPct: 10 },
];

export interface FxRate {
  pair: string;
  rate: string;
  changePct: number;
}

export const MOCK_FX_RATES: FxRate[] = [
  { pair: 'USD/INR', rate: '83.1450', changePct: 0.12 },
  { pair: 'EUR/INR', rate: '90.2540', changePct: -0.15 },
  { pair: 'GBP/INR', rate: '105.4210', changePct: 0.25 },
];

export interface FxTrendPoint {
  day: number;
  rate: number;
}

export const MOCK_FX_TREND: FxTrendPoint[] = [
  82.4, 82.6, 82.5, 82.7, 82.9, 82.8, 83.0, 83.1, 82.95, 83.05, 83.2, 83.15, 83.3, 83.25, 83.1,
  83.0, 83.05, 83.2, 83.35, 83.4, 83.3, 83.2, 83.1, 83.05, 83.0, 83.1, 83.2, 83.1, 83.14, 83.145,
].map((rate, i) => ({ day: i + 1, rate }));

export interface SettlementRule {
  icon: string;
  title: string;
  detail: string;
}

export const MOCK_SETTLEMENT_RULES: SettlementRule[] = [
  { icon: 'account_balance', title: 'NEFT/RTGS Auto-Sweep', detail: 'Settle balances to INR by 4:30 PM (IST)' },
  { icon: 'bolt', title: 'IMPS Instant Transfer', detail: 'For amounts < Rs 5 Lakhs, instant INR credit' },
];

export interface PortfolioBalance {
  accountId: string;
  clientName: string;
  currency: string;
  balance: number;
  balanceLabel: string;
  baseEqInr: number;
}

export const MOCK_PORTFOLIO_BALANCES: PortfolioBalance[] = [
  { accountId: 'ACC-8901', clientName: 'Global Tech Holdings', currency: 'USD', balance: 125000, balanceLabel: '$125,000.00', baseEqInr: 10393125 },
  { accountId: 'ACC-8902', clientName: 'Eurozone Operations', currency: 'EUR', balance: 45200, balanceLabel: '€45,200.00', baseEqInr: 4079480 },
  { accountId: 'ACC-8903', clientName: 'Meridian Domestic Reserve', currency: 'INR', balance: 32060641, balanceLabel: '₹32,060,641.00', baseEqInr: 32060641 },
];
