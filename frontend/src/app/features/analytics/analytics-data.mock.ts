// Local mock data for the Advanced Analytics & Report Center module.
// Domain-specific to this module only — does not touch core/mock-data.

export interface AttributionRow {
  label: string;
  isSubRow?: boolean;
  weightPort: number;
  weightBm: number | null;
  allocation: number;
  selection: number;
  interaction: number;
  totalEffect: number;
}

export const ATTRIBUTION_ROWS: AttributionRow[] = [
  { label: 'Large & Flexi Cap Equity', weightPort: 32.5, weightBm: 28.0, allocation: 0.72, selection: 1.05, interaction: -0.08, totalEffect: 1.69 },
  { label: '↳ R. Malhotra (Alpha Bluechip)', isSubRow: true, weightPort: 18.0, weightBm: null, allocation: 0.4, selection: 0.62, interaction: -0.04, totalEffect: 0.98 },
  { label: '↳ S. Kulkarni (Nexus Flexi Cap)', isSubRow: true, weightPort: 14.5, weightBm: null, allocation: 0.32, selection: 0.43, interaction: -0.04, totalEffect: 0.71 },
  { label: 'Mid & Small Cap Equity', weightPort: 21.0, weightBm: 15.5, allocation: 0.58, selection: 0.94, interaction: -0.11, totalEffect: 1.41 },
  { label: '↳ A. Bhatt (Nexus Midcap Opportunities)', isSubRow: true, weightPort: 21.0, weightBm: null, allocation: 0.58, selection: 0.94, interaction: -0.11, totalEffect: 1.41 },
  { label: 'Thematic / Sectoral', weightPort: 8.0, weightBm: 6.0, allocation: -0.12, selection: -0.64, interaction: -0.05, totalEffect: -0.81 },
  { label: '↳ V. Rao (Global Innovation Tech)', isSubRow: true, weightPort: 8.0, weightBm: null, allocation: -0.12, selection: -0.64, interaction: -0.05, totalEffect: -0.81 },
  { label: 'Debt & Short Duration', weightPort: 28.5, weightBm: 40.0, allocation: 0.35, selection: 0.22, interaction: -0.02, totalEffect: 0.55 },
  { label: '↳ P. Deshmukh (WealthNexus Short Term Debt)', isSubRow: true, weightPort: 28.5, weightBm: null, allocation: 0.35, selection: 0.22, interaction: -0.02, totalEffect: 0.55 },
  { label: 'ELSS / Tax Saver', weightPort: 10.0, weightBm: 10.5, allocation: 0.02, selection: 0.31, interaction: -0.01, totalEffect: 0.32 },
  { label: '↳ N. Iyer (Alpha ELSS Tax Saver)', isSubRow: true, weightPort: 10.0, weightBm: null, allocation: 0.02, selection: 0.31, interaction: -0.01, totalEffect: 0.32 },
];

export interface StressScenario {
  id: string;
  label: string;
  pnlImpactPct: number;
  drawdownPct: number;
  recoveryMonths: number;
  assetImpacts: { label: string; pct: number }[];
}

export const STRESS_SCENARIOS: StressScenario[] = [
  {
    id: 'gfc-2008',
    label: '2008-Style Global Crisis',
    pnlImpactPct: -34.5,
    drawdownPct: -34.5,
    recoveryMonths: 22,
    assetImpacts: [
      { label: 'Equity', pct: -42 },
      { label: 'Mid/Small Cap', pct: -51 },
      { label: 'Debt', pct: 4 },
      { label: 'Gold', pct: 18 },
    ],
  },
  {
    id: 'covid-crash',
    label: 'COVID-19 Style Crash',
    pnlImpactPct: -28.1,
    drawdownPct: -28.1,
    recoveryMonths: 9,
    assetImpacts: [
      { label: 'Equity', pct: -35 },
      { label: 'Mid/Small Cap', pct: -40 },
      { label: 'Debt', pct: 2 },
      { label: 'Gold', pct: 12 },
    ],
  },
  {
    id: 'rate-hike',
    label: 'Rate Hike +150bps',
    pnlImpactPct: -8.4,
    drawdownPct: -8.4,
    recoveryMonths: 5,
    assetImpacts: [
      { label: 'Equity', pct: -9 },
      { label: 'Mid/Small Cap', pct: -12 },
      { label: 'Debt', pct: -6 },
      { label: 'Gold', pct: -1 },
    ],
  },
];

export const CORRELATION_ASSET_CLASSES = ['Equity', 'Debt', 'Hybrid', 'Gold', 'Cash'] as const;

// Symmetric correlation matrix aligned to CORRELATION_ASSET_CLASSES order.
export const CORRELATION_MATRIX: number[][] = [
  [1.0, -0.18, 0.62, 0.22, -0.4],
  [-0.18, 1.0, 0.15, 0.1, 0.3],
  [0.62, 0.15, 1.0, 0.18, -0.12],
  [0.22, 0.1, 0.18, 1.0, -0.08],
  [-0.4, 0.3, -0.12, -0.08, 1.0],
];

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'HNW Individuals' | 'Institutions' | 'Internal Audit';
  lastUsed: string;
  featured?: boolean;
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: 'tpl-quarterly', name: 'Quarterly Performance Report', description: 'Comprehensive breakdown of portfolio returns, asset allocation shifts, and scheme-level attribution.', category: 'HNW Individuals', lastUsed: '2 days ago', featured: true },
  { id: 'tpl-tax', name: 'Annual Tax & Capital Gains Report', description: 'Detailed ledger of realized gains/losses, dividend income, and TDS data for the financial year.', category: 'Internal Audit', lastUsed: '1 month ago' },
  { id: 'tpl-estate', name: 'HNI Estate & Succession Planning', description: 'Multi-generational wealth transfer modelling, nominee structures, and liquidity analysis.', category: 'HNW Individuals', lastUsed: '3 months ago' },
  { id: 'tpl-monthly', name: 'Monthly Summary', description: 'Quick-glance overview of folio balances, recent transactions, and short-term movements.', category: 'HNW Individuals', lastUsed: '1 week ago' },
  { id: 'tpl-institutional', name: 'Institutional Compliance Digest', description: 'AUM concentration, exposure limits, and regulatory flag summary for institutional mandates.', category: 'Institutions', lastUsed: '5 days ago' },
  { id: 'tpl-sip', name: 'SIP Performance Snapshot', description: 'SIP-wise XIRR, contribution vs. current value, and goal-linked progress tracking.', category: 'HNW Individuals', lastUsed: '4 days ago' },
];

export interface PresentationModule {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  standardized?: boolean;
  tag?: string;
}

export const PRESENTATION_MODULES: PresentationModule[] = [
  { id: 'mod-summary', name: 'Portfolio Summary', description: 'High-level allocation and overall performance vs. benchmark.', selected: true },
  { id: 'mod-attribution', name: 'Performance Attribution', description: 'Detailed breakdown of active return drivers (Brinson-Fachler).', selected: true },
  { id: 'mod-risk', name: 'Risk Metrics', description: 'Beta, standard deviation, VaR and drawdown analysis.', selected: true, standardized: true },
  { id: 'mod-goal', name: 'Goal Progress', description: 'Monte Carlo simulation against defined financial objectives.', selected: false },
  { id: 'mod-outlook', name: 'Market Outlook', description: 'Firm-wide macroeconomic commentary for the quarter.', selected: true, tag: 'Static Content' },
];

export interface ScheduledReport {
  id: string;
  clientName: string;
  reportType: string;
  frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  nextRunDate: string;
  deliveryMethod: 'Portal' | 'Email' | 'Portal & Print';
  status: 'Active' | 'Paused' | 'Error';
}

export const SCHEDULED_REPORTS: ScheduledReport[] = [
  { id: 'SCHR-01', clientName: 'The Malhotra Family Trust', reportType: 'Comprehensive Performance', frequency: 'Quarterly', nextRunDate: '2026-12-31', deliveryMethod: 'Portal', status: 'Active' },
  { id: 'SCHR-02', clientName: 'Rajesh Mehta', reportType: 'Tax Loss Harvesting Summary', frequency: 'Monthly', nextRunDate: '2026-10-01', deliveryMethod: 'Email', status: 'Active' },
  { id: 'SCHR-03', clientName: 'Kabir Enterprises Pvt Ltd', reportType: 'Fee & Commission Ledger', frequency: 'Weekly', nextRunDate: '2026-09-14', deliveryMethod: 'Portal', status: 'Paused' },
  { id: 'SCHR-04', clientName: 'Vikram Singh', reportType: 'Asset Allocation Drift', frequency: 'Monthly', nextRunDate: '2026-10-01', deliveryMethod: 'Email', status: 'Error' },
  { id: 'SCHR-05', clientName: 'Orion Logistics Ltd', reportType: 'Annual Client Review', frequency: 'Annually', nextRunDate: '2027-01-15', deliveryMethod: 'Portal & Print', status: 'Active' },
  { id: 'SCHR-06', clientName: 'Sunita Reddy', reportType: 'SIP Performance Snapshot', frequency: 'Monthly', nextRunDate: '2026-10-01', deliveryMethod: 'Portal', status: 'Active' },
];

export const PRESENTATION_PAGES: { title: string; subtitle: string }[] = [
  { title: 'Cover', subtitle: 'Client & period cover page' },
  { title: 'Executive Summary', subtitle: 'Key highlights & commentary' },
  { title: 'Performance', subtitle: 'Growth vs. benchmark' },
  { title: 'Asset Allocation', subtitle: 'Current portfolio mix' },
  { title: 'Attribution', subtitle: 'Allocation vs. selection effect' },
  { title: 'Risk Disclosure', subtitle: 'Standard disclaimers' },
];
