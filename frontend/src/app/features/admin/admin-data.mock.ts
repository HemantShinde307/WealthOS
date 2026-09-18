// Admin & Compliance Console — local mock data for concerns that have no shared
// domain model (document vault filings, regulatory report templates, compliance
// calendar, platform-level AUM trend). Deliberately kept local per AGENT_CONVENTIONS
// (do not edit core/mock-data or core/services). Cross-references real client IDs
// from core/mock-data/clients.mock.ts (CL-1001..CL-1012) so the Document Vault can
// join against ClientService for name/KYC status.

export interface PlatformAumPoint {
  month: string;
  aumCr: number;
  netFlowCr: number;
}

export const PLATFORM_AUM_TREND: PlatformAumPoint[] = [
  { month: 'Apr', aumCr: 212.4, netFlowCr: 8.1 },
  { month: 'May', aumCr: 219.8, netFlowCr: 9.4 },
  { month: 'Jun', aumCr: 226.1, netFlowCr: 7.2 },
  { month: 'Jul', aumCr: 233.9, netFlowCr: 10.6 },
  { month: 'Aug', aumCr: 239.5, netFlowCr: 6.8 },
  { month: 'Sep', aumCr: 245.8, netFlowCr: 12.4 },
];

export interface DocumentCategory {
  id: string;
  label: string;
  icon: string;
  count: number;
}

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { id: 'client-agreements', label: 'Client Agreements', icon: 'folder_shared', count: 142 },
  { id: 'identity-proofs', label: 'Identity Proofs', icon: 'badge', count: 89 },
  { id: 'income-declarations', label: 'Income Declarations', icon: 'receipt_long', count: 215 },
  { id: 'financial-profiling', label: 'Financial Profiling', icon: 'assessment', count: 56 },
];

export type AgreementStatus = 'Signed' | 'Pending' | 'Expired';

export interface ClientAgreementOverlay {
  clientId: string;
  agreementStatus: AgreementStatus;
  updatedOn: string;
  fileName: string;
  fileSizeLabel: string;
  uploadedBy: string;
}

// Keyed by real client IDs from clients.mock.ts — joined with ClientService in the component.
export const CLIENT_AGREEMENT_OVERLAYS: ClientAgreementOverlay[] = [
  { clientId: 'CL-1001', agreementStatus: 'Signed', updatedOn: '2026-09-04', fileName: 'CL-1001_Master_Agreement_2026.pdf', fileSizeLabel: '2.4 MB', uploadedBy: 'A. Deshmukh' },
  { clientId: 'CL-1005', agreementStatus: 'Pending', updatedOn: '2026-09-01', fileName: 'CL-1005_Corporate_Agreement.pdf', fileSizeLabel: '3.1 MB', uploadedBy: 'R. Kulkarni' },
  { clientId: 'CL-1008', agreementStatus: 'Expired', updatedOn: '2026-06-15', fileName: 'CL-1008_Trust_Deed_Agreement.pdf', fileSizeLabel: '5.8 MB', uploadedBy: 'K. Rao' },
  { clientId: 'CL-1012', agreementStatus: 'Signed', updatedOn: '2026-08-30', fileName: 'CL-1012_Corporate_Agreement.pdf', fileSizeLabel: '2.9 MB', uploadedBy: 'A. Deshmukh' },
  { clientId: 'CL-1010', agreementStatus: 'Signed', updatedOn: '2026-08-22', fileName: 'CL-1010_Master_Agreement_2026.pdf', fileSizeLabel: '2.1 MB', uploadedBy: 'R. Kulkarni' },
  { clientId: 'CL-1004', agreementStatus: 'Pending', updatedOn: '2026-08-18', fileName: 'CL-1004_Master_Agreement_2026.pdf', fileSizeLabel: '2.0 MB', uploadedBy: 'K. Rao' },
];

export interface RegulatoryReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  formats: string[];
}

export const REGULATORY_REPORT_TEMPLATES: RegulatoryReportTemplate[] = [
  {
    id: 'trail-commission',
    name: 'Quarterly Trail Commission Report',
    description: 'Detailed breakdown of trail payouts across all distributor networks as mandated by SEBI circular.',
    icon: 'account_tree',
    formats: ['PDF', 'CSV'],
  },
  {
    id: 'aum-disclosure',
    name: 'Monthly AUM Disclosure',
    description: 'Asset under management compilation categorized by scheme type, required for exchange filings.',
    icon: 'bar_chart',
    formats: ['PDF', 'XBRL', 'CSV'],
  },
  {
    id: 'transaction-audit-log',
    name: 'Transaction Log for Audit',
    description: 'Complete, immutable ledger of all processed transactions for internal and external audit.',
    icon: 'receipt_long',
    formats: ['CSV', 'Locked'],
  },
];

export type FilingStatus = 'Uploaded' | 'Pending Review' | 'Validation Failed' | 'Processing';

export interface RegulatoryFiling {
  reportId: string;
  templateId: string;
  templateName: string;
  period: string;
  generatedOn: string;
  status: FilingStatus;
}

export const REGULATORY_FILINGS: RegulatoryFiling[] = [
  { reportId: 'REP-9921', templateId: 'trail-commission', templateName: 'Quarterly Trail Commission', period: 'Q3 2026', generatedOn: '2026-09-06 09:41 AM', status: 'Uploaded' },
  { reportId: 'REP-9922', templateId: 'aum-disclosure', templateName: 'Monthly AUM Disclosure (XBRL)', period: 'Aug 2026', generatedOn: '2026-09-05 10:12 AM', status: 'Pending Review' },
  { reportId: 'REP-9845', templateId: 'transaction-audit-log', templateName: 'Transaction Log for Audit', period: 'H1 2026', generatedOn: '2026-08-30 02:30 PM', status: 'Uploaded' },
  { reportId: 'REP-9812', templateId: 'trail-commission', templateName: 'Quarterly Trail Commission', period: 'Q2 2026', generatedOn: '2026-07-15 10:45 AM', status: 'Validation Failed' },
  { reportId: 'REP-9790', templateId: 'aum-disclosure', templateName: 'Monthly AUM Disclosure (XBRL)', period: 'Jul 2026', generatedOn: '2026-08-05 11:02 AM', status: 'Uploaded' },
];

export type CalendarSeverity = 'high' | 'medium' | 'low';

export interface ComplianceCalendarEvent {
  id: string;
  title: string;
  dueLabel: string;
  description: string;
  severity: CalendarSeverity;
}

export const COMPLIANCE_CALENDAR: ComplianceCalendarEvent[] = [
  { id: 'CAL-1', title: 'SEBI Q3 Report', dueLabel: 'Tomorrow', description: 'Quarterly compliance submission for institutional trading desk.', severity: 'high' },
  { id: 'CAL-2', title: 'KYC Bulk Renewal', dueLabel: 'Sep 18', description: 'Phase 2 HNI client documentation refresh.', severity: 'medium' },
  { id: 'CAL-3', title: 'Internal Audit', dueLabel: 'Sep 25', description: 'Pre-screening for annual compliance review.', severity: 'low' },
];

export interface FilingTrendPoint {
  month: string;
  filings: number;
  healthScorePct: number;
}

export const FILING_HEALTH_TREND: FilingTrendPoint[] = [
  { month: 'Apr', filings: 48, healthScorePct: 38 },
  { month: 'May', filings: 68, healthScorePct: 35 },
  { month: 'Jun', filings: 30, healthScorePct: 10 },
  { month: 'Jul', filings: 78, healthScorePct: 65 },
  { month: 'Aug', filings: 58, healthScorePct: 32 },
  { month: 'Sep', filings: 75, healthScorePct: 46 },
];

// Reconciliation breaks have no shared domain model — kept as a small static
// mock surfaced on the Admin Dashboard's "Action Required" panel.
export const RECONCILIATION_BREAKS = {
  count: 12,
  detail: 'RTA mismatch detected in HDFC AMC.',
};

export const AGREEMENT_EXPIRY_COUNT = CLIENT_AGREEMENT_OVERLAYS.filter((a) => a.agreementStatus === 'Expired').length;
