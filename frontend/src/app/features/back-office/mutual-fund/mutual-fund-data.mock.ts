// Mutual Fund back-office operations — local mock data, kept self-contained per
// AGENT_CONVENTIONS.md #4/#5 (new domain, no existing model — do not touch
// core/mock-data or core/services). Folio numbers, AMC/scheme names and NAVs
// are illustrative, styled after real CAMS/KFintech RTA records.

export interface MfFolio {
  id: string;
  folioNumber: string;
  amc: string;
  scheme: string;
  category: string;
  planType: 'Growth' | 'IDCW' | 'IDCW Reinvestment';
  customerId: string;
  customerName: string;
  pan: string;
  units: number;
  avgNav: number;
  currentNav: number;
  status: 'Active' | 'Inactive' | 'Zero Balance';
  openedOn: string;
}

export type MfTransactionType =
  | 'Purchase'
  | 'Additional Purchase'
  | 'Redemption'
  | 'SIP'
  | 'SWP'
  | 'STP In'
  | 'STP Out';

export type MfTransactionSource = 'Manual Entry' | 'Registrar Import' | 'Systematic';

export interface MfTransaction {
  id: string;
  folioId: string;
  scheme: string;
  transactionType: MfTransactionType;
  amount: number;
  units: number;
  nav: number;
  date: string;
  status: 'Processed' | 'Pending' | 'Failed';
  source: MfTransactionSource;
}

export type MandateType = 'SIP' | 'SWP' | 'STP';
export type MandateFrequency = 'Weekly' | 'Monthly' | 'Quarterly';
export type MandateStatus = 'Active' | 'Paused' | 'Stopped' | 'Completed';

export interface SystematicMandate {
  id: string;
  type: MandateType;
  folioId: string;
  scheme: string;
  targetFolioId?: string;
  targetScheme?: string;
  amount: number;
  frequency: MandateFrequency;
  startDate: string;
  nextDueDate: string;
  endDate?: string;
  installmentsDone: number;
  totalInstallments?: number;
  status: MandateStatus;
}

export interface RegistrarImportLogEntry {
  id: string;
  fileName: string;
  registrar: 'CAMS' | 'KFintech';
  rowCount: number;
  importedOn: string;
}

export interface BrokerRecord {
  id: string;
  brokerCode: string;
  brokerName: string;
  arn: string;
  euin: string;
  folioId: string;
}

export interface BrokerageSlab {
  id: string;
  schemeCategory: string;
  upfrontPct: number;
  trailPct: number;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export const MOCK_MF_FOLIOS: MfFolio[] = [
  { id: 'FOL-0001', folioNumber: '88214521/00', amc: 'HDFC Mutual Fund', scheme: 'HDFC Flexi Cap Fund - Regular Growth', category: 'Flexi Cap', planType: 'Growth', customerId: 'BOC-1001', customerName: 'Rajesh Mehta', pan: 'ABCPM1234F', units: 6842.315, avgNav: 1680.40, currentNav: 2041.9650, status: 'Active', openedOn: '2019-05-10' },
  { id: 'FOL-0002', folioNumber: '77103349/00', amc: 'Nippon India Mutual Fund', scheme: 'Nippon India Large Cap Fund - Growth', category: 'Large Cap', planType: 'Growth', customerId: 'BOC-1001', customerName: 'Rajesh Mehta', pan: 'ABCPM1234F', units: 12405.882, avgNav: 61.20, currentNav: 87.5826, status: 'Active', openedOn: '2020-02-18' },
  { id: 'FOL-0003', folioNumber: '65530112/00', amc: 'ICICI Prudential Mutual Fund', scheme: 'ICICI Prudential Bluechip Fund - Growth', category: 'Large Cap', planType: 'Growth', customerId: 'BOC-1002', customerName: 'Kavita Mehta', pan: 'ABCPM5678G', units: 3210.774, avgNav: 78.10, currentNav: 98.4520, status: 'Active', openedOn: '2019-08-02' },
  { id: 'FOL-0004', folioNumber: '91004876/00', amc: 'Aditya Birla Sun Life Mutual Fund', scheme: 'Aditya Birla Sun Life Midcap Fund - Regular Growth', category: 'Mid Cap', planType: 'Growth', customerId: 'BOC-1010', customerName: 'Vikram Singh', pan: 'VSQPS8821P', units: 9871.204, avgNav: 620.10, currentNav: 848.0600, status: 'Active', openedOn: '2018-11-25' },
  { id: 'FOL-0005', folioNumber: '30021784/00', amc: 'SBI Mutual Fund', scheme: 'SBI Dividend Yield Fund - Regular Growth', category: 'Dividend Yield', planType: 'IDCW', customerId: 'BOC-1005', customerName: 'Kabir Enterprises Pvt Ltd', pan: 'KEPCL2210C', units: 41208.663, avgNav: 12.10, currentNav: 15.5780, status: 'Active', openedOn: '2017-06-14' },
  { id: 'FOL-0006', folioNumber: '71255990/00', amc: 'Nippon India Mutual Fund', scheme: 'Nippon India Large Cap Fund - Growth', category: 'Large Cap', planType: 'Growth', customerId: 'BOC-1007', customerName: 'Suresh Iyer', pan: 'SIQPI6612E', units: 5502.117, avgNav: 68.40, currentNav: 87.5826, status: 'Active', openedOn: '2020-09-05' },
  { id: 'FOL-0007', folioNumber: '20077341/00', amc: 'Axis Mutual Fund', scheme: 'Axis Large & Mid Cap Fund - Direct Growth', category: 'Large & Mid Cap', planType: 'Growth', customerId: 'BOC-1006', customerName: 'Neha Verma', pan: 'NVQPV3321D', units: 4310.552, avgNav: 30.60, currentNav: 38.8900, status: 'Active', openedOn: '2022-03-12' },
  { id: 'FOL-0008', folioNumber: '55231099/00', amc: 'Mirae Asset Mutual Fund', scheme: 'Mirae Asset Large and Midcap Fund - Direct Growth', category: 'Large & Mid Cap', planType: 'Growth', customerId: 'BOC-1013', customerName: 'Priya Sharma', pan: 'BXTPS4471K', units: 2870.940, avgNav: 140.20, currentNav: 177.4550, status: 'Active', openedOn: '2021-08-19' },
  { id: 'FOL-0009', folioNumber: '18820044/00', amc: 'Kotak Mahindra Mutual Fund', scheme: 'Kotak Emerging Equity Fund - Growth', category: 'Mid Cap', planType: 'Growth', customerId: 'BOC-1004', customerName: 'Sunita Reddy', pan: 'SRXPR9988M', units: 7654.302, avgNav: 88.90, currentNav: 121.3400, status: 'Active', openedOn: '2018-01-30' },
  { id: 'FOL-0010', folioNumber: '90031255/00', amc: 'HDFC Mutual Fund', scheme: 'HDFC Multi Asset Allocation Fund - Regular Growth', category: 'Multi Asset Allocation', planType: 'Growth', customerId: 'BOC-1004', customerName: 'Sunita Reddy', pan: 'SRXPR9988M', units: 15230.887, avgNav: 58.10, currentNav: 74.5640, status: 'Active', openedOn: '2019-04-22' },
  { id: 'FOL-0011', folioNumber: '44120987/00', amc: 'UTI Mutual Fund', scheme: 'UTI Small Cap Fund - Regular Plan', category: 'Small Cap', planType: 'Growth', customerId: 'BOC-1009', customerName: 'Ananya Ghosh', pan: 'AGQPG9931N', units: 1802.440, avgNav: 21.30, currentNav: 27.7591, status: 'Active', openedOn: '2024-04-10' },
  { id: 'FOL-0012', folioNumber: '33210765/00', amc: 'PPFAS Mutual Fund', scheme: 'Parag Parikh Flexi Cap Fund - Regular Growth', category: 'Flexi Cap', planType: 'Growth', customerId: 'BOC-1003', customerName: 'Arvind Kapoor', pan: 'AKQPK4455L', units: 610.225, avgNav: 66.40, currentNav: 81.5236, status: 'Active', openedOn: '2023-02-08' },
  { id: 'FOL-0013', folioNumber: '76650321/00', amc: 'Franklin Templeton Mutual Fund', scheme: 'Franklin India Corporate Debt Fund - Growth', category: 'Corporate Bond Fund', planType: 'Growth', customerId: 'BOC-1008', customerName: 'The Malhotra Family Trust', pan: 'TMFPT7789A', units: 88410.552, avgNav: 82.10, currentNav: 91.2200, status: 'Active', openedOn: '2015-09-30' },
  { id: 'FOL-0014', folioNumber: '10098453/00', amc: 'SBI Mutual Fund', scheme: 'SBI Liquid Fund - Regular Growth', category: 'Liquid Fund', planType: 'Growth', customerId: 'BOC-1008', customerName: 'The Malhotra Family Trust', pan: 'TMFPT7789A', units: 32011.204, avgNav: 340.10, currentNav: 385.6600, status: 'Active', openedOn: '2015-10-02' },
  { id: 'FOL-0015', folioNumber: '61123480/00', amc: 'ICICI Prudential Mutual Fund', scheme: 'ICICI Prudential Banking & PSU Debt Fund - Growth', category: 'Banking & PSU Fund', planType: 'Growth', customerId: 'BOC-1012', customerName: 'Orion Logistics Ltd', pan: 'OLQPL5567R', units: 145200.884, avgNav: 26.40, currentNav: 30.1150, status: 'Active', openedOn: '2016-07-01' },
  { id: 'FOL-0016', folioNumber: '55780213/00', amc: 'Axis Mutual Fund', scheme: 'Axis ELSS Tax Saver Fund - Growth', category: 'ELSS', planType: 'Growth', customerId: 'BOC-1008B', customerName: 'Rohan Malhotra', pan: 'ABMPM4432P', units: 3021.775, avgNav: 55.30, currentNav: 72.8900, status: 'Active', openedOn: '2019-01-15' },
  { id: 'FOL-0017', folioNumber: '22987611/00', amc: 'Tata Mutual Fund', scheme: 'Tata Digital India Fund - Direct Growth', category: 'Sectoral - Technology', planType: 'Growth', customerId: 'BOC-1010B', customerName: 'Vikram Singh', pan: 'VSQPS8821P', units: 980.330, avgNav: 33.20, currentNav: 47.9300, status: 'Active', openedOn: '2023-07-11' },
  { id: 'FOL-0018', folioNumber: '39004521/00', amc: 'HSBC Mutual Fund', scheme: 'HSBC Small Cap Fund - Direct Growth', category: 'Small Cap', planType: 'Growth', customerId: 'BOC-1011', customerName: 'Meera Nair', pan: 'MNQPN7712Q', units: 0, avgNav: 0, currentNav: 103.7388, status: 'Zero Balance', openedOn: '2026-08-20' },
];

export const MOCK_MF_TRANSACTIONS: MfTransaction[] = [
  { id: 'MFT-50001', folioId: 'FOL-0001', scheme: 'HDFC Flexi Cap Fund - Regular Growth', transactionType: 'Purchase', amount: 500000, units: 2976.190, nav: 168.04, date: '2019-05-10', status: 'Processed', source: 'Manual Entry' },
  { id: 'MFT-50002', folioId: 'FOL-0001', scheme: 'HDFC Flexi Cap Fund - Regular Growth', transactionType: 'Additional Purchase', amount: 200000, units: 979.784, nav: 204.13, date: '2024-11-04', status: 'Processed', source: 'Manual Entry' },
  { id: 'MFT-50003', folioId: 'FOL-0002', scheme: 'Nippon India Large Cap Fund - Growth', transactionType: 'SIP', amount: 25000, units: 285.61, nav: 87.5, date: '2026-09-01', status: 'Processed', source: 'Systematic' },
  { id: 'MFT-50004', folioId: 'FOL-0002', scheme: 'Nippon India Large Cap Fund - Growth', transactionType: 'SIP', amount: 25000, units: 288.02, nav: 86.8, date: '2026-08-01', status: 'Processed', source: 'Systematic' },
  { id: 'MFT-50005', folioId: 'FOL-0003', scheme: 'ICICI Prudential Bluechip Fund - Growth', transactionType: 'Purchase', amount: 250000, units: 3200.51, nav: 78.10, date: '2019-08-02', status: 'Processed', source: 'Manual Entry' },
  { id: 'MFT-50006', folioId: 'FOL-0004', scheme: 'Aditya Birla Sun Life Midcap Fund - Regular Growth', transactionType: 'Purchase', amount: 1000000, units: 8869.36, nav: 112.75, date: '2018-11-25', status: 'Processed', source: 'Registrar Import' },
  { id: 'MFT-50007', folioId: 'FOL-0004', scheme: 'Aditya Birla Sun Life Midcap Fund - Regular Growth', transactionType: 'Additional Purchase', amount: 150000, units: 176.84, nav: 848.30, date: '2026-06-18', status: 'Processed', source: 'Registrar Import' },
  { id: 'MFT-50008', folioId: 'FOL-0005', scheme: 'SBI Dividend Yield Fund - Regular Growth', transactionType: 'Purchase', amount: 5000000, units: 2074.61, nav: 2410.35, date: '2017-06-14', status: 'Processed', source: 'Manual Entry' },
  { id: 'MFT-50009', folioId: 'FOL-0006', scheme: 'Nippon India Large Cap Fund - Growth', transactionType: 'SIP', amount: 50000, units: 274.18, nav: 182.40, date: '2026-09-01', status: 'Processed', source: 'Systematic' },
  { id: 'MFT-50010', folioId: 'FOL-0009', scheme: 'Kotak Emerging Equity Fund - Growth', transactionType: 'Redemption', amount: 180000, units: 1483.60, nav: 121.34, date: '2026-07-22', status: 'Processed', source: 'Manual Entry' },
  { id: 'MFT-50011', folioId: 'FOL-0010', scheme: 'HDFC Multi Asset Allocation Fund - Regular Growth', transactionType: 'SWP', amount: 20000, units: 268.29, nav: 74.56, date: '2026-09-05', status: 'Processed', source: 'Systematic' },
  { id: 'MFT-50012', folioId: 'FOL-0013', scheme: 'Franklin India Corporate Debt Fund - Growth', transactionType: 'STP Out', amount: 100000, units: 1096.47, nav: 91.20, date: '2026-09-08', status: 'Processed', source: 'Systematic' },
  { id: 'MFT-50013', folioId: 'FOL-0014', scheme: 'SBI Liquid Fund - Regular Growth', transactionType: 'STP In', amount: 100000, units: 259.29, nav: 385.66, date: '2026-09-08', status: 'Processed', source: 'Systematic' },
  { id: 'MFT-50014', folioId: 'FOL-0012', scheme: 'Parag Parikh Flexi Cap Fund - Regular Growth', transactionType: 'Purchase', amount: 40500, units: 610.225, nav: 66.37, date: '2023-02-08', status: 'Processed', source: 'Registrar Import' },
  { id: 'MFT-50015', folioId: 'FOL-0016', scheme: 'Axis ELSS Tax Saver Fund - Growth', transactionType: 'Purchase', amount: 167100, units: 3021.775, nav: 55.30, date: '2019-01-15', status: 'Processed', source: 'Manual Entry' },
  { id: 'MFT-50016', folioId: 'FOL-0018', scheme: 'HSBC Small Cap Fund - Direct Growth', transactionType: 'Redemption', amount: 95400, units: 950.10, nav: 100.41, date: '2026-08-25', status: 'Processed', source: 'Manual Entry' },
];

export const MOCK_SYSTEMATIC_MANDATES: SystematicMandate[] = [
  { id: 'SIP-3001', type: 'SIP', folioId: 'FOL-0002', scheme: 'Nippon India Large Cap Fund - Growth', amount: 25000, frequency: 'Monthly', startDate: '2020-03-01', nextDueDate: '2026-10-01', installmentsDone: 79, status: 'Active' },
  { id: 'SIP-3002', type: 'SIP', folioId: 'FOL-0006', scheme: 'Nippon India Large Cap Fund - Growth', amount: 50000, frequency: 'Monthly', startDate: '2020-10-01', nextDueDate: '2026-10-01', installmentsDone: 72, status: 'Active' },
  { id: 'SIP-3003', type: 'SIP', folioId: 'FOL-0007', scheme: 'Axis Large & Mid Cap Fund - Direct Growth', amount: 15000, frequency: 'Monthly', startDate: '2022-04-05', nextDueDate: '2026-10-05', installmentsDone: 54, status: 'Active' },
  { id: 'SIP-3004', type: 'SIP', folioId: 'FOL-0011', scheme: 'UTI Small Cap Fund - Regular Plan', amount: 5000, frequency: 'Monthly', startDate: '2024-05-10', nextDueDate: '2026-10-10', installmentsDone: 28, status: 'Active' },
  { id: 'SIP-3005', type: 'SIP', folioId: 'FOL-0008', scheme: 'Mirae Asset Large and Midcap Fund - Direct Growth', amount: 20000, frequency: 'Monthly', startDate: '2021-09-19', nextDueDate: '2026-10-19', installmentsDone: 60, status: 'Paused' },
  { id: 'SIP-3006', type: 'SIP', folioId: 'FOL-0012', scheme: 'Parag Parikh Flexi Cap Fund - Regular Growth', amount: 10000, frequency: 'Monthly', startDate: '2023-03-08', nextDueDate: '2026-10-08', installmentsDone: 43, status: 'Active' },
  { id: 'SWP-4001', type: 'SWP', folioId: 'FOL-0010', scheme: 'HDFC Multi Asset Allocation Fund - Regular Growth', amount: 20000, frequency: 'Monthly', startDate: '2025-01-05', nextDueDate: '2026-10-05', endDate: '2028-01-05', installmentsDone: 21, totalInstallments: 36, status: 'Active' },
  { id: 'SWP-4002', type: 'SWP', folioId: 'FOL-0005', scheme: 'SBI Dividend Yield Fund - Regular Growth', amount: 40000, frequency: 'Monthly', startDate: '2024-06-01', nextDueDate: '2026-10-01', installmentsDone: 28, status: 'Active' },
  { id: 'SWP-4003', type: 'SWP', folioId: 'FOL-0013', scheme: 'Franklin India Corporate Debt Fund - Growth', amount: 60000, frequency: 'Quarterly', startDate: '2022-01-15', nextDueDate: '2026-10-15', installmentsDone: 19, status: 'Stopped' },
  { id: 'STP-5001', type: 'STP', folioId: 'FOL-0014', targetFolioId: 'FOL-0013', scheme: 'SBI Liquid Fund - Regular Growth', targetScheme: 'Franklin India Corporate Debt Fund - Growth', amount: 100000, frequency: 'Monthly', startDate: '2026-06-08', nextDueDate: '2026-10-08', endDate: '2027-06-08', installmentsDone: 3, totalInstallments: 12, status: 'Active' },
  { id: 'STP-5002', type: 'STP', folioId: 'FOL-0009', targetFolioId: 'FOL-0004', scheme: 'Kotak Emerging Equity Fund - Growth', targetScheme: 'Aditya Birla Sun Life Midcap Fund - Regular Growth', amount: 30000, frequency: 'Monthly', startDate: '2026-02-20', nextDueDate: '2026-10-20', installmentsDone: 7, status: 'Active' },
  { id: 'STP-5003', type: 'STP', folioId: 'FOL-0015', targetFolioId: 'FOL-0007', scheme: 'ICICI Prudential Banking & PSU Debt Fund - Growth', targetScheme: 'Axis Large & Mid Cap Fund - Direct Growth', amount: 50000, frequency: 'Monthly', startDate: '2025-11-01', nextDueDate: '2026-10-01', installmentsDone: 10, status: 'Paused' },
];

export const MOCK_REGISTRAR_IMPORT_LOG: RegistrarImportLogEntry[] = [
  { id: 'RIL-001', fileName: 'CAMS_TXN_20260901.csv', registrar: 'CAMS', rowCount: 214, importedOn: '2026-09-01T09:15:00' },
  { id: 'RIL-002', fileName: 'KFIN_TXN_20260825.csv', registrar: 'KFintech', rowCount: 98, importedOn: '2026-08-25T10:02:00' },
];

export const MOCK_BROKER_RECORDS: BrokerRecord[] = [
  { id: 'BRK-001', brokerCode: 'BRK0142', brokerName: 'Adapt Wealth Advisors Pvt Ltd', arn: 'ARN-45678', euin: 'E123456', folioId: 'FOL-0001' },
  { id: 'BRK-002', brokerCode: 'BRK0142', brokerName: 'Adapt Wealth Advisors Pvt Ltd', arn: 'ARN-45678', euin: 'E123457', folioId: 'FOL-0004' },
  { id: 'BRK-003', brokerCode: 'BRK0209', brokerName: 'Northstar Investment Services', arn: 'ARN-78123', euin: 'E223344', folioId: 'FOL-0013' },
];

export const MOCK_BROKERAGE_SLABS: BrokerageSlab[] = [
  { id: 'BRS-001', schemeCategory: 'Equity - Large Cap / Flexi Cap', upfrontPct: 1.00, trailPct: 0.75, effectiveFrom: '2025-04-01', effectiveTo: null },
  { id: 'BRS-002', schemeCategory: 'Equity - Mid Cap / Small Cap', upfrontPct: 1.25, trailPct: 1.00, effectiveFrom: '2025-04-01', effectiveTo: null },
  { id: 'BRS-003', schemeCategory: 'ELSS', upfrontPct: 1.00, trailPct: 0.90, effectiveFrom: '2025-04-01', effectiveTo: null },
  { id: 'BRS-004', schemeCategory: 'Debt - Corporate Bond / Banking & PSU', upfrontPct: 0.40, trailPct: 0.35, effectiveFrom: '2025-04-01', effectiveTo: null },
  { id: 'BRS-005', schemeCategory: 'Debt - Liquid / Overnight', upfrontPct: 0.10, trailPct: 0.08, effectiveFrom: '2025-04-01', effectiveTo: null },
  { id: 'BRS-006', schemeCategory: 'Hybrid / Multi Asset Allocation', upfrontPct: 0.75, trailPct: 0.60, effectiveFrom: '2025-04-01', effectiveTo: null },
  { id: 'BRS-007', schemeCategory: 'Equity - Large Cap / Flexi Cap', upfrontPct: 1.10, trailPct: 0.80, effectiveFrom: '2024-04-01', effectiveTo: '2025-03-31' },
];
