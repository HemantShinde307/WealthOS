import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { CompanyDeposit } from '../insurance-investments-data.mock';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

@Component({
  selector: 'app-other-investments-company-deposits',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './company-deposits.component.html',
})
export class CompanyDepositsComponent {
  readonly svc = inject(OtherInvestmentsService);

  readonly exportHeaders = ['Customer', 'Company', 'Amount', 'Interest Rate (%)', 'Tenure (months)', 'Start Date', 'Maturity Date'];
  readonly exportRows = computed(() =>
    this.svc.companyDeposits().map((c) => [c.customerName, c.companyName, c.amount, c.interestRate, c.tenureMonths, c.startDate, c.maturityDate]),
  );

  readonly editingId = signal<string | null>(null);
  readonly formVisible = signal(false);
  readonly customerName = signal('');
  readonly companyName = signal('');
  readonly amount = signal<number | null>(null);
  readonly interestRate = signal<number | null>(null);
  readonly tenureMonths = signal<number | null>(null);
  readonly startDate = signal(new Date().toISOString().slice(0, 10));
  readonly maturityDate = signal(new Date().toISOString().slice(0, 10));
  readonly error = signal<string | null>(null);

  openNew(): void {
    this.editingId.set(null);
    this.customerName.set('');
    this.companyName.set('');
    this.amount.set(null);
    this.interestRate.set(null);
    this.tenureMonths.set(null);
    this.startDate.set(new Date().toISOString().slice(0, 10));
    this.maturityDate.set(new Date().toISOString().slice(0, 10));
    this.error.set(null);
    this.formVisible.set(true);
  }

  edit(c: CompanyDeposit): void {
    this.editingId.set(c.id);
    this.customerName.set(c.customerName);
    this.companyName.set(c.companyName);
    this.amount.set(c.amount);
    this.interestRate.set(c.interestRate);
    this.tenureMonths.set(c.tenureMonths);
    this.startDate.set(c.startDate);
    this.maturityDate.set(c.maturityDate);
    this.error.set(null);
    this.formVisible.set(true);
  }

  cancel(): void {
    this.formVisible.set(false);
  }

  save(): void {
    if (!this.customerName().trim() || !this.companyName().trim() || !this.amount()) {
      this.error.set('Customer, company name and amount are required.');
      return;
    }
    const payload = {
      customerName: this.customerName().trim(),
      companyName: this.companyName().trim(),
      amount: this.amount()!,
      interestRate: this.interestRate() ?? 0,
      tenureMonths: this.tenureMonths() ?? 12,
      startDate: this.startDate(),
      maturityDate: this.maturityDate(),
    };
    const id = this.editingId();
    if (id) this.svc.updateCompanyDeposit(id, payload);
    else this.svc.addCompanyDeposit(payload);
    this.formVisible.set(false);
  }

  remove(c: CompanyDeposit): void {
    if (!confirmDelete(`the ${c.companyName} deposit for ${c.customerName}`)) return;
    this.svc.deleteCompanyDeposit(c.id);
  }
}
