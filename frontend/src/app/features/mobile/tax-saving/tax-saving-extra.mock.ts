// Small local supplement to the shared scheme mock data — illustrative extra ELSS options
// for the mobile 80C recommendation list. The shared MOCK_SCHEMES only carries one ELSS
// scheme (already held), so a couple of additional read-only entries live here rather than
// editing core/mock-data (per AGENT_CONVENTIONS, shared mock files are off-limits).
export interface RecommendedTaxScheme {
  id: string;
  name: string;
  amc: string;
  riskLevel: string;
  returns3y: number;
}

export const RECOMMENDED_ELSS_SCHEMES: RecommendedTaxScheme[] = [
  { id: 'REC-ELSS-1', name: 'Quant Tax Plan', amc: 'Quant Mutual Fund', riskLevel: 'Aggressive', returns3y: 24.1 },
  { id: 'REC-ELSS-2', name: 'SBI Long Term Equity Fund', amc: 'SBI Mutual Fund', riskLevel: 'Stable', returns3y: 16.8 },
];
