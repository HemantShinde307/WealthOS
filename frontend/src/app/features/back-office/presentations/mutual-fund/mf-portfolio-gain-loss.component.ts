import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-mf-portfolio-gain-loss',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe, ExportButtonComponent],
  templateUrl: './mf-portfolio-gain-loss.component.html',
})
export class MfPortfolioGainLossComponent {
  readonly presentations = inject(PresentationsService);

  readonly rows = computed(() =>
    this.presentations
      .mfHoldings()
      .map((h) => {
        const invested = h.units * h.avgNav;
        const current = h.units * h.currentNav;
        return { ...h, invested, current, gain: current - invested, gainPct: invested > 0 ? Number((((current - invested) / invested) * 100).toFixed(2)) : 0 };
      })
      .sort((a, b) => b.gain - a.gain),
  );

  readonly exportHeaders = ['Scheme', 'Folio No', 'Invested Value', 'Current Value', 'Gain / Loss', 'Gain / Loss (%)'];
  readonly exportRows = computed(() => this.rows().map((r) => [r.schemeName, r.folioNo, r.invested, r.current, r.gain, r.gainPct]));

  readonly gainers = computed(() => this.rows().filter((r) => r.gain >= 0));
  readonly losers = computed(() => this.rows().filter((r) => r.gain < 0));
}
