// Back Office module — local mock data, kept separate from core/mock-data
// (per AGENT_CONVENTIONS.md) since back-office customers are managed
// independently of the advisor-facing Client/ClientService records.

export interface BackOfficeCustomer {
  id: string;
  name: string;
  pan: string;
  email: string;
  phone: string;
  kycStatus: 'Verified' | 'Pending' | 'Rejected' | 'Not Started';
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  /** How the current riskProfile value was arrived at. Undefined = never formally assessed (seed data). */
  riskProfileMethod?: 'Questionnaire' | 'Manual';
  /** Raw questionnaire score (out of RISK_QUESTIONNAIRE's max), absent for manual overrides. */
  riskProfileScore?: number;
  /** ISO date of the last assessment/override — drives the SEBI-style 12-month reassessment reminder. */
  riskProfileAssessedOn?: string;
  segment: 'Retail' | 'HNI' | 'Corporate' | 'NRI' | 'Family Office';
  groupId: string | null;
  status: 'Active' | 'Inactive';
  aum: number;
  joinedOn: string;
  sortOrder: number;
}

export interface RiskQuestionOption {
  label: string;
  score: number;
}

export interface RiskQuestion {
  id: string;
  text: string;
  options: RiskQuestionOption[];
}

export interface RiskAssessmentHistoryEntry {
  id: string;
  customerId: string;
  profile: BackOfficeCustomer['riskProfile'];
  method: 'Questionnaire' | 'Manual';
  score?: number;
  maxScore?: number;
  reason?: string;
  assessedBy: string;
  timestamp: string;
}

/**
 * Illustrative SEBI-aligned risk profiling questionnaire, in the style used by
 * mutual fund distributors/RIAs to satisfy the suitability-assessment intent of
 * SEBI's client risk-profiling requirements (age, income, horizon, objective,
 * loss tolerance, experience, liquidity, dependents). Scoring bands and wording
 * are illustrative, not a reproduction of any specific regulatory text.
 */
export const RISK_QUESTIONNAIRE: RiskQuestion[] = [
  {
    id: 'age',
    text: 'Which age group do you belong to?',
    options: [
      { label: 'Above 65', score: 1 },
      { label: '56–65', score: 2 },
      { label: '46–55', score: 3 },
      { label: '30–45', score: 4 },
      { label: 'Under 30', score: 5 },
    ],
  },
  {
    id: 'income',
    text: "What is your approximate annual income?",
    options: [
      { label: 'Below ₹5 Lakh', score: 1 },
      { label: '₹5–15 Lakh', score: 2 },
      { label: '₹15–50 Lakh', score: 3 },
      { label: '₹50 Lakh – ₹1 Crore', score: 4 },
      { label: 'Above ₹1 Crore', score: 5 },
    ],
  },
  {
    id: 'horizon',
    text: 'How long can you keep this investment before you are likely to need the money?',
    options: [
      { label: 'Less than 1 year', score: 1 },
      { label: '1–3 years', score: 2 },
      { label: '3–5 years', score: 3 },
      { label: '5–10 years', score: 4 },
      { label: 'More than 10 years', score: 5 },
    ],
  },
  {
    id: 'objective',
    text: 'Which best describes your primary investment objective?',
    options: [
      { label: 'Capital protection with minimal risk', score: 1 },
      { label: 'Regular income with limited growth', score: 2 },
      { label: 'Balanced growth and income', score: 3 },
      { label: 'Long-term capital growth', score: 4 },
      { label: 'Maximum growth, comfortable with high volatility', score: 5 },
    ],
  },
  {
    id: 'lossReaction',
    text: 'If your portfolio fell 20% in a short period, what would you most likely do?',
    options: [
      { label: 'Sell all investments immediately', score: 1 },
      { label: 'Sell a portion to limit further loss', score: 2 },
      { label: 'Hold and wait for recovery', score: 3 },
      { label: 'Hold — treat it as a buying opportunity', score: 4 },
      { label: 'Invest more to average down', score: 5 },
    ],
  },
  {
    id: 'experience',
    text: 'How would you describe your investment experience?',
    options: [
      { label: 'No prior investment experience', score: 1 },
      { label: 'Only fixed deposits / savings accounts', score: 2 },
      { label: 'Some mutual fund experience', score: 3 },
      { label: 'Regular investor in mutual funds / equities', score: 4 },
      { label: 'Extensive experience across asset classes, incl. derivatives', score: 5 },
    ],
  },
  {
    id: 'liquidity',
    text: 'How many months of expenses does your emergency fund cover?',
    options: [
      { label: 'No emergency fund', score: 1 },
      { label: 'Less than 3 months', score: 2 },
      { label: '3–6 months', score: 3 },
      { label: '6–12 months', score: 4 },
      { label: 'More than 12 months', score: 5 },
    ],
  },
  {
    id: 'dependents',
    text: 'Which best describes your financial responsibilities?',
    options: [
      { label: 'Sole earner with several dependents', score: 1 },
      { label: 'Primary earner with a few dependents', score: 2 },
      { label: 'Shared financial responsibility', score: 3 },
      { label: 'Few or no dependents', score: 4 },
      { label: 'No dependents, financially independent', score: 5 },
    ],
  },
];

export const RISK_QUESTIONNAIRE_MAX_SCORE = RISK_QUESTIONNAIRE.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.score)), 0);

/** Maps a raw questionnaire score onto the platform's 3-tier risk profile. */
export function scoreToRiskProfile(score: number): BackOfficeCustomer['riskProfile'] {
  const pct = score / RISK_QUESTIONNAIRE_MAX_SCORE;
  if (pct < 0.45) return 'Conservative';
  if (pct < 0.72) return 'Moderate';
  return 'Aggressive';
}

export interface CustomerGroup {
  id: string;
  name: string;
  primaryContactId: string | null;
  createdOn: string;
}

export interface MergeLogEntry {
  id: string;
  kind: 'Customer' | 'Group';
  survivorLabel: string;
  mergedLabel: string;
  timestamp: string;
}

export interface ImportLogEntry {
  id: string;
  fileName: string;
  rowCount: number;
  importedOn: string;
}

export const MOCK_CUSTOMER_GROUPS: CustomerGroup[] = [
  { id: 'GRP-001', name: 'Malhotra Family', primaryContactId: 'BOC-1008', createdOn: '2019-04-11' },
  { id: 'GRP-002', name: 'Mehta Household', primaryContactId: 'BOC-1001', createdOn: '2020-01-22' },
  { id: 'GRP-003', name: 'Kapoor Extended Family', primaryContactId: 'BOC-1003', createdOn: '2021-06-05' },
  { id: 'GRP-004', name: 'Iyer Family (NRI)', primaryContactId: 'BOC-1007', createdOn: '2021-09-18' },
];

export const MOCK_BO_CUSTOMERS: BackOfficeCustomer[] = [
  { id: 'BOC-1001', name: 'Rajesh Mehta', pan: 'ABCPM1234F', email: 'rajesh.mehta@example.com', phone: '+91 98200 11223', kycStatus: 'Verified', riskProfile: 'Aggressive', segment: 'HNI', groupId: 'GRP-002', status: 'Active', aum: 12450000, joinedOn: '2019-03-14', sortOrder: 0 },
  { id: 'BOC-1002', name: 'Kavita Mehta', pan: 'ABCPM5678G', email: 'kavita.mehta@example.com', phone: '+91 98200 11224', kycStatus: 'Verified', riskProfile: 'Moderate', segment: 'HNI', groupId: 'GRP-002', status: 'Active', aum: 3200000, joinedOn: '2019-03-14', sortOrder: 1 },
  { id: 'BOC-1003', name: 'Arvind Kapoor', pan: 'AKQPK4455L', email: 'arvind.kapoor@example.com', phone: '+91 98111 22334', kycStatus: 'Pending', riskProfile: 'Conservative', segment: 'Retail', groupId: 'GRP-003', status: 'Active', aum: 320000, joinedOn: '2023-01-19', sortOrder: 0 },
  { id: 'BOC-1004', name: 'Sunita Reddy', pan: 'SRXPR9988M', email: 'sunita.reddy@example.com', phone: '+91 90000 55667', kycStatus: 'Verified', riskProfile: 'Moderate', segment: 'HNI', groupId: null, status: 'Active', aum: 8750000, joinedOn: '2018-11-30', sortOrder: 0 },
  { id: 'BOC-1005', name: 'Kabir Enterprises Pvt Ltd', pan: 'KEPCL2210C', email: 'finance@kabirent.com', phone: '+91 22 4022 8890', kycStatus: 'Verified', riskProfile: 'Moderate', segment: 'Corporate', groupId: null, status: 'Active', aum: 45000000, joinedOn: '2017-05-21', sortOrder: 0 },
  { id: 'BOC-1006', name: 'Neha Verma', pan: 'NVQPV3321D', email: 'neha.verma@example.com', phone: '+91 97654 32109', kycStatus: 'Verified', riskProfile: 'Aggressive', segment: 'Retail', groupId: null, status: 'Active', aum: 1250000, joinedOn: '2022-02-10', sortOrder: 0 },
  { id: 'BOC-1007', name: 'Suresh Iyer', pan: 'SIQPI6612E', email: 'suresh.iyer@example.com', phone: '+971 50 123 4567', kycStatus: 'Verified', riskProfile: 'Moderate', segment: 'NRI', groupId: 'GRP-004', status: 'Active', aum: 6300000, joinedOn: '2020-09-05', sortOrder: 0 },
  { id: 'BOC-1007B', name: 'Latha Iyer', pan: 'SIQPI6612E', email: 'suresh.iyer@example.com', phone: '+971 50 123 4567', kycStatus: 'Pending', riskProfile: 'Moderate', segment: 'NRI', groupId: 'GRP-004', status: 'Active', aum: 0, joinedOn: '2020-09-05', sortOrder: 1 },
  { id: 'BOC-1008', name: 'The Malhotra Family Trust', pan: 'TMFPT7789A', email: 'office@malhotratrust.com', phone: '+91 22 6688 9900', kycStatus: 'Verified', riskProfile: 'Conservative', segment: 'Family Office', groupId: 'GRP-001', status: 'Active', aum: 182000000, joinedOn: '2015-08-12', sortOrder: 0 },
  { id: 'BOC-1008B', name: 'Rohan Malhotra', pan: 'ABMPM4432P', email: 'rohan.malhotra@example.com', phone: '+91 98211 44556', kycStatus: 'Verified', riskProfile: 'Aggressive', segment: 'Family Office', groupId: 'GRP-001', status: 'Active', aum: 4200000, joinedOn: '2016-02-01', sortOrder: 1 },
  { id: 'BOC-1009', name: 'Ananya Ghosh', pan: 'AGQPG9931N', email: 'ananya.ghosh@example.com', phone: '+91 98301 66778', kycStatus: 'Rejected', riskProfile: 'Aggressive', segment: 'Retail', groupId: null, status: 'Inactive', aum: 0, joinedOn: '2024-04-02', sortOrder: 0 },
  { id: 'BOC-1010', name: 'Vikram Singh', pan: 'VSQPS8821P', email: 'vikram.singh@example.com', phone: '+91 99220 34556', kycStatus: 'Verified', riskProfile: 'Aggressive', segment: 'HNI', groupId: null, status: 'Active', aum: 15600000, joinedOn: '2019-12-01', sortOrder: 0 },
  { id: 'BOC-1010B', name: 'Vikram Singh', pan: 'VSQPS8821P', email: 'v.singh.retail@example.com', phone: '+91 99220 34556', kycStatus: 'Verified', riskProfile: 'Moderate', segment: 'Retail', groupId: null, status: 'Active', aum: 210000, joinedOn: '2023-07-11', sortOrder: 0 },
  { id: 'BOC-1011', name: 'Meera Nair', pan: 'MNQPN7712Q', email: 'meera.nair@example.com', phone: '+91 96330 12211', kycStatus: 'Not Started', riskProfile: 'Moderate', segment: 'Retail', groupId: null, status: 'Inactive', aum: 0, joinedOn: '2026-08-20', sortOrder: 0 },
  { id: 'BOC-1012', name: 'Orion Logistics Ltd', pan: 'OLQPL5567R', email: 'treasury@orionlog.com', phone: '+91 44 2233 4455', kycStatus: 'Verified', riskProfile: 'Conservative', segment: 'Corporate', groupId: null, status: 'Active', aum: 92000000, joinedOn: '2016-06-18', sortOrder: 0 },
  { id: 'BOC-1013', name: 'Priya Sharma', pan: 'BXTPS4471K', email: 'priya.sharma@example.com', phone: '+91 99870 45671', kycStatus: 'Verified', riskProfile: 'Moderate', segment: 'Retail', groupId: null, status: 'Active', aum: 850000, joinedOn: '2021-07-02', sortOrder: 0 },
];

// ---------------------------------------------------------------------------
// Menu structure — mirrors the reference back-office admin panel exactly.
// Every route below is a real, working screen; any that are ever added ahead
// of their build resolve to a titled "Coming Soon" placeholder so no link in
// this menu is ever dead.
// ---------------------------------------------------------------------------

export interface BackOfficeMenuItem {
  label: string;
  route: string;
  badge?: string;
}

export interface BackOfficeMenuGroup {
  heading: string;
  /** Material Symbols icon name shown on the group's card header. */
  icon: string;
  items: BackOfficeMenuItem[];
}

export interface BackOfficeMenuColumn {
  groups: BackOfficeMenuGroup[];
}

const CM = '/back-office/customer-management';
const S = '/back-office/setup';
const CI = '/back-office/customer-investments';
const RA = '/back-office/reports-advisory';

export const SETUP_MENU: BackOfficeMenuColumn[] = [
  {
    groups: [
      {
        heading: 'Organization Setup',
        icon: 'business',
        items: [
          { label: 'Branches', route: `${S}/org/branches` },
          { label: 'Employees', route: `${S}/org/employees` },
          { label: 'Associates', route: `${S}/org/associates` },
          { label: 'Agencies', route: `${S}/org/agencies` },
          { label: 'ARN Master', route: `${S}/org/arn-master` },
          { label: 'Principal Broker Relationships', route: `${S}/org/principal-broker-relationships` },
        ],
      },
      {
        heading: 'User Management',
        icon: 'admin_panel_settings',
        items: [
          { label: 'Roles Master', route: `${S}/users/roles-master` },
          { label: 'Role Privileges', route: `${S}/users/role-privileges` },
          { label: 'User Master', route: `${S}/users/user-master` },
          { label: 'Relationship Manager Mapping', route: `${S}/users/rm-mapping` },
        ],
      },
    ],
  },
  {
    groups: [
      {
        heading: 'Customer Access',
        icon: 'lock_person',
        items: [
          { label: 'Customer Login Management', route: `${S}/access/login-management` },
          { label: 'SMS/Email Usage Log', route: `${S}/access/sms-email-usage-log` },
          { label: 'Report Mail Back Log', route: `${S}/access/report-mail-back-log` },
        ],
      },
      {
        heading: 'Settings',
        icon: 'tune',
        items: [
          { label: 'Application Configuration', route: `${S}/settings/application-configuration` },
          { label: 'Greetings Configuration', route: `${S}/settings/greetings-configuration` },
          { label: 'Recommended Funds', route: `${S}/settings/recommended-funds` },
        ],
      },
    ],
  },
  {
    groups: [
      {
        heading: 'Alerts & Notifications',
        icon: 'notifications',
        items: [
          { label: 'Intimation Templates', route: `${S}/alerts/intimation-templates` },
          { label: 'Scheduling Services', route: `${S}/alerts/scheduling-services` },
          { label: 'Schedule Service Log', route: `${S}/alerts/schedule-service-log` },
          { label: 'Communication Panel', route: `${S}/alerts/communication-panel` },
          { label: 'Scheduled Reports Management', route: `${S}/alerts/scheduled-reports-management` },
        ],
      },
    ],
  },
  {
    groups: [
      {
        heading: 'Miscellaneous',
        icon: 'widgets',
        items: [
          { label: 'Area Master', route: `${S}/misc/area-master` },
          { label: 'Holidays Master', route: `${S}/misc/holidays-master` },
          { label: 'Import Log', route: `${S}/misc/import-log` },
          { label: 'Version History', route: `${S}/misc/version-history` },
        ],
      },
    ],
  },
];

export const CUSTOMER_INVESTMENTS_MENU: BackOfficeMenuColumn[] = [
  {
    groups: [
      {
        heading: 'Customer Management',
        icon: 'group',
        items: [
          { label: 'Customer Groups', route: `${CM}/groups` },
          { label: 'Customers Master', route: `${CM}/master` },
          { label: 'Merge Groups (Family)', route: `${CM}/merge-groups` },
          { label: 'Bulk Merge Groups', route: `${CM}/bulk-merge-groups` },
          { label: 'Merge Customers', route: `${CM}/merge-customers` },
          { label: 'Bulk Merge Customers', route: `${CM}/bulk-merge-customers` },
          { label: 'Split Groups', route: `${CM}/split-groups` },
          { label: 'Sort Group Members', route: `${CM}/sort-group-members` },
          { label: 'Renumbering of Group Codes', route: `${CM}/renumber-group-codes` },
          { label: 'Customer Browser', route: `${CM}/browser` },
          { label: 'Active/Inactive Customers', route: `${CM}/active-inactive` },
          { label: 'Import Customers', route: `${CM}/import` },
          { label: 'Risk Profile Batch Edit', route: `${CM}/risk-profile-batch-edit` },
        ],
      },
    ],
  },
  {
    groups: [
      {
        heading: 'Mutual Fund',
        icon: 'account_balance_wallet',
        items: [
          { label: 'Folio', route: `${CI}/mutual-fund/folio` },
          { label: 'Inward', route: `${CI}/mutual-fund/inward` },
          { label: 'Outward', route: `${CI}/mutual-fund/outward` },
          { label: 'Systematic Investments (SIP)', route: `${CI}/mutual-fund/sip` },
          { label: 'Systematic Withdrawals (SWP)', route: `${CI}/mutual-fund/swp` },
          { label: 'Systematic Transfers (STPs)', route: `${CI}/mutual-fund/stp` },
          { label: 'Import from Registrar', route: `${CI}/mutual-fund/import-from-registrar` },
          { label: 'Import Log', route: `${CI}/mutual-fund/import-log` },
          { label: 'Import Principal Broker Data', route: `${CI}/mutual-fund/import-principal-broker-data` },
          { label: 'Batch Creation of Transactions', route: `${CI}/mutual-fund/batch-creation-of-transactions` },
          { label: 'Brokerage Receivable Structure', route: `${CI}/mutual-fund/brokerage-receivable-structure` },
        ],
      },
    ],
  },
  {
    groups: [
      {
        heading: 'Life Insurance',
        icon: 'shield',
        items: [
          { label: 'Policy Entry', route: `${CI}/life-insurance/policy-entry` },
          { label: 'Policy Alteration', route: `${CI}/life-insurance/policy-alteration` },
          { label: 'FUP Date Batch Update', route: `${CI}/life-insurance/fup-date-batch-update` },
          { label: 'Premium Deposits', route: `${CI}/life-insurance/premium-deposits` },
          { label: 'ULIP Unit Adjustments', route: `${CI}/life-insurance/ulip-unit-adjustments` },
          { label: 'Import Data', route: `${CI}/life-insurance/import-data` },
        ],
      },
      {
        heading: 'General Insurance',
        icon: 'health_and_safety',
        items: [
          { label: 'Policies', route: `${CI}/general-insurance/policies` },
          { label: 'Import Policies from Excel', route: `${CI}/general-insurance/import-policies` },
        ],
      },
    ],
  },
  {
    groups: [
      {
        heading: 'Other Investments',
        icon: 'savings',
        items: [
          { label: 'Masters', route: `${CI}/other-investments/masters` },
          { label: 'Stocks', route: `${CI}/other-investments/stocks` },
          { label: 'Postal Investments', route: `${CI}/other-investments/postal-investments` },
          { label: 'FDs & RDs', route: `${CI}/other-investments/fds-rds` },
          { label: 'PPF', route: `${CI}/other-investments/ppf` },
          { label: 'Bonds', route: `${CI}/other-investments/bonds` },
          { label: 'Debentures', route: `${CI}/other-investments/debentures` },
          { label: 'Company Deposits', route: `${CI}/other-investments/company-deposits` },
          { label: 'Recurring Deposits', route: `${CI}/other-investments/recurring-deposits` },
          { label: 'Income Schemes', route: `${CI}/other-investments/income-schemes` },
          { label: 'Bullion', route: `${CI}/other-investments/bullion` },
          { label: 'PMS Transaction Detail', route: `${CI}/other-investments/pms-transaction-detail` },
          { label: 'Import Data', route: `${CI}/other-investments/import-data` },
        ],
      },
      {
        heading: 'Document Management',
        icon: 'folder',
        items: [{ label: 'Manage Documents', route: `${CI}/document-management/manage-documents` }],
      },
    ],
  },
];

export const REPORTS_ADVISORY_MENU: BackOfficeMenuColumn[] = [
  {
    groups: [
      {
        heading: 'Portfolio Presentations — Consolidated',
        icon: 'dashboard',
        items: [
          { label: 'CRM Centre', route: `${RA}/presentations/crm-centre` },
          { label: 'Consolidated Wealth Portfolio', route: `${RA}/presentations/consolidated-wealth-portfolio` },
        ],
      },
      {
        heading: 'Portfolio Presentations — General Insurance',
        icon: 'health_and_safety',
        items: [{ label: 'Policy Fact Sheet', route: `${RA}/presentations/policy-fact-sheet` }],
      },
      {
        heading: 'Portfolio Presentations — Stocks',
        icon: 'show_chart',
        items: [
          { label: 'Portfolio Valuation Report', route: `${RA}/presentations/stocks-portfolio-valuation-report` },
          { label: 'Stock Ledger', route: `${RA}/presentations/stock-ledger` },
          { label: 'Capital Gains Report', route: `${RA}/presentations/stocks-capital-gains-report` },
        ],
      },
    ],
  },
  {
    groups: [
      {
        heading: 'Portfolio Presentations — Mutual Fund',
        icon: 'description',
        items: [
          { label: 'Portfolio Valuation Summary (Beta)', route: `${RA}/presentations/mf-portfolio-valuation-summary-beta`, badge: 'New' },
          { label: 'SIP Valuation (CAGR Report) (Beta)', route: `${RA}/presentations/mf-sip-valuation-cagr-beta`, badge: 'New' },
          { label: 'Comprehensive Portfolio Chart (Beta)', route: `${RA}/presentations/mf-comprehensive-chart-beta`, badge: 'New' },
          { label: 'Portfolio Valuation Summary', route: `${RA}/presentations/mf-portfolio-valuation-summary` },
          { label: 'Periodic Performance Report', route: `${RA}/presentations/mf-periodic-performance-report` },
          { label: 'Portfolio Exposure Summary', route: `${RA}/presentations/mf-portfolio-exposure-summary` },
          { label: 'Portfolio Valuation (CAGR Report)', route: `${RA}/presentations/mf-portfolio-valuation-cagr` },
          { label: 'SIP Valuation (CAGR Report)', route: `${RA}/presentations/mf-sip-valuation-cagr` },
        ],
      },
    ],
  },
  {
    groups: [
      {
        heading: 'Portfolio Presentations — Mutual Fund (contd.)',
        icon: 'description',
        items: [
          { label: 'Portfolio Asset Allocation', route: `${RA}/presentations/mf-portfolio-asset-allocation` },
          { label: 'Portfolio Gain - Loss', route: `${RA}/presentations/mf-portfolio-gain-loss` },
          { label: 'Capital Gains Report', route: `${RA}/presentations/mf-capital-gains-report` },
          { label: 'Folio Ledger', route: `${RA}/presentations/mf-folio-ledger` },
          { label: 'Active SIP Report', route: `${RA}/presentations/mf-active-sip-report` },
          { label: 'Comprehensive Portfolio Chart', route: `${RA}/presentations/mf-comprehensive-portfolio-chart` },
          { label: 'Account Statement', route: `${RA}/presentations/mf-account-statement` },
          { label: 'Active STP Report', route: `${RA}/presentations/mf-active-stp-report` },
          { label: 'Goal wise Portfolio Report', route: `${RA}/presentations/mf-goal-wise-portfolio-report` },
          { label: 'Active SWP Report', route: `${RA}/presentations/mf-active-swp-report` },
        ],
      },
    ],
  },
  {
    groups: [
      {
        heading: 'Portfolio Presentations — FDs, RDs, Bonds & More',
        icon: 'account_balance',
        items: [
          { label: 'Investments Chart', route: `${RA}/presentations/fd-rd-investments-chart` },
          { label: 'PPF Passbook', route: `${RA}/presentations/ppf-passbook` },
          { label: 'PPF Challan', route: `${RA}/presentations/ppf-challan` },
          { label: 'Bullion Valuation Report', route: `${RA}/presentations/bullion-valuation-report` },
        ],
      },
      {
        heading: 'Portfolio Advisory — Mutual Fund',
        icon: 'insights',
        items: [
          { label: 'Book Profit / Stop Loss Advice', route: `${RA}/advisory/book-profit-stop-loss-advice` },
          { label: 'ELSS Redemption Available', route: `${RA}/advisory/elss-redemption-available` },
          { label: 'LT Redemption Available', route: `${RA}/advisory/lt-redemption-available` },
        ],
      },
      {
        heading: 'Services',
        icon: 'support_agent',
        items: [
          { label: 'Application Register', route: `${RA}/services/application-register` },
          { label: 'View Service Request', route: `${RA}/services/view-service-request` },
        ],
      },
      {
        heading: 'New Products',
        icon: 'new_releases',
        items: [
          { label: 'Loan Against Securities', route: `${RA}/new-products/loan-against-securities` },
          { label: 'Equity Baskets', route: `${RA}/new-products/equity-baskets` },
          { label: 'P2P Investment', route: `${RA}/new-products/p2p-investment` },
          { label: 'DigiGold', route: `${RA}/new-products/digigold` },
          { label: 'eCAS', route: `${RA}/new-products/ecas` },
          { label: 'WhatsApp (FintsoClick)', route: `${RA}/new-products/whatsapp-fintsoclick` },
          { label: 'IPO', route: `${RA}/new-products/ipo` },
        ],
      },
    ],
  },
];

export const ALL_MENU_COLUMNS: BackOfficeMenuColumn[] = [...SETUP_MENU, ...CUSTOMER_INVESTMENTS_MENU, ...REPORTS_ADVISORY_MENU];

/** Every menu route that is NOT a real Customer Management screen — these resolve to a titled placeholder. */
export const STUB_MENU_ROUTES: BackOfficeMenuItem[] = ALL_MENU_COLUMNS.flatMap((col) => col.groups.flatMap((g) => g.items)).filter(
  (item) => !item.route.startsWith(CM + '/'),
);
