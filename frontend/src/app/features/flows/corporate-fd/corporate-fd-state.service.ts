import { Injectable, signal } from '@angular/core';

export interface CorporateFdOffer {
  id: string;
  issuer: string;
  rating: string;
  interestRate: number;
  tenureMonths: number;
  minInvestment: number;
  payoutOptions: string[];
}

export const CORPORATE_FD_OFFERS: CorporateFdOffer[] = [
  { id: 'FD-01', issuer: 'Alpha Housing Finance', rating: 'AAA', interestRate: 8.25, tenureMonths: 36, minInvestment: 25000, payoutOptions: ['Monthly', 'Quarterly', 'Cumulative'] },
  { id: 'FD-02', issuer: 'Nexus NBFC Ltd', rating: 'AA+', interestRate: 8.75, tenureMonths: 24, minInvestment: 10000, payoutOptions: ['Quarterly', 'Cumulative'] },
  { id: 'FD-03', issuer: 'WealthNexus Capital', rating: 'AAA', interestRate: 7.9, tenureMonths: 12, minInvestment: 5000, payoutOptions: ['Cumulative'] },
  { id: 'FD-04', issuer: 'Orion Infra Finance', rating: 'AA', interestRate: 9.1, tenureMonths: 60, minInvestment: 50000, payoutOptions: ['Annual', 'Cumulative'] },
];

@Injectable({ providedIn: 'root' })
export class CorporateFdStateService {
  readonly selectedOfferId = signal<string | null>(null);
  readonly amount = signal(50000);
  readonly payoutOption = signal('Cumulative');
  readonly nomineeName = signal('');
  readonly lastApplicationId = signal<string | null>(null);

  reset(): void {
    this.selectedOfferId.set(null);
    this.amount.set(50000);
    this.payoutOption.set('Cumulative');
    this.nomineeName.set('');
  }
}
