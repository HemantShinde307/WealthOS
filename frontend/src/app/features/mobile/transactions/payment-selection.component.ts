import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { SchemeService } from '../../../core/services/scheme.service';
import { MobileTxnStateService } from './mobile-txn-state.service';

interface PaymentOption {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
}

@Component({
  selector: 'app-payment-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-selection.component.html',
})
export class PaymentSelectionComponent {
  private readonly schemeService = inject(SchemeService);
  readonly state = inject(MobileTxnStateService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly schemes = this.schemeService.schemes();
  readonly amountInput = signal(this.state.amount());

  readonly upiOptions: PaymentOption[] = [
    { id: 'Google Pay', label: 'Google Pay', subtitle: 'Pay via GPay app', icon: 'account_balance_wallet' },
    { id: 'PhonePe', label: 'PhonePe', subtitle: 'Pay via PhonePe app', icon: 'smartphone' },
  ];

  readonly bankOptions: PaymentOption[] = [
    { id: 'HDFC Net Banking', label: 'HDFC', subtitle: 'Net Banking', icon: 'account_balance' },
    { id: 'ICICI Net Banking', label: 'ICICI', subtitle: 'Net Banking', icon: 'account_balance' },
    { id: 'SBI Net Banking', label: 'SBI', subtitle: 'Net Banking', icon: 'account_balance' },
  ];

  goBack(): void {
    this.location.back();
  }

  onSchemeChange(schemeId: string): void {
    this.state.selectedSchemeId.set(schemeId);
  }

  onAmountChange(value: string): void {
    const parsed = Number(value);
    this.amountInput.set(isNaN(parsed) ? 0 : parsed);
    this.state.amount.set(isNaN(parsed) ? 0 : parsed);
  }

  choosePayment(method: string): void {
    this.state.paymentMethod.set(method);
    this.router.navigate(['/mobile/order-review']);
  }
}
