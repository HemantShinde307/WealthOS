import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { downloadCsv } from '../shared/chart-utils';

@Component({
  selector: 'app-ppf-challan',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent],
  templateUrl: './ppf-challan.component.html',
})
export class PpfChallanComponent {
  readonly presentations = inject(PresentationsService);

  readonly rows = computed(() =>
    this.presentations.ppfChallans().map((c) => ({ ...c, account: this.presentations.ppfAccounts().find((a) => a.id === c.ppfAccountId) })),
  );

  exportCsv(): void {
    const customer = this.presentations.selectedCustomer();
    downloadCsv(
      `PPF-Challans-${customer.name.replace(/\s+/g, '-')}.csv`,
      ['Challan No', 'PPF Account No', 'Date', 'Amount', 'Mode', 'Status'],
      this.rows().map((r) => [r.challanNo, r.account?.accountNo ?? '', r.date, r.amount, r.mode, r.status]),
    );
  }
}
