import { Injectable, signal } from '@angular/core';

export interface MockBankAccount {
  id: string;
  bankName: string;
  accountMasked: string;
  mandateLimit: number;
}

export const MOCK_BANK_ACCOUNTS: MockBankAccount[] = [
  { id: 'BANK-01', bankName: 'HDFC Bank Ltd.', accountMasked: 'XXXX-XXXX-4589', mandateLimit: 100000 },
  { id: 'BANK-02', bankName: 'ICICI Bank', accountMasked: 'XXXX-XXXX-9021', mandateLimit: 50000 },
  { id: 'BANK-03', bankName: 'State Bank of India', accountMasked: 'XXXX-XXXX-1187', mandateLimit: 25000 },
];

@Injectable({ providedIn: 'root' })
export class SipSetupStateService {
  readonly selectedSchemeId = signal<string | null>(null);
  readonly amount = signal<number>(5000);
  readonly sipDate = signal<number>(5);
  readonly bankAccountId = signal<string | null>(null);
  readonly mandateAuthorized = signal(false);
  readonly lastSipId = signal<string | null>(null);

  reset(): void {
    this.selectedSchemeId.set(null);
    this.amount.set(5000);
    this.sipDate.set(5);
    this.bankAccountId.set(null);
    this.mandateAuthorized.set(false);
  }
}
