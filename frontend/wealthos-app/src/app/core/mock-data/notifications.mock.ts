import { Notification } from '../models/domain.models';

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'NT-01', title: 'SIP Executed', message: 'Your SIP of ₹10,000 in Nexus Flexi Cap Fund was processed successfully.', type: 'success', read: false, timestamp: '2026-09-07T09:15:00' },
  { id: 'NT-02', title: 'KYC Action Required', message: 'Arvind Kapoor\'s KYC documents need re-verification.', type: 'warning', read: false, timestamp: '2026-09-07T08:40:00' },
  { id: 'NT-03', title: 'Redemption Processing', message: 'Redemption request for Sunita Reddy is under processing.', type: 'info', read: true, timestamp: '2026-09-06T17:05:00' },
  { id: 'NT-04', title: 'Transaction Failed', message: 'Switch transaction for Vikram Singh failed due to insufficient units.', type: 'error', read: false, timestamp: '2026-09-06T14:22:00' },
  { id: 'NT-05', title: 'Goal Milestone Reached', message: 'Wedding Fund goal has crossed 70% of target.', type: 'success', read: true, timestamp: '2026-09-05T11:10:00' },
  { id: 'NT-06', title: 'Commission Payout Processed', message: 'August commission payout of ₹1,24,500 has been credited.', type: 'success', read: true, timestamp: '2026-09-01T10:00:00' },
];
