import { Goal } from '../models/domain.models';

export const MOCK_GOALS: Goal[] = [
  { id: 'GL-01', clientId: 'CL-1002', name: 'Retirement Corpus', category: 'Retirement', targetAmount: 30000000, currentAmount: 6200000, targetDate: '2048-04-01', monthlyInvestment: 25000, expectedReturn: 12, progressPct: 21 },
  { id: 'GL-02', clientId: 'CL-1002', name: "Daughter's Education", category: 'Education', targetAmount: 5000000, currentAmount: 1450000, targetDate: '2036-06-01', monthlyInvestment: 12000, expectedReturn: 11, progressPct: 29 },
  { id: 'GL-03', clientId: 'CL-1006', name: 'Dream Home Down Payment', category: 'Home', targetAmount: 8000000, currentAmount: 2100000, targetDate: '2030-01-01', monthlyInvestment: 40000, expectedReturn: 10, progressPct: 26 },
  { id: 'GL-04', clientId: 'CL-1006', name: 'Wedding Fund', category: 'Wedding', targetAmount: 2500000, currentAmount: 1800000, targetDate: '2028-11-01', monthlyInvestment: 20000, expectedReturn: 9, progressPct: 72 },
  { id: 'GL-05', clientId: 'CL-1001', name: 'Emergency Fund', category: 'Emergency Fund', targetAmount: 1500000, currentAmount: 1500000, targetDate: '2025-12-01', monthlyInvestment: 0, expectedReturn: 6, progressPct: 100 },
  { id: 'GL-06', clientId: 'CL-1010', name: 'Europe Family Trip', category: 'Travel', targetAmount: 1200000, currentAmount: 480000, targetDate: '2027-05-01', monthlyInvestment: 25000, expectedReturn: 8, progressPct: 40 },
];
