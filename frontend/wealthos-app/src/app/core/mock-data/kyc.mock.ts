import { KycRecord, AuditLogEntry } from '../models/domain.models';

export const MOCK_KYC_RECORDS: KycRecord[] = [
  { id: 'KYC-501', clientName: 'Arvind Kapoor', pan: 'AKQPK1234L', status: 'In Review', submittedOn: '2026-09-04', documents: [
    { name: 'PAN Card', status: 'Verified' },
    { name: 'Aadhaar Card', status: 'Verified' },
    { name: 'Address Proof', status: 'Uploaded' },
    { name: 'Bank Statement', status: 'Missing' },
  ]},
  { id: 'KYC-502', clientName: 'Ananya Ghosh', pan: 'AGQPG5678N', status: 'Rejected', submittedOn: '2026-08-30', documents: [
    { name: 'PAN Card', status: 'Verified' },
    { name: 'Aadhaar Card', status: 'Rejected' },
    { name: 'Address Proof', status: 'Rejected' },
    { name: 'Bank Statement', status: 'Uploaded' },
  ]},
  { id: 'KYC-503', clientName: 'Meera Nair', pan: 'MNQPN9012Q', status: 'Pending', submittedOn: '2026-09-06', documents: [
    { name: 'PAN Card', status: 'Uploaded' },
    { name: 'Aadhaar Card', status: 'Uploaded' },
    { name: 'Address Proof', status: 'Missing' },
    { name: 'Bank Statement', status: 'Missing' },
  ]},
];

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: 'AL-9001', actor: 'admin@wealthos.com', action: 'Approved KYC', entity: 'CL-1001 - Rajesh Mehta', timestamp: '2026-09-07T09:12:00', ipAddress: '10.24.5.101', status: 'Success' },
  { id: 'AL-9000', actor: 'amit.deshmukh@wealthos.com', action: 'Created Transaction', entity: 'TXN-98231', timestamp: '2026-09-02T11:05:00', ipAddress: '10.24.5.44', status: 'Success' },
  { id: 'AL-8999', actor: 'system', action: 'Failed Login Attempt', entity: 'kavita.rao@wealthos.com', timestamp: '2026-09-02T08:41:00', ipAddress: '182.65.10.90', status: 'Failure' },
  { id: 'AL-8998', actor: 'admin@wealthos.com', action: 'Updated Commission Slab', entity: 'Slab Rule - HNI Equity', timestamp: '2026-09-01T16:20:00', ipAddress: '10.24.5.101', status: 'Success' },
  { id: 'AL-8997', actor: 'rohan.kulkarni@wealthos.com', action: 'Exported Report', entity: 'Regulatory Report - Aug 2026', timestamp: '2026-09-01T10:02:00', ipAddress: '10.24.5.77', status: 'Success' },
];
