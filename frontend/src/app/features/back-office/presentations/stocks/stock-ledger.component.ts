import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { downloadCsv } from '../shared/chart-utils';

@Component({
  selector: 'app-stock-ledger',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent],
  templateUrl: './stock-ledger.component.html',
})
export class StockLedgerComponent {
  readonly presentations = inject(PresentationsService);

  exportCsv(): void {
    const customer = this.presentations.selectedCustomer();
    downloadCsv(
      `Stock-Ledger-${customer.name.replace(/\s+/g, '-')}.csv`,
      ['Date', 'Symbol', 'Company', 'Type', 'Qty', 'Price', 'Brokerage', 'Net Amount'],
      this.presentations.stockTransactions().map((t) => [t.date, t.symbol, t.companyName, t.type, t.qty, t.price, t.brokerage, (t.type === 'Buy' ? -1 : 1) * (t.qty * t.price) - t.brokerage]),
    );
  }
}
