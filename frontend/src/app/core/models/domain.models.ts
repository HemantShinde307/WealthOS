// Core domain models shared across all WealthOS feature modules.
// Backed by in-memory mock data today; shaped so a real API/service layer
// can be swapped in behind the existing services without touching components.

export type AssetClass = 'Equity' | 'Debt' | 'Hybrid' | 'Gold' | 'Fixed Income' | 'Cash';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  panMasked: string;
  avatarUrl?: string;
  kycStatus: 'Verified' | 'Pending' | 'Rejected' | 'Not Started';
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  segment: 'Retail' | 'HNI' | 'Corporate' | 'NRI' | 'Family Office';
  aum: number;
  joinedOn: string;
}

export interface Scheme {
  id: string;
  /** AMFI ISIN (Growth); when present the NAV is refreshed live from /api/nav/latest. */
  isin?: string;
  name: string;
  amc: string;
  category: string;
  assetClass: AssetClass;
  nav: number;
  navDate: string;
  riskLevel: 'Low' | 'Low to Moderate' | 'Moderate' | 'Moderately High' | 'High' | 'Very High';
  returns1y: number;
  returns3y: number;
  returns5y: number;
  minSip: number;
  minLumpsum: number;
  expenseRatio: number;
  rating: number;
}

export interface Holding {
  schemeId: string;
  /** ISIN taken from the CAS statement (or resolved from the catalogue) — used to match live NAVs. */
  isin?: string;
  schemeName: string;
  category: string;
  units: number;
  avgCost: number;
  currentNav: number;
  currentValue: number;
  investedValue: number;
  unrealizedPl: number;
  unrealizedPlPct: number;
}

export type TransactionType = 'Purchase' | 'SIP' | 'Redemption' | 'Switch' | 'Gold Purchase' | 'Gold Sell' | 'Gold SIP';
export type TransactionStatus = 'Completed' | 'Processing' | 'Pending' | 'Failed' | 'Cancelled';

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  type: TransactionType;
  schemeName: string;
  amount: number;
  units?: number;
  nav?: number;
  status: TransactionStatus;
  date: string;
  folio?: string;
}

export interface Goal {
  id: string;
  clientId: string;
  name: string;
  category: 'Retirement' | 'Education' | 'Home' | 'Wedding' | 'Travel' | 'Wealth Creation' | 'Emergency Fund';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyInvestment: number;
  expectedReturn: number;
  progressPct: number;
}

export interface CommissionEntry {
  id: string;
  advisorName: string;
  clientName: string;
  schemeName: string;
  transactionType: TransactionType;
  transactionAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'Paid' | 'Pending' | 'Processing';
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

export interface KycRecord {
  id: string;
  clientName: string;
  pan: string;
  status: 'Verified' | 'Pending' | 'Rejected' | 'In Review';
  submittedOn: string;
  documents: { name: string; status: 'Uploaded' | 'Verified' | 'Rejected' | 'Missing' }[];
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
  ipAddress: string;
  status: 'Success' | 'Failure';
}

export interface Campaign {
  id: string;
  name: string;
  channel: 'Email' | 'SMS' | 'WhatsApp' | 'Push';
  status: 'Active' | 'Draft' | 'Completed' | 'Paused';
  audience: number;
  sent: number;
  opened: number;
  converted: number;
  startDate: string;
}

export interface InsurancePolicy {
  id: string;
  clientId: string;
  policyNumber: string;
  insurer: string;
  type: 'Term Life' | 'Health' | 'ULIP' | 'Motor' | 'Home';
  sumAssured: number;
  premium: number;
  premiumFrequency: 'Monthly' | 'Quarterly' | 'Annual';
  renewalDate: string;
  status: 'Active' | 'Lapsed' | 'Due for Renewal';
}

export interface NavPoint {
  date: string;
  value: number;
  benchmark?: number;
}
