import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { IncomeSchemeEntry } from '../insurance-investments-data.mock';

@Component({
  selector: 'app-other-investments-income-schemes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-schemes.component.html',
})
export class IncomeSchemesComponent {
  readonly svc = inject(OtherInvestmentsService);
  readonly schemes: IncomeSchemeEntry['schemeName'][] = ['Post Office MIS', 'Senior Citizen Savings Scheme', 'Pradhan Mantri Vaya Vandana Yojana', 'RBI Floating Rate Bonds'];

  readonly editingId = signal<string | null>(null);
  readonly formVisible = signal(false);
  readonly customerName = signal('');
  readonly schemeName = signal<IncomeSchemeEntry['schemeName']>('Post Office MIS');
  readonly amount = signal<number | null>(null);
  readonly monthlyIncome = signal<number | null>(null);
  readonly startDate = signal(new Date().toISOString().slice(0, 10));
  readonly maturityDate = signal(new Date().toISOString().slice(0, 10));
  readonly error = signal<string | null>(null);

  openNew(): void {
    this.editingId.set(null);
    this.customerName.set('');
    this.schemeName.set('Post Office MIS');
    this.amount.set(null);
    this.monthlyIncome.set(null);
    this.startDate.set(new Date().toISOString().slice(0, 10));
    this.maturityDate.set(new Date().toISOString().slice(0, 10));
    this.error.set(null);
    this.formVisible.set(true);
  }

  edit(i: IncomeSchemeEntry): void {
    this.editingId.set(i.id);
    this.customerName.set(i.customerName);
    this.schemeName.set(i.schemeName);
    this.amount.set(i.amount);
    this.monthlyIncome.set(i.monthlyIncome);
    this.startDate.set(i.startDate);
    this.maturityDate.set(i.maturityDate);
    this.error.set(null);
    this.formVisible.set(true);
  }

  cancel(): void {
    this.formVisible.set(false);
  }

  save(): void {
    if (!this.customerName().trim() || !this.amount()) {
      this.error.set('Customer name and amount are required.');
      return;
    }
    const payload = {
      customerName: this.customerName().trim(),
      schemeName: this.schemeName(),
      amount: this.amount()!,
      monthlyIncome: this.monthlyIncome() ?? 0,
      startDate: this.startDate(),
      maturityDate: this.maturityDate(),
    };
    const id = this.editingId();
    if (id) this.svc.updateIncomeScheme(id, payload);
    else this.svc.addIncomeScheme(payload);
    this.formVisible.set(false);
  }

  remove(id: string): void {
    this.svc.deleteIncomeScheme(id);
  }
}
