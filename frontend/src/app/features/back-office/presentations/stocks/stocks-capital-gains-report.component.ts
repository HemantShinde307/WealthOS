import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';
import { downloadCsv } from '../shared/chart-utils';

@Component({
  selector: 'app-stocks-capital-gains-report',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe],
  templateUrl: './stocks-capital-gains-report.component.html',
})
export class StocksCapitalGainsReportComponent {
  readonly presentations = inject(PresentationsService);

  readonly rows = computed(() => this.presentations.stockCapitalGains().map((g) => ({ ...g, gain: g.sellValue - g.buyValue })));
  readonly stcgTotal = computed(() => this.rows().filter((r) => r.gainType === 'STCG').reduce((s, r) => s + r.gain, 0));
  readonly ltcgTotal = computed(() => this.rows().filter((r) => r.gainType === 'LTCG').reduce((s, r) => s + r.gain, 0));

  exportCsv(): void {
    const customer = this.presentations.selectedCustomer();
    downloadCsv(
      `Stocks-Capital-Gains-${customer.name.replace(/\s+/g, '-')}.csv`,
      ['Symbol', 'Company', 'Buy Date', 'Sell Date', 'Qty', 'Buy Value', 'Sell Value', 'Gain', 'Type'],
      this.rows().map((r) => [r.symbol, r.companyName, r.buyDate, r.sellDate, r.qty, r.buyValue, r.sellValue, r.gain.toFixed(2), r.gainType]),
    );
  }
}
