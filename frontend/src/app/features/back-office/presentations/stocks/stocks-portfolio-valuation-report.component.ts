import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';
import { downloadCsv } from '../shared/chart-utils';

@Component({
  selector: 'app-stocks-portfolio-valuation-report',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe],
  templateUrl: './stocks-portfolio-valuation-report.component.html',
})
export class StocksPortfolioValuationReportComponent {
  readonly presentations = inject(PresentationsService);

  readonly rows = computed(() =>
    this.presentations.stockHoldings().map((h) => {
      const invested = h.qty * h.avgPrice;
      const current = h.qty * h.ltp;
      return { ...h, invested, current, gain: current - invested, gainPct: invested > 0 ? Number((((current - invested) / invested) * 100).toFixed(2)) : 0 };
    }),
  );

  readonly bySector = computed(() => {
    const buckets = new Map<string, number>();
    for (const r of this.rows()) buckets.set(r.sector, (buckets.get(r.sector) ?? 0) + r.current);
    const total = this.presentations.stockCurrentValue();
    return [...buckets.entries()].map(([sector, value]) => ({ sector, value, pct: total > 0 ? Math.round((value / total) * 100) : 0 })).sort((a, b) => b.value - a.value);
  });

  exportCsv(): void {
    const customer = this.presentations.selectedCustomer();
    downloadCsv(
      `Stocks-Portfolio-Valuation-${customer.name.replace(/\s+/g, '-')}.csv`,
      ['Symbol', 'Company', 'Sector', 'Qty', 'Avg Price', 'LTP', 'Invested Value', 'Current Value', 'Gain/Loss', 'Gain %'],
      this.rows().map((r) => [r.symbol, r.companyName, r.sector, r.qty, r.avgPrice, r.ltp, r.invested.toFixed(2), r.current.toFixed(2), r.gain.toFixed(2), r.gainPct]),
    );
  }
}
