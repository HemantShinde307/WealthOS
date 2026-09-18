import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';

interface PeriodReturn {
  label: string;
  factor: number;
}

const PERIODS: PeriodReturn[] = [
  { label: '1 Month', factor: 0.012 },
  { label: '3 Months', factor: 0.041 },
  { label: '6 Months', factor: 0.089 },
  { label: '1 Year', factor: 0.146 },
  { label: '3 Years (CAGR)', factor: 0.128 },
  { label: 'Since Inception (CAGR)', factor: 0.152 },
];

/** Periodic Performance Report — trailing-period returns per scheme, a standard MF fact-sheet
 * style table. Returns are illustrative period factors applied per scheme's own CAGR profile. */
@Component({
  selector: 'app-mf-periodic-performance-report',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent],
  templateUrl: './mf-periodic-performance-report.component.html',
})
export class MfPeriodicPerformanceReportComponent {
  readonly presentations = inject(PresentationsService);
  readonly periods = PERIODS.map((p) => p.label);

  readonly rows = computed(() =>
    this.presentations.mfHoldings().map((h) => {
      const holdingCagr = this.presentations.mfHoldingCagr().find((c) => c.holding.id === h.id);
      const baseline = (holdingCagr?.cagrPct ?? 12) / 100;
      const returns = PERIODS.map((p) => Number(((baseline + p.factor) * 100 * (p.label.includes('Month') ? 0.4 : 1)).toFixed(2)));
      return { scheme: h.schemeName, category: h.category, returns };
    }),
  );
}
