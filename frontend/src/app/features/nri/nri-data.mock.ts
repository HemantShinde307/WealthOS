import { Client } from '../../core/models/domain.models';
import {
  DtaaTreaty,
  NriClientProfile,
  RegulatoryUpdate,
  RepatriationAssetClass,
} from './nri-data.model';

// Local-only supplementary NRI clients (in addition to CL-1007 Suresh Iyer,
// who already exists in core/mock-data/clients.mock.ts). These are NOT added
// to the shared ClientService/MOCK_CLIENTS per AGENT_CONVENTIONS.md — they
// exist only within the NRI module to give the hub/tracker screens a
// realistic multi-client dataset.
export const NRI_LOCAL_CLIENTS: Client[] = [
  {
    id: 'NRI-1002',
    name: 'Anjali Krishnan',
    email: 'anjali.krishnan@example.com',
    phone: '+1 408 555 0142',
    panMasked: 'AKQPK****T',
    kycStatus: 'Verified',
    riskProfile: 'Aggressive',
    segment: 'NRI',
    aum: 41000000,
    joinedOn: '2021-01-15',
  },
  {
    id: 'NRI-1003',
    name: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    phone: '+44 7700 900123',
    panMasked: 'RVQPV****H',
    kycStatus: 'Pending',
    riskProfile: 'Moderate',
    segment: 'NRI',
    aum: 9800000,
    joinedOn: '2023-06-02',
  },
];

export const NRI_PROFILES: NriClientProfile[] = [
  {
    clientId: 'CL-1007',
    countryOfResidence: 'United Arab Emirates (UAE)',
    countryFlag: '🇦🇪',
    taxResidencyNumber: '789-XXX-122',
    trcProvided: false,
    femaComplianceScore: 75,
    femaRisk: 'Medium',
    fatcaCrsStatus: 'Pending',
    pisRequired: false,
    poaInIndia: false,
    accounts: [
      { type: 'NRE', bankName: 'HDFC Bank Ltd.', accountNoMasked: '**** **** 5542', status: 'Verified', repatriable: true },
      { type: 'NRO', bankName: 'ICICI Bank', accountNoMasked: '**** **** 9011', status: 'Pending Penny Drop', repatriable: false },
    ],
    documents: [
      { name: 'Indian Passport', detail: 'Valid till 2028', status: 'Verified' },
      { name: 'PAN Card', detail: 'Verified via KRA', status: 'Verified' },
      { name: 'NRE Bank Proof', detail: 'Cancelled cheque', status: 'Verified' },
      { name: 'Overseas Address Proof', detail: 'Utility bill or bank statement', status: 'Pending', actionLabel: 'Upload Document' },
      { name: 'FATCA / CRS Declaration', detail: 'Mandatory for UAE tax residents', status: 'Missing', actionLabel: 'Generate Form' },
    ],
    holdings: [
      { schemeName: 'HDFC Flexi Cap Fund - Direct Growth', accountType: 'NRE', category: 'Equity', currentValue: 24560000, returnsPct: 12.4, tdsLabel: 'NIL (Exempt)' },
      { schemeName: 'ICICI Prudential Liquid Fund', accountType: 'NRE', category: 'Debt', currentValue: 8500000, returnsPct: 3.1, tdsLabel: 'NIL (Exempt)' },
      { schemeName: 'Reliance Industries Ltd.', accountType: 'NRO', category: 'Equity', currentValue: 3800000, returnsPct: 8.2, tdsLabel: '15% on Gains' },
      { schemeName: 'SBI Magnum Gilt Fund', accountType: 'NRO', category: 'Debt', currentValue: 4250000, returnsPct: -1.2, tdsLabel: '30% on Gains' },
    ],
    repatriationHistory: [
      { id: 'RP-9001', date: '2025-10-12', fromAccount: 'NRE', purpose: 'NRE to USD Account', amountUsd: 50000, amountInr: 4162000, status: 'Completed' },
      { id: 'RP-9002', date: '2025-11-28', fromAccount: 'NRO', purpose: '15CA/CB Clearance for NRO Transfer', amountUsd: 12000, amountInr: 998880, status: 'Pending 15CA/CB' },
    ],
    repatriatedThisYearUsd: 50000,
    annualRepatriationLimitUsd: 1000000,
    repatriationReadyPct: 65,
    estimatedTdsFy: 1450000,
    aumNre: 98000000 / 3, // ~3.27Cr NRE
    aumNro: 44000000 / 3, // ~1.47Cr NRO (kept proportionate to a smaller book than the mockup's example trust)
    tdsOptimizationTip: 'NRO debt holdings face 30% TDS on gains. Consider shifting new investments to NRE-linked instruments (repatriable, NIL TDS) where the source funds originate from abroad.',
  },
  {
    clientId: 'NRI-1002',
    countryOfResidence: 'United States (USA)',
    countryFlag: '🇺🇸',
    taxResidencyNumber: '412-88-3390',
    trcProvided: true,
    femaComplianceScore: 92,
    femaRisk: 'Low',
    fatcaCrsStatus: 'Filed',
    pisRequired: true,
    poaInIndia: true,
    accounts: [
      { type: 'NRE', bankName: 'Axis Bank', accountNoMasked: '**** **** 2210', status: 'Verified', repatriable: true },
      { type: 'NRO', bankName: 'Kotak Mahindra Bank', accountNoMasked: '**** **** 7734', status: 'Verified', repatriable: false },
      { type: 'FCNR', bankName: 'State Bank of India', accountNoMasked: '**** **** 4408', status: 'Verified', repatriable: true },
    ],
    documents: [
      { name: 'US Passport / OCI Card', detail: 'Valid till 2031', status: 'Verified' },
      { name: 'PAN Card', detail: 'Verified via KRA', status: 'Verified' },
      { name: 'FATCA / CRS Declaration', detail: 'Filed with W-9 and TRC', status: 'Verified' },
      { name: 'PIS Permission Letter (RBI/AD Bank)', detail: 'Required for direct equity trading', status: 'Verified' },
      { name: 'Form 15CB Renewal', detail: 'CA certificate expires this quarter', status: 'Pending', actionLabel: 'Request Renewal' },
    ],
    holdings: [
      { schemeName: 'Parag Parikh Flexi Cap Fund', accountType: 'NRE', category: 'Equity', currentValue: 61200000, returnsPct: 18.6, tdsLabel: 'NIL (Exempt)' },
      { schemeName: 'HDFC Bank Ltd. (Direct Equity - PIS)', accountType: 'NRO', category: 'Equity', currentValue: 22400000, returnsPct: 9.7, tdsLabel: '12.5% on LTCG' },
      { schemeName: 'SBI FCNR Term Deposit', accountType: 'NRE', category: 'Fixed Income', currentValue: 18900000, returnsPct: 5.4, tdsLabel: 'NIL (Exempt)' },
      { schemeName: 'Axis Corporate Debt Fund', accountType: 'NRO', category: 'Debt', currentValue: 9800000, returnsPct: 6.1, tdsLabel: '30% on Gains' },
    ],
    repatriationHistory: [
      { id: 'RP-8801', date: '2025-08-03', fromAccount: 'NRE', purpose: 'NRE to USD Brokerage Account', amountUsd: 350000, amountInr: 29134000, status: 'Completed' },
      { id: 'RP-8802', date: '2025-09-20', fromAccount: 'NRO', purpose: 'Form 15CA/CB — Property Sale Proceeds', amountUsd: 270000, amountInr: 22484800, status: 'Completed' },
      { id: 'RP-8803', date: '2026-08-14', fromAccount: 'NRO', purpose: 'A2 Form submitted to AD Bank', amountUsd: 0, amountInr: 0, status: 'Pending AD Bank Submission' },
    ],
    repatriatedThisYearUsd: 620000,
    annualRepatriationLimitUsd: 1000000,
    repatriationReadyPct: 82,
    estimatedTdsFy: 3200000,
    aumNre: 80100000,
    aumNro: 32200000,
    tdsOptimizationTip: 'Approaching 62% of the USD 1M/year LRS repatriation limit on the NRO account. Sequence remaining transfers across this and next FY to avoid a year-end bottleneck.',
  },
  {
    clientId: 'NRI-1003',
    countryOfResidence: 'United Kingdom (UK)',
    countryFlag: '🇬🇧',
    taxResidencyNumber: 'QQ123456C',
    trcProvided: true,
    femaComplianceScore: 58,
    femaRisk: 'High',
    fatcaCrsStatus: 'Pending',
    pisRequired: false,
    poaInIndia: false,
    accounts: [
      { type: 'NRE', bankName: 'Yes Bank', accountNoMasked: '**** **** 3391', status: 'Verified', repatriable: true },
      { type: 'NRO', bankName: 'Axis Bank', accountNoMasked: '**** **** 6620', status: 'Not Linked', repatriable: false },
    ],
    documents: [
      { name: 'UK Passport', detail: 'Valid till 2029', status: 'Verified' },
      { name: 'PAN Card', detail: 'Verified via KRA', status: 'Verified' },
      { name: 'NRO Bank Proof', detail: 'Account not yet linked', status: 'Missing', actionLabel: 'Link Account' },
      { name: 'Overseas Address Proof', detail: 'Council tax bill or bank statement', status: 'Pending', actionLabel: 'Upload Document' },
      { name: 'CRS Self-Certification', detail: 'Mandatory for UK tax residents', status: 'Missing', actionLabel: 'Generate Form' },
    ],
    holdings: [
      { schemeName: 'Mirae Asset Large Cap Fund', accountType: 'NRE', category: 'Equity', currentValue: 6100000, returnsPct: 10.9, tdsLabel: 'NIL (Exempt)' },
      { schemeName: 'ICICI Prudential Corporate Bond Fund', accountType: 'NRO', category: 'Debt', currentValue: 2600000, returnsPct: 4.8, tdsLabel: '30% on Gains' },
    ],
    repatriationHistory: [
      { id: 'RP-7701', date: '2025-04-11', fromAccount: 'NRE', purpose: 'NRE to GBP Account', amountUsd: 18000, amountInr: 1499320, status: 'Completed' },
    ],
    repatriatedThisYearUsd: 18000,
    annualRepatriationLimitUsd: 1000000,
    repatriationReadyPct: 40,
    estimatedTdsFy: 260000,
    aumNre: 6100000,
    aumNro: 2600000,
    tdsOptimizationTip: 'CRS self-certification and NRO account linkage are both outstanding — resolve these before initiating any further repatriation to keep FEMA compliance score above the review threshold.',
  },
];

export const DTAA_TREATIES: DtaaTreaty[] = [
  { country: 'United States (USA)', flag: '🇺🇸', capitalGainsRate: 15, interestRate: 15, requiresTrc: true },
  { country: 'United Arab Emirates (UAE)', flag: '🇦🇪', capitalGainsRate: 12.5, interestRate: 12.5, requiresTrc: true },
  { country: 'United Kingdom (UK)', flag: '🇬🇧', capitalGainsRate: 10, interestRate: 15, requiresTrc: true },
  { country: 'Singapore', flag: '🇸🇬', capitalGainsRate: 10, interestRate: 15, requiresTrc: true },
  { country: 'Australia', flag: '🇦🇺', capitalGainsRate: 15, interestRate: 15, requiresTrc: true },
];

export const REPATRIATION_ASSET_CLASSES: RepatriationAssetClass[] = [
  { label: 'Equity Mutual Funds (LTCG)', standardRate: 12.5, kind: 'capitalGains' },
  { label: 'Debt Mutual Funds (Gains)', standardRate: 30, kind: 'capitalGains' },
  { label: 'Real Estate Sale Proceeds (LTCG)', standardRate: 20, kind: 'capitalGains' },
  { label: 'NRO Bank / FD Interest', standardRate: 30, kind: 'interest' },
];

export const REGULATORY_UPDATES: RegulatoryUpdate[] = [
  {
    icon: 'policy',
    urgent: true,
    source: 'RBI Circular',
    timestamp: '2 hours ago',
    headline: 'Revised guidelines for LRS remittances (Tax Collection at Source)',
  },
  {
    icon: 'update',
    urgent: false,
    source: 'FEMA Update',
    timestamp: 'Yesterday',
    headline: 'Relaxation in KYC norms for FPIs originating from FATF-compliant jurisdictions',
  },
  {
    icon: 'gavel',
    urgent: false,
    source: 'CBDT Notification',
    timestamp: '3 days ago',
    headline: 'Clarification on DTAA benefit claims for capital gains under Section 90',
  },
];

/** 1 USD in INR, used by the currency toggle on the portfolio tracker. */
export const USD_INR_RATE = 83.24;
