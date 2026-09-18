import { Injectable, signal } from '@angular/core';

export interface GoldActionResult {
  type: 'Buy' | 'Sell' | 'Delivery';
  grams: number;
  amount: number;
  transactionId?: string;
}

@Injectable({ providedIn: 'root' })
export class DigitalGoldStateService {
  readonly currentRate = signal(7842);
  readonly holdingsGrams = signal(24.685);
  readonly lastResult = signal<GoldActionResult | null>(null);

  recordBuy(grams: number, amount: number, transactionId: string): void {
    this.holdingsGrams.update((g) => Number((g + grams).toFixed(4)));
    this.lastResult.set({ type: 'Buy', grams, amount, transactionId });
  }

  recordSell(grams: number, amount: number, transactionId: string): void {
    this.holdingsGrams.update((g) => Number((g - grams).toFixed(4)));
    this.lastResult.set({ type: 'Sell', grams, amount, transactionId });
  }

  recordDelivery(grams: number, charges: number): void {
    this.holdingsGrams.update((g) => Number((g - grams).toFixed(4)));
    this.lastResult.set({ type: 'Delivery', grams, amount: charges });
  }
}
