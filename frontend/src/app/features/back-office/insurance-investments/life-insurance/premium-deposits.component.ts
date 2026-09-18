import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifeInsuranceService } from '../life-insurance.service';
import { PremiumDeposit } from '../insurance-investments-data.mock';

@Component({
  selector: 'app-premium-deposits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-deposits.component.html',
})
export class PremiumDepositsComponent {
  readonly svc = inject(LifeInsuranceService);

  readonly paymentModes: PremiumDeposit['paymentMode'][] = ['Cheque', 'NEFT', 'Cash', 'UPI', 'Auto-Debit'];

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
}
