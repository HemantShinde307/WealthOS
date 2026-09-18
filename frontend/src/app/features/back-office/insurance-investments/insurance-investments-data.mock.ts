// Insurance & Other Investments module — local mock data, kept separate from
// core/mock-data and from customer-management (per AGENT_CONVENTIONS.md #4/#9).

// ---------------------------------------------------------------------------
// Life Insurance
// ---------------------------------------------------------------------------

export interface LifeInsurancePolicy {
  id: string;
  policyNumber: string;
  policyholderName: string;
  insurer: string;
  policyType: 'Term Life' | 'Whole Life' | 'Endowment' | 'Money Back' | 'ULIP' | 'Child Plan' | 'Pension Plan';
  sumAssured: number;
  premium: number;
  premiumFrequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual';
  commencementDate: string;
  fupDate: string; // First Unpaid Premium date
  nominee: string;
  status: 'Active' | 'Lapsed' | 'Matured' | 'Surrendered';
}

export interface PremiumDeposit {
  id: string;
  policyId: string;
  policyNumber: string;
  policyholderName: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'Cheque' | 'NEFT' | 'Cash' | 'UPI' | 'Auto-Debit';
  receiptNumber: string;
}

export interface UlipUnitAdjustment {
  id: string;
  policyId: string;
  policyNumber: string;
  fundName: string;
  adjustmentType: 'Switch In' | 'Switch Out' | 'Top-Up' | 'Partial Withdrawal';
  units: number;
  nav: number;
  amount: number;
  date: string;
}

export interface LifeInsuranceImportRow {
  policyNumber: string;
  policyholderName: string;
  insurer: string;
  policyType: LifeInsurancePolicy['policyType'];
  sumAssured: number;
  premium: number;
  premiumFrequency: LifeInsurancePolicy['premiumFrequency'];
}

export const LIFE_INSURERS = ['LIC of India', 'HDFC Life', 'ICICI Prudential Life', 'SBI Life', 'Max Life', 'Bajaj Allianz Life', 'Tata AIA Life'];
export const LIFE_POLICY_TYPES: LifeInsurancePolicy['policyType'][] = ['Term Life', 'Whole Life', 'Endowment', 'Money Back', 'ULIP', 'Child Plan', 'Pension Plan'];

export const MOCK_LIFE_POLICIES: LifeInsurancePolicy[] = [
  { id: 'LIP-101', policyNumber: 'LIC-882910334', policyholderName: 'Rajesh Mehta', insurer: 'LIC of India', policyType: 'Endowment', sumAssured: 2500000, premium: 48500, premiumFrequency: 'Annual', commencementDate: '2015-03-10', fupDate: '2027-03-10', nominee: 'Kavita Mehta', status: 'Active' },
  { id: 'LIP-102', policyNumber: 'HDFCL-4471209', policyholderName: 'Kavita Mehta', insurer: 'HDFC Life', policyType: 'ULIP', sumAssured: 1500000, premium: 100000, premiumFrequency: 'Annual', commencementDate: '2019-07-22', fupDate: '2027-07-22', nominee: 'Rajesh Mehta', status: 'Active' },
  { id: 'LIP-103', policyNumber: 'ICICI-991823', policyholderName: 'Arvind Kapoor', insurer: 'ICICI Prudential Life', policyType: 'Term Life', sumAssured: 10000000, premium: 18200, premiumFrequency: 'Annual', commencementDate: '2021-01-15', fupDate: '2027-01-15', nominee: 'Sunanda Kapoor', status: 'Active' },
  { id: 'LIP-104', policyNumber: 'SBIL-330187', policyholderName: 'Sunita Reddy', insurer: 'SBI Life', policyType: 'Money Back', sumAssured: 800000, premium: 22000, premiumFrequency: 'Half-Yearly', commencementDate: '2017-11-05', fupDate: '2026-11-05', nominee: 'Karthik Reddy', status: 'Active' },
  { id: 'LIP-105', policyNumber: 'MAXL-118820', policyholderName: 'Neha Verma', insurer: 'Max Life', policyType: 'ULIP', sumAssured: 2000000, premium: 60000, premiumFrequency: 'Annual', commencementDate: '2020-05-18', fupDate: '2027-05-18', nominee: 'Suresh Verma', status: 'Active' },
  { id: 'LIP-106', policyNumber: 'BAL-772451', policyholderName: 'Suresh Iyer', insurer: 'Bajaj Allianz Life', policyType: 'Whole Life', sumAssured: 3000000, premium: 35000, premiumFrequency: 'Quarterly', commencementDate: '2016-09-01', fupDate: '2026-12-01', nominee: 'Latha Iyer', status: 'Active' },
  { id: 'LIP-107', policyNumber: 'TATA-556678', policyholderName: 'Priya Sharma', insurer: 'Tata AIA Life', policyType: 'Child Plan', sumAssured: 1200000, premium: 25000, premiumFrequency: 'Annual', commencementDate: '2022-02-14', fupDate: '2027-02-14', nominee: 'Priya Sharma', status: 'Active' },
  { id: 'LIP-108', policyNumber: 'LIC-663310', policyholderName: 'Vikram Singh', insurer: 'LIC of India', policyType: 'Pension Plan', sumAssured: 500000, premium: 15000, premiumFrequency: 'Monthly', commencementDate: '2018-04-30', fupDate: '2026-10-30', nominee: 'Anita Singh', status: 'Lapsed' },
];

export const MOCK_PREMIUM_DEPOSITS: PremiumDeposit[] = [
  { id: 'PD-201', policyId: 'LIP-101', policyNumber: 'LIC-882910334', policyholderName: 'Rajesh Mehta', amount: 48500, paymentDate: '2026-03-08', paymentMode: 'NEFT', receiptNumber: 'RCPT-9001' },
  { id: 'PD-202', policyId: 'LIP-103', policyNumber: 'ICICI-991823', policyholderName: 'Arvind Kapoor', amount: 18200, paymentDate: '2026-01-12', paymentMode: 'Auto-Debit', receiptNumber: 'RCPT-9002' },
  { id: 'PD-203', policyId: 'LIP-105', policyNumber: 'MAXL-118820', policyholderName: 'Neha Verma', amount: 60000, paymentDate: '2026-05-15', paymentMode: 'UPI', receiptNumber: 'RCPT-9003' },
];

export const MOCK_ULIP_ADJUSTMENTS: UlipUnitAdjustment[] = [
  { id: 'ULIP-301', policyId: 'LIP-102', policyNumber: 'HDFCL-4471209', fundName: 'HDFC Life Equity Advantage Fund', adjustmentType: 'Switch In', units: 1250.4, nav: 68.25, amount: 85340, date: '2026-06-02' },
  { id: 'ULIP-302', policyId: 'LIP-102', policyNumber: 'HDFCL-4471209', fundName: 'HDFC Life Bond Fund', adjustmentType: 'Switch Out', units: 900.15, nav: 42.1, amount: 37906, date: '2026-06-02' },
  { id: 'ULIP-303', policyId: 'LIP-105', policyNumber: 'MAXL-118820', fundName: 'Max Life High Growth Fund', adjustmentType: 'Top-Up', units: 500.0, nav: 55.6, amount: 27800, date: '2026-04-20' },
];

// ---------------------------------------------------------------------------
// General Insurance
// ---------------------------------------------------------------------------

export interface GeneralInsurancePolicy {
  id: string;
  policyNumber: string;
  policyholderName: string;
  insurer: string;
  type: 'Motor' | 'Health' | 'Home' | 'Travel' | 'Fire' | 'Marine';
  sumInsured: number;
  premium: number;
  issueDate: string;
  renewalDate: string;
  status: 'Active' | 'Due for Renewal' | 'Expired' | 'Cancelled';
}

export interface GeneralInsuranceImportRow {
  policyNumber: string;
  policyholderName: string;
  insurer: string;
  type: GeneralInsurancePolicy['type'];
  sumInsured: number;
  premium: number;
  renewalDate: string;
}

export const GENERAL_INSURERS = ['ICICI Lombard', 'Bajaj Allianz General', 'HDFC ERGO', 'New India Assurance', 'Star Health Insurance', 'Tata AIG General'];
export const GENERAL_POLICY_TYPES: GeneralInsurancePolicy['type'][] = ['Motor', 'Health', 'Home', 'Travel', 'Fire', 'Marine'];

export const MOCK_GENERAL_POLICIES: GeneralInsurancePolicy[] = [
  { id: 'GIP-401', policyNumber: 'ICL-MOT-88213', policyholderName: 'Rajesh Mehta', insurer: 'ICICI Lombard', type: 'Motor', sumInsured: 950000, premium: 21500, issueDate: '2025-10-01', renewalDate: '2026-10-01', status: 'Active' },
  { id: 'GIP-402', policyNumber: 'STAR-HLT-33290', policyholderName: 'Kavita Mehta', insurer: 'Star Health Insurance', type: 'Health', sumInsured: 1000000, premium: 32000, issueDate: '2025-06-15', renewalDate: '2026-06-15', status: 'Active' },
  { id: 'GIP-403', policyNumber: 'HDE-HOM-11987', policyholderName: 'The Malhotra Family Trust', insurer: 'HDFC ERGO', type: 'Home', sumInsured: 25000000, premium: 45000, issueDate: '2024-12-20', renewalDate: '2025-12-20', status: 'Due for Renewal' },
  { id: 'GIP-404', policyNumber: 'NIA-MOT-55321', policyholderName: 'Vikram Singh', insurer: 'New India Assurance', type: 'Motor', sumInsured: 620000, premium: 14800, issueDate: '2025-02-11', renewalDate: '2026-02-11', status: 'Active' },
  { id: 'GIP-405', policyNumber: 'TAIG-TRV-77410', policyholderName: 'Suresh Iyer', insurer: 'Tata AIG General', type: 'Travel', sumInsured: 500000, premium: 4200, issueDate: '2026-01-05', renewalDate: '2026-07-05', status: 'Expired' },
  { id: 'GIP-406', policyNumber: 'BAG-FIR-22109', policyholderName: 'Orion Logistics Ltd', insurer: 'Bajaj Allianz General', type: 'Fire', sumInsured: 80000000, premium: 165000, issueDate: '2025-08-19', renewalDate: '2026-08-19', status: 'Active' },
];

// ---------------------------------------------------------------------------
// Shared import log (Life Insurance / General Insurance / Other Investments each keep their own instance)
// ---------------------------------------------------------------------------

export interface ImportLogEntry {
  id: string;
  fileName: string;
  rowCount: number;
  importedOn: string;
}

// ---------------------------------------------------------------------------
// Other Investments
// ---------------------------------------------------------------------------

export interface InstrumentMaster {
  id: string;
  category: 'Bond' | 'Debenture' | 'Company Deposit' | 'Postal Scheme' | 'Bank Deposit' | 'Other';
  name: string;
  code: string; // ISIN / scheme code
  issuer: string;
  notes: string;
}

export const MOCK_INSTRUMENT_MASTERS: InstrumentMaster[] = [
  { id: 'MST-01', category: 'Bond', name: '7.10% GOI Savings Bond 2034', code: 'IN0020240019', issuer: 'Government of India', notes: 'Sovereign, non-tradeable' },
  { id: 'MST-02', category: 'Debenture', name: '9.25% Shriram Finance NCD', code: 'INE721A07RN5', issuer: 'Shriram Finance Ltd', notes: 'Secured, redeemable' },
  { id: 'MST-03', category: 'Company Deposit', name: 'Bajaj Finance FD Scheme', code: 'BAF-FD-01', issuer: 'Bajaj Finance Ltd', notes: 'AAA rated by CRISIL' },
  { id: 'MST-04', category: 'Postal Scheme', name: 'National Savings Certificate (NSC)', code: 'NSC-VIII', issuer: 'Department of Posts', notes: '5-year lock-in' },
  { id: 'MST-05', category: 'Bank Deposit', name: 'HDFC Bank Fixed Deposit', code: 'HDFC-FD', issuer: 'HDFC Bank Ltd', notes: 'Standard retail FD' },
];

export interface StockHolding {
  id: string;
  customerName: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  buyDate: string;
}

export const MOCK_STOCK_HOLDINGS: StockHolding[] = [
  { id: 'STK-01', customerName: 'Rajesh Mehta', symbol: 'RELIANCE', exchange: 'NSE', quantity: 150, buyPrice: 2410, currentPrice: 2865, buyDate: '2023-05-12' },
  { id: 'STK-02', customerName: 'Vikram Singh', symbol: 'HDFCBANK', exchange: 'NSE', quantity: 300, buyPrice: 1520, currentPrice: 1690, buyDate: '2022-11-03' },
  { id: 'STK-03', customerName: 'Neha Verma', symbol: 'TCS', exchange: 'BSE', quantity: 60, buyPrice: 3320, currentPrice: 4105, buyDate: '2021-08-22' },
  { id: 'STK-04', customerName: 'Orion Logistics Ltd', symbol: 'INFY', exchange: 'NSE', quantity: 500, buyPrice: 1410, currentPrice: 1585, buyDate: '2024-02-14' },
];

export interface PostalInvestment {
  id: string;
  customerName: string;
  schemeName: 'NSC' | 'KVP' | 'Sukanya Samriddhi Yojana' | 'Post Office Time Deposit' | 'Senior Citizen Savings Scheme';
  certificateNumber: string;
  amount: number;
  investmentDate: string;
  maturityDate: string;
  interestRate: number;
}

export const MOCK_POSTAL_INVESTMENTS: PostalInvestment[] = [
  { id: 'PST-01', customerName: 'Arvind Kapoor', schemeName: 'NSC', certificateNumber: 'NSC-4487219', amount: 150000, investmentDate: '2023-04-01', maturityDate: '2028-04-01', interestRate: 7.7 },
  { id: 'PST-02', customerName: 'Sunita Reddy', schemeName: 'Senior Citizen Savings Scheme', certificateNumber: 'SCSS-991201', amount: 1500000, investmentDate: '2022-09-15', maturityDate: '2027-09-15', interestRate: 8.2 },
  { id: 'PST-03', customerName: 'Priya Sharma', schemeName: 'Sukanya Samriddhi Yojana', certificateNumber: 'SSY-773310', amount: 100000, investmentDate: '2020-01-20', maturityDate: '2041-01-20', interestRate: 8.2 },
];

export interface FdRdEntry {
  id: string;
  customerName: string;
  bank: string;
  type: 'FD' | 'RD';
  principalOrInstallment: number;
  tenureMonths: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
}

export const BANKS = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank', 'Bank of Baroda'];

export const MOCK_FDS_RDS: FdRdEntry[] = [
  { id: 'FDR-01', customerName: 'Rajesh Mehta', bank: 'HDFC Bank', type: 'FD', principalOrInstallment: 1000000, tenureMonths: 24, interestRate: 7.25, startDate: '2025-01-10', maturityDate: '2027-01-10' },
  { id: 'FDR-02', customerName: 'Kavita Mehta', bank: 'State Bank of India', type: 'RD', principalOrInstallment: 10000, tenureMonths: 60, interestRate: 6.8, startDate: '2024-06-01', maturityDate: '2029-06-01' },
  { id: 'FDR-03', customerName: 'The Malhotra Family Trust', bank: 'Axis Bank', type: 'FD', principalOrInstallment: 5000000, tenureMonths: 36, interestRate: 7.4, startDate: '2024-03-18', maturityDate: '2027-03-18' },
];

export interface PpfAccount {
  id: string;
  accountNumber: string;
  holderName: string;
  institution: string;
  openingDate: string;
  balance: number;
  contributions: { id: string; date: string; amount: number }[];
}

export const MOCK_PPF_ACCOUNTS: PpfAccount[] = [
  {
    id: 'PPF-01', accountNumber: 'PPF-SBI-8827301', holderName: 'Rajesh Mehta', institution: 'State Bank of India', openingDate: '2014-04-01', balance: 1845000,
    contributions: [
      { id: 'C-1', date: '2026-04-05', amount: 150000 },
      { id: 'C-2', date: '2025-04-08', amount: 150000 },
    ],
  },
  {
    id: 'PPF-02', accountNumber: 'PPF-POST-1123900', holderName: 'Priya Sharma', institution: 'Department of Posts', openingDate: '2018-07-12', balance: 620000,
    contributions: [{ id: 'C-3', date: '2026-03-30', amount: 100000 }],
  },
];

export interface BondHolding {
  id: string;
  customerName: string;
  issuer: string;
  isin: string;
  faceValue: number;
  quantity: number;
  couponRate: number;
  purchaseDate: string;
  maturityDate: string;
}

export const MOCK_BONDS: BondHolding[] = [
  { id: 'BND-01', customerName: 'Sunita Reddy', issuer: 'Government of India', isin: 'IN0020240019', faceValue: 1000, quantity: 100, couponRate: 7.1, purchaseDate: '2024-05-01', maturityDate: '2034-05-01' },
  { id: 'BND-02', customerName: 'Orion Logistics Ltd', issuer: 'REC Limited', isin: 'INE020B07LM3', faceValue: 1000, quantity: 500, couponRate: 7.65, purchaseDate: '2023-11-10', maturityDate: '2028-11-10' },
];

export interface DebentureHolding {
  id: string;
  customerName: string;
  issuer: string;
  isin: string;
  faceValue: number;
  quantity: number;
  interestRate: number;
  convertible: boolean;
  purchaseDate: string;
  maturityDate: string;
}

export const MOCK_DEBENTURES: DebentureHolding[] = [
  { id: 'DEB-01', customerName: 'Arvind Kapoor', issuer: 'Shriram Finance Ltd', isin: 'INE721A07RN5', faceValue: 1000, quantity: 200, interestRate: 9.25, convertible: false, purchaseDate: '2024-02-20', maturityDate: '2027-02-20' },
  { id: 'DEB-02', customerName: 'Vikram Singh', issuer: 'Mahindra & Mahindra Financial', isin: 'INE774D07XX1', faceValue: 1000, quantity: 100, interestRate: 8.9, convertible: true, purchaseDate: '2023-08-14', maturityDate: '2026-08-14' },
];

export interface CompanyDeposit {
  id: string;
  customerName: string;
  companyName: string;
  amount: number;
  interestRate: number;
  tenureMonths: number;
  startDate: string;
  maturityDate: string;
}

export const MOCK_COMPANY_DEPOSITS: CompanyDeposit[] = [
  { id: 'CD-01', customerName: 'Neha Verma', companyName: 'Bajaj Finance Ltd', amount: 500000, interestRate: 8.4, tenureMonths: 36, startDate: '2024-09-01', maturityDate: '2027-09-01' },
  { id: 'CD-02', customerName: 'Suresh Iyer', companyName: 'Mahindra Finance', amount: 1000000, interestRate: 8.1, tenureMonths: 24, startDate: '2025-01-15', maturityDate: '2027-01-15' },
];

export interface RecurringDepositEntry {
  id: string;
  customerName: string;
  bank: string;
  installmentAmount: number;
  tenureMonths: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
}

export const MOCK_RECURRING_DEPOSITS: RecurringDepositEntry[] = [
  { id: 'RD-01', customerName: 'Ananya Ghosh', bank: 'ICICI Bank', installmentAmount: 5000, tenureMonths: 36, interestRate: 6.9, startDate: '2025-05-01', maturityDate: '2028-05-01' },
  { id: 'RD-02', customerName: 'Meera Nair', bank: 'Kotak Mahindra Bank', installmentAmount: 8000, tenureMonths: 24, interestRate: 7.0, startDate: '2025-09-10', maturityDate: '2027-09-10' },
];

export interface IncomeSchemeEntry {
  id: string;
  customerName: string;
  schemeName: 'Post Office MIS' | 'Senior Citizen Savings Scheme' | 'Pradhan Mantri Vaya Vandana Yojana' | 'RBI Floating Rate Bonds';
  amount: number;
  monthlyIncome: number;
  startDate: string;
  maturityDate: string;
}

export const MOCK_INCOME_SCHEMES: IncomeSchemeEntry[] = [
  { id: 'INC-01', customerName: 'Sunita Reddy', schemeName: 'Post Office MIS', amount: 900000, monthlyIncome: 5850, startDate: '2024-01-01', maturityDate: '2029-01-01' },
  { id: 'INC-02', customerName: 'The Malhotra Family Trust', schemeName: 'RBI Floating Rate Bonds', amount: 5000000, monthlyIncome: 0, startDate: '2023-06-15', maturityDate: '2030-06-15' },
];

export interface BullionHolding {
  id: string;
  customerName: string;
  metal: 'Gold' | 'Silver';
  form: 'Coin' | 'Bar' | 'Jewellery' | 'Digital Gold';
  weightGrams: number;
  purchaseRate: number;
  currentRate: number;
  purchaseDate: string;
}

export const MOCK_BULLION: BullionHolding[] = [
  { id: 'BUL-01', customerName: 'Kavita Mehta', metal: 'Gold', form: 'Coin', weightGrams: 50, purchaseRate: 5650, currentRate: 7180, purchaseDate: '2022-10-24' },
  { id: 'BUL-02', customerName: 'Priya Sharma', metal: 'Gold', form: 'Digital Gold', weightGrams: 12.5, purchaseRate: 6100, currentRate: 7180, purchaseDate: '2023-11-12' },
  { id: 'BUL-03', customerName: 'Rohan Malhotra', metal: 'Silver', form: 'Bar', weightGrams: 1000, purchaseRate: 72, currentRate: 92, purchaseDate: '2024-04-05' },
];

export interface PmsTransaction {
  id: string;
  clientName: string;
  strategy: string;
  transactionType: 'Buy' | 'Sell' | 'Dividend' | 'Fee Debit';
  securityName: string;
  quantity: number;
  amount: number;
  date: string;
}

export const PMS_STRATEGIES = ['Multi-Cap Growth', 'Large-Cap Focused', 'Small-Cap Alpha', 'Fixed Income Plus', 'Balanced Advantage'];

export const MOCK_PMS_TRANSACTIONS: PmsTransaction[] = [
  { id: 'PMS-01', clientName: 'The Malhotra Family Trust', strategy: 'Multi-Cap Growth', transactionType: 'Buy', securityName: 'Larsen & Toubro Ltd', quantity: 200, amount: 720000, date: '2026-05-04' },
  { id: 'PMS-02', clientName: 'Orion Logistics Ltd', strategy: 'Fixed Income Plus', transactionType: 'Sell', securityName: '7.26% GOI 2033', quantity: 500, amount: 505000, date: '2026-04-18' },
  { id: 'PMS-03', clientName: 'The Malhotra Family Trust', strategy: 'Multi-Cap Growth', transactionType: 'Dividend', securityName: 'ITC Ltd', quantity: 0, amount: 12400, date: '2026-03-30' },
  { id: 'PMS-04', clientName: 'Kabir Enterprises Pvt Ltd', strategy: 'Large-Cap Focused', transactionType: 'Fee Debit', securityName: '—', quantity: 0, amount: 8500, date: '2026-06-01' },
];

export interface OtherInvestmentImportRow {
  category: 'Stock' | 'Bond' | 'Debenture' | 'FD/RD' | 'Postal' | 'Company Deposit' | 'Bullion' | 'Other';
  customerName: string;
  instrumentName: string;
  amount: number;
  date: string;
}

// ---------------------------------------------------------------------------
// Document Management
// ---------------------------------------------------------------------------

export interface DocumentEntry {
  id: string;
  name: string;
  category: 'KYC' | 'Policy Document' | 'Account Statement' | 'Contract Note' | 'Nomination Form' | 'Other';
  linkedCustomer: string;
  fileType: string;
  fileSizeKb: number;
  uploadedOn: string;
}

export const DOCUMENT_CATEGORIES: DocumentEntry['category'][] = ['KYC', 'Policy Document', 'Account Statement', 'Contract Note', 'Nomination Form', 'Other'];

export const MOCK_DOCUMENTS: DocumentEntry[] = [
  { id: 'DOC-01', name: 'Rajesh_Mehta_PAN.pdf', category: 'KYC', linkedCustomer: 'Rajesh Mehta', fileType: 'application/pdf', fileSizeKb: 240, uploadedOn: '2026-01-15' },
  { id: 'DOC-02', name: 'LIC-882910334_Policy_Bond.pdf', category: 'Policy Document', linkedCustomer: 'Rajesh Mehta', fileType: 'application/pdf', fileSizeKb: 1120, uploadedOn: '2025-03-11' },
  { id: 'DOC-03', name: 'Malhotra_Trust_Deed.pdf', category: 'Other', linkedCustomer: 'The Malhotra Family Trust', fileType: 'application/pdf', fileSizeKb: 3400, uploadedOn: '2024-08-02' },
  { id: 'DOC-04', name: 'Q1_2026_Statement_Kapoor.pdf', category: 'Account Statement', linkedCustomer: 'Arvind Kapoor', fileType: 'application/pdf', fileSizeKb: 560, uploadedOn: '2026-04-01' },
];
