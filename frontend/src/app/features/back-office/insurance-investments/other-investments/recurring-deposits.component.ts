import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { BANKS, RecurringDepositEntry } from '../insurance-investments-data.mock';

@Component({
  selector: 'app-other-investments-recurring-deposits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recurring-deposits.component.html',
})
export class RecurringDepositsComponent {
  readonly svc = inject(OtherInvestmentsService);
  readonly banks = BANKS;

  readonly editingId = signal<string | null>(null);
  readonly formVisible = signal(false);
  readonly customerName = signal('');
  readonly bank = signal(this.banks[0]);
  readonly installmentAmount = signal<number | null>(null);
  readonly tenureMonths = signal<number | null>(null);
  readonly interestRate = signal<number | null>(null);
  readonly startDate = signal(new Date().toISOString().slice(0, 10));
  readonly maturityDate = signal(new Date().toISOString().slice(0, 10));
  readonly error = signal<string | null>(null);

  openNew(): void {
    this.editingId.set(null);
    this.customerName.set('');
    this.bank.set(this.banks[0]);
    this.installmentAmount.set(null);
    this.tenureMonths.set(null);
    this.interestRate.set(null);
    this.startDate.set(new Date().toISOString().slice(0, 10));
    this.maturityDate.set(new Date().toISOString().slice(0, 10));
    this.error.set(null);
    this.formVisible.set(true);
  }

  edit(r: RecurringDepositEntry): void {
    this.editingId.set(r.id);
    this.customerName.set(r.customerName);
    this.bank.set(r.bank);
    this.installmentAmount.set(r.installmentAmount);
    this.tenureMonths.set(r.tenureMonths);
    this.interestRate.set(r.interestRate);
    this.startDate.set(r.startDate);
    this.maturityDate.set(r.maturityDate);
    this.error.set(null);
    this.formVisible.set(true);
  }

  cancel(): void {
    this.formVisible.set(false);
  }

  save(): void {
    if (!this.customerName().trim() || !this.installmentAmount() || !this.tenureMonths()) {
      this.error.set('Customer, installment amount and tenure are required.');
      return;
    }
    const payload = {
      customerName: this.customerName().trim(),
      bank: this.bank(),
      installmentAmount: this.installmentAmount()!,
      tenureMonths: this.tenureMonths()!,
      interestRate: this.interestRate() ?? 0,
      startDate: this.startDate(),
      maturityDate: this.maturityDate(),
    };
    const id = this.editingId();
    if (id) this.svc.updateRecurringDeposit(id, payload);
    else this.svc.addRecurringDeposit(payload);
    this.formVisible.set(false);
  }

  remove(id: string): void {
    this.svc.deleteRecurringDeposit(id);
  }
}
