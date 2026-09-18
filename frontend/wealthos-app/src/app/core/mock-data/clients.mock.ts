import { Client } from '../models/domain.models';

export const MOCK_CLIENTS: Client[] = [
  { id: 'CL-1001', name: 'Rajesh Mehta', email: 'rajesh.mehta@example.com', phone: '+91 98200 11223', panMasked: 'ABCPM****F', kycStatus: 'Verified', riskProfile: 'Aggressive', segment: 'HNI', aum: 12450000, joinedOn: '2019-03-14' },
  { id: 'CL-1002', name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+91 99870 45671', panMasked: 'BXTPS****K', kycStatus: 'Verified', riskProfile: 'Moderate', segment: 'Retail', aum: 850000, joinedOn: '2021-07-02' },
  { id: 'CL-1003', name: 'Arvind Kapoor', email: 'arvind.kapoor@example.com', phone: '+91 98111 22334', panMasked: 'AKQPK****L', kycStatus: 'Pending', riskProfile: 'Conservative', segment: 'Retail', aum: 320000, joinedOn: '2023-01-19' },
  { id: 'CL-1004', name: 'Sunita Reddy', email: 'sunita.reddy@example.com', phone: '+91 90000 55667', panMasked: 'SRXPR****M', kycStatus: 'Verified', riskProfile: 'Moderate', segment: 'HNI', aum: 8750000, joinedOn: '2018-11-30' },
  { id: 'CL-1005', name: 'Kabir Enterprises Pvt Ltd', email: 'finance@kabirent.com', phone: '+91 22 4022 8890', panMasked: 'KEPCL****C', kycStatus: 'Verified', riskProfile: 'Moderate', segment: 'Corporate', aum: 45000000, joinedOn: '2017-05-21' },
  { id: 'CL-1006', name: 'Neha Verma', email: 'neha.verma@example.com', phone: '+91 97654 32109', panMasked: 'NVQPV****D', kycStatus: 'Verified', riskProfile: 'Aggressive', segment: 'Retail', aum: 1250000, joinedOn: '2022-02-10' },
  { id: 'CL-1007', name: 'Suresh Iyer (NRI - Dubai)', email: 'suresh.iyer@example.com', phone: '+971 50 123 4567', panMasked: 'SIQPI****E', kycStatus: 'Verified', riskProfile: 'Moderate', segment: 'NRI', aum: 6300000, joinedOn: '2020-09-05' },
  { id: 'CL-1008', name: 'The Malhotra Family Trust', email: 'office@malhotratrust.com', phone: '+91 22 6688 9900', panMasked: 'TMFPT****A', kycStatus: 'Verified', riskProfile: 'Conservative', segment: 'Family Office', aum: 182000000, joinedOn: '2015-08-12' },
  { id: 'CL-1009', name: 'Ananya Ghosh', email: 'ananya.ghosh@example.com', phone: '+91 98301 66778', panMasked: 'AGQPG****N', kycStatus: 'Rejected', riskProfile: 'Aggressive', segment: 'Retail', aum: 0, joinedOn: '2024-04-02' },
  { id: 'CL-1010', name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '+91 99220 34556', panMasked: 'VSQPS****P', kycStatus: 'Verified', riskProfile: 'Aggressive', segment: 'HNI', aum: 15600000, joinedOn: '2019-12-01' },
  { id: 'CL-1011', name: 'Meera Nair', email: 'meera.nair@example.com', phone: '+91 96330 12211', panMasked: 'MNQPN****Q', kycStatus: 'Not Started', riskProfile: 'Moderate', segment: 'Retail', aum: 0, joinedOn: '2026-08-20' },
  { id: 'CL-1012', name: 'Orion Logistics Ltd', email: 'treasury@orionlog.com', phone: '+91 44 2233 4455', panMasked: 'OLQPL****R', kycStatus: 'Verified', riskProfile: 'Conservative', segment: 'Corporate', aum: 92000000, joinedOn: '2016-06-18' },
];
