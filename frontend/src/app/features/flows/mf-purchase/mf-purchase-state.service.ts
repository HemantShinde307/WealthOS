import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MfPurchaseStateService {
  readonly selectedSchemeId = signal<string | null>(null);
  readonly amount = signal<number>(25000);
  readonly paymentMode = signal<'Net Banking' | 'UPI' | 'NEFT/RTGS'>('UPI');
  readonly lastOrderId = signal<string | null>(null);

  reset(): void {
    this.selectedSchemeId.set(null);
    this.amount.set(25000);
    this.paymentMode.set('UPI');
  }
}
