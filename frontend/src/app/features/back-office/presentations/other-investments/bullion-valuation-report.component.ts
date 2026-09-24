import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-bullion-valuation-report',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe, ExportButtonComponent],
  templateUrl: './bullion-valuation-report.component.html',
})
export class BullionValuationReportComponent {
  readonly presentations = inject(PresentationsService);

  readonly rows = computed(() =>
    this.presentations.bullionHoldings().map((b) => {
      const invested = b.grams * b.purchaseRatePerGram;
      const current = b.grams * b.currentRatePerGram;
      return { ...b, invested, current, gain: current - invested, gainPct: invested > 0 ? Number((((current - invested) / invested) * 100).toFixed(2)) : 0 };
    }),
  );

  readonly exportHeaders = ['Metal', 'Form', 'Purchase Date', 'Grams', 'Purchase Rate/g', 'Current Rate/g', 'Invested Value', 'Current Value', 'Gain / Loss', 'Gain / Loss (%)'];
  readonly exportRows = computed(() =>
    this.rows().map((r) => [r.metal, r.form, r.purchaseDate, r.grams, r.purchaseRatePerGram, r.currentRatePerGram, r.invested, r.current, r.gain, r.gainPct]),
  );

  readonly totalInvested = computed(() => this.rows().reduce((s, r) => s + r.invested, 0));
  readonly totalCurrent = computed(() => this.rows().reduce((s, r) => s + r.current, 0));
  readonly totalGoldGrams = computed(() => this.rows().filter((r) => r.metal === 'Gold').reduce((s, r) => s + r.grams, 0));
  readonly totalSilverGrams = computed(() => this.rows().filter((r) => r.metal === 'Silver').reduce((s, r) => s + r.grams, 0));
}
