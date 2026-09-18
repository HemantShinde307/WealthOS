import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';
import { downloadCsv } from '../shared/chart-utils';

@Component({
  selector: 'app-mf-capital-gains-report',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe],
  templateUrl: './mf-capital-gains-report.component.html',
})
export class MfCapitalGainsReportComponent {
  readonly presentations = inject(PresentationsService);

  readonly rows = computed(() => this.presentations.mfCapitalGains().map((g) => ({ ...g, gain: g.saleValue - g.purchaseValue })));
  readonly stcgTotal = computed(() => this.rows().filter((r) => r.gainType === 'STCG').reduce((s, r) => s + r.gain, 0));
  readonly ltcgTotal = computed(() => this.rows().filter((r) => r.gainType === 'LTCG').reduce((s, r) => s + r.gain, 0));

  exportCsv(): void {
    const customer = this.presentations.selectedCustomer();
    downloadCsv(
      `MF-Capital-Gains-Report-${customer.name.replace(/\s+/g, '-')}.csv`,
      ['Scheme', 'Folio No', 'Purchase Date', 'Sale Date', 'Units', 'Purchase Value', 'Sale Value', 'Gain', 'Type'],
      this.rows().map((r) => [r.schemeName, r.folioNo, r.purchaseDate, r.saleDate, r.units, r.purchaseValue, r.saleValue, r.gain.toFixed(2), r.gainType]),
    );
  }
}
