export interface FixedDeposit {
  id: string;
  issuer: string;
  principal: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  payoutType: 'Cumulative' | 'Monthly Payout' | 'Quarterly Payout';
  maturityValue: number;
}

// Illustrative FD holdings — a full deployment would import these the same way CAS import
// works for mutual funds (via a bank statement / FD receipt upload).
export const MOCK_FIXED_DEPOSITS: FixedDeposit[] = [
  { id: 'FD-H01', issuer: 'HDFC Bank', principal: 200000, interestRate: 6.8, startDate: '2023-09-20', maturityDate: '2026-09-20', payoutType: 'Cumulative', maturityValue: 241800 },
  { id: 'FD-H02', issuer: 'ICICI Bank', principal: 150000, interestRate: 7.0, startDate: '2024-03-15', maturityDate: '2027-03-15', payoutType: 'Cumulative', maturityValue: 184500 },
  { id: 'FD-H03', issuer: 'Bajaj Finance', principal: 100000, interestRate: 8.1, startDate: '2022-12-01', maturityDate: '2027-12-01', payoutType: 'Quarterly Payout', maturityValue: 100000 },
];

// Cash sitting in the linked bank account, not yet invested anywhere.
export const MOCK_IDLE_CASH = 84500;
