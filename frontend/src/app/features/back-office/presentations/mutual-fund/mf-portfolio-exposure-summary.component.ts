import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';

/** Portfolio Exposure Summary — breaks the portfolio down by AMC and by fund category, useful
 * for spotting concentration risk (distinct from the broad Equity/Debt/Gold Asset Allocation report). */
@Component({
  selector: 'app-mf-portfolio-exposure-summary',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe],
  templateUrl: './mf-portfolio-exposure-summary.component.html',
})
export class MfPortfolioExposureSummaryComponent {
  readonly presentations = inject(PresentationsService);

  readonly categoryExposure = this.presentations.mfCategoryExposure;

  readonly amcExposure = computed(() => {
    const buckets = new Map<string, number>();
    for (const h of this.presentations.mfHoldings()) buckets.set(h.amc, (buckets.get(h.amc) ?? 0) + h.units * h.currentNav);
    const total = this.presentations.mfCurrentValue();
    return [...buckets.entries()].map(([amc, value]) => ({ amc, value, pct: total > 0 ? Math.round((value / total) * 100) : 0 })).sort((a, b) => b.value - a.value);
  });

  readonly topConcentration = computed(() => this.amcExposure()[0]);
}
