export interface Jurisdiction {
  code: string;
  label: string;
  regulator: string;
  status: 'compliant' | 'action-required';
  readinessPct: number;
  pendingUbo: number;
  riskAlerts: number;
  riskRatingLogic: string;
}

export type RequirementStatus = 'met' | 'action-required' | 'active-rule';

export interface ComplianceRequirement {
  id: string;
  jurisdictionCode: string;
  title: string;
  description: string;
  status: RequirementStatus;
  tags: string[];
  lastUpdated?: string;
  ruleVersion?: string;
}

export interface RequiredDocument {
  id: string;
  jurisdictionCode: string;
  name: string;
  note: string;
  icon: string;
}

export const JURISDICTIONS: Jurisdiction[] = [
  {
    code: 'SG',
    label: 'Singapore - MAS Compliance',
    regulator: 'MAS',
    status: 'compliant',
    readinessPct: 94,
    pendingUbo: 12,
    riskAlerts: 3,
    riskRatingLogic: `if (client.country_of_incorporation == 'High_Risk_List') {
  rating = 'HIGH';
  trigger_edd();
} else if (client.pep_status == true) {
  rating = 'HIGH';
  require_senior_management_approval();
} else {
  rating = calculate_base_risk(client);
}`,
  },
  {
    code: 'UK',
    label: 'UK - FCA Regulatory',
    regulator: 'FCA',
    status: 'action-required',
    readinessPct: 78,
    pendingUbo: 24,
    riskAlerts: 6,
    riskRatingLogic: `if (client.sanctions_hit == true) {
  rating = 'HIGH';
  freeze_account();
} else if (client.aum_gbp > 5_000_000) {
  rating = 'ELEVATED';
  require_senior_management_approval();
} else {
  rating = calculate_base_risk(client);
}`,
  },
  {
    code: 'US',
    label: 'USA - SEC/FINRA Standards',
    regulator: 'SEC/FINRA',
    status: 'compliant',
    readinessPct: 91,
    pendingUbo: 5,
    riskAlerts: 1,
    riskRatingLogic: `if (client.is_us_person && !client.w9_on_file) {
  rating = 'HIGH';
  request_w9();
} else if (client.pep_status == true) {
  rating = 'HIGH';
  require_senior_management_approval();
} else {
  rating = calculate_base_risk(client);
}`,
  },
  {
    code: 'EU',
    label: 'EU - MiFID II Framework',
    regulator: 'MiFID II',
    status: 'compliant',
    readinessPct: 88,
    pendingUbo: 9,
    riskAlerts: 2,
    riskRatingLogic: `if (client.suitability_assessment_expired) {
  rating = 'REVIEW_REQUIRED';
  request_reassessment();
} else if (client.pep_status == true) {
  rating = 'HIGH';
  require_senior_management_approval();
} else {
  rating = calculate_base_risk(client);
}`,
  },
];

export const COMPLIANCE_REQUIREMENTS: ComplianceRequirement[] = [
  {
    id: 'sg-1',
    jurisdictionCode: 'SG',
    title: 'UBO Identification (Ultimate Beneficial Owner)',
    description: 'Require ≥25% ownership disclosure for all corporate entities registered in SG.',
    status: 'met',
    tags: ['Corp Accounts', 'Trusts'],
    lastUpdated: '2026-08-12',
  },
  {
    id: 'sg-2',
    jurisdictionCode: 'SG',
    title: 'FATCA / CRS Reporting',
    description: 'Annual tax reporting configuration requires review due to recent MAS circular.',
    status: 'action-required',
    tags: ['Action Required'],
  },
  {
    id: 'sg-3',
    jurisdictionCode: 'SG',
    title: 'AML / KYC Tiering',
    description: 'Risk-based approach logic mapped. Enhanced Due Diligence (EDD) triggered for high-risk ratings.',
    status: 'active-rule',
    tags: [],
    ruleVersion: 'V2.4',
  },
  {
    id: 'uk-1',
    jurisdictionCode: 'UK',
    title: 'Consumer Duty Outcomes',
    description: 'Annual attestation of fair-value assessments across all retail fund ranges is overdue.',
    status: 'action-required',
    tags: ['Action Required'],
  },
  {
    id: 'uk-2',
    jurisdictionCode: 'UK',
    title: 'Senior Managers Regime (SMCR)',
    description: 'Statements of responsibility on file for all certified functions.',
    status: 'met',
    tags: ['Governance'],
    lastUpdated: '2026-06-30',
  },
  {
    id: 'uk-3',
    jurisdictionCode: 'UK',
    title: 'AML / KYC Tiering',
    description: 'Risk-based approach logic mapped per FCA guidance FG-2023-05.',
    status: 'active-rule',
    tags: [],
    ruleVersion: 'V1.8',
  },
  {
    id: 'us-1',
    jurisdictionCode: 'US',
    title: 'W-9 / W-8BEN Certification',
    description: 'Tax status certification on file for all US and non-US persons.',
    status: 'met',
    tags: ['Tax'],
    lastUpdated: '2026-07-21',
  },
  {
    id: 'us-2',
    jurisdictionCode: 'US',
    title: 'Reg BI Best Interest Disclosure',
    description: 'Client relationship summary (Form CRS) delivered and acknowledged.',
    status: 'met',
    tags: ['Disclosure'],
    lastUpdated: '2026-05-02',
  },
  {
    id: 'eu-1',
    jurisdictionCode: 'EU',
    title: 'Suitability Assessment',
    description: 'Periodic suitability reassessment required every 24 months for advisory mandates.',
    status: 'action-required',
    tags: ['Action Required'],
  },
  {
    id: 'eu-2',
    jurisdictionCode: 'EU',
    title: 'SFDR Sustainability Disclosures',
    description: 'Article 8/9 fund classifications published and up to date.',
    status: 'met',
    tags: ['ESG'],
    lastUpdated: '2026-04-15',
  },
];

export const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  { id: 'doc-sg-1', jurisdictionCode: 'SG', name: 'W-8BEN-E Form', note: 'Mandatory for non-US entities', icon: 'description' },
  { id: 'doc-sg-2', jurisdictionCode: 'SG', name: 'ACRA BizFile+ Extract', note: 'Corporate registry proof (SG)', icon: 'badge' },
  { id: 'doc-uk-1', jurisdictionCode: 'UK', name: 'Companies House Extract', note: 'Corporate registry proof (UK)', icon: 'badge' },
  { id: 'doc-uk-2', jurisdictionCode: 'UK', name: 'FCA Fitness & Propriety Attestation', note: 'Required for certified staff', icon: 'description' },
  { id: 'doc-us-1', jurisdictionCode: 'US', name: 'Form W-9', note: 'US tax status certification', icon: 'description' },
  { id: 'doc-eu-1', jurisdictionCode: 'EU', name: 'MiFID II Suitability Questionnaire', note: 'Advisory mandate onboarding', icon: 'description' },
];
