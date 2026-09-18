import { Injectable, signal } from '@angular/core';

export interface MockBankAccount {
  id: string;
  bankName: string;
  accountMasked: string;
}

export const MOCK_BANK_ACCOUNTS: MockBankAccount[] = [
  { id: 'BANK-01', bankName: 'HDFC Bank Ltd.', accountMasked: 'XXXX-XXXX-4589' },
  { id: 'BANK-02', bankName: 'ICICI Bank', accountMasked: 'XXXX-XXXX-9021' },
  { id: 'BANK-03', bankName: 'State Bank of India', accountMasked: 'XXXX-XXXX-1187' },
];

export type RedeemBy = 'Amount' | 'Units';

@Injectable({ providedIn: 'root' })
export class RedemptionStateService {
  readonly selectedSchemeId = signal<string | null>(null);
  readonly redeemBy = signal<RedeemBy>('Amount');
  readonly amount = signal<number>(0);
  readonly units = signal<number>(0);
  readonly fullRedemption = signal(false);
  readonly bankAccountId = signal<string | null>('BANK-01');
  readonly lastTxnId = signal<string | null>(null);

  reset(): void {
    this.selectedSchemeId.set(null);
    this.redeemBy.set('Amount');
    this.amount.set(0);
    this.units.set(0);
    this.fullRedemption.set(false);
    this.bankAccountId.set('BANK-01');
  }
}
