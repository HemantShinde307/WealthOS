import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifeInsuranceService } from '../life-insurance.service';
import { PremiumDeposit } from '../insurance-investments-data.mock';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

@Component({
  selector: 'app-premium-deposits',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './premium-deposits.component.html',
})
export class PremiumDepositsComponent {
  readonly svc = inject(LifeInsuranceService);

  readonly paymentModes: PremiumDeposit['paymentMode'][] = ['Cheque', 'NEFT', 'Cash', 'UPI', 'Auto-Debit'];

  readonly exportHeaders = ['Receipt No.', 'Policy No.', 'Policyholder', 'Amount', 'Payment Date', 'Payment Mode'];
  readonly exportRows = computed(() =>
    this.svc.premiumDeposits().map((d) => [d.receiptNumber, d.policyNumber, d.policyholderName, d.amount, d.paymentDate, d.paymentMode]),
  );

  readonly editingId = signal<string | null>(null);
  readonly policyId = signal('');
  readonly amount = signal<number | null>(null);
  readonly paymentDate = signal(new Date().toISOString().slice(0, 10));
  readonly paymentMode = signal<PremiumDeposit['paymentMode']>('NEFT');
  readonly error = signal<string | null>(null);
  readonly savedReceipt = signal<string | null>(null);

  record(): void {
    this.error.set(null);
    const policy = this.svc.getPolicy(this.policyId());
    if (!policy) {
      this.error.set('Please select a policy.');
      return;
    }
    if (!this.amount() || this.amount()! <= 0) {
      this.error.set('Enter a valid deposit amount.');
      return;
    }
    const editId = this.editingId();
    if (editId) {
      this.svc.updatePremiumDeposit(editId, {
        policyId: policy.id,
        policyNumber: policy.policyNumber,
        policyholderName: policy.policyholderName,
        amount: this.amount()!,
        paymentDate: this.paymentDate(),
        paymentMode: this.paymentMode(),
      });
      this.savedReceipt.set(this.svc.premiumDeposits().find((d) => d.id === editId)?.receiptNumber ?? null);
      this.resetForm();
      return;
    }
    const entry = this.svc.addPremiumDeposit({
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      policyholderName: policy.policyholderName,
      amount: this.amount()!,
      paymentDate: this.paymentDate(),
      paymentMode: this.paymentMode(),
    });
    this.savedReceipt.set(entry.receiptNumber);
    this.amount.set(null);
  }

  edit(d: PremiumDeposit): void {
    this.editingId.set(d.id);
    this.policyId.set(d.policyId);
    this.amount.set(d.amount);
    this.paymentDate.set(d.paymentDate);
    this.paymentMode.set(d.paymentMode);
    this.error.set(null);
    this.savedReceipt.set(null);
  }

  cancelEdit(): void {
    this.resetForm();
  }

  remove(d: PremiumDeposit): void {
    if (!confirmDelete(`deposit ${d.receiptNumber} for ${d.policyholderName}`)) return;
    this.svc.deletePremiumDeposit(d.id);
    if (this.editingId() === d.id) this.resetForm();
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.policyId.set('');
    this.amount.set(null);
  }
}
