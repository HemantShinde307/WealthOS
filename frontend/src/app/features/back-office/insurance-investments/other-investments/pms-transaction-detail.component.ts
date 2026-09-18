import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { PMS_STRATEGIES, PmsTransaction } from '../insurance-investments-data.mock';

@Component({
  selector: 'app-other-investments-pms-transaction-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pms-transaction-detail.component.html',
})
export class PmsTransactionDetailComponent {
  readonly svc = inject(OtherInvestmentsService);
  readonly strategies = PMS_STRATEGIES;
  readonly transactionTypes: PmsTransaction['transactionType'][] = ['Buy', 'Sell', 'Dividend', 'Fee Debit'];

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
    this.svc.addPmsTransaction({
      clientName: this.clientName().trim(),
      strategy: this.strategy(),
      transactionType: this.transactionType(),
      securityName: this.securityName().trim() || '—',
      quantity: this.quantity() ?? 0,
      amount: this.amount()!,
      date: this.date(),
    });
    this.saved.set(true);
    this.securityName.set('');
    this.quantity.set(null);
    this.amount.set(null);
  }
}
