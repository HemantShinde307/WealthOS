import { CommissionEntry } from '../models/domain.models';

export const MOCK_COMMISSIONS: CommissionEntry[] = [
  { id: 'CM-4501', advisorName: 'Amit Deshmukh', clientName: 'Rajesh Mehta', schemeName: 'Alpha Bluechip Fund', transactionType: 'Purchase', transactionAmount: 500000, commissionRate: 1.0, commissionAmount: 5000, status: 'Paid', date: '2026-09-02' },
  { id: 'CM-4500', advisorName: 'Amit Deshmukh', clientName: 'Priya Sharma', schemeName: 'Nexus Flexi Cap Fund', transactionType: 'SIP', transactionAmount: 10000, commissionRate: 0.8, commissionAmount: 80, status: 'Paid', date: '2026-09-02' },
  { id: 'CM-4499', advisorName: 'Kavita Rao', clientName: 'Vikram Singh', schemeName: 'Nexus Midcap Opportunities Fund', transactionType: 'Purchase', transactionAmount: 1000000, commissionRate: 1.2, commissionAmount: 12000, status: 'Pending', date: '2026-09-01' },
  { id: 'CM-4498', advisorName: 'Kavita Rao', clientName: 'Suresh Iyer', schemeName: 'Alpha Bluechip Fund', transactionType: 'SIP', transactionAmount: 50000, commissionRate: 1.0, commissionAmount: 500, status: 'Processing', date: '2026-09-01' },
  { id: 'CM-4497', advisorName: 'Rohan Kulkarni', clientName: 'Kabir Enterprises Pvt Ltd', schemeName: 'WealthNexus Liquid Fund', transactionType: 'Purchase', transactionAmount: 5000000, commissionRate: 0.15, commissionAmount: 7500, status: 'Paid', date: '2026-08-30' },
];
