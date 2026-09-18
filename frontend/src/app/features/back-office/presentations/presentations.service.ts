import { Injectable, computed, signal } from '@angular/core';
import {
  BULLION_HOLDINGS,
  FD_RD_INVESTMENTS,
  GI_POLICIES,
  MF_CAPITAL_GAINS,
  MF_GOALS,
  MF_HOLDINGS,
  MF_SYSTEMATIC_PLANS,
  MF_TRANSACTIONS,
  PPF_ACCOUNTS,
  PPF_CHALLANS,
  PPF_CONTRIBUTIONS,
  PRESENTATION_CUSTOMERS,
  STOCK_CAPITAL_GAINS,
  STOCK_HOLDINGS,
  STOCK_TRANSACTIONS,
} from './presentations-data.mock';
import { AllocationSlice, cagr, yearsBetween } from './shared/chart-utils';

/** Shared state for the whole Portfolio Presentations reports area — which customer is being
 * reported on, plus the "as of" statement date range used by ledger/statement-style reports.
 * Every report screen reads its slice of mock data through this service so switching the
 * customer selector updates every table/chart consistently. */
@Injectable({ providedIn: 'root' })
export class PresentationsService {
  readonly customers = PRESENTATION_CUSTOMERS;

  readonly selectedCustomerId = signal(PRESENTATION_CUSTOMERS[0].id);
  readonly selectedCustomer = computed(() => this.customers.find((c) => c.id === this.selectedCustomerId()) ?? this.customers[0]);

  readonly fromDate = signal('2024-04-01');
  readonly toDate = signal(new Date().toISOString().slice(0, 10));

  selectCustomer(id: string): void {
    this.selectedCustomerId.set(id);
  }

  setDateRange(from: string, to: string): void {
    this.fromDate.set(from);
    this.toDate.set(to);
  }

  // --- Mutual Funds -----------------------------------------------------
  readonly mfHoldings = computed(() => MF_HOLDINGS.filter((h) => h.customerId === this.selectedCustomerId()));
  readonly mfTransactions = computed(() => MF_TRANSACTIONS.filter((t) => t.customerId === this.selectedCustomerId()).sort((a, b) => b.date.localeCompare(a.date)));
  readonly mfSystematicPlans = computed(() => MF_SYSTEMATIC_PLANS.filter((p) => p.customerId === this.selectedCustomerId()));
  readonly mfCapitalGains = computed(() => MF_CAPITAL_GAINS.filter((g) => g.customerId === this.selectedCustomerId()));
  readonly mfGoals = computed(() => MF_GOALS.filter((g) => g.customerId === this.selectedCustomerId()));

  readonly mfInvestedValue = computed(() => this.mfHoldings().reduce((sum, h) => sum + h.units * h.avgNav, 0));
  readonly mfCurrentValue = computed(() => this.mfHoldings().reduce((sum, h) => sum + h.units * h.currentNav, 0));
  readonly mfGainLoss = computed(() => this.mfCurrentValue() - this.mfInvestedValue());
  readonly mfGainLossPct = computed(() => (this.mfInvestedValue() > 0 ? Number(((this.mfGainLoss() / this.mfInvestedValue()) * 100).toFixed(2)) : 0));

  readonly mfAssetAllocation = computed<AllocationSlice[]>(() => {
    const colors: Record<string, string> = {
      Equity: '--color-primary-container',
      Debt: '--color-secondary',
      Hybrid: '--color-tertiary-fixed-dim',
      Gold: '--color-secondary-fixed-dim',
      Liquid: '--color-outline',
    };
    const buckets: Record<string, number> = {};
    for (const h of this.mfHoldings()) {
      buckets[h.assetClass] = (buckets[h.assetClass] ?? 0) + h.units * h.currentNav;
    }
    return Object.entries(buckets).map(([label, value]) => ({ label, value, colorVar: colors[label] ?? '--color-outline-variant' }));
  });

  /** Category-level exposure (fund category rather than broad asset class) for the exposure summary report. */
  readonly mfCategoryExposure = computed(() => {
    const buckets = new Map<string, number>();
    for (const h of this.mfHoldings()) {
      buckets.set(h.category, (buckets.get(h.category) ?? 0) + h.units * h.currentNav);
    }
    const total = this.mfCurrentValue();
    return [...buckets.entries()]
      .map(([category, value]) => ({ category, value, pct: total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0 }))
      .sort((a, b) => b.value - a.value);
  });

  /** Fund category-wise summary (Invested / Present / Gain / Abs. Ret. / CAGR / Alloc.) — same
   * grouping as mfCategoryExposure but with the full gain/return columns for the Comprehensive
   * Portfolio Chart's category table. */
  readonly mfCategorySummary = computed(() => {
    const buckets = new Map<string, { invested: number; current: number; maxYears: number }>();
    for (const h of this.mfHoldings()) {
      const invested = h.units * h.avgNav;
      const current = h.units * h.currentNav;
      const b = buckets.get(h.category) ?? { invested: 0, current: 0, maxYears: 0 };
      b.invested += invested;
      b.current += current;
      b.maxYears = Math.max(b.maxYears, yearsBetween(h.startDate));
      buckets.set(h.category, b);
    }
    const totalCurrent = this.mfCurrentValue();
    return [...buckets.entries()]
      .map(([category, b]) => ({
        category,
        invested: b.invested,
        current: b.current,
        gain: b.current - b.invested,
        absRetPct: b.invested > 0 ? Number((((b.current - b.invested) / b.invested) * 100).toFixed(2)) : 0,
        cagrPct: cagr(b.invested, b.current, b.maxYears),
        allocPct: totalCurrent > 0 ? Number(((b.current / totalCurrent) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.current - a.current);
  });

  readonly mfHoldingCagr = computed(() =>
    this.mfHoldings().map((h) => {
      const invested = h.units * h.avgNav;
      const current = h.units * h.currentNav;
      return { holding: h, invested, current, years: yearsBetween(h.startDate), cagrPct: cagr(invested, current, yearsBetween(h.startDate)) };
    }),
  );

  readonly mfPortfolioCagr = computed(() => {
    const years = Math.max(...this.mfHoldings().map((h) => yearsBetween(h.startDate)), 1);
    return cagr(this.mfInvestedValue(), this.mfCurrentValue(), years);
  });

  // --- Stocks -------------------------------------------------------------
  readonly stockHoldings = computed(() => STOCK_HOLDINGS.filter((s) => s.customerId === this.selectedCustomerId()));
  readonly stockTransactions = computed(() => STOCK_TRANSACTIONS.filter((t) => t.customerId === this.selectedCustomerId()).sort((a, b) => b.date.localeCompare(a.date)));
  readonly stockCapitalGains = computed(() => STOCK_CAPITAL_GAINS.filter((g) => g.customerId === this.selectedCustomerId()));

  readonly stockInvestedValue = computed(() => this.stockHoldings().reduce((sum, s) => sum + s.qty * s.avgPrice, 0));
  readonly stockCurrentValue = computed(() => this.stockHoldings().reduce((sum, s) => sum + s.qty * s.ltp, 0));
  readonly stockGainLoss = computed(() => this.stockCurrentValue() - this.stockInvestedValue());

  // --- General Insurance ----------------------------------------------------
  readonly giPolicies = computed(() => GI_POLICIES.filter((p) => p.customerId === this.selectedCustomerId()));

  // --- FD / RD / Bonds --------------------------------------------------
  readonly fdRdInvestments = computed(() => FD_RD_INVESTMENTS.filter((f) => f.customerId === this.selectedCustomerId()));
  readonly fdRdCurrentValue = computed(() =>
    this.fdRdInvestments().reduce((sum, f) => {
      const years = yearsBetween(f.startDate);
      const principal = f.principal || (f.installmentAmount ?? 0) * (f.tenureMonths / 12) * 6;
      const projected = principal * Math.pow(1 + f.rate / 100, years);
      return sum + Math.min(projected, f.maturityValue);
    }, 0),
  );

  // --- PPF ------------------------------------------------------------------
  readonly ppfAccounts = computed(() => PPF_ACCOUNTS.filter((p) => p.customerId === this.selectedCustomerId()));
  readonly ppfContributions = (accountId: string) => PPF_CONTRIBUTIONS.filter((c) => c.ppfAccountId === accountId).sort((a, b) => a.financialYear.localeCompare(b.financialYear));
  readonly ppfChallans = computed(() => PPF_CHALLANS.filter((c) => c.customerId === this.selectedCustomerId()));
  readonly ppfBalance = computed(() => this.ppfAccounts().reduce((sum, p) => sum + p.currentBalance, 0));

  // --- Bullion --------------------------------------------------------------
  readonly bullionHoldings = computed(() => BULLION_HOLDINGS.filter((b) => b.customerId === this.selectedCustomerId()));
  readonly bullionInvestedValue = computed(() => this.bullionHoldings().reduce((sum, b) => sum + b.grams * b.purchaseRatePerGram, 0));
  readonly bullionCurrentValue = computed(() => this.bullionHoldings().reduce((sum, b) => sum + b.grams * b.currentRatePerGram, 0));

  // --- Consolidated (all asset classes) --------------------------------------
  readonly giSumInsuredTotal = computed(() => this.giPolicies().reduce((sum, p) => sum + p.sumInsured, 0));

  readonly totalWealth = computed(
    () => this.mfCurrentValue() + this.stockCurrentValue() + this.fdRdCurrentValue() + this.ppfBalance() + this.bullionCurrentValue(),
  );

  readonly consolidatedAllocation = computed<AllocationSlice[]>(() => [
    { label: 'Mutual Funds', value: this.mfCurrentValue(), colorVar: '--color-primary-container' },
    { label: 'Direct Equity', value: this.stockCurrentValue(), colorVar: '--color-secondary' },
    { label: 'FDs / RDs / Bonds', value: this.fdRdCurrentValue(), colorVar: '--color-primary-fixed-dim' },
    { label: 'PPF', value: this.ppfBalance(), colorVar: '--color-tertiary-fixed-dim' },
    { label: 'Bullion', value: this.bullionCurrentValue(), colorVar: '--color-secondary-fixed-dim' },
  ]);
}
