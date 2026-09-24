import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { PostalInvestment } from '../insurance-investments-data.mock';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

@Component({
  selector: 'app-other-investments-postal',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './postal-investments.component.html',
})
export class PostalInvestmentsComponent {
  readonly svc = inject(OtherInvestmentsService);

  readonly exportHeaders = ['Customer', 'Scheme', 'Certificate Number', 'Amount', 'Interest Rate (%)', 'Investment Date', 'Maturity Date'];
  readonly exportRows = computed(() =>
    this.svc.postal().map((p) => [p.customerName, p.schemeName, p.certificateNumber, p.amount, p.interestRate, p.investmentDate, p.maturityDate]),
  );
  readonly schemes: PostalInvestment['schemeName'][] = ['NSC', 'KVP', 'Sukanya Samriddhi Yojana', 'Post Office Time Deposit', 'Senior Citizen Savings Scheme'];

  readonly editingId = signal<string | null>(null);
  readonly formVisible = signal(false);
  readonly customerName = signal('');
  readonly schemeName = signal<PostalInvestment['schemeName']>('NSC');
  readonly certificateNumber = signal('');
  readonly amount = signal<number | null>(null);
  readonly investmentDate = signal(new Date().toISOString().slice(0, 10));
  readonly maturityDate = signal(new Date().toISOString().slice(0, 10));
  readonly interestRate = signal<number | null>(null);
  readonly error = signal<string | null>(null);

  openNew(): void {
    this.editingId.set(null);
    this.customerName.set('');
    this.schemeName.set('NSC');
    this.certificateNumber.set('');
    this.amount.set(null);
    this.investmentDate.set(new Date().toISOString().slice(0, 10));
    this.maturityDate.set(new Date().toISOString().slice(0, 10));
    this.interestRate.set(null);
    this.error.set(null);
    this.formVisible.set(true);
  }

  edit(p: PostalInvestment): void {
    this.editingId.set(p.id);
    this.customerName.set(p.customerName);
    this.schemeName.set(p.schemeName);
    this.certificateNumber.set(p.certificateNumber);
    this.amount.set(p.amount);
    this.investmentDate.set(p.investmentDate);
    this.maturityDate.set(p.maturityDate);
    this.interestRate.set(p.interestRate);
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
      certificateNumber: this.certificateNumber().trim() || '—',
      amount: this.amount()!,
      investmentDate: this.investmentDate(),
      maturityDate: this.maturityDate(),
      interestRate: this.interestRate() ?? 0,
    };
    const id = this.editingId();
    if (id) this.svc.updatePostal(id, payload);
    else this.svc.addPostal(payload);
    this.formVisible.set(false);
  }

  remove(p: PostalInvestment): void {
    if (!confirmDelete(`the ${p.schemeName} investment for ${p.customerName}`)) return;
    this.svc.deletePostal(p.id);
  }
}
