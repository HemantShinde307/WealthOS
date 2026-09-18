// NRI-specific domain types. These extend/complement the shared `Client` model
// (see core/models/domain.models.ts) with fields specific to cross-border NRI
// wealth management: FEMA/FATCA compliance, NRE/NRO/FCNR accounts, DTAA treaty
// benefits, and RBI repatriation tracking. Kept local to this feature per
// AGENT_CONVENTIONS.md (do not edit core/models or core/mock-data).

export interface NriBankAccount {
  type: 'NRE' | 'NRO' | 'FCNR';
  bankName: string;
  accountNoMasked: string;
  status: 'Verified' | 'Pending Penny Drop' | 'Not Linked';
  repatriable: boolean;
}

export interface ComplianceDocument {
  name: string;
  detail: string;
  status: 'Verified' | 'Pending' | 'Missing';
  actionLabel?: string;
}

export interface RepatriationRecord {
  id: string;
  date: string;
  fromAccount: 'NRE' | 'NRO';
  purpose: string;
  amountUsd: number;
  amountInr: number;
  status: 'Completed' | 'Pending 15CA/CB' | 'Pending AD Bank Submission';
}

export interface NriHolding {
  schemeName: string;
  accountType: 'NRE' | 'NRO';
  category: string;
  currentValue: number;
  returnsPct: number;
  tdsLabel: string;
}

export interface NriClientProfile {
  clientId: string;
  countryOfResidence: string;
  countryFlag: string;
  taxResidencyNumber: string;
  trcProvided: boolean;
  femaComplianceScore: number;
  femaRisk: 'Low' | 'Medium' | 'High';
  fatcaCrsStatus: 'Filed' | 'Pending';
  pisRequired: boolean;
  poaInIndia: boolean;
  accounts: NriBankAccount[];
  documents: ComplianceDocument[];
  holdings: NriHolding[];
  repatriationHistory: RepatriationRecord[];
  repatriatedThisYearUsd: number;
  annualRepatriationLimitUsd: number;
  repatriationReadyPct: number;
  estimatedTdsFy: number;
  aumNre: number;
  aumNro: number;
  tdsOptimizationTip: string;
}

export interface DtaaTreaty {
  country: string;
  flag: string;
  capitalGainsRate: number;
  interestRate: number;
  requiresTrc: boolean;
}

export interface RepatriationAssetClass {
  label: string;
  standardRate: number;
  kind: 'capitalGains' | 'interest';
}

export interface RegulatoryUpdate {
  icon: string;
  urgent: boolean;
  source: string;
  timestamp: string;
  headline: string;
}
