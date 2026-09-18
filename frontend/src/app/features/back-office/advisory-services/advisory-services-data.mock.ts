// Portfolio Advisory / Services / New Products — local mock data.
// Kept separate from core/mock-data and from other back-office sub-folders
// per AGENT_CONVENTIONS.md — this module owns its own customer references.

export type SchemeCategory = 'Equity' | 'ELSS' | 'Debt' | 'Hybrid';

export interface AdvisoryCustomerRef {
  name: string;
  pan: string;
}

export const ADVISORY_CUSTOMERS: AdvisoryCustomerRef[] = [
  { name: 'Rajesh Mehta', pan: 'ABCPM1234F' },
  { name: 'Kavita Mehta', pan: 'ABCPM5678G' },
  { name: 'Arvind Kapoor', pan: 'AKQPK4455L' },
  { name: 'Sunita Reddy', pan: 'SRXPR9988M' },
  { name: 'Kabir Enterprises Pvt Ltd', pan: 'KEPCL2210C' },
  { name: 'Neha Verma', pan: 'NVQPV3321D' },
  { name: 'Suresh Iyer', pan: 'SIQPI6612E' },
  { name: 'Latha Iyer', pan: 'SIQPI6612E' },
  { name: 'The Malhotra Family Trust', pan: 'TMFPT7789A' },
  { name: 'Rohan Malhotra', pan: 'ABMPM4432P' },
  { name: 'Ananya Ghosh', pan: 'AGQPG9931N' },
  { name: 'Vikram Singh', pan: 'VSQPS8821P' },
  { name: 'Meera Nair', pan: 'MNQPN7712Q' },
  { name: 'Orion Logistics Ltd', pan: 'OLQPL5567R' },
  { name: 'Priya Sharma', pan: 'BXTPS4471K' },
];

// ---------------------------------------------------------------------------
// Portfolio Advisory — Mutual Fund holdings
// ---------------------------------------------------------------------------

export interface AdvisoryHolding {
  id: string;
  customerName: string;
  pan: string;
  folioNo: string;
  schemeName: string;
  amc: string;
  category: SchemeCategory;
  purchaseDate: string; // ISO yyyy-mm-dd
  units: number;
  avgCost: number;
  currentNav: number;
  actioned: boolean;
}

export const MOCK_ADVISORY_HOLDINGS: AdvisoryHolding[] = [
  { id: 'AH-001', customerName: 'Rajesh Mehta', pan: 'ABCPM1234F', folioNo: '5541201/22', schemeName: 'Parag Parikh Flexi Cap Fund', amc: 'PPFAS Mutual Fund', category: 'Equity', purchaseDate: '2021-05-12', units: 1250.5, avgCost: 42.10, currentNav: 68.90, actioned: false },
  { id: 'AH-002', customerName: 'Rajesh Mehta', pan: 'ABCPM1234F', folioNo: '5541202/10', schemeName: 'Axis ELSS Tax Saver Fund', amc: 'Axis Mutual Fund', category: 'ELSS', purchaseDate: '2020-03-18', units: 800.25, avgCost: 55.30, currentNav: 79.40, actioned: false },
  { id: 'AH-003', customerName: 'Kavita Mehta', pan: 'ABCPM5678G', folioNo: '5541305/11', schemeName: 'Mirae Asset Tax Saver Fund', amc: 'Mirae Asset Mutual Fund', category: 'ELSS', purchaseDate: '2024-01-20', units: 500, avgCost: 35.60, currentNav: 39.80, actioned: false },
  { id: 'AH-004', customerName: 'Arvind Kapoor', pan: 'AKQPK4455L', folioNo: '5541410/02', schemeName: 'SBI Magnum Medium Duration Fund', amc: 'SBI Mutual Fund', category: 'Debt', purchaseDate: '2019-11-05', units: 3000, avgCost: 28.40, currentNav: 24.10, actioned: false },
  { id: 'AH-005', customerName: 'Sunita Reddy', pan: 'SRXPR9988M', folioNo: '5541520/33', schemeName: 'Quant Small Cap Fund', amc: 'Quant Mutual Fund', category: 'Equity', purchaseDate: '2022-07-09', units: 620, avgCost: 95.20, currentNav: 152.75, actioned: false },
  { id: 'AH-006', customerName: 'Sunita Reddy', pan: 'SRXPR9988M', folioNo: '5541521/01', schemeName: 'Nippon India Small Cap Fund', amc: 'Nippon India Mutual Fund', category: 'Equity', purchaseDate: '2025-12-01', units: 410, avgCost: 60.00, currentNav: 55.00, actioned: false },
  { id: 'AH-007', customerName: 'Kabir Enterprises Pvt Ltd', pan: 'KEPCL2210C', folioNo: '5541605/09', schemeName: 'ICICI Prudential Balanced Advantage Fund', amc: 'ICICI Prudential Mutual Fund', category: 'Hybrid', purchaseDate: '2023-02-14', units: 4500, avgCost: 48.90, currentNav: 59.50, actioned: false },
  { id: 'AH-008', customerName: 'Neha Verma', pan: 'NVQPV3321D', folioNo: '5541710/18', schemeName: 'Kotak Emerging Equity Fund', amc: 'Kotak Mutual Fund', category: 'Equity', purchaseDate: '2020-08-22', units: 950, avgCost: 38.70, currentNav: 33.10, actioned: false },
  { id: 'AH-009', customerName: 'Suresh Iyer', pan: 'SIQPI6612E', folioNo: '5541822/44', schemeName: 'UTI Nifty Index Fund', amc: 'UTI Mutual Fund', category: 'Equity', purchaseDate: '2024-05-30', units: 2100, avgCost: 105.40, currentNav: 128.60, actioned: false },
  { id: 'AH-010', customerName: 'Latha Iyer', pan: 'SIQPI6612E', folioNo: '5541823/02', schemeName: 'DSP Tax Saver Fund', amc: 'DSP Mutual Fund', category: 'ELSS', purchaseDate: '2021-09-01', units: 700, avgCost: 44.80, currentNav: 61.30, actioned: false },
  { id: 'AH-011', customerName: 'The Malhotra Family Trust', pan: 'TMFPT7789A', folioNo: '5541930/77', schemeName: 'Franklin India Taxshield', amc: 'Franklin Templeton Mutual Fund', category: 'ELSS', purchaseDate: '2023-10-10', units: 1200, avgCost: 60.10, currentNav: 66.50, actioned: false },
  { id: 'AH-012', customerName: 'Rohan Malhotra', pan: 'ABMPM4432P', folioNo: '5542011/05', schemeName: 'Canara Robeco Equity Tax Saver Fund', amc: 'Canara Robeco Mutual Fund', category: 'ELSS', purchaseDate: '2022-01-15', units: 640, avgCost: 52.30, currentNav: 88.90, actioned: false },
  { id: 'AH-013', customerName: 'Ananya Ghosh', pan: 'AGQPG9931N', folioNo: '5542120/19', schemeName: 'Motilal Oswal Midcap Fund', amc: 'Motilal Oswal Mutual Fund', category: 'Equity', purchaseDate: '2025-01-05', units: 300, avgCost: 68.40, currentNav: 61.90, actioned: false },
  { id: 'AH-014', customerName: 'Vikram Singh', pan: 'VSQPS8821P', folioNo: '5542230/61', schemeName: 'Tata Digital India Fund', amc: 'Tata Mutual Fund', category: 'Equity', purchaseDate: '2024-11-20', units: 480, avgCost: 42.65, currentNav: 33.90, actioned: false },
  { id: 'AH-015', customerName: 'Vikram Singh', pan: 'VSQPS8821P', folioNo: '5542231/09', schemeName: 'Bandhan ELSS Tax Saver Fund', amc: 'Bandhan Mutual Fund', category: 'ELSS', purchaseDate: '2019-06-01', units: 900, avgCost: 30.20, currentNav: 47.85, actioned: false },
  { id: 'AH-016', customerName: 'Meera Nair', pan: 'MNQPN7712Q', folioNo: '5542340/28', schemeName: 'HDFC Corporate Bond Fund', amc: 'HDFC Mutual Fund', category: 'Debt', purchaseDate: '2022-03-11', units: 5000, avgCost: 22.10, currentNav: 24.85, actioned: false },
  { id: 'AH-017', customerName: 'Orion Logistics Ltd', pan: 'OLQPL5567R', folioNo: '5542455/14', schemeName: 'SBI Magnum Medium Duration Fund', amc: 'SBI Mutual Fund', category: 'Debt', purchaseDate: '2025-04-02', units: 8000, avgCost: 26.50, currentNav: 27.10, actioned: false },
  { id: 'AH-018', customerName: 'Priya Sharma', pan: 'BXTPS4471K', folioNo: '5542560/33', schemeName: 'Mirae Asset Tax Saver Fund', amc: 'Mirae Asset Mutual Fund', category: 'ELSS', purchaseDate: '2020-12-24', units: 550, avgCost: 33.90, currentNav: 52.40, actioned: false },
  { id: 'AH-019', customerName: 'Priya Sharma', pan: 'BXTPS4471K', folioNo: '5542561/07', schemeName: 'Parag Parikh Flexi Cap Fund', amc: 'PPFAS Mutual Fund', category: 'Equity', purchaseDate: '2026-02-10', units: 200, avgCost: 70.10, currentNav: 66.00, actioned: false },
  { id: 'AH-020', customerName: 'Kabir Enterprises Pvt Ltd', pan: 'KEPCL2210C', folioNo: '5541606/45', schemeName: 'Nippon India Small Cap Fund', amc: 'Nippon India Mutual Fund', category: 'Equity', purchaseDate: '2018-06-15', units: 1500, avgCost: 25.40, currentNav: 61.10, actioned: false },
];

// ---------------------------------------------------------------------------
// Services — Application Register
// ---------------------------------------------------------------------------

export type ApplicationStatus = 'Pending' | 'Processing' | 'Completed' | 'Rejected';
export type ApplicationType =
  | 'New Account Opening'
  | 'Mandate Registration (NACH)'
  | 'Nomination Update'
  | 'Bank Mandate Change'
  | 'Folio Consolidation'
  | 'Address Change'
  | 'Email/Mobile Update'
  | 'Demat to MF Conversion';

export interface ApplicationRegisterEntry {
  id: string;
  customerName: string;
  applicationType: ApplicationType;
  branch: string;
  submittedOn: string;
  status: ApplicationStatus;
  remarks: string;
}

export const MOCK_APPLICATION_REGISTER: ApplicationRegisterEntry[] = [
  { id: 'APP-2026-0301', customerName: 'Rajesh Mehta', applicationType: 'Mandate Registration (NACH)', branch: 'Mumbai - BKC', submittedOn: '2026-09-14', status: 'Processing', remarks: 'Awaiting bank confirmation' },
  { id: 'APP-2026-0298', customerName: 'Ananya Ghosh', applicationType: 'New Account Opening', branch: 'Kolkata - Park Street', submittedOn: '2026-09-13', status: 'Pending', remarks: 'KYC document pending' },
  { id: 'APP-2026-0295', customerName: 'Meera Nair', applicationType: 'New Account Opening', branch: 'Kochi - MG Road', submittedOn: '2026-09-12', status: 'Rejected', remarks: 'PAN-Aadhaar not linked' },
  { id: 'APP-2026-0289', customerName: 'Suresh Iyer', applicationType: 'Address Change', branch: 'Dubai - NRI Desk', submittedOn: '2026-09-10', status: 'Completed', remarks: 'Updated to new Dubai address' },
  { id: 'APP-2026-0284', customerName: 'Vikram Singh', applicationType: 'Bank Mandate Change', branch: 'Delhi - CP', submittedOn: '2026-09-09', status: 'Processing', remarks: 'New cancelled cheque received' },
  { id: 'APP-2026-0279', customerName: 'Kabir Enterprises Pvt Ltd', applicationType: 'Folio Consolidation', branch: 'Mumbai - Fort', submittedOn: '2026-09-08', status: 'Pending', remarks: '6 folios to be merged' },
  { id: 'APP-2026-0273', customerName: 'Priya Sharma', applicationType: 'Nomination Update', branch: 'Pune - FC Road', submittedOn: '2026-09-06', status: 'Completed', remarks: 'Nominee changed to spouse' },
  { id: 'APP-2026-0268', customerName: 'Neha Verma', applicationType: 'Email/Mobile Update', branch: 'Bengaluru - Indiranagar', submittedOn: '2026-09-05', status: 'Completed', remarks: 'Mobile OTP verified' },
  { id: 'APP-2026-0261', customerName: 'Arvind Kapoor', applicationType: 'Demat to MF Conversion', branch: 'Chennai - T Nagar', submittedOn: '2026-09-03', status: 'Processing', remarks: 'CDSL rematerialisation in progress' },
  { id: 'APP-2026-0255', customerName: 'The Malhotra Family Trust', applicationType: 'New Account Opening', branch: 'Mumbai - BKC', submittedOn: '2026-09-01', status: 'Completed', remarks: 'Trust deed verified' },
  { id: 'APP-2026-0249', customerName: 'Rohan Malhotra', applicationType: 'Mandate Registration (NACH)', branch: 'Mumbai - BKC', submittedOn: '2026-08-29', status: 'Rejected', remarks: 'Signature mismatch on mandate form' },
  { id: 'APP-2026-0241', customerName: 'Sunita Reddy', applicationType: 'Nomination Update', branch: 'Hyderabad - Banjara Hills', submittedOn: '2026-08-27', status: 'Pending', remarks: 'Form awaiting second nominee share %' },
  { id: 'APP-2026-0233', customerName: 'Kavita Mehta', applicationType: 'Bank Mandate Change', branch: 'Mumbai - BKC', submittedOn: '2026-08-24', status: 'Completed', remarks: 'New HDFC Bank account linked' },
  { id: 'APP-2026-0227', customerName: 'Orion Logistics Ltd', applicationType: 'Folio Consolidation', branch: 'Chennai - T Nagar', submittedOn: '2026-08-20', status: 'Processing', remarks: 'Board resolution under review' },
  { id: 'APP-2026-0219', customerName: 'Latha Iyer', applicationType: 'Address Change', branch: 'Dubai - NRI Desk', submittedOn: '2026-08-15', status: 'Completed', remarks: 'NRI address proof accepted' },
];

// ---------------------------------------------------------------------------
// Services — Service Requests
// ---------------------------------------------------------------------------

export type ServiceRequestPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ServiceRequestStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface ServiceRequestEntry {
  id: string;
  customerName: string;
  subject: string;
  category: string;
  priority: ServiceRequestPriority;
  status: ServiceRequestStatus;
  raisedOn: string;
  assignedTo: string;
  description: string;
}

export const MOCK_SERVICE_REQUESTS: ServiceRequestEntry[] = [
  { id: 'SR-8841', customerName: 'Rajesh Mehta', subject: 'Redemption amount not credited', category: 'Redemption Delay', priority: 'Urgent', status: 'Open', raisedOn: '2026-09-15', assignedTo: 'Ritu Kapadia', description: 'Redemption of ₹2,50,000 from Parag Parikh Flexi Cap initiated 5 days ago, funds not yet credited to bank account.' },
  { id: 'SR-8837', customerName: 'Neha Verma', subject: 'Wrong NAV applied on SIP', category: 'Wrong NAV Applied', priority: 'High', status: 'In Progress', raisedOn: '2026-09-14', assignedTo: 'Amit Deshpande', description: 'SIP instalment dated 10th appears to have been processed at the NAV of the 12th.' },
  { id: 'SR-8830', customerName: 'Sunita Reddy', subject: 'Unable to log in to customer portal', category: 'Portal Login Issue', priority: 'Medium', status: 'Resolved', raisedOn: '2026-09-13', assignedTo: 'Ritu Kapadia', description: 'OTP not being received on registered mobile number. Reset flow completed by desk.' },
  { id: 'SR-8825', customerName: 'Kabir Enterprises Pvt Ltd', subject: 'Duplicate folio created', category: 'Duplicate Folio', priority: 'High', status: 'Open', raisedOn: '2026-09-12', assignedTo: 'Sameer Joshi', description: 'Two folios exist for the same PAN and scheme after a recent purchase — requesting merge.' },
  { id: 'SR-8819', customerName: 'Vikram Singh', subject: 'SIP not debited this month', category: 'SIP Not Debited', priority: 'Medium', status: 'In Progress', raisedOn: '2026-09-11', assignedTo: 'Amit Deshpande', description: 'Auto-debit for Tata Digital India Fund SIP failed; bank shows sufficient balance.' },
  { id: 'SR-8812', customerName: 'Priya Sharma', subject: 'Statement request for FY 2025-26', category: 'Statement Request', priority: 'Low', status: 'Closed', raisedOn: '2026-09-09', assignedTo: 'Ritu Kapadia', description: 'Consolidated Account Statement required for tax filing purposes.' },
  { id: 'SR-8805', customerName: 'Suresh Iyer', subject: 'PAN and KYC record mismatch', category: 'KYC Mismatch', priority: 'High', status: 'Open', raisedOn: '2026-09-08', assignedTo: 'Sameer Joshi', description: 'Name spelling differs between KRA record and folio — blocking further transactions.' },
  { id: 'SR-8799', customerName: 'Meera Nair', subject: 'Nominee update request not processed', category: 'Nominee Update Request', priority: 'Medium', status: 'In Progress', raisedOn: '2026-09-07', assignedTo: 'Amit Deshpande', description: 'Physical nomination form submitted 10 days ago, status still shows pending.' },
  { id: 'SR-8792', customerName: 'Arvind Kapoor', subject: 'Dividend not credited', category: 'Dividend Not Credited', priority: 'Medium', status: 'Resolved', raisedOn: '2026-09-05', assignedTo: 'Ritu Kapadia', description: 'IDCW payout for August cycle credited a day late due to bank holiday; confirmed resolved.' },
  { id: 'SR-8785', customerName: 'The Malhotra Family Trust', subject: 'Address update rejected twice', category: 'Address Update', priority: 'High', status: 'Open', raisedOn: '2026-09-03', assignedTo: 'Sameer Joshi', description: 'Address proof rejected for unclear scan, second attempt also failed — needs manual review.' },
  { id: 'SR-8778', customerName: 'Kavita Mehta', subject: 'Extra units credited in error', category: 'Transaction Issue', priority: 'Urgent', status: 'In Progress', raisedOn: '2026-09-01', assignedTo: 'Amit Deshpande', description: 'System shows 120 extra units credited against an SIP instalment — needs reversal.' },
  { id: 'SR-8771', customerName: 'Rohan Malhotra', subject: 'Unable to download tax statement', category: 'Statement Request', priority: 'Low', status: 'Closed', raisedOn: '2026-08-29', assignedTo: 'Ritu Kapadia', description: 'Capital gains statement download link expired; regenerated and shared.' },
  { id: 'SR-8764', customerName: 'Ananya Ghosh', subject: 'KYC re-verification required', category: 'KYC Mismatch', priority: 'Medium', status: 'Open', raisedOn: '2026-08-26', assignedTo: 'Sameer Joshi', description: 'KRA flagged KYC as On Hold; customer needs to re-submit Aadhaar-based e-KYC.' },
  { id: 'SR-8757', customerName: 'Orion Logistics Ltd', subject: 'Bulk transaction upload failed', category: 'Transaction Issue', priority: 'High', status: 'In Progress', raisedOn: '2026-08-22', assignedTo: 'Amit Deshpande', description: 'Batch file for treasury investment upload rejected — file format error suspected.' },
  { id: 'SR-8750', customerName: 'Latha Iyer', subject: 'NRE/NRO bank mandate correction', category: 'Transaction Issue', priority: 'Medium', status: 'Resolved', raisedOn: '2026-08-19', assignedTo: 'Ritu Kapadia', description: 'Redemption mandate was pointing to NRO account instead of NRE — corrected and confirmed.' },
];

// ---------------------------------------------------------------------------
// New Products — Loan Against Securities
// ---------------------------------------------------------------------------

export type LasStatus = 'Active' | 'Closed' | 'Under Review';

export interface LasFacility {
  id: string;
  customerName: string;
  lender: string;
  pledgedSecuritiesValue: number;
  sanctionedLimit: number;
  utilizedAmount: number;
  interestRatePct: number;
  sanctionDate: string;
  status: LasStatus;
}

export const MOCK_LAS_FACILITIES: LasFacility[] = [
  { id: 'LAS-1001', customerName: 'Kabir Enterprises Pvt Ltd', lender: 'HDFC Bank', pledgedSecuritiesValue: 45000000, sanctionedLimit: 22500000, utilizedAmount: 15800000, interestRatePct: 9.75, sanctionDate: '2024-02-10', status: 'Active' },
  { id: 'LAS-1002', customerName: 'The Malhotra Family Trust', lender: 'Kotak Mahindra Bank', pledgedSecuritiesValue: 182000000, sanctionedLimit: 91000000, utilizedAmount: 40000000, interestRatePct: 9.25, sanctionDate: '2023-06-18', status: 'Active' },
  { id: 'LAS-1003', customerName: 'Vikram Singh', lender: 'Bajaj Finserv', pledgedSecuritiesValue: 15600000, sanctionedLimit: 7800000, utilizedAmount: 5200000, interestRatePct: 10.50, sanctionDate: '2025-01-22', status: 'Active' },
  { id: 'LAS-1004', customerName: 'Orion Logistics Ltd', lender: 'Axis Finance', pledgedSecuritiesValue: 92000000, sanctionedLimit: 46000000, utilizedAmount: 46000000, interestRatePct: 9.50, sanctionDate: '2022-11-05', status: 'Active' },
  { id: 'LAS-1005', customerName: 'Sunita Reddy', lender: 'ICICI Bank', pledgedSecuritiesValue: 8750000, sanctionedLimit: 4375000, utilizedAmount: 0, interestRatePct: 10.75, sanctionDate: '2025-08-30', status: 'Closed' },
  { id: 'LAS-1006', customerName: 'Rajesh Mehta', lender: 'HDFC Bank', pledgedSecuritiesValue: 12450000, sanctionedLimit: 6225000, utilizedAmount: 3100000, interestRatePct: 10.25, sanctionDate: '2024-09-14', status: 'Active' },
  { id: 'LAS-1007', customerName: 'Suresh Iyer', lender: 'Kotak Mahindra Bank', pledgedSecuritiesValue: 6300000, sanctionedLimit: 3150000, utilizedAmount: 1200000, interestRatePct: 10.90, sanctionDate: '2025-03-11', status: 'Active' },
  { id: 'LAS-1008', customerName: 'Priya Sharma', lender: 'Bajaj Finserv', pledgedSecuritiesValue: 850000, sanctionedLimit: 425000, utilizedAmount: 0, interestRatePct: 11.25, sanctionDate: '2026-06-02', status: 'Under Review' },
  { id: 'LAS-1009', customerName: 'Rohan Malhotra', lender: 'Axis Finance', pledgedSecuritiesValue: 4200000, sanctionedLimit: 2100000, utilizedAmount: 1850000, interestRatePct: 10.60, sanctionDate: '2024-05-27', status: 'Active' },
  { id: 'LAS-1010', customerName: 'Neha Verma', lender: 'ICICI Bank', pledgedSecuritiesValue: 1250000, sanctionedLimit: 625000, utilizedAmount: 400000, interestRatePct: 11.00, sanctionDate: '2025-10-19', status: 'Active' },
];

// ---------------------------------------------------------------------------
// New Products — Equity Baskets
// ---------------------------------------------------------------------------

export interface EquityBasket {
  id: string;
  name: string;
  theme: string;
  provider: string;
  constituentCount: number;
  oneYearReturnPct: number;
  minInvestment: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
}

export const MOCK_EQUITY_BASKETS: EquityBasket[] = [
  { id: 'EB-01', name: 'Quality Bluechip Compounders', theme: 'Large Cap Quality', provider: 'WealthOS Research Desk', constituentCount: 18, oneYearReturnPct: 21.4, minInvestment: 25000, riskLevel: 'Moderate' },
  { id: 'EB-02', name: 'India Digital Consumption', theme: 'Consumer Internet & Digital Payments', provider: 'WealthOS Research Desk', constituentCount: 14, oneYearReturnPct: 34.8, minInvestment: 20000, riskLevel: 'High' },
  { id: 'EB-03', name: 'Green Energy Transition', theme: 'Renewables & EV Supply Chain', provider: 'Windmill Capital', constituentCount: 12, oneYearReturnPct: 28.9, minInvestment: 30000, riskLevel: 'High' },
  { id: 'EB-04', name: 'Dividend Aristocrats', theme: 'High & Consistent Dividend Payers', provider: 'WealthOS Research Desk', constituentCount: 20, oneYearReturnPct: 15.2, minInvestment: 15000, riskLevel: 'Low' },
  { id: 'EB-05', name: 'Small Cap Momentum Leaders', theme: 'Momentum — Small Cap', provider: 'Niveshaay Research', constituentCount: 22, oneYearReturnPct: 41.6, minInvestment: 25000, riskLevel: 'Very High' },
  { id: 'EB-06', name: 'Banking & Financial Services Alpha', theme: 'BFSI', provider: 'WealthOS Research Desk', constituentCount: 15, oneYearReturnPct: 19.7, minInvestment: 20000, riskLevel: 'Moderate' },
  { id: 'EB-07', name: 'Rural & Consumption Revival', theme: 'Rural Demand & FMCG', provider: 'Wealthy Capital', constituentCount: 16, oneYearReturnPct: 17.3, minInvestment: 15000, riskLevel: 'Moderate' },
  { id: 'EB-08', name: 'Global Innovation Basket', theme: 'US Tech ADRs & Innovation', provider: 'WealthOS Research Desk', constituentCount: 10, oneYearReturnPct: 26.5, minInvestment: 50000, riskLevel: 'High' },
  { id: 'EB-09', name: 'Infrastructure & Capex Cycle', theme: 'Infra, Capital Goods & Cement', provider: 'Windmill Capital', constituentCount: 17, oneYearReturnPct: 23.1, minInvestment: 20000, riskLevel: 'High' },
  { id: 'EB-10', name: 'Defence & Manufacturing PLI', theme: 'Defence & PLI-linked Manufacturing', provider: 'Niveshaay Research', constituentCount: 13, oneYearReturnPct: 38.2, minInvestment: 30000, riskLevel: 'Very High' },
];

export interface BasketOrder {
  id: string;
  basketName: string;
  customerName: string;
  amount: number;
  investedOn: string;
  status: 'Order Placed' | 'Executed';
}

// ---------------------------------------------------------------------------
// New Products — P2P Investment
// ---------------------------------------------------------------------------

export interface P2pOption {
  id: string;
  platformPartner: string;
  planName: string;
  tenureMonths: number;
  expectedReturnPct: number;
  minInvestment: number;
  riskGrade: 'A' | 'B' | 'C';
  lockIn: boolean;
}

export const MOCK_P2P_OPTIONS: P2pOption[] = [
  { id: 'P2P-01', platformPartner: 'LenDenClub', planName: 'LDC Monthly Income Plan', tenureMonths: 12, expectedReturnPct: 11.5, minInvestment: 5000, riskGrade: 'B', lockIn: false },
  { id: 'P2P-02', platformPartner: 'Faircent', planName: 'Faircent Prime Borrower Basket', tenureMonths: 24, expectedReturnPct: 13.2, minInvestment: 10000, riskGrade: 'B', lockIn: true },
  { id: 'P2P-03', platformPartner: 'LiquiLoans', planName: 'LiquiLoans Secured Plus', tenureMonths: 6, expectedReturnPct: 9.8, minInvestment: 25000, riskGrade: 'A', lockIn: false },
  { id: 'P2P-04', platformPartner: 'CRED Mint', planName: 'CRED Mint High Trust Score Pool', tenureMonths: 9, expectedReturnPct: 10.2, minInvestment: 2000, riskGrade: 'A', lockIn: false },
  { id: 'P2P-05', platformPartner: 'Lendbox', planName: 'Lendbox Growth Plan', tenureMonths: 36, expectedReturnPct: 14.5, minInvestment: 10000, riskGrade: 'C', lockIn: true },
  { id: 'P2P-06', platformPartner: 'RupeeCircle', planName: 'RupeeCircle Balanced Portfolio', tenureMonths: 18, expectedReturnPct: 12.0, minInvestment: 5000, riskGrade: 'B', lockIn: true },
  { id: 'P2P-07', platformPartner: 'LenDenClub', planName: 'LDC FMPP 90-Day', tenureMonths: 3, expectedReturnPct: 8.9, minInvestment: 1000, riskGrade: 'A', lockIn: false },
  { id: 'P2P-08', platformPartner: 'Faircent', planName: 'Faircent MSME Lending Pool', tenureMonths: 24, expectedReturnPct: 13.8, minInvestment: 15000, riskGrade: 'C', lockIn: true },
];

export interface P2pOrder {
  id: string;
  planName: string;
  customerName: string;
  amount: number;
  investedOn: string;
  status: 'Order Placed' | 'Executed';
}

// ---------------------------------------------------------------------------
// New Products — DigiGold
// ---------------------------------------------------------------------------

export type DigiGoldTxnType = 'Buy' | 'Sell';
export type DigiGoldTxnStatus = 'Completed' | 'Pending' | 'Failed';

export interface DigiGoldTransaction {
  id: string;
  customerName: string;
  type: DigiGoldTxnType;
  grams: number;
  ratePerGram: number;
  amount: number;
  vendor: string;
  timestamp: string;
  status: DigiGoldTxnStatus;
}

export const CURRENT_DIGIGOLD_RATE_PER_GRAM = 7842;

export const MOCK_DIGIGOLD_TRANSACTIONS: DigiGoldTransaction[] = [
  { id: 'DG-30011', customerName: 'Rajesh Mehta', type: 'Buy', grams: 2.550, ratePerGram: 7810, amount: 19916, vendor: 'SafeGold', timestamp: '2026-09-15 10:22', status: 'Completed' },
  { id: 'DG-30010', customerName: 'Neha Verma', type: 'Buy', grams: 0.640, ratePerGram: 7825, amount: 5008, vendor: 'MMTC-PAMP', timestamp: '2026-09-15 09:05', status: 'Completed' },
  { id: 'DG-30009', customerName: 'Priya Sharma', type: 'Sell', grams: 1.200, ratePerGram: 7830, amount: 9396, vendor: 'Augmont', timestamp: '2026-09-14 17:40', status: 'Completed' },
  { id: 'DG-30008', customerName: 'Vikram Singh', type: 'Buy', grams: 5.000, ratePerGram: 7790, amount: 38950, vendor: 'SafeGold', timestamp: '2026-09-14 14:12', status: 'Pending' },
  { id: 'DG-30007', customerName: 'Sunita Reddy', type: 'Buy', grams: 0.320, ratePerGram: 7815, amount: 2501, vendor: 'MMTC-PAMP', timestamp: '2026-09-13 12:31', status: 'Completed' },
  { id: 'DG-30006', customerName: 'Ananya Ghosh', type: 'Sell', grams: 3.100, ratePerGram: 7800, amount: 24180, vendor: 'Augmont', timestamp: '2026-09-13 11:02', status: 'Failed' },
  { id: 'DG-30005', customerName: 'Kavita Mehta', type: 'Buy', grams: 1.850, ratePerGram: 7788, amount: 14408, vendor: 'SafeGold', timestamp: '2026-09-12 16:48', status: 'Completed' },
  { id: 'DG-30004', customerName: 'Suresh Iyer', type: 'Buy', grams: 10.000, ratePerGram: 7765, amount: 77650, vendor: 'MMTC-PAMP', timestamp: '2026-09-11 09:55', status: 'Completed' },
  { id: 'DG-30003', customerName: 'Meera Nair', type: 'Buy', grams: 0.150, ratePerGram: 7770, amount: 1166, vendor: 'Augmont', timestamp: '2026-09-10 19:20', status: 'Completed' },
  { id: 'DG-30002', customerName: 'Arvind Kapoor', type: 'Sell', grams: 0.900, ratePerGram: 7750, amount: 6975, vendor: 'SafeGold', timestamp: '2026-09-10 10:11', status: 'Completed' },
  { id: 'DG-30001', customerName: 'Rohan Malhotra', type: 'Buy', grams: 4.200, ratePerGram: 7742, amount: 32516, vendor: 'MMTC-PAMP', timestamp: '2026-09-09 15:37', status: 'Completed' },
  { id: 'DG-30000', customerName: 'Latha Iyer', type: 'Buy', grams: 0.500, ratePerGram: 7735, amount: 3868, vendor: 'Augmont', timestamp: '2026-09-08 13:02', status: 'Completed' },
  { id: 'DG-29999', customerName: 'Orion Logistics Ltd', type: 'Buy', grams: 25.000, ratePerGram: 7720, amount: 193000, vendor: 'SafeGold', timestamp: '2026-09-07 11:44', status: 'Completed' },
  { id: 'DG-29998', customerName: 'Kabir Enterprises Pvt Ltd', type: 'Buy', grams: 50.000, ratePerGram: 7705, amount: 385250, vendor: 'MMTC-PAMP', timestamp: '2026-09-05 10:00', status: 'Completed' },
  { id: 'DG-29997', customerName: 'Rajesh Mehta', type: 'Sell', grams: 1.000, ratePerGram: 7695, amount: 7695, vendor: 'SafeGold', timestamp: '2026-09-04 18:15', status: 'Completed' },
];

// ---------------------------------------------------------------------------
// New Products — eCAS
// ---------------------------------------------------------------------------

export type EcasStatus = 'Queued' | 'Processing' | 'Sent' | 'Failed';

export interface EcasRequest {
  id: string;
  customerName: string;
  pan: string;
  emailId: string;
  fromDate: string;
  toDate: string;
  requestedOn: string;
  requestedBy: 'Self' | 'RM';
  status: EcasStatus;
}

export const MOCK_ECAS_REQUESTS: EcasRequest[] = [
  { id: 'ECAS-5501', customerName: 'Rajesh Mehta', pan: 'ABCPM1234F', emailId: 'rajesh.mehta@example.com', fromDate: '2025-04-01', toDate: '2026-03-31', requestedOn: '2026-09-15', requestedBy: 'Self', status: 'Sent' },
  { id: 'ECAS-5500', customerName: 'The Malhotra Family Trust', pan: 'TMFPT7789A', emailId: 'office@malhotratrust.com', fromDate: '2016-04-01', toDate: '2026-03-31', requestedOn: '2026-09-14', requestedBy: 'RM', status: 'Processing' },
  { id: 'ECAS-5499', customerName: 'Sunita Reddy', pan: 'SRXPR9988M', emailId: 'sunita.reddy@example.com', fromDate: '2025-04-01', toDate: '2026-03-31', requestedOn: '2026-09-13', requestedBy: 'Self', status: 'Sent' },
  { id: 'ECAS-5498', customerName: 'Kabir Enterprises Pvt Ltd', pan: 'KEPCL2210C', emailId: 'finance@kabirent.com', fromDate: '2020-04-01', toDate: '2026-03-31', requestedOn: '2026-09-12', requestedBy: 'RM', status: 'Failed' },
  { id: 'ECAS-5497', customerName: 'Neha Verma', pan: 'NVQPV3321D', emailId: 'neha.verma@example.com', fromDate: '2025-04-01', toDate: '2026-03-31', requestedOn: '2026-09-11', requestedBy: 'Self', status: 'Sent' },
  { id: 'ECAS-5496', customerName: 'Suresh Iyer', pan: 'SIQPI6612E', emailId: 'suresh.iyer@example.com', fromDate: '2021-04-01', toDate: '2026-03-31', requestedOn: '2026-09-10', requestedBy: 'RM', status: 'Sent' },
  { id: 'ECAS-5495', customerName: 'Vikram Singh', pan: 'VSQPS8821P', emailId: 'vikram.singh@example.com', fromDate: '2025-04-01', toDate: '2026-03-31', requestedOn: '2026-09-09', requestedBy: 'Self', status: 'Queued' },
  { id: 'ECAS-5494', customerName: 'Priya Sharma', pan: 'BXTPS4471K', emailId: 'priya.sharma@example.com', fromDate: '2024-04-01', toDate: '2026-03-31', requestedOn: '2026-09-08', requestedBy: 'Self', status: 'Sent' },
  { id: 'ECAS-5493', customerName: 'Meera Nair', pan: 'MNQPN7712Q', emailId: 'meera.nair@example.com', fromDate: '2025-04-01', toDate: '2026-03-31', requestedOn: '2026-09-06', requestedBy: 'RM', status: 'Failed' },
  { id: 'ECAS-5492', customerName: 'Orion Logistics Ltd', pan: 'OLQPL5567R', emailId: 'treasury@orionlog.com', fromDate: '2017-04-01', toDate: '2026-03-31', requestedOn: '2026-09-04', requestedBy: 'RM', status: 'Sent' },
  { id: 'ECAS-5491', customerName: 'Rohan Malhotra', pan: 'ABMPM4432P', emailId: 'rohan.malhotra@example.com', fromDate: '2025-04-01', toDate: '2026-03-31', requestedOn: '2026-09-02', requestedBy: 'Self', status: 'Sent' },
  { id: 'ECAS-5490', customerName: 'Ananya Ghosh', pan: 'AGQPG9931N', emailId: 'ananya.ghosh@example.com', fromDate: '2024-04-01', toDate: '2026-03-31', requestedOn: '2026-08-30', requestedBy: 'RM', status: 'Sent' },
  { id: 'ECAS-5489', customerName: 'Kavita Mehta', pan: 'ABCPM5678G', emailId: 'kavita.mehta@example.com', fromDate: '2025-04-01', toDate: '2026-03-31', requestedOn: '2026-08-27', requestedBy: 'Self', status: 'Sent' },
  { id: 'ECAS-5488', customerName: 'Latha Iyer', pan: 'SIQPI6612E', emailId: 'suresh.iyer@example.com', fromDate: '2021-04-01', toDate: '2026-03-31', requestedOn: '2026-08-24', requestedBy: 'RM', status: 'Sent' },
];

// ---------------------------------------------------------------------------
// New Products — WhatsApp (FintsoClick)
// ---------------------------------------------------------------------------

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'Transactional' | 'Marketing' | 'Utility';
  language: 'English' | 'Hindi' | 'Marathi';
  status: 'Approved' | 'Pending Review';
}

export const MOCK_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  { id: 'WT-01', name: 'SIP Reminder', category: 'Transactional', language: 'English', status: 'Approved' },
  { id: 'WT-02', name: 'NAV Update Alert', category: 'Utility', language: 'English', status: 'Approved' },
  { id: 'WT-03', name: 'KYC Reminder', category: 'Utility', language: 'Hindi', status: 'Approved' },
  { id: 'WT-04', name: 'Welcome Message', category: 'Transactional', language: 'English', status: 'Approved' },
  { id: 'WT-05', name: 'Redemption Confirmation', category: 'Transactional', language: 'English', status: 'Approved' },
  { id: 'WT-06', name: 'Portfolio Statement Ready', category: 'Utility', language: 'Marathi', status: 'Pending Review' },
  { id: 'WT-07', name: 'Festival Greetings', category: 'Marketing', language: 'Hindi', status: 'Approved' },
  { id: 'WT-08', name: 'Payment Failure Alert', category: 'Transactional', language: 'English', status: 'Pending Review' },
];

export interface WhatsAppSendLogEntry {
  id: string;
  customerName: string;
  phone: string;
  templateUsed: string;
  sentStatus: 'Sent' | 'Delivered' | 'Read' | 'Failed';
  timestamp: string;
}

export const MOCK_WHATSAPP_SEND_LOG: WhatsAppSendLogEntry[] = [
  { id: 'WSL-9001', customerName: 'Rajesh Mehta', phone: '+91 98200 11223', templateUsed: 'SIP Reminder', sentStatus: 'Read', timestamp: '2026-09-15 08:00' },
  { id: 'WSL-9002', customerName: 'Kavita Mehta', phone: '+91 98200 11224', templateUsed: 'NAV Update Alert', sentStatus: 'Delivered', timestamp: '2026-09-15 08:00' },
  { id: 'WSL-9003', customerName: 'Arvind Kapoor', phone: '+91 98111 22334', templateUsed: 'KYC Reminder', sentStatus: 'Failed', timestamp: '2026-09-14 18:30' },
  { id: 'WSL-9004', customerName: 'Sunita Reddy', phone: '+91 90000 55667', templateUsed: 'Redemption Confirmation', sentStatus: 'Read', timestamp: '2026-09-14 17:41' },
  { id: 'WSL-9005', customerName: 'Neha Verma', phone: '+91 97654 32109', templateUsed: 'Welcome Message', sentStatus: 'Delivered', timestamp: '2026-09-13 12:00' },
  { id: 'WSL-9006', customerName: 'Suresh Iyer', phone: '+971 50 123 4567', templateUsed: 'Portfolio Statement Ready', sentStatus: 'Sent', timestamp: '2026-09-13 09:15' },
  { id: 'WSL-9007', customerName: 'The Malhotra Family Trust', phone: '+91 22 6688 9900', templateUsed: 'Payment Failure Alert', sentStatus: 'Failed', timestamp: '2026-09-12 14:22' },
  { id: 'WSL-9008', customerName: 'Rohan Malhotra', phone: '+91 98211 44556', templateUsed: 'SIP Reminder', sentStatus: 'Read', timestamp: '2026-09-12 08:00' },
  { id: 'WSL-9009', customerName: 'Vikram Singh', phone: '+91 99220 34556', templateUsed: 'Festival Greetings', sentStatus: 'Delivered', timestamp: '2026-09-11 10:05' },
  { id: 'WSL-9010', customerName: 'Meera Nair', phone: '+91 96330 12211', templateUsed: 'KYC Reminder', sentStatus: 'Read', timestamp: '2026-09-10 11:40' },
  { id: 'WSL-9011', customerName: 'Orion Logistics Ltd', phone: '+91 44 2233 4455', templateUsed: 'NAV Update Alert', sentStatus: 'Delivered', timestamp: '2026-09-09 08:00' },
  { id: 'WSL-9012', customerName: 'Priya Sharma', phone: '+91 99870 45671', templateUsed: 'Redemption Confirmation', sentStatus: 'Sent', timestamp: '2026-09-08 16:12' },
];

// ---------------------------------------------------------------------------
// New Products — IPO
// ---------------------------------------------------------------------------

export type IpoStatus = 'Open' | 'Upcoming' | 'Closed';

export interface IpoListing {
  id: string;
  companyName: string;
  sector: string;
  priceBandLow: number;
  priceBandHigh: number;
  lotSize: number;
  openDate: string;
  closeDate: string;
  issueType: 'Mainboard' | 'SME';
  status: IpoStatus;
}

export const MOCK_IPO_LISTINGS: IpoListing[] = [
  { id: 'IPO-01', companyName: 'Vellara Industries Ltd', sector: 'Specialty Chemicals', priceBandLow: 412, priceBandHigh: 434, lotSize: 34, openDate: '2026-09-16', closeDate: '2026-09-18', issueType: 'Mainboard', status: 'Open' },
  { id: 'IPO-02', companyName: 'Brightcore Renewables Ltd', sector: 'Renewable Energy', priceBandLow: 210, priceBandHigh: 225, lotSize: 65, openDate: '2026-09-17', closeDate: '2026-09-19', issueType: 'Mainboard', status: 'Open' },
  { id: 'IPO-03', companyName: 'Nimbus Logistics Ltd', sector: 'Logistics & Supply Chain', priceBandLow: 88, priceBandHigh: 94, lotSize: 160, openDate: '2026-09-22', closeDate: '2026-09-24', issueType: 'Mainboard', status: 'Upcoming' },
  { id: 'IPO-04', companyName: 'Kesari Precision Tools Ltd', sector: 'Industrial Manufacturing', priceBandLow: 305, priceBandHigh: 320, lotSize: 45, openDate: '2026-09-25', closeDate: '2026-09-29', issueType: 'SME', status: 'Upcoming' },
  { id: 'IPO-05', companyName: 'Aarav Diagnostics Ltd', sector: 'Healthcare Diagnostics', priceBandLow: 540, priceBandHigh: 565, lotSize: 26, openDate: '2026-09-08', closeDate: '2026-09-10', issueType: 'Mainboard', status: 'Closed' },
  { id: 'IPO-06', companyName: 'Trishul Defence Systems Ltd', sector: 'Defence & Aerospace', priceBandLow: 725, priceBandHigh: 760, lotSize: 19, openDate: '2026-09-03', closeDate: '2026-09-05', issueType: 'Mainboard', status: 'Closed' },
  { id: 'IPO-07', companyName: 'Sindhu Foods Ltd', sector: 'FMCG', priceBandLow: 145, priceBandHigh: 152, lotSize: 98, openDate: '2026-09-29', closeDate: '2026-10-01', issueType: 'SME', status: 'Upcoming' },
  { id: 'IPO-08', companyName: 'Prithvi Infra Projects Ltd', sector: 'Infrastructure', priceBandLow: 66, priceBandHigh: 70, lotSize: 214, openDate: '2026-08-28', closeDate: '2026-08-30', issueType: 'Mainboard', status: 'Closed' },
  { id: 'IPO-09', companyName: 'Zentra Digital Solutions Ltd', sector: 'IT Services', priceBandLow: 480, priceBandHigh: 505, lotSize: 29, openDate: '2026-09-16', closeDate: '2026-09-18', issueType: 'Mainboard', status: 'Open' },
  { id: 'IPO-10', companyName: 'Bhoomi Agrotech Ltd', sector: 'Agri-Tech', priceBandLow: 58, priceBandHigh: 62, lotSize: 240, openDate: '2026-10-06', closeDate: '2026-10-08', issueType: 'SME', status: 'Upcoming' },
];

export interface IpoApplication {
  id: string;
  companyName: string;
  customerName: string;
  lots: number;
  amount: number;
  appliedOn: string;
  status: 'Applied' | 'Allotted' | 'Refunded' | 'Rejected';
}
