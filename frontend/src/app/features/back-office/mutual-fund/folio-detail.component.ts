import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MutualFundService } from './mutual-fund.service';
import { MfTransaction, SystematicMandate } from './mutual-fund-data.mock';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';

@Component({
  selector: 'app-mf-folio-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ExportButtonComponent],
  templateUrl: './folio-detail.component.html',
})
export class FolioDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly mfService = inject(MutualFundService);

  readonly folioId = this.route.snapshot.paramMap.get('id')!;
  readonly folio = computed(() => this.mfService.getFolio(this.folioId));
  readonly transactions = computed(() => this.mfService.folioTransactions(this.folioId));
  readonly mandates = computed(() => this.mfService.folioMandates(this.folioId));
  readonly currentValue = computed(() => {
    const f = this.folio();
    return f ? f.units * f.currentNav : 0;
  });
  readonly gainLoss = computed(() => {
    const f = this.folio();
    return f ? (f.currentNav - f.avgNav) * f.units : 0;
  });

  readonly mandateExportHeaders = ['Mandate ID', 'Type', 'Scheme', 'Amount', 'Frequency', 'Start Date', 'Next Due', 'End Date', 'Status'];
  readonly mandateExportRows = computed(() =>
    this.mandates().map((m) => [m.id, m.type, m.scheme, m.amount, m.frequency, m.startDate, m.nextDueDate, m.endDate ?? '', m.status]),
  );

  readonly txnExportHeaders = ['Date', 'Type', 'Amount', 'Units', 'NAV', 'Status', 'Source'];
  readonly txnExportRows = computed(() =>
    this.transactions().map((t) => [t.date, t.transactionType, t.amount, t.units, t.nav, t.status, t.source]),
  );

  removeMandate(m: SystematicMandate): void {
    if (!confirmDelete(`the ${m.type} mandate ${m.id}`)) return;
    this.mfService.deleteMandate(m.id);
  }

  removeTransaction(t: MfTransaction): void {
    if (!confirmDelete(`the ${t.transactionType} transaction of ₹${t.amount.toLocaleString('en-IN')} on ${t.date}`)) return;
    this.mfService.deleteTransaction(t.id);
  }

  goBack(): void {
    this.router.navigate(['/back-office/customer-investments/mutual-fund/folio']);
  }
}
