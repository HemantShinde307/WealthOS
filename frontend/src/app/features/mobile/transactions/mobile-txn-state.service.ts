import { Injectable, signal } from '@angular/core';

// Local state for the mobile investor "Invest" transaction flow
// (payment-selection -> order-review -> transaction-success).
// Kept local to the mobile feature module so it doesn't touch shared/core state.
@Injectable({ providedIn: 'root' })
export class MobileTxnStateService {
  readonly selectedSchemeId = signal<string>('SCH-001');
  readonly amount = signal<number>(50000);
  readonly paymentMethod = signal<string | null>(null);
  readonly purposeLabel = signal<string | null>(null);
  readonly lastOrderId = signal<string | null>(null);

  startInvestment(opts?: { schemeId?: string; amount?: number; purposeLabel?: string | null }): void {
    if (opts?.schemeId) this.selectedSchemeId.set(opts.schemeId);
    if (opts?.amount) this.amount.set(opts.amount);
    this.purposeLabel.set(opts?.purposeLabel ?? null);
    this.paymentMethod.set(null);
  }

  reset(): void {
    this.selectedSchemeId.set('SCH-001');
    this.amount.set(50000);
    this.paymentMethod.set(null);
    this.purposeLabel.set(null);
    this.lastOrderId.set(null);
  }
}
