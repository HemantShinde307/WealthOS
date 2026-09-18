import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';
import { buildDonutSegments, donutGradient, downloadCsv } from '../shared/chart-utils';

/** Backs both "Portfolio Valuation Summary" and its "(Beta)" variant — same computation,
 * the beta route just flags a banner and is the vehicle for a newer summary-card layout. */
@Component({
  selector: 'app-mf-portfolio-valuation-summary',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe],
  templateUrl: './mf-portfolio-valuation-summary.component.html',
})
export class MfPortfolioValuationSummaryComponent {
  readonly presentations = inject(PresentationsService);
  readonly isBeta = inject(ActivatedRoute).snapshot.data['beta'] === true;

  readonly rows = computed(() =>
    this.presentations.mfHoldings().map((h) => {
      const invested = h.units * h.avgNav;
      const current = h.units * h.currentNav;
      return { ...h, invested, current, gain: current - invested, gainPct: invested > 0 ? Number((((current - invested) / invested) * 100).toFixed(2)) : 0 };
    }),
  );

  readonly segments = computed(() => buildDonutSegments(this.presentations.mfAssetAllocation()));
  readonly gradient = computed(() => donutGradient(this.segments()));

  exportCsv(): void {
    const customer = this.presentations.selectedCustomer();
    downloadCsv(
      `MF-Portfolio-Valuation-Summary${this.isBeta ? '-Beta' : ''}-${customer.name.replace(/\s+/g, '-')}.csv`,
      ['Folio No', 'Scheme', 'Category', 'Units', 'Avg NAV', 'Current NAV', 'Invested Value', 'Current Value', 'Gain/Loss', 'Gain %'],
      this.rows().map((r) => [r.folioNo, r.schemeName, r.category, r.units.toFixed(3), r.avgNav.toFixed(2), r.currentNav.toFixed(2), r.invested.toFixed(2), r.current.toFixed(2), r.gain.toFixed(2), r.gainPct]),
    );
  }
}
