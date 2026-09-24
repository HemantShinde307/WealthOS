import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { BANKS, FdRdEntry } from '../insurance-investments-data.mock';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

@Component({
  selector: 'app-other-investments-fds-rds',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './fds-rds.component.html',
})
export class FdsRdsComponent {
  readonly svc = inject(OtherInvestmentsService);

  readonly exportHeaders = ['Customer', 'Bank', 'Type', 'Principal / Installment', 'Tenure (months)', 'Interest Rate (%)', 'Start Date', 'Maturity Date'];
  readonly exportRows = computed(() =>
    this.svc.fdsRds().map((f) => [f.customerName, f.bank, f.type, f.principalOrInstallment, f.tenureMonths, f.interestRate, f.startDate, f.maturityDate]),
  );
  readonly banks = BANKS;
  readonly types: FdRdEntry['type'][] = ['FD', 'RD'];

  readonly editingId = signal<string | null>(null);
  readonly formVisible = signal(false);
  readonly customerName = signal('');
  readonly bank = signal(this.banks[0]);
  readonly type = signal<FdRdEntry['type']>('FD');
  readonly principalOrInstallment = signal<number | null>(null);
  readonly tenureMonths = signal<number | null>(null);
  readonly interestRate = signal<number | null>(null);
  readonly startDate = signal(new Date().toISOString().slice(0, 10));
  readonly maturityDate = signal(new Date().toISOString().slice(0, 10));
  readonly error = signal<string | null>(null);

  openNew(): void {
    this.editingId.set(null);
    this.customerName.set('');
    this.bank.set(this.banks[0]);
    this.type.set('FD');
    this.principalOrInstallment.set(null);
    this.tenureMonths.set(null);
    this.interestRate.set(null);
    this.startDate.set(new Date().toISOString().slice(0, 10));
    this.maturityDate.set(new Date().toISOString().slice(0, 10));
    this.error.set(null);
    this.formVisible.set(true);
  }

  edit(f: FdRdEntry): void {
    this.editingId.set(f.id);
    this.customerName.set(f.customerName);
    this.bank.set(f.bank);
    this.type.set(f.type);
    this.principalOrInstallment.set(f.principalOrInstallment);
    this.tenureMonths.set(f.tenureMonths);
    this.interestRate.set(f.interestRate);
    this.startDate.set(f.startDate);
    this.maturityDate.set(f.maturityDate);
    this.error.set(null);
    this.formVisible.set(true);
  }

  cancel(): void {
    this.formVisible.set(false);
  }

  save(): void {
    if (!this.customerName().trim() || !this.principalOrInstallment() || !this.tenureMonths()) {
      this.error.set('Customer, amount and tenure are required.');
      return;
    }
    const payload = {
      customerName: this.customerName().trim(),
      bank: this.bank(),
      type: this.type(),
      principalOrInstallment: this.principalOrInstallment()!,
      tenureMonths: this.tenureMonths()!,
      interestRate: this.interestRate() ?? 0,
      startDate: this.startDate(),
      maturityDate: this.maturityDate(),
    };
    const id = this.editingId();
    if (id) this.svc.updateFdRd(id, payload);
    else this.svc.addFdRd(payload);
    this.formVisible.set(false);
  }

  remove(f: FdRdEntry): void {
    if (!confirmDelete(`the ${f.bank} ${f.type} for ${f.customerName}`)) return;
    this.svc.deleteFdRd(f.id);
  }
}
