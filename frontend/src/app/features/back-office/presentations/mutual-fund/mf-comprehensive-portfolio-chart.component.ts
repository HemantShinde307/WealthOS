import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';
import { buildDonutSegments, buildLinePath, cagr, donutGradient, xirr, yearsBetween } from '../shared/chart-utils';

/** Backs both "Comprehensive Portfolio Chart" and its "(Beta)" variant — a single growth-vs-
 * invested chart plus category break-up, illustrating the full portfolio trajectory. */
@Component({
  selector: 'app-mf-comprehensive-portfolio-chart',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe],
  templateUrl: './mf-comprehensive-portfolio-chart.component.html',
})
export class MfComprehensivePortfolioChartComponent {
  readonly presentations = inject(PresentationsService);
  readonly isBeta = inject(ActivatedRoute).snapshot.data['beta'] === true;

  // Illustrative invested-vs-current trend built from the customer's actual invested/current totals.
  readonly trend = computed(() => {
    const invested = this.presentations.mfInvestedValue();
    const current = this.presentations.mfCurrentValue();
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'];
    return quarters.map((label, i) => {
      const t = (i + 1) / quarters.length;
      return { label, invested: invested * (0.4 + 0.6 * t), current: invested * (0.4 + 0.6 * t) * (1 + (current / invested - 1) * t) || 0 };
    });
  });

  readonly investedPath = computed(() => buildLinePath(this.trend().map((p) => p.invested)));
  readonly currentPath = computed(() => buildLinePath(this.trend().map((p) => p.current)));

  readonly categoryExposure = this.presentations.mfCategoryExposure;

  // Scheme-wise summary table: reuses the service's per-holding invested/current/CAGR and adds
  // absolute return % (gain ÷ invested), matching the calculation used in the Total row above.
  readonly schemeSummary = computed(() =>
    this.presentations.mfHoldingCagr().map((row) => ({
      ...row,
      absRetPct: row.invested > 0 ? Number((((row.current - row.invested) / row.invested) * 100).toFixed(2)) : 0,
    })),
  );

  readonly categorySummary = this.presentations.mfCategorySummary;

  readonly assetAllocationSegments = computed(() => buildDonutSegments(this.presentations.mfAssetAllocation()));
  readonly assetAllocationGradient = computed(() => donutGradient(this.assetAllocationSegments()));

  // Portfolio Snapshot: (a) Lump sum, (b) SIP, (c) Switch-Ins, (d) Redemptions, (e) Systematic
  // Withdrawals, (f) Switch-Outs, (g) Dividend Payouts, (h) Dividend Reinvestments — all summed
  // from this customer's real transaction log by type, exactly like the demo report's build-up.
  // (e) and (h) are legitimately 0 here since this dataset has no SWP or dividend-reinvestment
  // transaction types yet.
  readonly portfolioSnapshot = computed(() => {
    const txns = this.presentations.mfTransactions();
    const sumByType = (types: string[]) => txns.filter((t) => types.includes(t.type)).reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const a = sumByType(['Purchase']);
    const b = sumByType(['SIP Purchase']);
    const c = sumByType(['Switch In']);
    const d = sumByType(['Redemption']);
    const e = 0; // no SWP transaction type in this dataset
    const f = sumByType(['Switch Out']);
    const g = sumByType(['Dividend Payout']);
    const h = 0; // no dividend-reinvestment transaction type in this dataset
    const netInvestments = a + b + c - d - e - f - g;
    const marketValue = this.presentations.mfCurrentValue();
    const netGain = marketValue - netInvestments;
    const years = Math.max(...this.presentations.mfHoldings().map((holding) => yearsBetween(holding.startDate)), 1);

    const cashflows = [
      ...txns
        .filter((t) => ['Purchase', 'SIP Purchase', 'Switch In'].includes(t.type))
        .map((t) => ({ date: t.date, amount: -Math.abs(t.amount) })),
      ...txns
        .filter((t) => ['Redemption', 'Switch Out', 'Dividend Payout'].includes(t.type))
        .map((t) => ({ date: t.date, amount: Math.abs(t.amount) })),
      { date: this.presentations.toDate(), amount: marketValue },
    ];

    return {
      a, b, c, d, e, f, g, h,
      netInvestments,
      marketValue,
      netGain,
      absRetUnrealizedPct: netInvestments > 0 ? Number(((netGain / netInvestments) * 100).toFixed(2)) : 0,
      cagrUnrealizedPct: cagr(netInvestments, marketValue, years),
      overallAbsRetPct: this.presentations.mfGainLossPct(),
      overallXirrPct: xirr(cashflows),
    };
  });
}
