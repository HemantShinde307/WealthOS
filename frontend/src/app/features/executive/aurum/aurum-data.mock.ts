// Local aggregate mock data for the Executive Alpha "Aurum" (gold business) rollup.
// The Aurum module has no dedicated shared service yet, so these platform-level
// aggregates are kept here rather than touching core/mock-data per AGENT_CONVENTIONS.
// Individual client gold holdings still come from the real digital-gold transactions
// in TransactionService (see aurum.component.ts) — only the platform-wide totals below
// are invented, since no service currently rolls that up.

export const AURUM_GOLD_RATE_PER_GRAM = 7842; // kept consistent with the investor Digital Gold screen

export const AURUM_SUMMARY = {
  totalGoldAumGrams: 108_400, // ~108.4 Kg across the platform
  activeGoldSipInvestors: 3140,
  totalDigitalGoldInvestors: 8460,
  avgHoldingGramsPerInvestor: 12.8,
};

export const AURUM_MONTHLY_TREND = [
  { month: 'Apr', aumGrams: 88_200 },
  { month: 'May', aumGrams: 91_600 },
  { month: 'Jun', aumGrams: 95_100 },
  { month: 'Jul', aumGrams: 99_800 },
  { month: 'Aug', aumGrams: 104_300 },
  { month: 'Sep', aumGrams: 108_400 },
];
