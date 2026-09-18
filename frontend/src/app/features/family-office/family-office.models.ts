// Local domain model for the Family Office module.
// A "family" here is one high-net-worth household onboarded as a group: a head, spouse,
// children (incl. minors), and legal entities (trusts / HUF) that each hold their own
// slice of the family's aggregate wealth. Not part of core/models — scoped to this feature.
import { Goal } from '../../core/models/domain.models';

export type MemberRelationship = 'Family Head' | 'Spouse' | 'Child' | 'Minor Child' | 'Family Trust' | 'HUF';
export type EntityType = 'Individual' | 'Minor' | 'Trust' | 'HUF';
export type DashboardAccess = 'Consolidated' | 'Restricted' | 'View Only';
export type VaultPermission = 'Read / Write' | 'Read Only' | 'No Access';
export type CasSyncStatus = 'Synced' | 'Pending Fix' | 'Not Started';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: MemberRelationship;
  entityType: EntityType;
  initials: string;
  panMasked: string;
  status: 'Active' | 'Dormant';
  /** Total individual AUM (platform-tracked + externally reported via CAS), in INR. */
  aum: number;
  ytdReturnPct: number | null;
  dashboardAccess: DashboardAccess;
  vaultPermission: VaultPermission;
  linkedAccounts: number;
  lastSyncLabel: string;
  casStatus: CasSyncStatus;
  joinedOn: string;
}

export const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'FM-01',
    name: 'Vikram Sharma',
    relationship: 'Family Head',
    entityType: 'Individual',
    initials: 'VS',
    panMasked: 'ABCPS****F',
    status: 'Active',
    aum: 65000000,
    ytdReturnPct: 12.4,
    dashboardAccess: 'Consolidated',
    vaultPermission: 'Read / Write',
    linkedAccounts: 4,
    lastSyncLabel: 'Today, 08:00',
    casStatus: 'Synced',
    joinedOn: '2018-04-12',
  },
  {
    id: 'FM-02',
    name: 'Ananya Sharma',
    relationship: 'Spouse',
    entityType: 'Individual',
    initials: 'AS',
    panMasked: 'DEFPS****K',
    status: 'Active',
    aum: 42000000,
    ytdReturnPct: 14.1,
    dashboardAccess: 'Consolidated',
    vaultPermission: 'Read / Write',
    linkedAccounts: 3,
    lastSyncLabel: 'Today, 08:02',
    casStatus: 'Synced',
    joinedOn: '2018-04-12',
  },
  {
    id: 'FM-03',
    name: 'Kavya Sharma',
    relationship: 'Child',
    entityType: 'Individual',
    initials: 'KS',
    panMasked: 'GHIPS****M',
    status: 'Active',
    aum: 9500000,
    ytdReturnPct: 16.8,
    dashboardAccess: 'View Only',
    vaultPermission: 'Read Only',
    linkedAccounts: 2,
    lastSyncLabel: 'Yesterday',
    casStatus: 'Pending Fix',
    joinedOn: '2021-07-01',
  },
  {
    id: 'FM-04',
    name: 'Rohan Sharma',
    relationship: 'Minor Child',
    entityType: 'Minor',
    initials: 'RS',
    panMasked: 'Not Applicable',
    status: 'Dormant',
    aum: 2000000,
    ytdReturnPct: null,
    dashboardAccess: 'Restricted',
    vaultPermission: 'No Access',
    linkedAccounts: 1,
    lastSyncLabel: '12 days ago',
    casStatus: 'Not Started',
    joinedOn: '2022-11-20',
  },
  {
    id: 'FM-05',
    name: 'Sharma Heritage Trust',
    relationship: 'Family Trust',
    entityType: 'Trust',
    initials: 'SHT',
    panMasked: 'AAATS****D',
    status: 'Active',
    aum: 15000000,
    ytdReturnPct: 8.2,
    dashboardAccess: 'Consolidated',
    vaultPermission: 'Read / Write',
    linkedAccounts: 2,
    lastSyncLabel: '2 hours ago',
    casStatus: 'Synced',
    joinedOn: '2019-02-28',
  },
  {
    id: 'FM-06',
    name: 'Sharma HUF',
    relationship: 'HUF',
    entityType: 'HUF',
    initials: 'HUF',
    panMasked: 'AABHS****N',
    status: 'Active',
    aum: 6500000,
    ytdReturnPct: 9.6,
    dashboardAccess: 'Restricted',
    vaultPermission: 'Read Only',
    linkedAccounts: 1,
    lastSyncLabel: '3 days ago',
    casStatus: 'Pending Fix',
    joinedOn: '2020-06-15',
  },
];

/** Maps a shared mock Holding's schemeId to the family member who owns that folio. */
export const HOLDING_OWNER: Record<string, string> = {
  'SCH-001': 'FM-01', // Alpha Bluechip Fund -> Vikram
  'SCH-005': 'FM-01', // Nexus Flexi Cap Fund -> Vikram
  'SCH-002': 'FM-02', // Nexus Midcap Opportunities Fund -> Ananya
  'SCH-008': 'FM-02', // Alpha ELSS Tax Saver Fund -> Ananya
  'SCH-004': 'FM-03', // Global Innovation Tech Fund -> Kavya
  'SCH-003': 'FM-06', // WealthNexus Short Term Debt Fund -> Sharma HUF
};

/** Family-level goals, reusing the shared Goal shape but scoped locally (clientId = FamilyMember.id). */
export const MOCK_FAMILY_GOALS: Goal[] = [
  {
    id: 'FGL-01',
    clientId: 'FM-04',
    name: 'Global Education Fund',
    category: 'Education',
    targetAmount: 25000000,
    currentAmount: 18000000,
    targetDate: '2028-08-01',
    monthlyInvestment: 150000,
    expectedReturn: 11,
    progressPct: 72,
  },
  {
    id: 'FGL-02',
    clientId: 'FM-05',
    name: 'Estate Planning & Trust Structuring',
    category: 'Wealth Creation',
    targetAmount: 5000000,
    currentAmount: 3000000,
    targetDate: '2027-03-01',
    monthlyInvestment: 0,
    expectedReturn: 0,
    progressPct: 60,
  },
  {
    id: 'FGL-03',
    clientId: 'FM-01',
    name: 'Coastal Second Home',
    category: 'Home',
    targetAmount: 40000000,
    currentAmount: 14000000,
    targetDate: '2030-01-01',
    monthlyInvestment: 400000,
    expectedReturn: 10,
    progressPct: 35,
  },
];
