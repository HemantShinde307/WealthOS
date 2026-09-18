// Back Office → Setup module — local mock data, kept separate from Customer Management's
// back-office-data.mock.ts and back-office-customer.service.ts (per AGENT_CONVENTIONS.md).
// Covers Organization Setup, User Management, Customer Access, Settings,
// Alerts & Notifications, and Miscellaneous master-data / admin-config screens.

// ---------------------------------------------------------------------------
// Organization Setup
// ---------------------------------------------------------------------------

export interface Branch {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  email: string;
  managerName: string;
  openedOn: string;
  status: 'Active' | 'Inactive';
}

export interface Employee {
  id: string;
  empCode: string;
  name: string;
  designation: string;
  branchId: string;
  email: string;
  phone: string;
  dateOfJoining: string;
  status: 'Active' | 'Inactive';
}

export interface Associate {
  id: string;
  associateCode: string;
  name: string;
  arnCode: string;
  branchId: string;
  commissionSlab: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
}

export interface Agency {
  id: string;
  agencyCode: string;
  name: string;
  type: 'Bank' | 'NBFC' | 'Corporate Agent' | 'Broker';
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  status: 'Active' | 'Inactive';
}

export interface ArnRecord {
  id: string;
  arnCode: string;
  holderName: string;
  category: 'Individual' | 'Corporate' | 'Partnership';
  validTill: string;
  empanelledOn: string;
  status: 'Active' | 'Expired' | 'Suspended';
}

export interface PrincipalBrokerRelationship {
  id: string;
  principalName: string;
  brokerCode: string;
  agreementDate: string;
  commissionType: 'Trail' | 'Upfront' | 'Trail + Upfront';
  status: 'Active' | 'Terminated';
}

export const MOCK_BRANCHES: Branch[] = [
  { id: 'BR-001', code: 'MUM01', name: 'Mumbai — BKC', city: 'Mumbai', state: 'Maharashtra', address: 'Unit 12, G Block, Bandra Kurla Complex', phone: '+91 22 6612 3400', email: 'mumbai.bkc@wealthos.in', managerName: 'Rohit Kulkarni', openedOn: '2012-04-02', status: 'Active' },
  { id: 'BR-002', code: 'DEL01', name: 'Delhi — Connaught Place', city: 'New Delhi', state: 'Delhi', address: '3rd Floor, Statesman House, Barakhamba Road', phone: '+91 11 4321 7700', email: 'delhi.cp@wealthos.in', managerName: 'Anjali Bhatia', openedOn: '2013-08-19', status: 'Active' },
  { id: 'BR-003', code: 'BLR01', name: 'Bengaluru — Indiranagar', city: 'Bengaluru', state: 'Karnataka', address: '100 Feet Road, Indiranagar', phone: '+91 80 4112 9900', email: 'bengaluru.indiranagar@wealthos.in', managerName: 'Suresh Nayak', openedOn: '2014-01-10', status: 'Active' },
  { id: 'BR-004', code: 'PUN01', name: 'Pune — Koregaon Park', city: 'Pune', state: 'Maharashtra', address: 'Lane 5, Koregaon Park', phone: '+91 20 6655 1122', email: 'pune.kp@wealthos.in', managerName: 'Mrunal Deshpande', openedOn: '2015-06-23', status: 'Active' },
  { id: 'BR-005', code: 'CHN01', name: 'Chennai — Nungambakkam', city: 'Chennai', state: 'Tamil Nadu', address: 'Kodambakkam High Road, Nungambakkam', phone: '+91 44 2833 4455', email: 'chennai.nb@wealthos.in', managerName: 'Kavya Subramaniam', openedOn: '2015-11-02', status: 'Active' },
  { id: 'BR-006', code: 'HYD01', name: 'Hyderabad — Banjara Hills', city: 'Hyderabad', state: 'Telangana', address: 'Road No. 12, Banjara Hills', phone: '+91 40 2354 6677', email: 'hyderabad.bh@wealthos.in', managerName: 'Vamsi Reddy', openedOn: '2016-03-14', status: 'Active' },
  { id: 'BR-007', code: 'KOL01', name: 'Kolkata — Park Street', city: 'Kolkata', state: 'West Bengal', address: 'Chowringhee Mansions, Park Street', phone: '+91 33 2229 8811', email: 'kolkata.ps@wealthos.in', managerName: 'Debjani Sen', openedOn: '2016-09-30', status: 'Active' },
  { id: 'BR-008', code: 'AHM01', name: 'Ahmedabad — SG Highway', city: 'Ahmedabad', state: 'Gujarat', address: 'Sun City Complex, SG Highway', phone: '+91 79 4011 2233', email: 'ahmedabad.sg@wealthos.in', managerName: 'Jigar Shah', openedOn: '2017-05-18', status: 'Active' },
  { id: 'BR-009', code: 'JAI01', name: 'Jaipur — C-Scheme', city: 'Jaipur', state: 'Rajasthan', address: 'Ashok Marg, C-Scheme', phone: '+91 141 402 5566', email: 'jaipur.cs@wealthos.in', managerName: 'Nikhil Agarwal', openedOn: '2018-02-27', status: 'Inactive' },
  { id: 'BR-010', code: 'KOC01', name: 'Kochi — Marine Drive', city: 'Kochi', state: 'Kerala', address: 'Marine Drive, Ernakulam', phone: '+91 484 235 7788', email: 'kochi.md@wealthos.in', managerName: 'Anoop Menon', openedOn: '2019-07-08', status: 'Active' },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'EMP-001', empCode: 'WOS-1001', name: 'Rohit Kulkarni', designation: 'Branch Manager', branchId: 'BR-001', email: 'rohit.kulkarni@wealthos.in', phone: '+91 98200 11001', dateOfJoining: '2012-04-02', status: 'Active' },
  { id: 'EMP-002', empCode: 'WOS-1002', name: 'Priyanka Joshi', designation: 'Relationship Manager', branchId: 'BR-001', email: 'priyanka.joshi@wealthos.in', phone: '+91 98200 11002', dateOfJoining: '2013-01-15', status: 'Active' },
  { id: 'EMP-003', empCode: 'WOS-1003', name: 'Anjali Bhatia', designation: 'Branch Manager', branchId: 'BR-002', email: 'anjali.bhatia@wealthos.in', phone: '+91 98200 11003', dateOfJoining: '2013-08-19', status: 'Active' },
  { id: 'EMP-004', empCode: 'WOS-1004', name: 'Karan Malhotra', designation: 'Relationship Manager', branchId: 'BR-002', email: 'karan.malhotra@wealthos.in', phone: '+91 98200 11004', dateOfJoining: '2014-03-11', status: 'Active' },
  { id: 'EMP-005', empCode: 'WOS-1005', name: 'Suresh Nayak', designation: 'Branch Manager', branchId: 'BR-003', email: 'suresh.nayak@wealthos.in', phone: '+91 98200 11005', dateOfJoining: '2014-01-10', status: 'Active' },
  { id: 'EMP-006', empCode: 'WOS-1006', name: 'Divya Rao', designation: 'Operations Executive', branchId: 'BR-003', email: 'divya.rao@wealthos.in', phone: '+91 98200 11006', dateOfJoining: '2016-06-20', status: 'Active' },
  { id: 'EMP-007', empCode: 'WOS-1007', name: 'Mrunal Deshpande', designation: 'Branch Manager', branchId: 'BR-004', email: 'mrunal.deshpande@wealthos.in', phone: '+91 98200 11007', dateOfJoining: '2015-06-23', status: 'Active' },
  { id: 'EMP-008', empCode: 'WOS-1008', name: 'Aakash Pawar', designation: 'Relationship Manager', branchId: 'BR-004', email: 'aakash.pawar@wealthos.in', phone: '+91 98200 11008', dateOfJoining: '2018-09-01', status: 'Active' },
  { id: 'EMP-009', empCode: 'WOS-1009', name: 'Kavya Subramaniam', designation: 'Branch Manager', branchId: 'BR-005', email: 'kavya.subramaniam@wealthos.in', phone: '+91 98200 11009', dateOfJoining: '2015-11-02', status: 'Active' },
  { id: 'EMP-010', empCode: 'WOS-1010', name: 'Vamsi Reddy', designation: 'Branch Manager', branchId: 'BR-006', email: 'vamsi.reddy@wealthos.in', phone: '+91 98200 11010', dateOfJoining: '2016-03-14', status: 'Active' },
  { id: 'EMP-011', empCode: 'WOS-1011', name: 'Sneha Pillai', designation: 'Relationship Manager', branchId: 'BR-006', email: 'sneha.pillai@wealthos.in', phone: '+91 98200 11011', dateOfJoining: '2019-02-18', status: 'Active' },
  { id: 'EMP-012', empCode: 'WOS-1012', name: 'Debjani Sen', designation: 'Branch Manager', branchId: 'BR-007', email: 'debjani.sen@wealthos.in', phone: '+91 98200 11012', dateOfJoining: '2016-09-30', status: 'Active' },
  { id: 'EMP-013', empCode: 'WOS-1013', name: 'Jigar Shah', designation: 'Branch Manager', branchId: 'BR-008', email: 'jigar.shah@wealthos.in', phone: '+91 98200 11013', dateOfJoining: '2017-05-18', status: 'Active' },
  { id: 'EMP-014', empCode: 'WOS-1014', name: 'Ritu Chawla', designation: 'Compliance Officer', branchId: 'BR-001', email: 'ritu.chawla@wealthos.in', phone: '+91 98200 11014', dateOfJoining: '2013-10-07', status: 'Active' },
  { id: 'EMP-015', empCode: 'WOS-1015', name: 'Nikhil Agarwal', designation: 'Branch Manager', branchId: 'BR-009', email: 'nikhil.agarwal@wealthos.in', phone: '+91 98200 11015', dateOfJoining: '2018-02-27', status: 'Inactive' },
];

export const MOCK_ASSOCIATES: Associate[] = [
  { id: 'ASC-001', associateCode: 'ASC0001', name: 'Deepak Financial Services', arnCode: 'ARN-45231', branchId: 'BR-001', commissionSlab: '1.00%', phone: '+91 98111 22001', email: 'deepak.fs@example.com', status: 'Active' },
  { id: 'ASC-002', associateCode: 'ASC0002', name: 'Sharma Investment Consultants', arnCode: 'ARN-51902', branchId: 'BR-002', commissionSlab: '0.85%', phone: '+91 98111 22002', email: 'sharma.ic@example.com', status: 'Active' },
  { id: 'ASC-003', associateCode: 'ASC0003', name: 'Nayar Wealth Partners', arnCode: 'ARN-38810', branchId: 'BR-003', commissionSlab: '1.10%', phone: '+91 98111 22003', email: 'nayar.wp@example.com', status: 'Active' },
  { id: 'ASC-004', associateCode: 'ASC0004', name: 'Deshpande Money Matters', arnCode: 'ARN-62245', branchId: 'BR-004', commissionSlab: '0.90%', phone: '+91 98111 22004', email: 'deshpande.mm@example.com', status: 'Active' },
  { id: 'ASC-005', associateCode: 'ASC0005', name: 'Subramaniam Financial Advisory', arnCode: 'ARN-29901', branchId: 'BR-005', commissionSlab: '1.00%', phone: '+91 98111 22005', email: 'subramaniam.fa@example.com', status: 'Active' },
  { id: 'ASC-006', associateCode: 'ASC0006', name: 'Reddy Capital Advisors', arnCode: 'ARN-77031', branchId: 'BR-006', commissionSlab: '0.80%', phone: '+91 98111 22006', email: 'reddy.ca@example.com', status: 'Active' },
  { id: 'ASC-007', associateCode: 'ASC0007', name: 'Sen & Associates', arnCode: 'ARN-15567', branchId: 'BR-007', commissionSlab: '1.05%', phone: '+91 98111 22007', email: 'sen.associates@example.com', status: 'Inactive' },
  { id: 'ASC-008', associateCode: 'ASC0008', name: 'Shah Prudent Investments', arnCode: 'ARN-84420', branchId: 'BR-008', commissionSlab: '0.95%', phone: '+91 98111 22008', email: 'shah.pi@example.com', status: 'Active' },
  { id: 'ASC-009', associateCode: 'ASC0009', name: 'Agarwal Mutual Fund Point', arnCode: 'ARN-33098', branchId: 'BR-009', commissionSlab: '0.75%', phone: '+91 98111 22009', email: 'agarwal.mfp@example.com', status: 'Inactive' },
  { id: 'ASC-010', associateCode: 'ASC0010', name: 'Menon Investment Hub', arnCode: 'ARN-69512', branchId: 'BR-010', commissionSlab: '1.00%', phone: '+91 98111 22010', email: 'menon.ih@example.com', status: 'Active' },
];

export const MOCK_AGENCIES: Agency[] = [
  { id: 'AGY-001', agencyCode: 'AG-BNK-01', name: 'HDFC Bank Ltd — Corporate Agency', type: 'Bank', contactPerson: 'Rajat Kohli', phone: '+91 22 6160 6161', email: 'corp.agency@hdfcbank.example.com', city: 'Mumbai', status: 'Active' },
  { id: 'AGY-002', agencyCode: 'AG-BNK-02', name: 'ICICI Bank Ltd — Wealth Desk', type: 'Bank', contactPerson: 'Simran Kaur', phone: '+91 22 2653 1414', email: 'wealth.desk@icicibank.example.com', city: 'Mumbai', status: 'Active' },
  { id: 'AGY-003', agencyCode: 'AG-NBF-01', name: 'Bajaj Finserv Direct', type: 'NBFC', contactPerson: 'Amit Pandey', phone: '+91 20 3957 4200', email: 'direct@bajajfinserv.example.com', city: 'Pune', status: 'Active' },
  { id: 'AGY-004', agencyCode: 'AG-COR-01', name: 'TATA AIA Corporate Distribution', type: 'Corporate Agent', contactPerson: 'Fiona D’Souza', phone: '+91 22 6667 9090', email: 'distribution@tataaia.example.com', city: 'Mumbai', status: 'Active' },
  { id: 'AGY-005', agencyCode: 'AG-BRK-01', name: 'Motilal Oswal Financial Services', type: 'Broker', contactPerson: 'Harshad Gala', phone: '+91 22 3980 4263', email: 'institutional@motilaloswal.example.com', city: 'Mumbai', status: 'Active' },
  { id: 'AGY-006', agencyCode: 'AG-BNK-03', name: 'Axis Bank — Priority Banking', type: 'Bank', contactPerson: 'Neeraj Suri', phone: '+91 79 6614 4040', email: 'priority@axisbank.example.com', city: 'Ahmedabad', status: 'Active' },
  { id: 'AGY-007', agencyCode: 'AG-NBF-02', name: 'Muthoot Finance — Wealth Channel', type: 'NBFC', contactPerson: 'Sindhu Varma', phone: '+91 484 239 4700', email: 'wealth@muthootfinance.example.com', city: 'Kochi', status: 'Active' },
  { id: 'AGY-008', agencyCode: 'AG-BRK-02', name: 'Kotak Securities Ltd', type: 'Broker', contactPerson: 'Devendra Pandey', phone: '+91 22 6218 5410', email: 'partners@kotaksecurities.example.com', city: 'Mumbai', status: 'Inactive' },
  { id: 'AGY-009', agencyCode: 'AG-COR-02', name: 'Max Life Corporate Agency', type: 'Corporate Agent', contactPerson: 'Ishaan Bakshi', phone: '+91 11 4159 6262', email: 'corporate@maxlife.example.com', city: 'New Delhi', status: 'Active' },
  { id: 'AGY-010', agencyCode: 'AG-BNK-04', name: 'IndusInd Bank — Private Client Group', type: 'Bank', contactPerson: 'Meghna Rao', phone: '+91 40 6684 3300', email: 'pcg@indusind.example.com', city: 'Hyderabad', status: 'Active' },
];

export const MOCK_ARN_RECORDS: ArnRecord[] = [
  { id: 'ARNREC-001', arnCode: 'ARN-45231', holderName: 'Deepak Financial Services', category: 'Partnership', validTill: '2028-03-31', empanelledOn: '2012-04-10', status: 'Active' },
  { id: 'ARNREC-002', arnCode: 'ARN-51902', holderName: 'Sharma Investment Consultants', category: 'Individual', validTill: '2027-11-30', empanelledOn: '2013-09-01', status: 'Active' },
  { id: 'ARNREC-003', arnCode: 'ARN-38810', holderName: 'Nayar Wealth Partners', category: 'Corporate', validTill: '2027-06-30', empanelledOn: '2014-02-15', status: 'Active' },
  { id: 'ARNREC-004', arnCode: 'ARN-62245', holderName: 'Deshpande Money Matters', category: 'Individual', validTill: '2026-12-31', empanelledOn: '2015-07-01', status: 'Active' },
  { id: 'ARNREC-005', arnCode: 'ARN-29901', holderName: 'Subramaniam Financial Advisory', category: 'Partnership', validTill: '2028-01-31', empanelledOn: '2015-11-20', status: 'Active' },
  { id: 'ARNREC-006', arnCode: 'ARN-77031', holderName: 'Reddy Capital Advisors', category: 'Corporate', validTill: '2027-09-30', empanelledOn: '2016-04-05', status: 'Active' },
  { id: 'ARNREC-007', arnCode: 'ARN-15567', holderName: 'Sen & Associates', category: 'Partnership', validTill: '2025-08-31', empanelledOn: '2016-10-12', status: 'Expired' },
  { id: 'ARNREC-008', arnCode: 'ARN-84420', holderName: 'Shah Prudent Investments', category: 'Individual', validTill: '2028-05-31', empanelledOn: '2017-06-01', status: 'Active' },
  { id: 'ARNREC-009', arnCode: 'ARN-33098', holderName: 'Agarwal Mutual Fund Point', category: 'Individual', validTill: '2026-02-28', empanelledOn: '2018-03-05', status: 'Suspended' },
  { id: 'ARNREC-010', arnCode: 'ARN-69512', holderName: 'Menon Investment Hub', category: 'Corporate', validTill: '2028-07-31', empanelledOn: '2019-07-15', status: 'Active' },
  { id: 'ARNREC-011', arnCode: 'ARN-90876', holderName: 'WealthOS Advisory Services', category: 'Corporate', validTill: '2029-03-31', empanelledOn: '2012-01-01', status: 'Active' },
  { id: 'ARNREC-012', arnCode: 'ARN-12045', holderName: 'Bhatia Portfolio Managers', category: 'Individual', validTill: '2026-10-31', empanelledOn: '2013-12-19', status: 'Active' },
];

export const MOCK_PRINCIPAL_BROKER_RELATIONSHIPS: PrincipalBrokerRelationship[] = [
  { id: 'PBR-001', principalName: 'HDFC Asset Management Company', brokerCode: 'HDFCAMC-0091', agreementDate: '2012-05-01', commissionType: 'Trail + Upfront', status: 'Active' },
  { id: 'PBR-002', principalName: 'SBI Funds Management Ltd', brokerCode: 'SBIMF-0234', agreementDate: '2012-05-01', commissionType: 'Trail', status: 'Active' },
  { id: 'PBR-003', principalName: 'ICICI Prudential AMC', brokerCode: 'ICICIPRU-0456', agreementDate: '2013-01-15', commissionType: 'Trail + Upfront', status: 'Active' },
  { id: 'PBR-004', principalName: 'Axis Asset Management Company', brokerCode: 'AXISAMC-0788', agreementDate: '2013-08-20', commissionType: 'Trail', status: 'Active' },
  { id: 'PBR-005', principalName: 'Nippon India Mutual Fund', brokerCode: 'NIPPON-1023', agreementDate: '2014-03-10', commissionType: 'Trail', status: 'Active' },
  { id: 'PBR-006', principalName: 'Kotak Mahindra AMC', brokerCode: 'KOTAKMF-1345', agreementDate: '2014-11-05', commissionType: 'Trail + Upfront', status: 'Active' },
  { id: 'PBR-007', principalName: 'Franklin Templeton AMC', brokerCode: 'FTAMC-1567', agreementDate: '2015-02-18', commissionType: 'Trail', status: 'Terminated' },
  { id: 'PBR-008', principalName: 'National Stock Exchange (NSE) — MFSS', brokerCode: 'NSE-MFSS-778', agreementDate: '2016-06-01', commissionType: 'Upfront', status: 'Active' },
];

// ---------------------------------------------------------------------------
// User Management
// ---------------------------------------------------------------------------

export interface Role {
  id: string;
  name: string;
  description: string;
  createdOn: string;
}

export interface Permission {
  id: string;
  label: string;
  category: string;
}

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  email: string;
  roleId: string;
  branchId: string | null;
  status: 'Active' | 'Inactive' | 'Locked';
  lastLogin: string | null;
}

export interface RmMapping {
  id: string;
  rmEmployeeId: string;
  branchIds: string[];
  clientSegment: 'Retail' | 'HNI' | 'Corporate' | 'NRI' | 'All Segments';
  clientCount: number;
  mappedOn: string;
}

export const MOCK_ROLES: Role[] = [
  { id: 'ROLE-001', name: 'Super Admin', description: 'Unrestricted access to every module, master, and configuration screen.', createdOn: '2012-04-01' },
  { id: 'ROLE-002', name: 'Branch Manager', description: 'Manages branch staff, approvals, and customer records for their branch.', createdOn: '2012-04-01' },
  { id: 'ROLE-003', name: 'Relationship Manager', description: 'Client-facing role with access to assigned customers and transaction entry.', createdOn: '2012-04-01' },
  { id: 'ROLE-004', name: 'Operations Executive', description: 'Processes transactions, imports, and settlement-related back-office tasks.', createdOn: '2013-01-10' },
  { id: 'ROLE-005', name: 'Compliance Officer', description: 'Reviews KYC, audit trails, and regulatory reporting across the platform.', createdOn: '2013-06-15' },
  { id: 'ROLE-006', name: 'Read-Only Auditor', description: 'View-only access for external or internal audit purposes.', createdOn: '2015-09-01' },
];

export const MOCK_PERMISSIONS: Permission[] = [
  { id: 'PERM-01', label: 'View Customers', category: 'Customer Management' },
  { id: 'PERM-02', label: 'Edit Customers', category: 'Customer Management' },
  { id: 'PERM-03', label: 'Merge / Split Customers', category: 'Customer Management' },
  { id: 'PERM-04', label: 'Create Transactions', category: 'Transactions' },
  { id: 'PERM-05', label: 'Approve Transactions', category: 'Transactions' },
  { id: 'PERM-06', label: 'Reverse / Cancel Transactions', category: 'Transactions' },
  { id: 'PERM-07', label: 'View Reports', category: 'Reports' },
  { id: 'PERM-08', label: 'Export Reports', category: 'Reports' },
  { id: 'PERM-09', label: 'Schedule Reports', category: 'Reports' },
  { id: 'PERM-10', label: 'Manage Masters (Branch / Employee / ARN)', category: 'Setup' },
  { id: 'PERM-11', label: 'Manage Users & Roles', category: 'Setup' },
  { id: 'PERM-12', label: 'Send Broadcast Communication', category: 'Alerts' },
  { id: 'PERM-13', label: 'Manage Notification Templates', category: 'Alerts' },
  { id: 'PERM-14', label: 'View Audit Trail', category: 'Compliance' },
  { id: 'PERM-15', label: 'Manage KYC Records', category: 'Compliance' },
  { id: 'PERM-16', label: 'Manage Customer Logins', category: 'Customer Access' },
];

export const MOCK_ROLE_PRIVILEGES: Record<string, string[]> = {
  'ROLE-001': MOCK_PERMISSIONS.map((p) => p.id),
  'ROLE-002': ['PERM-01', 'PERM-02', 'PERM-03', 'PERM-04', 'PERM-05', 'PERM-07', 'PERM-08', 'PERM-16'],
  'ROLE-003': ['PERM-01', 'PERM-02', 'PERM-04', 'PERM-07'],
  'ROLE-004': ['PERM-01', 'PERM-04', 'PERM-06', 'PERM-07', 'PERM-09'],
  'ROLE-005': ['PERM-01', 'PERM-07', 'PERM-08', 'PERM-14', 'PERM-15'],
  'ROLE-006': ['PERM-01', 'PERM-07', 'PERM-14'],
};

export const MOCK_USERS: UserAccount[] = [
  { id: 'USR-001', username: 'rohit.kulkarni', name: 'Rohit Kulkarni', email: 'rohit.kulkarni@wealthos.in', roleId: 'ROLE-002', branchId: 'BR-001', status: 'Active', lastLogin: '2026-09-15 09:12' },
  { id: 'USR-002', username: 'priyanka.joshi', name: 'Priyanka Joshi', email: 'priyanka.joshi@wealthos.in', roleId: 'ROLE-003', branchId: 'BR-001', status: 'Active', lastLogin: '2026-09-15 10:44' },
  { id: 'USR-003', username: 'anjali.bhatia', name: 'Anjali Bhatia', email: 'anjali.bhatia@wealthos.in', roleId: 'ROLE-002', branchId: 'BR-002', status: 'Active', lastLogin: '2026-09-14 18:20' },
  { id: 'USR-004', username: 'karan.malhotra', name: 'Karan Malhotra', email: 'karan.malhotra@wealthos.in', roleId: 'ROLE-003', branchId: 'BR-002', status: 'Active', lastLogin: '2026-09-15 08:55' },
  { id: 'USR-005', username: 'suresh.nayak', name: 'Suresh Nayak', email: 'suresh.nayak@wealthos.in', roleId: 'ROLE-002', branchId: 'BR-003', status: 'Active', lastLogin: '2026-09-13 11:02' },
  { id: 'USR-006', username: 'divya.rao', name: 'Divya Rao', email: 'divya.rao@wealthos.in', roleId: 'ROLE-004', branchId: 'BR-003', status: 'Active', lastLogin: '2026-09-15 07:40' },
  { id: 'USR-007', username: 'mrunal.deshpande', name: 'Mrunal Deshpande', email: 'mrunal.deshpande@wealthos.in', roleId: 'ROLE-002', branchId: 'BR-004', status: 'Active', lastLogin: '2026-09-12 16:15' },
  { id: 'USR-008', username: 'ritu.chawla', name: 'Ritu Chawla', email: 'ritu.chawla@wealthos.in', roleId: 'ROLE-005', branchId: 'BR-001', status: 'Active', lastLogin: '2026-09-14 09:30' },
  { id: 'USR-009', username: 'nikhil.agarwal', name: 'Nikhil Agarwal', email: 'nikhil.agarwal@wealthos.in', roleId: 'ROLE-002', branchId: 'BR-009', status: 'Inactive', lastLogin: '2026-06-01 12:00' },
  { id: 'USR-010', username: 'admin.super', name: 'Wealth Ops Super Admin', email: 'admin@wealthos.in', roleId: 'ROLE-001', branchId: null, status: 'Active', lastLogin: '2026-09-16 06:05' },
  { id: 'USR-011', username: 'audit.external', name: 'External Auditor — Grant Thornton', email: 'audit@wealthos.in', roleId: 'ROLE-006', branchId: null, status: 'Active', lastLogin: '2026-09-10 14:22' },
  { id: 'USR-012', username: 'kavya.subramaniam', name: 'Kavya Subramaniam', email: 'kavya.subramaniam@wealthos.in', roleId: 'ROLE-002', branchId: 'BR-005', status: 'Locked', lastLogin: '2026-08-28 10:11' },
];

export const MOCK_RM_MAPPINGS: RmMapping[] = [
  { id: 'RMM-001', rmEmployeeId: 'EMP-002', branchIds: ['BR-001'], clientSegment: 'HNI', clientCount: 84, mappedOn: '2023-01-15' },
  { id: 'RMM-002', rmEmployeeId: 'EMP-004', branchIds: ['BR-002'], clientSegment: 'Retail', clientCount: 210, mappedOn: '2022-06-01' },
  { id: 'RMM-003', rmEmployeeId: 'EMP-008', branchIds: ['BR-004'], clientSegment: 'All Segments', clientCount: 156, mappedOn: '2023-04-11' },
  { id: 'RMM-004', rmEmployeeId: 'EMP-011', branchIds: ['BR-006'], clientSegment: 'Corporate', clientCount: 32, mappedOn: '2024-02-19' },
  { id: 'RMM-005', rmEmployeeId: 'EMP-002', branchIds: ['BR-001', 'BR-004'], clientSegment: 'NRI', clientCount: 41, mappedOn: '2024-08-05' },
  { id: 'RMM-006', rmEmployeeId: 'EMP-004', branchIds: ['BR-002', 'BR-009'], clientSegment: 'HNI', clientCount: 63, mappedOn: '2025-01-22' },
  { id: 'RMM-007', rmEmployeeId: 'EMP-008', branchIds: ['BR-003', 'BR-005'], clientSegment: 'Retail', clientCount: 188, mappedOn: '2025-05-30' },
];

// ---------------------------------------------------------------------------
// Customer Access
// ---------------------------------------------------------------------------

export interface CustomerLogin {
  id: string;
  customerName: string;
  username: string;
  email: string;
  lastLogin: string | null;
  failedAttempts: number;
  status: 'Active' | 'Disabled' | 'Locked';
}

export interface SmsEmailUsageLogEntry {
  id: string;
  customerName: string;
  channel: 'SMS' | 'Email';
  messageType: string;
  sentOn: string;
  status: 'Delivered' | 'Failed' | 'Pending';
}

export interface ReportMailBackLogEntry {
  id: string;
  customerName: string;
  reportName: string;
  emailId: string;
  sentOn: string;
  status: 'Bounced' | 'Failed' | 'Delivered';
  reason: string;
}

export const MOCK_CUSTOMER_LOGINS: CustomerLogin[] = [
  { id: 'CL-001', customerName: 'Rajesh Mehta', username: 'rajesh.mehta', email: 'rajesh.mehta@example.com', lastLogin: '2026-09-15 21:04', failedAttempts: 0, status: 'Active' },
  { id: 'CL-002', customerName: 'Kavita Mehta', username: 'kavita.mehta', email: 'kavita.mehta@example.com', lastLogin: '2026-09-14 19:30', failedAttempts: 0, status: 'Active' },
  { id: 'CL-003', customerName: 'Arvind Kapoor', username: 'arvind.kapoor', email: 'arvind.kapoor@example.com', lastLogin: '2026-08-02 11:12', failedAttempts: 3, status: 'Locked' },
  { id: 'CL-004', customerName: 'Sunita Reddy', username: 'sunita.reddy', email: 'sunita.reddy@example.com', lastLogin: '2026-09-10 08:45', failedAttempts: 0, status: 'Active' },
  { id: 'CL-005', customerName: 'Kabir Enterprises Pvt Ltd', username: 'kabirent.finance', email: 'finance@kabirent.com', lastLogin: '2026-09-13 15:20', failedAttempts: 0, status: 'Active' },
  { id: 'CL-006', customerName: 'Neha Verma', username: 'neha.verma', email: 'neha.verma@example.com', lastLogin: '2026-07-19 10:00', failedAttempts: 0, status: 'Disabled' },
  { id: 'CL-007', customerName: 'Suresh Iyer', username: 'suresh.iyer', email: 'suresh.iyer@example.com', lastLogin: '2026-09-11 22:41', failedAttempts: 1, status: 'Active' },
  { id: 'CL-008', customerName: 'The Malhotra Family Trust', username: 'malhotra.trust', email: 'office@malhotratrust.com', lastLogin: '2026-09-09 12:05', failedAttempts: 0, status: 'Active' },
  { id: 'CL-009', customerName: 'Rohan Malhotra', username: 'rohan.malhotra', email: 'rohan.malhotra@example.com', lastLogin: '2026-09-15 07:10', failedAttempts: 0, status: 'Active' },
  { id: 'CL-010', customerName: 'Ananya Ghosh', username: 'ananya.ghosh', email: 'ananya.ghosh@example.com', lastLogin: null, failedAttempts: 5, status: 'Locked' },
  { id: 'CL-011', customerName: 'Vikram Singh', username: 'vikram.singh', email: 'vikram.singh@example.com', lastLogin: '2026-09-08 09:55', failedAttempts: 0, status: 'Active' },
  { id: 'CL-012', customerName: 'Meera Nair', username: 'meera.nair', email: 'meera.nair@example.com', lastLogin: null, failedAttempts: 0, status: 'Disabled' },
  { id: 'CL-013', customerName: 'Orion Logistics Ltd', username: 'orionlog.treasury', email: 'treasury@orionlog.com', lastLogin: '2026-09-12 17:33', failedAttempts: 0, status: 'Active' },
  { id: 'CL-014', customerName: 'Priya Sharma', username: 'priya.sharma', email: 'priya.sharma@example.com', lastLogin: '2026-09-16 06:48', failedAttempts: 0, status: 'Active' },
  { id: 'CL-015', customerName: 'Deepika Rao', username: 'deepika.rao', email: 'deepika.rao@example.com', lastLogin: '2026-09-06 13:27', failedAttempts: 2, status: 'Active' },
  { id: 'CL-016', customerName: 'Manoj Tiwari', username: 'manoj.tiwari', email: 'manoj.tiwari@example.com', lastLogin: '2026-05-14 10:15', failedAttempts: 0, status: 'Disabled' },
  { id: 'CL-017', customerName: 'Farida Khan', username: 'farida.khan', email: 'farida.khan@example.com', lastLogin: '2026-09-15 20:02', failedAttempts: 0, status: 'Active' },
  { id: 'CL-018', customerName: 'Ganesh Pillai', username: 'ganesh.pillai', email: 'ganesh.pillai@example.com', lastLogin: '2026-09-01 09:41', failedAttempts: 0, status: 'Active' },
  { id: 'CL-019', customerName: 'Alok Srivastava', username: 'alok.srivastava', email: 'alok.srivastava@example.com', lastLogin: '2026-08-25 08:19', failedAttempts: 4, status: 'Locked' },
  { id: 'CL-020', customerName: 'Ritika Bose', username: 'ritika.bose', email: 'ritika.bose@example.com', lastLogin: '2026-09-14 11:03', failedAttempts: 0, status: 'Active' },
];

const SMS_TYPES = ['OTP Verification', 'Transaction Alert', 'SIP Reminder', 'KYC Expiry Alert', 'Statement Ready', 'Welcome Message'];
const EMAIL_TYPES = ['Account Statement', 'Transaction Confirmation', 'Portfolio Summary', 'KYC Reminder', 'Welcome Email', 'Password Reset'];
const CUSTOMER_NAMES = ['Rajesh Mehta', 'Kavita Mehta', 'Arvind Kapoor', 'Sunita Reddy', 'Neha Verma', 'Suresh Iyer', 'Rohan Malhotra', 'Ananya Ghosh', 'Vikram Singh', 'Meera Nair', 'Priya Sharma', 'Deepika Rao', 'Manoj Tiwari', 'Farida Khan', 'Ganesh Pillai', 'Alok Srivastava', 'Ritika Bose'];

export const MOCK_SMS_EMAIL_LOG: SmsEmailUsageLogEntry[] = Array.from({ length: 28 }, (_, i) => {
  const channel: 'SMS' | 'Email' = i % 2 === 0 ? 'SMS' : 'Email';
  const types = channel === 'SMS' ? SMS_TYPES : EMAIL_TYPES;
  const status: SmsEmailUsageLogEntry['status'] = i % 11 === 0 ? 'Failed' : i % 7 === 0 ? 'Pending' : 'Delivered';
  const day = 16 - (i % 15);
  return {
    id: `SEL-${String(i + 1).padStart(3, '0')}`,
    customerName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
    channel,
    messageType: types[i % types.length],
    sentOn: `2026-09-${String(day).padStart(2, '0')} ${String(8 + (i % 12)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    status,
  };
});

const BOUNCE_REASONS = ['Mailbox full', 'Invalid email address', 'Domain not found', 'Spam filter rejection', 'Mailbox does not exist', 'Server timeout'];

export const MOCK_REPORT_MAIL_BACK_LOG: ReportMailBackLogEntry[] = Array.from({ length: 20 }, (_, i) => {
  const status: ReportMailBackLogEntry['status'] = i % 4 === 0 ? 'Delivered' : i % 3 === 0 ? 'Failed' : 'Bounced';
  const day = 15 - (i % 14);
  return {
    id: `RMB-${String(i + 1).padStart(3, '0')}`,
    customerName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
    reportName: ['Monthly Account Statement', 'Capital Gains Report', 'Portfolio Valuation Summary', 'Annual Tax Statement'][i % 4],
    emailId: `${CUSTOMER_NAMES[i % CUSTOMER_NAMES.length].toLowerCase().replace(/\s+/g, '.')}@example.com`,
    sentOn: `2026-09-${String(day).padStart(2, '0')} 07:30`,
    status,
    reason: status === 'Delivered' ? '—' : BOUNCE_REASONS[i % BOUNCE_REASONS.length],
  };
});

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export interface AppConfig {
  allowOnlineTransactions: boolean;
  enableTwoFactorAuth: boolean;
  allowPaperlessKyc: boolean;
  enableSmsAlerts: boolean;
  enableEmailAlerts: boolean;
  autoLogoutMinutes: number;
  maxLoginAttempts: number;
  autoLockInactiveDays: number;
  defaultRiskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  supportEmail: string;
  supportPhone: string;
}

export const MOCK_APP_CONFIG: AppConfig = {
  allowOnlineTransactions: true,
  enableTwoFactorAuth: true,
  allowPaperlessKyc: true,
  enableSmsAlerts: true,
  enableEmailAlerts: true,
  autoLogoutMinutes: 15,
  maxLoginAttempts: 5,
  autoLockInactiveDays: 180,
  defaultRiskProfile: 'Moderate',
  supportEmail: 'support@wealthos.in',
  supportPhone: '1800 120 5566',
};

export interface GreetingTemplate {
  id: string;
  occasion: string;
  channel: 'SMS' | 'Email' | 'Both';
  message: string;
  active: boolean;
}

export const MOCK_GREETING_TEMPLATES: GreetingTemplate[] = [
  { id: 'GRT-001', occasion: 'Birthday', channel: 'Both', message: 'Dear {{name}}, wishing you a very happy birthday! May the year ahead bring you continued prosperity. — Team WealthOS', active: true },
  { id: 'GRT-002', occasion: 'Wedding Anniversary', channel: 'Email', message: 'Dear {{name}}, warm wishes on your wedding anniversary from all of us at WealthOS.', active: true },
  { id: 'GRT-003', occasion: 'Diwali', channel: 'Both', message: 'Dear {{name}}, wishing you and your family a joyous and prosperous Diwali! — Team WealthOS', active: true },
  { id: 'GRT-004', occasion: 'New Year', channel: 'Both', message: 'Dear {{name}}, wishing you a healthy and prosperous {{year}} ahead. Thank you for trusting us with your wealth journey.', active: true },
  { id: 'GRT-005', occasion: 'Onboarding Welcome', channel: 'Email', message: 'Dear {{name}}, welcome aboard! Your account {{clientId}} is now active. Our Relationship Manager will reach out shortly.', active: true },
  { id: 'GRT-006', occasion: 'KYC Renewal Reminder', channel: 'SMS', message: 'Dear {{name}}, your KYC is due for renewal. Please visit your nearest branch or complete it online to avoid disruption.', active: false },
];

export interface RecommendedFund {
  id: string;
  schemeName: string;
  amc: string;
  category: string;
  rank: number;
  addedOn: string;
}

export const MOCK_RECOMMENDED_FUNDS: RecommendedFund[] = [
  { id: 'RF-001', schemeName: 'HDFC Flexi Cap Fund — Growth', amc: 'HDFC Mutual Fund', category: 'Equity — Flexi Cap', rank: 1, addedOn: '2025-04-01' },
  { id: 'RF-002', schemeName: 'ICICI Prudential Bluechip Fund — Growth', amc: 'ICICI Prudential AMC', category: 'Equity — Large Cap', rank: 2, addedOn: '2025-04-01' },
  { id: 'RF-003', schemeName: 'Parag Parikh Flexi Cap Fund — Growth', amc: 'PPFAS Mutual Fund', category: 'Equity — Flexi Cap', rank: 3, addedOn: '2025-05-12' },
  { id: 'RF-004', schemeName: 'SBI Small Cap Fund — Growth', amc: 'SBI Funds Management', category: 'Equity — Small Cap', rank: 4, addedOn: '2025-05-12' },
  { id: 'RF-005', schemeName: 'Mirae Asset Emerging Bluechip Fund — Growth', amc: 'Mirae Asset MF', category: 'Equity — Large & Mid Cap', rank: 5, addedOn: '2025-06-20' },
  { id: 'RF-006', schemeName: 'Axis Small Cap Fund — Growth', amc: 'Axis Asset Management', category: 'Equity — Small Cap', rank: 6, addedOn: '2025-06-20' },
  { id: 'RF-007', schemeName: 'Kotak Emerging Equity Fund — Growth', amc: 'Kotak Mahindra AMC', category: 'Equity — Mid Cap', rank: 7, addedOn: '2025-07-08' },
  { id: 'RF-008', schemeName: 'ICICI Prudential Corporate Bond Fund — Growth', amc: 'ICICI Prudential AMC', category: 'Debt — Corporate Bond', rank: 8, addedOn: '2025-08-15' },
  { id: 'RF-009', schemeName: 'Nippon India Nifty 50 Index Fund — Growth', amc: 'Nippon India MF', category: 'Index Fund', rank: 9, addedOn: '2025-08-15' },
  { id: 'RF-010', schemeName: 'HDFC Balanced Advantage Fund — Growth', amc: 'HDFC Mutual Fund', category: 'Hybrid — Balanced Advantage', rank: 10, addedOn: '2025-09-01' },
];

// ---------------------------------------------------------------------------
// Alerts & Notifications
// ---------------------------------------------------------------------------

export interface IntimationTemplate {
  id: string;
  name: string;
  channel: 'SMS' | 'Email' | 'Push' | 'WhatsApp';
  trigger: string;
  content: string;
  status: 'Active' | 'Inactive';
}

export const MOCK_INTIMATION_TEMPLATES: IntimationTemplate[] = [
  { id: 'IT-001', name: 'SIP Debit Reminder', channel: 'SMS', trigger: 'T-2 days before SIP due date', content: 'Dear {{name}}, your SIP of ₹{{amount}} in {{scheme}} is due on {{date}}. Ensure sufficient balance.', status: 'Active' },
  { id: 'IT-002', name: 'Transaction Confirmation', channel: 'Email', trigger: 'On transaction processing', content: 'Dear {{name}}, your {{txnType}} of ₹{{amount}} in {{scheme}} has been processed successfully.', status: 'Active' },
  { id: 'IT-003', name: 'KYC Expiry Alert', channel: 'SMS', trigger: '30 days before KYC expiry', content: 'Dear {{name}}, your KYC will expire on {{date}}. Please update it to continue investing.', status: 'Active' },
  { id: 'IT-004', name: 'Welcome — New Account', channel: 'Email', trigger: 'On account creation', content: 'Dear {{name}}, welcome to WealthOS! Your account {{clientId}} has been created successfully.', status: 'Active' },
  { id: 'IT-005', name: 'Redemption Processed', channel: 'Push', trigger: 'On redemption settlement', content: 'Your redemption of ₹{{amount}} from {{scheme}} has been credited to your registered bank account.', status: 'Active' },
  { id: 'IT-006', name: 'Portfolio Statement Ready', channel: 'WhatsApp', trigger: 'Monthly, on the 1st', content: 'Hi {{name}}, your monthly portfolio statement is ready. Tap to view.', status: 'Active' },
  { id: 'IT-007', name: 'Login OTP', channel: 'SMS', trigger: 'On login attempt', content: 'Your WealthOS login OTP is {{otp}}. Valid for 10 minutes. Do not share this with anyone.', status: 'Active' },
  { id: 'IT-008', name: 'NACH Mandate Failure', channel: 'Email', trigger: 'On mandate rejection', content: 'Dear {{name}}, your NACH mandate registration for SIP could not be processed. Reason: {{reason}}.', status: 'Active' },
  { id: 'IT-009', name: 'Goal Milestone Reached', channel: 'Push', trigger: 'On goal progress ≥ 50/75/100%', content: 'Great news {{name}}! Your goal "{{goalName}}" has crossed {{percent}}% of target.', status: 'Inactive' },
  { id: 'IT-010', name: 'Inactive Account Nudge', channel: 'Email', trigger: '180 days of no transaction', content: 'Dear {{name}}, we noticed no activity on your account recently. Talk to your RM for a portfolio review.', status: 'Inactive' },
];

export interface ScheduledService {
  id: string;
  name: string;
  frequency: string;
  lastRun: string;
  nextRun: string;
  status: 'Active' | 'Paused' | 'Error';
}

export const MOCK_SCHEDULED_SERVICES: ScheduledService[] = [
  { id: 'SVC-001', name: 'NAV Update Sync', frequency: 'Daily, 21:30 IST', lastRun: '2026-09-15 21:30', nextRun: '2026-09-16 21:30', status: 'Active' },
  { id: 'SVC-002', name: 'SIP Batch Processing', frequency: 'Daily, 06:00 IST', lastRun: '2026-09-16 06:00', nextRun: '2026-09-17 06:00', status: 'Active' },
  { id: 'SVC-003', name: 'Monthly Account Statement Mailer', frequency: 'Monthly, 1st, 07:00 IST', lastRun: '2026-09-01 07:00', nextRun: '2026-10-01 07:00', status: 'Active' },
  { id: 'SVC-004', name: 'Brokerage Calculation Engine', frequency: 'Daily, 22:00 IST', lastRun: '2026-09-15 22:00', nextRun: '2026-09-16 22:00', status: 'Active' },
  { id: 'SVC-005', name: 'KYC Registry Sync (KRA)', frequency: 'Daily, 05:00 IST', lastRun: '2026-09-16 05:00', nextRun: '2026-09-17 05:00', status: 'Error' },
  { id: 'SVC-006', name: 'Holiday Calendar Sync', frequency: 'Weekly, Monday 04:00 IST', lastRun: '2026-09-14 04:00', nextRun: '2026-09-21 04:00', status: 'Active' },
  { id: 'SVC-007', name: 'Report Mailer Queue Flush', frequency: 'Every 4 hours', lastRun: '2026-09-16 08:00', nextRun: '2026-09-16 12:00', status: 'Active' },
  { id: 'SVC-008', name: 'Nightly Data Backup', frequency: 'Daily, 02:00 IST', lastRun: '2026-09-16 02:00', nextRun: '2026-09-17 02:00', status: 'Paused' },
];

export interface ScheduleServiceLogEntry {
  id: string;
  serviceName: string;
  runOn: string;
  status: 'Success' | 'Failed';
  durationSec: number;
  recordsProcessed: number;
}

export const MOCK_SCHEDULE_SERVICE_LOG: ScheduleServiceLogEntry[] = Array.from({ length: 24 }, (_, i) => {
  const service = MOCK_SCHEDULED_SERVICES[i % MOCK_SCHEDULED_SERVICES.length];
  const status: ScheduleServiceLogEntry['status'] = i % 9 === 0 ? 'Failed' : 'Success';
  const day = 16 - Math.floor(i / 2);
  return {
    id: `SSL-${String(i + 1).padStart(3, '0')}`,
    serviceName: service.name,
    runOn: `2026-09-${String(Math.max(day, 1)).padStart(2, '0')} ${String(2 + (i % 20)).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}`,
    status,
    durationSec: 12 + ((i * 7) % 240),
    recordsProcessed: status === 'Failed' ? 0 : 500 + ((i * 137) % 8500),
  };
});

export interface BroadcastMessage {
  id: string;
  segment: string;
  channel: 'SMS' | 'Email' | 'Push';
  subject: string;
  message: string;
  sentOn: string;
  recipientCount: number;
  status: 'Sent' | 'Scheduled' | 'Failed';
}

export const MOCK_BROADCAST_LOG: BroadcastMessage[] = [
  { id: 'BC-001', segment: 'All HNI Customers', channel: 'Email', subject: 'Market Outlook — Q3 FY26', message: 'Dear Investor, please find attached our quarterly market outlook and asset allocation recommendations.', sentOn: '2026-09-10 09:00', recipientCount: 312, status: 'Sent' },
  { id: 'BC-002', segment: 'SIP Customers — Overdue', channel: 'SMS', subject: '—', message: 'Your SIP payment is overdue. Please ensure funds are available to avoid a missed instalment.', sentOn: '2026-09-12 10:30', recipientCount: 148, status: 'Sent' },
  { id: 'BC-003', segment: 'All Active Customers', channel: 'Push', subject: 'App Update Available', message: 'A new version of the WealthOS app is available with faster statements and dark mode.', sentOn: '2026-09-14 08:00', recipientCount: 4820, status: 'Sent' },
  { id: 'BC-004', segment: 'NRI Customers', channel: 'Email', subject: 'FEMA Compliance Update', message: 'Important update regarding FEMA reporting requirements for NRI investment accounts.', sentOn: '2026-09-16 07:00', recipientCount: 96, status: 'Scheduled' },
  { id: 'BC-005', segment: 'KYC Pending Customers', channel: 'SMS', subject: '—', message: 'Your KYC verification is pending. Please complete it to avoid restrictions on future transactions.', sentOn: '2026-08-28 09:15', recipientCount: 57, status: 'Failed' },
];

export interface SetupScheduledReport {
  id: string;
  reportName: string;
  recipientGroup: string;
  frequency: string;
  nextRun: string;
  status: 'Active' | 'Paused';
}

export const MOCK_SETUP_SCHEDULED_REPORTS: SetupScheduledReport[] = [
  { id: 'SSR-001', reportName: 'Monthly AUM Summary', recipientGroup: 'All Branch Managers', frequency: 'Monthly, 1st', nextRun: '2026-10-01', status: 'Active' },
  { id: 'SSR-002', reportName: 'Compliance & KYC Exceptions', recipientGroup: 'Compliance Team', frequency: 'Weekly, Monday', nextRun: '2026-09-21', status: 'Active' },
  { id: 'SSR-003', reportName: 'Brokerage Payout Statement', recipientGroup: 'All Associates', frequency: 'Monthly, 5th', nextRun: '2026-10-05', status: 'Active' },
  { id: 'SSR-004', reportName: 'Inactive Customer Report', recipientGroup: 'Relationship Managers', frequency: 'Monthly, 10th', nextRun: '2026-10-10', status: 'Paused' },
  { id: 'SSR-005', reportName: 'SIP Rejection Summary', recipientGroup: 'Operations Team', frequency: 'Daily', nextRun: '2026-09-17', status: 'Active' },
  { id: 'SSR-006', reportName: 'Branch-wise New Client Report', recipientGroup: 'All Branch Managers', frequency: 'Weekly, Friday', nextRun: '2026-09-18', status: 'Active' },
  { id: 'SSR-007', reportName: 'Login Failure & Lockout Report', recipientGroup: 'IT Security Team', frequency: 'Daily', nextRun: '2026-09-17', status: 'Active' },
  { id: 'SSR-008', reportName: 'ARN Expiry Watchlist', recipientGroup: 'Compliance Team', frequency: 'Monthly, 15th', nextRun: '2026-10-15', status: 'Paused' },
];

// ---------------------------------------------------------------------------
// Miscellaneous
// ---------------------------------------------------------------------------

export interface AreaRecord {
  id: string;
  areaName: string;
  pincode: string;
  city: string;
  state: string;
  status: 'Active' | 'Inactive';
}

export const MOCK_AREAS: AreaRecord[] = [
  { id: 'AR-001', areaName: 'Bandra Kurla Complex', pincode: '400051', city: 'Mumbai', state: 'Maharashtra', status: 'Active' },
  { id: 'AR-002', areaName: 'Andheri East', pincode: '400069', city: 'Mumbai', state: 'Maharashtra', status: 'Active' },
  { id: 'AR-003', areaName: 'Connaught Place', pincode: '110001', city: 'New Delhi', state: 'Delhi', status: 'Active' },
  { id: 'AR-004', areaName: 'Indiranagar', pincode: '560038', city: 'Bengaluru', state: 'Karnataka', status: 'Active' },
  { id: 'AR-005', areaName: 'Koramangala', pincode: '560034', city: 'Bengaluru', state: 'Karnataka', status: 'Active' },
  { id: 'AR-006', areaName: 'Koregaon Park', pincode: '411001', city: 'Pune', state: 'Maharashtra', status: 'Active' },
  { id: 'AR-007', areaName: 'Nungambakkam', pincode: '600034', city: 'Chennai', state: 'Tamil Nadu', status: 'Active' },
  { id: 'AR-008', areaName: 'Banjara Hills', pincode: '500034', city: 'Hyderabad', state: 'Telangana', status: 'Active' },
  { id: 'AR-009', areaName: 'Park Street', pincode: '700016', city: 'Kolkata', state: 'West Bengal', status: 'Active' },
  { id: 'AR-010', areaName: 'SG Highway', pincode: '380015', city: 'Ahmedabad', state: 'Gujarat', status: 'Active' },
  { id: 'AR-011', areaName: 'C-Scheme', pincode: '302001', city: 'Jaipur', state: 'Rajasthan', status: 'Inactive' },
  { id: 'AR-012', areaName: 'Marine Drive, Ernakulam', pincode: '682031', city: 'Kochi', state: 'Kerala', status: 'Active' },
  { id: 'AR-013', areaName: 'Civil Lines', pincode: '208001', city: 'Kanpur', state: 'Uttar Pradesh', status: 'Inactive' },
  { id: 'AR-014', areaName: 'MG Road', pincode: '411011', city: 'Pune', state: 'Maharashtra', status: 'Active' },
  { id: 'AR-015', areaName: 'Salt Lake Sector V', pincode: '700091', city: 'Kolkata', state: 'West Bengal', status: 'Active' },
];

export interface HolidayRecord {
  id: string;
  date: string;
  name: string;
  type: 'National' | 'Bank' | 'Settlement' | 'Regional';
  status: 'Active' | 'Inactive';
}

export const MOCK_HOLIDAYS: HolidayRecord[] = [
  { id: 'HOL-001', date: '2026-01-26', name: 'Republic Day', type: 'National', status: 'Active' },
  { id: 'HOL-002', date: '2026-03-04', name: 'Holi', type: 'National', status: 'Active' },
  { id: 'HOL-003', date: '2026-03-21', name: 'Id-ul-Fitr (Ramzan Id)', type: 'National', status: 'Active' },
  { id: 'HOL-004', date: '2026-04-03', name: 'Good Friday', type: 'Settlement', status: 'Active' },
  { id: 'HOL-005', date: '2026-04-14', name: 'Dr. Ambedkar Jayanti', type: 'Regional', status: 'Active' },
  { id: 'HOL-006', date: '2026-05-01', name: 'Maharashtra Day', type: 'Regional', status: 'Active' },
  { id: 'HOL-007', date: '2026-08-15', name: 'Independence Day', type: 'National', status: 'Active' },
  { id: 'HOL-008', date: '2026-08-26', name: 'Ganesh Chaturthi', type: 'Regional', status: 'Active' },
  { id: 'HOL-009', date: '2026-10-02', name: 'Gandhi Jayanti', type: 'National', status: 'Active' },
  { id: 'HOL-010', date: '2026-10-20', name: 'Dussehra', type: 'National', status: 'Active' },
  { id: 'HOL-011', date: '2026-11-08', name: 'Diwali (Laxmi Pujan)', type: 'Settlement', status: 'Active' },
  { id: 'HOL-012', date: '2026-11-09', name: 'Diwali Balipratipada', type: 'Bank', status: 'Active' },
  { id: 'HOL-013', date: '2026-11-24', name: 'Guru Nanak Jayanti', type: 'National', status: 'Active' },
  { id: 'HOL-014', date: '2026-12-25', name: 'Christmas', type: 'National', status: 'Active' },
  { id: 'HOL-015', date: '2026-12-31', name: 'Bank Annual Closing', type: 'Bank', status: 'Inactive' },
];

export interface SetupImportLogEntry {
  id: string;
  module: string;
  fileName: string;
  rowCount: number;
  importedBy: string;
  importedOn: string;
  status: 'Success' | 'Partial' | 'Failed';
}

const IMPORT_MODULES = ['Customer Master', 'MF Transactions', 'Employee Master', 'ARN Master', 'General Insurance Policies', 'Other Investments', 'Branch Master', 'Recommended Funds'];

export const MOCK_SETUP_IMPORT_LOG: SetupImportLogEntry[] = Array.from({ length: 22 }, (_, i) => {
  const status: SetupImportLogEntry['status'] = i % 8 === 0 ? 'Failed' : i % 5 === 0 ? 'Partial' : 'Success';
  const day = 16 - (i % 15);
  return {
    id: `IMPL-${String(i + 1).padStart(3, '0')}`,
    module: IMPORT_MODULES[i % IMPORT_MODULES.length],
    fileName: `${IMPORT_MODULES[i % IMPORT_MODULES.length].toLowerCase().replace(/\s+/g, '_')}_batch_${100 + i}.xlsx`,
    rowCount: 20 + ((i * 43) % 900),
    importedBy: ['Ritu Chawla', 'Divya Rao', 'Aakash Pawar', 'Sneha Pillai', 'Wealth Ops Super Admin'][i % 5],
    importedOn: `2026-09-${String(Math.max(day, 1)).padStart(2, '0')} ${String(9 + (i % 8)).padStart(2, '0')}:${String((i * 17) % 60).padStart(2, '0')}`,
    status,
  };
});

export interface VersionHistoryEntry {
  id: string;
  version: string;
  releaseDate: string;
  type: 'Feature' | 'Fix' | 'Improvement' | 'Security';
  summary: string;
}

export const MOCK_VERSION_HISTORY: VersionHistoryEntry[] = [
  { id: 'VH-001', version: '4.8.0', releaseDate: '2026-09-10', type: 'Feature', summary: 'Introduced Communication Panel for segment-based broadcast messaging across SMS, Email, and Push.' },
  { id: 'VH-002', version: '4.7.3', releaseDate: '2026-08-28', type: 'Fix', summary: 'Resolved an issue where report mail-back logs did not capture SMTP bounce reasons correctly.' },
  { id: 'VH-003', version: '4.7.2', releaseDate: '2026-08-15', type: 'Security', summary: 'Enforced two-factor authentication by default for all Super Admin and Compliance Officer roles.' },
  { id: 'VH-004', version: '4.7.0', releaseDate: '2026-08-01', type: 'Feature', summary: 'Added Relationship Manager Mapping screen to assign RMs across branches and client segments.' },
  { id: 'VH-005', version: '4.6.1', releaseDate: '2026-07-18', type: 'Improvement', summary: 'Improved load time of the Customers Master grid for branches with 10,000+ records.' },
  { id: 'VH-006', version: '4.6.0', releaseDate: '2026-07-05', type: 'Feature', summary: 'Launched Role Privileges matrix allowing granular permission control per role.' },
  { id: 'VH-007', version: '4.5.4', releaseDate: '2026-06-22', type: 'Fix', summary: 'Fixed incorrect next-run date calculation for monthly scheduled services falling on the 31st.' },
  { id: 'VH-008', version: '4.5.2', releaseDate: '2026-06-10', type: 'Improvement', summary: 'Recommended Funds list now supports drag-free re-ranking via up/down controls.' },
  { id: 'VH-009', version: '4.5.0', releaseDate: '2026-05-28', type: 'Feature', summary: 'Added Area Master and Holidays Master to support settlement-calendar-aware transaction processing.' },
  { id: 'VH-010', version: '4.4.1', releaseDate: '2026-05-12', type: 'Fix', summary: 'Corrected ARN validity countdown that showed incorrect expiry warnings for Partnership category ARNs.' },
  { id: 'VH-011', version: '4.4.0', releaseDate: '2026-04-30', type: 'Feature', summary: 'Rolled out Customer Login Management with enable/disable and password-reset actions for support staff.' },
  { id: 'VH-012', version: '4.3.2', releaseDate: '2026-04-14', type: 'Security', summary: 'Added automatic account lockout after 5 consecutive failed login attempts.' },
  { id: 'VH-013', version: '4.3.0', releaseDate: '2026-03-30', type: 'Feature', summary: 'Introduced Greetings Configuration for automated birthday, anniversary, and festival messages.' },
  { id: 'VH-014', version: '4.2.1', releaseDate: '2026-03-15', type: 'Improvement', summary: 'Streamlined the Import Log screen with module-level filtering across all back-office imports.' },
  { id: 'VH-015', version: '4.2.0', releaseDate: '2026-02-28', type: 'Feature', summary: 'Initial release of the Setup module covering Organization Setup and User Management masters.' },
];
