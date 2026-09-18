import { Campaign, InsurancePolicy } from '../models/domain.models';

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'CP-01', name: 'Diwali SIP Booster', channel: 'WhatsApp', status: 'Active', audience: 12400, sent: 12400, opened: 8900, converted: 620, startDate: '2026-09-01' },
  { id: 'CP-02', name: 'ELSS Tax Saving Reminder', channel: 'Email', status: 'Active', audience: 9800, sent: 9800, opened: 5100, converted: 340, startDate: '2026-08-25' },
  { id: 'CP-03', name: 'New Fund Offer - Alpha Flexi Cap', channel: 'Push', status: 'Completed', audience: 20000, sent: 20000, opened: 11200, converted: 890, startDate: '2026-08-01' },
  { id: 'CP-04', name: 'Goal Planning Awareness', channel: 'SMS', status: 'Draft', audience: 0, sent: 0, opened: 0, converted: 0, startDate: '2026-09-15' },
];

export const MOCK_INSURANCE_POLICIES: InsurancePolicy[] = [
  { id: 'INS-01', clientId: 'CL-1001', policyNumber: 'TL-2209871', insurer: 'Alpha Life Insurance', type: 'Term Life', sumAssured: 20000000, premium: 18500, premiumFrequency: 'Annual', renewalDate: '2027-03-14', status: 'Active' },
  { id: 'INS-02', clientId: 'CL-1002', policyNumber: 'HP-1102234', insurer: 'WealthNexus Health', type: 'Health', sumAssured: 1000000, premium: 2200, premiumFrequency: 'Monthly', renewalDate: '2026-10-01', status: 'Due for Renewal' },
  { id: 'INS-03', clientId: 'CL-1010', policyNumber: 'UL-3390021', insurer: 'Alpha Life Insurance', type: 'ULIP', sumAssured: 5000000, premium: 50000, premiumFrequency: 'Quarterly', renewalDate: '2026-12-01', status: 'Active' },
];
