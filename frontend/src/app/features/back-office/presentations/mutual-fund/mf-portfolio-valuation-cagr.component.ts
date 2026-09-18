import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';

/** Portfolio Valuation (CAGR Report) — per-holding annualised CAGR since each folio's start
 * date, plus the blended portfolio CAGR (distinct from the SIP-specific CAGR report). */
@Component({
  selector: 'app-mf-portfolio-valuation-cagr',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe],
  templateUrl: './mf-portfolio-valuation-cagr.component.html',
})
export class MfPortfolioValuationCagrComponent {
  readonly presentations = inject(PresentationsService);
  readonly rows = this.presentations.mfHoldingCagr;
}
