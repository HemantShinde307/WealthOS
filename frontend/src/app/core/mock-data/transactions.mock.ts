import { Transaction } from '../models/domain.models';

// Advisor-facing demo book of business. No default transactions for the logged-in investor
// (CL-1013) — a real account starts with none and only gets entries from actual purchases/
// redemptions or a CAS import, same as its holdings (see PortfolioService).
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-98231', clientId: 'CL-1001', clientName: 'Rajesh Mehta', type: 'Purchase', schemeName: 'Nippon India Large Cap Fund - Growth', amount: 500000, units: 2741.78, nav: 182.40, status: 'Completed', date: '2026-09-02', folio: 'FL-88213' },
  { id: 'TXN-98230', clientId: 'CL-1002', clientName: 'Priya Sharma', type: 'SIP', schemeName: 'Parag Parikh Flexi Cap Fund - Regular Growth', amount: 10000, units: 113.38, nav: 88.20, status: 'Completed', date: '2026-09-02', folio: 'FL-77102' },
  { id: 'TXN-98229', clientId: 'CL-1004', clientName: 'Sunita Reddy', type: 'Redemption', schemeName: 'HDFC Multi Asset Allocation Fund - Regular Growth', amount: 250000, units: 9310.06, nav: 26.85, status: 'Processing', date: '2026-09-02', folio: 'FL-65530' },
  { id: 'TXN-98228', clientId: 'CL-1006', clientName: 'Neha Verma', type: 'Gold Purchase', schemeName: 'Digital Gold - 24K', amount: 25000, status: 'Completed', date: '2026-09-01' },
  { id: 'TXN-98227', clientId: 'CL-1010', clientName: 'Vikram Singh', type: 'Purchase', schemeName: 'Aditya Birla Sun Life Midcap Fund - Regular Growth', amount: 1000000, units: 8869.36, nav: 112.75, status: 'Completed', date: '2026-09-01', folio: 'FL-91004' },
  { id: 'TXN-98226', clientId: 'CL-1007', clientName: 'Suresh Iyer (NRI - Dubai)', type: 'SIP', schemeName: 'Nippon India Large Cap Fund - Growth', amount: 50000, units: 274.18, nav: 182.40, status: 'Completed', date: '2026-09-01', folio: 'FL-71255' },
  { id: 'TXN-98225', clientId: 'CL-1003', clientName: 'Arvind Kapoor', type: 'Purchase', schemeName: 'HDFC Flexi Cap Fund - Regular Growth', amount: 50000, units: 667.55, nav: 74.90, status: 'Pending', date: '2026-08-31' },
  { id: 'TXN-98224', clientId: 'CL-1002', clientName: 'Priya Sharma', type: 'Gold SIP', schemeName: 'Gold SIP - Monthly Plan', amount: 5000, status: 'Completed', date: '2026-08-30' },
  { id: 'TXN-98223', clientId: 'CL-1005', clientName: 'Kabir Enterprises Pvt Ltd', type: 'Purchase', schemeName: 'SBI Dividend Yield Fund - Regular Growth', amount: 5000000, units: 2074.61, nav: 2410.35, status: 'Completed', date: '2026-08-30', folio: 'FL-30021' },
  { id: 'TXN-98222', clientId: 'CL-1010', clientName: 'Vikram Singh', type: 'Switch', schemeName: 'Tata Digital India Fund → HDFC Small Cap Fund', amount: 800000, status: 'Failed', date: '2026-08-29' },
  { id: 'TXN-98221', clientId: 'CL-1009', clientName: 'Ananya Ghosh', type: 'Purchase', schemeName: 'UTI Small Cap Fund - Regular Plan', amount: 25000, status: 'Cancelled', date: '2026-08-28' },
  { id: 'TXN-98220', clientId: 'CL-1004', clientName: 'Sunita Reddy', type: 'Gold Sell', schemeName: 'Digital Gold - 24K', amount: 40000, status: 'Completed', date: '2026-08-27' },
];
