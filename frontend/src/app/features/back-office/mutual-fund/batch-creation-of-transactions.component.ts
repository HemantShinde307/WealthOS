import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MutualFundService } from './mutual-fund.service';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';

type BatchTransactionType = 'Purchase' | 'Additional Purchase' | 'Redemption';

@Component({
  selector: 'app-mf-batch-creation-of-transactions',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './batch-creation-of-transactions.component.html',
})
export class BatchCreationOfTransactionsComponent {
  readonly mfService = inject(MutualFundService);

  readonly amcFilter = signal('All');
  readonly search = signal('');
  readonly transactionType = signal<BatchTransactionType>('Additional Purchase');
  readonly amount = signal<number | null>(null);
  readonly date = signal(new Date().toISOString().slice(0, 10));
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly result = signal<number | null>(null);

  readonly amcs = computed(() => Array.from(new Set(this.mfService.folios().map((f) => f.amc))).sort());

  readonly filtered = computed(() => {
    const amc = this.amcFilter();
    const q = this.search().trim().toLowerCase();
    return this.mfService.folios().filter((f) => {
      if (f.status !== 'Active') return false;
      if (amc !== 'All' && f.amc !== amc) return false;
      if (!q) return true;
      return f.folioNumber.toLowerCase().includes(q) || f.customerName.toLowerCase().includes(q) || f.scheme.toLowerCase().includes(q);
    });
  });

  readonly exportHeaders = ['Folio', 'AMC', 'Scheme', 'Customer', 'Units Held'];
  readonly exportRows = computed(() => this.filtered().map((f) => [f.folioNumber, f.amc, f.scheme, f.customerName, f.units]));

  toggle(id: string): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    this.result.set(null);
  }

  toggleAll(): void {
    const allIds = this.filtered().map((f) => f.id);
    const allSelected = allIds.every((id) => this.selectedIds().has(id));
    this.selectedIds.set(allSelected ? new Set() : new Set(allIds));
  }

  createBatch(): void {
    const amt = this.amount();
    if (!this.selectedIds().size || !amt || amt <= 0) return;
    const created = this.mfService.batchCreateTransactions([...this.selectedIds()], this.transactionType(), amt, this.date());
    this.result.set(created);
    this.selectedIds.set(new Set());
  }
}
