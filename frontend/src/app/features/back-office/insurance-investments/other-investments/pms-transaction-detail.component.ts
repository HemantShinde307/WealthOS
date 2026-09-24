import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { PMS_STRATEGIES, PmsTransaction } from '../insurance-investments-data.mock';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

@Component({
  selector: 'app-other-investments-pms-transaction-detail',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './pms-transaction-detail.component.html',
})
export class PmsTransactionDetailComponent {
  readonly svc = inject(OtherInvestmentsService);
  readonly strategies = PMS_STRATEGIES;
  readonly transactionTypes: PmsTransaction['transactionType'][] = ['Buy', 'Sell', 'Dividend', 'Fee Debit'];

  readonly exportHeaders = ['Client', 'Strategy', 'Type', 'Security', 'Quantity', 'Amount', 'Date'];
  readonly exportRows = computed(() =>
    this.svc.pmsTransactions().map((t) => [t.clientName, t.strategy, t.transactionType, t.securityName, t.quantity, t.amount, t.date]),
  );

  readonly editingId = signal<string | null>(null);
  readonly clientName = signal('');
  readonly strategy = signal(this.strategies[0]);
  readonly transactionType = signal<PmsTransaction['transactionType']>('Buy');
  readonly securityName = signal('');
  readonly quantity = signal<number | null>(null);
  readonly amount = signal<number | null>(null);
  readonly date = signal(new Date().toISOString().slice(0, 10));
  readonly error = signal<string | null>(null);
  readonly saved = signal(false);

  record(): void {
    this.error.set(null);
    this.saved.set(false);
    if (!this.clientName().trim() || !this.amount()) {
      this.error.set('Client and amount are required.');
      return;
    }
    const payload = {
      clientName: this.clientName().trim(),
      strategy: this.strategy(),
      transactionType: this.transactionType(),
      securityName: this.securityName().trim() || '—',
      quantity: this.quantity() ?? 0,
      amount: this.amount()!,
      date: this.date(),
    };
    const id = this.editingId();
    if (id) this.svc.updatePmsTransaction(id, payload);
    else this.svc.addPmsTransaction(payload);
    this.editingId.set(null);
    this.saved.set(true);
    this.securityName.set('');
    this.quantity.set(null);
    this.amount.set(null);
  }

  edit(t: PmsTransaction): void {
    this.editingId.set(t.id);
    this.clientName.set(t.clientName);
    this.strategy.set(t.strategy);
    this.transactionType.set(t.transactionType);
    this.securityName.set(t.securityName === '—' ? '' : t.securityName);
    this.quantity.set(t.quantity || null);
    this.amount.set(t.amount);
    this.date.set(t.date);
    this.error.set(null);
    this.saved.set(false);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.securityName.set('');
    this.quantity.set(null);
    this.amount.set(null);
    this.error.set(null);
  }

  remove(t: PmsTransaction): void {
    if (!confirmDelete(`the ${t.transactionType} transaction for ${t.clientName}`)) return;
    if (this.editingId() === t.id) this.cancelEdit();
    this.svc.deletePmsTransaction(t.id);
  }
}
