import { Notification } from '../models/domain.models';

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'NT-10', title: 'AI Nudge: Idle Cash', message: 'You have ₹84,500 sitting idle in your bank account. Even a liquid fund could put it to work instead of earning near-zero interest.', type: 'info', read: false, timestamp: '2026-09-11T09:00:00' },
  { id: 'NT-09', title: 'AI Nudge: FD Maturing Soon', message: 'Your HDFC Bank FD of ₹2,00,000 matures on 20 Sep 2026. Consider renewing, laddering across tenures, or moving part into a debt fund.', type: 'warning', read: false, timestamp: '2026-09-10T09:00:00' },
  { id: 'NT-08', title: 'AI Nudge: Gold Price Dip', message: 'Gold prices dropped 3% this week — historically a favourable entry point if you were planning to add to your Gold SIP.', type: 'info', read: false, timestamp: '2026-09-09T08:30:00' },
  { id: 'NT-07', title: 'AI Nudge: Rebalancing Opportunity', message: 'Your portfolio is 98% equity with no exposure to Gold or Debt. Consider diversifying 10-15% into Gold as a hedge, in line with your risk profile.', type: 'warning', read: false, timestamp: '2026-09-08T10:00:00' },
  { id: 'NT-01', title: 'SIP Executed', message: 'Your SIP of ₹4,999.75 in HDFC Flexi Cap Fund was processed successfully.', type: 'success', read: false, timestamp: '2026-09-07T09:15:00' },
  { id: 'NT-02', title: 'KYC Action Required', message: 'Arvind Kapoor\'s KYC documents need re-verification.', type: 'warning', read: false, timestamp: '2026-09-07T08:40:00' },
  { id: 'NT-03', title: 'Redemption Processing', message: 'Redemption request for Sunita Reddy is under processing.', type: 'info', read: true, timestamp: '2026-09-06T17:05:00' },
  { id: 'NT-04', title: 'Transaction Failed', message: 'Switch transaction for Vikram Singh failed due to insufficient units.', type: 'error', read: false, timestamp: '2026-09-06T14:22:00' },
  { id: 'NT-05', title: 'Goal Milestone Reached', message: 'Wedding Fund goal has crossed 70% of target.', type: 'success', read: true, timestamp: '2026-09-05T11:10:00' },
  { id: 'NT-06', title: 'Commission Payout Processed', message: 'August commission payout of ₹1,24,500 has been credited.', type: 'success', read: true, timestamp: '2026-09-01T10:00:00' },
];
