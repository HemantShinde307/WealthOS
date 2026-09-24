import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';

/** Portfolio Valuation (CAGR Report) — per-holding annualised CAGR since each folio's start
 * date, plus the blended portfolio CAGR (distinct from the SIP-specific CAGR report). */
@Component({
  selector: 'app-mf-portfolio-valuation-cagr',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe, ExportButtonComponent],
  templateUrl: './mf-portfolio-valuation-cagr.component.html',
})
export class MfPortfolioValuationCagrComponent {
  readonly presentations = inject(PresentationsService);
  readonly rows = this.presentations.mfHoldingCagr;

  readonly exportHeaders = ['Scheme', 'Folio No', 'Invested Since', 'Invested Value', 'Current Value', 'CAGR (%)'];
  readonly exportRows = computed(() => this.rows().map((r) => [r.holding.schemeName, r.holding.folioNo, r.holding.startDate, r.invested, r.current, r.cagrPct]));
}
