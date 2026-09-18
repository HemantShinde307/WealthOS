import { Holding } from '../models/domain.models';

function holding(schemeId: string, schemeName: string, category: string, units: number, avgCost: number, currentNav: number): Holding {
  const currentValue = Math.round(units * currentNav);
  const investedValue = Math.round(units * avgCost);
  const unrealizedPl = currentValue - investedValue;
  const unrealizedPlPct = Number(((unrealizedPl / investedValue) * 100).toFixed(2));
  return { schemeId, schemeName, category, units, avgCost, currentNav, currentValue, investedValue, unrealizedPl, unrealizedPlPct };
}

export const MOCK_HOLDINGS: Holding[] = [
  holding('SCH-001', 'Alpha Bluechip Fund - Direct Plan Growth', 'Large Cap', 12450.55, 145.20, 182.40),
  holding('SCH-002', 'Nexus Midcap Opportunities Fund', 'Mid Cap', 8230.10, 85.50, 112.75),
  holding('SCH-003', 'WealthNexus Short Term Debt Fund', 'Short Duration', 45100.00, 25.10, 26.85),
  holding('SCH-004', 'Global Innovation Tech Fund', 'Thematic', 5500.25, 210.00, 195.40),
  holding('SCH-005', 'Nexus Flexi Cap Fund', 'Flexi Cap', 15200.00, 68.40, 88.20),
  holding('SCH-008', 'Alpha ELSS Tax Saver Fund', 'ELSS', 9800.75, 58.10, 74.90),
];

export const MOCK_ASSET_ALLOCATION = [
  { label: 'Equity', pct: 65, colorVar: '--color-primary-container' },
  { label: 'Debt', pct: 25, colorVar: '--color-secondary' },
  { label: 'Hybrid', pct: 10, colorVar: '--color-tertiary-fixed-dim' },
];
