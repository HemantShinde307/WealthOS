// Portfolio Presentations — local mock data (per AGENT_CONVENTIONS.md this module keeps its
// own dataset, independent of core/mock-data and of sibling back-office agent folders).
// Three sample back-office customers with full cross-asset holdings feed all 28 report screens
// under /back-office/reports-advisory/presentations/*.

export interface PresentationCustomer {
  id: string;
  name: string;
  pan: string;
  segment: 'Family Office' | 'HNI' | 'Retail';
  rmName: string;
  address: string;
}

export const PRESENTATION_CUSTOMERS: PresentationCustomer[] = [
  { id: 'PC-001', name: 'The Malhotra Family Trust', pan: 'TMFPT7789A', segment: 'Family Office', rmName: 'Ritu Chandran', address: 'Malabar Hill, Mumbai 400006' },
  { id: 'PC-002', name: 'Arvind Kapoor', pan: 'AKQPK4455L', segment: 'HNI', rmName: 'Sameer Vohra', address: 'Vasant Vihar, New Delhi 110057' },
  { id: 'PC-003', name: 'Neha Verma', pan: 'NVQPV3321D', segment: 'Retail', rmName: 'Ritu Chandran', address: 'Kothrud, Pune 411038' },
];

// ---------------------------------------------------------------------------
// Mutual Funds
// ---------------------------------------------------------------------------

export type MfAssetClass = 'Equity' | 'Debt' | 'Hybrid' | 'Gold' | 'Liquid';

export interface MfHolding {
  id: string;
  customerId: string;
  folioNo: string;
  amc: string;
  schemeName: string;
  category: string;
  assetClass: MfAssetClass;
  goal?: string;
  units: number;
  avgNav: number;
  currentNav: number;
  startDate: string;
  sipActive: boolean;
}

export const MF_HOLDINGS: MfHolding[] = [
  { id: 'MFH-001', customerId: 'PC-001', folioNo: '48291056/71', amc: 'HDFC Mutual Fund', schemeName: 'HDFC Flexi Cap Fund - Growth', category: 'Flexi Cap', assetClass: 'Equity', goal: 'Wealth Creation', units: 18420.512, avgNav: 612.4, currentNav: 894.32, startDate: '2018-04-12', sipActive: true },
  { id: 'MFH-002', customerId: 'PC-001', folioNo: '48291056/72', amc: 'ICICI Prudential MF', schemeName: 'ICICI Prudential Bluechip Fund - Growth', category: 'Large Cap', assetClass: 'Equity', goal: 'Retirement', units: 24110.882, avgNav: 48.6, currentNav: 92.18, startDate: '2017-09-01', sipActive: true },
  { id: 'MFH-003', customerId: 'PC-001', folioNo: '48291056/73', amc: 'SBI Mutual Fund', schemeName: 'SBI Small Cap Fund - Growth', category: 'Small Cap', assetClass: 'Equity', goal: "Children's Education", units: 6210.771, avgNav: 88.5, currentNav: 174.62, startDate: '2019-11-20', sipActive: true },
  { id: 'MFH-004', customerId: 'PC-001', folioNo: '48291056/74', amc: 'Kotak Mahindra MF', schemeName: 'Kotak Corporate Bond Fund - Growth', category: 'Corporate Bond', assetClass: 'Debt', goal: 'Wealth Creation', units: 41200.0, avgNav: 28.9, currentNav: 33.47, startDate: '2020-02-14', sipActive: false },
  { id: 'MFH-005', customerId: 'PC-001', folioNo: '48291056/75', amc: 'Axis Mutual Fund', schemeName: 'Axis Liquid Fund - Growth', category: 'Liquid', assetClass: 'Liquid', units: 3120.44, avgNav: 2201.0, currentNav: 2489.31, startDate: '2021-06-01', sipActive: false },
  { id: 'MFH-006', customerId: 'PC-001', folioNo: '48291056/76', amc: 'Nippon India MF', schemeName: 'Nippon India Gold Savings Fund - Growth', category: 'Gold Fund', assetClass: 'Gold', goal: 'Wealth Creation', units: 8850.0, avgNav: 18.9, currentNav: 24.61, startDate: '2019-01-10', sipActive: false },
  { id: 'MFH-007', customerId: 'PC-001', folioNo: '48291056/77', amc: 'Mirae Asset MF', schemeName: 'Mirae Asset Hybrid Equity Fund - Growth', category: 'Aggressive Hybrid', assetClass: 'Hybrid', goal: 'Retirement', units: 9540.221, avgNav: 21.4, currentNav: 29.85, startDate: '2020-07-22', sipActive: true },

  { id: 'MFH-008', customerId: 'PC-002', folioNo: '11209934/12', amc: 'Parag Parikh MF', schemeName: 'PPFAS Flexi Cap Fund - Growth', category: 'Flexi Cap', assetClass: 'Equity', goal: 'Wealth Creation', units: 5120.44, avgNav: 42.6, currentNav: 78.92, startDate: '2019-05-04', sipActive: true },
  { id: 'MFH-009', customerId: 'PC-002', folioNo: '11209934/13', amc: 'Axis Mutual Fund', schemeName: 'Axis ELSS Tax Saver Fund - Growth', category: 'ELSS', assetClass: 'Equity', goal: 'Tax Saving', units: 3980.61, avgNav: 55.1, currentNav: 89.3, startDate: '2020-01-15', sipActive: true },
  { id: 'MFH-010', customerId: 'PC-002', folioNo: '11209934/14', amc: 'HDFC Mutual Fund', schemeName: 'HDFC Short Term Debt Fund - Growth', category: 'Short Duration', assetClass: 'Debt', goal: 'Emergency Fund', units: 12040.0, avgNav: 24.8, currentNav: 27.91, startDate: '2021-03-11', sipActive: false },
  { id: 'MFH-011', customerId: 'PC-002', folioNo: '11209934/15', amc: 'ICICI Prudential MF', schemeName: 'ICICI Prudential Balanced Advantage Fund - Growth', category: 'Balanced Advantage', assetClass: 'Hybrid', goal: 'Retirement', units: 4210.9, avgNav: 41.2, currentNav: 58.74, startDate: '2020-10-02', sipActive: true },

  { id: 'MFH-012', customerId: 'PC-003', folioNo: '90042217/03', amc: 'SBI Mutual Fund', schemeName: 'SBI Bluechip Fund - Growth', category: 'Large Cap', assetClass: 'Equity', goal: 'Wealth Creation', units: 1840.5, avgNav: 46.2, currentNav: 68.4, startDate: '2022-02-18', sipActive: true },
  { id: 'MFH-013', customerId: 'PC-003', folioNo: '90042217/04', amc: 'Nippon India MF', schemeName: 'Nippon India Liquid Fund - Growth', category: 'Liquid', assetClass: 'Liquid', units: 320.2, avgNav: 5410.0, currentNav: 5688.22, startDate: '2023-06-01', sipActive: false },
];

export interface MfTransaction {
  id: string;
  customerId: string;
  folioNo: string;
  schemeName: string;
  date: string;
  type: 'Purchase' | 'SIP Purchase' | 'Redemption' | 'Dividend Payout' | 'Switch In' | 'Switch Out';
  amount: number;
  units: number;
  nav: number;
  balanceUnits: number;
}

export const MF_TRANSACTIONS: MfTransaction[] = [
  { id: 'TXN-1001', customerId: 'PC-001', folioNo: '48291056/71', schemeName: 'HDFC Flexi Cap Fund - Growth', date: '2025-01-05', type: 'SIP Purchase', amount: 50000, units: 55.92, nav: 894.32, balanceUnits: 18420.512 },
  { id: 'TXN-1002', customerId: 'PC-001', folioNo: '48291056/71', schemeName: 'HDFC Flexi Cap Fund - Growth', date: '2024-12-05', type: 'SIP Purchase', amount: 50000, units: 57.1, nav: 875.6, balanceUnits: 18364.592 },
  { id: 'TXN-1003', customerId: 'PC-001', folioNo: '48291056/72', schemeName: 'ICICI Prudential Bluechip Fund - Growth', date: '2025-02-11', type: 'Purchase', amount: 200000, units: 2169.67, nav: 92.18, balanceUnits: 24110.882 },
  { id: 'TXN-1004', customerId: 'PC-001', folioNo: '48291056/73', schemeName: 'SBI Small Cap Fund - Growth', date: '2024-11-18', type: 'Redemption', amount: -87310, units: -500.0, nav: 174.62, balanceUnits: 6210.771 },
  { id: 'TXN-1005', customerId: 'PC-001', folioNo: '48291056/74', schemeName: 'Kotak Corporate Bond Fund - Growth', date: '2024-08-02', type: 'Purchase', amount: 500000, units: 14934.7, nav: 33.47, balanceUnits: 41200.0 },
  { id: 'TXN-1006', customerId: 'PC-001', folioNo: '48291056/77', schemeName: 'Mirae Asset Hybrid Equity Fund - Growth', date: '2025-03-22', type: 'Dividend Payout', amount: 6800, units: 0, nav: 29.85, balanceUnits: 9540.221 },
  { id: 'TXN-1007', customerId: 'PC-002', folioNo: '11209934/12', schemeName: 'PPFAS Flexi Cap Fund - Growth', date: '2025-01-10', type: 'SIP Purchase', amount: 15000, units: 190.09, nav: 78.92, balanceUnits: 5120.44 },
  { id: 'TXN-1008', customerId: 'PC-002', folioNo: '11209934/13', schemeName: 'Axis ELSS Tax Saver Fund - Growth', date: '2024-03-28', type: 'Purchase', amount: 150000, units: 1679.73, nav: 89.3, balanceUnits: 3980.61 },
  { id: 'TXN-1009', customerId: 'PC-002', folioNo: '11209934/15', schemeName: 'ICICI Prudential Balanced Advantage Fund - Growth', date: '2024-09-14', type: 'Switch In', amount: 100000, units: 1702.76, nav: 58.74, balanceUnits: 4210.9 },
  { id: 'TXN-1010', customerId: 'PC-003', folioNo: '90042217/03', schemeName: 'SBI Bluechip Fund - Growth', date: '2025-02-18', type: 'SIP Purchase', amount: 5000, units: 73.1, nav: 68.4, balanceUnits: 1840.5 },
];

export interface MfSystematicPlan {
  id: string;
  customerId: string;
  planType: 'SIP' | 'STP' | 'SWP';
  folioNo: string;
  schemeName: string;
  targetSchemeName?: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly';
  installmentDate: number;
  startDate: string;
  installmentsPaid: number;
  nextDueDate: string;
  status: 'Active' | 'Paused' | 'Stopped';
  bankAccount?: string;
}

export const MF_SYSTEMATIC_PLANS: MfSystematicPlan[] = [
  { id: 'SIP-001', customerId: 'PC-001', planType: 'SIP', folioNo: '48291056/71', schemeName: 'HDFC Flexi Cap Fund - Growth', amount: 50000, frequency: 'Monthly', installmentDate: 5, startDate: '2018-04-05', installmentsPaid: 83, nextDueDate: '2025-10-05', status: 'Active' },
  { id: 'SIP-002', customerId: 'PC-001', planType: 'SIP', folioNo: '48291056/72', schemeName: 'ICICI Prudential Bluechip Fund - Growth', amount: 40000, frequency: 'Monthly', installmentDate: 11, startDate: '2017-09-11', installmentsPaid: 96, nextDueDate: '2025-10-11', status: 'Active' },
  { id: 'SIP-003', customerId: 'PC-001', planType: 'SIP', folioNo: '48291056/73', schemeName: 'SBI Small Cap Fund - Growth', amount: 25000, frequency: 'Monthly', installmentDate: 18, startDate: '2019-11-18', installmentsPaid: 70, nextDueDate: '2025-10-18', status: 'Active' },
  { id: 'STP-001', customerId: 'PC-001', planType: 'STP', folioNo: '48291056/75', schemeName: 'Axis Liquid Fund - Growth', targetSchemeName: 'HDFC Flexi Cap Fund - Growth', amount: 100000, frequency: 'Monthly', installmentDate: 1, startDate: '2024-06-01', installmentsPaid: 16, nextDueDate: '2025-10-01', status: 'Active' },
  { id: 'SWP-001', customerId: 'PC-001', planType: 'SWP', folioNo: '48291056/74', schemeName: 'Kotak Corporate Bond Fund - Growth', amount: 60000, frequency: 'Monthly', installmentDate: 25, startDate: '2023-04-25', installmentsPaid: 30, nextDueDate: '2025-10-25', status: 'Active', bankAccount: 'HDFC Bank ****4471' },
  { id: 'SIP-004', customerId: 'PC-002', planType: 'SIP', folioNo: '11209934/12', schemeName: 'PPFAS Flexi Cap Fund - Growth', amount: 15000, frequency: 'Monthly', installmentDate: 10, startDate: '2019-05-10', installmentsPaid: 77, nextDueDate: '2025-10-10', status: 'Active' },
  { id: 'SIP-005', customerId: 'PC-002', planType: 'SIP', folioNo: '11209934/13', schemeName: 'Axis ELSS Tax Saver Fund - Growth', amount: 12500, frequency: 'Monthly', installmentDate: 3, startDate: '2020-01-03', installmentsPaid: 68, nextDueDate: '2025-10-03', status: 'Active' },
  { id: 'STP-002', customerId: 'PC-002', planType: 'STP', folioNo: '11209934/15', schemeName: 'ICICI Prudential Balanced Advantage Fund - Growth', targetSchemeName: 'Axis ELSS Tax Saver Fund - Growth', amount: 20000, frequency: 'Monthly', installmentDate: 14, startDate: '2024-09-14', installmentsPaid: 12, nextDueDate: '2025-10-14', status: 'Active' },
  { id: 'SIP-006', customerId: 'PC-003', planType: 'SIP', folioNo: '90042217/03', schemeName: 'SBI Bluechip Fund - Growth', amount: 5000, frequency: 'Monthly', installmentDate: 18, startDate: '2022-02-18', installmentsPaid: 43, nextDueDate: '2025-10-18', status: 'Active' },
  { id: 'SWP-002', customerId: 'PC-003', planType: 'SWP', folioNo: '90042217/04', schemeName: 'Nippon India Liquid Fund - Growth', amount: 8000, frequency: 'Monthly', installmentDate: 5, startDate: '2024-01-05', installmentsPaid: 21, nextDueDate: '2025-10-05', status: 'Paused', bankAccount: 'Axis Bank ****9902' },
];

export interface MfCapitalGain {
  id: string;
  customerId: string;
  schemeName: string;
  folioNo: string;
  purchaseDate: string;
  saleDate: string;
  units: number;
  purchaseValue: number;
  saleValue: number;
  gainType: 'STCG' | 'LTCG';
}

export const MF_CAPITAL_GAINS: MfCapitalGain[] = [
  { id: 'MFCG-001', customerId: 'PC-001', schemeName: 'SBI Small Cap Fund - Growth', folioNo: '48291056/73', purchaseDate: '2019-11-20', saleDate: '2024-11-18', units: 500.0, purchaseValue: 44250, saleValue: 87310, gainType: 'LTCG' },
  { id: 'MFCG-002', customerId: 'PC-001', schemeName: 'HDFC Flexi Cap Fund - Growth', folioNo: '48291056/71', purchaseDate: '2024-06-05', saleDate: '2025-02-14', units: 120.0, purchaseValue: 96000, saleValue: 102400, gainType: 'STCG' },
  { id: 'MFCG-003', customerId: 'PC-002', schemeName: 'ICICI Prudential Balanced Advantage Fund - Growth', folioNo: '11209934/15', purchaseDate: '2020-10-02', saleDate: '2024-09-14', units: 300.0, purchaseValue: 12360, saleValue: 17622, gainType: 'LTCG' },
  { id: 'MFCG-004', customerId: 'PC-003', schemeName: 'SBI Bluechip Fund - Growth', folioNo: '90042217/03', purchaseDate: '2024-08-18', saleDate: '2025-04-02', units: 200.0, purchaseValue: 11840, saleValue: 13100, gainType: 'STCG' },
];

export interface MfGoal {
  id: string;
  customerId: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  linkedFolios: string[];
}

export const MF_GOALS: MfGoal[] = [
  { id: 'GOAL-001', customerId: 'PC-001', name: 'Wealth Creation', targetAmount: 100000000, targetDate: '2035-03-31', linkedFolios: ['48291056/71', '48291056/74', '48291056/76'] },
  { id: 'GOAL-002', customerId: 'PC-001', name: 'Retirement', targetAmount: 60000000, targetDate: '2040-03-31', linkedFolios: ['48291056/72', '48291056/77'] },
  { id: 'GOAL-003', customerId: 'PC-001', name: "Children's Education", targetAmount: 15000000, targetDate: '2032-06-30', linkedFolios: ['48291056/73'] },
  { id: 'GOAL-004', customerId: 'PC-002', name: 'Wealth Creation', targetAmount: 20000000, targetDate: '2038-03-31', linkedFolios: ['11209934/12'] },
  { id: 'GOAL-005', customerId: 'PC-002', name: 'Tax Saving', targetAmount: 2500000, targetDate: '2030-03-31', linkedFolios: ['11209934/13'] },
  { id: 'GOAL-006', customerId: 'PC-002', name: 'Retirement', targetAmount: 30000000, targetDate: '2042-03-31', linkedFolios: ['11209934/15'] },
  { id: 'GOAL-007', customerId: 'PC-003', name: 'Wealth Creation', targetAmount: 5000000, targetDate: '2036-03-31', linkedFolios: ['90042217/03'] },
];

// ---------------------------------------------------------------------------
// Stocks
// ---------------------------------------------------------------------------

export interface StockHolding {
  id: string;
  customerId: string;
  symbol: string;
  companyName: string;
  sector: string;
  exchange: 'NSE' | 'BSE';
  qty: number;
  avgPrice: number;
  ltp: number;
}

export const STOCK_HOLDINGS: StockHolding[] = [
  { id: 'STK-001', customerId: 'PC-001', symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd', sector: 'Energy', exchange: 'NSE', qty: 420, avgPrice: 1980.5, ltp: 2851.2 },
  { id: 'STK-002', customerId: 'PC-001', symbol: 'HDFCBANK', companyName: 'HDFC Bank Ltd', sector: 'Banking', exchange: 'NSE', qty: 610, avgPrice: 1340.0, ltp: 1692.75 },
  { id: 'STK-003', customerId: 'PC-001', symbol: 'INFY', companyName: 'Infosys Ltd', sector: 'IT Services', exchange: 'NSE', qty: 380, avgPrice: 1290.4, ltp: 1541.9 },
  { id: 'STK-004', customerId: 'PC-001', symbol: 'TATAMOTORS', companyName: 'Tata Motors Ltd', sector: 'Automobile', exchange: 'NSE', qty: 900, avgPrice: 512.3, ltp: 781.15 },
  { id: 'STK-005', customerId: 'PC-001', symbol: 'SUNPHARMA', companyName: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharma', exchange: 'NSE', qty: 350, avgPrice: 980.0, ltp: 1712.4 },
  { id: 'STK-006', customerId: 'PC-002', symbol: 'ICICIBANK', companyName: 'ICICI Bank Ltd', sector: 'Banking', exchange: 'NSE', qty: 240, avgPrice: 890.0, ltp: 1264.55 },
  { id: 'STK-007', customerId: 'PC-002', symbol: 'TCS', companyName: 'Tata Consultancy Services Ltd', sector: 'IT Services', exchange: 'NSE', qty: 90, avgPrice: 3210.0, ltp: 4128.6 },
  { id: 'STK-008', customerId: 'PC-002', symbol: 'ITC', companyName: 'ITC Ltd', sector: 'FMCG', exchange: 'NSE', qty: 1200, avgPrice: 310.5, ltp: 468.9 },
  { id: 'STK-009', customerId: 'PC-003', symbol: 'MARUTI', companyName: 'Maruti Suzuki India Ltd', sector: 'Automobile', exchange: 'NSE', qty: 25, avgPrice: 9200.0, ltp: 12480.5 },
];

export interface StockTransaction {
  id: string;
  customerId: string;
  date: string;
  symbol: string;
  companyName: string;
  type: 'Buy' | 'Sell';
  qty: number;
  price: number;
  brokerage: number;
}

export const STOCK_TRANSACTIONS: StockTransaction[] = [
  { id: 'STXN-001', customerId: 'PC-001', date: '2025-01-14', symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd', type: 'Buy', qty: 100, price: 2680.0, brokerage: 268.0 },
  { id: 'STXN-002', customerId: 'PC-001', date: '2024-11-06', symbol: 'HDFCBANK', companyName: 'HDFC Bank Ltd', type: 'Buy', qty: 200, price: 1520.5, brokerage: 304.1 },
  { id: 'STXN-003', customerId: 'PC-001', date: '2024-09-22', symbol: 'TATAMOTORS', companyName: 'Tata Motors Ltd', type: 'Sell', qty: 150, price: 705.4, brokerage: 105.8 },
  { id: 'STXN-004', customerId: 'PC-001', date: '2025-03-10', symbol: 'SUNPHARMA', companyName: 'Sun Pharmaceutical Industries Ltd', type: 'Buy', qty: 50, price: 1580.0, brokerage: 79.0 },
  { id: 'STXN-005', customerId: 'PC-002', date: '2024-12-02', symbol: 'ICICIBANK', companyName: 'ICICI Bank Ltd', type: 'Buy', qty: 60, price: 1180.0, brokerage: 70.8 },
  { id: 'STXN-006', customerId: 'PC-002', date: '2025-02-19', symbol: 'ITC', companyName: 'ITC Ltd', type: 'Buy', qty: 400, price: 448.0, brokerage: 179.2 },
  { id: 'STXN-007', customerId: 'PC-003', date: '2025-01-28', symbol: 'MARUTI', companyName: 'Maruti Suzuki India Ltd', type: 'Buy', qty: 5, price: 11800.0, brokerage: 59.0 },
];

export interface StockCapitalGain {
  id: string;
  customerId: string;
  symbol: string;
  companyName: string;
  buyDate: string;
  sellDate: string;
  qty: number;
  buyValue: number;
  sellValue: number;
  gainType: 'STCG' | 'LTCG';
}

export const STOCK_CAPITAL_GAINS: StockCapitalGain[] = [
  { id: 'SCG-001', customerId: 'PC-001', symbol: 'TATAMOTORS', companyName: 'Tata Motors Ltd', buyDate: '2023-05-11', sellDate: '2024-09-22', qty: 150, buyValue: 61200, sellValue: 105810, gainType: 'LTCG' },
  { id: 'SCG-002', customerId: 'PC-001', symbol: 'INFY', companyName: 'Infosys Ltd', buyDate: '2024-08-05', sellDate: '2025-01-20', qty: 80, buyValue: 108800, sellValue: 118400, gainType: 'STCG' },
  { id: 'SCG-003', customerId: 'PC-002', symbol: 'TCS', companyName: 'Tata Consultancy Services Ltd', buyDate: '2022-06-14', sellDate: '2024-10-01', qty: 20, buyValue: 58200, sellValue: 79600, gainType: 'LTCG' },
];

// ---------------------------------------------------------------------------
// General Insurance
// ---------------------------------------------------------------------------

export interface GiPolicy {
  id: string;
  customerId: string;
  policyNo: string;
  insurer: string;
  product: 'Health Insurance' | 'Motor Insurance' | 'Home Insurance' | 'Personal Accident' | 'Travel Insurance';
  planName: string;
  sumInsured: number;
  premium: number;
  premiumFrequency: 'Annual' | 'Single';
  startDate: string;
  expiryDate: string;
  nomineeName: string;
  status: 'Active' | 'Expired' | 'Lapsed';
}

export const GI_POLICIES: GiPolicy[] = [
  { id: 'GI-001', customerId: 'PC-001', policyNo: 'HDFCERGO/HL/2291837', insurer: 'HDFC ERGO General Insurance', product: 'Health Insurance', planName: 'Optima Secure Family Floater', sumInsured: 10000000, premium: 84500, premiumFrequency: 'Annual', startDate: '2025-04-01', expiryDate: '2026-03-31', nomineeName: 'Rohan Malhotra', status: 'Active' },
  { id: 'GI-002', customerId: 'PC-001', policyNo: 'ICICILOM/MOT/7729104', insurer: 'ICICI Lombard General Insurance', product: 'Motor Insurance', planName: 'Comprehensive - Mercedes GLS', sumInsured: 8500000, premium: 145200, premiumFrequency: 'Annual', startDate: '2025-06-15', expiryDate: '2026-06-14', nomineeName: 'The Malhotra Family Trust', status: 'Active' },
  { id: 'GI-003', customerId: 'PC-001', policyNo: 'TATAAIG/HOM/3341982', insurer: 'Tata AIG General Insurance', product: 'Home Insurance', planName: 'Premium Home Shield', sumInsured: 50000000, premium: 38900, premiumFrequency: 'Annual', startDate: '2024-09-01', expiryDate: '2025-08-31', nomineeName: 'The Malhotra Family Trust', status: 'Active' },
  { id: 'GI-004', customerId: 'PC-002', policyNo: 'BAJAJ/HL/9982371', insurer: 'Bajaj Allianz General Insurance', product: 'Health Insurance', planName: 'Health Guard Family Floater', sumInsured: 2500000, premium: 32400, premiumFrequency: 'Annual', startDate: '2025-02-10', expiryDate: '2026-02-09', nomineeName: 'Priyanka Kapoor', status: 'Active' },
  { id: 'GI-005', customerId: 'PC-002', policyNo: 'ICICILOM/MOT/1120845', insurer: 'ICICI Lombard General Insurance', product: 'Motor Insurance', planName: 'Comprehensive - Toyota Fortuner', sumInsured: 3200000, premium: 52300, premiumFrequency: 'Annual', startDate: '2024-11-20', expiryDate: '2025-11-19', nomineeName: 'Arvind Kapoor', status: 'Active' },
  { id: 'GI-006', customerId: 'PC-003', policyNo: 'STARHEALTH/HL/5567234', insurer: 'Star Health Insurance', product: 'Health Insurance', planName: 'Young Star Individual', sumInsured: 1000000, premium: 14200, premiumFrequency: 'Annual', startDate: '2025-05-01', expiryDate: '2026-04-30', nomineeName: 'Anil Verma', status: 'Active' },
];

// ---------------------------------------------------------------------------
// Fixed Deposits / Recurring Deposits / Bonds
// ---------------------------------------------------------------------------

export interface FdRdInvestment {
  id: string;
  customerId: string;
  type: 'FD' | 'RD' | 'Bond' | 'Company Deposit';
  institution: string;
  accountNo: string;
  principal: number;
  installmentAmount?: number;
  rate: number;
  tenureMonths: number;
  startDate: string;
  maturityDate: string;
  maturityValue: number;
  status: 'Active' | 'Matured';
}

export const FD_RD_INVESTMENTS: FdRdInvestment[] = [
  { id: 'FD-001', customerId: 'PC-001', type: 'FD', institution: 'HDFC Bank', accountNo: 'FD-88213345', principal: 5000000, rate: 7.25, tenureMonths: 36, startDate: '2023-05-10', maturityDate: '2026-05-10', maturityValue: 6178000, status: 'Active' },
  { id: 'FD-002', customerId: 'PC-001', type: 'Bond', institution: 'REC Ltd — Tax-Free Bond', accountNo: 'BOND-4471290', principal: 2000000, rate: 6.5, tenureMonths: 120, startDate: '2020-01-15', maturityDate: '2030-01-15', maturityValue: 3800000, status: 'Active' },
  { id: 'FD-003', customerId: 'PC-001', type: 'Company Deposit', institution: 'Bajaj Finance Ltd', accountNo: 'CD-9812734', principal: 1500000, rate: 8.1, tenureMonths: 24, startDate: '2024-03-01', maturityDate: '2026-03-01', maturityValue: 1751500, status: 'Active' },
  { id: 'FD-004', customerId: 'PC-002', type: 'FD', institution: 'ICICI Bank', accountNo: 'FD-33298871', principal: 1200000, rate: 7.1, tenureMonths: 24, startDate: '2024-02-18', maturityDate: '2026-02-18', maturityValue: 1378000, status: 'Active' },
  { id: 'FD-005', customerId: 'PC-002', type: 'RD', institution: 'Axis Bank', accountNo: 'RD-11209934', principal: 0, installmentAmount: 20000, rate: 6.9, tenureMonths: 60, startDate: '2023-08-01', maturityDate: '2028-08-01', maturityValue: 1421000, status: 'Active' },
  { id: 'FD-006', customerId: 'PC-003', type: 'FD', institution: 'State Bank of India', accountNo: 'FD-77123409', principal: 300000, rate: 6.8, tenureMonths: 12, startDate: '2025-01-05', maturityDate: '2026-01-05', maturityValue: 320400, status: 'Active' },
];

// ---------------------------------------------------------------------------
// PPF
// ---------------------------------------------------------------------------

export interface PpfAccount {
  id: string;
  customerId: string;
  accountNo: string;
  institution: string;
  openDate: string;
  maturityDate: string;
  interestRate: number;
  currentBalance: number;
}

export const PPF_ACCOUNTS: PpfAccount[] = [
  { id: 'PPF-001', customerId: 'PC-001', accountNo: 'PPF/MUM/2011/778812', institution: 'State Bank of India, Malabar Hill Branch', openDate: '2011-04-08', maturityDate: '2026-04-08', interestRate: 7.1, currentBalance: 2841600 },
  { id: 'PPF-002', customerId: 'PC-002', accountNo: 'PPF/DEL/2016/223190', institution: 'Post Office, Vasant Vihar', openDate: '2016-07-19', maturityDate: '2031-07-19', interestRate: 7.1, currentBalance: 1124300 },
  { id: 'PPF-003', customerId: 'PC-003', accountNo: 'PPF/PUN/2021/551029', institution: 'HDFC Bank, Kothrud Branch', openDate: '2021-01-22', maturityDate: '2036-01-22', interestRate: 7.1, currentBalance: 312400 },
];

export interface PpfContribution {
  ppfAccountId: string;
  financialYear: string;
  openingBalance: number;
  contribution: number;
  interestCredited: number;
  closingBalance: number;
}

export const PPF_CONTRIBUTIONS: PpfContribution[] = [
  { ppfAccountId: 'PPF-001', financialYear: '2021-22', openingBalance: 1892400, contribution: 150000, interestCredited: 138200, closingBalance: 2180600 },
  { ppfAccountId: 'PPF-001', financialYear: '2022-23', openingBalance: 2180600, contribution: 150000, interestCredited: 158100, closingBalance: 2488700 },
  { ppfAccountId: 'PPF-001', financialYear: '2023-24', openingBalance: 2488700, contribution: 150000, interestCredited: 179400, closingBalance: 2818100 },
  { ppfAccountId: 'PPF-001', financialYear: '2024-25', openingBalance: 2818100, contribution: 0, interestCredited: 23500, closingBalance: 2841600 },
  { ppfAccountId: 'PPF-002', financialYear: '2022-23', openingBalance: 892400, contribution: 100000, interestCredited: 68300, closingBalance: 1060700 },
  { ppfAccountId: 'PPF-002', financialYear: '2023-24', openingBalance: 1060700, contribution: 50000, interestCredited: 76200, closingBalance: 1186900 },
  { ppfAccountId: 'PPF-002', financialYear: '2024-25', openingBalance: 1186900, contribution: -100000, interestCredited: 37400, closingBalance: 1124300 },
  { ppfAccountId: 'PPF-003', financialYear: '2023-24', openingBalance: 178200, contribution: 100000, interestCredited: 15100, closingBalance: 293300 },
  { ppfAccountId: 'PPF-003', financialYear: '2024-25', openingBalance: 293300, contribution: 10000, interestCredited: 9100, closingBalance: 312400 },
];

export interface PpfChallan {
  id: string;
  customerId: string;
  ppfAccountId: string;
  challanNo: string;
  date: string;
  amount: number;
  mode: 'Cash' | 'Cheque' | 'Online (NEFT)';
  status: 'Cleared' | 'Pending';
}

export const PPF_CHALLANS: PpfChallan[] = [
  { id: 'CHN-001', customerId: 'PC-001', ppfAccountId: 'PPF-001', challanNo: 'CH-778812-041', date: '2024-04-10', amount: 150000, mode: 'Online (NEFT)', status: 'Cleared' },
  { id: 'CHN-002', customerId: 'PC-002', ppfAccountId: 'PPF-002', challanNo: 'CH-223190-018', date: '2024-06-05', amount: 50000, mode: 'Cheque', status: 'Cleared' },
  { id: 'CHN-003', customerId: 'PC-003', ppfAccountId: 'PPF-003', challanNo: 'CH-551029-009', date: '2024-12-28', amount: 10000, mode: 'Online (NEFT)', status: 'Cleared' },
  { id: 'CHN-004', customerId: 'PC-003', ppfAccountId: 'PPF-003', challanNo: 'CH-551029-010', date: '2025-08-15', amount: 15000, mode: 'Online (NEFT)', status: 'Pending' },
];

// ---------------------------------------------------------------------------
// Bullion
// ---------------------------------------------------------------------------

export interface BullionHolding {
  id: string;
  customerId: string;
  metal: 'Gold' | 'Silver';
  form: 'Coin' | 'Bar' | 'Jewellery' | 'Digital Gold' | 'Sovereign Gold Bond';
  grams: number;
  purchaseDate: string;
  purchaseRatePerGram: number;
  currentRatePerGram: number;
}

export const BULLION_HOLDINGS: BullionHolding[] = [
  { id: 'BUL-001', customerId: 'PC-001', metal: 'Gold', form: 'Sovereign Gold Bond', grams: 250, purchaseDate: '2020-08-11', purchaseRatePerGram: 5334, currentRatePerGram: 7412 },
  { id: 'BUL-002', customerId: 'PC-001', metal: 'Gold', form: 'Bar', grams: 500, purchaseDate: '2019-02-20', purchaseRatePerGram: 3510, currentRatePerGram: 7412 },
  { id: 'BUL-003', customerId: 'PC-001', metal: 'Silver', form: 'Bar', grams: 3000, purchaseDate: '2022-05-14', purchaseRatePerGram: 62.5, currentRatePerGram: 91.8 },
  { id: 'BUL-004', customerId: 'PC-002', metal: 'Gold', form: 'Jewellery', grams: 180, purchaseDate: '2021-11-02', purchaseRatePerGram: 4820, currentRatePerGram: 7412 },
  { id: 'BUL-005', customerId: 'PC-002', metal: 'Gold', form: 'Digital Gold', grams: 45.2, purchaseDate: '2024-01-18', purchaseRatePerGram: 6210, currentRatePerGram: 7412 },
  { id: 'BUL-006', customerId: 'PC-003', metal: 'Gold', form: 'Coin', grams: 20, purchaseDate: '2023-10-25', purchaseRatePerGram: 5980, currentRatePerGram: 7412 },
];
