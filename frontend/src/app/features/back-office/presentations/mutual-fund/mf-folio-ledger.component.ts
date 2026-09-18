import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { downloadCsv } from '../shared/chart-utils';

@Component({
  selector: 'app-mf-folio-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportHeaderComponent],
  templateUrl: './mf-folio-ledger.component.html',
})
export class MfFolioLedgerComponent {
  readonly presentations = inject(PresentationsService);

  readonly folios = computed(() => [...new Set(this.presentations.mfHoldings().map((h) => h.folioNo))]);
  readonly selectedFolio = signal<string | 'All'>('All');

  readonly rows = computed(() => {
    const folio = this.selectedFolio();
    return this.presentations.mfTransactions().filter((t) => folio === 'All' || t.folioNo === folio);
  });

  exportCsv(): void {
    const customer = this.presentations.selectedCustomer();
    downloadCsv(
      `MF-Folio-Ledger-${customer.name.replace(/\s+/g, '-')}.csv`,
      ['Date', 'Folio No', 'Scheme', 'Type', 'Amount', 'Units', 'NAV', 'Balance Units'],
      this.rows().map((t) => [t.date, t.folioNo, t.schemeName, t.type, t.amount, t.units, t.nav, t.balanceUnits]),
    );
  }
}
